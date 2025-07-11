import { getAPI } from "../lib/api/singleton";
import { loadConfig, updateConfig } from "./config";
import { 
  transformModels, 
  findModelByIdOrName, 
  validateModelExists, 
  validateConfigHasModel 
} from "../lib/models";
import { createSuccessResponse } from "../lib/common";
import type { Res } from "../lib/common/types";
import type { Model, TransformedModel } from "../lib/models/types";

async function listModels(): Promise<Res<TransformedModel[]>> {
  const api = getAPI();
  await api.refreshCopilotToken();
  const models = await api.models() as Model[];
  const transformedModels = transformModels(models);
  return createSuccessResponse(transformedModels);
}

async function setModel(modelName: string): Promise<Res<Model>> {
  const api = getAPI();
  await api.refreshCopilotToken();
  const models = await api.models() as Model[];
  const selectedModel = findModelByIdOrName(models, modelName);
  
  const validationResult = validateModelExists(selectedModel, modelName);
  if (validationResult.status === "error") {
    return validationResult;
  }

  await updateConfig({ model: validationResult.data });
  return createSuccessResponse(validationResult.data);
}

async function getModel(): Promise<Res<Model>> {
  const config = await loadConfig();
  return validateConfigHasModel(config);
}

export const models = {
  list: listModels,
  set: setModel,
  get: getModel,
};