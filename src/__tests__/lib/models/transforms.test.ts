import { describe, it, expect } from "bun:test";
import { transformModel, transformModels } from "../../../lib/models/transforms";
import type { Model } from "../../../lib/models/types";

describe("transformModel", () => {
  it("should transform a model object with all capabilities", () => {
    const inputModel: Model = {
      id: "gpt-4",
      name: "GPT-4",
      vendor: "openai",
      version: "1.0",
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
          vision: true,
        },
      },
    };

    const result = transformModel(inputModel);

    expect(result).toEqual({
      id: "gpt-4",
      name: "GPT-4",
      vendor: "openai",
      version: "1.0",
      capabilities_limits_max_output_tokens: 4096,
      capabilities_limits_max_prompt_tokens: 8192,
      parallel_tool_calls: true,
      streaming: true,
      structured_outputs: true,
      tool_calls: true,
      vision: true,
    });
  });

  it("should transform a model with disabled capabilities", () => {
    const inputModel: Model = {
      id: "basic-model",
      name: "Basic Model",
      vendor: "test",
      version: "1.0",
      capabilities: {
        limits: {
          max_output_tokens: 1000,
          max_prompt_tokens: 2000,
        },
        supports: {
          parallel_tool_calls: false,
          streaming: false,
          structured_outputs: false,
          tool_calls: false,
          vision: false,
        },
      },
    };

    const result = transformModel(inputModel);

    expect(result.parallel_tool_calls).toBe(false);
    expect(result.streaming).toBe(false);
    expect(result.vision).toBe(false);
    expect(result.capabilities_limits_max_output_tokens).toBe(1000);
    expect(result.capabilities_limits_max_prompt_tokens).toBe(2000);
  });
});

describe("transformModels", () => {
  it("should transform an array of models", () => {
    const inputModels: Model[] = [
      {
        id: "model1",
        name: "Model 1",
        vendor: "vendor1",
        version: "1.0",
        capabilities: {
          limits: { max_output_tokens: 1000, max_prompt_tokens: 2000 },
          supports: { parallel_tool_calls: true, streaming: true, structured_outputs: false, tool_calls: true, vision: false },
        },
      },
      {
        id: "model2",
        name: "Model 2",
        vendor: "vendor2",
        version: "2.0",
        capabilities: {
          limits: { max_output_tokens: 2000, max_prompt_tokens: 4000 },
          supports: { parallel_tool_calls: false, streaming: false, structured_outputs: true, tool_calls: false, vision: true },
        },
      },
    ];

    const result = transformModels(inputModels);

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe("model1");
    expect(result[0]?.parallel_tool_calls).toBe(true);
    expect(result[1]?.id).toBe("model2");
    expect(result[1]?.vision).toBe(true);
  });

  it("should return empty array when given empty array", () => {
    const result = transformModels([]);
    expect(result).toHaveLength(0);
    expect(Array.isArray(result)).toBe(true);
  });
});