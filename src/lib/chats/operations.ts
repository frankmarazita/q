import type { Message, ChatData } from "./types";

export function addMessageToChat(chatData: ChatData, message: Message): ChatData {
  return {
    ...chatData,
    messages: [...chatData.messages, message],
  };
}

export function getLastMessage(chatData: ChatData): Message | undefined {
  return chatData.messages[chatData.messages.length - 1];
}

export function getMessagesByRole(chatData: ChatData, role: Message["role"]): Message[] {
  return chatData.messages.filter(message => message.role === role);
}

export function getChatLength(chatData: ChatData): number {
  return chatData.messages.length;
}

export function hasMessages(chatData: ChatData): boolean {
  return chatData.messages.length > 0;
}