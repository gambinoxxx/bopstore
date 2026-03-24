import prisma from '@/lib/prisma'
import ServiceClient from './ServiceClient'

export async function generateMetadata({ params }) {
    const { id } = await params
    
    const service = await prisma.store.findUnique({
        where: { id }
    })

    if (!service) {
        return {
            title: 'Service Not Found',
        }
    }

    return {
        title: `${service.name} | GoCart Services`,
        description: service.description?.substring(0, 160) || `Book ${service.name} for your needs.`,
        openGraph: {
            title: service.name,
            description: service.description?.substring(0, 160),
            images: service.images && service.images.length > 0 ? [service.images[0]] : [],
        },
    }
}

export default function ServicePage() {
    return <ServiceClient />
}
