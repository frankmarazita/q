import type { Command } from "commander";
import type { CommandContext } from "./types";
import { parseInput } from "../input/parser";
import { chats } from "../../services/chats";
import { processChat, addUserMessage } from "../../services/chat";
import type { StreamEvent } from "../../lib/completions";
import {
  displayChatHistory,
  setupMCPClients,
  processAIResponse,
  runChatLoop,
} from "./shared/chat-utils";

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
    .option("-c, --continue", "continue the last chat")
    .action(async (input, options) => {
      await handleChatCommand(input, options, context);
    });
}

async function handleChatCommand(
  input: string,
  options: any,
  context: CommandContext
): Promise<void> {
  // Handle continue option
  if (options.continue) {
    return await handleContinueChat(input, options, context);
  }

  let prompt =
    "You are a helpful AI assistant in a CLI. Do whatever the user asks.";

  if (options.prompt) {
    prompt = options.prompt;
  } else if (options.promptFile) {
    const promptText = await loadPromptFile(options.promptFile, context);
    if (!promptText) return;
    prompt = promptText;
  } else if (context.config.defaultPrompt) {
    const promptText = await loadPromptFile(
      context.config.defaultPrompt,
      context
    );
    if (promptText) {
      prompt = promptText;
    }
  }

  if (!input) {
    input = await parseInput();
    process.stdout.write("\n");
  }

  const { tools, clients } = await setupMCPClients(options.agent);

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

  await runChatLoop(chatId, tools, clients, options, context, onEvent);
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

async function handleContinueChat(
  input: string,
  options: any,
  context: CommandContext
): Promise<void> {
  // Get the most recent chat
  const chatsListResult = await chats.list();
  if (chatsListResult.status === "error") {
    console.error(chatsListResult.message);
    return;
  }

  const chatsList = chatsListResult.data;
  if (chatsList.length === 0) {
    console.log("No previous chats found. Starting a new chat instead.");
    return await handleChatCommand(
      input,
      { ...options, continue: false },
      context
    );
  }

  // Get the most recent chat (assuming list is ordered by created_at)
  const latestChat = chatsList[chatsList.length - 1];
  if (!latestChat) {
    console.log("No previous chats found. Starting a new chat instead.");
    return await handleChatCommand(
      input,
      { ...options, continue: false },
      context
    );
  }

  const chatId = latestChat.id;

  console.log(
    `Continuing chat: ${latestChat.message} (${latestChat.created_at})`
  );

  // Get the full chat to display history
  const chatResult = await chats.get(chatId);
  if (chatResult.status === "error") {
    console.error(chatResult.message);
    return;
  }

  const chat = chatResult.data;

  displayChatHistory("", chat.data.messages);

  // If no input provided, get it from user and make interactive
  const wasInputProvided = !!input;
  if (!input) {
    input = await parseInput();
    process.stdout.write("\n");
  }

  // Add user message to the chat
  const addMessageResult = await addUserMessage(chatId, input);
  if (addMessageResult.status === "error") {
    console.error(addMessageResult.message);
    return;
  }

  // Set up tools if agent mode is enabled
  const { tools, clients } = await setupMCPClients(options.agent);

  // Process the continued chat
  await processAIResponse(chatId, tools, clients, onEvent);

  // Continue with interactive mode when no input was initially provided
  if (!wasInputProvided) {
    // Make continued chats interactive by default when no input provided
    options.interactive = true;
  }
  await runChatLoop(chatId, tools, clients, options, context, onEvent);
}
