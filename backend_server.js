import Anthropic from "@anthropic-ai/sdk";
import express from "express";

const app = express();

// Bulletproof CORS — manual headers on every response, explicit OPTIONS handling.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

const client = new Anthropic();

app.post("/api/chat", async (req, res) => {
  const { systemPrompt, messages } = req.body;

  if (!systemPrompt || !messages) {
    return res.status(400).json({ error: "Missing systemPrompt or messages" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages,
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    res.json({ text });
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
