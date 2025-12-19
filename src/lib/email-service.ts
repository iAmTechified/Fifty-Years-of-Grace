import { resend } from './resend';
import RsvpConfirmationEmail from '@/emails/RsvpConfirmation';

export async function sendRsvpConfirmation(email: string, fullName: string, guestsCount: number) {
    try {
        const data = await resend.emails.send({
            from: 'Fifty Years of Grace <onboarding@resend.dev>',
            to: email,
            subject: 'RSVP Confirmation - Fifty Years of Grace',
            react: RsvpConfirmationEmail({ fullName, guestsCount }),
        });
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send email:', error);
        return { success: false, error };
    }
}
