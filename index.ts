import { authenticate } from "./src/vendor/auth";
import { loadConfig } from "./src/services/config";
import { API } from "./src/vendor/api";
import { ENV } from "./src/env";
import { createCLI, runCLI } from "./src/cli";
import { setAPI } from "./src/lib/api/singleton";
import * as Sentry from "@sentry/bun";

const VERSION = "0.0.1";

Sentry.init({
  environment: ENV.ENVIRONMENT,
  dsn: ENV.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

async function main(): Promise<void> {
  await authenticate();
  const config = await loadConfig();
  const api = new API(config.token);
  setAPI(api);

  const context = {
    config,
    api,
  };

  const cli = await createCLI(VERSION, context);
  await runCLI(cli, process.argv);
}

main().catch((error) => {
  console.error("Failed to start CLI:", error);
  process.exit(1);
});
