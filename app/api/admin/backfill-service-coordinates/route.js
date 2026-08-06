import { NextResponse } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import authAdmin from '@/middlewares/authAdmin'
import prisma from '@/lib/prisma'
import { geocodeAddress } from '@/lib/ai/geocoding'

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        if (!await authAdmin(userId)) {
            return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
        }

        const { limit = 25 } = await request.json().catch(() => ({}))
        const services = await prisma.store.findMany({
            where: {
                type: 'service',
                address: { not: '' },
                OR: [{ latitude: null }, { longitude: null }],
            },
            select: { id: true, address: true },
            take: Math.min(Math.max(Number(limit) || 25, 1), 100),
        })

        let updated = 0
        let notFound = 0

        for (const service of services) {
            const coordinates = await geocodeAddress(service.address)
            if (!coordinates) {
                notFound += 1
                continue
            }

            await prisma.store.update({
                where: { id: service.id },
                data: coordinates,
            })
            updated += 1
        }

        return NextResponse.json({ processed: services.length, updated, notFound })
    } catch (error) {
        console.error('SERVICE_COORDINATE_BACKFILL_ERROR', error)
        return NextResponse.json({ error: 'Unable to backfill service coordinates' }, { status: 500 })
    }
}
