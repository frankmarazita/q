import { api } from "../../index";
import type { Res } from "../types";
import { loadConfig, updateConfig } from "./config";

type Model = Record<string, any>;

async function listModels(): Promise<Res<Model[]>> {
  await api.refreshCopilotToken();

  let models = await api.models();

  models = models.map((model) => {
    return {
      id: model.id,
      name: model.name,
      vendor: model.vendor,
      version: model.version,
      capabilities_limits_max_output_tokens:
        model.capabilities.limits.max_output_tokens,
      capabilities_limits_max_prompt_tokens:
        model.capabilities.limits.max_prompt_tokens,
      parallel_tool_calls: model.capabilities.supports.parallel_tool_calls,
      streaming: model.capabilities.supports.streaming,
      structured_outputs: model.capabilities.supports.structured_outputs,
      tool_calls: model.capabilities.supports.tool_calls,
      vision: model.capabilities.supports.vision,
    };
  });

  return {
    status: "success",
    data: models,
  };
}

async function setModel(model: string): Promise<Res<Model>> {
  await api.refreshCopilotToken();

  const models = await api.models();

  let selectedModel: Model | undefined = undefined;

  for (const m of models) {
    if (m.id === model || m.name === model) {
      selectedModel = m;
      break;
    }
  }

  if (selectedModel === undefined) {
    return {
      status: "error",
      message: `Model "${model}" is not available.`,
    };
  }

  await updateConfig({ model: selectedModel });

  return {
    status: "success",
    data: selectedModel,
  };
}

async function getModel(): Promise<Res<Model>> {
  const c = await loadConfig();

  if (!c.model) {
    return {
      status: "error",
      message: "No default model set.",
    };
  }

  return {
    status: "success",
    data: c.model,
  };
}

export const models = {
  list: listModels,
  set: setModel,
  get: getModel,
};
