import { openai } from './openaiClient';

/**
 * Defines the available tools (functions) that Oge can "call" based on user intent.
 * These descriptions are crucial for the AI to understand when and how to use them.
 */
const tools = [
  {
    type: "function",
    function: {
      name: "search_product",
      description: "Search for a product within Bopstore's inventory.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The product name or description to search for (e.g., 'white sneakers', 'leather bag').",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "find_service",
      description: "Find service providers (e.g., tailor, mechanic, carpenter) near a specified location.",
      parameters: {
        type: "object",
        properties: {
          service_type: {
            type: "string",
            description: "The type of service to find (e.g., 'tailor', 'mechanic', 'food vendor', 'carpenter', 'cleaning', 'plumbing').",
            enum: ["tailor", "mechanic", "food vendor", "carpenter", "cleaning", "plumbing"], // Use your SERVICE_CATEGORIES
          },
          latitude: {
            type: "number",
            description: "The user's current latitude for location-based search.",
          },
          longitude: {
            type: "number",
            description: "The user's current longitude for location-based search.",
          },
        },
        required: ["service_type", "latitude", "longitude"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_appointment",
      description: "Initiate the process of booking an appointment for a service. This tool is used to signal intent to book with Oge.",
      parameters: {
        type: "object",
        properties: {
          service_id: {
            type: "string",
            description: "The ID of the service provider for which to book an appointment.",
          },
          date_time: {
            type: "string",
            format: "date-time",
            description: "The preferred date and time for the appointment in ISO 8601 format (e.g., '2024-07-20T14:30:00').",
          },
        },
        required: ["service_id", "date_time"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description: "Add a specific product to the user's shopping cart when they express intent to buy or select it.",
      parameters: {
        type: "object",
        properties: {
          product_id: {
            type: "string",
            description: "The unique ID of the product.",
          },
          product_name: {
            type: "string",
            description: "The name of the product.",
          },
          quantity: {
            type: "number",
            description: "The number of items to add. Defaults to 1 if not specified.",
            minimum: 1
          }
        },
        required: ["product_id"],
      },
    },
  },
];

/**
 * Detects user intent and extracts entities using OpenAI's function calling.
 * @param {string} message - The user's text message.
 * @param {string} [imageUrl] - Optional: Base64 encoded image for vision capabilities.
 * @param {object} [location] - Optional: { latitude, longitude } of the user.
 * @param {Array} [history] - Optional: Previous messages in the conversation.
 * @returns {Promise<object>} - Structured intent and extracted entities.
 */
export async function detectIntent(message, imageUrl = null, location = null, history = []) {
  const isGroq = !!process.env.GROQ_API_KEY;

  const messages = [
    {
      role: "system",
      content: `You are Oge, a professional Bopstore concierge.
      ${location ? `The user's current location is Latitude: ${location.latitude}, Longitude: ${location.longitude}.` : ""}
      1. CRITICAL: Use 'add_to_cart' with the specific product_id from history for selection requests (e.g., "add the 9060").
      2. Use 'search_product' for new item queries (extract key terms, ignore 'new' or 'brand').
      3. Use 'find_service' for local service searches.
      4. If a tool is called, do NOT provide any text response. Output ONLY the tool call.
      5. If no tool is needed, be concise and helpful.`
    },
    ...history.slice(-6), // Provide recent context
    {
      role: "user",
      content: imageUrl ? [{ type: "text", text: message }, { type: "image_url", image_url: { url: imageUrl } }] : message,
    },
  ];

  const options = {
    model: isGroq 
      ? (imageUrl ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile") 
      : "gpt-4o",
    messages,
    tools,
    tool_choice: "auto"
  };

  const response = await openai.chat.completions.create(options);

  const responseMessage = response.choices[0].message;

  return responseMessage;
}