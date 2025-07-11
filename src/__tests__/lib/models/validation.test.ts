import { describe, it, expect } from "bun:test";
import {
  validateModelExists,
  validateConfigHasModel,
} from "../../../lib/models/validation";
import type { Model } from "../../../lib/models/types";

describe("validateModelExists", () => {
  it("should return success response when model exists", () => {
    const model: Model = {
      id: "gpt-4",
      name: "GPT-4",
      vendor: "openai",
      version: "1.0",
      capabilities: {
        limits: { max_output_tokens: 4096, max_prompt_tokens: 8192 },
        supports: {
          parallel_tool_calls: true,
          streaming: true,
          structured_outputs: true,
          tool_calls: true,
          vision: true,
        },
      },
    };

    const result = validateModelExists(model, "gpt-4");

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data).toEqual(model);
    }
  });

  it("should return error response when model is undefined", () => {
    const result = validateModelExists(undefined, "non-existent-model");

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe(
        'Model "non-existent-model" is not available.'
      );
    }
  });

  it("should include model name in error message", () => {
    const result = validateModelExists(undefined, "specific-model-name");

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe(
        'Model "specific-model-name" is not available.'
      );
    }
  });
});

describe("validateConfigHasModel", () => {
  it("should return success response when config has model", () => {
    const model: Model = {
      id: "gpt-4",
      name: "GPT-4",
      vendor: "openai",
      version: "1.0",
      capabilities: {
        limits: { max_output_tokens: 4096, max_prompt_tokens: 8192 },
        supports: {
          parallel_tool_calls: true,
          streaming: true,
          structured_outputs: true,
          tool_calls: true,
          vision: true,
        },
      },
    };

    const config = { model };
    const result = validateConfigHasModel(config);

    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data).toEqual(model);
    }
  });

  it("should return error response when config has no model", () => {
    const config = {};
    const result = validateConfigHasModel(config);

    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(result.message).toBe("No default model set.");
    }
  });
});
