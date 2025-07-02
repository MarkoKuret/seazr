'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
  try {
    const data = await resend.emails.send({
      from: 'Seazr <noreply@seazr.io>',
      to,
      subject,
      text,
      html: html || text.replace(/\n/g, '<br>'),
    });

    if (data.error) {
      console.error('Error sending email:', data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending email'
    };
  }
}