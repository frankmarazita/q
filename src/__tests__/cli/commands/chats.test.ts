import { describe, it, expect } from "bun:test";
import { Command } from "commander";
import { register } from "../../../cli/commands/chats";
import type { CommandContext } from "../../../cli/commands/types";
import type { API } from "../../../vendor/api";
import type { Config } from "../../../lib/config/types";

describe("chats command", () => {
  it("should register chats command successfully", () => {
    const program = new Command();
    const mockContext: CommandContext = {
      config: {} as Config,
      api: {} as API,
    };

    register(program, mockContext);

    const commands = program.commands;
    expect(commands.some((cmd) => cmd.name() === "chats")).toBe(true);
  });

  it("should have correct command description", () => {
    const program = new Command();
    const mockContext: CommandContext = {
      config: {} as Config,
      api: {} as API,
    };

    register(program, mockContext);

    const chatsCmd = program.commands.find((cmd) => cmd.name() === "chats");
    expect(chatsCmd?.description()).toBe("list the chats");
  });

  it("should have delete option", () => {
    const program = new Command();
    const mockContext: CommandContext = {
      config: {} as Config,
      api: {} as API,
    };

    register(program, mockContext);

    const chatsCmd = program.commands.find((cmd) => cmd.name() === "chats");
    const options = chatsCmd?.options || [];
    expect(options.some((opt) => opt.short === "-D")).toBe(true);
    expect(options.some((opt) => opt.long === "--delete")).toBe(true);
  });
});
