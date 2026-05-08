// lib/email.ts
// Email sending via nodemailer (SMTP)
// Used for: OTP delivery, reminder notifications

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendOtpEmailParams {
  to: string
  name: string
  otp: string
}

export async function sendOtpEmail({
  to,
  name,
  otp,
}: SendOtpEmailParams): Promise<void> {
  const expiryMins = process.env.OTP_EXPIRY_MINUTES || '10'

  await transporter.sendMail({
    from: `"Surabhi Alumni" <${process.env.SMTP_FROM}>`,
    to,
    subject: `Your Surabhi login OTP: ${otp}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a2e;">Hello, ${name} 👋</h2>
        <p>Your one-time password to access Surabhi Alumni Memory Book is:</p>
        <div style="
          font-size: 36px;
          font-weight: bold;
          letter-spacing: 8px;
          text-align: center;
          padding: 20px;
          background: #f4f4f8;
          border-radius: 8px;
          margin: 24px 0;
          color: #1a1a2e;
        ">
          ${otp}
        </div>
        <p style="color: #666;">This OTP is valid for <strong>${expiryMins} minutes</strong>.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #999; font-size: 12px;">Surabhi Alumni Memory Book — A legacy product of your institution.</p>
      </div>
    `,
    text: `Hello ${name},\n\nYour OTP is: ${otp}\n\nValid for ${expiryMins} minutes.\n\nIf you didn't request this, ignore this email.`,
  })
}