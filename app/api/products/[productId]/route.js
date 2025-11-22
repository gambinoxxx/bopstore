import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

export async function GET(request, { params }) {
    try {
        // This is a workaround for a Next.js issue where params are not immediately available.
        // Awaiting a request method like .json() forces the context to be ready.
        // We wrap it in a try/catch because a GET request has no body.
        try { await request.json(); } catch (e) {}
        // Accessing the URL forces the context to be ready before we access params.
        const { searchParams } = new URL(request.url);

        const { productId } = params;

        if (!productId) {
            return new NextResponse("Product ID is required", { status: 400 });
        }

        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                rating: {
                    select: {
                        createdAt: true, rating: true, review: true,
                        user: { select: { name: true, image: true } }
                    }
                },
                store: true,
            },
        });

        if (!product) {
            // If no product is found in the database, return a 404
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        // Return the product data
        return NextResponse.json({ product });

    } catch (error) {
        console.error('[PRODUCT_GET]', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        const { userId } = auth();
        const body = await request.json();
        const { productId } = params;

        const { name, description, price, mrp, category, images, stock, isArchived, specifications } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!productId) {
            return new NextResponse("Product ID is required", { status: 400 });
        }

        // Verify the user owns the store for this product
        const storeByUserId = await prisma.store.findFirst({
            where: {
                id: body.storeId, // Assuming storeId is sent in the body
                userId,
            }
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const product = await prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                name,
                description,
                price,
                mrp,
                category,
                images,
                stock,
                isArchived,
                specifications, // This is the new field we are saving
            }
        });

        return NextResponse.json(product);

    } catch (error) {
        console.error('[PRODUCT_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}