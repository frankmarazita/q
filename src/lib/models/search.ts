import type { Model } from "./types";

export function findModelByIdOrName(
  models: Model[],
  target: string
): Model | undefined {
  for (const model of models) {
    if (model.id === target || model.name === target) {
      return model;
    }
  }
  return undefined;
}
