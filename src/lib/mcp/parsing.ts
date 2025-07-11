import { parse } from "comment-json";
import type { MCPConfig } from "./types";
import type { Res } from "../common/types";
import { errorRes } from "../common/response";
import { validateMCPConfig } from "./validation";

export function parseMCPConfigText(text: string): Res<MCPConfig> {
  try {
    const parsed = parse(text, null, true);
    return validateMCPConfig(parsed);
  } catch (error) {
    return errorRes(
      error instanceof Error
        ? error.message
        : "Failed to parse MCP configuration"
    );
  }
}
