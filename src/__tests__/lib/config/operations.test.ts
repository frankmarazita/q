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
      token: "old-token",
      promptDirectory: "/old/path",
    };
    
    const updates: ConfigUpdate = {
      token: "new-token",
      model: { 
        id: "gpt-4", 
        name: "GPT-4", 
        vendor: "openai", 
        version: "1.0",
        capabilities: {
          limits: { max_output_tokens: 4096, max_prompt_tokens: 8192 },
          supports: { parallel_tool_calls: true, streaming: true, structured_outputs: true, tool_calls: true, vision: true }
        }
      },
    };
    
    const result = mergeConfigUpdates(currentConfig, updates);
    
    expect(result.token).toBe("new-token");
    expect(result.promptDirectory).toBe("/old/path");
    expect(result.model?.id).toBe("gpt-4");
  });

  it("should handle empty updates", () => {
    const currentConfig: Config = {
      token: "test-token",
      promptDirectory: "/path",
    };
    
    const updates: ConfigUpdate = {};
    
    const result = mergeConfigUpdates(currentConfig, updates);
    
    expect(result).toEqual(currentConfig);
  });
});

describe("createDefaultConfig", () => {
  it("should create default config with empty token", () => {
    const result = createDefaultConfig();
    
    expect(result.token).toBe("");
    expect(result.copilotToken).toBeUndefined();
    expect(result.model).toBeUndefined();
    expect(result.promptDirectory).toBeUndefined();
  });
});

describe("serializeConfig", () => {
  it("should serialize config to JSON string", () => {
    const config: Config = {
      token: "test-token",
      promptDirectory: "/path/to/prompts",
    };
    
    const result = serializeConfig(config);
    
    expect(typeof result).toBe("string");
    expect(result).toContain("test-token");
    expect(result).toContain("/path/to/prompts");
    
    // Should be parseable
    const parsed = JSON.parse(result);
    expect(parsed.token).toBe("test-token");
  });
});

