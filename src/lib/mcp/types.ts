import { z } from "zod";

export const zSSEServerConfig = z.object({
  type: z.literal("sse"),
  url: z.string().url(),
  headers: z.record(z.string()).optional(),
});

export type SSEServerConfig = z.infer<typeof zSSEServerConfig>;

export const zHTTPServerConfig = z.object({
  type: z.literal("http"),
  url: z.string().url(),
  headers: z.record(z.string()).optional(),
});

export type HTTPServerConfig = z.infer<typeof zHTTPServerConfig>;

export const zStdioServerConfig = z.object({
  type: z.literal("stdio"),
  command: z.string(),
  args: z.array(z.string()).optional(),
});

export type StdioServerConfig = z.infer<typeof zStdioServerConfig>;

export const zServerConfig = z.union([
  zSSEServerConfig,
  zHTTPServerConfig,
  zStdioServerConfig,
]);

export type ServerConfig = z.infer<typeof zServerConfig>;

export const zMCPConfig = z.object({
  servers: z.record(zServerConfig),
});

export type MCPConfig = z.infer<typeof zMCPConfig>;
