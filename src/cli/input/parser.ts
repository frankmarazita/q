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