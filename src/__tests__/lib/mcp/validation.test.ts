import { describe, it, expect } from "bun:test";
import { 
  validateMCPConfig, 
  validateServerConfig, 
  getMCPConfigValidationError, 
  isValidMCPConfigJson 
} from "../../../lib/mcp/validation";
import type { MCPConfig, ServerConfig } from "../../../lib/mcp/types";

describe("validateMCPConfig", () => {
  it("should validate minimal MCP config", () => {
    const config = {
      servers: {},
    };
    
    const result = validateMCPConfig(config);
    
    expect(result).not.toBeNull();
    expect(result?.servers).toEqual({});
  });

  it("should validate MCP config with SSE server", () => {
    const config = {
      servers: {
        "test-server": {
          type: "sse",
          url: "https://example.com/sse",
          headers: {
            "Authorization": "Bearer token",
          },
        },
      },
    };
    
    const result = validateMCPConfig(config);
    
    expect(result).not.toBeNull();
    expect(result?.servers["test-server"]?.type).toBe("sse");
    if (result?.servers["test-server"]?.type === "sse") {
      expect(result.servers["test-server"].url).toBe("https://example.com/sse");
    }
  });

  it("should validate MCP config with HTTP server", () => {
    const config = {
      servers: {
        "http-server": {
          type: "http",
          url: "https://api.example.com",
        },
      },
    };
    
    const result = validateMCPConfig(config);
    
    expect(result).not.toBeNull();
    expect(result?.servers["http-server"]?.type).toBe("http");
  });

  it("should validate MCP config with stdio server", () => {
    const config = {
      servers: {
        "stdio-server": {
          type: "stdio",
          command: "python",
          args: ["script.py", "--arg1", "value1"],
        },
      },
    };
    
    const result = validateMCPConfig(config);
    
    expect(result).not.toBeNull();
    expect(result?.servers["stdio-server"]?.type).toBe("stdio");
    if (result?.servers["stdio-server"]?.type === "stdio") {
      expect(result.servers["stdio-server"].command).toBe("python");
    }
  });

  it("should return null for invalid config", () => {
    const config = {
      invalidField: "value",
    };
    
    const result = validateMCPConfig(config);
    
    expect(result).toBeNull();
  });

  it("should return null for config with invalid server", () => {
    const config = {
      servers: {
        "invalid-server": {
          type: "invalid",
          url: "not-a-url",
        },
      },
    };
    
    const result = validateMCPConfig(config);
    
    expect(result).toBeNull();
  });
});

describe("validateServerConfig", () => {
  it("should validate SSE server config", () => {
    const serverConfig = {
      type: "sse",
      url: "https://example.com/sse",
      headers: {
        "Authorization": "Bearer token",
      },
    };
    
    const result = validateServerConfig(serverConfig);
    
    expect(result).not.toBeNull();
    expect(result?.type).toBe("sse");
    if (result?.type === "sse") {
      expect(result.url).toBe("https://example.com/sse");
    }
  });

  it("should validate HTTP server config", () => {
    const serverConfig = {
      type: "http",
      url: "https://api.example.com",
    };
    
    const result = validateServerConfig(serverConfig);
    
    expect(result).not.toBeNull();
    expect(result?.type).toBe("http");
  });

  it("should validate stdio server config", () => {
    const serverConfig = {
      type: "stdio",
      command: "python",
      args: ["script.py"],
    };
    
    const result = validateServerConfig(serverConfig);
    
    expect(result).not.toBeNull();
    expect(result?.type).toBe("stdio");
    if (result?.type === "stdio") {
      expect(result.command).toBe("python");
    }
  });

  it("should return null for invalid server config", () => {
    const serverConfig = {
      type: "invalid",
      url: "not-a-url",
    };
    
    const result = validateServerConfig(serverConfig);
    
    expect(result).toBeNull();
  });
});

describe("getMCPConfigValidationError", () => {
  it("should return null for valid config", () => {
    const config = {
      servers: {},
    };
    
    const result = getMCPConfigValidationError(config);
    
    expect(result).toBeNull();
  });

  it("should return error message for invalid config", () => {
    const config = {
      invalidField: "value",
    };
    
    const result = getMCPConfigValidationError(config);
    
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });
});

describe("isValidMCPConfigJson", () => {
  it("should return true for valid JSON config", () => {
    const jsonString = '{"servers": {}}';
    
    const result = isValidMCPConfigJson(jsonString);
    
    expect(result).toBe(true);
  });

  it("should return false for invalid JSON", () => {
    const jsonString = '{"servers": {}'; // Missing closing brace
    
    const result = isValidMCPConfigJson(jsonString);
    
    expect(result).toBe(false);
  });

  it("should return false for valid JSON but invalid config", () => {
    const jsonString = '{"invalidField": "value"}';
    
    const result = isValidMCPConfigJson(jsonString);
    
    expect(result).toBe(false);
  });
});