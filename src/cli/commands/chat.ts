import type { Command } from "commander";
import type { CommandContext } from "./types";
import { parseInput } from "../input/parser";
import { chats } from "../../services/chats";
import { processCompletions } from "../../utils";
import { loadMCPClients, type MCPClientData } from "../mcp/client";

export function register(program: Command, context: CommandContext): void {
  program
    .command("chat")
    .alias("c")
    .description("start a new chat")
    .argument("[input]", "input to the chat")
    .option("-A, --agent", "use agent mode")
    .option("-p, --prompt <prompt>", "the prompt to use for the chat")
    .option(
      "-f, --prompt-file <file>",
      "the prompt file to use for the chat from the prompt directory"
    )
    .option("-i, --interactive", "use interactive mode")
    .action(async (input, options) => {
      await handleChatCommand(input, options, context);
    });
}

async function handleChatCommand(
  input: string,
  options: any,
  context: CommandContext
): Promise<void> {
  let prompt =
    "You are a helpful AI assistant in a CLI. Do whatever the user asks.";

  if (options.prompt) {
    prompt = options.prompt;
  } else if (options.promptFile) {
    const promptText = await loadPromptFile(options.promptFile, context);
    if (!promptText) return;
    prompt = promptText;
  }

  if (!input) {
    input = await parseInput();
    process.stdout.write("\n");
  }

  const chatResult = await chats.create({
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: input,
      },
    ],
  });

  if (chatResult.status === "error") {
    console.error(chatResult.message);
    return;
  }

  const chatId = chatResult.data;
  const tools: { function: any; type: string }[] = [];
  const clients: Record<string, MCPClientData> | undefined = options.agent
    ? await loadMCPClients("0.0.1")
    : undefined;

  if (clients) {
    const clientsTools = await Promise.all(
      Object.entries(clients).map(async ([name, { client, tools }]) => {
        const clientTools = await client.listTools();
        return {
          client,
          tools: clientTools,
        };
      })
    );

    for (const { tools: clientTools } of clientsTools) {
      for (const tool of clientTools.tools) {
        tools.push({
          function: {
            id: tool.id,
            name: tool.name,
            description: tool.description,
            parameters: {
              ...tool.inputSchema,
            },
          },
          type: "function",
        });
      }
    }
  }

  await runChatLoop(chatId, tools, clients, options, context);
}

async function loadPromptFile(
  promptFile: string,
  context: CommandContext
): Promise<string | null> {
  if (!context.config.promptDirectory) {
    console.error(
      "No prompt directory configured. Please set it in the config."
    );
    return null;
  }

  const file = Bun.file(`${context.config.promptDirectory}/${promptFile}.md`);

  if (!(await file.exists())) {
    console.error(`Prompt file "${promptFile}" not found.`);
    return null;
  }

  return await file.text();
}

async function runChatLoop(
  chatId: string,
  tools: { function: any; type: string }[],
  clients: Record<string, MCPClientData> | undefined,
  options: any,
  context: CommandContext
): Promise<void> {
  let input: string;

  while (true) {
    const chatResult = await chats.get(chatId);
    if (chatResult.status === "error") {
      console.error(chatResult.message);
      return;
    }
    const chat = chatResult.data;

    await context.api.refreshCopilotToken();

    const completions = await context.api.completions("user", {
      messages: chat.data.messages,
      model: context.config.model ? context.config.model.id : undefined,
      temperature: 0.1,
      top_p: 1,
      max_tokens: context.config.model?.capabilities.limits.max_output_tokens,
      tools: tools.length > 0 ? tools : undefined,
      n: 1,
      stream: true,
    });

    const reply = await processCompletions(completions);

    if (reply.type === "message") {
      await chats.addMessage(chatId, {
        role: "assistant",
        content: reply.message,
      });
    }

    if (reply.type === "tool-calls") {
      if (clients) {
        await chats.addMessage(chatId, {
          role: "assistant",
          content: "",
          tool_calls: reply.toolCalls.map((toolCall) => ({
            id: toolCall.function.id,
            function: {
              name: toolCall.function.function.name,
              arguments: JSON.stringify(toolCall.arguments, null, 2),
            },
            type: "function",
          })),
        });

        const toolCallResponses: {
          role: "tool";
          content: string;
          tool_call_id: string;
        }[] = [];

        for (const toolCall of reply.toolCalls) {
          console.log(`Calling tool: ${toolCall.function.function.name}`);

          const client = Object.entries(clients).find(([, { tools }]) =>
            tools.includes(toolCall.function.function.name)
          );

          if (!client) {
            console.error(
              `No MCP client found for tool: ${toolCall.function.function.name}`
            );
            continue;
          }

          const res = await client[1].client.callTool({
            name: toolCall.function.function.name,
            arguments: toolCall.arguments,
          });

          toolCallResponses.push({
            role: "tool",
            content: (res.content as any)[0].text,
            tool_call_id: toolCall.function.id,
          });
        }

        for (const toolCallResponse of toolCallResponses) {
          await chats.addMessage(chatId, toolCallResponse);
        }

        continue;
      }
    }

    if (!options.interactive) {
      process.exit(0);
    }

    process.stdout.write("\n");

    input = await parseInput();

    await chats.addMessage(chatId, {
      role: "user",
      content: input,
    });

    process.stdout.write("\n");
  }
}
