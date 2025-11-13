import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const dealSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  endDate: z.string().datetime("Please provide a valid end date and time."),
});

/**
 * GET handler to fetch the current active deal.
 * It finds the most recently created deal.
 */
export async function GET() {
  try {
    const deal = await prisma.deal.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!deal) {
      // Return a default structure if no deal is found
      return NextResponse.json({ title: "", description: "", endDate: "" });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error("HOTDEAL_GET_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST handler to create or update the hot deal.
 * This logic ensures only one deal exists at a time by deleting old ones.
 */
export async function POST(req) {
  try {
    const { userId } = auth();
    // In a real app, you'd also check if the user has an 'admin' role.
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = dealSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    // To ensure there's only one active deal, delete all existing deals first.
    await prisma.deal.deleteMany({});

    // Create the new deal
    const newDeal = await prisma.deal.create({
      data: {
        ...validation.data,
      },
    });

    return NextResponse.json({ message: "Hot deal updated successfully!", deal: newDeal });

  } catch (error) {
    console.error("HOTDEAL_POST_ERROR", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
