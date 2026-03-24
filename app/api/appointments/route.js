import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/sendNotification'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(request) {
    try {
        const { userId } = getAuth(request)
        const body = await request.json()
        const { name, email, phone, whatsapp, date, notes, storeId } = body

        if (!name || !email || !date || !storeId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const appointment = await prisma.appointment.create({
            data: {
                customerName: name,
                customerEmail: email,
                phone, 
                whatsapp,
                date: new Date(date),
                notes,
                storeId,
                status: 'pending',
                customerUserId: userId
            },
            include: {
                store: true
            }
        })

        // Try to send email notification
        try {
             const serviceName = appointment.store.name;
             const emailHtml = `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>New Appointment Request</h2>
                    <p><strong>Service:</strong> ${serviceName}</p>
                    <p><strong>Customer:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                    ${whatsapp ? `<p><strong>WhatsApp:</strong> ${whatsapp}</p>` : ''}
                    <p><strong>Date:</strong> ${new Date(date).toLocaleString()}</p>
                    ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
                    <br/>
                    <p>Please log in to your dashboard to confirm or cancel this request.</p>
                </div>
            `;
            
            if (appointment.store.email) {
                await sendEmail({
                    to: appointment.store.email,
                    subject: `New Appointment: ${name}`,
                    html: emailHtml
                })
            }
        } catch (emailError) {
            console.error("Failed to send appointment email:", emailError)
        }

        return NextResponse.json(appointment)
    } catch (error) {
        console.error('APPOINTMENT_CREATE_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}