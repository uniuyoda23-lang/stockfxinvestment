// Development API server for OTP email sending
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';
import { sendOTPCode } from './dev-otp-codes.js';

dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;

console.log('🔧 OTP Email Service');
console.log('📧 Gmail Account:', GMAIL_USER);

let transporter;

if (GMAIL_USER && GMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  transporter.verify((error) => {
    if (error) {
      console.error('❌ Email service error:', error);
    } else {
      console.log('✅ Email service ready');
    }
  });
} else {
  console.warn('⚠️  Gmail credentials not found in .env.local');
}

app.post('/send-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (!transporter) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    // Send email with OTP
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

    console.log(`✅ OTP sent to ${email}`);
    console.log(`   📧 Code: ${otp}`);
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to send OTP:', errorMessage);
    res.status(500).json({
      error: 'Failed to send OTP. Please try again.',
      details: errorMessage,
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 OTP Email Server running on http://localhost:${PORT}`);
  console.log('Ready to send emails\n');
});
