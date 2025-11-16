import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
 const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
 
 if (!WEBHOOK_SECRET) {
  throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local'); 
}

    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400
        });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

// Create a new Svix instance with your secret.
 const wh = new Webhook(WEBHOOK_SECRET);

 let evt;

    // Verify the payload with the headers
    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occured', {
            status: 400
        });
    }

    const eventType = evt.type;

    // Using a switch for better readability and organization
    switch (eventType) {
        case 'user.created':
        case 'user.updated': {
            const { id, email_addresses, image_url, first_name, last_name } = evt.data;

            // Use upsert to handle both creation and updates in one go.
            // This is more resilient, as it can handle webhooks arriving out of order.
            await prisma.user.upsert({
                where: { id: id },
                update: {
                    email: email_addresses[0].email_address,
                    name: `${first_name} ${last_name}`.trim() || 'New User',
                    image: image_url,
                },
                create: {
                    id: id,
                    email: email_addresses[0].email_address,
                    name: `${first_name} ${last_name}`.trim() || 'New User',
                    image: image_url,
                },
            });

            const message = eventType === 'user.created' ? 'User created.' : 'User updated.';
            const status = eventType === 'user.created' ? 201 : 200;
            return NextResponse.json({ success: true, message }, { status });
        }

        case 'user.deleted': {
            const { id } = evt.data;
            // Use deleteMany to avoid errors if the user is already deleted.
            await prisma.user.deleteMany({
                where: { id: id },
            });

            return NextResponse.json({ success: true, message: 'User deleted.' }, { status: 200 });
        }
    }

return NextResponse.json({ success: false, message: 'Unhandled event type.' }, { status: 400 });
}
