import type { Config, ConfigUpdate } from "./types";

export function mergeConfigUpdates(currentConfig: Config, updates: ConfigUpdate): Config {
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

export function isCopilotTokenExpired(config: Config): boolean {
  if (!config.copilotToken) {
    return true;
  }
  
  return Date.now() >= config.copilotToken.expiresAt;
}

export function hasValidToken(config: Config): boolean {
  return config.token.length > 0;
}

export function hasValidCopilotToken(config: Config): boolean {
  return config.copilotToken !== undefined && !isCopilotTokenExpired(config);
}