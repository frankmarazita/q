import { zConfig, type Config } from "./types";
import type { Res } from "../common/types";
import { successRes, errorRes } from "../common/response";

export function validateConfig(data: unknown): Res<Config> {
  const result = zConfig.safeParse(data);
  return result.success
    ? successRes(result.data as Config)
    : errorRes(result.error.format().toString());
}
