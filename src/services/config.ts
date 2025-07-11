import os from "node:os";
import path from "node:path";
import type { Config, ConfigUpdate } from "../lib/config/types";
import {
  validateConfig,
  getConfigValidationError,
} from "../lib/config/validation";
import {
  mergeConfigUpdates,
  createDefaultConfig,
  serializeConfig,
} from "../lib/config/operations";

export const CONFIG_FOLDER = path.join(os.homedir(), ".config", "q"); // /home/user/.config/q/

const CONFIG_PATH = path.join(CONFIG_FOLDER, "config.json");

export async function saveConfig(config: Config): Promise<Config> {
  const fileContent = serializeConfig(config);
  await Bun.write(CONFIG_PATH, fileContent);

  return JSON.parse(fileContent) as Config;
}

export async function loadConfig(): Promise<Config> {
  const file = Bun.file(CONFIG_PATH);

  const fileExists = await file.exists();

  if (!fileExists) {
    return await saveConfig(createDefaultConfig());
  }

  const text = await file.text();
  const parsed = JSON.parse(text);
  const config = validateConfig(parsed);

  if (!config) {
    const error = getConfigValidationError(parsed);
    throw new Error(`Invalid config file: ${error}`);
  }

  return config;
}

export async function updateConfig(updates: ConfigUpdate): Promise<Config> {
  const currentConfig = await loadConfig();
  const newConfig = mergeConfigUpdates(currentConfig, updates);
  return await saveConfig(newConfig);
}
