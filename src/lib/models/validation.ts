import type { Model } from "./types";
import type { Res } from "../common/types";
import { successRes, errorRes } from "../common/response";

export function validateModelExists(
  model: Model | undefined,
  modelName: string
): Res<Model> {
  if (!model) {
    return errorRes(`Model "${modelName}" is not available.`);
  }
  return successRes(model);
}

export function validateConfigHasModel(config: { model?: Model }): Res<Model> {
  if (!config.model) {
    return errorRes("No default model set.");
  }
  return successRes(config.model);
}
