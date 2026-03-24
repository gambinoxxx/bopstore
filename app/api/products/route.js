import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const products = await prisma.product.findMany({
            where: {
                // Let the database do the filtering for better performance
                isArchived: false,
                store: {
                    isActive: true,
                },
            },
            include: {
                rating:{
                    select: {
                        createdAt: true, rating: true, review: true, 
                        user: {select: {name: true, image: true}}
                    }
                },
                store: true, // Still include store details in the response
            },
            orderBy: { createdAt: 'desc' }     
        });

        // Filter out service products (identified by image folder 'service-products')
        const filteredProducts = products.filter(product => 
            !product.images || !product.images.some(img => img.includes('service-products'))
        );

        return NextResponse.json({ products: filteredProducts });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "An internal server error occurred"}, {status: 500 })
    }
}