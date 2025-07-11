import type { CompletionChunk } from "./types";
import type { Res } from "../common/types";
import { successRes, errorRes } from "../common/response";

export function parseCompletionChunk(jsonString: string): Res<CompletionChunk> {
  try {
    return successRes(JSON.parse(jsonString) as CompletionChunk);
  } catch (error) {
    return errorRes(
      error instanceof Error
        ? error.message
        : "Failed to parse completion chunk"
    );
  }
}

export function isCompletionDone(jsonString: string): boolean {
  return jsonString === "[DONE]";
}

export function extractContentFromChunk(chunk: CompletionChunk): Res<string> {
  if (chunk.choices.length && chunk.choices[0]?.delta.content) {
    return successRes(chunk.choices[0].delta.content);
  }
  return errorRes("No content found in completion chunk");
}

export function extractToolCallsFromChunk(chunk: CompletionChunk): Array<any> {
  if (chunk.choices.length && chunk.choices[0]?.delta.tool_calls) {
    return chunk.choices[0].delta.tool_calls.filter(
      (toolCall: any) => toolCall.type === "function"
    );
  }
  return [];
}

export function parseToolCallArguments(argsString: string): Res<any> {
  try {
    return successRes(JSON.parse(argsString));
  } catch (error) {
    return errorRes(
      error instanceof Error
        ? error.message
        : "Failed to parse tool call arguments"
    );
  }
}
