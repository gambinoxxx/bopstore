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

        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store || store.type !== 'store') {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 })
        }

        return NextResponse.json(store)
    } catch (error) {
        console.error('STORE_GET_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}