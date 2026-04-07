import { model } from "./geminiClient";

export async function detectIntent(message, location = null, history = []) {
  const prompt = `
You are Oge, a smart, friendly shopping assistant for Bopstore.

You talk like a real helpful human — warm, casual, and clear. Never robotic.

Analyze the user message and return ONLY valid JSON in this format:

{
  "intent": "search_product | find_service | add_to_cart | book_appointment | general",
  "query": "...",
  "service_type": "...",
  "product_name": "...",
  "confidence": 0-1
}

Rules:
- If user wants to buy or see products → search_product
- If user wants nearby services → find_service
- If user says "add this" → add_to_cart
- If unclear → general
- Keep JSON clean. NO explanation.

User message: "${message}"
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const json = JSON.parse(text);
    return json;
  } catch (err) {
    console.error("Gemini JSON parse error:", text);
    return { intent: "general", query: message };
  }
}
