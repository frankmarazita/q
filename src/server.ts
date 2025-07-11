import bodyParser from "body-parser";
import express, { type Request, type Response } from "express";

import { models } from "./services/models";
import { processChat } from "./services/chat";
import { validateReq, validateParams } from "./lib/api/validation";
import { requestLogger } from "./lib/api/logging";
import {
  zChatReq,
  type ChatReq,
  type ChatRes,
  type ErrorRes,
  type ModelsRes,
  type SetModelRes,
} from "./lib/api/types";
import { z } from "zod";

const app = express();

app.use(bodyParser.json());
app.use(requestLogger);

// Basic health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.sendStatus(200);
});

// Endpoint to list available models
app.get(
  "/models",
  async (_req: Request, res: Response<ModelsRes | ErrorRes>) => {
    const resModels = await models.list();

    if (resModels.status === "error") {
      const errorRes: ErrorRes = { error: resModels.message };
      res.status(500).json(errorRes);
      return;
    }

    const successRes: ModelsRes = {
      status: "success",
      data: resModels.data,
    };
    res.json(successRes);
  }
);

// Endpoint to set the default model
const zModelParams = z.object({
  model: z.string().min(1, "Model parameter is required"),
});

app.put(
  "/models/:model",
  validateParams(zModelParams),
  async (req: Request, res: Response<SetModelRes | ErrorRes>) => {
    const { model } = req.params as { model: string };
    const result = await models.set(model);

    if (result.status === "error") {
      const errorRes: ErrorRes = { error: result.message };
      res.status(400).json(errorRes);
      return;
    }

    const successRes: SetModelRes = {
      message: `Default model set to: ${result.data}`,
    };
    res.json(successRes);
  }
);

// Endpoint to process chat requests
app.post(
  "/chat",
  validateReq(zChatReq),
  async (
    req: Request<object, ChatRes | ErrorRes, ChatReq>,
    res: Response<ChatRes | ErrorRes>
  ) => {
    try {
      const { prompt, input } = req.body;
      const result = await processChat({ input, prompt });

      if (result.status === "error") {
        const errorRes: ErrorRes = { error: result.message };
        res.status(500).json(errorRes);
        return;
      }

      const { chatId, result: reply } = result.data;

      if (reply.type === "message") {
        const successRes: ChatRes = {
          message: reply.message,
          chatId: chatId,
        };
        res.json(successRes);
      } else if (reply.type === "tool-calls") {
        const errorRes: ErrorRes = {
          error: "Tool calls not supported in API mode",
        };
        res.status(501).json(errorRes);
      } else {
        const errorRes: ErrorRes = { error: "Unknown response type" };
        res.status(500).json(errorRes);
      }
    } catch (error) {
      console.error("Chat API error:", error);
      const errorRes: ErrorRes = { error: "Internal server error" };
      res.status(500).json(errorRes);
    }
  }
);

export { app };
