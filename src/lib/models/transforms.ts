import type { Model, TransformedModel } from "./types";

export function transformModel(model: Model): TransformedModel {
  return {
    id: model.id,
    name: model.name,
    vendor: model.vendor,
    version: model.version,
    capabilities_limits_max_output_tokens:
      model.capabilities.limits.max_output_tokens,
    capabilities_limits_max_prompt_tokens:
      model.capabilities.limits.max_prompt_tokens,
    parallel_tool_calls:
      model.capabilities.supports.parallel_tool_calls ?? false,
    streaming: model.capabilities.supports.streaming,
    structured_outputs: model.capabilities.supports.structured_outputs ?? false,
    tool_calls: model.capabilities.supports.tool_calls ?? false,
    vision: model.capabilities.supports.vision,
  };
}

export function transformModels(models: Model[]): TransformedModel[] {
  return models.map(transformModel);
}
