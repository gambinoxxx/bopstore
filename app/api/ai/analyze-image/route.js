import { NextResponse } from 'next/server';
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

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${imageFile.type};base64,${base64Data}`;

    const response = await openai.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: textMessage },
            {
              type: "image_url",
              image_url: { url: dataUrl },
            },
          ],
        },
      ],
      max_tokens: 100,
    });
    
    const description = response.choices[0].message.content;
    // We'll treat image analysis as a search query based on the description
    const products = await searchProduct(description);

    return NextResponse.json({
        ...generateProductResponse(products),
        content: `I analyzed your image: ${description.slice(0, 100)}...`
    });

  } catch (error) {
    console.error("Oge Image Analysis API Error:", error);
    return NextResponse.json({ error: "Internal server error during image analysis." }, { status: 500 });
  }
}