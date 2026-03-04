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

        const services = await prisma.store.findMany({
            where: {
                userId,
                type: 'service'
            },
            include: {
                reviews: true
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(services)
    } catch (error) {
        console.error('MY_SERVICES_GET_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
