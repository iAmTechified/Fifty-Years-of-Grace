async function sendEmail(
    type: 'admin_notification' | 'guest_confirmation',
    email: string,
    fullName: string,
    guestsCount: number,
    attendanceDays: string[] = []
) {
    console.log(`[EmailService] Attempting to send ${type} to ${email}...`);

    const payload = { type, email, fullName, guestsCount, attendanceDays };
    const endpoints = ['/api/send-email', '/api/send-email.php'];
    let lastError: unknown = 'Unknown email delivery failure';

    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            let result: any;
            try {
                result = await response.json();
            } catch {
                const text = await response.text();
                const parseError = `Invalid JSON response from ${endpoint}: ${text.slice(0, 200)}`;
                console.error(`[EmailService] ${parseError}`);
                lastError = parseError;
                continue;
            }

            if (!response.ok || !result?.success) {
                const message = result?.message || `Mail endpoint returned HTTP ${response.status}`;
                console.error(`[EmailService] ${endpoint} failed for ${type} to ${email}:`, message);
                lastError = message;
                continue;
            }

            console.log(`[EmailService] SUCCESS via ${endpoint}: ${type} sent to ${email}`, result);
            return { success: true, data: result };
        } catch (error) {
            console.error(`[EmailService] FETCH FAILED for ${endpoint} while sending ${type} to ${email}:`, error);
            lastError = error;
        }
    }

    return { success: false, error: lastError };
}

export async function sendAdminNotification(email: string, fullName: string, guestsCount: number, attendanceDays: string[] = []) {
    return await sendEmail('admin_notification', email, fullName, guestsCount, attendanceDays);
}

export async function sendGuestConfirmation(email: string, fullName: string, guestsCount: number, attendanceDays: string[] = []) {
    return await sendEmail('guest_confirmation', email, fullName, guestsCount, attendanceDays);
}
