import os from "node:os";
import * as path from "node:path";
import { z } from "zod";

const CONFIG_PATH = path.join(os.homedir(), ".q");

const HOME = os.homedir();

const zConfig = z.object({
  token: z.string(),
  copilotToken: z
    .object({
      token: z.string(),
      expiresAt: z.number(),
    })
    .optional(),
  model: z.record(z.string(), z.any().optional()).optional(),
  promptDirectory: z.string().optional(),
});

export type Config = z.infer<typeof zConfig>;

export async function saveConfig(config: Config): Promise<Config> {
  const fileContent = JSON.stringify(config, null, 2);
  await Bun.write(CONFIG_PATH, fileContent);

  return JSON.parse(fileContent) as Config;
}

export async function loadConfig(): Promise<Config> {
  const file = Bun.file(CONFIG_PATH);

  const fileExists = await file.exists();

  if (!fileExists) {
    return await saveConfig({ token: "" });
  }

  const text = await file.text();
  const configResult = zConfig.safeParse(JSON.parse(text));

  if (!configResult.success) {
    throw new Error(`Invalid config file: ${configResult.error.format()}`);
  }

  return configResult.data;
}

export async function updateConfig(updates: Partial<Config>): Promise<Config> {
  const currentConfig = await loadConfig();
  const newConfig = { ...currentConfig, ...updates };
  return await saveConfig(newConfig);
}

export async function processCompletions(
  completions: import("stream/web").ReadableStreamDefaultReader<any>
): Promise<string> {
  const decoder = new TextDecoder("utf-8");

  let done = false;
  let message = "";

  const chunks: string[] = [];

  let partialJsonString = "";

  while (!done) {
    const { done: doneReading, value } = await completions.read();
    done = doneReading;

    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      chunks.push(chunk.trim());

      processChunk(chunk);
    }
  }

  function processChunk(chunk: string): void {
    const lines = chunk.trim().split("\n\ndata: ");

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]?.trim();
      if (!line) continue; // Skip empty lines
      // console.log("%" + line + "%");

      if (line.startsWith("data: ")) {
        // Remove "data: " prefix if present
        line = line.slice(6);
      }

      const jsonString = partialJsonString + line;

      if (jsonString === "[DONE]") break;

      try {
        const json = JSON.parse(jsonString);

        partialJsonString = "";

        if (json.choices.length && json.choices[0].delta.content) {
          process.stdout.write(json.choices[0].delta.content);
          message += json.choices[0].delta.content;
        }
      } catch (error) {
        partialJsonString = jsonString;
      }
    }
  }

  return message;
}

export async function parseInput(): Promise<string> {
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
