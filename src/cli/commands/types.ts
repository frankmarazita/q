import type { Command } from "commander";
import { zConfig } from "../../lib/config/types";
import type { API } from "../../vendor/api";
import { z } from "zod";

export const zCommandContext = z.object({
  config: zConfig,
  api: z.custom<API>(),
});

export type CommandContext = z.infer<typeof zCommandContext>;

export interface CommandModule {
  register: (program: Command, context: CommandContext) => void;
}
