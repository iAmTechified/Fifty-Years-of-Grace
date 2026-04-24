async function sendEmail(
    type: 'admin_notification' | 'guest_confirmation',
    email: string,
    fullName: string,
    guestsCount: number,
    attendanceDays: string[] = []
) {
    console.log(`[EmailService] Attempting to send ${type} to ${email}...`);
    
    try {
        const response = await fetch('/api/send-email.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, email, fullName, guestsCount, attendanceDays }),
        });

        const result = await response.json();
        
        if (result.success) {
            console.log(`[EmailService] SUCCESS: ${type} sent to ${email}`, result);
            return { success: true, data: result };
        } else {
            console.error(`[EmailService] SERVER ERROR while sending ${type} to ${email}:`, result.message);
            return { success: false, error: result.message };
        }
    } catch (error) {
        console.error(`[EmailService] FETCH FAILED while sending ${type} to ${email}:`, error);
        return { success: false, error };
    }
}

export async function sendAdminNotification(email: string, fullName: string, guestsCount: number, attendanceDays: string[] = []) {
    return await sendEmail('admin_notification', email, fullName, guestsCount, attendanceDays);
}

export async function sendGuestConfirmation(email: string, fullName: string, guestsCount: number, attendanceDays: string[] = []) {
    return await sendEmail('guest_confirmation', email, fullName, guestsCount, attendanceDays);
}
