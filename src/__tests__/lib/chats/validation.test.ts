import { describe, it, expect } from "bun:test";
import { 
  validateChatExists
} from "../../../lib/chats/validation";
import type { RawChat } from "../../../lib/chats/types";


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

