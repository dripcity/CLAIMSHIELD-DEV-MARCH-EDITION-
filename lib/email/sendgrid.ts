import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface EmailOptions {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  const msg = {
    to: options.to,
    from: options.from,
    subject: options.subject,
    html: options.html,
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export function generateReportEmailHtml({
  ownerName,
  vehicleInfo,
  dvAmount,
  reportUrl,
}: {
  ownerName: string;
  vehicleInfo: string;
  dvAmount: string;
  reportUrl: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ClaimShield DV Report</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">ClaimShield DV Report</h1>
      
      <p>Dear ${ownerName},</p>
      
      <p>Your diminished value appraisal report is ready for review.</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2 style="margin: 0 0 10px 0;">Vehicle Information</h2>
        <p style="margin: 5px 0;">${vehicleInfo}</p>
      </div>
      
      <div style="background: #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h2 style="color: white; margin: 0;">Calculated Diminished Value</h2>
        <p style="color: white; font-size: 32px; font-weight: bold; margin: 10px 0;">${dvAmount}</p>
      </div>
      
      <p>You can view and download your report by clicking the button below:</p>
      
      <a href="${reportUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">Download Report</a>
      
      <p>This report is valid for 7 days. After that, you can log in to your ClaimShield DV account to access it again.</p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
      
      <p style="font-size: 12px; color: #6b7280;">
        If you have any questions about your appraisal, please contact us.<br>
        Thank you for using ClaimShield DV!
      </p>
    </body>
    </html>
  `;
}

export function generateWelcomeEmailHtml({ userName }: { userName: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to ClaimShield DV</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">Welcome to ClaimShield DV!</h1>
      
      <p>Hi ${userName},</p>
      
      <p>Thank you for creating an account with ClaimShield DV. We're excited to help you fight for the diminished value compensation you deserve.</p>
      
      <h2 style="color: #1e40af;">What You Can Do With ClaimShield DV:</h2>
      <ul>
        <li>Create professional diminished value appraisal reports</li>
        <li>Use AI to extract data from repair estimates and documents</li>
        <li>Generate legally-defensible reports with state-specific citations</li>
        <li>Download comprehensive 15-25 page PDF reports</li>
        <li>Generate demand letters and legal documents</li>
      </ul>
      
      <p>Get started by creating your first appraisal report.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Get Started</a>
      
      <p>Thank you for choosing ClaimShield DV!</p>
    </body>
    </html>
  `;
}

export function generatePaymentConfirmationEmailHtml({
  userName,
  planType,
  amount,
}: {
  userName: string;
  planType: string;
  amount: string;
}) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Confirmation - ClaimShield DV</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e40af;">Payment Confirmation</h1>
      
      <p>Hi ${userName},</p>
      
      <p>Thank you for your payment! Your payment of <strong>${amount}</strong> for the ${planType} plan has been processed successfully.</p>
      
      <p>Your account has been updated and you now have access to all ${planType} features.</p>
      
      <p>You can start creating appraisal reports right away.</p>
      
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
      
      <p>If you have any questions, please don't hesitate to contact us.</p>
    </body>
    </html>
  `;
}
