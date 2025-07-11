import type { CompletionResult, StreamEvent } from "./types";
import {
  parseCompletionChunk,
  isCompletionDone,
  extractContentFromChunk,
  extractToolCallsFromChunk,
  parseToolCallArguments,
} from "./parsing";

export function processStreamChunk(
  chunk: string,
  partialJsonString: string
): {
  events: StreamEvent[];
  newPartialJsonString: string;
} {
  const events: StreamEvent[] = [];
  let currentPartialJsonString = partialJsonString;

  const lines = chunk.trim().split("\n\ndata: ");

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]?.trim();
    if (!line) continue;

    if (line.startsWith("data: ")) {
      line = line.slice(6);
    }

    const jsonString = currentPartialJsonString + line;

    if (isCompletionDone(jsonString)) {
      events.push({ type: "done" });
      break;
    }

    const parsed = parseCompletionChunk(jsonString);
    if (parsed) {
      currentPartialJsonString = "";

      // Extract content
      const content = extractContentFromChunk(parsed);
      if (content) {
        events.push({ type: "content", data: content });
      }

      // Extract tool calls
      const toolCalls = extractToolCallsFromChunk(parsed);
      for (const toolCall of toolCalls) {
        events.push({ type: "tool-call", toolCall });
      }
    } else {
      currentPartialJsonString = jsonString;
    }
  }

  return { events, newPartialJsonString: currentPartialJsonString };
}

export async function processCompletionStream(
  reader: import("stream/web").ReadableStreamDefaultReader<any>,
  onEvent?: (event: StreamEvent) => void
): Promise<CompletionResult> {
  const decoder = new TextDecoder("utf-8");

  let done = false;
  let message = "";
  let toolCallsObj: object[] = [];
  let toolCallsArgsStr: string[] = [];
  let partialJsonString = "";

  while (!done) {
    const { done: doneReading, value } = await reader.read();
    done = doneReading;

    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      const { events, newPartialJsonString } = processStreamChunk(
        chunk,
        partialJsonString
      );
      partialJsonString = newPartialJsonString;

      for (const event of events) {
        if (onEvent) {
          onEvent(event);
        }

        if (event.type === "content" && event.data) {
          message += event.data;
        } else if (event.type === "tool-call" && event.toolCall) {
          toolCallsObj.push(event.toolCall);
        } else if (event.type === "done") {
          done = true;
          break;
        }
      }
    }
  }

  if (toolCallsObj.length > 0) {
    const toolCallsArgs: (object | undefined)[] = [];

    for (const toolCallsArgsStrItem of toolCallsArgsStr) {
      const args = parseToolCallArguments(toolCallsArgsStrItem);
      toolCallsArgs.push(args);
    }

    return {
      type: "tool-calls",
      toolCalls: toolCallsObj.map((toolCall, index) => ({
        function: toolCall,
        arguments: toolCallsArgs[index] || {},
      })),
    };
  }

  return {
    type: "message",
    message: message,
  };
}
