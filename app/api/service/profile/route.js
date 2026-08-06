import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import imagekit from "@/configs/imageKit";
import { geocodeAddress } from '@/lib/ai/geocoding';

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

        if (!service || service.type !== 'service') {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 })
        }

        return NextResponse.json(service)
    } catch (error) {
        console.error('SERVICE_PROFILE_GET_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function PATCH(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const existingService = await prisma.store.findUnique({
            where: { userId }
        })

        if (!existingService || existingService.type !== 'service') {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 })
        }

        const formData = await request.formData()
        const name = formData.get('name')
        const category = formData.get('category')
        const description = formData.get('description')
        const location = formData.get('location')
        const phone = formData.get('phone')
        const email = formData.get('email')
        const whatsappNumber = formData.get('whatsappNumber')
        const logoFile = formData.get('logo')
        const newPortfolioFiles = formData.getAll('newImages')
        const keptImages = formData.getAll('keptImages') // Array of URLs

        let logoUrl = existingService.logo
        const shouldGeocode = location && (
            location !== existingService.address ||
            existingService.latitude == null ||
            existingService.longitude == null
        )
        const geoData = shouldGeocode ? await geocodeAddress(location) : null

        if (shouldGeocode && !geoData) {
            console.warn(`SERVICE_GEOCODING_FAILED: ${location}`)
        }

        if (logoFile && logoFile.size > 0) {
             const buffer = Buffer.from(await logoFile.arrayBuffer())
             const response = await imagekit.upload({
                 file: buffer,
                 fileName: logoFile.name,
                 folder: "service-logos"
             })
             logoUrl = imagekit.url({
                 path: response.filePath,
                 transformation: [{ quality: "auto" }, { format: "Webp" }, { width: "512" }]
             })
        }

        let finalImages = [...keptImages]

        if (newPortfolioFiles && newPortfolioFiles.length > 0) {
            for (const file of newPortfolioFiles) {
                if (file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer())
                    const response = await imagekit.upload({
                        file: buffer,
                        fileName: file.name,
                        folder: "service-portfolio"
                    })
                    finalImages.push(response.url)
                }
            }
        }

        const updatedService = await prisma.store.update({
            where: { userId },
            data: {
                name,
                category,
                description,
                address: location,
                contact: phone,
                whatsappNumber,
                email,
                logo: logoUrl,
                images: finalImages,
                ...(geoData && { latitude: geoData.latitude, longitude: geoData.longitude }),
            }
        })

        return NextResponse.json(updatedService)
    } catch (error) {
        console.error('SERVICE_PROFILE_UPDATE_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
