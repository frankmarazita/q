import { z } from "zod";
import type { Config } from "./types";

const copilotTokenSchema = z.object({
  token: z.string(),
  expiresAt: z.number(),
});

const configSchema = z.object({
  token: z.string(),
  copilotToken: copilotTokenSchema.optional(),
  model: z.any().optional(),
  promptDirectory: z.string().optional(),
});

export function validateConfig(data: unknown): Config | null {
  const result = configSchema.safeParse(data);
  return result.success ? result.data as Config : null;
}


export function getConfigValidationError(data: unknown): string | null {
  const result = configSchema.safeParse(data);
  return result.success ? null : result.error.format().toString();
}