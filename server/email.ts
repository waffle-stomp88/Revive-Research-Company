import * as nodemailer from 'nodemailer';

// Email configuration
const EMAIL_CONFIG = {
  from: {
    orders: 'orders@reviveresearch.co',
  },
  replyTo: 'support@reviveresearch.co',
  brand: {
    name: 'Revive Research',
    primaryColor: '#E7FB10',
    accentColor: '#21d8ff',
    backgroundColor: '#1a1a1f',
    cardColor: '#252529',
  },
} as const;

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Generate short order reference from UUID (last 8 characters, uppercase)
export function getShortOrderRef(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

// Create reusable transporter using Amazon SES SMTP
function createTransporter() {
  const host = process.env.SES_SMTP_HOST;
  const port = parseInt(process.env.SES_SMTP_PORT || '587');
  const user = process.env.SES_SMTP_USERNAME;
  const pass = process.env.SES_SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error('Missing SES SMTP configuration. Required: SES_SMTP_HOST, SES_SMTP_USERNAME, SES_SMTP_PASSWORD');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const fromEmail = process.env.SES_FROM_EMAIL;
  
  if (!fromEmail) {
    const error = 'Missing SES_FROM_EMAIL environment variable';
    console.error('[Email Error]', error);
    return { success: false, error };
  }

  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
    };

    console.log(`[Email] Sending email to ${options.to} with subject: "${options.subject}"`);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`[Email] Successfully sent. MessageId: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown email error';
    console.error('[Email Error]', errorMessage);
    console.error('[Email Error Details]', error);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Email template: Order Confirmation
function getOrderConfirmationTemplate(order: {
  email: string;
  firstName: string;
  lastName: string;
  productId: string;
  quantity: number;
  totalAmount: string;
  id: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}, productName?: string): { subject: string; text: string; html: string } {
  const shortRef = getShortOrderRef(order.id);
  const { brand } = EMAIL_CONFIG;
  const hasFirstName = order.firstName && order.firstName.trim().length > 0;
  const greeting = hasFirstName 
    ? `Thank you for your order, ${order.firstName}!` 
    : 'Thank you for your order!';
  
  const subject = `Order Confirmation — ${brand.name} (#${shortRef})`;
  
  const text = `
${greeting}

ORDER DETAILS
-------------
Order Number: #${shortRef}
Product: ${productName || order.productId}
Quantity: ${order.quantity}
Total: $${order.totalAmount}

SHIPPING ADDRESS
----------------
${order.firstName} ${order.lastName}
${order.address || ''}
${order.city || ''}, ${order.state || ''} ${order.zipCode || ''}
${order.country || ''}

Your order is being prepared and will ship within 24 hours.

IMPORTANT NOTICE
----------------
All products are for research purposes only.
Not for human or animal consumption.

Questions? Reply to this email or contact us at ${EMAIL_CONFIG.replyTo}

Thank you for choosing ${brand.name}.
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: ${brand.backgroundColor}; color: #ffffff; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: ${brand.cardColor}; border-radius: 8px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, ${brand.primaryColor} 0%, ${brand.accentColor} 100%); padding: 30px; text-align: center;">
      <h1 style="color: ${brand.backgroundColor}; margin: 0; font-size: 28px; font-weight: bold;">${brand.name.toUpperCase()}</h1>
    </div>
    
    <div style="padding: 30px;">
      <h2 style="color: ${brand.primaryColor}; margin: 0 0 20px 0;">${greeting}</h2>
      
      <div style="background-color: ${brand.backgroundColor}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: ${brand.accentColor}; margin: 0 0 15px 0; font-size: 16px;">ORDER DETAILS</h3>
        <table style="width: 100%; color: #ffffff;">
          <tr>
            <td style="padding: 8px 0; color: #888;">Order Number:</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold;">#${shortRef}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Product:</td>
            <td style="padding: 8px 0; text-align: right;">${productName || order.productId}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #888;">Quantity:</td>
            <td style="padding: 8px 0; text-align: right;">${order.quantity}</td>
          </tr>
          <tr style="border-top: 1px solid #333;">
            <td style="padding: 12px 0; color: #888; font-weight: bold;">Total:</td>
            <td style="padding: 12px 0; text-align: right; font-weight: bold; color: ${brand.primaryColor}; font-size: 18px;">$${order.totalAmount}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: ${brand.backgroundColor}; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: ${brand.accentColor}; margin: 0 0 15px 0; font-size: 16px;">SHIPPING ADDRESS</h3>
        <p style="margin: 0; line-height: 1.6; color: #cccccc;">
          ${order.firstName} ${order.lastName}<br>
          ${order.address || ''}<br>
          ${order.city || ''}, ${order.state || ''} ${order.zipCode || ''}<br>
          ${order.country || ''}
        </p>
      </div>
      
      <p style="color: #888; margin: 20px 0; text-align: center;">
        Your order is being prepared and will ship within 24 hours.
      </p>
      
      <div style="background: linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%); border: 1px solid rgba(236, 72, 153, 0.5); border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; font-size: 12px; color: #ec4899;">
          <strong>IMPORTANT:</strong> All products are for research purposes only. Not for human or animal consumption.
        </p>
      </div>
    </div>
    
    <div style="background-color: ${brand.backgroundColor}; padding: 20px; text-align: center; border-top: 1px solid #333;">
      <p style="margin: 0; color: #666; font-size: 12px;">
        Questions? Reply to this email or contact us at ${EMAIL_CONFIG.replyTo}
      </p>
      <p style="margin: 10px 0 0 0; color: #444; font-size: 11px;">
        &copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`;

  return { subject, text, html };
}

export async function sendOrderConfirmationEmail(order: {
  email: string;
  firstName: string;
  lastName: string;
  productId: string;
  quantity: number;
  totalAmount: string;
  id: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}, productName?: string): Promise<EmailResult> {
  const template = getOrderConfirmationTemplate(order, productName);
  
  return sendEmail({
    to: order.email,
    subject: template.subject,
    text: template.text,
    html: template.html,
    replyTo: EMAIL_CONFIG.replyTo,
  });
}
