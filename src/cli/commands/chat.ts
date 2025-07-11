import type { Command } from "commander";
import type { CommandContext } from "./types";
import { parseInput } from "../input/parser";
import { chats } from "../../services/chats";
import {
  processChat,
  addUserMessage,
  processExistingChat,
} from "../../services/chat";
import { loadMCPClients, type MCPClientData } from "../mcp/client";
import type { StreamEvent } from "../../lib/completions";

const onEvent = (event: StreamEvent) => {
  if (event.type === "content" && event.data) {
    process.stdout.write(event.data);
  }
};

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

  const tools: { function: any; type: string }[] = [];
  const clients: Record<string, MCPClientData> | undefined = options.agent
    ? await loadMCPClients("0.0.1")
    : undefined;

  if (clients) {
    const clientsTools = await Promise.all(
      Object.entries(clients).map(async ([, { client }]) => {
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

  const chatResult = await processChat({ input, prompt, tools }, onEvent);

  if (chatResult.status === "error") {
    console.error(chatResult.message);
    return;
  }

  const { chatId, result: reply } = chatResult.data;

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

      // Process AI response to tool results (this should be the final response)
      await processAIResponse(chatId, tools, clients, onEvent);
    }
  }

  if (!options.interactive) {
    process.exit(0);
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
  _context: CommandContext
): Promise<void> {
  let input: string;

  while (true) {
    if (!options.interactive) {
      process.exit(0);
    }

    process.stdout.write("\n");

    input = await parseInput();

    const addMessageResult = await addUserMessage(chatId, input);
    if (addMessageResult.status === "error") {
      console.error(addMessageResult.message);
      return;
    }

    process.stdout.write("\n");

    // Process AI response (may include tool calls)
    await processAIResponse(chatId, tools, clients, onEvent);
  }
}

async function processAIResponse(
  chatId: string,
  tools: { function: any; type: string }[],
  clients: Record<string, MCPClientData> | undefined,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  const replyResult = await processExistingChat(chatId, tools, onEvent);

  if (replyResult.status === "error") {
    console.error(replyResult.message);
    return;
  }

  const reply = replyResult.data;

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

      // Process AI response to tool results (this should be the final response)
      await processAIResponse(chatId, tools, clients, onEvent);
    }
  }
  // If it's not a tool call, the AI has provided a final response and we're done
}
