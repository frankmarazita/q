import { describe, it, expect } from "bun:test";
import { validateConfig } from "../../../lib/config/validation";

describe("validateConfig", () => {
  it("should validate minimal config", () => {
    const config = { token: "test-token" };
    const result = validateConfig(config);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.token).toBe("test-token");
    }
  });

  it("should validate config with all fields", () => {
    const config = {
      token: "test-token",
      copilotToken: {
        token: "copilot-token",
        expiresAt: 1234567890,
      },
      model: {
        id: "gpt-4",
        name: "GPT-4",
        vendor: "openai",
        version: "1.0.0",
        capabilities: {
          limits: {
            max_output_tokens: 4096,
            max_prompt_tokens: 8192,
          },
          supports: {
            parallel_tool_calls: true,
            streaming: true,
            structured_outputs: true,
            tool_calls: true,
            vision: false,
          },
        },
      },
      promptDirectory: "/path/to/prompts",
    };

    const result = validateConfig(config);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.token).toBe("test-token");
      expect(result.data.copilotToken?.token).toBe("copilot-token");
      expect(result.data.promptDirectory).toBe("/path/to/prompts");
    }
  });

  it("should return error for invalid config", () => {
    const config = { invalidField: "value" };
    const result = validateConfig(config);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(typeof result.message).toBe("string");
    }
  });

  it("should return error for missing token", () => {
    const config = { copilotToken: { token: "test", expiresAt: 123 } };
    const result = validateConfig(config);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(typeof result.message).toBe("string");
    }
  });
});
