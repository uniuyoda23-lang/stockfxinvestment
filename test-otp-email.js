#!/usr/bin/env node

/**
 * Test script to verify OTP email sending functionality
 * Run this script with: node test-otp-email.js <email-address>
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.local') });

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD;
const testEmail = process.argv[2] || GMAIL_USER; // Default to sender email if no argument

console.log('\n📨 OTP Email Service Test');
console.log('═'.repeat(50));
console.log(`Gmail Account: ${GMAIL_USER}`);
console.log(`Test Email: ${testEmail}`);
console.log('═'.repeat(50) + '\n');

if (!GMAIL_USER || !GMAIL_PASSWORD) {
  console.error('❌ Gmail credentials not found in .env.local');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },
  connectionTimeout: 5000,
  socketTimeout: 5000,
  tls: {
    rejectUnauthorized: false,
  },
});

// Test SMTP connection
console.log('🔗 Testing SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Response:', error.response);
    process.exit(1);
  }

  console.log('✅ SMTP connection verified\n');

  // Send test OTP email
  console.log('📧 Sending test OTP email...');
  const testOTP = '123456';

  transporter.sendMail({
    from: GMAIL_USER,
    to: testEmail,
    subject: '[TEST] Your StockFX Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 500px; margin: 0 auto; padding: 20px; }
            .code-box { background-color: #e0f2fe; border: 2px solid #059669; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
            .code { font-size: 42px; font-weight: bold; color: #059669; font-family: monospace; letter-spacing: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Test Email - StockFX Verification</h2>
            <p>This is a test email to verify OTP functionality works.</p>
            <div class="code-box">
              <div class="code">${testOTP}</div>
            </div>
            <p>⏱️ Testing OTP: ${testOTP}</p>
            <p>If you received this email, the OTP service is working correctly!</p>
          </div>
        </body>
      </html>
    `,
  }, (error, info) => {
    if (error) {
      console.error('❌ Failed to send test email');
      console.error('   Error:', error.message);
      console.error('   Code:', error.code);
      if (error.response) {
        console.error('   Server Response:', error.response);
      }
      process.exit(1);
    }

    console.log('✅ Test email sent successfully!');
    console.log(`   Response: ${info.response || 'OK'}`);
    console.log(`   Message ID: ${info.messageId || 'N/A'}`);
    console.log('\n📬 Check your email inbox at:', testEmail);
    console.log('   (Check spam folder if not found)\n');
    process.exit(0);
  });

  // Set timeout for the script
  setTimeout(() => {
    console.error('\n⏱️  Timeout: Email sending took too long (>10 seconds)');
    console.error('   This suggests a network issue or Gmail authentication problem');
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check if Gmail credentials in .env.local are correct');
    console.error('   2. If using 2FA, verify you are using an App Password, not your regular password');
    console.error('   3. Check Gmail security settings: https://myaccount.google.com/security');
    console.error('   4. Allow "Less secure app access" if prompted');
    process.exit(1);
  }, 10000);
});
