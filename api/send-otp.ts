// Vercel Serverless Function to send OTP via Gmail SMTP
import nodemailer from 'nodemailer';

// Verify environment variables
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

if (!GMAIL_USER || !GMAIL_PASSWORD) {
  console.error('Missing GMAIL_USER or GMAIL_PASSWORD environment variables');
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },
}) as any;

// Verify transporter connection
transporter.verify((error: any) => {
  if (error) {
    console.error('Email service error:', error);
  } else {
    console.log('Email service ready to send messages');
  }
});

export default async function handler(req: any, res: any) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp } = req.body;

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  // Simple email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    // Send email
    await transporter.sendMail({
      from: GMAIL_USER,
      to: email,
      subject: 'Your StockFX Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
              .container { max-width: 500px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; margin-bottom: 30px; }
              .logo { font-size: 28px; font-weight: bold; color: #059669; }
              .content { background-color: #f8fafc; border-radius: 12px; padding: 30px; text-align: center; }
              .code-box { background-color: #e0f2fe; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin: 20px 0; }
              .code { font-size: 42px; font-weight: bold; color: #059669; font-family: 'Courier New', monospace; letter-spacing: 8px; }
              .timer { color: #64748b; font-size: 14px; margin: 15px 0; }
              .footer { text-align: center; color: #64748b; font-size: 12px; margin-top: 30px; }
              .warning { color: #dc2626; font-size: 13px; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">StockFX</div>
              </div>
              <div class="content">
                <h2 style="color: #1e293b; margin-top: 0;">Email Verification</h2>
                <p style="color: #64748b;">Your verification code is:</p>
                <div class="code-box">
                  <div class="code">${otp}</div>
                </div>
                <div class="timer">⏱️ This code expires in 10 minutes</div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                  Enter this code in StockFX to verify your email address and complete your registration.
                </p>
                <div class="warning">
                  🔐 Never share this code with anyone. StockFX will never ask for it.
                </div>
              </div>
              <div class="footer">
                <p>© 2026 StockFX. All rights reserved.</p>
                <p>If you didn't request this code, please ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error: unknown) {
    console.error('Failed to send OTP email:', error);
    return res.status(500).json({
      error: 'Failed to send OTP. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
