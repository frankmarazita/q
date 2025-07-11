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

    const parsedResult = parseCompletionChunk(jsonString);
    if (parsedResult.status === "success") {
      currentPartialJsonString = "";

      // Extract content
      const contentResult = extractContentFromChunk(parsedResult.data);
      if (contentResult.status === "success") {
        events.push({ type: "content", data: contentResult.data });
      }

      // Extract tool calls
      const toolCalls = extractToolCallsFromChunk(parsedResult.data);
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
  let toolCallsObj: any[] = [];
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
    return {
      type: "tool-calls",
      toolCalls: toolCallsObj.map((toolCall) => {
        let parsedArgs = {};
        if (toolCall.function?.arguments) {
          const argsResult = parseToolCallArguments(
            toolCall.function.arguments
          );
          parsedArgs = argsResult.status === "success" ? argsResult.data : {};
        }
        return {
          function: toolCall,
          arguments: parsedArgs,
        };
      }),
    };
  }

  return {
    type: "message",
    message: message,
  };
}
