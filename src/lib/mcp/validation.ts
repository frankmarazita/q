import { zMCPConfig, type MCPConfig } from "./types";
import type { Res } from "../common/types";
import { successRes, errorRes } from "../common/response";

export function validateMCPConfig(data: unknown): Res<MCPConfig> {
  const result = zMCPConfig.safeParse(data);
  return result.success
    ? successRes(result.data as MCPConfig)
    : errorRes(result.error.message);
}
