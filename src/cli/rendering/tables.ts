import type { ChatSummary } from "../../lib/chats/types";

export function displayChatSummaries(summaries: ChatSummary[]): void {
  if (summaries.length === 0) {
    console.log("No chats found.");
    return;
  }

  console.table(summaries, [
    "id",
    "message",
    "created_at",
    "updated_at",
    "chat_length",
  ]);
}

export function displayModels(models: any[]): void {
  console.table(models, [
    "id",
    "name",
    "vendor",
    "version",
    "parallel_tool_calls",
    "streaming",
    "structured_outputs",
    "tool_calls",
    "vision",
  ]);
}

export function renderModelsTable(models: any[]): void {
  console.table(models, [
    "id",
    "name",
    "vendor",
    "version",
    "parallel_tool_calls",
    "streaming",
    "structured_outputs",
    "tool_calls",
    "vision",
  ]);
}

export function displayMessage(message: string): void {
  console.log(message);
}

export function displayError(error: string): void {
  console.error(error);
}
