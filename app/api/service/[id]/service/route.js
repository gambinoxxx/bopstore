import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request, { params }) {
    try {
        const { id } = await params

        const services = await prisma.product.findMany({
            where: { storeId: id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(services)
    } catch (error) {
        console.error('PUBLIC_SERVICES_GET_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}