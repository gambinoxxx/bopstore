import { NextResponse } from "next/server";
import { detectIntent } from "@/lib/ai/intentDetector";
import { extractCatalogQuery } from "@/lib/ai/catalogQuery";
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
    const safeLatitude = latitude == null ? NaN : Number(latitude);
    const safeLongitude = longitude == null ? NaN : Number(longitude);
    const hasValidCoordinates = Number.isFinite(safeLatitude) &&
      Number.isFinite(safeLongitude) &&
      safeLatitude >= -90 && safeLatitude <= 90 &&
      safeLongitude >= -180 && safeLongitude <= 180;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Resolve clear product and service requests from the Bopstore catalog first.
    // General conversation and ambiguous requests continue through the existing AI flow.
    const catalogQuery = extractCatalogQuery(message);
    const intentData = catalogQuery || await detectIntent(
      message,
      hasValidCoordinates ? { latitude: safeLatitude, longitude: safeLongitude } : null,
      history
    );

    console.log("🧠 Intent:", intentData, catalogQuery ? "(catalog engine)" : "(AI)", hasValidCoordinates ? "(location received)" : "(no location)");

    // 🧠 STEP 2: Handle intent
    switch (intentData.intent) {
      case "search_product": {
        const products = await searchProduct(intentData);

        return NextResponse.json(
          generateProductResponse(products)
        );
      }

      case "find_service": {
        const services = await findNearbyServices(
          intentData.service_type || "general",
          hasValidCoordinates ? safeLatitude : null,
          hasValidCoordinates ? safeLongitude : null,
          intentData.minRating,
          {
            locationMode: intentData.locationMode,
            locationQuery: intentData.locationQuery,
          }
        );

        const response = generateServiceResponse(services);

        if (intentData.locationMode === "nearby" && !hasValidCoordinates) {
          response.status = "missing_location";
          if (services.length > 0) {
            response.content = "I couldn't access your location, so I'm showing all available providers. Grant access to find the ones closest to you! 📍";
          }
        }

        return NextResponse.json(response);
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

        if (!userId || !customerEmail) {
          return NextResponse.json({
            intent: "book_appointment",
            status: "unauthenticated",
            content: "I've got the date, but I'll need you to sign in to Bopstore first so we can link this booking to your account! Click the sign-in button at the top to continue. 🔐"
          });
        }

        const appointment = await createAppointment(
          intentData.service_id,
          intentData.date_time,
          customerName,
          customerEmail,
          userId,
          intentData.phone,
          intentData.whatsapp,
          intentData.notes
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
