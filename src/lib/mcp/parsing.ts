import { parse } from "comment-json";
import type { MCPConfig } from "./types";
import { validateMCPConfig } from "./validation";

export function parseMCPConfigText(text: string): MCPConfig | null {
  try {
    const parsed = parse(text, null, true);
    return validateMCPConfig(parsed);
  } catch {
    return null;
  }
}

export function parseMCPConfigJson(jsonString: string): MCPConfig | null {
  try {
    const parsed = JSON.parse(jsonString);
    return validateMCPConfig(parsed);
  } catch {
    return null;
  }
}

export function serializeMCPConfig(config: MCPConfig): string {
  return JSON.stringify(config, null, 2);
}

export function getMCPConfigParseError(text: string): string | null {
  try {
    const parsed = parse(text, null, true);
    const config = validateMCPConfig(parsed);
    return config ? null : "Invalid MCP configuration format";
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to parse MCP configuration";
  }
}