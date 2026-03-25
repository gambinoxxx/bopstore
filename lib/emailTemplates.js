/**
 * Generates a professional HTML email template for appointment status updates.
 */
export const getAppointmentStatusTemplate = ({ 
    customerName, 
    serviceName, 
    date, 
    status, 
    providerPhone, 
    providerWhatsapp 
}) => {
    const isConfirmed = status === 'confirmed';
    const isPending = status === 'pending';
    const accentColor = isPending ? '#f59e0b' : (isConfirmed ? '#10b981' : '#ef4444');
    const statusText = isPending ? 'Received' : (isConfirmed ? 'Confirmed' : 'Cancelled');
    
    const formattedDate = new Date(date).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
    });

    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background-color: ${accentColor}; padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">Appointment ${statusText}</h1>
            </div>
            
            <div style="padding: 40px 30px;">
                <p style="font-size: 18px; margin-bottom: 24px;">Hello <strong>${customerName}</strong>,</p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 30px;">
                    ${isPending 
                        ? `Your appointment request for <strong>${serviceName}</strong> has been received and is currently <strong>pending confirmation</strong>. The provider will review it shortly.` 
                        : (isConfirmed 
                            ? `Great news! Your appointment with <strong>${serviceName}</strong> has been confirmed. We look forward to seeing you.` 
                            : `We're sorry to inform you that your appointment with <strong>${serviceName}</strong> has been cancelled and cannot be processed at this time.`)}
                </p>

                <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 30px; border: 1px solid #f1f5f9;">
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Appointment Details</h3>
                    <div style="font-size: 16px; font-weight: 600; color: #1e293b;">${formattedDate}</div>
                    <div style="font-size: 14px; color: #64748b; margin-top: 4px;">Service: ${serviceName}</div>
                </div>

                ${isConfirmed && providerPhone ? `
                    <h3 style="margin: 0 0 16px 0; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Provider Contact Information</h3>
                    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin-bottom: 12px;">
                        <span style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">Direct Line</span>
                        <a href="tel:${providerPhone}" style="color: #10b981; text-decoration: none; font-weight: 700; font-size: 18px;">${providerPhone}</a>
                    </div>
                    ${providerWhatsapp ? `
                    <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px;">
                        <span style="display: block; font-size: 12px; color: #64748b; margin-bottom: 4px; text-transform: uppercase;">WhatsApp Support</span>
                        <a href="https://wa.me/${providerWhatsapp.replace(/\D/g, '')}" style="color: #059669; text-decoration: none; font-weight: 700; font-size: 16px;">Chat with Provider</a>
                    </div>` : ''}
                ` : ''}

                <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 13px;">
                    Thank you for choosing Bopstore.
                </div>
            </div>
        </div>
    `;
};