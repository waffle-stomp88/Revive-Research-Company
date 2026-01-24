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
  
  // Logo as base64 data URI for reliable email display
  const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAaAAAACICAMAAACWYM+EAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAoJQTFRF////////////AAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////tfOj8QAAANZ0Uk5TRoB7AIz/9eNtHz8ibn++D6ED/nX3TOgz0Ru4CpIm3f1lPPDzR1765CoBiMwXCLMCmsgRDEA7GBITOjI3pwbVixUJ7CO/wvlrgYk06W/hx9kQTlVs/FhS1rbcY/tCXY7udyXJr98cevQ2VwV+n9Oi6iCUJ02TRcPy3qMtphoejQS92CuedjFzYcYheT4NXHy3yoJBnShI5QvOre+K2hQsqHKq4hmglrBb56tKqcW1WevSPVG6si4WUOaFMJsdNcSu1+1q4KTNz8CcdLEv1A5DZHhUkIRwkd8jhesAAAtTSURBVHic7Z17cBVXGcDPUmjBAgFCKTAmNhluRtJ0kiq0JU55GXkVSA1PIylQpMlAgIIBeWmkrYVACYLhERhgUh4iFGuDRURKsNCHRlrAYlGsKHZataUWK5UquN5z7l7u3d3z+PbsZTwzfL8/du/unj375f5yd8+e/XbXIhYxAcuMMMzDamnGN2Nd/X9HYCgoyHBQkOGgIMNBQYaDggwHBRkOCjIcFGQ4KMhwUJDhoCDDQUGGkyyoxZXrtplWqu8fBQlAQYaDggwHBRkOCjIcFGQ4KMhwUJDhoCDDQUGGg4IMBwUZDgoyHBRkOCjIcFCQ4aAgw0FBhoOCDAcFGQ4KMhwUZDgoyHAggm6Gpc5Zl8XL2nyiWhkF8YEI+pTkm0/QxvqneCH+gnRJmaBbrX9IlqIgXVIkqJ31oXQ5CtIlNYLSrA/kBVCQLikR1NF6X1ECBemSCkHp1t9Um0FBuqRA0G3WX5SbQUG6hBd0+yVZ8y1Gd+tdVRwoiE9YQd2tP6s3kqkuhIIEhBSUaZ1TbyMbUAgFCQgnKNs6q9xCDqAMChISSlCO9aZyA7mAMgQFCQkjqKf9G2X9Pe3fweJAQXxCCIoAvvuI/QdgHCiIj7agLMhXn2Wfh8aBgvjoCsqAfPWtbn8HHAcK4qMpqJut/urzrNMB4kBBfPQE5VknlTUXvPtekDgkgm7JVa9uHU+evDvAlpM4/W/58l6xIFs2E9L7reiHHr+MDu5lK93yqqLuzHStkN7UEnSv9bKy5i6RV4IEIhPUAlJBdlfraPxz32NBNp3gfuuIbHHBZdYq6vfeG1Eh/4l+6n84OsiMNNG5Aw9Jq/7SC3ohFUIEDfJsu/XH6ooHWwcDBRJaULSKQT9xPukKIkPOSU7acrNY/cOsfSRZEBn5Gt3dt+v/nKTiBxs1I4IIyujl2vSAtB+q6x11+GKwQGSCPg1talx1/pbcM8E2nqDkk33CZWP20uHot9jONEkQGbeHDsda3xeuWrpLNyC1oLx893ZLf6/a20Yp2xE0kBT8gqJMeJqNtH9B0cibBSff7UtY3ROtLWwyWRCZspUOH7Y2CSp9ZD+4NetFKahruvtHP+yQOkGhfOelwIHIBFWsU69/FwuzfH1s6r+Btx+lcgMdjtrDXzqdVT3N+l5s0iWIzKyjw4wHV3NXfXQNG81aqRFUlUJQF/uCa1qaW+XQtnxV8EBCN7PZf/Gcp0LU0HM4+warlvMWfpXtR6yqGmfaLYjMZysNyV/KWTXz7VgN27SikgvqbP/dNS3PrYrRumi/Thyhz4MmN0QH858MUUN/m7UDF3zHv6gD+7uLs2rjMzyCFltspcWv+w9h1ZfYSt/6tl5QUkGeQ327OdXqCu/rsVMrjtCCHqBtrBn8nQyQx7aw7pEl3/QuyP5jbPnia3M8gkjXwewH8vgO7yHsyZXsf1y051QiE7R0kWtSmVtFKbnYpBdHWEHLaug/09JvhKrEOadZNs89++po1o6tmZuY5RVERtz9BB0tf8y9j+n9DrvYv2KzuuOfj1iQ91Cvzq0iJKeiSjeOcD0JD1lz6Cj+jQF6EibN4s2NndMUD5iZPHPqM2xHMiv50OoTRBZ0ZzW6D2F11gw6KjmgPnQLEArKL3If6vucVeZWkcIJldpxpOI8iLSK5ehDmtn8toBzTpM2OqnFPOuz0+nozl8nl/MLipdbV5GY5Rya1m8/SnQRCfLm4dzW7YSyro11b+jHkYrzoPj/eAhBpGIjHa5tOTU+w/llbFzuuvrFEUSm2uwcadOU+Iyc+V+jo83WJPc2Im3V8b3ujAWCvHk4oNyqggPq7YpIhaCtE50PYQSRp6fQ4aDDTsfpiA9Yn2JDmbsUTxC52ipWwwRnOnZ6tG2K99Rx5wSipIfz/8AX5MnDAeVWrfouoJCQ8IJabPtK/GMoQWRXKR0O+2szHeVWs1p3jfUU4goie8ax0Y5YJEuW0OHuo76WZVhBeR3cndWg3CpPj11QVIKyhZfXnx1Dh+n1JYlZrC/u6zWCFWI892Xhoh+xqnIqK68VG3rO2wjjCyJFbI7Vm3aHxdrmaQ0jfRsIKcjbuwPJrco7HfIB9qpGQlmDaOm+9WzP2jg8MYv9ghY9rhuL0/RaZD9B5rGuiX3LfAd5gSCyn4Wx9sxqsqaJ/ccO5/RjhxPk7d2B5FZ5nQZHXxBpvYq2ngZcSnTihhRENjayzpCd42vZWUPm+qG+IiJB5MAwOsxeW91s0w+TN3Pq30LbDgvk8cX36z5BjZPdvTug3Kr3LyjLKAghiBwcR89TSt8+Ep8RVhC5eSC7mvXTwWxq5Wx/CaEgcmgQHf7MKqKjyjW86tkvqLP6tIXiFTTyedu1PPJbQCVNXwRtSxpHCEEkq4DuTQ7PbXamQwsim65Mj38c+zHvYptYUGGfxAlk01TuoTOEoA72R8lLi0/C0tp0O3iS4ggjiGx/iA6P7KiPTUIaCXGeH8Gdfc+v4p/2clsTYkGkprCf82neMv42tQVN8fTuZDzK+XFz0ewiTYojlCCygvXBHSyKTQW5YDdX4NE5xpMxP+AulggiPe96ho1pK4OLrqBp4/u6lk0s4PZXcZnRURAMkJCCyEv306HTzZIKQWT5fDo8VshfKhNEFtbT4/jQ46Ib2yCNBAfXBTsPkNyqBG3tfwUo7SOsoJyGL9DRHWyXnBJB7BqQbQsWSgWRV8efJ69Y94hqhjSzHQrFgiC5Vcm0t4Nf6E4QVhApv0wvyBQv7E1SJYjMrDs4TXR+LBdEMiMnbhLvwlIi6Ao8VSPOktqP1IUEqHISXuulqmHEC7RLvxN7XkOAnARBI4FxvEx4itGF/qkvfU646o9v8p87XSMFgkC5VT462QGTrRLcUKm/4QWBcqs4eHMY4NxQgoqfBRflNxIguVV8Aib8JrihBAWBJ2h2vfYF2oAp80lxoCA+HEG3ltaHqDDQTSdJcaAgPj5BoNwqKW3SNRJdUZAAryBQbpWCrPOi0ztJHCiIj0cQJLdKTeMc4K3DSXGgID5uQRXFg9Wr9H1RWeTzD88IGgcK4uMSBMqtqiXX4xIrChLg6s2uU5evbj5ANp8BXGrZMC1YHCiIT8DnZq9aTdPLr0OaDwoSEExQ/EuHJcqthj7FgqAgIUEEJd8NebxMneYbicBTTVGQgACC3Ad+yIMwAyRroyABcEHe3CrAo2QD3O6AggSABflPPjtu9Se1esnZLb6m5Y4DBfGBCuJ131hpkFvuTgJafChICFDQyQd4HaDtqnx3c/rJ7AvJyEJBAkCC2n9GdAnhzj8BbvtOVz2TmaAgIRBBBWfFGVVtIureIe/dlNw4UBAfgKCFP5ddxu7TT/1ogvJTv1DGgYL4qAV13uC9u8zN7grAFYoVqtvjUZAApSD1c6vSBu5Vb2fUh/L0ehQkQCXI8zALPty7lDzcVyX9IaIgAXJB0OdWQfJMFp6SPcMHBQmQCoI/t2r2IXWivTS9HgUJkAkK8tyqbhfUuY6y9HoUJEAiKNhNWaUvAq7+vDxUlF6PggSIBQW9rTErH5Bv3+miICMLBQkQCtJ4jvBTG9Qvc/DeRH4tDhTERyCo0Fae+3Oo2w54nrbNvWUfBQngC9J9blVe5SPKMl1tXno9ChLAFaT/3KohJ9R52e2PFXDiQEF8eILCPLcKdOd+hv/VHChIAEdQdn6Y51aBnn3hf68QChLgE5Rzh/wtEWrW1Wq8mQsFCfAKAr4TUIrOu+1QkACPIOg7AeVovB0SBQlwCwK/E1AB6P2qrn0pChLgEgR6MR0I2BuKk1ojKEiA5Fk94einLkJOJbp9UJCA6yYoIChIAAoyHBRkOCjIcFCQ4aAgw0FBhoOCDAcFGQ4KMhwUZDgoyHBQkOH8D5cq5Yw6oXZOAAAAAElFTkSuQmCC';
  
  // Unsubscribe URL placeholder (replace with actual unsubscribe system)
  const unsubscribeUrl = `https://reviveresearch.co/unsubscribe?email=${encodeURIComponent(email)}`;
  
  const subject = 'Welcome to Revive Research';
  
  const text = `REVIVE RESEARCH

You're In.

Welcome to Revive Research. You've been added to our subscriber list.

Here's what you can expect as a subscriber:

- Early Awareness: Be the first to know when new research becomes available or when important platform updates go live, before public announcements.

- Curated Updates: We'll summarize what's new and what's changed so you don't have to monitor the site or social channels.

- Educational Context: When updates matter, we'll include documentation notes and research insights to help you understand what you're seeing.

- Purposeful Emails Only: Low-volume, high-signal emails. No spam, no noise - only when there's something worth sharing.

- Clear Expectations: Occasional updates tied to new research, education, or meaningful platform changes. Nothing sent just to "stay active."

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
              <img src="${logoBase64}" alt="Revive Research" width="180" style="display: block; margin: 0 auto 24px auto; max-width: 180px; height: auto;" />
              
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
              
              <!-- Subtitle -->
              <p style="margin: 0; font-size: 17px; line-height: 1.6; color: ${colors.textSecondary}; max-width: 420px; margin: 0 auto;">
                Welcome to Revive Research. You've been added to our subscriber list.
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
                
                <!-- Benefit 4: Purposeful Emails Only -->
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
                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${colors.textPrimary};">Purposeful Emails Only</p>
                                <p style="margin: 0; font-size: 13px; color: ${colors.textSecondary}; line-height: 1.5;">Low-volume, high-signal emails. No spam, no noise - only when there's something worth sharing.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Benefit 5: Clear Expectations -->
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: ${colors.cardBg}; border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 16px 20px; border-left: 3px solid ${colors.green};">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 44px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: rgba(34, 197, 94, 0.15); border-radius: 8px; text-align: center; line-height: 32px;">
                                  <span style="font-size: 14px; color: ${colors.green};">05</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: ${colors.textPrimary};">Clear Expectations</p>
                                <p style="margin: 0; font-size: 13px; color: ${colors.textSecondary}; line-height: 1.5;">Occasional updates tied to new research, education, or meaningful platform changes. Nothing sent just to "stay active."</p>
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
  } else {
    console.error(`[Email] Failed to send newsletter welcome to ${email}:`, result.error);
  }

  return result;
}
