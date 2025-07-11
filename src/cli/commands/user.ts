import type { Command } from "commander";
import type { CommandContext } from "./types";

export function register(program: Command, context: CommandContext): void {
  program
    .command("user")
    .alias("u")
    .description("view user info")
    .action(async () => {
      const user = await context.api.user();
      console.log(user);
    });
}
