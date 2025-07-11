import type { Command } from "commander";
import type { CommandContext } from "./types";
import { readdir } from "node:fs/promises";
import { updateConfig } from "../../services/config";

export function register(program: Command, context: CommandContext): void {
  program
    .command("set-prompt-dir")
    .description("set the prompt directory")
    .argument("<directory>", "the directory to set as prompt directory")
    .action(async (directory) => {
      let exists = false;

      try {
        await readdir(directory);
        exists = true;
      } catch (_err) {
        exists = false;
      }

      if (!exists) {
        console.error(`Directory "${directory}" does not exist.`);
        return;
      }

      await updateConfig({ promptDirectory: directory });

      console.log(`Prompt directory set to: ${directory}`);
    });

  program
    .command("prompt-dir")
    .description("view the current prompt directory")
    .action(async () => {
      if (context.config.promptDirectory) {
        console.log(
          `Current prompt directory: ${context.config.promptDirectory}`
        );
      } else {
        console.log("No prompt directory set.");
      }
    });

  program
    .command("prompts")
    .description("list the available prompts")
    .action(async () => {
      if (!context.config.promptDirectory) {
        console.error(
          "No prompt directory configured. Please set it in the config."
        );
        return;
      }

      const files = await readdir(context.config.promptDirectory);
      const prompts = files
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(/\.md$/, ""));

      if (prompts.length === 0) {
        console.log("No prompts found in the directory.");
        return;
      }

      const formattedPrompts = prompts.map((prompt) => ({
        name: prompt,
        file: `${context.config.promptDirectory}/${prompt}.md`,
      }));

      console.table(formattedPrompts, ["name", "file"]);
    });
}
