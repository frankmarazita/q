import { Command } from "commander";
import { API } from "./src/api";
import { authenticate } from "./src/auth";
import {
  loadConfig,
  parseInput,
  processCompletions,
  updateConfig,
} from "./src/utils";
import { setTimeout } from "node:timers";
import { chats } from "./src/chats";
import { readdir } from "node:fs/promises";

const cli = new Command();

cli
  .name("q")
  .version("0.0.1")
  .description("A CLI for interacting with AI models and managing chats")
  .action(async () => {
    let stdin = "";

    process.stdin.on("data", (chunk) => {
      stdin += chunk;
    });

    process.stdin.on("end", () => {
      cli.parse(["", "", "chat", stdin.trim()]);
    });

    // This is a bit of a hack to ensure that the CLI
    // doesn't hang when no input is provided.
    await setTimeout(() => {
      if (stdin.trim() === "") cli.help();
    }, 1);
  });

await authenticate();

const c = await loadConfig();

const api = new API(c.token);

cli
  .command("user")
  .alias("u")
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
  .command("set-model")
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
  .command("model")
  .alias("m")
  .description("view the current default model")
  .action(async () => {
    console.log(
      c.model ? `Current model: ${c.model.name}` : "No default model set."
    );
  });

cli
  .command("chat")
  .alias("c")
  .description("start a new chat")
  .argument("[input]", "input to the chat")
  // .option("-A", "use agent mode")
  // .option("-m, --model <model>", "the model to use for the chat")
  .option("-p, --prompt <prompt>", "the prompt to use for the chat")
  .option(
    "-f, --prompt-file <file>",
    "the prompt file to use for the chat form the prompt directory"
  )
  .option("-i, --interactive", "use interactive mode")
  .action(async (input, option) => {
    let prompt = "You are a helpful AI assistant. Do whatever the user asks.";

    if (option.prompt) {
      prompt = option.prompt;
    } else if (option.promptFile) {
      if (!c.promptDirectory) {
        console.error(
          "No prompt directory configured. Please set it in the config."
        );
        return;
      }

      const promptFile = Bun.file(
        `${c.promptDirectory}/${option.promptFile}.md`
      );
      if (!(await promptFile.exists())) {
        console.error(`Prompt file "${option.promptFile}" not found.`);
        return;
      }
      prompt = await promptFile.text();
    }

    if (!input) {
      input = await parseInput();
      process.stdout.write("\n");
    }

    const chatId: string = await chats.create({
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    while (true) {
      const chat = await chats.get(chatId);
      if (!chat) throw new Error("Something went wrong...");

      await api.refreshCopilotToken();

      const completions = await api.completions("user", {
        messages: chat.data.messages,
        model: c.model ? c.model.id : undefined,
        temperature: 0.1,
        top_p: 1,
        max_tokens: c.model?.capabilities.limits.max_output_tokens,
        n: 1,
        stream: true,
      });

      const reply = await processCompletions(completions);

      await chats.addMessage(chatId, {
        role: "assistant",
        content: reply,
      });

      if (!option.interactive) {
        process.exit(0);
      }

      process.stdout.write("\n");

      input = await parseInput();

      await chats.addMessage(chatId, {
        role: "user",
        content: input,
      });

      process.stdout.write("\n");
    }
  });

cli
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

cli
  .command("set-prompt-dir")
  .description("set the prompt directory")
  .argument("<directory>", "the directory to set as prompt directory")
  .action(async (directory) => {
    let exists = false;

    try {
      await readdir(directory);
      exists = true;
    } catch (err) {
      exists = false;
    }

    if (!exists) {
      console.error(`Directory "${directory}" does not exist.`);
      return;
    }

    await updateConfig({ promptDirectory: directory });

    console.log(`Prompt directory set to: ${directory}`);
  });

cli
  .command("prompt-dir")
  .description("view the current prompt directory")
  .action(async () => {
    if (c.promptDirectory) {
      console.log(`Current prompt directory: ${c.promptDirectory}`);
    } else {
      console.log("No prompt directory set.");
    }
  });

cli
  .command("prompts")
  .description("list the available prompts")
  .action(async () => {
    if (!c.promptDirectory) {
      console.error(
        "No prompt directory configured. Please set it in the config."
      );
      return;
    }

    const files = await readdir(c.promptDirectory);
    const prompts = files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""));

    if (prompts.length === 0) {
      console.log("No prompts found in the directory.");
      return;
    }

    const formattedPrompts = prompts.map((prompt) => ({
      name: prompt,
      file: `${c.promptDirectory}/${prompt}.md`,
    }));

    console.table(formattedPrompts, ["name", "file"]);
  });

cli
  .command("serve")
  .description("start the API server")
  .option("-p, --port <port>", "the port to run the server on", "3000")
  .action(async (options) => {
    console.log(`Starting server on port ${options.port}...`);

    console.log(
      "Note: The server is not implemented yet. This command is a placeholder."
    );
  });

cli.parse(process.argv);
