import { describe, it, expect } from "bun:test";
import { addMessageToChat } from "../../../lib/chats/operations";
import type { ChatData, Message } from "../../../lib/chats/types";

describe("addMessageToChat", () => {
  it("should add message to chat without mutating original", () => {
    const originalChat: ChatData = {
      messages: [{ role: "user", content: "Hello" }],
    };

    const newMessage: Message = {
      role: "assistant",
      content: "Hi there!",
    };

    const result = addMessageToChat(originalChat, newMessage);

    expect(result.messages).toHaveLength(2);
    expect(result.messages[1]).toEqual(newMessage);
    // Original should not be mutated
    expect(originalChat.messages).toHaveLength(1);
  });
});
