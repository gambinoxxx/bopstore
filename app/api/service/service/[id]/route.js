import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import imagekit from "@/configs/imageKit";

export async function GET(request, { params }) {
    try {
        const { userId } = getAuth(request)
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params

        const product = await prisma.product.findUnique({
            where: { id }
        })

        if (!product) {
            return NextResponse.json({ error: 'Service offering not found' }, { status: 404 })
        }

        // Security check: ensure the user owns the store this product belongs to
        const store = await prisma.store.findUnique({ where: { id: product.storeId } })
        if (!store || store.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        return NextResponse.json(product)
    } catch (error) {
        console.error('PRODUCT_GET_SINGLE_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function PATCH(request, { params }) {
    try {
        const { userId } = getAuth(request)
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params

        // Security check: ensure the user owns the store this product belongs to
        const productToUpdate = await prisma.product.findUnique({ where: { id } })
        if (!productToUpdate) {
            return NextResponse.json({ error: 'Service offering not found' }, { status: 404 })
        }
        const store = await prisma.store.findUnique({ where: { id: productToUpdate.storeId } })
        if (!store || store.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const formData = await request.formData()
        const name = formData.get('name')
        const description = formData.get('description')
        const price = parseFloat(formData.get('price') || '0')
        const mrp = parseFloat(formData.get('mrp') || '0')
        const category = formData.get('category')
        const stock = parseInt(formData.get('stock') || '1')
        
        const newImageFiles = formData.getAll('newImages')
        const keptImages = formData.getAll('keptImages') // URLs of images to keep

        if (!name || !category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        let finalImageUrls = [...keptImages]

        if (newImageFiles && newImageFiles.length > 0) {
            for (const file of newImageFiles) {
                if (file.size > 0) {
                    const buffer = Buffer.from(await file.arrayBuffer())
                    const response = await imagekit.upload({
                        file: buffer,
                        fileName: file.name,
                        folder: "service-products"
                    })
                    const url = imagekit.url({
                        path: response.filePath,
                        transformation: [{ quality: "auto" }, { format: "Webp" }, { width: "1024" }]
                    })
                    finalImageUrls.push(url)
                }
            }
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name, description: description || '', price, mrp: mrp || price, category, stock, images: finalImageUrls
            }
        })

        return NextResponse.json(updatedProduct)
    } catch (error) {
        console.error('PRODUCT_UPDATE_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function DELETE(request, { params }) {
    try {
        const { userId } = getAuth(request)
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { id } = await params

        const service = await prisma.store.findUnique({ where: { userId } })
        if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })

        const product = await prisma.product.findUnique({ where: { id } })
        if (!product || product.storeId !== service.id) {
            return NextResponse.json({ error: 'Product not found or unauthorized' }, { status: 404 })
        }

        await prisma.product.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PRODUCT_DELETE_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}