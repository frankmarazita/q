import { zMCPConfig, type MCPConfig } from "./types";
import type { Res } from "../common/types";
import { createSuccessResponse, createErrorResponse } from "../common/response";

export function validateMCPConfig(data: unknown): Res<MCPConfig> {
  const result = zMCPConfig.safeParse(data);
  return result.success 
    ? createSuccessResponse(result.data as MCPConfig)
    : createErrorResponse(result.error.message);
}
