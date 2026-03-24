import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import imagekit from "@/configs/imageKit";

export const dynamic = 'force-dynamic'

export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Strictly find the store for THIS user
        const store = await prisma.store.findUnique({
            where: { userId }
        })

        if (!store) {
            // Return a neutral response if no store exists, so the form can be shown
            return NextResponse.json({ status: 'none' })
        }

        return NextResponse.json(store)
    } catch (error) {
        console.error('STORE_CREATE_GET_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user already has ANY store record (Service or Store)
        const existingStore = await prisma.store.findUnique({
            where: { userId }
        })

        if (existingStore) {
            const msg = existingStore.type === 'service' 
                ? 'You are already registered as a Service Provider. You cannot create a Store account on this profile.' 
                : 'You already have a Store account.'
            return NextResponse.json({ error: msg }, { status: 400 })
        }

        const formData = await request.formData()
        const name = formData.get('name')
        const description = formData.get('description')
        const username = formData.get('username')
        const email = formData.get('email')
        const contact = formData.get('contact')
        const address = formData.get('address')
        const image = formData.get('image')

        let logoUrl = ''
        if (image && image.size > 0) {
            const buffer = Buffer.from(await image.arrayBuffer())
            const response = await imagekit.upload({
                file: buffer,
                fileName: `store-${userId}-${Date.now()}`,
                folder: 'store-logos'
            })
            logoUrl = response.url
        }

        await prisma.store.create({
            data: { userId, name, description, username, email, contact, address, logo: logoUrl, type: 'store', status: 'pending' }
        })

        return NextResponse.json({ message: 'Store request submitted successfully!' })
    } catch (error) {
        console.error('STORE_CREATE_POST_ERROR', error)
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
    }
}