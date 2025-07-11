import { z } from "zod";

export type MessageRole = "system" | "user" | "assistant" | "tool";

export const zMessage = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
  tool_calls: z.array(z.any()).optional(),
  tool_call_id: z.string().optional(),
});

export type Message = z.infer<typeof zMessage>;

export const zChatData = z.object({
  messages: z.array(zMessage),
});

export type ChatData = z.infer<typeof zChatData>;

export const zRawChat = z.object({
  id: z.string(),
  data: z.string(), // JSON string
  created_at: z.string(),
  updated_at: z.string(),
});

export type RawChat = z.infer<typeof zRawChat>;

export const zParsedChat = z.object({
  id: z.string(),
  data: zChatData,
  created_at: z.string(),
  updated_at: z.string(),
});

export type ParsedChat = z.infer<typeof zParsedChat>;

export const zChatSummary = z.object({
  id: z.string(),
  message: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  chat_length: z.number(),
});

export type ChatSummary = z.infer<typeof zChatSummary>;
