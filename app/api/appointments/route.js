import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/sendNotification'
import { getAuth } from '@clerk/nextjs/server'
import { getAppointmentStatusTemplate } from '@/lib/emailTemplates'

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

        // --- High Traffic Optimization: Background Email Notifications ---
        const serviceName = appointment.store.name;
        const notificationPromises = [];

        // 1. Prepare Notification for the Store/Seller
        if (appointment.store.email) {
            const sellerHtml = `
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
           notificationPromises.push(sendEmail({
               to: appointment.store.email,
               subject: `New Appointment: ${name}`,
               html: sellerHtml
           }));
        }

        // 2. Prepare Confirmation for the Customer
        const customerHtml = getAppointmentStatusTemplate({
            customerName: name,
            serviceName: serviceName,
            date: date,
            status: 'pending'
        });

        notificationPromises.push(sendEmail({
            to: email,
            subject: `Your Appointment at ${serviceName} is Pending Confirmation`,
            html: customerHtml
        }));

        // --- Vercel Optimization ---
        // On Vercel, we MUST await these or the serverless function 
        // will kill the process before the email is sent.
        await Promise.all(notificationPromises).catch(err => 
            console.error("Appointment Email Error:", err)
        );

        // Respond immediately to the user
        return NextResponse.json(appointment)
    } catch (error) {
        console.error('APPOINTMENT_CREATE_ERROR', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}