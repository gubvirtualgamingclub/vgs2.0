import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as nodemailer from 'nodemailer';

/**
 * API Route: Send Emails to Participants
 * Sends personalized emails to selected participants
 */
export async function POST(request: NextRequest) {
  try {
    const {
      recipients, // Array of {name, email}
      subject,
      htmlContent,
      templateId,
      googleSheetUrl,
      sentBy
    } = await request.json();

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients selected' },
        { status: 400 }
      );
    }

    if (!subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Subject and email content are required' },
        { status: 400 }
      );
    }

    // Verify email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      return NextResponse.json(
        { error: 'Email configuration missing. Please set EMAIL_USER and EMAIL_PASSWORD in .env.local' },
        { status: 500 }
      );
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      console.error('SMTP connection failed:', verifyError);
      return NextResponse.json(
        { 
          error: `Email server connection failed: ${verifyError.message}. Check your EMAIL_* settings in .env.local`,
          details: 'Make sure you are using an App Password if you have 2FA enabled on Gmail'
        },
        { status: 500 }
      );
    }

    // Send emails to all recipients
    const results = [];
    for (const recipient of recipients) {
      try {
        // Replace {{name}} placeholder with actual name
        const personalizedContent = htmlContent.replace(/\{\{name\}\}/g, recipient.name);
        
        // Add anti-spam headers and improve deliverability
        await transporter.sendMail({
          from: `"Virtual Gaming Society" <${process.env.EMAIL_USER}>`,
          to: recipient.email,
          subject: subject,
          html: personalizedContent,
          text: personalizedContent.replace(/<[^>]*>/g, ''), // Plain text version
          replyTo: process.env.EMAIL_USER,
          // Anti-spam headers
          headers: {
            'X-Mailer': 'VGS Email System',
            'X-Priority': '3',
            'Importance': 'normal',
            'X-MSMail-Priority': 'Normal',
            'Precedence': 'bulk',
            'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=unsubscribe>`,
          }
        });

        results.push({
          name: recipient.name,
          email: recipient.email,
          sent: true
        });
      } catch (error: any) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        results.push({
          name: recipient.name,
          email: recipient.email,
          sent: false,
          error: error.message
        });
      }
    }

    // Calculate status
    const successCount = results.filter(r => r.sent).length;
    const status = successCount === 0 ? 'failed' : 
                   successCount === recipients.length ? 'success' : 'partial';

    // Log the email sending activity
    const { error: logError } = await supabase
      .from('email_logs')
      .insert([{
        template_id: templateId || null,
        google_sheet_url: googleSheetUrl,
        subject,
        recipients_count: recipients.length,
        recipients_data: results,
        sent_by: sentBy,
        status,
        error_message: status === 'failed' ? 'All emails failed to send' : null
      }]);

    if (logError) {
      console.error('Error logging email send:', logError);
    }

    return NextResponse.json({
      success: true,
      status,
      results,
      summary: {
        total: recipients.length,
        sent: successCount,
        failed: recipients.length - successCount
      }
    });

  } catch (error: any) {
    console.error('Error sending emails:', error);
    return NextResponse.json(
      { 
        error: `Failed to send emails: ${error.message}. Please check your EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in .env.local`,
        details: error.message 
      },
      { status: 500 }
    );
  }
}
