import { describe, it, expect } from "bun:test";
import {
  getServerNames,
  getServerConfig,
  hasServer,
  getServersByType,
  isServerURLValid,
  getServerCount,
  createEmptyMCPConfig,
  addServer,
  removeServer,
} from "../../../lib/mcp/operations";
import type { MCPConfig, ServerConfig } from "../../../lib/mcp/types";

describe("getServerNames", () => {
  it("should return server names", () => {
    const config: MCPConfig = {
      servers: {
        "server1": {
          type: "sse",
          url: "https://example.com/sse",
        },
        "server2": {
          type: "http",
          url: "https://api.example.com",
        },
      },
    };
    
    const result = getServerNames(config);
    
    expect(result).toHaveLength(2);
    expect(result).toContain("server1");
    expect(result).toContain("server2");
  });

  it("should return empty array for empty config", () => {
    const config: MCPConfig = {
      servers: {},
    };
    
    const result = getServerNames(config);
    
    expect(result).toHaveLength(0);
  });
});

describe("getServerConfig", () => {
  it("should return server config by name", () => {
    const config: MCPConfig = {
      servers: {
        "test-server": {
          type: "sse",
          url: "https://example.com/sse",
        },
      },
    };
    
    const result = getServerConfig(config, "test-server");
    
    expect(result).not.toBeNull();
    expect(result?.type).toBe("sse");
    if (result?.type === "sse") {
      expect(result.url).toBe("https://example.com/sse");
    }
  });

  it("should return null for non-existent server", () => {
    const config: MCPConfig = {
      servers: {},
    };
    
    const result = getServerConfig(config, "non-existent");
    
    expect(result).toBeNull();
  });
});

describe("hasServer", () => {
  it("should return true for existing server", () => {
    const config: MCPConfig = {
      servers: {
        "test-server": {
          type: "sse",
          url: "https://example.com/sse",
        },
      },
    };
    
    const result = hasServer(config, "test-server");
    
    expect(result).toBe(true);
  });

  it("should return false for non-existent server", () => {
    const config: MCPConfig = {
      servers: {},
    };
    
    const result = hasServer(config, "non-existent");
    
    expect(result).toBe(false);
  });
});

describe("getServersByType", () => {
  it("should return servers by type", () => {
    const config: MCPConfig = {
      servers: {
        "sse-server": {
          type: "sse",
          url: "https://example.com/sse",
        },
        "http-server": {
          type: "http",
          url: "https://api.example.com",
        },
        "stdio-server": {
          type: "stdio",
          command: "python",
        },
      },
    };
    
    const sseServers = getServersByType(config, "sse");
    const httpServers = getServersByType(config, "http");
    const stdioServers = getServersByType(config, "stdio");
    
    expect(Object.keys(sseServers)).toHaveLength(1);
    expect(sseServers["sse-server"]?.type).toBe("sse");
    
    expect(Object.keys(httpServers)).toHaveLength(1);
    expect(httpServers["http-server"]?.type).toBe("http");
    
    expect(Object.keys(stdioServers)).toHaveLength(1);
    expect(stdioServers["stdio-server"]?.type).toBe("stdio");
  });

  it("should return empty object when no servers of type exist", () => {
    const config: MCPConfig = {
      servers: {
        "sse-server": {
          type: "sse",
          url: "https://example.com/sse",
        },
      },
    };
    
    const result = getServersByType(config, "http");
    
    expect(Object.keys(result)).toHaveLength(0);
  });
});

describe("isServerURLValid", () => {
  it("should return true for valid URLs", () => {
    expect(isServerURLValid("https://example.com")).toBe(true);
    expect(isServerURLValid("http://localhost:3000")).toBe(true);
    expect(isServerURLValid("https://api.example.com/path")).toBe(true);
  });

  it("should return false for invalid URLs", () => {
    expect(isServerURLValid("not-a-url")).toBe(false);
    expect(isServerURLValid("")).toBe(false);
    expect(isServerURLValid("://invalid")).toBe(false);
  });
});

describe("getServerCount", () => {
  it("should return server count", () => {
    const config: MCPConfig = {
      servers: {
        "server1": {
          type: "sse",
          url: "https://example.com/sse",
        },
        "server2": {
          type: "http",
          url: "https://api.example.com",
        },
      },
    };
    
    const result = getServerCount(config);
    
    expect(result).toBe(2);
  });

  it("should return 0 for empty config", () => {
    const config: MCPConfig = {
      servers: {},
    };
    
    const result = getServerCount(config);
    
    expect(result).toBe(0);
  });
});

describe("createEmptyMCPConfig", () => {
  it("should create empty MCP config", () => {
    const result = createEmptyMCPConfig();
    
    expect(result.servers).toEqual({});
    expect(Object.keys(result.servers)).toHaveLength(0);
  });
});

describe("addServer", () => {
  it("should add server to config", () => {
    const config: MCPConfig = {
      servers: {},
    };
    
    const serverConfig: ServerConfig = {
      type: "sse",
      url: "https://example.com/sse",
    };
    
    const result = addServer(config, "test-server", serverConfig);
    
    expect(result.servers["test-server"]).toBeDefined();
    expect(result.servers["test-server"]?.type).toBe("sse");
    if (result.servers["test-server"]?.type === "sse") {
      expect(result.servers["test-server"].url).toBe("https://example.com/sse");
    }
  });

  it("should not modify original config", () => {
    const config: MCPConfig = {
      servers: {},
    };
    
    const serverConfig: ServerConfig = {
      type: "sse",
      url: "https://example.com/sse",
    };
    
    const result = addServer(config, "test-server", serverConfig);
    
    expect(config.servers["test-server"]).toBeUndefined();
    expect(result.servers["test-server"]).toBeDefined();
  });
});

describe("removeServer", () => {
  it("should remove server from config", () => {
    const config: MCPConfig = {
      servers: {
        "server1": {
          type: "sse",
          url: "https://example.com/sse",
        },
        "server2": {
          type: "http",
          url: "https://api.example.com",
        },
      },
    };
    
    const result = removeServer(config, "server1");
    
    expect(result.servers["server1"]).toBeUndefined();
    expect(result.servers["server2"]).toBeDefined();
    expect(Object.keys(result.servers)).toHaveLength(1);
  });

  it("should not modify original config", () => {
    const config: MCPConfig = {
      servers: {
        "server1": {
          type: "sse",
          url: "https://example.com/sse",
        },
      },
    };
    
    const result = removeServer(config, "server1");
    
    expect(config.servers["server1"]).toBeDefined();
    expect(result.servers["server1"]).toBeUndefined();
  });

  it("should handle removing non-existent server", () => {
    const config: MCPConfig = {
      servers: {
        "server1": {
          type: "sse",
          url: "https://example.com/sse",
        },
      },
    };
    
    const result = removeServer(config, "non-existent");
    
    expect(result.servers["server1"]).toBeDefined();
    expect(Object.keys(result.servers)).toHaveLength(1);
  });
});