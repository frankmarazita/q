import type { Config, ConfigUpdate } from "./types";

export function mergeConfigUpdates(
  currentConfig: Config,
  updates: ConfigUpdate
): Config {
  return {
    ...currentConfig,
    ...updates,
  };
}

export function createDefaultConfig(): Config {
  return {
    token: "",
  };
}

export function serializeConfig(config: Config): string {
  return JSON.stringify(config, null, 2);
}
