# q

A custom CLI tool for GitHub Copilot Chat.

Uses GitHub Copilot Chat's API, which is not officially documented or supported by GitHub.

It's called `q` because it's the first key on the keyboard and quick to type.

This initially started as reverse engineering the GitHub Copilot Chat API to create a CLI tool that allows you to interact with it in a more convenient way. Parts of the tool are opinionated but it is designed to be flexible and extensible.

_An active GitHub Copilot subscription is required to use this tool._

_Note: Currently developed with a business GitHub Copilot subscription, so it may not work with personal subscriptions._

## ⚠️ Warnings

This tool is not affiliated with GitHub. It is a personal project that utilizes the GitHub Copilot Chat API.

This project is a **work in progress** and is under active development. Features may be incomplete, unstable, or subject to breaking changes. Use with caution and expect potential issues.

Be warned that using this tool likely goes against GitHub's Terms of Service, as it uses the API in a way that is not intended or supported by GitHub. Use at your own risk.

## Features

- ✅ List available models
- ✅ Set a default model
- ✅ Start a new chat
- ✅ List previous chats
- ✅ Use custom prompts
- ✅ Pipe input to a new chat

## Roadmap

- 🚧 MCP tools / agent mode support
- 🚧 Run the tool as a webserver
- 🚧 Distributed via npm
- 🚧 Continue a previous chat
- 🚧 Set a default prompt

## Installation

### Prerequisites

- [Bun](https://bun.sh/) runtime

### Setup

1. Clone the repository:

```bash
git clone https://github.com/frankmarazita/q.git
```

2. Navigate to the project directory:

```bash
cd q
```

3. Install dependencies:

```bash
bun install
```

_(Optional) Create an alias for the `q` command._

## Usage

### Basic Commands

View available commands:

```bash
bun run q --help
```

Start a new chat:

```bash
bun run q chat
```

### Advanced Usage

Start a chat with a custom prompt:

```bash
bun run q chat --prompt "Your custom prompt here"
```

Pipe input to start a new chat:

```bash
echo 'hello' | bun run q
# or
echo 'hello' | bun run q chat
```

List available models:

```bash
bun run q models
```

Set a default model:

```bash
bun run q set-model <model-name>
```

## Configuration

Configuration is stored in `.config/q` directory in your home folder. You can customize the default model and other settings by editing the `config.json` file.

Be mindful that your GitHub Copilot Chat API key is currently stored in plain text in the `config.json` file. Ensure that this file is kept secure and not shared publicly.

Chats are currently stored in a sqlite database located at `.config/q/q.db`. You can view and manage your chats using any SQLite database viewer. The data structure is subject to change.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

## Disclaimer

This project is not affiliated with or endorsed by GitHub. Use at your own risk and in accordance with GitHub's Terms of Service.
