import { processCompletionStream } from "./lib/completions";
import type { CompletionResult, StreamEvent } from "./lib/completions/types";

export async function processCompletions(
  completions: import("stream/web").ReadableStreamDefaultReader<any>
): Promise<CompletionResult> {
  return processCompletionStream(completions, (event: StreamEvent) => {
    // Handle real-time output for CLI
    if (event.type === "content" && event.data) {
      process.stdout.write(event.data);
    }
  });
}
