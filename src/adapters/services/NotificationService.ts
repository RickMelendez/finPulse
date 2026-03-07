import nodemailer from 'nodemailer';

export class NotificationService {
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn('[NotificationService] Email env vars not set — skipping sendEmail');
      return;
    }
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT ?? 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({ from: SMTP_USER, to, subject, html });
    console.log(`[NotificationService] Email sent to ${to}`);
  }

  async sendSms(to: string, body: string): Promise<void> {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
      console.warn('[NotificationService] Twilio env vars not set — skipping sendSms');
      return;
    }
    // Dynamic import so missing twilio package doesn't crash startup
    const twilio = (await import('twilio')).default;
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({ from: TWILIO_FROM_NUMBER, to, body });
    console.log(`[NotificationService] SMS sent to ${to}`);
  }
}
