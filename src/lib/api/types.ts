import { z } from "zod";

export const zChatReq = z.object({
  input: z
    .string({ required_error: "Input message is required" })
    .min(1, "Input message is required"),
  prompt: z.string().optional(),
});

export type ChatReq = z.infer<typeof zChatReq>;

export const zChatRes = z.object({
  message: z.string(),
  chatId: z.string(),
});

export type ChatRes = z.infer<typeof zChatRes>;

export const zErrorRes = z.object({
  error: z.string(),
});

export type ErrorRes = z.infer<typeof zErrorRes>;

export const zModelsRes = z.object({
  status: z.string(),
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      vendor: z.string(),
      version: z.string(),
      capabilities_limits_max_output_tokens: z.number(),
      capabilities_limits_max_prompt_tokens: z.number(),
      parallel_tool_calls: z.boolean(),
      streaming: z.boolean(),
      structured_outputs: z.boolean(),
      tool_calls: z.boolean(),
      vision: z.boolean(),
    })
  ),
});

export type ModelsRes = z.infer<typeof zModelsRes>;

export const zSetModelReq = z.object({
  model: z.string().min(1, "Model name is required"),
});

export type SetModelReq = z.infer<typeof zSetModelReq>;

export const zSetModelRes = z.object({
  message: z.string(),
});

export type SetModelRes = z.infer<typeof zSetModelRes>;
