import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { ServerConfig } from "../../lib/mcp/types";

export interface MCPClientData {
  client: Client;
  tools: string[];
}

export async function loadMCPClients(
  version: string
): Promise<Record<string, MCPClientData> | undefined> {
  const { mcp } = await import("../../services/mcp");
  const servers = await mcp.servers();

  if (servers.status === "error") {
    console.error(servers.message);
    return undefined;
  }

  const clients: Record<string, MCPClientData> = {};
  const serverEntries = Object.entries(servers.data);

  const clientResults = await Promise.all(
    serverEntries.map(async ([name, server]) => {
      const client = new Client({
        name: name,
        version: version,
      });

      const tools: string[] = [];
      const now = new Date();

      await connectToServer(client, server);

      const { tools: clientTools } = await client.listTools();

      for (const tool of clientTools) {
        tools.push(tool.name);
      }

      console.log(`${name}: ${new Date().getTime() - now.getTime()}ms`);

      return [name, { client, tools }] as const;
    })
  );

  for (const [name, clientData] of clientResults) {
    clients[name] = clientData;
  }

  return clients;
}

async function connectToServer(
  client: Client,
  server: ServerConfig
): Promise<void> {
  if (server.type === "sse") {
    const transport = new SSEClientTransport(new URL(server.url));
    await client.connect(transport);
  } else if (server.type === "stdio") {
    const transport = new StdioClientTransport({
      command: server.command,
      args: server.args,
    });
    await client.connect(transport);
  }
}
