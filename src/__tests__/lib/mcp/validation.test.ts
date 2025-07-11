import { describe, it, expect } from "bun:test";
import { validateMCPConfig } from "../../../lib/mcp/validation";

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
            Authorization: "Bearer token",
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
