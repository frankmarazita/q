import type { Command } from "commander";
import type { CommandContext } from "./types";
import { models } from "../../services/models";
import { renderModelsTable } from "../rendering/tables";

export function register(program: Command, context: CommandContext): void {
  program
    .command("models")
    .description("list the models")
    .action(async () => {
      const res = await models.list();

      if (res.status === "error") {
        console.error(res.message);
        return;
      }

      renderModelsTable(res.data);
    });

  program
    .command("set-model")
    .description("set the default model")
    .argument("<model>", "the model to set as default")
    .action(async (model) => {
      const res = await models.set(model);

      if (res.status === "error") {
        console.error(res.message);
        return;
      }

      console.log(`Default model set to: ${res.data.name} (${res.data.id})`);
    });

  program
    .command("model")
    .alias("m")
    .description("view the current default model")
    .action(async () => {
      const res = await models.get();

      if (res.status === "error") {
        console.error(res.message);
        return;
      }

      console.log(`Current default model: ${res.data.name} (${res.data.id})`);
    });
}