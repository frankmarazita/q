import { Command } from "commander";
import { API } from "./src/api.ts";
import { authenticate } from "./src/auth.ts";
import { loadConfig, processCompletions, updateConfig } from "./src/utils.ts";

const cli = new Command();

cli.name("q").version("0.0.1");

await authenticate();

const c = await loadConfig();

const api = new API(c.token);

cli
  .command("user")
  .description("view user info")
  .action(async () => {
    const user = await api.user();

    console.log(user);
  });

cli
  .command("models")
  .description("list the models")
  .action(async () => {
    await api.refreshCopilotToken();

    let models = await api.models();

    models = models.map((model) => {
      const { capabilities } = model;

      // console.log(JSON.stringify(capabilities, null, 2));

      return {
        id: model.id,
        name: model.name,
        vendor: model.vendor,
        version: model.version,
        capabilities_limits_max_output_tokens:
          model.capabilities.limits.max_output_tokens,
        capabilities_limits_max_prompt_tokens:
          model.capabilities.limits.max_prompt_tokens,
        parallel_tool_calls: model.capabilities.supports.parallel_tool_calls,
        streaming: model.capabilities.supports.streaming,
        structured_outputs: model.capabilities.supports.structured_outputs,
        tool_calls: model.capabilities.supports.tool_calls,
        vision: model.capabilities.supports.vision,
      };
    });

    console.table(models, [
      "id",
      "name",
      "vendor",
      "version",
      // "capabilities_limits_max_output_tokens",
      // "capabilities_limits_max_prompt_tokens",
      "parallel_tool_calls",
      "streaming",
      "structured_outputs",
      "tool_calls",
      "vision",
    ]);
  });

cli
  .command("default-model")
  .description("set the default model")
  .argument("<model>", "the model to set as default")
  .action(async (model) => {
    await api.refreshCopilotToken();

    const models = await api.models();

    let selectedModel: Record<string, any> | undefined = undefined;

    for (const m of models) {
      if (m.id === model || m.name === model) {
        selectedModel = m;
        break;
      }
    }

    if (!selectedModel) {
      console.error(`Model "${model}" is not available.`);
      return;
    }

    await updateConfig({ model: selectedModel });
    console.log(`Default model set to: ${selectedModel.name}`);
  });

cli
  .command("chat")
  .description("start a new chat")
  .argument("<input>", "input to the chat")
  // .option("-A", "use agent mode")
  .action(async (input, option) => {
    await api.refreshCopilotToken();

    const completions = await api.completions("user", {
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. You give short, accurate and concise answers.",
        },
        {
          role: "user",
          content: input,
        },
      ],
      model: c.model ? c.model.id : undefined,
      temperature: 0.1,
      top_p: 1,
      max_tokens: c.model?.capabilities.limits.max_output_tokens,
      n: 1,
      stream: true,
    });

    await processCompletions(completions);
  });

cli.parse(process.argv);

if (process.argv.length === 2) {
  cli.help();
}
