import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuth } from '@clerk/nextjs/server';
import { geocodeAddress } from '@/lib/ai/geocoding'; // Import the geocoding utility

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, address, logo, email, contact, whatsappNumber, category, type } = body;

    if (!name || !address) {
      return NextResponse.json({ error: "Name and Address are required" }, { status: 400 });
    }

    // --- Geocode the address before saving ---
    const geoData = await geocodeAddress(address);
    if (!geoData) {
      console.warn(`Could not geocode address: ${address}`);
    }

    const newStore = await prisma.store.create({
      data: {
        userId,
        name,
        description,
        address,
        logo,
        email,
        contact,
        whatsappNumber,
        category,
        type: type || "store",
        latitude: geoData?.latitude, // Save latitude
        longitude: geoData?.longitude, // Save longitude
      },
    });

    return NextResponse.json(newStore);
  } catch (error) {
    console.error("STORE_POST_ERROR", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, address, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Store ID is required" }, { status: 400 });
    }

    // --- Geocode the address if it's updated ---
    let geoData = null;
    if (address) {
      geoData = await geocodeAddress(address);
      if (!geoData) console.warn(`Could not geocode updated address: ${address}`);
    }

    const updatedStore = await prisma.store.update({
      where: { id, userId }, // Ensure user owns the store
      data: {
        ...updateData,
        address,
        ...(geoData && {
          latitude: geoData.latitude,
          longitude: geoData.longitude,
        }),
      },
    });

    return NextResponse.json(updatedStore);
  } catch (error) {
    console.error("STORE_PATCH_ERROR", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
