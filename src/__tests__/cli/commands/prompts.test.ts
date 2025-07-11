import { describe, it, expect, mock } from "bun:test";
import { Command } from "commander";
import { register } from "../../../cli/commands/prompts";
import type { CommandContext } from "../../../cli/commands/types";

const mockUpdateConfig = mock(() => Promise.resolve());
const mockLoadConfig = mock(() =>
  Promise.resolve({
    token: "test-token",
    defaultPrompt: "test-default-prompt",
  })
);

mock.module("../../../services/config", () => ({
  updateConfig: mockUpdateConfig,
  loadConfig: mockLoadConfig,
}));

describe("prompts commands", () => {
  const mockContext: CommandContext = {
    config: {
      token: "test-token",
      promptDirectory: "/test/prompts",
      defaultPrompt: "test-default-prompt",
    },
    api: {} as any,
  };

  it("should register set-default-prompt command", () => {
    const program = new Command();
    register(program, mockContext);

    const command = program.commands.find(
      (cmd) => cmd.name() === "set-default-prompt"
    );
    expect(command).toBeDefined();
    expect(command?.description()).toBe("set the default prompt file");
  });

  it("should register default-prompt command", () => {
    const program = new Command();
    register(program, mockContext);

    const command = program.commands.find(
      (cmd) => cmd.name() === "default-prompt"
    );
    expect(command).toBeDefined();
    expect(command?.description()).toBe("view the current default prompt");
  });

  it("should register existing commands", () => {
    const program = new Command();
    register(program, mockContext);

    const setPromptDirCommand = program.commands.find(
      (cmd) => cmd.name() === "set-prompt-dir"
    );
    expect(setPromptDirCommand).toBeDefined();

    const promptDirCommand = program.commands.find(
      (cmd) => cmd.name() === "prompt-dir"
    );
    expect(promptDirCommand).toBeDefined();

    const promptsCommand = program.commands.find(
      (cmd) => cmd.name() === "prompts"
    );
    expect(promptsCommand).toBeDefined();
  });
});
