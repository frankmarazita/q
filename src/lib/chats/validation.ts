import type { Message, ChatData, RawChat } from "./types";
import type { Res } from "../common/types";
import { createSuccessResponse, createErrorResponse } from "../common/response";

export function validateMessage(message: Message): Res<Message> {
  if (!message.role) {
    return createErrorResponse("Message must have a role");
  }
  
  if (!message.content && !message.tool_calls) {
    return createErrorResponse("Message must have content or tool_calls");
  }
  
  return createSuccessResponse(message);
}

export function validateChatData(chatData: ChatData): Res<ChatData> {
  if (!chatData.messages || !Array.isArray(chatData.messages)) {
    return createErrorResponse("ChatData must have messages array");
  }
  
  if (chatData.messages.length === 0) {
    return createErrorResponse("ChatData must have at least one message");
  }
  
  for (const message of chatData.messages) {
    const messageValidation = validateMessage(message);
    if (messageValidation.status === "error") {
      return messageValidation;
    }
  }
  
  return createSuccessResponse(chatData);
}

export function validateChatExists(chat: RawChat | null | undefined, chatId: string): Res<RawChat> {
  if (!chat) {
    return createErrorResponse(`Chat with ID ${chatId} not found`);
  }
  
  return createSuccessResponse(chat);
}

export function validateChatDataString(dataString: string): Res<ChatData> {
  try {
    const parsed = JSON.parse(dataString);
    return validateChatData(parsed);
  } catch (error) {
    return createErrorResponse("Invalid JSON in chat data");
  }
}