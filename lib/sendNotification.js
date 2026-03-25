import { Resend } from 'resend';

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email notification.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text body of the email.
 * @param {string} html - The HTML body of the email.
 */
export async function sendEmail({ to, subject, text, html }) {
    if (!process.env.RESEND_API_KEY) {
        console.error("RESEND_API_KEY is not set in your environment variables.");
        throw new Error("Email service is not configured. Please check server logs.");
    }

    try {
        const fromAddress = process.env.EMAIL_FROM_ADDRESS;
        const senderName = process.env.EMAIL_SENDER_NAME || 'Bopstore';

        if (!fromAddress) {
            throw new Error("EMAIL_FROM_ADDRESS is not defined.");
        }

        const { data, error } = await resend.emails.send({
            from: `${senderName} <${fromAddress}>`,
            to: [to],
            subject: subject,
            text: text,
            html: html,
        });

        if (error) {
            throw new Error(`${error.name}: ${error.message}`);
        }

        console.log(`Email successfully sent to ${to} via ${fromAddress}`);
        return data;
    } catch (error) {
        console.error(`Resend Error [To: ${to}]:`, error.message);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}