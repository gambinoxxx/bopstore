import {NextResponse} from "next/server";
import {getAuth} from "@clerk/nextjs/server";
import authSeller from "@/middlewares/authSeller";
import prisma from "@/lib/prisma";

// get dashboard data for seller (total orders ,total earning, total product )
export async function GET(request) {
    try {
        const {userId} = getAuth(request)
        const storeId = await authSeller(userId)

        if (!storeId) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
        }

        // Get only PAID orders to calculate earnings and count
        const paidOrders = await prisma.order.findMany({
            where: {
                storeId,
                isPaid: true // This is the crucial fix
            }
        });

        // Get total product count for the store
        const totalProducts = await prisma.product.count({
            where: { storeId}
        });

        // Get recent ratings for the store's products
        const ratings = await prisma.rating.findMany({
            where: { product: { storeId: storeId } },
            orderBy: { createdAt: 'desc' },
            take: 5, // Fetch the 5 most recent ratings
            include: { user: { select: { name: true, image: true } }, product: { select: { name: true } } }
        });
        
        const totalEarnings = paidOrders.reduce((acc, order) => acc + order.total, 0);
        
        const dashboardData = {
            ratings,
            totalOrders: paidOrders.length,
            totalEarnings: totalEarnings,
            totalProducts: totalProducts
        }
        return NextResponse.json({dashboardData});

    }
    catch (error){
        console.error("[SELLER_DASHBOARD_GET]", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}
