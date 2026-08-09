import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { formatAttendanceDayLabel, normalizeAttendanceDays } from '@/lib/rsvp-days';

type EmailType = 'admin_notification' | 'guest_confirmation';

interface EmailRequestBody {
    type?: EmailType;
    email?: string;
    fullName?: string;
    guestsCount?: number;
    attendanceDays?: unknown;
}

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@obeleat50.com';
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Obele @ 50';
const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@obeleat50.com';

const buildAttendanceListHtml = (days: unknown) => {
    const normalizedDays = normalizeAttendanceDays(days);
    const labels = normalizedDays.map(formatAttendanceDayLabel);
    const displayDays = labels.length > 0 ? labels : ['Not specified'];

    return `<ul style='padding-left: 18px; margin: 8px 0 0;'>${displayDays
        .map((label) => `<li style='margin: 4px 0;'>${label}</li>`)
        .join('')}</ul>`;
};

const buildAdminHtml = (fullName: string, email: string, guestsCount: number, attendanceListHtml: string) => {
    return `
    <div style='background: #140309; padding: 40px; font-family: sans-serif; color: #F6F3EE; text-align: center;'>
        <div style='max-width: 500px; margin: 0 auto; border: 1px solid #C7A24B; padding: 30px; border-radius: 20px;'>
            <h1 style='color: #C7A24B; font-family: serif; font-style: italic; margin-bottom: 20px;'>New RSVP</h1>
            <div style='text-align: left; background: rgba(199, 162, 75, 0.1); padding: 20px; border-radius: 10px; margin-bottom: 20px;'>
                <p style='margin: 10px 0;'><strong>Guest:</strong> ${fullName}</p>
                <p style='margin: 10px 0;'><strong>Email:</strong> ${email}</p>
                <p style='margin: 10px 0;'><strong>Guest Count:</strong> ${guestsCount}</p>
                <p style='margin: 10px 0 2px;'><strong>Attendance Days:</strong></p>
                ${attendanceListHtml}
            </div>
            <p style='font-size: 14px; opacity: 0.7;'>A new guest is waiting for your approval in the admin dashboard.</p>
            <div style='margin-top: 30px;'>
                <a href='https://obeleat50.com/admin' style='background: #C7A24B; color: #140309; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-weight: bold; display: inline-block;'>Go to Dashboard</a>
            </div>
        </div>
    </div>`;
};

const buildGuestHtml = (fullName: string, attendanceListHtml: string) => {
    return `
    <div style='background: #F6F3EE; padding: 40px; font-family: sans-serif; color: #140309; text-align: center;'>
        <div style='max-width: 500px; margin: 0 auto; border: 2px solid #C7A24B; padding: 40px; border-radius: 2px;'>
            <h1 style='color: #C7A24B; font-family: serif; font-style: italic; font-weight: normal; font-size: 28px;'>You are invited</h1>
            <p style='font-size: 16px; line-height: 1.8; margin: 20px 0;'>Dear ${fullName}, we are absolutely thrilled to confirm your attendance at the 50th birthday celebration of Mrs. Obele Akinniranye.</p>
            <div style='margin: 30px 0; border-top: 1px solid #C7A24B; border-bottom: 1px solid #C7A24B; padding: 20px 0;'>
                <p style='margin: 5px 0 2px; letter-spacing: 2px; text-transform: uppercase; font-size: 12px;'>Your Selected Celebration Days</p>
                <div style='text-align: left; max-width: 360px; margin: 0 auto;'>
                    ${attendanceListHtml}
                </div>
            </div>
            <p style='font-size: 13px; opacity: 0.8;'>Further details regarding the venue and itinerary will be shared soon.</p>
            <p style='margin-top: 40px; font-family: serif; font-style: italic;'>Warm Regards,<br>The Family</p>
        </div>
        <p style='font-size: 11px; margin-top: 20px; opacity: 0.5;'>Fifty Years of Grace @ 2026</p>
    </div>`;
};

export async function POST(request: Request) {
    if (!resend) {
        return NextResponse.json(
            { success: false, message: 'RESEND_API_KEY is not configured on the server.' },
            { status: 500 }
        );
    }

    let body: EmailRequestBody;
    try {
        body = (await request.json()) as EmailRequestBody;
    } catch {
        return NextResponse.json({ success: false, message: 'Invalid JSON payload.' }, { status: 400 });
    }

    const type = body.type ?? 'admin_notification';
    const email = (body.email ?? '').trim();
    const fullName = (body.fullName ?? 'Guest').trim() || 'Guest';
    const guestsCount = Number.isFinite(body.guestsCount) ? Number(body.guestsCount) : 0;
    const attendanceListHtml = buildAttendanceListHtml(body.attendanceDays);

    if (!['admin_notification', 'guest_confirmation'].includes(type)) {
        return NextResponse.json({ success: false, message: 'Invalid email type.' }, { status: 400 });
    }

    if (!email) {
        return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
    }

    const isAdminNotification = type === 'admin_notification';
    const to = isAdminNotification ? ADMIN_NOTIFICATION_EMAIL : email;
    const subject = isAdminNotification
        ? `New RSVP Submission: ${fullName}`
        : 'RSVP Confirmed - Fifty Years of Grace';
    const html = isAdminNotification
        ? buildAdminHtml(fullName, email, guestsCount, attendanceListHtml)
        : buildGuestHtml(fullName, attendanceListHtml);

    try {
        const result = await resend.emails.send({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: [to],
            subject,
            html,
            replyTo: isAdminNotification ? email : undefined,
        });

        if ((result as any)?.error) {
            return NextResponse.json(
                { success: false, message: (result as any).error?.message || 'Resend returned an error.' },
                { status: 502 }
            );
        }

        return NextResponse.json({ success: true, provider: 'resend', message: 'Email sent successfully.' });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : 'Failed to send email.' },
            { status: 500 }
        );
    }
}
