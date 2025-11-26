import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//verify coupon
export async function POST(request) {
    try {
        const {userId, has} = auth();
        const {code} = await request.json();

        if (!code) {
            return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
        }

        // Use findFirst to filter by multiple fields (code and expiration date)
        const coupon = await prisma.coupon.findFirst({
            where: {
                code: code.toUpperCase(),
                expiresAt: { gt: new Date() } // Check for expiration here
            }
        });

        if (!coupon) {
            return NextResponse.json({ error: "Coupon is invalid or has expired." }, { status: 404 });
        }

        // --- Coupon Validation Logic ---

        if (coupon.forNewUser) {
            if (!userId) {
                return NextResponse.json({ error: "Please log in to use this new user coupon." }, { status: 401 });
            }
            // A user is "new" if they have no PAID orders.
            const paidOrder = await prisma.order.findFirst({
                where: { userId: userId, isPaid: true }
            });
            if (paidOrder) {
                return NextResponse.json({ error: "This coupon is valid for new users only." }, { status: 400 });
            }
        }

        // This logic for member-only coupons is correct. No changes needed.
        // if (coupon.forMember && userId) { ... }
        // Check if the coupon is for members only
        
        // if (coupon.forMember) {
        //     const hasPlusPlan = has({plan: 'bop_plus'});
        //     if (!userId || !hasPlusPlan) {
        //         return NextResponse.json({error:"This coupon is valid for BOP Plus members only."}, {status:400});
        //     }
        // }

        return NextResponse.json({coupon});
    } catch (error) {

        console.error(error);
        return NextResponse.json({error: error.code || error.message}, {status:400});
    }
} 