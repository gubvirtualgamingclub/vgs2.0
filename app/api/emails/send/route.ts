import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
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
      templateId, // Internal template ID (optional)
      googleSheetUrl,
      sentBy,
      serviceProvider: requestedServiceProvider, // 'google_smtp' | 'emailjs'
      emailJsTemplateId // Required if using EmailJS
    } = await request.json();

    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { error: 'No recipients selected' },
        { status: 400 }
      );
    }

    // Determine Service Provider
    let serviceProvider = requestedServiceProvider;
    if (!serviceProvider) {
      // Fallback: Fetch global setting
      // Use supabaseAdmin to ensure we can read settings even if RLS is strict
      const { data: setting } = await supabaseAdmin
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'email_service_provider')
        .single();

      serviceProvider = setting?.setting_value || 'google_smtp';
    }

    // ---------------------------------------------------------
    // BRANCH: EMAILJS
    // ---------------------------------------------------------
    if (serviceProvider === 'emailjs') {
      if (!emailJsTemplateId) {
        return NextResponse.json(
          { error: 'EmailJS Template ID is required when using EmailJS.' },
          { status: 400 }
        );
      }

      const serviceId = process.env.EMAILJS_SERVICE_ID;
      const publicKey = process.env.EMAILJS_PUBLIC_KEY;
      const privateKey = process.env.EMAILJS_PRIVATE_KEY;

      if (!serviceId || !publicKey || !privateKey) {
        console.error('EmailJS configuration missing in .env.local');
        return NextResponse.json(
          { error: 'EmailJS configuration missing (Service ID, Public Key, or Private Key).' },
          { status: 500 }
        );
      }

      const results = [];
      for (const recipient of recipients) {
        try {
          // Prepare EmailJS Payload
          const emailJsPayload = {
            service_id: serviceId,
            template_id: emailJsTemplateId,
            user_id: publicKey,
            accessToken: privateKey,
            template_params: {
              name: recipient.name || 'Participant',
              email: recipient.email,
              subject: subject, // Pass subject just in case template uses it
              message: htmlContent, // Pass HTML content just in case template uses it
              content: htmlContent // Alias for message
            }
          };

          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'VGS-Admin-Panel' // Good practice
            },
            body: JSON.stringify(emailJsPayload)
          });

          if (response.ok) {
            results.push({
              name: recipient.name,
              email: recipient.email,
              sent: true
            });
          } else {
            const errorText = await response.text();
            throw new Error(`EmailJS Error: ${response.status} ${errorText}`);
          }

        } catch (error: any) {
          console.error(`Failed to send email to ${recipient.email} via EmailJS:`, error);
          results.push({
            name: recipient.name,
            email: recipient.email,
            sent: false,
            error: error.message
          });
        }
      }

      // Finalize and Log
      return await finalizeAndLog(results, recipients, templateId, googleSheetUrl, subject, sentBy);
    }

    // ---------------------------------------------------------
    // BRANCH: GOOGLE SMTP (Existing Logic)
    // ---------------------------------------------------------

    if (!subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Subject and email content are required for SMTP sending.' },
        { status: 400 }
      );
    }

    // Verify email configuration (masked logging)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPass) {
      console.error('Email configuration missing in .env.local');
      return NextResponse.json(
        { error: 'Email configuration missing. Please check server logs.' },
        { status: 500 }
      );
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
    } catch (verifyError: any) {
      console.error('SMTP connection failed:', verifyError);

      const errorMessage = verifyError.message || '';
      let userFriendlyError = 'Email server connection failed.';
      let userDetails = 'Please check server logs.';

      // Check for specific Gmail Auth Error (535 5.7.8)
      if (errorMessage.includes('535') && errorMessage.includes('5.7.8')) {
        userFriendlyError = 'Authentication Failed: Invalid credentials.';
        userDetails = 'If using Gmail, you MUST use an "App Password" if 2FA is enabled. Your regular password will not work.';
      }

      return NextResponse.json(
        { 
          error: userFriendlyError,
          details: userDetails,
          raw: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
    }

    // Send emails to all recipients
    const results = [];
    for (const recipient of recipients) {
      try {
        // Replace {{name}} placeholder with actual name
        const personalizedContent = htmlContent.replace(/\{\{name\}\}/g, recipient.name || 'Participant');
        const plainText = personalizedContent.replace(/<[^>]*>/g, '');
        
        // Add anti-spam headers and improve deliverability
        await transporter.sendMail({
          from: `"Virtual Gaming Society" <${process.env.EMAIL_USER}>`,
          to: recipient.email,
          subject: subject,
          html: personalizedContent,
          text: plainText,
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

    return await finalizeAndLog(results, recipients, templateId, googleSheetUrl, subject, sentBy);

  } catch (error: any) {
    console.error('Error sending emails (Catch All):', error);
    // Ensure we always return a valid JSON response even for unexpected errors
    return NextResponse.json(
      {
        error: `Internal Server Error during email dispatch.`,
        details: process.env.NODE_ENV === 'development' ? error.message : 'Check server logs'
      },
      { status: 500 }
    );
  }
}

// Helper to consolidate logging and response
async function finalizeAndLog(results: any[], recipients: any[], templateId: any, googleSheetUrl: any, subject: string, sentBy: any) {
    // Calculate status
    const successCount = results.filter(r => r.sent).length;
    const status = successCount === 0 ? 'failed' : 
                   successCount === recipients.length ? 'success' : 'partial';

    // Log the email sending activity
    // Use supabaseAdmin to bypass RLS for logging
    const { error: logError } = await supabaseAdmin
      .from('email_logs')
      .insert([{
        template_id: templateId || null,
        google_sheet_url: googleSheetUrl,
        subject: subject || '(No Subject)',
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
}
