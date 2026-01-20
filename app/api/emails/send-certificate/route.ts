import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { recipientEmail, recipientName, eventName, pdfBase64 } = await request.json();

    if (!recipientEmail || !pdfBase64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Configure Nodemailer (Google SMTP)
    // Note: Assuming EMAIL_USER and EMAIL_APP_PASSWORD are in environment variables
    // Reuse existing config logic or simple setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"VGS Admin" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      subject: `Your Certificate for ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Hello ${recipientName},</h2>
          <p>Thank you for your participation in <strong>${eventName}</strong>.</p>
          <p>Please find your official certificate attached to this email.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>Green University Computer Club</strong></p>
        </div>
      `,
      attachments: [
        {
          filename: `Certificate-${eventName.replace(/\s+/g, '-')}.pdf`,
          content: pdfBase64.split('base64,')[1],
          encoding: 'base64',
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
