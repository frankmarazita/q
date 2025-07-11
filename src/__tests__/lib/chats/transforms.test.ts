import { describe, it, expect } from "bun:test";
import { 
  parseRawChat, 
  createChatSummary, 
  createChatSummaries, 
  serializeChatData 
} from "../../../lib/chats/transforms";
import type { RawChat, ChatData } from "../../../lib/chats/types";

describe("parseRawChat", () => {
  it("should parse raw chat data correctly", () => {
    const rawChat: RawChat = {
      id: "chat-1",
      data: '{"messages":[{"role":"user","content":"Hello"}]}',
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = parseRawChat(rawChat);

    expect(result.id).toBe("chat-1");
    expect(result.data.messages).toHaveLength(1);
    expect(result.data.messages[0]?.role).toBe("user");
    expect(result.data.messages[0]?.content).toBe("Hello");
  });
});

describe("createChatSummary", () => {
  it("should create summary with preview from second message", () => {
    const rawChat: RawChat = {
      id: "chat-1",
      data: '{"messages":[{"role":"system","content":"You are helpful"},{"role":"user","content":"What is TypeScript?"}]}',
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = createChatSummary(rawChat);

    expect(result.id).toBe("chat-1");
    expect(result.message).toBe("What is TypeScript?");
    expect(result.chat_length).toBe(2);
    expect(result.created_at).toBe("2024-01-01");
  });

  it("should truncate long messages", () => {
    const longMessage = "This is a very long message that should be truncated to 20 characters";
    const rawChat: RawChat = {
      id: "chat-1",
      data: `{"messages":[{"role":"system","content":"System"},{"role":"user","content":"${longMessage}"}]}`,
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = createChatSummary(rawChat);

    expect(result.message).toBe("This is a very long ...");
  });

  it("should fallback to first message if no second message", () => {
    const rawChat: RawChat = {
      id: "chat-1",
      data: '{"messages":[{"role":"system","content":"System message only"}]}',
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = createChatSummary(rawChat);

    expect(result.message).toBe("System message only");
    expect(result.chat_length).toBe(1);
  });

  it("should handle empty messages array", () => {
    const rawChat: RawChat = {
      id: "chat-1",
      data: '{"messages":[]}',
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
    };

    const result = createChatSummary(rawChat);

    expect(result.message).toBe("");
    expect(result.chat_length).toBe(0);
  });
});

describe("createChatSummaries", () => {
  it("should create summaries for multiple chats", () => {
    const rawChats: RawChat[] = [
      {
        id: "chat-1",
        data: '{"messages":[{"role":"user","content":"Hello"}]}',
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      },
      {
        id: "chat-2",
        data: '{"messages":[{"role":"user","content":"World"}]}',
        created_at: "2024-01-02",
        updated_at: "2024-01-02",
      },
    ];

    const result = createChatSummaries(rawChats);

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("chat-1");
    expect(result[0]?.message).toBe("Hello");
    expect(result[1]?.id).toBe("chat-2");
    expect(result[1]?.message).toBe("World");
  });

  it("should handle empty array", () => {
    const result = createChatSummaries([]);
    expect(result).toHaveLength(0);
  });
});

describe("serializeChatData", () => {
  it("should serialize chat data to JSON string", () => {
    const chatData: ChatData = {
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ],
    };

    const result = serializeChatData(chatData);

    expect(result).toBe('{"messages":[{"role":"user","content":"Hello"},{"role":"assistant","content":"Hi there!"}]}');
  });
});