import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import authAdmin from "@/middlewares/authAdmin"

export async function PATCH(request, { params }) {
    try {
        const { userId } = getAuth(request)
        const isAdmin = await authAdmin(userId)

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { status } = body

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const isActive = status === 'approved'

        const updatedStore = await prisma.store.update({
            where: { id },
            data: { 
                status,
                isActive
            }
        })

        return NextResponse.json(updatedStore)
    } catch (error) {
        console.error('STORE_UPDATE_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}