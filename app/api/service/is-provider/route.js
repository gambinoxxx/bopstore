import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'

export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ isProvider: false })
        }

        const service = await prisma.store.findUnique({
            where: { userId }
        })

        if (service) {
            const isProvider = service.type === 'service' && service.status === 'approved'
            return NextResponse.json({ 
                isProvider, 
                serviceInfo: service,
                status: service.status,
                type: service.type
            })
        }

        return NextResponse.json({ isProvider: false })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}