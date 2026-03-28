import nodemailer from "nodemailer";
import crypto from "crypto";

const PLACEHOLDER_GMAIL_USER = "your-email@gmail.com";
const PLACEHOLDER_GMAIL_PASSWORD = "your-app-password";

export class EmailServiceError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "EmailServiceError";
    this.code = code;
  }
}

function getSmtpAuth() {
  const user = String(process.env.GMAIL_USER || "").trim();
  const rawPassword = String(process.env.GMAIL_PASSWORD || "").trim();

  // Gmail app passwords may be pasted with spaces.
  const pass = rawPassword.replace(/\s+/g, "");

  return { user, pass };
}

export function isEmailServiceConfigured(): boolean {
  const { user, pass } = getSmtpAuth();
  return (
    Boolean(user) &&
    Boolean(pass) &&
    user !== PLACEHOLDER_GMAIL_USER &&
    pass !== PLACEHOLDER_GMAIL_PASSWORD
  );
}

function createTransporter() {
  const { user, pass } = getSmtpAuth();

  if (!isEmailServiceConfigured()) {
    throw new EmailServiceError(
      "EMAIL_SERVICE_NOT_CONFIGURED",
      "Email service is not configured. Set GMAIL_USER and GMAIL_PASSWORD with a valid Gmail app password.",
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Generate a verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate verification link
 */
export function getVerificationLink(
  token: string,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
): string {
  return `${baseUrl}/verify-email?token=${token}`;
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  fullName: string,
  verificationLink: string,
): Promise<void> {
  const transporter = createTransporter();
  const { user } = getSmtpAuth();
  const subject = "Verify Your Email Address - Faculty Portal";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { border: 1px solid #ddd; padding: 30px; background-color: #f9fafb; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 20px; }
          .note { background-color: #fef3c7; padding: 10px; border-left: 4px solid #f59e0b; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Faculty Portal</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>Thank you for registering with our Faculty Portal. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 3px;">
              ${verificationLink}
            </p>
            
            <div class="note">
              <strong>Important:</strong> Once you verify your email, your profile will be sent for admin approval. You'll be able to login once the admin approves your account.
            </div>
            
            <p>This verification link will expire in 24 hours.</p>
            
            <p>If you didn't create this account, please ignore this email.</p>
            
            <p>Best regards,<br/>Faculty Portal Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Faculty Portal. All rights reserved.</p>
            <p>Do not reply to this email.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: user,
      to: email,
      subject,
      html: htmlContent,
    });
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error);
    throw new EmailServiceError(
      "EMAIL_DELIVERY_FAILED",
      "Failed to send verification email",
    );
  }
}

/**
 * Send admin approval notification email
 */
export async function sendApprovalEmail(
  email: string,
  fullName: string,
  status: "approved" | "rejected",
): Promise<void> {
  const transporter = createTransporter();
  const { user } = getSmtpAuth();
  const subject =
    status === "approved"
      ? "Account Approved - Faculty Portal"
      : "Account Rejected - Faculty Portal";

  const htmlContent =
    status === "approved"
      ? `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { border: 1px solid #ddd; padding: 30px; background-color: #f9fafb; }
          .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Approved!</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>Great news! Your account on the Faculty Portal has been approved by the administrator.</p>
            <p>You can now log in and start using the portal.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/login" class="button">Go to Login</a>
            </div>
            
            <p>If you have any questions, please contact the administrator.</p>
            <p>Best regards,<br/>Faculty Portal Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Faculty Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `
      : `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { border: 1px solid #ddd; padding: 30px; background-color: #f9fafb; }
          .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Rejected</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${fullName}</strong>,</p>
            <p>Unfortunately, your account on the Faculty Portal has been rejected by the administrator.</p>
            <p>If you believe this is a mistake or have questions, please contact the administrator.</p>
            <p>Best regards,<br/>Faculty Portal Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Faculty Portal. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: user,
      to: email,
      subject,
      html: htmlContent,
    });
    console.log(`Approval email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send approval email to ${email}:`, error);
    throw new EmailServiceError(
      "EMAIL_DELIVERY_FAILED",
      "Failed to send approval email",
    );
  }
}
