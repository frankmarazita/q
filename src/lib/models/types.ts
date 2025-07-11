import { z } from "zod";

export const zModel = z.object({
  id: z.string(),
  name: z.string(),
  vendor: z.string(),
  version: z.string(),
  capabilities: z.object({
    limits: z.object({
      max_output_tokens: z.number(),
      max_prompt_tokens: z.number(),
    }),
    supports: z.object({
      parallel_tool_calls: z.boolean(),
      streaming: z.boolean(),
      structured_outputs: z.boolean(),
      tool_calls: z.boolean(),
      vision: z.boolean(),
    }),
  }),
});

export type Model = z.infer<typeof zModel>;

export const zTransformedModel = z.object({
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
});

export type TransformedModel = z.infer<typeof zTransformedModel>;
