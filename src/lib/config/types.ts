import { z } from "zod";
import { zModel } from "../models/types";

export const zCopilotToken = z.object({
  token: z.string(),
  expiresAt: z.number(),
});

export type CopilotToken = z.infer<typeof zCopilotToken>;

export const zConfig = z.object({
  token: z.string(),
  copilotToken: zCopilotToken.optional(),
  model: zModel.optional(),
  promptDirectory: z.string().optional(),
  defaultPrompt: z.string().optional(),
});

export type Config = z.infer<typeof zConfig>;

export const zConfigUpdate = zConfig.partial();

export type ConfigUpdate = z.infer<typeof zConfigUpdate>;
