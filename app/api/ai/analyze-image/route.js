import { NextResponse } from "next/server";
import { searchProduct } from "@/lib/ai/productService";
import { generateProductResponse } from "@/lib/ai/responseGenerator";
import { model } from "@/lib/ai/geminiClient";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const textMessage = formData.get('message') || "What is this product?"; // Optional text context

    if (!imageFile) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Data = buffer.toString("base64");

    // Native Gemini Vision Call
    const result = await model.generateContent([
      { text: textMessage + " Provide ONLY the exact product brand and name as searchable keywords." },
      { inlineData: { data: base64Data, mimeType: imageFile.type } },
    ]);

    const description = result.response.text();
    console.log("📸 Vision Keywords:", description);
    
    // Search using the highly accurate keywords from Gemini
    const products = await searchProduct({ query: description });

    return NextResponse.json({
        ...generateProductResponse(products),
        content: `I analyzed your image: ${description.slice(0, 100)}...`
    });

  } catch (error) {
    console.error("Oge Image Analysis API Error:", error);
    return NextResponse.json({ error: "Internal server error during image analysis." }, { status: 500 });
  }
}