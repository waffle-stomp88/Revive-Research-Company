import * as nodemailer from 'nodemailer';
import { storage } from './storage';
import type { InsertEmailEvent } from '@shared/schema';

// Email configuration with multiple sender addresses
const EMAIL_CONFIG = {
  from: {
    orders: 'orders@reviveresearch.co',
    noreply: 'no-reply@reviveresearch.co',
    support: 'support@reviveresearch.co',
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

export type EmailSender = keyof typeof EMAIL_CONFIG.from;

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
  from?: EmailSender;
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
    requireTLS: port === 587,
    auth: {
      user,
      pass,
    },
  });
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // Determine the from address based on the sender type
  const senderType = options.from || 'orders';
  const fromEmail = EMAIL_CONFIG.from[senderType];
  
  if (!fromEmail) {
    const error = `Invalid sender type: ${senderType}`;
    console.error('[Email Error]', error);
    return { success: false, error };
  }

  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `Revive Research <${fromEmail}>`,
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

// Premium Apple-inspired email base styles
const getEmailBaseStyles = () => {
  const { brand } = EMAIL_CONFIG;
  return {
    body: `margin: 0; padding: 0; background-color: #0d0d0f; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;`,
    container: `max-width: 600px; margin: 0 auto; background-color: ${brand.backgroundColor}; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);`,
    header: `background: linear-gradient(180deg, ${brand.cardColor} 0%, ${brand.backgroundColor} 100%); padding: 40px 40px 30px 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);`,
    logo: `color: ${brand.primaryColor}; font-size: 14px; font-weight: 700; letter-spacing: 4px; margin: 0 0 8px 0; text-transform: uppercase;`,
    content: `padding: 40px;`,
    card: `background-color: ${brand.cardColor}; border-radius: 12px; padding: 24px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.05);`,
    cardTitle: `color: rgba(255,255,255,0.5); font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 16px 0;`,
    footer: `background-color: ${brand.cardColor}; padding: 30px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);`,
    primaryColor: brand.primaryColor,
    accentColor: brand.accentColor,
    glowYellow: `0 0 20px rgba(231, 251, 16, 0.3)`,
    glowCyan: `0 0 20px rgba(33, 216, 255, 0.3)`,
  };
};

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
  const styles = getEmailBaseStyles();
  const hasFirstName = order.firstName && order.firstName.trim().length > 0;
  
  const subject = `Order Confirmed #${shortRef}`;
  
  const text = `
REVIVE RESEARCH
Order Confirmed

${hasFirstName ? `Hi ${order.firstName},` : 'Hello,'}

Thank you for your order. We're preparing your research compounds for shipment.

ORDER #${shortRef}
-------------------
Product: ${productName || order.productId}
Quantity: ${order.quantity}
Total: $${order.totalAmount}

SHIPPING TO
-----------
${order.firstName} ${order.lastName}
${order.address || ''}
${order.city || ''}, ${order.state || ''} ${order.zipCode || ''}
${order.country || ''}

WHAT'S NEXT
-----------
Your order will ship within 24 hours. You'll receive tracking information once shipped.

RESEARCH USE ONLY
-----------------
All products are intended for laboratory research purposes only. 
Not for human or animal consumption.

Questions? Contact us at ${EMAIL_CONFIG.replyTo}

${brand.name}
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed</title>
</head>
<body style="${styles.body}">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0d0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="${styles.container}">
          
          <!-- Header -->
          <tr>
            <td style="${styles.header}">
              <p style="${styles.logo}">Revive Research</p>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">
                Order Confirmed
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="${styles.content}">
              
              <!-- Greeting -->
              <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                ${hasFirstName ? `Hi ${order.firstName},` : 'Hello,'}<br><br>
                Thank you for your order. We're preparing your research compounds for shipment.
              </p>
              
              <!-- Order Number Badge -->
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="display: inline-block; background: linear-gradient(135deg, ${styles.primaryColor} 0%, #c4d40d 100%); color: #000000; font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 100px; letter-spacing: 1px; box-shadow: ${styles.glowYellow};">
                  ORDER #${shortRef}
                </span>
              </div>
              
              <!-- Order Details Card -->
              <div style="${styles.card}">
                <p style="${styles.cardTitle}">Order Details</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: rgba(255,255,255,0.5); font-size: 14px;">Product</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: #ffffff; font-size: 14px; font-weight: 500;">${productName || order.productId}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: rgba(255,255,255,0.5); font-size: 14px;">Quantity</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: #ffffff; font-size: 14px;">${order.quantity}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 16px 0 0 0;">
                      <span style="color: #ffffff; font-size: 14px; font-weight: 600;">Total</span>
                    </td>
                    <td style="padding: 16px 0 0 0; text-align: right;">
                      <span style="color: ${styles.primaryColor}; font-size: 24px; font-weight: 700;">$${order.totalAmount}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Shipping Address Card -->
              <div style="${styles.card}">
                <p style="${styles.cardTitle}">Shipping To</p>
                <p style="color: #ffffff; font-size: 15px; line-height: 1.7; margin: 0;">
                  <strong>${order.firstName} ${order.lastName}</strong><br>
                  <span style="color: rgba(255,255,255,0.7);">
                    ${order.address || ''}<br>
                    ${order.city || ''}, ${order.state || ''} ${order.zipCode || ''}<br>
                    ${order.country || ''}
                  </span>
                </p>
              </div>
              
              <!-- Status Timeline -->
              <div style="${styles.card}; background: linear-gradient(135deg, rgba(33, 216, 255, 0.1) 0%, rgba(33, 216, 255, 0.05) 100%); border-color: rgba(33, 216, 255, 0.2);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width: 40px; vertical-align: top; padding-right: 15px;">
                      <div style="width: 32px; height: 32px; background: ${styles.accentColor}; border-radius: 50%; text-align: center; line-height: 32px; box-shadow: ${styles.glowCyan};">
                        <span style="color: #000; font-size: 14px;">1</span>
                      </div>
                    </td>
                    <td style="vertical-align: top;">
                      <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 4px 0;">Order Received</p>
                      <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin: 0;">We're preparing your order for shipment</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Research Notice -->
              <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 20px; margin-top: 20px;">
                <p style="color: rgba(239, 68, 68, 0.9); font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 8px 0;">
                  Research Use Only
                </p>
                <p style="color: rgba(255,255,255,0.6); font-size: 13px; line-height: 1.5; margin: 0;">
                  All products are intended for laboratory research purposes only. Not for human or animal consumption.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="${styles.footer}">
              <p style="color: rgba(255,255,255,0.4); font-size: 13px; margin: 0 0 10px 0;">
                Questions? Contact us at <a href="mailto:${EMAIL_CONFIG.replyTo}" style="color: ${styles.accentColor}; text-decoration: none;">${EMAIL_CONFIG.replyTo}</a>
              </p>
              <p style="color: rgba(255,255,255,0.25); font-size: 11px; margin: 0;">
                &copy; ${new Date().getFullYear()} Revive Research. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
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
  const timestamp = new Date().toISOString();
  
  const result = await sendEmail({
    to: order.email,
    subject: template.subject,
    text: template.text,
    html: template.html,
    replyTo: EMAIL_CONFIG.replyTo,
  });

  // Log email event to database
  const emailEvent: InsertEmailEvent = {
    orderId: order.id,
    type: 'order_confirmation',
    recipientEmail: order.email,
    subject: template.subject,
    status: result.success ? 'sent' : 'failed',
    sesMessageId: result.messageId || null,
    error: result.error || null,
  };

  try {
    await storage.createEmailEvent(emailEvent);
    console.log(`[Email Event] Logged: orderId=${order.id}, type=order_confirmation, status=${emailEvent.status}, sesMessageId=${result.messageId || 'N/A'}, timestamp=${timestamp}`);
  } catch (logError) {
    console.error('[Email Event] Failed to log event to database:', logError);
  }

  return result;
}

// Email template: Admin Order Notification
function getAdminOrderNotificationTemplate(order: {
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
  phone?: string;
}, productName?: string): { subject: string; text: string; html: string } {
  const shortRef = getShortOrderRef(order.id);
  const styles = getEmailBaseStyles();
  
  const subject = `New Order #${shortRef} - $${order.totalAmount}`;
  
  const text = `
NEW ORDER RECEIVED
==================

Order Number: #${shortRef}
Customer: ${order.firstName} ${order.lastName}
Email: ${order.email}
Phone: ${order.phone || 'Not provided'}

PRODUCT
-------
${productName || order.productId}
Quantity: ${order.quantity}
Total: $${order.totalAmount}

SHIPPING ADDRESS
----------------
${order.firstName} ${order.lastName}
${order.address || ''}
${order.city || ''}, ${order.state || ''} ${order.zipCode || ''}
${order.country || ''}

Time: ${new Date().toISOString()}
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order</title>
</head>
<body style="${styles.body}">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0d0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="${styles.container}">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px 40px; text-align: center;">
              <p style="color: rgba(255,255,255,0.8); font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px 0;">New Order Received</p>
              <p style="color: #ffffff; font-size: 42px; font-weight: 700; margin: 0; letter-spacing: -1px;">$${order.totalAmount}</p>
              <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 10px 0 0 0;">Order #${shortRef}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="${styles.content}">
              
              <!-- Customer Card -->
              <div style="${styles.card}">
                <p style="${styles.cardTitle}">Customer</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: rgba(255,255,255,0.5); font-size: 13px;">Name</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: #ffffff; font-size: 14px; font-weight: 600;">${order.firstName} ${order.lastName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: rgba(255,255,255,0.5); font-size: 13px;">Email</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <a href="mailto:${order.email}" style="color: ${styles.accentColor}; font-size: 14px; text-decoration: none;">${order.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: rgba(255,255,255,0.5); font-size: 13px;">Phone</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="color: #ffffff; font-size: 14px;">${order.phone || 'Not provided'}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Order Card -->
              <div style="${styles.card}">
                <p style="${styles.cardTitle}">Order Details</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: rgba(255,255,255,0.5); font-size: 13px;">Product</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: #ffffff; font-size: 14px;">${productName || order.productId}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: rgba(255,255,255,0.5); font-size: 13px;">Quantity</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="color: #ffffff; font-size: 14px;">${order.quantity}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Shipping Card -->
              <div style="${styles.card}">
                <p style="${styles.cardTitle}">Ship To</p>
                <p style="color: #ffffff; font-size: 14px; line-height: 1.7; margin: 0;">
                  ${order.firstName} ${order.lastName}<br>
                  <span style="color: rgba(255,255,255,0.6);">
                    ${order.address || ''}<br>
                    ${order.city || ''}, ${order.state || ''} ${order.zipCode || ''}<br>
                    ${order.country || ''}
                  </span>
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="${styles.footer}">
              <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">
                Received ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, text, html };
}

export async function sendAdminOrderNotificationEmail(order: {
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
  phone?: string;
}, productName?: string): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.warn('[Email] ADMIN_EMAIL not configured, skipping admin notification');
    return { success: false, error: 'ADMIN_EMAIL not configured' };
  }

  const template = getAdminOrderNotificationTemplate(order, productName);
  
  const result = await sendEmail({
    to: adminEmail,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });

  if (result.success) {
    console.log(`[Email] Admin notification sent for order ${order.id}`);
  } else {
    console.error(`[Email] Failed to send admin notification for order ${order.id}:`, result.error);
  }

  return result;
}

export function isEmailConfigured(): boolean {
  return !!(
    process.env.SES_SMTP_HOST && 
    process.env.SES_SMTP_USERNAME && 
    process.env.SES_SMTP_PASSWORD
  );
}

// Newsletter subscription confirmation email template
function getNewsletterWelcomeTemplate(email: string): { subject: string; text: string; html: string } {
  const styles = getEmailBaseStyles();
  
  const subject = 'You\'re In - Welcome to Revive Research';
  
  const text = `REVIVE RESEARCH
