import { describe, it, expect } from "bun:test";
import { 
  validateMessage, 
  validateChatData, 
  validateChatExists, 
  validateChatDataString 
} from "../../../lib/chats/validation";
import type { Message, ChatData, RawChat } from "../../../lib/chats/types";

describe("validateMessage", () => {
  it("should validate correct message", () => {
    const message: Message = {
      role: "user",
      content: "Hello world",
    };

    const result = validateMessage(message);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data).toEqual(message);
    }
  });

  it("should reject message without role", () => {
    const message = {
      content: "Hello world",
    } as Message;

    const result = validateMessage(message);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe("Message must have a role");
    }
  });

  it("should reject message without content or tool_calls", () => {
    const message: Message = {
      role: "user",
      content: "",
    };

    const result = validateMessage(message);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe("Message must have content or tool_calls");
    }
  });

  it("should accept message with tool_calls but no content", () => {
    const message: Message = {
      role: "assistant",
      content: "",
      tool_calls: [{ function: { name: "test" } }],
    };

    const result = validateMessage(message);

    expect(result.status).toBe("success");
  });
});

describe("validateChatData", () => {
  it("should validate correct chat data", () => {
    const chatData: ChatData = {
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ],
    };

    const result = validateChatData(chatData);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data).toEqual(chatData);
    }
  });

  it("should reject chat data without messages array", () => {
    const chatData = {} as ChatData;

    const result = validateChatData(chatData);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe("ChatData must have messages array");
    }
  });

  it("should reject chat data with empty messages", () => {
    const chatData: ChatData = {
      messages: [],
    };

    const result = validateChatData(chatData);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe("ChatData must have at least one message");
    }
  });

  it("should reject chat data with invalid message", () => {
    const chatData: ChatData = {
      messages: [
        { role: "user", content: "Valid message" },
        { role: "assistant", content: "" }, // Invalid - no content or tool_calls
      ],
    };

    const result = validateChatData(chatData);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe("Message must have content or tool_calls");
    }
  });
});

describe("validateChatExists", () => {
  it("should validate existing chat", () => {
    const chat: RawChat = {
      id: "chat-1",
      data: '{"messages":[]}',
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = validateChatExists(chat, "chat-1");

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data).toEqual(chat);
    }
  });

  it("should reject null chat", () => {
    const result = validateChatExists(null, "chat-1");

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe("Chat with ID chat-1 not found");
    }
  });
});

describe("validateChatDataString", () => {
  it("should validate correct JSON string", () => {
    const jsonString = '{"messages":[{"role":"user","content":"Hello"}]}';

    const result = validateChatDataString(jsonString);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.messages).toHaveLength(1);
      expect(result.data.messages[0]?.content).toBe("Hello");
    }
  });

  it("should reject invalid JSON", () => {
    const jsonString = '{"messages":[{"role":"user","content":"Hello"}'; // Missing closing brackets

    const result = validateChatDataString(jsonString);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe("Invalid JSON in chat data");
    }
  });

  it("should reject valid JSON with invalid chat data", () => {
    const jsonString = '{"messages":[]}'; // Empty messages array

    const result = validateChatDataString(jsonString);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe("ChatData must have at least one message");
    }
  });
});