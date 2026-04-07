import prisma from '@/lib/prisma';

/**
 * Creates a new appointment in the database.
 * @param {string} serviceId - The ID of the service provider.
 * @param {string} dateTime - The date and time for the appointment (ISO 8601 string).
 * @param {string} customerName - The customer's name.
 * @param {string} customerEmail - The customer's email.
 * @returns {Promise<object>} - The created appointment object.
 */
export async function createAppointment(serviceId, dateTime, customerName, customerEmail) {
  // You might need to fetch more customer details (phone, whatsapp) from your user session
  // or prompt the user for them in the chat UI before calling this.
  const newAppointment = await prisma.appointment.create({
    data: {
      storeId: serviceId,
      date: new Date(dateTime),
      customerName: customerName,
      customerEmail: customerEmail,
      status: 'pending', // Appointments are pending until confirmed by the provider
    },
  });
  return newAppointment;
}