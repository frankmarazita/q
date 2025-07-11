import { describe, it, expect } from "bun:test";
import { 
  parseCompletionChunk, 
  isCompletionDone, 
  extractContentFromChunk, 
  extractToolCallsFromChunk, 
  parseToolCallArguments 
} from "../../../lib/completions/parsing";
import type { CompletionChunk } from "../../../lib/completions/types";

describe("parseCompletionChunk", () => {
  it("should parse valid JSON", () => {
    const jsonString = '{"choices":[{"delta":{"content":"Hello"}}]}';
    const result = parseCompletionChunk(jsonString);
    
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.choices[0]?.delta.content).toBe("Hello");
    }
  });

  it("should return error for invalid JSON", () => {
    const jsonString = '{"choices":[{"delta":{"content":"Hello"}'; // Missing closing brackets
    const result = parseCompletionChunk(jsonString);
    
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(typeof result.message).toBe("string");
    }
  });
});

describe("isCompletionDone", () => {
  it("should return true for DONE signal", () => {
    expect(isCompletionDone("[DONE]")).toBe(true);
  });

  it("should return false for other strings", () => {
    expect(isCompletionDone("not done")).toBe(false);
    expect(isCompletionDone("")).toBe(false);
  });
});

describe("extractContentFromChunk", () => {
  it("should extract content from chunk", () => {
    const chunk: CompletionChunk = {
      choices: [{
        delta: {
          content: "Hello world"
        }
      }]
    };

    const result = extractContentFromChunk(chunk);
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data).toBe("Hello world");
    }
  });

  it("should return error when no content", () => {
    const chunk: CompletionChunk = {
      choices: [{
        delta: {}
      }]
    };

    const result = extractContentFromChunk(chunk);
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(typeof result.message).toBe("string");
    }
  });

  it("should return error when no choices", () => {
    const chunk: CompletionChunk = {
      choices: []
    };

    const result = extractContentFromChunk(chunk);
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(typeof result.message).toBe("string");
    }
  });
});

describe("extractToolCallsFromChunk", () => {
  it("should extract function tool calls", () => {
    const chunk: CompletionChunk = {
      choices: [{
        delta: {
          tool_calls: [
            { type: "function", function: { name: "test_function" } },
            { type: "other", function: { name: "other_function" } }
          ]
        }
      }]
    };

    const result = extractToolCallsFromChunk(chunk);
    
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("function");
    expect(result[0].function.name).toBe("test_function");
  });

  it("should return empty array when no tool calls", () => {
    const chunk: CompletionChunk = {
      choices: [{
        delta: {}
      }]
    };

    const result = extractToolCallsFromChunk(chunk);
    expect(result).toHaveLength(0);
  });
});

describe("parseToolCallArguments", () => {
  it("should parse valid JSON arguments", () => {
    const argsString = '{"param1":"value1","param2":42}';
    const result = parseToolCallArguments(argsString);
    
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data).toEqual({ param1: "value1", param2: 42 });
    }
  });

  it("should return error for invalid JSON", () => {
    const argsString = '{"param1":"value1"'; // Invalid JSON
    const result = parseToolCallArguments(argsString);
    
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(typeof result.message).toBe("string");
    }
  });
});