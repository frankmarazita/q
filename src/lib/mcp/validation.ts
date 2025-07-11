import {
  zMCPConfig,
  zServerConfig,
  type MCPConfig,
  type ServerConfig,
} from "./types";

export function validateMCPConfig(data: unknown): MCPConfig | null {
  const result = zMCPConfig.safeParse(data);
  return result.success ? (result.data as MCPConfig) : null;
}

export function validateServerConfig(data: unknown): ServerConfig | null {
  const result = zServerConfig.safeParse(data);
  return result.success ? (result.data as ServerConfig) : null;
}

export function getMCPConfigValidationError(data: unknown): string | null {
  const result = zMCPConfig.safeParse(data);
  return result.success ? null : result.error.message;
}

export function isValidMCPConfigJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    return validateMCPConfig(parsed) !== null;
  } catch {
    return false;
  }
}
