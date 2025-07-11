import { z } from "zod";

export const zCompletionChunk = z.object({
  choices: z.array(
    z.object({
      delta: z.object({
        content: z.string().optional(),
        tool_calls: z
          .array(
            z.object({
              type: z.string(),
              index: z.number().optional(),
              function: z
                .object({
                  name: z.string().optional(),
                  arguments: z.string().optional(),
                })
                .optional(),
            })
          )
          .optional(),
      }),
    })
  ),
});

export type CompletionChunk = z.infer<typeof zCompletionChunk>;

export const zToolCall = z.object({
  function: z.any(),
  arguments: z.any(),
});

export type ToolCall = z.infer<typeof zToolCall>;

export const zCompletionResult = z.union([
  z.object({
    type: z.literal("message"),
    message: z.string(),
  }),
  z.object({
    type: z.literal("tool-calls"),
    toolCalls: z.array(zToolCall),
  }),
]);

export type CompletionResult = z.infer<typeof zCompletionResult>;

export const zStreamEvent = z.object({
  type: z.enum(["content", "tool-call", "done"]),
  data: z.string().optional(),
  toolCall: zToolCall.optional(),
});

export type StreamEvent = z.infer<typeof zStreamEvent>;
