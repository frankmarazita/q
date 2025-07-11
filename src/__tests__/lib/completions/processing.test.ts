import { describe, it, expect } from "bun:test";
import { processStreamChunk } from "../../../lib/completions/processing";

describe("processStreamChunk", () => {
  it("should process content chunk", () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hello"}}]}';
    const { events, newPartialJsonString } = processStreamChunk(chunk, "");
    
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("content");
    expect(events[0]?.data).toBe("Hello");
    expect(newPartialJsonString).toBe("");
  });

  it("should handle DONE signal", () => {
    const chunk = 'data: [DONE]';
    const { events, newPartialJsonString } = processStreamChunk(chunk, "");
    
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("done");
    expect(newPartialJsonString).toBe("");
  });

  it("should handle partial JSON", () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hel';
    const { events, newPartialJsonString } = processStreamChunk(chunk, "");
    
    expect(events).toHaveLength(0);
    expect(newPartialJsonString).toBe('{"choices":[{"delta":{"content":"Hel');
  });

  it("should complete partial JSON from previous chunk", () => {
    const partialJsonString = '{"choices":[{"delta":{"content":"Hel';
    const chunk = 'lo"}}]}';
    const { events, newPartialJsonString } = processStreamChunk(chunk, partialJsonString);
    
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("content");
    expect(events[0]?.data).toBe("Hello");
    expect(newPartialJsonString).toBe("");
  });

  it("should handle multiple lines in one chunk", () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: {"choices":[{"delta":{"content":" world"}}]}';
    const { events, newPartialJsonString } = processStreamChunk(chunk, "");
    
    expect(events).toHaveLength(2);
    expect(events[0]?.type).toBe("content");
    expect(events[0]?.data).toBe("Hello");
    expect(events[1]?.type).toBe("content");
    expect(events[1]?.data).toBe(" world");
  });

  it("should handle tool call chunks", () => {
    const chunk = 'data: {"choices":[{"delta":{"tool_calls":[{"type":"function","function":{"name":"test"}}]}}]}';
    const { events, newPartialJsonString } = processStreamChunk(chunk, "");
    
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("tool-call");
    expect((events[0]?.toolCall as any)?.type).toBe("function");
  });

  it("should handle chunks with whitespace", () => {
    const chunk = 'data: {"choices":[{"delta":{"content":"Hello"}}]}';
    const { events, newPartialJsonString } = processStreamChunk(chunk, "");
    
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("content");
    expect(events[0]?.data).toBe("Hello");
  });
});