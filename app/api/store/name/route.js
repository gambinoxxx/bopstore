import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const stores = await prisma.store.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: {
                name: 'asc'
            }
        });
        return NextResponse.json({ success: true, stores });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}