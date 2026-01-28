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

// Cart item type for multi-item orders
interface OrderItem {
  name: string;
  dosage?: string;
  quantity: number;
  price: number;
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
}, productName?: string, items?: OrderItem[]): { subject: string; text: string; html: string } {
  const shortRef = getShortOrderRef(order.id);
  const { brand } = EMAIL_CONFIG;
  const styles = getEmailBaseStyles();
  const hasFirstName = order.firstName && order.firstName.trim().length > 0;
  
  // Use items array if provided, otherwise fall back to single product
  const orderItems = items && items.length > 0 ? items : [{ 
    name: productName || order.productId, 
    quantity: order.quantity, 
    price: parseFloat(order.totalAmount) 
  }];
  
  const subject = `Order Confirmed #${shortRef}`;
  
  // Build items text
  const itemsText = orderItems.map(item => 
    `${item.name}${item.dosage ? ` (${item.dosage})` : ''} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');
  
  const text = `
REVIVE RESEARCH
Order Confirmed

${hasFirstName ? `Hi ${order.firstName},` : 'Hello,'}

Thank you for your order. We're preparing your research compounds for shipment.

ORDER #${shortRef}
-------------------
${itemsText}

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
                  ${orderItems.map((item, idx) => `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: #ffffff; font-size: 14px; font-weight: 500;">${item.name}</span>
                      ${item.dosage ? `<br><span style="color: rgba(255,255,255,0.5); font-size: 12px;">${item.dosage}</span>` : ''}
                    </td>
                    <td style="padding: 12px 0; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: rgba(255,255,255,0.7); font-size: 14px;">x${item.quantity}</span>
                    </td>
                    <td style="padding: 12px 0; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.05);">
                      <span style="color: ${styles.accentColor}; font-size: 14px; font-weight: 500;">$${(item.price * item.quantity).toFixed(2)}</span>
                    </td>
                  </tr>
                  `).join('')}
                  <tr>
                    <td colspan="2" style="padding: 16px 0 0 0;">
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
}, productName?: string, items?: OrderItem[]): Promise<EmailResult> {
  const template = getOrderConfirmationTemplate(order, productName, items);
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
}, productName?: string, items?: OrderItem[]): { subject: string; text: string; html: string } {
  const shortRef = getShortOrderRef(order.id);
  const styles = getEmailBaseStyles();
  
  // Use items array if provided, otherwise fall back to single product
  const orderItems = items && items.length > 0 ? items : [{ 
    name: productName || order.productId, 
    quantity: order.quantity, 
    price: parseFloat(order.totalAmount) 
  }];
  
  // Build items text for plain text email
  const itemsText = orderItems.map(item => 
    `${item.name}${item.dosage ? ` (${item.dosage})` : ''} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');
  
  const subject = `New Order #${shortRef} - $${order.totalAmount}`;
  
  const text = `
NEW ORDER RECEIVED
==================

Order Number: #${shortRef}
Customer: ${order.firstName} ${order.lastName}
Email: ${order.email}
Phone: ${order.phone || 'Not provided'}

PRODUCTS
--------
${itemsText}
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
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px 40px; text-align: center;">
              <p style="color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px 0;">New Order Received</p>
              <p style="color: #ffffff; font-size: 42px; font-weight: 700; margin: 0; letter-spacing: -1px;">$${order.totalAmount}</p>
              <p style="color: rgba(255,255,255,0.95); font-size: 14px; margin: 10px 0 0 0;">Order #${shortRef}</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 32px 40px;">
              
              <!-- Customer Section -->
              <div style="margin-bottom: 24px;">
                <p style="color: #16a34a; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #22c55e;">Customer</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #6b7280; font-size: 13px;">Name</span>
                    </td>
                    <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #111827; font-size: 14px; font-weight: 600;">${order.firstName} ${order.lastName}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #6b7280; font-size: 13px;">Email</span>
                    </td>
                    <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">
                      <a href="mailto:${order.email}" style="color: #16a34a; font-size: 14px; text-decoration: none; font-weight: 500;">${order.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0;">
                      <span style="color: #6b7280; font-size: 13px;">Phone</span>
                    </td>
                    <td style="padding: 10px 0; text-align: right;">
                      <span style="color: #111827; font-size: 14px;">${order.phone || 'Not provided'}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Order Section -->
              <div style="margin-bottom: 24px;">
                <p style="color: #16a34a; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #22c55e;">Order Details</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${orderItems.map(item => `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #111827; font-size: 14px; font-weight: 600;">${item.name}</span>
                      ${item.dosage ? `<br><span style="color: #6b7280; font-size: 12px;">${item.dosage}</span>` : ''}
                    </td>
                    <td style="padding: 10px 0; text-align: center; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #6b7280; font-size: 14px;">x${item.quantity}</span>
                    </td>
                    <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #e5e7eb;">
                      <span style="color: #16a34a; font-size: 14px; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</span>
                    </td>
                  </tr>
                  `).join('')}
                  <tr>
                    <td colspan="2" style="padding: 10px 0;">
                      <span style="color: #6b7280; font-size: 13px;">Total</span>
                    </td>
                    <td style="padding: 10px 0; text-align: right;">
                      <span style="color: #16a34a; font-size: 18px; font-weight: 700;">$${order.totalAmount}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Shipping Section -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px;">
                <p style="color: #16a34a; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 12px 0;">Ship To</p>
                <p style="color: #111827; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">${order.firstName} ${order.lastName}</p>
                <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0;">
                  ${order.address || ''}<br>
                  ${order.city || ''}, ${order.state || ''} ${order.zipCode || ''}<br>
                  ${order.country || ''}
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
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
}, productName?: string, items?: OrderItem[]): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.warn('[Email] ADMIN_EMAIL not configured, skipping admin notification');
    return { success: false, error: 'ADMIN_EMAIL not configured' };
  }

  const template = getAdminOrderNotificationTemplate(order, productName, items);
  
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
  // Premium color palette matching website
  const colors = {
    neonYellow: '#E7FB10',
    cyan: '#21d8ff',
    purple: '#9d4edd',
    pink: '#ec4899',
    green: '#22c55e',
    darkBg: '#0a0a0c',
    cardBg: '#141417',
    cardBorder: 'rgba(255,255,255,0.08)',
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.7)',
    textMuted: 'rgba(255,255,255,0.4)',
  };
  
  // Logo URL - served from public assets folder
  const logoUrl = 'https://reviveresearch.co/assets/email-logo.png';
  
  // Unsubscribe URL placeholder (replace with actual unsubscribe system)
  const unsubscribeUrl = `https://reviveresearch.co/unsubscribe?email=${encodeURIComponent(email)}`;
  
  const subject = 'Welcome to Revive Research';
  
  const text = `REVIVE RESEARCH

You're In.

Welcome to Revive Research.
You've been added to our subscriber list.

Here's what you can expect as a subscriber:

- Early Awareness: Be the first to know when new research becomes available or when important platform updates go live, before public announcements.

- Curated Updates: We'll summarize what's new and what's changed so you don't have to monitor the site or social channels.

- Educational Context: When updates matter, we'll include documentation notes and research insights to help you understand what you're seeing.

- Low Volume, High Signal: No spam, no noise. Only occasional updates tied to new research, education, or meaningful platform changes.

Explore Available Research: https://reviveresearch.co/

---
You're receiving this email because you subscribed at reviveresearch.co.
Unsubscribe: ${unsubscribeUrl}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to Revive Research</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${colors.darkBg}; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;">
  
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: ${colors.darkBg};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        
        <!-- Main container with premium border glow -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background: linear-gradient(180deg, #1a1a1f 0%, #0f0f12 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 0 60px rgba(33, 216, 255, 0.15), 0 0 120px rgba(157, 78, 221, 0.1), 0 25px 50px rgba(0,0,0,0.5);">
          
          <!-- Premium Header with Logo -->
          <tr>
            <td style="background: linear-gradient(180deg, rgba(33, 216, 255, 0.08) 0%, rgba(157, 78, 221, 0.05) 50%, transparent 100%); padding: 48px 40px 32px 40px; text-align: center; border-bottom: 1px solid ${colors.cardBorder};">
              
              <!-- Logo -->
              <img src="${logoUrl}" alt="Revive Research" width="180" style="display: block; margin: 0 auto 24px auto; max-width: 180px; height: auto;" />
              
              <!-- Decorative Line -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="height: 2px; background: linear-gradient(90deg, transparent 0%, ${colors.cyan} 20%, ${colors.purple} 50%, ${colors.neonYellow} 80%, transparent 100%);"></td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Hero Section -->
          <tr>
            <td style="padding: 48px 40px 32px 40px; text-align: center; background: radial-gradient(ellipse at top, rgba(157, 78, 221, 0.12) 0%, transparent 60%);">
              
              <!-- Status Badge with Glow -->
              <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin-bottom: 24px;">
                <tr>
                  <td style="background: linear-gradient(135deg, ${colors.cyan} 0%, ${colors.purple} 100%); padding: 2px; border-radius: 100px; box-shadow: 0 0 20px rgba(33, 216, 255, 0.4), 0 0 40px rgba(157, 78, 221, 0.2);">
                    <table role="presentation" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="background: #1a1a1f; padding: 10px 24px; border-radius: 100px;">
                          <span style="color: ${colors.cyan}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">ACCESS CONFIRMED</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Main Headline -->
              <h1 style="margin: 0 0 16px 0; font-size: 42px; font-weight: 800; letter-spacing: -1px; line-height: 1.1; color: ${colors.textPrimary};">
                You're In.
              </h1>
              
              <!-- Welcome Text - Two Lines -->
              <p style="margin: 0 0 6px 0; font-size: 17px; line-height: 1.4; color: ${colors.textPrimary}; font-weight: 500;">
                Welcome to Revive Research.
              </p>
              <p style="margin: 0; font-size: 15px; line-height: 1.5; color: ${colors.textSecondary};">
                You've been added to our subscriber list.
              </p>
              
            </td>
          </tr>
          
          <!-- Benefits Section -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              
              <!-- Benefits Header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <span style="color: ${colors.textMuted}; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">HERE'S WHAT YOU CAN EXPECT AS A SUBSCRIBER</span>
                  </td>
                </tr>
              </table>
              
              <!-- Benefits List - Vertical Stack -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                
                <!-- Benefit 1: Early Awareness -->
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: ${colors.cardBg}; border: 1px solid rgba(33, 216, 255, 0.2); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 16px 20px; border-left: 3px solid ${colors.cyan};">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 44px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: rgba(33, 216, 255, 0.15); border-radius: 8px; text-align: center; line-height: 32px;">
                                  <span style="font-size: 14px; color: ${colors.cyan};">01</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${colors.textPrimary};">Early Awareness</p>
                                <p style="margin: 0; font-size: 13px; color: ${colors.textSecondary}; line-height: 1.5;">Be the first to know when new research becomes available or when important platform updates go live, before public announcements.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Benefit 2: Curated Updates -->
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: ${colors.cardBg}; border: 1px solid rgba(231, 251, 16, 0.2); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 16px 20px; border-left: 3px solid ${colors.neonYellow};">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 44px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: rgba(231, 251, 16, 0.12); border-radius: 8px; text-align: center; line-height: 32px;">
                                  <span style="font-size: 14px; color: ${colors.neonYellow};">02</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${colors.textPrimary};">Curated Updates</p>
                                <p style="margin: 0; font-size: 13px; color: ${colors.textSecondary}; line-height: 1.5;">We'll summarize what's new and what's changed so you don't have to monitor the site or social channels.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Benefit 3: Educational Context -->
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: ${colors.cardBg}; border: 1px solid rgba(157, 78, 221, 0.2); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 16px 20px; border-left: 3px solid ${colors.purple};">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 44px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: rgba(157, 78, 221, 0.15); border-radius: 8px; text-align: center; line-height: 32px;">
                                  <span style="font-size: 14px; color: ${colors.purple};">03</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${colors.textPrimary};">Educational Context</p>
                                <p style="margin: 0; font-size: 13px; color: ${colors.textSecondary}; line-height: 1.5;">When updates matter, we'll include documentation notes and research insights to help you understand what you're seeing.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Benefit 4: Low Volume, High Signal -->
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: ${colors.cardBg}; border: 1px solid rgba(236, 72, 153, 0.2); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 16px 20px; border-left: 3px solid ${colors.pink};">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 44px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: rgba(236, 72, 153, 0.15); border-radius: 8px; text-align: center; line-height: 32px;">
                                  <span style="font-size: 14px; color: ${colors.pink};">04</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${colors.textPrimary};">Low Volume, High Signal</p>
                                <p style="margin: 0; font-size: 13px; color: ${colors.textSecondary}; line-height: 1.5;">No spam, no noise. Only occasional updates tied to new research, education, or meaningful platform changes.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
              </table>
              
            </td>
          </tr>
          
          <!-- CTA Section -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              
              <!-- Primary CTA Button with Glow -->
              <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td style="background: ${colors.neonYellow}; border-radius: 10px; box-shadow: 0 0 30px rgba(231, 251, 16, 0.5), 0 0 60px rgba(231, 251, 16, 0.25);">
                    <a href="https://reviveresearch.co/" style="display: inline-block; padding: 16px 40px; font-size: 15px; font-weight: 700; color: #000000; text-decoration: none; letter-spacing: 0.5px;">
                      Explore Available Research
                    </a>
                  </td>
                </tr>
              </table>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: ${colors.cardBg}; padding: 32px 40px; text-align: center; border-top: 1px solid ${colors.cardBorder};">
              
              <!-- Sign off -->
              <p style="margin: 0 0 20px 0; font-size: 14px; color: ${colors.textSecondary};">
                <span style="color: ${colors.textPrimary}; font-weight: 500;">The Revive Research Team</span>
              </p>
              
              <!-- Divider -->
              <table role="presentation" width="60" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 20px auto;">
                <tr>
                  <td style="height: 1px; background: linear-gradient(90deg, transparent, ${colors.textMuted}, transparent);"></td>
                </tr>
              </table>
              
              <!-- Email info -->
              <p style="margin: 0 0 8px 0; font-size: 12px; color: rgba(255,255,255,0.4);">
                You're receiving this email because you subscribed at <a href="https://reviveresearch.co" style="color: rgba(255,255,255,0.5); text-decoration: none;">reviveresearch.co</a>.
              </p>
              
              <!-- Unsubscribe Link -->
              <p style="margin: 0; font-size: 12px;">
                <a href="${unsubscribeUrl}" style="color: ${colors.cyan}; text-decoration: underline;">Unsubscribe</a>
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
    replyTo: 'support@reviveresearch.co',
  });

  if (result.success) {
    console.log(`[Email] Newsletter welcome sent to ${email}`);
    // Track last email sent timestamp
    try {
      await storage.updateLastEmailSent(email);
    } catch (err) {
      console.error(`[Email] Failed to update last email sent for ${email}:`, err);
    }
  } else {
    console.error(`[Email] Failed to send newsletter welcome to ${email}:`, result.error);
  }

  return result;
}
