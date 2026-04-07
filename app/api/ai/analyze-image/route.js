import { NextResponse } from 'next/server';
import { detectIntent } from '@/lib/ai/intentDetector';
import { searchProduct } from '@/lib/ai/productService';
import { generateProductResponse } from '@/lib/ai/responseGenerator';
import { openai } from '@/lib/ai/openaiClient';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');
    const textMessage = formData.get('message') || "What is this product?"; // Optional text context

    if (!imageFile) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    // Convert image to Base64 for OpenAI Vision API
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

    // Step 1: Detect intent and extract entities from image and text
    // The detectIntent function is designed to handle image_url content
    const aiResponse = await detectIntent(textMessage, base64Image);
    const toolCall = aiResponse.tool_calls?.[0];

    if (toolCall && toolCall.function.name === 'search_product') {
      const functionArgs = JSON.parse(toolCall.function.arguments);
      const products = await searchProduct(functionArgs.query);
      return NextResponse.json(generateProductResponse(products));
    } else {
      // If no product search intent, or other tool, just describe the image or respond generally
      // You might want to refine this to ask clarifying questions or suggest other actions.
      const chatCompletion = await openai.chat.completions.create({
        model: "llama-3.2-11b-vision-preview",
        messages: [{
          role: "user",
          content: [{ type: "text", text: textMessage || "Describe this image." }, { type: "image_url", image_url: { url: base64Image } }],
        }],
      });
      return NextResponse.json({
        intent: "image_description",
        message: chatCompletion.choices[0].message.content || "I analyzed the image, but I'm not sure what product you're looking for.",
      });
    }
  } catch (error) {
    console.error("Oge Image Analysis API Error:", error);
    return NextResponse.json({ error: "Internal server error during image analysis." }, { status: 500 });
  }
}