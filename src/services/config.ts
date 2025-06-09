import os from "node:os";
import * as path from "node:path";
import { z } from "zod";

export const CONFIG_FOLDER = path.join(os.homedir(), ".config", "q"); // /home/user/.config/q/

const CONFIG_PATH = path.join(CONFIG_FOLDER, "config.json");

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
