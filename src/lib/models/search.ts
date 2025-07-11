import type { Model } from "./types";

export function findModelByIdOrName(models: Model[], target: string): Model | undefined {
  for (const model of models) {
    if (model.id === target || model.name === target) {
      return model;
    }
  }
  return undefined;
}

export function findModelsByVendor(models: Model[], vendor: string): Model[] {
  return models.filter(model => model.vendor === vendor);
}

export function findModelsWithCapability(
  models: Model[], 
  capability: keyof Model['capabilities']['supports']
): Model[] {
  return models.filter(model => model.capabilities.supports[capability]);
}