import { describe, it, expect } from "bun:test";
import { createCLI } from "../../cli";
import type { CommandContext } from "../../cli/commands/types";
import type { API } from "../../vendor/api";
import type { Config } from "../../lib/config/types";

describe("CLI creation", () => {
  it("should create CLI with correct name and version", async () => {
    const mockContext: CommandContext = {
      config: {} as Config,
      api: {} as API,
    };

    const cli = await createCLI("1.0.0", mockContext);

    expect(cli.name()).toBe("q");
    expect(cli.version()).toBe("1.0.0");
  });

  it("should have correct description", async () => {
    const mockContext: CommandContext = {
      config: {} as Config,
      api: {} as API,
    };

    const cli = await createCLI("1.0.0", mockContext);

    expect(cli.description()).toBe(
      "A CLI for interacting with AI models and managing chats"
    );
  });

  it("should register all expected commands", async () => {
    const mockContext: CommandContext = {
      config: {} as Config,
      api: {} as API,
    };

    const cli = await createCLI("1.0.0", mockContext);
    const commandNames = cli.commands.map((cmd) => cmd.name());

    const expectedCommands = [
      "user",
      "models",
      "set-model",
      "model",
      "chat",
      "chats",
      "set-prompt-dir",
      "prompt-dir",
      "prompts",
      "mcp-servers",
      "serve",
    ];

    for (const expectedCmd of expectedCommands) {
      expect(commandNames.includes(expectedCmd)).toBe(true);
    }
  });
});
