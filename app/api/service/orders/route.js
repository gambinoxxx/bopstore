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
            where: { userId }
        })

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 })
        }

        const appointments = await prisma.appointment.findMany({
            where: { storeId: service.id },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(appointments)
    } catch (error) {
        console.error('SERVICE_ORDERS_GET_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function PATCH(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id, status } = await request.json()

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: { store: true }
        })

        if (!appointment || appointment.store.userId !== userId) {
             return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(updatedAppointment)
    } catch (error) {
        console.error('SERVICE_ORDERS_PATCH_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}