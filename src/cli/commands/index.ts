import type { Command } from "commander";
import type { CommandContext } from "./types";

import * as userCommand from "./user";
import * as modelsCommand from "./models";
import * as chatCommand from "./chat";
import * as chatsCommand from "./chats";
import * as promptsCommand from "./prompts";
import * as mcpCommand from "./mcp";
import * as serverCommand from "./server";

export function registerCommands(
  program: Command,
  context: CommandContext
): void {
  userCommand.register(program, context);
  modelsCommand.register(program, context);
  chatCommand.register(program, context);
  chatsCommand.register(program, context);
  promptsCommand.register(program, context);
  mcpCommand.register(program, context);
  serverCommand.register(program, context);
}
