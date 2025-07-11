import { chats } from "./chats";
import { loadConfig } from "./config";
import { getAPI } from "../lib/api/singleton";
import { processCompletionStream } from "../lib/completions/processing";
import type { CompletionResult, StreamEvent } from "../lib/completions/types";
import type { Res } from "../lib/common/types";
import { successRes, errorRes } from "../lib/common/response";

export interface ChatReq {
  input: string;
  prompt?: string;
  tools?: { function: any; type: string }[];
}

export interface ChatRes {
  chatId: string;
  result: CompletionResult;
}

export async function processChat(
  request: ChatReq,
  onEvent?: (event: StreamEvent) => void
): Promise<Res<ChatRes>> {
  try {
    const { input, prompt, tools = [] } = request;

    const systemPrompt =
      prompt || "You are a helpful AI assistant. Do whatever the user asks.";

    const chatResult = await chats.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    if (chatResult.status === "error") {
      return errorRes(chatResult.message);
    }

    const chatId = chatResult.data;
    const config = await loadConfig();
    const api = getAPI();

    const chat = await chats.get(chatId);
    if (chat.status === "error") {
      return errorRes(chat.message);
    }

    await api.refreshCopilotToken();

    const completions = await api.completions("user", {
      messages: chat.data.data.messages,
      model: config.model ? config.model.id : undefined,
      temperature: 0.1,
      top_p: 1,
      max_tokens: config.model?.capabilities.limits.max_output_tokens,
      tools: tools.length > 0 ? tools : undefined,
      n: 1,
      stream: true,
    });

    const reply = await processCompletionStream(completions, onEvent);

    if (reply.type === "message") {
      await chats.addMessage(chatId, {
        role: "assistant",
        content: reply.message,
      });
    }

    return successRes({
      chatId,
      result: reply,
    });
  } catch (error) {
    return errorRes(`Chat processing failed: ${error}`);
  }
}

export async function createChatStream(request: ChatReq): Promise<
  Res<{
    chatId: string;
    completions: import("stream/web").ReadableStreamDefaultReader<any>;
  }>
> {
  try {
    const { input, prompt, tools = [] } = request;

    const systemPrompt =
      prompt || "You are a helpful AI assistant. Do whatever the user asks.";

    const chatResult = await chats.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: input,
        },
      ],
    });

    if (chatResult.status === "error") {
      return errorRes(chatResult.message);
    }

    const chatId = chatResult.data;
    const config = await loadConfig();
    const api = getAPI();

    const chat = await chats.get(chatId);
    if (chat.status === "error") {
      return errorRes(chat.message);
    }

    await api.refreshCopilotToken();

    const completions = await api.completions("user", {
      messages: chat.data.data.messages,
      model: config.model ? config.model.id : undefined,
      temperature: 0.1,
      top_p: 1,
      max_tokens: config.model?.capabilities.limits.max_output_tokens,
      tools: tools.length > 0 ? tools : undefined,
      n: 1,
      stream: true,
    });

    return successRes({
      chatId,
      completions,
    });
  } catch (error) {
    return errorRes(`Chat processing failed: ${error}`);
  }
}

export async function addUserMessage(
  chatId: string,
  message: string
): Promise<Res<void>> {
  const result = await chats.addMessage(chatId, {
    role: "user",
    content: message,
  });

  if (result.status === "error") {
    return errorRes(result.message);
  }

  return successRes(undefined);
}

export async function processExistingChat(
  chatId: string,
  tools: { function: any; type: string }[] = [],
  onEvent?: (event: StreamEvent) => void
): Promise<Res<CompletionResult>> {
  try {
    const config = await loadConfig();
    const api = getAPI();

    const chat = await chats.get(chatId);
    if (chat.status === "error") {
      return errorRes(chat.message);
    }

    await api.refreshCopilotToken();

    const completions = await api.completions("user", {
      messages: chat.data.data.messages,
      model: config.model ? config.model.id : undefined,
      temperature: 0.1,
      top_p: 1,
      max_tokens: config.model?.capabilities.limits.max_output_tokens,
      tools: tools.length > 0 ? tools : undefined,
      n: 1,
      stream: true,
    });

    const reply = await processCompletionStream(completions, onEvent);

    if (reply.type === "message") {
      await chats.addMessage(chatId, {
        role: "assistant",
        content: reply.message,
      });
    }

    return successRes(reply);
  } catch (error) {
    return errorRes(`Chat processing failed: ${error}`);
  }
}
