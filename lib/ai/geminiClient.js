import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using gemini-2.5-flash for world-class speed, stable tool calling, and advanced reasoning
export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});