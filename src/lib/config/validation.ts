import { z } from "zod";
import type { Config } from "./types";
import type { Res } from "../common/types";
import { successRes, errorRes } from "../common/response";

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

export function validateConfig(data: unknown): Res<Config> {
  const result = configSchema.safeParse(data);
  return result.success
    ? successRes(result.data as Config)
    : errorRes(result.error.format().toString());
}
