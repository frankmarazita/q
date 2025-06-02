import { Command } from "commander";
import { API } from "./src/api";
import { authenticate } from "./src/auth";
import { loadConfig, processCompletions, updateConfig } from "./src/utils";
import { setTimeout } from "node:timers";
import { db } from "./src/db";
import { chats } from "./src/chats";

const cli = new Command();

async function parseInput(): Promise<string> {
  const input = await new Promise<string>((resolve) => {
    process.stdout.write("> ");
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });

  const exitCommands = ["exit", "quit", "q"];

  if (!input || exitCommands.includes(input.toLowerCase())) {
    process.exit(0);
  }
  return input;
}

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
  .option("-i, --interactive", "use interactive mode")
  .action(async (input, option) => {
    if (!input) {
      input = await parseInput();
      process.stdout.write("\n");
    }

    const prompt = "You are a helpful AI assistant. Do whatever the user asks.";

    const chatId: string = await db.insertChat({
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
      const chat = await chats.get(db, chatId);
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

      await chats.addMessage(db, chatId, {
        role: "assistant",
        content: reply,
      });

      if (!option.interactive) {
        process.exit(0);
      }

      process.stdout.write("\n");

      input = await parseInput();

      await chats.addMessage(db, chatId, {
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
      await chats.delete(db, options.delete);
    } else {
      await chats.list(db);
    }
  });

cli.parse(process.argv);
