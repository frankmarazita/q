import type { Model } from "./types";
import type { Res } from "../common/types";
import { createSuccessResponse, createErrorResponse } from "../common/response";

export function validateModelExists(model: Model | undefined, modelName: string): Res<Model> {
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

export function validateModelHasCapability(
  model: Model, 
  capability: keyof Model['capabilities']['supports']
): Res<Model> {
  if (!model.capabilities.supports[capability]) {
    return createErrorResponse(`Model "${model.name}" does not support ${capability}.`);
  }
  return createSuccessResponse(model);
}