Welcome to the Community

You're now part of an exclusive community of researchers. Here's what you can expect:

- Early access to new research compounds
- Exclusive subscriber-only promotions  
- Educational content and research insights
- Industry news and updates

Stay curious,
The Revive Research Team

---
This email was sent to ${email}
If you did not subscribe, please ignore this email.`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Revive Research</title>
</head>
<body style="${styles.body}">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0d0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="${styles.container}">
          
          <!-- Header -->
          <tr>
            <td style="${styles.header}">
              <p style="${styles.logo}">Revive Research</p>
              <h1 style="color: #ffffff; font-size: 32px; font-weight: 600; margin: 0; letter-spacing: -0.5px;">
                You're In
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="${styles.content}">
              
              <!-- Welcome Badge -->
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="display: inline-block; background: linear-gradient(135deg, ${styles.primaryColor} 0%, #c4d40d 100%); color: #000000; font-size: 12px; font-weight: 700; padding: 8px 20px; border-radius: 100px; letter-spacing: 1px; box-shadow: ${styles.glowYellow};">
                  SUBSCRIBER
                </span>
              </div>
              
              <p style="color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1.7; margin: 0 0 30px 0; text-align: center;">
                Welcome to an exclusive community of researchers. You'll be the first to know about new developments.
              </p>
              
              <!-- Benefits Card -->
              <div style="${styles.card}">
                <p style="${styles.cardTitle}">What to Expect</p>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width: 40px; vertical-align: top;">
                            <div style="width: 28px; height: 28px; background: rgba(33, 216, 255, 0.15); border-radius: 8px; text-align: center; line-height: 28px;">
                              <span style="color: ${styles.accentColor}; font-size: 14px;">1</span>
                            </div>
                          </td>
                          <td style="vertical-align: middle;">
                            <span style="color: #ffffff; font-size: 14px;">Early access to new research compounds</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width: 40px; vertical-align: top;">
                            <div style="width: 28px; height: 28px; background: rgba(33, 216, 255, 0.15); border-radius: 8px; text-align: center; line-height: 28px;">
                              <span style="color: ${styles.accentColor}; font-size: 14px;">2</span>
                            </div>
                          </td>
                          <td style="vertical-align: middle;">
                            <span style="color: #ffffff; font-size: 14px;">Exclusive subscriber-only promotions</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width: 40px; vertical-align: top;">
                            <div style="width: 28px; height: 28px; background: rgba(33, 216, 255, 0.15); border-radius: 8px; text-align: center; line-height: 28px;">
                              <span style="color: ${styles.accentColor}; font-size: 14px;">3</span>
                            </div>
                          </td>
                          <td style="vertical-align: middle;">
                            <span style="color: #ffffff; font-size: 14px;">Educational content and research insights</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0;">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width: 40px; vertical-align: top;">
                            <div style="width: 28px; height: 28px; background: rgba(33, 216, 255, 0.15); border-radius: 8px; text-align: center; line-height: 28px;">
                              <span style="color: ${styles.accentColor}; font-size: 14px;">4</span>
                            </div>
                          </td>
                          <td style="vertical-align: middle;">
                            <span style="color: #ffffff; font-size: 14px;">Industry news and updates</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- CTA -->
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://reviveresearch.co/peptides" style="display: inline-block; background: linear-gradient(135deg, ${styles.primaryColor} 0%, #c4d40d 100%); color: #000000; font-size: 14px; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; box-shadow: ${styles.glowYellow};">
                  Browse Research Compounds
                </a>
              </div>
              
              <p style="color: rgba(255,255,255,0.4); font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                Stay curious,<br>
                <span style="color: rgba(255,255,255,0.7);">The Revive Research Team</span>
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="${styles.footer}">
              <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0 0 8px 0;">
                This email was sent to ${email}
              </p>
              <p style="color: rgba(255,255,255,0.2); font-size: 11px; margin: 0;">
                If you did not subscribe, please ignore this email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, text, html };
}

export async function sendNewsletterWelcomeEmail(email: string): Promise<EmailResult> {
  const template = getNewsletterWelcomeTemplate(email);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
    from: 'noreply',
  });

  if (result.success) {
    console.log(`[Email] Newsletter welcome sent to ${email}`);
  } else {
    console.error(`[Email] Failed to send newsletter welcome to ${email}:`, result.error);
  }

  return result;
}
