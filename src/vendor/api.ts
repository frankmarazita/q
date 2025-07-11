import { loadConfig, updateConfig } from "../services/config";

const URL = "https://api.github.com";

function processError(error: string): never {
  console.error(error);
  process.exit(1);
}

function processApiError(res: Response, message?: string) {
  let error = `${res.status} ${res.statusText}`;
  if (message) error = `${message}: ${error}`;
  return processError(error);
}

export class API {
  private token: string;
  private copilotToken: string | undefined;

  constructor(token: string) {
    this.token = token;
    this.copilotToken = undefined;
  }

  public async user() {
    const res = await fetch(`${URL}/copilot_internal/user`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch user: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  }

  public async refreshCopilotToken() {
    const c = await loadConfig();

    if (c.copilotToken && c.copilotToken.expiresAt > Date.now()) {
      this.copilotToken = c.copilotToken.token;
      return;
    }

    const res = await fetch(
      "https://api.github.com/copilot_internal/v2/token",
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      processApiError(res, "Failed to fetch token");
    }

    const resJson = (await res.json()) as { token: string; expires_at: number };

    this.copilotToken = resJson.token;

    await updateConfig({
      copilotToken: {
        token: this.copilotToken,
        expiresAt: resJson.expires_at * 1000, // Convert to milliseconds
      },
    });
  }

  public async models() {
    const res = await fetch("https://api.business.githubcopilot.com/models", {
      headers: {
        authorization: `Bearer ${this.copilotToken}`,
        "editor-version": "vscode/1.100.0",
        "editor-plugin-version": "copilot/1.323.0",
        "copilot-language-server-version": "1.323.0",
        "x-github-api-version": "2025-05-01",
        "user-agent": "GithubCopilot/1.323.0",
        accept: "*/*",
        "accept-encoding": "gzip,deflate,br",
      },
    });

    if (!res.ok) {
      processApiError(res, "Failed to fetch models");
    }

    const resJson = (await res.json()) as { data: Record<string, any>[] };

    return resJson.data.filter((model) => model.capabilities.type === "chat");
  }

  public async completions(initiator: "agent" | "user", body: object) {
    const res = await fetch(
      "https://api.business.githubcopilot.com/chat/completions",
      {
        method: "POST",
        headers: {
          // "content-length": "100",
          Authorization: `Bearer ${this.copilotToken}`,
          "content-type": "application/json",
          "copilot-integration-id": "vscode-chat",
          "editor-plugin-version": "copilot-chat/0.27.2",
          "editor-version": "vscode/1.100.0",
          "openai-intent": "conversation-panel",
          "user-agent": "GitHubCopilotChat/0.27.2",
          "x-github-api-version": "2025-05-01",
          "x-initiator": initiator,
          "x-interaction-type": "conversation-panel",
          "x-vscode-user-agent-library-version": "electron-fetch",
          "sec-fetch-site": "none",
          "sec-fetch-mode": "no-cors",
          "sec-fetch-dest": "empty",
          "accept-encoding": "gzip, deflate, br, zstd",
          priority: "u=4, i",
        },
        body: JSON.stringify(body),
      }
    );

    // returns a text/event-stream

    if (!res.ok) {
      processApiError(res, "Failed to fetch completions");
    }

    const reader = res.body?.getReader();
    if (!reader) {
      processError("Failed to get reader from response body");
    }

    return reader;
  }
}
