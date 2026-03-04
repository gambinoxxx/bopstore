import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth, clerkClient } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { storeId, rating, comment } = body

        if (!storeId || !rating || !comment) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const client = await clerkClient()
        const clerkUser = await client.users.getUser(userId)
        const userName = clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim()
            : clerkUser.username || 'Anonymous'

        // Create review linked to the authenticated user
        // We do not use a name field from the body, ensuring authenticity
        const review = await prisma.review.create({
            data: {
                rating: Number(rating),
                comment,
                user: userName,
                storeId
            }
        })

        return NextResponse.json(review)
    } catch (error) {
        console.error('REVIEW_POST_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}