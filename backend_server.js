import Anthropic from "@anthropic-ai/sdk";
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.options('*', cors());
app.use(express.json());

const client = new Anthropic();

app.post("/api/analyze", async (req, res) => {
  const { systemPrompt, userMessage } = req.body;

  if (!systemPrompt || !userMessage) {
    return res.status(400).json({ error: "Missing systemPrompt or userMessage" });
  }

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    stream.on("text", (text) => {
      res.write(`data: ${JSON.stringify({ type: "text", text })}\n\n`);
    });

    stream.on("end", () => {
      res.write(`data: ${JSON.stringify({ type: "end" })}\n\n`);
      res.end();
    });

    stream.on("error", (error) => {
      res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
      res.end();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/chat", async (req, res) => {
  const { systemPrompt, messages } = req.body;

  if (!systemPrompt || !messages) {
    return res.status(400).json({ error: "Missing systemPrompt or messages" });
  }

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages,
    });

    stream.on("text", (text) => {
      res.write(`data: ${JSON.stringify({ type: "text", text })}\n\n`);
    });

    stream.on("end", () => {
      res.write(`data: ${JSON.stringify({ type: "end" })}\n\n`);
      res.end();
    });

    stream.on("error", (error) => {
      res.write(`data: ${JSON.stringify({ type: "error", message: error.message })}\n\n`);
      res.end();
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
