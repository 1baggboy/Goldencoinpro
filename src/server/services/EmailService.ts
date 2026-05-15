import { Resend } from 'resend';
import { db } from '../lib/firebase';

let resendClient: Resend | null = null;

function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY is not defined.");
      return null;
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export type EmailType = 
  | 'LOGIN_ALERT' 
  | 'OTP' 
  | 'PASSWORD_RESET' 
  | 'EMAIL_VERIFICATION' 
  | 'TRANSACTION_CONFIRMATION' 
  | 'WITHDRAWAL_ALERT' 
  | 'DEPOSIT_ALERT' 
  | 'KYC_UPDATE' 
  | 'INVESTMENT_ALERT' 
  | 'SECURITY_ALERT' 
  | 'SUPPORT_REPLY' 
  | 'NEWSLETTER';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  type: EmailType;
}

export class EmailService {
  private static defaultFrom = "noreply@goldencoin.live";

  static async sendEmail(options: EmailOptions) {
    const client = getResendClient();
    if (!client) {
      console.error("Resend client not initialized.");
      return null;
    }

    const { to, subject, html, from, type } = options;
    const sender = from || this.defaultFrom;

    try {
      const { data, error } = await client.emails.send({
        from: sender,
        to: [to],
        subject,
        html,
      });

      // Log the email in database
      if (db) {
        await db.collection('emailLogs').add({
          recipient: to,
          subject,
          type,
          status: error ? 'FAILED' : 'SENT',
          messageId: data?.id || null,
          error: error?.message || null,
          createdAt: new Date(),
        });
      }

      if (error) {
        console.error(`[EmailService Error]: ${error.message}`);
        return null;
      }

      return data;
    } catch (err: any) {
      console.error("[EmailService Exception]:", err);
      return null;
    }
  }


  // Domain specific email methods
  static async sendLoginAlert(user: any, details: any) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #C9A96E; padding: 20px; text-align: center;">
          <h1 style="color: #0B0B0B; margin: 0;">Security Alert: New Login</h1>
        </div>
        <div style="padding: 30px; color: #333;">
          <p>Hello ${user.firstName || 'User'},</p>
          <p>We detected a new login to your account.</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Time:</strong> ${details.time}</p>
            <p><strong>IP Address:</strong> ${details.ip}</p>
            <p><strong>Location:</strong> ${details.location}</p>
            <p><strong>Device:</strong> ${details.device}</p>
            <p><strong>Browser:</strong> ${details.browser}</p>
          </div>
          <p>If this was not you, please secure your account immediately.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/profile/security" style="background-color: #C9A96E; color: #0B0B0B; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Secure My Account</a>
          </div>
        </div>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #999;">
          <p>&copy; ${new Date().getFullYear()} Golden Coin. All rights reserved.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: "Security Notification: New Login Detected",
      html,
      from: "security@goldencoin.live",
      type: 'LOGIN_ALERT'
    });
  }

  static async sendOTP(user: any, code: string, purpose: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #C9A96E; padding: 20px; text-align: center;">
          <h1 style="color: #0B0B0B; margin: 0;">Verification Code</h1>
        </div>
        <div style="padding: 30px; color: #333; text-align: center;">
          <p>Your verification code for ${purpose} is:</p>
          <h2 style="font-size: 32px; letter-spacing: 5px; color: #C9A96E; margin: 20px 0;">${code}</h2>
          <p>This code will expire in 10 minutes.</p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">If you did not request this code, please ignore this email.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `[Golden Coin] ${code} is your verification code`,
      html,
      type: 'OTP'
    });
  }

  static async sendTransactionAlert(user: any, tx: any) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #C9A96E; padding: 20px; text-align: center;">
          <h1 style="color: #0B0B0B; margin: 0;">Transaction Update</h1>
        </div>
        <div style="padding: 30px; color: #333;">
          <p>Hello ${user.firstName || 'User'},</p>
          <p>Your transaction has been updated.</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Amount:</strong> $${tx.amount.toLocaleString()}</p>
            <p><strong>Type:</strong> ${tx.type}</p>
            <p><strong>Status:</strong> ${tx.status}</p>
            <p><strong>Reference:</strong> ${tx.reference}</p>
            <p><strong>Date:</strong> ${new Date(tx.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;

    const subject = `Transaction ${tx.status === 'SUCCESS' ? 'Confirmed' : 'Update'}: ${tx.type}`;
    const type = tx.type === 'DEPOSIT' ? 'DEPOSIT_ALERT' : (tx.type === 'WITHDRAWAL' ? 'WITHDRAWAL_ALERT' : 'TRANSACTION_CONFIRMATION');

    return this.sendEmail({
      to: user.email,
      subject,
      html,
      from: "transactions@goldencoin.live",
      type
    });
  }

  static async sendPasswordReset(user: any, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #C9A96E; padding: 20px; text-align: center;">
          <h1 style="color: #0B0B0B; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px; color: #333; text-align: center;">
          <p>Hello ${user.firstName || 'User'},</p>
          <p>We received a request to reset your password. Click the button below to choose a new password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #C9A96E; color: #0B0B0B; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 14px; text-align: left;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 14px; text-align: left; word-break: break-all; color: #0066cc;">${resetLink}</p>
          <p style="font-size: 12px; color: #999; margin-top: 30px;">This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: "Reset your Golden Coin password",
      html,
      from: "security@goldencoin.live",
      type: 'PASSWORD_RESET'
    });
  }

  static async sendKYCAlert(user: any, status: 'APPROVED' | 'REJECTED' | 'SUBMITTED', reason?: string) {
    const statusText = status === 'APPROVED' ? 'Approved' : status === 'REJECTED' ? 'Rejected' : 'Submitted';
    
    let message = '';
    if (status === 'APPROVED') message = "Congratulations! Your identity verification has been approved. You now have full access to all Golden Coin features.";
    else if (status === 'REJECTED') message = `Unfortunately, your identity verification could not be approved at this time. ${reason ? `<br><br><strong>Reason:</strong> ${reason}` : ''}<br><br>Please try submitting again with clearer documents.`;
    else message = "We have received your KYC documents and our team is currently reviewing them. We will notify you once the process is complete.";

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #C9A96E; padding: 20px; text-align: center;">
          <h1 style="color: #0B0B0B; margin: 0;">KYC Update: ${statusText}</h1>
        </div>
        <div style="padding: 30px; color: #333;">
          <p>Hello ${user.firstName || 'User'},</p>
          <p>${message}</p>
          ${status === 'REJECTED' ? `
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/kyc" style="background-color: #0B0B0B; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Submit Again</a>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `KYC Verification ${statusText}`,
      html,
      from: "support@goldencoin.live",
      type: 'KYC_UPDATE'
    });
  }

  static async sendSecurityAlert(user: any, activity: string) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #C9A96E; padding: 20px; text-align: center;">
          <h1 style="color: #0B0B0B; margin: 0;">Security Alert</h1>
        </div>
        <div style="padding: 30px; color: #333;">
          <p>Hello ${user.firstName || 'User'},</p>
          <p>We noticed the following activity on your account:</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; font-weight: bold;">
            ${activity}
          </div>
          <p>If you made this change, no further action is required.</p>
          <p style="font-weight: bold; color: #d9534f;">If this was NOT you, please secure your account immediately or contact support.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/profile/security" style="background-color: #C9A96E; color: #0B0B0B; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Secure Account</a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: user.email,
      subject: `Security Alert: ${activity}`,
      html,
      from: "security@goldencoin.live",
      type: 'SECURITY_ALERT'
    });
  }
}
