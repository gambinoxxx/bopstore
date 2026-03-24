import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const service = await prisma.store.findUnique({
            where: { userId },
            include: {
                reviews: true
            }
        })

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 })
        }

        // Fetch counts. Note: Ensure Inquiry and Appointment models exist in your schema.prisma
        const appointmentsCount = await prisma.appointment.count({ where: { storeId: service.id } }).catch(() => 0)

        const dashboardData = {
            appointments: appointmentsCount,
            rating: service.rating || 0,
            reviews: service.reviews.length
        }

        return NextResponse.json(dashboardData)
    } catch (error) {
        console.error('DASHBOARD_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}