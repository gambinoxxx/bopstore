import prisma from '@/lib/prisma';

/**
 * Creates a new appointment in the database.
 * @param {string} serviceId - The ID of the service provider.
 * @param {string} dateTime - The date and time for the appointment (ISO 8601 string).
 * @param {string} customerName - The customer's name.
 * @param {string} customerEmail - The customer's email.
 * @param {string} [userId] - The Clerk User ID.
 * @param {string} [phone] - Customer phone number.
 * @param {string} [whatsapp] - Customer WhatsApp number.
 * @param {string} [notes] - Additional notes.
 * @returns {Promise<object>} - The created appointment object.
 */
export async function createAppointment(serviceId, dateTime, customerName, customerEmail, userId, phone, whatsapp, notes) {
  const newAppointment = await prisma.appointment.create({
    data: {
      storeId: serviceId,
      date: new Date(dateTime),
      customerName: customerName,
      customerEmail: customerEmail,
      customerUserId: userId,
      phone: phone || null,
      whatsapp: whatsapp || null,
      notes: notes || null,
      status: 'pending', // Appointments are pending until confirmed by the provider
    },
  });
  return newAppointment;
}