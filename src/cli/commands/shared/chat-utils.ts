import { chats } from "../../../services/chats";
import { addUserMessage, processExistingChat } from "../../../services/chat";
import { parseInput } from "../../input/parser";
import { loadMCPClients, type MCPClientData } from "../../mcp/client";
import type { StreamEvent } from "../../../lib/completions";
import type { CommandContext } from "../types";

export function displayChatHistory(chatId: string, messages: any[]): void {
  console.log(`\n--- Chat History ${chatId ? `(${chatId})` : ""} ---`);
  for (const message of messages) {
    if (message.role === "system") continue; // Skip system messages

    if (message.role === "user") {
      console.log(`You: ${message.content}`);
    } else if (message.role === "assistant") {
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log(
          `Assistant: [Called ${message.tool_calls.length} tool(s): ${message.tool_calls.map((tc: any) => tc.function.name).join(", ")}]`
        );
      } else if (message.content) {
        console.log(`Assistant: ${message.content}`);
      }
    } else if (message.role === "tool") {
      console.log(`Tool: ${message.content}`);
    }
  }
  console.log("--- End History ---\n");
}

export async function setupMCPClients(useAgent: boolean): Promise<{
  tools: { function: any; type: string }[];
  clients: Record<string, MCPClientData> | undefined;
}> {
  const tools: { function: any; type: string }[] = [];
  const clients: Record<string, MCPClientData> | undefined = useAgent
    ? await loadMCPClients("0.0.1")
    : undefined;

  if (clients) {
    const clientsTools = await Promise.all(
      Object.entries(clients).map(async ([, { client }]) => {
        const clientTools = await client.listTools();
        return {
          client,
          tools: clientTools,
        };
      })
    );

    for (const { tools: clientTools } of clientsTools) {
      for (const tool of clientTools.tools) {
        tools.push({
          function: {
            id: tool.id,
            name: tool.name,
            description: tool.description,
            parameters: {
              ...tool.inputSchema,
            },
          },
          type: "function",
        });
      }
    }
  }

  return { tools, clients };
}

export async function processAIResponse(
  chatId: string,
  tools: { function: any; type: string }[],
  clients: Record<string, MCPClientData> | undefined,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  const replyResult = await processExistingChat(chatId, tools, onEvent);

  if (replyResult.status === "error") {
    console.error(replyResult.message);
    return;
  }

  const reply = replyResult.data;

  if (reply.type === "tool-calls") {
    if (clients) {
      await chats.addMessage(chatId, {
        role: "assistant",
        content: "",
        tool_calls: reply.toolCalls.map((toolCall) => ({
          id: toolCall.function.id,
          function: {
            name: toolCall.function.function.name,
            arguments: JSON.stringify(toolCall.arguments, null, 2),
          },
          type: "function",
        })),
      });

      const toolCallResponses: {
        role: "tool";
        content: string;
        tool_call_id: string;
      }[] = [];

      for (const toolCall of reply.toolCalls) {
        console.log(`Calling tool: ${toolCall.function.function.name}`);

        const client = Object.entries(clients).find(([, { tools }]) =>
          tools.includes(toolCall.function.function.name)
        );

        if (!client) {
          console.error(
            `No MCP client found for tool: ${toolCall.function.function.name}`
          );
          continue;
        }

        const res = await client[1].client.callTool({
          name: toolCall.function.function.name,
          arguments: toolCall.arguments,
        });

        toolCallResponses.push({
          role: "tool",
          content: (res.content as any)[0].text,
          tool_call_id: toolCall.function.id,
        });
      }

      for (const toolCallResponse of toolCallResponses) {
        await chats.addMessage(chatId, toolCallResponse);
      }

      // Process AI response to tool results (this should be the final response)
      await processAIResponse(chatId, tools, clients, onEvent);
    }
  }
}

export async function runChatLoop(
  chatId: string,
  tools: { function: any; type: string }[],
  clients: Record<string, MCPClientData> | undefined,
  options: any,
  context: CommandContext,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  let input: string;

  while (true) {
    if (!options.interactive) {
      process.exit(0);
    }

    process.stdout.write("\n");

    input = await parseInput();

    const addMessageResult = await addUserMessage(chatId, input);
    if (addMessageResult.status === "error") {
      console.error(addMessageResult.message);
      return;
    }

    process.stdout.write("\n");

    // Process AI response (may include tool calls)
    await processAIResponse(chatId, tools, clients, onEvent);
  }
}
