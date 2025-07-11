import type { CompletionChunk } from "./types";

export function parseCompletionChunk(jsonString: string): CompletionChunk | null {
  try {
    return JSON.parse(jsonString) as CompletionChunk;
  } catch (error) {
    return null;
  }
}

export function isCompletionDone(jsonString: string): boolean {
  return jsonString === "[DONE]";
}

export function extractContentFromChunk(chunk: CompletionChunk): string | null {
  if (chunk.choices.length && chunk.choices[0]?.delta.content) {
    return chunk.choices[0].delta.content;
  }
  return null;
}

export function extractToolCallsFromChunk(chunk: CompletionChunk): Array<any> {
  if (chunk.choices.length && chunk.choices[0]?.delta.tool_calls) {
    return chunk.choices[0].delta.tool_calls.filter(
      (toolCall: any) => toolCall.type === "function"
    );
  }
  return [];
}


export function parseToolCallArguments(argsString: string): any {
  try {
    return JSON.parse(argsString);
  } catch (error) {
    return undefined;
  }
}