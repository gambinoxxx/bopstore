import nodemailer from 'nodemailer';

/**
 * Sends an email notification.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The plain text body of the email.
 * @param {string} html - The HTML body of the email.
 */
export async function sendEmail({ to, subject, text, html }) {
    // --- Add validation for environment variables ---
    const emailUser = process.env.EMAIL_USER?.trim();
    const emailPass = process.env.EMAIL_PASS?.trim();

    if (!emailUser || !emailPass) {
        console.error("Email credentials (EMAIL_USER, EMAIL_PASS) are not set in your environment variables.");
        throw new Error("Email service is not configured. Please check server logs.");
    }

    const transporter = nodemailer.createTransport({
        // Using the 'service' option is more reliable for well-known providers like Gmail
        service: "gmail",
        auth: {
            user: emailUser,
            pass: emailPass,
        },
    });

    try {
        await transporter.sendMail({
            from: `"${process.env.EMAIL_SENDER_NAME || 'Bopstore'}" <${emailUser}>`,
            to,
            subject,
            text,
            html,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        
        if (error.code === 'EAUTH') {
            console.error("Authentication failed. Please check your EMAIL_USER and EMAIL_PASS (use a Gmail App Password).");
        }
        
        // Re-throw the error so the calling function knows the email failed.
        throw new Error(`Failed to send email. Please check server logs for details.`);
    }
}