import { zMCPConfig, type MCPConfig } from "./types";

export function validateMCPConfig(data: unknown): MCPConfig | null {
  const result = zMCPConfig.safeParse(data);
  return result.success ? (result.data as MCPConfig) : null;
}
