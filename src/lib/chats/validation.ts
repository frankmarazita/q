import type { RawChat } from "./types";
import type { Res } from "../common/types";
import { createSuccessResponse, createErrorResponse } from "../common/response";

export function validateChatExists(
  chat: RawChat | null | undefined,
  chatId: string
): Res<RawChat> {
  if (!chat) {
    return createErrorResponse(`Chat with ID ${chatId} not found`);
  }

  return createSuccessResponse(chat);
}
