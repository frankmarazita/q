import { describe, it, expect } from "bun:test";
import { 
  parseMCPConfigText, 
  getMCPConfigParseError 
} from "../../../lib/mcp/parsing";

describe("parseMCPConfigText", () => {
  it("should parse valid JSON text", () => {
    const text = '{"servers": {}}';
    const result = parseMCPConfigText(text);
    
    expect(result).not.toBeNull();
    expect(result?.servers).toEqual({});
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
    
    expect(result).not.toBeNull();
    expect(result?.servers["test-server"]?.type).toBe("sse");
  });

  it("should return null for invalid JSON", () => {
    const text = '{"servers": {}'; // Missing closing brace
    const result = parseMCPConfigText(text);
    
    expect(result).toBeNull();
  });

  it("should return null for valid JSON but invalid config", () => {
    const text = '{"invalidField": "value"}';
    const result = parseMCPConfigText(text);
    
    expect(result).toBeNull();
  });
});


describe("getMCPConfigParseError", () => {
  it("should return null for valid config text", () => {
    const text = '{"servers": {}}';
    const result = getMCPConfigParseError(text);
    
    expect(result).toBeNull();
  });

  it("should return error message for invalid JSON", () => {
    const text = '{"servers": {}'; // Missing closing brace
    const result = getMCPConfigParseError(text);
    
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  it("should return error message for valid JSON but invalid config", () => {
    const text = '{"invalidField": "value"}';
    const result = getMCPConfigParseError(text);
    
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });
});