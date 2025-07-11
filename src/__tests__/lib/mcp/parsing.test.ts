import { describe, it, expect } from "bun:test";
import { 
  parseMCPConfigText
} from "../../../lib/mcp/parsing";

describe("parseMCPConfigText", () => {
  it("should parse valid JSON text", () => {
    const text = '{"servers": {}}';
    const result = parseMCPConfigText(text);
    
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.servers).toEqual({});
    }
  });

  it("should parse valid JSONC text with comments", () => {
    const text = `{
      // This is a comment
      "servers": {
        "test-server": {
          "type": "sse",
          "url": "https://example.com"
        }
      }
    }`;
    
    const result = parseMCPConfigText(text);
    
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.data.servers["test-server"]?.type).toBe("sse");
    }
  });

  it("should return error for invalid JSON", () => {
    const text = '{"servers": {}'; // Missing closing brace
    const result = parseMCPConfigText(text);
    
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(typeof result.message).toBe("string");
    }
  });

  it("should return error for valid JSON but invalid config", () => {
    const text = '{"invalidField": "value"}';
    const result = parseMCPConfigText(text);
    
    expect(result.status).toBe("error");
    if (result.status === "error") {
      expect(typeof result.message).toBe("string");
    }
  });
});
