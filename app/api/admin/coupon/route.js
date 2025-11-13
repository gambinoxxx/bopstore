import {getAuth} from '@clerk/nextjs/server';
import prisma from "@/lib/prisma";
import {NextResponse} from "next/server";
import authAdmin from "@middlewares/authAdmin";
import { inngest } from '@/inngest/client';
import { z } from "zod";

const dealSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  description: z.string().min(10, "Description must be at least 10 characters long."),
  endDate: z.string().datetime("Please provide a valid end date and time."),
});

//add new coupon 
export async function POST(request){
    try{
        const {userId} = getAuth(request)
        const { searchParams } = request.nextUrl;
        const action = searchParams.get("action");
        const isAdmin = await authAdmin(userId)

        if(!isAdmin){
            return NextResponse.json({error: "not authorized"}, {status: 401})
        }

        const body = await request.json();

        // --- HOT DEAL LOGIC ---
        if (action === 'hotdeal') {
            const validation = dealSchema.safeParse(body); // Use the body we already read

            if (!validation.success) {
                return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
            }

            await prisma.deal.deleteMany({});

            const newDeal = await prisma.deal.create({
                data: { ...validation.data },
            });

            return NextResponse.json({ message: "Hot deal updated successfully!", deal: newDeal });
        }

        // --- EXISTING COUPON LOGIC ---
        const { coupon } = body; // Destructure coupon from the body
        if (!coupon) return NextResponse.json({error: "Coupon data is missing"}, {status: 400});

        coupon.code = coupon.code.toUpperCase()

        await prisma.coupon.create({data: coupon}).then(async(coupon)=>{
         //run inngest sheduler function to delete coupon on expiry
         await inngest.send({
            name: 'app/coupon.expired',
            data: {
                code: coupon.code,
                expires_at: coupon.expiresAt

            }

         })
        })

        return NextResponse.json({message: "coupon added successfully"}, {status: 200})

    }catch(error){
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    
    }
}
//delete coupon /api/coupon?id=couponId

export async function DELETE(request){
    try {

        const {userId} = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if(!isAdmin){
            return NextResponse.json({error: "not authorized"}, {status: 401})
        }
        const {searchParams} = request.nextUrl;
        const code = searchParams.get("code");

        await prisma.coupon.delete({where: {code}})

        return NextResponse.json({message: "coupon deleted successfully"}, {status: 200})
    }catch(error){
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
    
    }
}
//get all coupons /api/coupon
export async function GET(request){
try {
    const { searchParams } = request.nextUrl;
    const action = searchParams.get("action");

    // --- HOT DEAL GET LOGIC ---
    if (action === 'hotdeal') {
        const deal = await prisma.deal.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        if (!deal) {
            return NextResponse.json({ title: "", description: "", endDate: "" });
        }

        return NextResponse.json(deal);
    }

    // --- EXISTING COUPON GET LOGIC ---

    const {userId} = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if(!isAdmin){
            return NextResponse.json({error: "not authorized"}, {status: 401})
        }
        const coupons = await prisma.coupon.findMany({})
        return NextResponse.json({coupons}, {status: 200})
    
} catch (error) {
    console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400})
}
}
