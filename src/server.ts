import bodyParser from "body-parser";
import express from "express";

import { models } from "./services/models";

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendStatus(200);
});

app.get("/models", async (req, res) => {
  const resModels = await models.list();

  res.json(resModels);
});

app.put("/models/:model", async (req, res) => {
  const model = req.params.model;
  const result = await models.set(model);

  if (result.status === "error") {
    res.status(400).json({ error: result.message });
    return;
  }

  res.json({ message: `Default model set to: ${result.model}` });
});

export { app };
