import { loadConfig, updateConfig } from "./utils.ts";

const URL = "https://api.github.com";

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
      throw new Error(`Failed to fetch token: ${res.status} ${res.statusText}`);
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
      throw new Error(
        `Failed to fetch models: ${res.status} ${res.statusText}`
      );
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
          // "vscode-machineid": "dae49660216bf22e1736a40f46baeb46a336b33804cf18b82fda7c01bd6107ff",
          // "vscode-sessionid": "27563f38-a45a-4c59-a1ff-5c75580f41b51747967240697",
          "x-github-api-version": "2025-05-01",
          "x-initiator": initiator,
          // "x-interaction-id": "3d2b6e74-873b-42bc-8673-a1654bd43344",
          "x-interaction-type": "conversation-panel",
          // "x-request-id": "bfb16c66-734f-40dd-b2dd-385b1215baf3",
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
      throw new Error(
        `Failed to fetch completions: ${res.status} ${res.statusText}`
      );
    }

    const reader = res.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get reader from response body");
    }

    return reader;
  }
}
