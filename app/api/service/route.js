import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import imagekit from "@/configs/imageKit";

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const formData = await request.formData()
        const name = formData.get('name')
        const category = formData.get('category')
        const description = formData.get('description')
        const location = formData.get('location')
        const phone = formData.get('phone')
        const email = formData.get('email')
        const whatsappNumber = formData.get('whatsappNumber')
        const logoFile = formData.get('logo')

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if a store already exists for this user
        const existingStore = await prisma.store.findUnique({
            where: { userId }
        });

        if (existingStore) {
            const msg = existingStore.type === 'store' ? 'You are already registered as a Seller.' : 'You already have a Service Profile.';
            return NextResponse.json({ error: msg }, { status: 409 }); // 409 Conflict
        }

        if (!name || !category || !location || !phone || !whatsappNumber) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        let logoUrl = ''
        const imageUrls = []

        try {
            // Upload Logo to ImageKit
            if (logoFile && logoFile.size > 0) {
                const buffer = Buffer.from(await logoFile.arrayBuffer())
                const response = await imagekit.upload({
                    file: buffer,
                    fileName: logoFile.name,
                    folder: "service-logos"
                })
                
                // Optimize logo similar to store creation
                logoUrl = imagekit.url({
                    path: response.filePath,
                    transformation: [{ quality: "auto" }, { format: "Webp" }, { width: "512" }]
                })
            }
        } catch (error) {
            console.error('IMAGE_UPLOAD_ERROR', error)
            return NextResponse.json({ error: 'Image upload failed. Please check your network connection.' }, { status: 502 })
        }

        // Generate a unique username based on name + timestamp
        const username = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()

        const service = await prisma.store.create({
            data: {
                name,
                username,
                userId,
                type: 'service',
                category,
                description,
                address: location,
                contact: phone,
                whatsappNumber,
                email,
                images: imageUrls,
                logo: logoUrl,
                rating: 0,
                isActive: false, // Service must be approved by admin
                status: 'pending'
            }
        })

        return NextResponse.json(service)
    } catch (error) {
        console.error('SERVICE_CREATE_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let where = {}

    if (category && category !== 'all') {
        where.category = category
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { address: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ]
    }
    
    // Ensure we only fetch stores that are marked as services
    where.type = 'service'
    where.isActive = true // Only show active services

    try {
        const services = await prisma.store.findMany({
            where,
            include: {
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    take: 1 // Get the latest review for the card
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(services)
    } catch (error) {
        console.error('SERVICE_GET_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}