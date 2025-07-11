import type { Command } from "commander";
import type { CommandContext } from "./types";
import { chats } from "../../services/chats";

export function register(program: Command, context: CommandContext): void {
  program
    .command("chats")
    .description("list the chats")
    .option("-D, --delete <id>", "delete a chat by ID")
    .action(async (options) => {
      if (options.delete) {
        await chats.delete(options.delete);
      } else {
        await chats.list();
      }
    });
}
