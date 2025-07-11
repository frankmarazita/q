import type { RawChat, ParsedChat, ChatData, ChatSummary } from "./types";

export function parseRawChat(rawChat: RawChat): ParsedChat {
  return {
    ...rawChat,
    data: JSON.parse(rawChat.data) as ChatData,
  };
}

export function createChatSummary(rawChat: RawChat): ChatSummary {
  const chatData = JSON.parse(rawChat.data) as ChatData;
  const messages = chatData.messages;
  
  // Get preview from first user message (index 1, after system message)
  const previewMessage = messages[1]?.content || messages[0]?.content || "";
  const preview = previewMessage.length > 20 
    ? previewMessage.slice(0, 20) + "..."
    : previewMessage;

  return {
    id: rawChat.id,
    message: preview,
    created_at: rawChat.created_at,
    updated_at: rawChat.updated_at,
    chat_length: messages.length,
  };
}

export function createChatSummaries(rawChats: RawChat[]): ChatSummary[] {
  return rawChats.map(createChatSummary);
}

