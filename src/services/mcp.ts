import path from "path";
import { CONFIG_FOLDER } from "./config";
import type { Res } from "../types";
import type { MCPConfig } from "../lib/mcp/types";
import { parseMCPConfigText, getMCPConfigParseError } from "../lib/mcp/parsing";

async function listServers(): Promise<Res<MCPConfig["servers"]>> {
  // Allow both JSON and JSONC formats for MCP configuration
  const json = Bun.file(path.join(CONFIG_FOLDER, "mcp.json"));
  const jsonc = Bun.file(path.join(CONFIG_FOLDER, "mcp.jsonc"));

  const jsonExists = await json.exists();
  const jsoncExists = await jsonc.exists();

  const fileExists = jsonExists || jsoncExists;
  const file = jsonExists ? json : jsonc;

  if (!fileExists) {
    return {
      status: "error",
      message: `No MCP configuration file not found.`,
    };
  }

  const text = await file.text();
  const config = parseMCPConfigText(text);

  if (!config) {
    const error = getMCPConfigParseError(text);
    console.error(`Invalid MCP configuration: ${error}`);

    return {
      status: "error",
      message: `Invalid MCP file configuration.`,
    };
  }

  return {
    status: "success",
    data: config.servers,
  };
}

export const mcp = {
  servers: listServers,
};
