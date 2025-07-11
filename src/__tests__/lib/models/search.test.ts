import { describe, it, expect } from "bun:test";
import { findModelByIdOrName, findModelsByVendor, findModelsWithCapability } from "../../../lib/models/search";
import type { Model } from "../../../lib/models/types";

describe("findModelByIdOrName", () => {
  const testModels: Model[] = [
    {
      id: "gpt-4",
      name: "GPT-4",
      vendor: "openai",
      version: "1.0",
      capabilities: {
        limits: { max_output_tokens: 4096, max_prompt_tokens: 8192 },
        supports: { parallel_tool_calls: true, streaming: true, structured_outputs: true, tool_calls: true, vision: true },
      },
    },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      vendor: "openai",
      version: "1.0",
      capabilities: {
        limits: { max_output_tokens: 2048, max_prompt_tokens: 4096 },
        supports: { parallel_tool_calls: false, streaming: true, structured_outputs: false, tool_calls: true, vision: false },
      },
    },
    {
      id: "claude-3",
      name: "Claude 3",
      vendor: "anthropic",
      version: "1.0",
      capabilities: {
        limits: { max_output_tokens: 8192, max_prompt_tokens: 16384 },
        supports: { parallel_tool_calls: true, streaming: true, structured_outputs: true, tool_calls: true, vision: true },
      },
    },
  ];

  it("should find model by exact ID match", () => {
    const result = findModelByIdOrName(testModels, "gpt-4");
    
    expect(result).toBeDefined();
    expect(result?.id).toBe("gpt-4");
    expect(result?.name).toBe("GPT-4");
  });

  it("should find model by exact name match", () => {
    const result = findModelByIdOrName(testModels, "GPT-4");
    
    expect(result).toBeDefined();
    expect(result?.id).toBe("gpt-4");
    expect(result?.name).toBe("GPT-4");
  });

  it("should return undefined for non-existent model", () => {
    const result = findModelByIdOrName(testModels, "non-existent-model");
    expect(result).toBeUndefined();
  });

  it("should handle empty models array", () => {
    const result = findModelByIdOrName([], "gpt-4");
    expect(result).toBeUndefined();
  });
});

describe("findModelsByVendor", () => {
  const testModels: Model[] = [
    {
      id: "gpt-4",
      name: "GPT-4",
      vendor: "openai",
      version: "1.0",
      capabilities: {
        limits: { max_output_tokens: 4096, max_prompt_tokens: 8192 },
        supports: { parallel_tool_calls: true, streaming: true, structured_outputs: true, tool_calls: true, vision: true },
      },
    },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      vendor: "openai",
      version: "1.0",
      capabilities: {
        limits: { max_output_tokens: 2048, max_prompt_tokens: 4096 },
        supports: { parallel_tool_calls: false, streaming: true, structured_outputs: false, tool_calls: true, vision: false },
      },
    },
    {
      id: "claude-3",
      name: "Claude 3",
      vendor: "anthropic",
      version: "1.0",
      capabilities: {
        limits: { max_output_tokens: 8192, max_prompt_tokens: 16384 },
        supports: { parallel_tool_calls: true, streaming: true, structured_outputs: true, tool_calls: true, vision: true },
      },
    },
  ];

  it("should find models by vendor", () => {
    const result = findModelsByVendor(testModels, "openai");
    
    expect(result).toHaveLength(2);
    expect(result[0]?.vendor).toBe("openai");
    expect(result[1]?.vendor).toBe("openai");
  });

  it("should return empty array for non-existent vendor", () => {
    const result = findModelsByVendor(testModels, "non-existent-vendor");
    expect(result).toHaveLength(0);
  });
});

describe("findModelsWithCapability", () => {
  const testModels: Model[] = [
    {
      id: "gpt-4",
      name: "GPT-4",
      vendor: "openai",
      version: "1.0",
      capabilities: {
        limits: { max_output_tokens: 4096, max_prompt_tokens: 8192 },
        supports: { parallel_tool_calls: true, streaming: true, structured_outputs: true, tool_calls: true, vision: true },
      },
    },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      vendor: "openai",
      version: "1.0",
      capabilities: {
        limits: { max_output_tokens: 2048, max_prompt_tokens: 4096 },
        supports: { parallel_tool_calls: false, streaming: true, structured_outputs: false, tool_calls: true, vision: false },
      },
    },
  ];

  it("should find models with specific capability", () => {
    const result = findModelsWithCapability(testModels, "vision");
    
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("gpt-4");
  });

  it("should return empty array when no models have capability", () => {
    const basicModels: Model[] = [
      {
        id: "basic-model",
        name: "Basic Model",
        vendor: "test",
        version: "1.0",
        capabilities: {
          limits: { max_output_tokens: 1000, max_prompt_tokens: 2000 },
          supports: { parallel_tool_calls: false, streaming: false, structured_outputs: false, tool_calls: false, vision: false },
        },
      },
    ];

    const result = findModelsWithCapability(basicModels, "vision");
    expect(result).toHaveLength(0);
  });
});