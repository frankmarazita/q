import { Command } from "commander";
import { registerCommands } from "./commands";
import type { CommandContext } from "./commands/types";
import { setTimeout } from "timers/promises";

// NOTE: For some reason, the `setTimeout` import is necessary to ensure
// that bun does't crash when running the CLI with some commands.
// May be resolved in future versions of bun.

export async function createCLI(
  version: string,
  context: CommandContext
): Promise<Command> {
  const cli = new Command();

  await setTimeout(0).then(() => void 0);

  cli
    .name("q")
    .version(version)
    .description("A CLI for interacting with AI models and managing chats")
    .action(async () => {
      let stdin = "";
      process.stdin.on("data", (chunk) => {
        stdin += chunk;
      });
      process.stdin.on("end", () => {
        cli.parse(["", "", "chat", stdin.trim()]);
      });

      stdin.trim() === "" ? cli.help() : 0;
    });

  await setTimeout(0).then(() => void 0);

  registerCommands(cli, context);

  return cli;
}

export async function runCLI(cli: Command, args: string[]): Promise<void> {
  cli.parse(args);
}
