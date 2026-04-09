import { NextResponse } from "next/server";
import { detectIntent } from "@/lib/ai/intentDetector";
import { searchProduct } from "@/lib/ai/productService";
import { findNearbyServices } from "@/lib/ai/serviceService";
import { createAppointment } from "@/lib/ai/bookingService";
import {
  generateProductResponse,
  generateServiceResponse,
} from "@/lib/ai/responseGenerator";
import { getAuth, currentUser } from "@clerk/nextjs/server"; // Import currentUser
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const user = userId
      ? await currentUser() // Use currentUser() for a more robust way to get user details
      : null; // currentUser() returns null if no user is signed in

    const { message, latitude, longitude, history } =
      await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 🧠 STEP 1: Detect intent (Groq version)
    const intentData = await detectIntent(
      message,
      { latitude, longitude },
      history
    );

    console.log("🧠 Intent:", intentData);

    // 🧠 STEP 2: Handle intent
    switch (intentData.intent) {
      case "search_product": {
        const products = await searchProduct(intentData);

        return NextResponse.json(
          generateProductResponse(products)
        );
      }

      case "find_service": {
        if (!latitude || !longitude) {
          return NextResponse.json({
            intent: "find_service",
            status: "missing_location",
            content:
              "I’ll need your location to find services near you 📍",
          });
        }

        const services = await findNearbyServices(
          intentData.service_type || "general",
          latitude,
          longitude,
          intentData.minRating
        );

        return NextResponse.json(
          generateServiceResponse(services)
        );
      }

      case "add_to_cart": {
        return NextResponse.json({
          intent: "add_to_cart",
          status: "success",
          productId: intentData.product_id,
          quantity: intentData.quantity || 1,
          content:
            `Nice one 😄 I’ve added ${intentData.product_name || 'that'} to your cart. Want anything else?`,
        });
      }

      case "book_appointment": {
        if (!intentData.service_id || !intentData.date_time) {
          if (!userId) {
            return NextResponse.json({
              intent: "book_appointment",
              status: "unauthenticated",
              content:
                "You’ll need to log in first so I can help you book that 👍",
            });
          }

          return NextResponse.json({
            intent: "book_appointment",
            status: "incomplete_details",
            content:
              "I need a service and time to book this. Just pick one and I’ll handle the rest 🙂",
          });
        }

        const customerName = user?.fullName || "Guest";
        const customerEmail =
          user?.primaryEmailAddress?.emailAddress;

        if (!customerEmail) {
          return NextResponse.json(
            { error: "User email not found" },
            { status: 400 }
          );
        }

        const appointment = await createAppointment(
          intentData.service_id,
          intentData.date_time,
          customerName,
          customerEmail
        );

        const service = await prisma.store.findUnique({
          where: { id: intentData.service_id },
          select: { name: true },
        });

        return NextResponse.json({
          intent: "book_appointment",
          status: "success",
          content: `You're all set 🎉 I've booked ${service?.name || "your service"} for ${new Date(intentData.date_time).toLocaleString()}. They'll confirm shortly!`,
          appointmentId: appointment.id,
        });
      }

      default:
        return NextResponse.json({
          intent: "general",
          content: intentData.content || "Hey 👋 I’m Oge. I can help you find products or services. What are you looking for today?",
        });
    }
  } catch (error) {
    console.error("🔥 Oge API Error:", error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return NextResponse.json(
      {
        error:
          "Something went wrong on my end 😅 Try again in a second.",
      },
      { status: 500 }
    );
  }
}
