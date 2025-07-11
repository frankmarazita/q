import { db } from "../db";
import {
  createChatSummaries,
  parseRawChat,
  validateChatExists,
  addMessageToChat,
} from "../lib/chats";
import type { ChatData, Message, ChatSummary } from "../lib/chats/types";
import type { Res } from "../lib/common/types";
import { successRes, errorRes } from "../lib/common/response";

async function listChats(): Promise<Res<ChatSummary[]>> {
  const rawChats = await db.getAllChats();

  if (rawChats.length === 0) {
    return successRes([]);
  }

  const summaries = createChatSummaries(rawChats);
  return successRes(summaries);
}

async function getChat(chatId: string): Promise<
  Res<{
    id: string;
    data: ChatData;
    created_at: string;
    updated_at: string;
  }>
> {
  const rawChat = await db.getChat(chatId);

  const validationResult = validateChatExists(rawChat, chatId);
  if (validationResult.status === "error") {
    return validationResult;
  }

  const parsedChat = parseRawChat(validationResult.data);
  return successRes(parsedChat);
}

async function createChat(data: ChatData): Promise<Res<string>> {
  try {
    const chatId = await db.insertChat(data);
    return successRes(chatId);
  } catch (_error) {
    return errorRes("Failed to create chat");
  }
}

async function deleteChat(chatId: string): Promise<Res<void>> {
  const rawChat = await db.getChat(chatId);

  const validationResult = validateChatExists(rawChat, chatId);
  if (validationResult.status === "error") {
    return validationResult;
  }

  try {
    await db.deleteChat(chatId);
    return successRes(undefined);
  } catch (_error) {
    return errorRes("Failed to delete chat");
  }
}

async function addMessage(
  chatId: string,
  message: Message
): Promise<Res<Message[]>> {
  const rawChat = await db.getChat(chatId);

  const validationResult = validateChatExists(rawChat, chatId);
  if (validationResult.status === "error") {
    return validationResult;
  }

  const parsedChat = parseRawChat(validationResult.data);
  const updatedChatData = addMessageToChat(parsedChat.data, message);

  try {
    await db.updateChat(chatId, updatedChatData);
    return successRes(updatedChatData.messages);
  } catch (_error) {
    return errorRes("Failed to add message to chat");
  }
}

export const chats = {
  list: listChats,
  get: getChat,
  create: createChat,
  delete: deleteChat,
  addMessage: addMessage,
};
