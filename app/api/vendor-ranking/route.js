import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const rankings = await prisma.vendorRanking.findMany({
            orderBy: { rank: 'asc' }
        });

        // Fetch usernames for linking
        const rankingsWithUsername = await Promise.all(rankings.map(async (ranking) => {
            const store = await prisma.store.findFirst({
                where: { name: ranking.name },
                select: { username: true }
            });
            return { ...ranking, username: store?.username };
        }));

        return NextResponse.json({ rankings: rankingsWithUsername });
    } catch (error) {
        console.error("Error fetching vendor rankings:", error);
        return NextResponse.json({ rankings: [] });
    }
}

export async function POST(request) {
    try {
        const { vendors } = await request.json();

        // Using transaction to ensure all updates succeed
        await prisma.$transaction(
            vendors.map(v =>
                prisma.vendorRanking.upsert({
                    where: { rank: v.rank },
                    update: { name: v.name, deals: parseInt(v.deals) },
                    create: { rank: v.rank, name: v.name, deals: parseInt(v.deals) }
                })
            )
        );

        return NextResponse.json({ success: true, message: "Vendor rankings updated" });
    } catch (error) {
        console.error("Error saving vendor rankings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
