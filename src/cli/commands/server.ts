import type { Command } from "commander";
import type { CommandContext } from "./types";
import { app } from "../../server";

export function register(program: Command, context: CommandContext): void {
  program
    .command("serve")
    .description("start the API server")
    .option("-p, --port <port>", "the port to run the server on", "3000")
    .action(async (options) => {
      const port = options.port;

      if (isNaN(Number(port))) {
        console.error("Port must be a number.");
        return;
      }

      app.listen(port, () => {
        console.log("Server running on port:", port);
      });

      function exitHandler() {
        console.log("Exiting...");
        process.exit();
      }

      process.on("SIGINT", exitHandler);
      process.on("SIGTERM", exitHandler);
    });
}