import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { Document, Packer, Paragraph, TextRun } from "docx";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate", async (req, res) => {
  try {
    const { name, age, height, weight, duration, medical, numIssues, issuesList } = req.body;

    const medicalText =
      medical === "Yes"
        ? `The client has ${numIssues} medical issue(s): ${issuesList}. Modify the plan for safety, avoid joint stress and high-impact moves, and include rehabilitation and mobility work.`
        : "The client has no medical issues or injuries.";

    const prompt = `
You are a certified personal trainer and nutritionist.

Create a detailed ${duration}-month personalized fitness + diet plan for this client:
- Name: ${name}
- Age: ${age}
- Height: ${height} cm
- Weight: ${weight} kg
- ${medicalText}

**Structure required:**
1. Each month must have:
   - Monthly Goal
   - Focus Areas (e.g., mobility, strength, fat loss)
   - Expected Progress (%)
   - 3 sessions per week (in a **table** format: Exercise | Sets | Reps | Notes)
   - Weekly variation and progression
   - Diet overview for the month (Breakfast, Lunch, Dinner, Snacks, Hydration)

2. The plan must evolve phase-wise:
   - Month 1–2: Mobility & Activation
   - Month 3–4: Strength Foundation
   - Month 5–6: Hypertrophy (muscle gain)
   - Month 7–9: Conditioning & Fat Loss
   - Month 10–12: Performance & Maintenance

3. If medical issues exist, automatically modify exercises and diet recommendations to be safe and adaptive.

Output format:
📅 Month X:
- Goal: ...
- Focus: ...
- Expected Progress: ...%
- Exercise Table
- Diet Summary
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const plan = completion.choices[0].message.content;

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: `Vishal The Training World`, bold: true, size: 36 })],
            }),
            new Paragraph({ text: `Client: ${name}` }),
            new Paragraph({ text: `Age: ${age}, Height: ${height} cm, Weight: ${weight} kg` }),
            new Paragraph({ text: `Duration: ${duration} months` }),
            new Paragraph({ text: `Medical Info: ${medicalText}` }),
            new Paragraph({ text: "" }),
            new Paragraph({ text: "Personalized 12-Month Training Plan:" }),
            new Paragraph({ text: plan }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const outputPath = path.join(__dirname, "public", `${name.replace(/\s+/g, "_")}_Plan.docx`);
    writeFileSync(outputPath, buffer);

    res.json({
      message: "✅ Plan generated successfully with monthly goals!",
      plan,
      downloadLink: `/${name.replace(/\s+/g, "_")}_Plan.docx`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "❌ Failed to generate plan" });
  }
});

app.listen(3000, () =>
  console.log("✅ Vishal The Training World running with monthly tracking → http://localhost:3000")
);
