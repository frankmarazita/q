import path from "path";
import { CONFIG_FOLDER } from "./config";
import type { Res } from "../types";
import { parse } from "comment-json";
import { z } from "zod";

const zMCP = z.object({
  servers: z.record(
    z.string(),
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("sse"),
        url: z.string().url(),
        headers: z.record(z.string(), z.string()).optional(),
      }),
      z.object({
        type: z.literal("http"),
        url: z.string().url(),
        headers: z.record(z.string(), z.string()).optional(),
      }),
      z.object({
        type: z.literal("stdio"),
        command: z.string(),
        args: z.array(z.string()).optional(),
      }),
    ])
  ),
});

export type MCP = z.infer<typeof zMCP>;

async function listServers(): Promise<Res<MCP["servers"]>> {
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

  const validation = zMCP.safeParse(parse(text, null, true));

  if (!validation.success) {
    console.error(`Invalid MCP configuration: ${validation.error.message}`);

    return {
      status: "error",
      message: `Invalid MCP file configuration.`,
    };
  }

  return {
    status: "success",
    data: validation.data.servers,
  };
}

export const mcp = {
  servers: listServers,
};
