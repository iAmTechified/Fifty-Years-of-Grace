import { NextResponse } from 'next/server';
import { sendRsvpConfirmation } from '@/lib/email-service';

export async function POST(request: Request) {
    try {
        const { email, fullName, guestsCount } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const result = await sendRsvpConfirmation(email, fullName || 'Guest', guestsCount || 0);

        if (result.success) {
            return NextResponse.json({ message: 'Email sent successfully', data: result.data }, { status: 200 });
        } else {
            console.error('Email sending failed:', result.error);
            return NextResponse.json({ error: 'Failed to send email', details: result.error }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in send-rsvp-email route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
