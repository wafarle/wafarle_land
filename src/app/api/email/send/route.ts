/**
 * Email Sending API Route
 * Handles all email sending using Resend service
 */

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend (API key will come from request or env)
const getResendClient = (apiKey: string) => {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Resend API key is required');
  }
  return new Resend(apiKey);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      subject,
      html,
      text,
      from,
      replyTo,
      attachments,
      apiKey,
      bcc,
      cc,
    } = body;

    // Validate required fields
    if (!to || !subject || (!html && !text) || !from) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html/text, from' },
        { status: 400 }
      );
    }

    // Check if email service is enabled (check for API key)
    if (!apiKey || apiKey.trim() === '') {
      // In development, simulate email sending
      console.log('📧 Email service not configured - simulating email:', {
        to,
        subject,
        from,
      });
      return NextResponse.json({
        success: true,
        message: 'Email sent (simulated)',
        simulated: true,
      });
    }

    // Initialize Resend client
    const resend = getResendClient(apiKey);

    // Prepare email data
    const emailData: any = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || text,
      ...(text && { text }),
      ...(replyTo && { reply_to: replyTo }),
      ...(cc && { cc: Array.isArray(cc) ? cc : [cc] }),
      ...(bcc && { bcc: Array.isArray(bcc) ? bcc : [bcc] }),
    };

    // Add attachments if provided
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      emailData.attachments = attachments.map((att: any) => ({
        filename: att.filename,
        content: att.content, // Base64 encoded content
        ...(att.path && { path: att.path }),
      }));
    }

    // Send email
    const result = await resend.emails.send(emailData);

    console.log('✅ Email sent successfully:', {
      to,
      subject,
      messageId: result.data?.id || 'unknown',
    });

    return NextResponse.json({
      success: true,
      messageId: result.data?.id,
      message: 'Email sent successfully',
    });
  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    
    // Check if it's a Resend API error
    if (error?.response?.body) {
      return NextResponse.json(
        {
          error: error.response.body.message || 'Failed to send email',
          details: error.response.body,
        },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}




