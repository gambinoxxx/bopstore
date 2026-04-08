import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using gemini-2.0-flash for high-speed, stable tool calling and vision
export const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});