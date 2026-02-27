import nodemailer from 'nodemailer';

const host = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
const port = parseInt(process.env.BREVO_SMTP_PORT || '587', 10);
const user = process.env.BREVO_SMTP_USER;
const pass = process.env.BREVO_SMTP_KEY;
const fromEmail = process.env.BREVO_FROM_EMAIL || user || 'noreply@example.com';
const fromName = process.env.BREVO_FROM_NAME || 'Tobo Digital';

function getTransporter() {
  if (!user || !pass) {
    return null;
  }
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: SendMailOptions): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('Email not configured (missing BREVO_SMTP_USER or BREVO_SMTP_KEY). Skip sending.');
    return false;
  }
  try {
    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });
    return true;
  } catch (err: any) {
    console.error('Email send error:', err?.message || err);
    throw err;
  }
}

export function isEmailConfigured(): boolean {
  return !!(user && pass);
}
