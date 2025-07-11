import { describe, it, expect } from "bun:test";
import { validateConfig, isValidConfigJson, getConfigValidationError } from "../../../lib/config/validation";

describe("validateConfig", () => {
  it("should validate minimal config", () => {
    const config = { token: "test-token" };
    const result = validateConfig(config);
    
    expect(result).not.toBeNull();
    expect(result?.token).toBe("test-token");
  });

  it("should validate config with all fields", () => {
    const config = {
      token: "test-token",
      copilotToken: {
        token: "copilot-token",
        expiresAt: 1234567890,
      },
      model: { id: "gpt-4", name: "GPT-4", vendor: "openai" },
      promptDirectory: "/path/to/prompts",
    };
    
    const result = validateConfig(config);
    
    expect(result).not.toBeNull();
    expect(result?.token).toBe("test-token");
    expect(result?.copilotToken?.token).toBe("copilot-token");
    expect(result?.promptDirectory).toBe("/path/to/prompts");
  });

  it("should return null for invalid config", () => {
    const config = { invalidField: "value" };
    const result = validateConfig(config);
    
    expect(result).toBeNull();
  });

  it("should return null for missing token", () => {
    const config = { copilotToken: { token: "test", expiresAt: 123 } };
    const result = validateConfig(config);
    
    expect(result).toBeNull();
  });
});

describe("isValidConfigJson", () => {
  it("should return true for valid JSON config", () => {
    const jsonString = '{"token": "test-token"}';
    const result = isValidConfigJson(jsonString);
    
    expect(result).toBe(true);
  });

  it("should return false for invalid JSON", () => {
    const jsonString = '{"token": "test-token"'; // Missing closing brace
    const result = isValidConfigJson(jsonString);
    
    expect(result).toBe(false);
  });

  it("should return false for valid JSON but invalid config", () => {
    const jsonString = '{"invalidField": "value"}';
    const result = isValidConfigJson(jsonString);
    
    expect(result).toBe(false);
  });
});

describe("getConfigValidationError", () => {
  it("should return null for valid config", () => {
    const config = { token: "test-token" };
    const result = getConfigValidationError(config);
    
    expect(result).toBeNull();
  });

  it("should return error message for invalid config", () => {
    const config = { invalidField: "value" };
    const result = getConfigValidationError(config);
    
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });
});