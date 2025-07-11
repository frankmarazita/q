import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Command } from "commander";
import { register } from "../../../cli/commands/models";
import type { CommandContext } from "../../../cli/commands/types";
import type { API } from "../../../vendor/api";
import type { Config } from "../../../lib/config/types";

// Mock console methods
const originalLog = console.log;
const originalError = console.error;
const originalTable = console.table;

let logOutput: string[] = [];
let errorOutput: string[] = [];
let tableOutput: any[] = [];

beforeEach(() => {
  logOutput = [];
  errorOutput = [];
  tableOutput = [];

  console.log = (...args: any[]) => {
    logOutput.push(args.join(" "));
  };

  console.error = (...args: any[]) => {
    errorOutput.push(args.join(" "));
  };

  console.table = (data: any, columns?: string[]) => {
    tableOutput.push({ data, columns });
  };
});

afterEach(() => {
  console.log = originalLog;
  console.error = originalError;
  console.table = originalTable;
});

describe("models command", () => {
  it("should register models command successfully", () => {
    const program = new Command();
    const mockContext: CommandContext = {
      config: {} as Config,
      api: {} as API,
    };

    register(program, mockContext);

    const commands = program.commands;
    expect(commands.some((cmd) => cmd.name() === "models")).toBe(true);
    expect(commands.some((cmd) => cmd.name() === "set-model")).toBe(true);
    expect(commands.some((cmd) => cmd.name() === "model")).toBe(true);
  });

  it("should have correct command descriptions", () => {
    const program = new Command();
    const mockContext: CommandContext = {
      config: {} as Config,
      api: {} as API,
    };

    register(program, mockContext);

    const modelsCmd = program.commands.find((cmd) => cmd.name() === "models");
    const setModelCmd = program.commands.find(
      (cmd) => cmd.name() === "set-model"
    );
    const modelCmd = program.commands.find((cmd) => cmd.name() === "model");

    expect(modelsCmd?.description()).toBe("list the models");
    expect(setModelCmd?.description()).toBe("set the default model");
    expect(modelCmd?.description()).toBe("view the current default model");
  });

  it("should have model command with alias 'm'", () => {
    const program = new Command();
    const mockContext: CommandContext = {
      config: {} as Config,
      api: {} as API,
    };

    register(program, mockContext);

    const modelCmd = program.commands.find((cmd) => cmd.name() === "model");
    expect(modelCmd?.alias()).toBe("m");
  });
});
