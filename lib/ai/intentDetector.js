import { model } from "./geminiClient";

const tools = [
  {
    functionDeclarations: [
      {
        name: "search_product",
        description: "Search for products in the Bopstore inventory with optional filters.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: { type: "STRING", description: "Main keywords (e.g., 'adidas samba')." },
            category: { type: "STRING", description: "Product category (e.g. 'shoe', 'shirt')." },
            minPrice: { type: "NUMBER", description: "Minimum budget." },
            maxPrice: { type: "NUMBER", description: "Maximum budget." },
            isHotDeal: { type: "BOOLEAN", description: "Looking for sales or deals." }
          },
          required: ["query"],
        },
      },
      {
        name: "find_service",
        description: "Find local services (tailors, mechanics) based on user coordinates.",
        parameters: {
          type: "OBJECT",
          properties: {
            service_type: { type: "STRING" },
            latitude: { type: "NUMBER" },
            longitude: { type: "NUMBER" },
            minRating: { type: "NUMBER", description: "Min rating 1-5." }
          },
          required: ["service_type", "latitude", "longitude"],
        },
      },
      {
        name: "add_to_cart",
        description: "Add a specific product ID to the user's cart.",
        parameters: {
          type: "OBJECT",
          properties: {
            product_id: { type: "STRING" },
            product_name: { type: "STRING" },
            quantity: { type: "NUMBER" },
          },
          required: ["product_id"],
        },
      },
      {
        name: "book_appointment",
        description: "Book an appointment for a service provider.",
        parameters: {
          type: "OBJECT",
          properties: {
            service_id: { type: "STRING" },
            date_time: { type: "STRING", description: "ISO 8601 date string." },
          },
          required: ["service_id", "date_time"],
        },
      },
    ],
  },
];

export async function detectIntent(message, location = null, history = []) {
  // Gemini Requirement: History must alternate user/model and start with user.
  let chatHistory = history
    .filter(m => m.content || m.message)
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || m.message || "" }],
    }));

  const firstUserIndex = chatHistory.findIndex(m => m.role === 'user');
  chatHistory = firstUserIndex !== -1 ? chatHistory.slice(firstUserIndex) : [];

  try {
    const chat = model.startChat({
      history: chatHistory,
      tools: tools,
      systemInstruction: {
        parts: [{ text: `You are Oge, a smart, friendly shopping concierge for Bopstore.
Responsibilities:
1. Find products and nearby services.
2. Resolve pronouns (it, that, the 9060) using chat history.
3. ${location?.latitude ? `User Location: Lat ${location.latitude}, Lon ${location.longitude}.` : "Location currently unavailable."}
4. Use tools immediately for actions. For general talk, be natural and warm.` }],
      },
    });

    const result = await chat.sendMessage(message);
    const response = result.response;
    const call = response.functionCalls()?.[0];

    if (call) {
      return {
        intent: call.name,
        ...call.args
      };
    }

    return {
      intent: "general",
      content: response.text()
    };
  } catch (error) {
    console.error("🤖 Gemini API Error:", error);
    if (error.status === 429) {
      return { intent: "general", content: "I'm a bit busy right now! Give me a second to catch up." };
    }
    return {
      intent: "general",
      content: "I'm having a bit of trouble thinking clearly right now. Please try again in a moment!"
    };
  }
}
