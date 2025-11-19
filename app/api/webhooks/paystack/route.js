import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma'; // Assuming you use Prisma

export async function POST(request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const body = await request.text();

  const hash = crypto
    .createHmac('sha512', secret)
    .update(body)
    .digest('hex');

  const signature = request.headers.get('x-paystack-signature');

  // 1. Verify the webhook signature for security
  if (hash !== signature) {
    console.error('Paystack webhook signature verification failed.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  // 2. Handle the 'charge.success' event
  if (event.event === 'charge.success') {
    const { metadata, reference } = event.data;
    const orderId = metadata.orderId; // Expect a single orderId from metadata

    // Ensure orderId is present
    if (!orderId) {
      console.error('Paystack Webhook Error: orderId not found in metadata');
      return NextResponse.json({ error: 'Missing orderId in metadata' }, { status: 400 });
    }
    
    console.log(`Webhook: Processing successful charge for reference: ${reference}, orderId: ${orderId}`);

    try {
      // Find the order that was pending
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true }, // Include items to update stock
      });

      // Only proceed if the order exists and is still pending
      if (order && order.status === 'PENDING_PAYMENT') {
        // 1. Update order status to ORDER_PLACED
        await prisma.order.update({ where: { id: orderId }, data: { status: 'ORDER_PLACED' } });

        // 2. Decrement the stock for each item in the order
        for (const item of order.orderItems) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        console.log(`Order ${orderId} confirmed and stock updated.`);
      }
    } catch (error) {
      console.error('Error processing charge.success webhook:', error);
      // Return a 500 to signal to Paystack that the webhook failed and should be retried.
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  }

  // 4. Acknowledge receipt of the event
  return NextResponse.json({ status: 'success' });
}
