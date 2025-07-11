import { describe, it, expect } from "bun:test";
import { 
  addMessageToChat, 
  getLastMessage, 
  getMessagesByRole, 
  getChatLength, 
  hasMessages 
} from "../../../lib/chats/operations";
import type { ChatData, Message } from "../../../lib/chats/types";

describe("addMessageToChat", () => {
  it("should add message to chat without mutating original", () => {
    const originalChat: ChatData = {
      messages: [
        { role: "user", content: "Hello" },
      ],
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

describe("getLastMessage", () => {
  it("should return last message", () => {
    const chatData: ChatData = {
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ],
    };

    const result = getLastMessage(chatData);

    expect(result?.role).toBe("assistant");
    expect(result?.content).toBe("Hi there!");
  });

  it("should return undefined for empty messages", () => {
    const chatData: ChatData = {
      messages: [],
    };

    const result = getLastMessage(chatData);

    expect(result).toBeUndefined();
  });
});

describe("getMessagesByRole", () => {
  it("should filter messages by role", () => {
    const chatData: ChatData = {
      messages: [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
        { role: "user", content: "How are you?" },
      ],
    };

    const userMessages = getMessagesByRole(chatData, "user");
    const systemMessages = getMessagesByRole(chatData, "system");

    expect(userMessages).toHaveLength(2);
    expect(userMessages[0]?.content).toBe("Hello");
    expect(userMessages[1]?.content).toBe("How are you?");
    
    expect(systemMessages).toHaveLength(1);
    expect(systemMessages[0]?.content).toBe("You are helpful");
  });

  it("should return empty array for non-existent role", () => {
    const chatData: ChatData = {
      messages: [
        { role: "user", content: "Hello" },
      ],
    };

    const toolMessages = getMessagesByRole(chatData, "tool");

    expect(toolMessages).toHaveLength(0);
  });
});

describe("getChatLength", () => {
  it("should return correct message count", () => {
    const chatData: ChatData = {
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
        { role: "user", content: "How are you?" },
      ],
    };

    const result = getChatLength(chatData);

    expect(result).toBe(3);
  });

  it("should return 0 for empty messages", () => {
    const chatData: ChatData = {
      messages: [],
    };

    const result = getChatLength(chatData);

    expect(result).toBe(0);
  });
});

describe("hasMessages", () => {
  it("should return true for chat with messages", () => {
    const chatData: ChatData = {
      messages: [
        { role: "user", content: "Hello" },
      ],
    };

    const result = hasMessages(chatData);

    expect(result).toBe(true);
  });

  it("should return false for empty chat", () => {
    const chatData: ChatData = {
      messages: [],
    };

    const result = hasMessages(chatData);

    expect(result).toBe(false);
  });
});