import { describe, it, expect } from "bun:test";
import { Command } from "commander";
import { register } from "../../../cli/commands/chat";
import type { CommandContext } from "../../../cli/commands/types";
import type { API } from "../../../vendor/api";
import type { Config } from "../../../lib/config/types";

describe("chat command", () => {
  const mockContext: CommandContext = {
    config: {
      token: "test-token",
      defaultPrompt: "helpful-assistant",
    } as Config,
    api: {} as API,
  };

  it("should register chat command successfully", () => {
    const program = new Command();
    register(program, mockContext);

    const command = program.commands.find((cmd) => cmd.name() === "chat");
    expect(command).toBeDefined();
    expect(command?.description()).toBe("start a new chat");
  });

  it("should have correct alias", () => {
    const program = new Command();
    register(program, mockContext);

    const command = program.commands.find((cmd) => cmd.name() === "chat");
    expect(command?.alias()).toBe("c");
  });

  it("should have all required options", () => {
    const program = new Command();
    register(program, mockContext);

    const command = program.commands.find((cmd) => cmd.name() === "chat");
    const options = command?.options || [];

    expect(
      options.some((opt) => opt.short === "-A" && opt.long === "--agent")
    ).toBe(true);
    expect(
      options.some((opt) => opt.short === "-p" && opt.long === "--prompt")
    ).toBe(true);
    expect(
      options.some((opt) => opt.short === "-f" && opt.long === "--prompt-file")
    ).toBe(true);
    expect(
      options.some((opt) => opt.short === "-i" && opt.long === "--interactive")
    ).toBe(true);
  });

  it("should be defined and registered", () => {
    const program = new Command();
    register(program, mockContext);

    const command = program.commands.find((cmd) => cmd.name() === "chat");

    // Basic registration test
    expect(command).toBeDefined();
    expect(command?.name()).toBe("chat");
  });
});
