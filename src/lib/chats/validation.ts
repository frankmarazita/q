import type { RawChat } from "./types";
import type { Res } from "../common/types";
import { successRes, errorRes } from "../common/response";

export function validateChatExists(
  chat: RawChat | null | undefined,
  chatId: string
): Res<RawChat> {
  if (!chat) {
    return errorRes(`Chat with ID ${chatId} not found`);
  }

  return successRes(chat);
}
