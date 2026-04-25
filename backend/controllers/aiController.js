const { GoogleGenAI } = require('@google/genai');
const CodeHistory = require("../models/CodeHistory");

exports.analyzeCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    // We make sure the API Key is provided for Gemini
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY. Please add it to your backend/.env file." });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemPrompt = `You are an expert senior software engineer.
Your task is to analyze the provided code, identify any errors, and provide a corrected version.

IMPORTANT: You must respond in STRICT JSON format matching this schema:
{
  "errors": "Detailed explanation of the errors found in the code. If no errors, state that.",
  "fixedCode": "The fully corrected code. Do NOT use markdown code blocks inside this string.",
  "suggestions": "Suggestions for improving the code.",
  "isFixed": boolean
}`;

    const userPrompt = `Language: ${language}\n\nCode to analyze:\n${code}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const aiText = response.text;

    console.log("AI RAW RESPONSE:\n", aiText); // 🔥 DEBUG

    let parsed;

    try {
      parsed = JSON.parse(aiText.trim());
    } catch (err) {
      console.log("PARSE ERROR:", err.message);

      parsed = {
        errors: "Failed to parse AI response",
        fixedCode: aiText,
        suggestions: "AI returned unexpected format"
      };
    }

    // 🔥 Save to MongoDB
    const saved = await CodeHistory.create({
      code,
      language,
      errors: parsed.errors,
      fixedCode: parsed.fixedCode,
      suggestions: parsed.suggestions
    });

    res.json(saved);

  } catch (error) {
    console.log("AI ERROR:", error.message);
    res.status(500).json({ error: "AI failed: " + error.message });
  }
};