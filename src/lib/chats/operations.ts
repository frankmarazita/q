import type { Message, ChatData } from "./types";

export function addMessageToChat(
  chatData: ChatData,
  message: Message
): ChatData {
  return {
    ...chatData,
    messages: [...chatData.messages, message],
  };
}
