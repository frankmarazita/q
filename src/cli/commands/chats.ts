import type { Command } from "commander";
import type { CommandContext } from "./types";
import { chats } from "../../services/chats";
import { displayChatSummaries } from "../rendering/tables";
import { addUserMessage } from "../../services/chat";
import { parseInput } from "../input/parser";
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
    .command("chats")
    .description("list the chats")
    .option("-D, --delete <id>", "delete a chat by ID")
    .action(async (options) => {
      if (options.delete) {
        const result = await chats.delete(options.delete);
        if (result.status === "error") {
          console.error(result.message);
        } else {
          console.log(`Chat ${options.delete} deleted successfully.`);
        }
      } else {
        const result = await chats.list();
        if (result.status === "error") {
          console.error(result.message);
        } else {
          displayChatSummaries(result.data);
        }
      }
    });

  program
    .command("load-chat")
    .description("select and continue a specific chat")
    .argument("<id>", "chat ID to continue")
    .argument("[input]", "input to the chat")
    .option("-A, --agent", "use agent mode")
    .option("-i, --interactive", "use interactive mode")
    .action(async (chatId, input, options) => {
      await handleLoadChat(chatId, input, options, context);
    });
}

async function handleLoadChat(
  chatId: string,
  input: string,
  options: any,
  context: CommandContext
): Promise<void> {
  // Get the specific chat
  const chatResult = await chats.get(chatId);
  if (chatResult.status === "error") {
    console.error(`Chat not found: ${chatResult.message}`);
    return;
  }

  const chat = chatResult.data;

  displayChatHistory(chatId, chat.data.messages);

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
