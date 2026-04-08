import { openai } from "./openaiClient";

const tools = [
  {
    type: "function",
    function: {
      name: "search_product",
      description: "Search for products in the Bopstore inventory based on keywords.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Keywords for product search (e.g., 'adidas samba')." },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_service",
      description: "Find nearby service providers like tailors or mechanics based on location.",
      parameters: {
        type: "object",
        properties: {
          service_type: { type: "string", description: "Type of service (e.g., 'tailor')." },
          latitude: { type: "number" },
          longitude: { type: "number" },
        },
        required: ["service_type", "latitude", "longitude"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description: "Add a specific product to the user's shopping cart.",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "string", description: "The unique ID of the product." },
          product_name: { type: "string" },
          quantity: { type: "number" },
        },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_appointment",
      description: "Initiate the process of booking an appointment for a service.",
      parameters: {
        type: "object",
        properties: {
          service_id: { type: "string" },
          date_time: { type: "string", description: "ISO 8601 formatted date/time." },
        },
        required: ["service_id", "date_time"],
      },
    },
  },
];

export async function detectIntent(message, location = null, history = []) {
  const messages = [
    {
      role: "system",
      content: `You are Oge, a professional Bopstore concierge. 
      ${location?.latitude && location?.longitude ? `Current Location: Lat ${location.latitude}, Lon ${location.longitude}.` : ""}
      Resolve pronouns (it, that, the brown one) using history. Use tools immediately for actions.`
    },
    ...history.slice(-6).map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content || ""
    })),
    { role: "user", content: message }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools,
      tool_choice: "auto",
      temperature: 0.1,
    });

    const responseMessage = response.choices[0].message;

    if (responseMessage.tool_calls) {
      const call = responseMessage.tool_calls[0].function;
      return {
        intent: call.name,
        ...JSON.parse(call.arguments)
      };
    }

    return {
      intent: "general",
      content: responseMessage.content
    };
  } catch (error) {
    console.error("🤖 Groq API Error:", error);
    return {
      intent: "general",
      content: "I'm having a bit of trouble thinking clearly right now. Please try again in a moment!"
    };
  }
}
