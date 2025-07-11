import { describe, it, expect } from "bun:test";
import {
  mergeConfigUpdates,
  createDefaultConfig,
  serializeConfig,
} from "../../../lib/config/operations";
import type { Config, ConfigUpdate } from "../../../lib/config/types";

describe("mergeConfigUpdates", () => {
  it("should merge updates into current config", () => {
    const currentConfig: Config = {
      token: "current-token",
      promptDirectory: "/current/prompts",
    };

    const updates: ConfigUpdate = {
      token: "new-token",
      defaultPrompt: "helpful-assistant",
    };

    const result = mergeConfigUpdates(currentConfig, updates);

    expect(result.token).toBe("new-token");
    expect(result.promptDirectory).toBe("/current/prompts");
    expect(result.defaultPrompt).toBe("helpful-assistant");
  });

  it("should handle empty updates", () => {
    const currentConfig: Config = {
      token: "current-token",
      promptDirectory: "/current/prompts",
      defaultPrompt: "existing-prompt",
    };

    const updates: ConfigUpdate = {};

    const result = mergeConfigUpdates(currentConfig, updates);

    expect(result.token).toBe("current-token");
    expect(result.promptDirectory).toBe("/current/prompts");
    expect(result.defaultPrompt).toBe("existing-prompt");
  });

  it("should handle defaultPrompt updates", () => {
    const currentConfig: Config = {
      token: "current-token",
    };

    const updates: ConfigUpdate = {
      defaultPrompt: "new-default-prompt",
    };

    const result = mergeConfigUpdates(currentConfig, updates);

    expect(result.token).toBe("current-token");
    expect(result.defaultPrompt).toBe("new-default-prompt");
  });

  it("should handle clearing defaultPrompt", () => {
    const currentConfig: Config = {
      token: "current-token",
      defaultPrompt: "existing-prompt",
    };

    const updates: ConfigUpdate = {
      defaultPrompt: undefined,
    };

    const result = mergeConfigUpdates(currentConfig, updates);

    expect(result.token).toBe("current-token");
    expect(result.defaultPrompt).toBeUndefined();
  });
});

describe("createDefaultConfig", () => {
  it("should create default config with empty token", () => {
    const result = createDefaultConfig();

    expect(result.token).toBe("");
    expect(result.promptDirectory).toBeUndefined();
    expect(result.defaultPrompt).toBeUndefined();
  });
});

describe("serializeConfig", () => {
  it("should serialize config to JSON string", () => {
    const config: Config = {
      token: "test-token",
      promptDirectory: "/test/prompts",
      defaultPrompt: "test-prompt",
    };

    const result = serializeConfig(config);
    const parsed = JSON.parse(result);

    expect(parsed.token).toBe("test-token");
    expect(parsed.promptDirectory).toBe("/test/prompts");
    expect(parsed.defaultPrompt).toBe("test-prompt");
  });

  it("should handle config with undefined optional fields", () => {
    const config: Config = {
      token: "test-token",
    };

    const result = serializeConfig(config);
    const parsed = JSON.parse(result);

    expect(parsed.token).toBe("test-token");
    expect(parsed.promptDirectory).toBeUndefined();
    expect(parsed.defaultPrompt).toBeUndefined();
  });
});
