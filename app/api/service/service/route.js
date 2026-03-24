import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import imagekit from "@/configs/imageKit"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '6')
    const skip = (page - 1) * limit

    const { userId } = getAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the service for this user
    const service = await prisma.store.findFirst({
      where: {
        userId,
        type: 'service'
      }
    })

    if (!service || service.status !== 'approved' || !service.isActive) {
      return NextResponse.json({ error: 'Service not active or approved' }, { status: 403 })
    }

    const where = { storeId: service.id }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    })

    const totalCount = await prisma.product.count({ where })

    return NextResponse.json({
      products,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    })

  } catch (error) {
    console.error('PRODUCTS_GET_ERROR', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get the service for this user
    const service = await prisma.store.findFirst({
      where: {
        userId,
        type: 'service'
      }
    })

    if (!service || service.status !== 'approved' || !service.isActive) {
      return NextResponse.json({ error: 'Service not active or approved' }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get('name')
    const description = formData.get('description') || ''
    const category = formData.get('category')
    const price = Number(formData.get('price')) || 0
    const mrp = Number(formData.get('mrp')) || price
    const stock = parseInt(formData.get('stock') || '1')
    const imageFiles = formData.getAll('images') || []

    if (!name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Upload images
    const imageUrls = []
    if (imageFiles.length > 0) {
      for (const file of imageFiles) {
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
          imageUrls.push(url)
        }
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price,
        mrp,
        stock,
        images: imageUrls,
        storeId: service.id
      }
    })

    return NextResponse.json(product)

  } catch (error) {
    console.error('PRODUCT_CREATE_ERROR', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
