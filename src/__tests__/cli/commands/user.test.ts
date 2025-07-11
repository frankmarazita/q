import { describe, it, expect } from "bun:test";
import { Command } from "commander";
import { register } from "../../../cli/commands/user";
import type { CommandContext } from "../../../cli/commands/types";
import type { API } from "../../../vendor/api";
import type { Config } from "../../../lib/config/types";

describe("user command", () => {
  it("should register user command successfully", () => {
    const program = new Command();
    const mockContext: CommandContext = {
      config: {} as Config,
      api: {} as API,
    };

    register(program, mockContext);

    const commands = program.commands;
    expect(commands.some(cmd => cmd.name() === "user")).toBe(true);
  });

  it("should have correct command description and alias", () => {
    const program = new Command();
    const mockContext: CommandContext = {
      config: {} as Config,
      api: {} as API,
    };

    register(program, mockContext);

    const userCmd = program.commands.find(cmd => cmd.name() === "user");
    expect(userCmd?.description()).toBe("view user info");
    expect(userCmd?.alias()).toBe("u");
  });
});