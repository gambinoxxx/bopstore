import { NextResponse } from 'next/server';
import { detectIntent } from '@/lib/ai/intentDetector';
import { searchProduct } from '@/lib/ai/productService';
import { findNearbyServices } from '@/lib/ai/serviceService';
import { createAppointment } from '@/lib/ai/bookingService';
import { generateProductResponse, generateServiceResponse } from '@/lib/ai/responseGenerator';
import { getAuth, clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma'; // Needed to fetch service details for booking confirmation

export async function POST(request) {
  try {
    const { userId } = getAuth(request); 
    const user = userId ? await clerkClient.users.getUser(userId) : null;
    const { message, latitude, longitude, history } = await request.json(); // Assume frontend sends message and optionally location

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Step 1: Detect intent and extract entities using OpenAI
    const aiResponse = await detectIntent(message, null, { latitude, longitude }, history);
    const toolCall = aiResponse.tool_calls?.[0];

    if (toolCall) {
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      switch (functionName) {
        case 'search_product': {
          const products = await searchProduct(functionArgs.query);
          return NextResponse.json(generateProductResponse(products));
        }
        case 'add_to_cart': {
          const qty = functionArgs.quantity || 1;
          return NextResponse.json({
            intent: "add_to_cart",
            status: "success",
            productId: functionArgs.product_id,
            quantity: functionArgs.quantity || 1,
            message: `Excellent choice! I've added ${qty} ${functionArgs.product_name || 'item(s)'} to your interest list. Would you like to check out now or keep looking?`,
          });
        }
        case 'find_service': {
          // Ensure location is provided for service search
          if (!latitude || !longitude) {
            return NextResponse.json({
              intent: "find_service",
              status: "missing_location",
              message: "I need your location to find nearby services. Could you please enable location services or tell me your general area?",
            });
          }
          const services = await findNearbyServices(functionArgs.service_type, latitude, longitude);
          return NextResponse.json(generateServiceResponse(services));
        }
        case 'book_appointment': {
          // For booking, we need service_id and date_time.
          // The AI might suggest this tool, but the actual booking flow might be multi-turn.
          // For simplicity, we'll assume the frontend provides these after user selection.
          // In a real chat, JOE would ask for confirmation and details.
          if (!functionArgs.service_id || !functionArgs.date_time) {
            // If user is not authenticated, prompt them to log in for booking
            if (!userId) {
              return NextResponse.json({ intent: "book_appointment", status: "unauthenticated", message: "Please log in to book an appointment." });
            }
            return NextResponse.json({
              intent: "book_appointment",
              status: "incomplete_details",
              message: "To book an appointment, I need the service ID and a preferred date/time. Please select a service from the list or provide more details.",
            });
          }

          const customerName = user?.fullName || 'Guest';
          const customerEmail = user?.primaryEmailAddress?.emailAddress;

          if (!customerEmail) {
            return NextResponse.json({ error: "User email not found for booking." }, { status: 400 });
          }

          const appointment = await createAppointment(functionArgs.service_id, functionArgs.date_time, customerName, customerEmail);
          
          // Fetch service name for confirmation message
          const service = await prisma.store.findUnique({ where: { id: functionArgs.service_id }, select: { name: true } });
          return NextResponse.json({
            intent: "book_appointment",
            status: "success",
            message: `Your appointment for ${service?.name || 'the service'} on ${new Date(functionArgs.date_time).toLocaleString()} has been requested. The provider will confirm shortly!`,
            appointmentId: appointment.id,
          });
        }
        default:
          return NextResponse.json({ intent: "unknown", message: "I'm not sure how to handle that request." });
      }
    } else {
      // If no tool call, it's a general query or a follow-up
      // You can send the responseMessage.content directly to the user
      return NextResponse.json({
        intent: "general_query",
        message: aiResponse.content || "I'm here to help! What can I do for you?",
      });
    }
  } catch (error) {
    console.error("Oge API Error:", error);
    return NextResponse.json({ error: "Internal server error. Please try again later." }, { status: 500 });
  }
}