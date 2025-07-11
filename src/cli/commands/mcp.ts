import type { Command } from "commander";
import type { CommandContext } from "./types";

export function register(program: Command, context: CommandContext): void {
  program
    .command("mcp-servers")
    .description("list the available MCP servers")
    .action(async () => {
      const { mcp } = await import("../../services/mcp");

      const res = await mcp.servers();

      if (res.status === "error") {
        console.error(res.message);
        return;
      }

      console.table(res.data);
    });
}