import path from "path";
import { CONFIG_FOLDER } from "./config";
import type { Res } from "../types";
import type { MCPConfig } from "../lib/mcp/types";
import { parseMCPConfigText } from "../lib/mcp/parsing";

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
  const configResult = parseMCPConfigText(text);

  if (configResult.status === "error") {
    console.error(`Invalid MCP configuration: ${configResult.message}`);

    return {
      status: "error",
      message: `Invalid MCP file configuration.`,
    };
  }

  return {
    status: "success",
    data: configResult.data.servers,
  };
}

export const mcp = {
  servers: listServers,
};
