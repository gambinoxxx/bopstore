import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuth } from '@clerk/nextjs/server'
import { sendEmail } from '@/lib/sendNotification'
import { getAppointmentStatusTemplate } from '@/lib/emailTemplates'

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
            data: { status },
            include: { store: true }
        })

        // --- Notify Parties of Status Update ---
        const notificationPromises = [];

        // 1. Notify Customer with Provider Contact Details
        notificationPromises.push(sendEmail({
            to: updatedAppointment.customerEmail,
            subject: `Update: Your Appointment with ${updatedAppointment.store.name} is ${status.toUpperCase()}`,
            html: getAppointmentStatusTemplate({
                customerName: updatedAppointment.customerName,
                serviceName: updatedAppointment.store.name,
                date: updatedAppointment.date,
                status: status,
                providerPhone: updatedAppointment.store.contact,
                providerWhatsapp: updatedAppointment.store.whatsappNumber
            })
        }));

        // 2. Notify Provider (Audit Log)
        if (updatedAppointment.store.email) {
            notificationPromises.push(sendEmail({
                to: updatedAppointment.store.email,
                subject: `Appointment ${status}: ${updatedAppointment.customerName}`,
                html: `<p>You have successfully <strong>${status}</strong> the appointment for ${updatedAppointment.customerName} set for ${new Date(updatedAppointment.date).toLocaleString()}.</p>`
            }));
        }

        // Await all notifications to ensure Vercel completes the task
        await Promise.all(notificationPromises).catch(err => 
            console.error("Status Update Email Error:", err)
        );

        return NextResponse.json(updatedAppointment)
    } catch (error) {
        console.error('SERVICE_ORDERS_PATCH_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}