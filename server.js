// ===================== Imports =====================
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { Document, Packer, Paragraph, TextRun } from "docx";
import dotenv from "dotenv";
import fetch from "node-fetch"; // must come after imports

// ===================== Config =====================
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); // <--- app must be defined BEFORE using it

// ===================== Middleware =====================
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// ===================== OpenAI Client =====================
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ===================== Routes =====================

// Training plan route
app.post("/generate", async (req, res) => {
  // your existing code here...
});

// Chatbot route
app.post("/chatbot", async (req, res) => {
  const userMessage = req.body.message;
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: userMessage,
        max_tokens: 200
      })
    });
    const data = await response.json();
    res.json({ reply: data.completions[0].data.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get chatbot response" });
  }
});

// ===================== Start Server =====================
app.listen(3000, () => {
  console.log("✅ Vishal The Training World running → http://localhost:3000");
});
