import { describe, it, expect } from "bun:test";
import { 
  parseMCPConfigText, 
  parseMCPConfigJson, 
  serializeMCPConfig, 
  getMCPConfigParseError 
} from "../../../lib/mcp/parsing";
import type { MCPConfig } from "../../../lib/mcp/types";

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

describe("parseMCPConfigJson", () => {
  it("should parse valid JSON string", () => {
    const jsonString = '{"servers": {}}';
    const result = parseMCPConfigJson(jsonString);
    
    expect(result).not.toBeNull();
    expect(result?.servers).toEqual({});
  });

  it("should return null for invalid JSON", () => {
    const jsonString = '{"servers": {}'; // Missing closing brace
    const result = parseMCPConfigJson(jsonString);
    
    expect(result).toBeNull();
  });

  it("should return null for valid JSON but invalid config", () => {
    const jsonString = '{"invalidField": "value"}';
    const result = parseMCPConfigJson(jsonString);
    
    expect(result).toBeNull();
  });
});

describe("serializeMCPConfig", () => {
  it("should serialize MCP config to JSON string", () => {
    const config: MCPConfig = {
      servers: {
        "test-server": {
          type: "sse",
          url: "https://example.com/sse",
        },
      },
    };
    
    const result = serializeMCPConfig(config);
    
    expect(typeof result).toBe("string");
    expect(result).toContain("test-server");
    expect(result).toContain("sse");
    expect(result).toContain("https://example.com/sse");
    
    // Should be parseable
    const parsed = JSON.parse(result);
    expect(parsed.servers["test-server"].type).toBe("sse");
  });

  it("should serialize empty config", () => {
    const config: MCPConfig = {
      servers: {},
    };
    
    const result = serializeMCPConfig(config);
    
    expect(typeof result).toBe("string");
    
    const parsed = JSON.parse(result);
    expect(parsed.servers).toEqual({});
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