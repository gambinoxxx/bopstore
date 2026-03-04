import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import imagekit from "@/configs/imageKit";

export async function GET(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const service = await prisma.store.findUnique({
            where: { userId }
        })

        if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

        return NextResponse.json(service)
    } catch (error) {
        console.error('SERVICE_GET_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function PATCH(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const formData = await request.formData()
        const newImages = formData.getAll('images') // Files
        const existingImages = formData.getAll('existingImages') // URLs (strings)

        // Upload new images
        const uploadedImageUrls = []
        if (newImages && newImages.length > 0) {
            for (const file of newImages) {
                if (file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer())
                    const response = await imagekit.upload({
                        file: buffer,
                        fileName: file.name,
                        folder: "service-portfolio"
                    })
                    uploadedImageUrls.push(response.url)
                }
            }
        }

        // Combine existing (kept) images and new uploaded images
        const finalImages = [...existingImages, ...uploadedImageUrls]

        const updatedService = await prisma.store.update({
            where: { userId },
            data: {
                images: finalImages
            }
        })

        return NextResponse.json(updatedService)
    } catch (error) {
        console.error('SERVICE_UPDATE_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}