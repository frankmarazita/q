import type { Model } from "./types";
import type { Res } from "../common/types";
import { createSuccessResponse, createErrorResponse } from "../common/response";

export function validateModelExists(
  model: Model | undefined,
  modelName: string
): Res<Model> {
  if (!model) {
    return createErrorResponse(`Model "${modelName}" is not available.`);
  }
  return createSuccessResponse(model);
}

export function validateConfigHasModel(config: { model?: Model }): Res<Model> {
  if (!config.model) {
    return createErrorResponse("No default model set.");
  }
  return createSuccessResponse(config.model);
}
