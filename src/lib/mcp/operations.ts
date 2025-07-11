import type { MCPConfig, ServerConfig } from "./types";

export function getServerNames(config: MCPConfig): string[] {
  return Object.keys(config.servers);
}

export function getServerConfig(config: MCPConfig, serverName: string): ServerConfig | null {
  return config.servers[serverName] || null;
}

export function hasServer(config: MCPConfig, serverName: string): boolean {
  return serverName in config.servers;
}

export function getServersByType(config: MCPConfig, type: "sse" | "http" | "stdio"): Record<string, ServerConfig> {
  const servers: Record<string, ServerConfig> = {};
  
  for (const [name, serverConfig] of Object.entries(config.servers)) {
    if (serverConfig.type === type) {
      servers[name] = serverConfig;
    }
  }
  
  return servers;
}

export function isServerURLValid(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getServerCount(config: MCPConfig): number {
  return Object.keys(config.servers).length;
}

export function createEmptyMCPConfig(): MCPConfig {
  return {
    servers: {},
  };
}

export function addServer(config: MCPConfig, name: string, serverConfig: ServerConfig): MCPConfig {
  return {
    ...config,
    servers: {
      ...config.servers,
      [name]: serverConfig,
    },
  };
}

export function removeServer(config: MCPConfig, name: string): MCPConfig {
  const { [name]: removed, ...remainingServers } = config.servers;
  return {
    ...config,
    servers: remainingServers,
  };
}