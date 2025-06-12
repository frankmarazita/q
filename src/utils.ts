export async function processCompletions(
  completions: import("stream/web").ReadableStreamDefaultReader<any>
): Promise<string> {
  const decoder = new TextDecoder("utf-8");

  let done = false;
  let message = "";

  const chunks: string[] = [];

  let partialJsonString = "";

  while (!done) {
    const { done: doneReading, value } = await completions.read();
    done = doneReading;

    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      chunks.push(chunk.trim());

      processChunk(chunk);
    }
  }

  function processChunk(chunk: string): void {
    const lines = chunk.trim().split("\n\ndata: ");

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i]?.trim();
      if (!line) continue; // Skip empty lines
      // console.log("<<<" + line + ">>>");

      if (line.startsWith("data: ")) {
        // Remove "data: " prefix if present
        line = line.slice(6);
      }

      const jsonString = partialJsonString + line;

      if (jsonString === "[DONE]") break;

      try {
        const json = JSON.parse(jsonString);

        partialJsonString = "";

        if (json.choices.length && json.choices[0].delta.content) {
          process.stdout.write(json.choices[0].delta.content);
          message += json.choices[0].delta.content;
        }
      } catch (error) {
        partialJsonString = jsonString;
      }
    }
  }

  return message;
}

export async function parseInput(): Promise<string> {
  const input = await new Promise<string>((resolve) => {
    process.stdout.write("> ");
    process.stdin.once("data", (data) => {
      resolve(data.toString().trim());
    });
  });

  const exitCommands = ["exit", "quit", "q"];

  if (!input || exitCommands.includes(input.toLowerCase())) {
    process.exit(0);
  }
  return input;
}
