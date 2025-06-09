import { API } from "./src/vendor/api";
import { authenticate } from "./src/vendor/auth";
import { parseInput, processCompletions } from "./src/utils";
import { chats } from "./src/services/chats";
import { loadConfig, updateConfig } from "./src/services/config";
import { models } from "./src/services/models";
import { ENV } from "./src/env";
import { app } from "./src/server";

import { Command } from "commander";
import { setTimeout } from "node:timers";
import { readdir } from "node:fs/promises";
import * as Sentry from "@sentry/bun";

Sentry.init({
  environment: ENV.ENVIRONMENT,
  dsn: ENV.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

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

const config = await loadConfig();

export const api = new API(config.token);

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
    const res = await models.list();

    console.table(res, [
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
    const res = await models.set(model);

    if (res.status === "error") {
      console.error(res.message);
      return;
    }

    console.log(`Default model set to: ${res.data}`);
  });

cli
  .command("model")
  .alias("m")
  .description("view the current default model")
  .action(async () => {
    const res = await models.get();

    if (res.status === "error") {
      console.error(res.message);
      return;
    }

    console.log(`Current default model: ${res.data}`);
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
      if (!config.promptDirectory) {
        console.error(
          "No prompt directory configured. Please set it in the config."
        );
        return;
      }

      const promptFile = Bun.file(
        `${config.promptDirectory}/${option.promptFile}.md`
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
        model: config.model ? config.model.id : undefined,
        temperature: 0.1,
        top_p: 1,
        max_tokens: config.model?.capabilities.limits.max_output_tokens,
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
    if (config.promptDirectory) {
      console.log(`Current prompt directory: ${config.promptDirectory}`);
    } else {
      console.log("No prompt directory set.");
    }
  });

cli
  .command("prompts")
  .description("list the available prompts")
  .action(async () => {
    if (!config.promptDirectory) {
      console.error(
        "No prompt directory configured. Please set it in the config."
      );
      return;
    }

    const files = await readdir(config.promptDirectory);
    const prompts = files
      .filter((file) => file.endsWith(".md"))
      .map((file) => file.replace(/\.md$/, ""));

    if (prompts.length === 0) {
      console.log("No prompts found in the directory.");
      return;
    }

    const formattedPrompts = prompts.map((prompt) => ({
      name: prompt,
      file: `${config.promptDirectory}/${prompt}.md`,
    }));

    console.table(formattedPrompts, ["name", "file"]);
  });

cli
  .command("mcp-servers")
  .description("list the available MCP servers")
  .action(async () => {
    const { mcp } = await import("./src/services/mcp");

    const res = await mcp.servers();

    if (res.status === "error") {
      console.error(res.message);
      return;
    }

    console.table(res.data);
  });

cli
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

cli.parse(process.argv);
