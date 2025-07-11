import type { Command } from "commander";
import type { CommandContext } from "./types";
import { readdir } from "node:fs/promises";
import { updateConfig, loadConfig } from "../../services/config";

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

  program
    .command("set-prompt")
    .description("set the default prompt file")
    .argument(
      "<prompt-file>",
      "the default prompt file name (without .md extension)"
    )
    .action(async (promptFile) => {
      if (!context.config.promptDirectory) {
        console.error(
          "No prompt directory configured. Please set it with set-prompt-dir first."
        );
        return;
      }

      const file = Bun.file(
        `${context.config.promptDirectory}/${promptFile}.md`
      );
      if (!(await file.exists())) {
        console.error(
          `Prompt file "${promptFile}.md" not found in ${context.config.promptDirectory}`
        );
        return;
      }

      await updateConfig({ defaultPrompt: promptFile });
      console.log(`Default prompt set to: ${promptFile}`);
    });

  program
    .command("remove-prompt")
    .description("remove the default prompt file")
    .action(async () => {
      const currentConfig = await loadConfig();
      if (!currentConfig.defaultPrompt) {
        console.log("No default prompt set.");
        return;
      }

      await updateConfig({ defaultPrompt: undefined });
      console.log("Default prompt removed.");
    });

  program
    .command("prompt")
    .description("view the current default prompt")
    .option("-v, --verbose", "show the content of the default prompt file")
    .action(async (options) => {
      const currentConfig = await loadConfig();
      if (currentConfig.defaultPrompt) {
        console.log(
          `Current default prompt file: ${currentConfig.defaultPrompt}`
        );

        if (!options.verbose) return;

        if (currentConfig.promptDirectory) {
          const file = Bun.file(
            `${currentConfig.promptDirectory}/${currentConfig.defaultPrompt}.md`
          );
          if (await file.exists()) {
            const content = await file.text();
            console.log(`\nContent:\n${content}`);
          } else {
            console.log(
              `\nWarning: Prompt file "${currentConfig.defaultPrompt}.md" not found in ${currentConfig.promptDirectory}`
            );
          }
        } else {
          console.log("\nWarning: No prompt directory configured.");
        }
      } else {
        console.log("No default prompt set.");
      }
    });
}
