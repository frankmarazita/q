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
): Promise<void> {
  const decoder = new TextDecoder("utf-8");

  let done = false;

  const chunks: string[] = [];

  function processChunk(chunk: string): void {
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const jsonString = line.trim().slice(6);
      // console.log("\n\n" + jsonString + "\n");

      if (jsonString === "[DONE]") break;

      try {
        const json = JSON.parse(jsonString);

        if (json.choices[0].delta.content) {
          process.stdout.write(json.choices[0].delta.content);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
        console.error(jsonString);
      }
    }
  }

  while (!done) {
    const { done: doneReading, value } = await completions.read();
    done = doneReading;

    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      chunks.push(chunk.trim());

      processChunk(chunk);
    }
  }

  process.stdout.write("\n");
}
