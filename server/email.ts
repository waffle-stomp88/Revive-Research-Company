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
    primaryColor: '#D4FF1F',
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
    glowYellow: `0 0 20px rgba(212, 255, 31, 0.3)`,
    glowCyan: `0 0 20px rgba(33, 216, 255, 0.3)`,
  };
};

// Company address for CAN-SPAM compliance
const COMPANY_ADDRESS = 'Revive Research Company, LLC\nFrisco, TX 75033';

// Shared email footer components for CAN-SPAM compliance
function getUnsubscribeUrl(email: string): string {
  return `https://reviveresearch.co/unsubscribe?email=${encodeURIComponent(email)}`;
}

type EmailReason = 'order' | 'shipping' | 'newsletter';

function getSharedFooterText(email: string, reason: EmailReason): string {
  const reasonText = {
    order: "You're receiving this email because you placed an order at reviveresearch.co.",
    shipping: "You're receiving this email because you have an active order with reviveresearch.co.",
    newsletter: "You're receiving this email because you subscribed at reviveresearch.co.",
  };

  return `
---
RESEARCH USE ONLY
All products are intended for laboratory research purposes only.
Not for human or animal consumption.

${reasonText[reason]}
Revive Research | ${COMPANY_ADDRESS}
Unsubscribe: ${getUnsubscribeUrl(email)}

© ${new Date().getFullYear()} Revive Research. All rights reserved.`;
}

function getSharedFooterHtml(email: string, reason: EmailReason, theme: 'dark' | 'light' = 'dark'): string {
  const styles = getEmailBaseStyles();
  const unsubscribeUrl = getUnsubscribeUrl(email);

  const reasonText = {
    order: 'You\'re receiving this email because you placed an order at <a href="https://reviveresearch.co" style="color: inherit; text-decoration: underline;">reviveresearch.co</a>.',
    shipping: 'You\'re receiving this email because you have an active order with <a href="https://reviveresearch.co" style="color: inherit; text-decoration: underline;">reviveresearch.co</a>.',
    newsletter: 'You\'re receiving this email because you subscribed at <a href="https://reviveresearch.co" style="color: inherit; text-decoration: underline;">reviveresearch.co</a>.',
  };

  const isDark = theme === 'dark';
  const textColor = isDark ? '#999999' : '#888888';
  const linkColor = isDark ? styles.accentColor : '#0891b2';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : '#dddddd';
  const brandColor = isDark ? styles.primaryColor : '#0a6b5c';

  const ruoBorderColor = isDark ? 'rgba(239, 68, 68, 0.35)' : '#ef4444';
  const ruoBgColor = isDark ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2';
  const ruoHeadingColor = '#ef4444';
  const ruoTextColor = isDark ? '#cccccc' : '#7f1d1d';

  return `
              <div style="height: 1px; background: ${dividerColor}; margin: 20px 0;"></div>
              
              <div style="border: 1px solid ${ruoBorderColor}; background: ${ruoBgColor}; border-radius: 6px; padding: 12px 16px; margin: 0 0 16px 0; text-align: center;">
                <p style="color: ${ruoHeadingColor}; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin: 0 0 4px 0;">
                  Research Use Only
                </p>
                <p style="color: ${ruoTextColor}; font-size: 10px; line-height: 1.5; margin: 0;">
                  All products are intended for laboratory research purposes only. Not for human or animal consumption.
                </p>
              </div>
              
              <p style="color: ${textColor}; font-size: 11px; line-height: 1.6; margin: 0 0 12px 0;">
                ${reasonText[reason]}
              </p>
              
              <p style="color: ${textColor}; font-size: 11px; margin: 0 0 12px 0;">
                ${COMPANY_ADDRESS.replace(/\n/g, '<br>')}
              </p>
              
              <p style="margin: 0 0 8px 0; font-size: 11px;">
                <a href="${unsubscribeUrl}" style="color: ${linkColor}; text-decoration: underline;">Unsubscribe</a>
              </p>
              
              <p style="color: ${textColor}; font-size: 11px; margin: 0;">
                &copy; ${new Date().getFullYear()} Revive Research. All rights reserved.
              </p>`;
}

// Cart item type for multi-item orders
interface OrderItem {
  name: string;
  dosage?: string;
  quantity: number;
  price: number;
}

// Email template: Order Confirmation
export function getOrderConfirmationTemplate(order: {
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
}, productName?: string, items?: OrderItem[], subtotal?: number, shipping?: number, tax?: number, taxState?: string): { subject: string; text: string; html: string } {
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
  
  // Calculate subtotal from items if not provided
  const calculatedSubtotal = subtotal ?? orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shipping ?? 0;
  const shippingDisplay = shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`;
  const taxAmount = tax ?? 0;
  const taxDisplay = taxAmount === 0 ? 'No tax' : `$${taxAmount.toFixed(2)}`;
  const taxLabel = taxState ? `Tax (${taxState})` : 'Tax';

  // Detect free BAC water gift
  const hasBacWaterGift = orderItems.some(
    item => item.price === 0 && item.name.toLowerCase().includes('bacteriostatic')
  );

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

Subtotal: $${calculatedSubtotal.toFixed(2)}
Shipping: ${shippingDisplay}
${taxLabel}: ${taxDisplay}
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
${hasBacWaterGift ? `
GIFT INCLUDED
-------------
Your free 3ml Bacteriostatic Water is included — a gift on your first order.
` : ''}
Questions? Contact us at ${EMAIL_CONFIG.replyTo}
${getSharedFooterText(order.email, 'order')}
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
        <table role="presentation" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #1a1a1f; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);">
          
          <!-- Premium Header with Logo -->
          <tr>
            <td style="background: linear-gradient(180deg, #252529 0%, #1a1a1f 100%); padding: 0; text-align: center; position: relative;">
              <!-- Top Gradient Accent Bar -->
              <div style="height: 4px; background: linear-gradient(90deg, ${styles.primaryColor} 0%, ${styles.accentColor} 50%, ${styles.primaryColor} 100%);"></div>
              
              <!-- Logo Section -->
              <div style="padding: 40px 40px 20px 40px;">
                <!-- Clickable Logo Image -->
                <a href="https://reviveresearch.co" target="_blank" style="display: inline-block; text-decoration: none;">
                  <img src="https://reviveresearch.co/assets/email-logo.png" alt="Revive Research" width="280" style="display: block; margin: 0 auto 16px auto; max-width: 280px; height: auto;" />
                </a>
                
                <!-- Tagline -->
                <p style="color: #cccccc; font-size: 11px; letter-spacing: 2px; margin: 0 0 20px 0; text-transform: uppercase;">
                  Premium Research Compounds
                </p>
                
                <!-- Holographic Gradient Line -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="height: 2px; background: linear-gradient(90deg, transparent 0%, ${styles.accentColor} 20%, #9d4edd 50%, ${styles.primaryColor} 80%, transparent 100%);"></td>
                  </tr>
                </table>
              </div>
              
              <!-- Order Confirmed Title Section -->
              <div style="padding: 30px 40px 40px 40px;">
                <!-- Order Confirmed Badge -->
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 20px auto;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 2px; border-radius: 100px;">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="background: #1a1a1f; padding: 10px 24px; border-radius: 100px;">
                            <span style="color: #22c55e; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">ORDER CONFIRMED</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <!-- Main Headline -->
                <h1 style="color: #ffffff; font-size: 42px; font-weight: 800; margin: 0 0 20px 0; letter-spacing: -1px; line-height: 1.1;">
                  You're All Set.
                </h1>
                
                <!-- Order Number Badge -->
                <span style="display: inline-block; background: linear-gradient(135deg, ${styles.primaryColor} 0%, #c4d40d 100%); color: #000000; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 100px; letter-spacing: 1.5px; box-shadow: 0 0 30px rgba(212, 255, 31, 0.4);">
                  ORDER #${shortRef}
                </span>
              </div>
            </td>
          </tr>
          
          <!-- Thank You Message -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 16px; padding: 24px; text-align: center;">
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 12px auto;">
                  <tr>
                    <td style="width: 48px; height: 48px; background: rgba(34, 197, 94, 0.2); border-radius: 50%; text-align: center; vertical-align: middle;">
                      <span style="color: #22c55e; font-size: 20px; font-weight: 700;">OK</span>
                    </td>
                  </tr>
                </table>
                <p style="color: #22c55e; font-size: 18px; font-weight: 600; margin: 0 0 8px 0;">
                  Thank you${hasFirstName ? `, ${order.firstName}` : ''}!
                </p>
                <p style="color: #eeeeee; font-size: 14px; line-height: 1.6; margin: 0;">
                  Your order has been received and is being prepared for shipment.<br>
                  You'll receive tracking information once your order ships.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px 40px 40px;">
              
              <!-- Order Details Card -->
              <div style="background-color: #2a2a30; border-radius: 16px; padding: 28px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.12);">
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 0 20px 0;">
                  <tr>
                    <td style="width: 20px; padding-right: 12px; vertical-align: middle;">
                      <div style="width: 20px; height: 2px; background: ${styles.accentColor};"></div>
                    </td>
                    <td style="vertical-align: middle;">
                      <span style="color: ${styles.accentColor}; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Order Details</span>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${orderItems.map((item, idx) => `
                  <tr>
                    <td style="padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
                      <span style="color: #ffffff; font-size: 15px; font-weight: 600;">${item.name}</span>
                      ${item.dosage ? `<br><span style="color: #cccccc; font-size: 13px;">${item.dosage}</span>` : ''}
                    </td>
                    <td style="padding: 14px 0; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06); width: 60px;">
                      <span style="color: #dddddd; font-size: 14px;">x${item.quantity}</span>
                    </td>
                    <td style="padding: 14px 0; text-align: right; border-bottom: 1px solid rgba(255,255,255,0.06); width: 90px;">
                      <span style="color: ${styles.primaryColor}; font-size: 15px; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</span>
                    </td>
                  </tr>
                  `).join('')}
                  <tr>
                    <td colspan="2" style="padding: 14px 0 8px 0;">
                      <span style="color: #dddddd; font-size: 14px;">Subtotal</span>
                    </td>
                    <td style="padding: 14px 0 8px 0; text-align: right;">
                      <span style="color: #ffffff; font-size: 14px;">$${calculatedSubtotal.toFixed(2)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 6px 0;">
                      <span style="color: #dddddd; font-size: 14px;">Shipping</span>
                    </td>
                    <td style="padding: 6px 0; text-align: right;">
                      <span style="color: ${shippingCost === 0 ? '#22c55e' : 'rgba(255,255,255,0.8)'}; font-size: 14px; font-weight: ${shippingCost === 0 ? '600' : '400'};">${shippingDisplay}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 6px 0;">
                      <span style="color: #dddddd; font-size: 14px;">${taxLabel}</span>
                    </td>
                    <td style="padding: 6px 0; text-align: right;">
                      <span style="color: #ffffff; font-size: 14px;">${taxDisplay}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 18px 0 0 0; border-top: 2px solid rgba(255,255,255,0.1);">
                      <span style="color: #ffffff; font-size: 16px; font-weight: 700;">Total</span>
                    </td>
                    <td style="padding: 18px 0 0 0; text-align: right; border-top: 2px solid rgba(255,255,255,0.1);">
                      <span style="color: ${styles.primaryColor}; font-size: 26px; font-weight: 700;">$${order.totalAmount}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Free BAC Water Gift Callout (shown only when applicable) -->
              ${hasBacWaterGift ? `
              <div style="background: linear-gradient(135deg, rgba(33, 216, 255, 0.12) 0%, rgba(33, 216, 255, 0.05) 100%); border: 1px solid rgba(33, 216, 255, 0.35); border-radius: 16px; padding: 20px 24px; margin-bottom: 20px; text-align: center;">
                <p style="color: #21d8ff; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px 0;">
                  Gift Included
                </p>
                <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 4px 0;">
                  Your free 3ml Bacteriostatic Water is included
                </p>
                <p style="color: #cccccc; font-size: 13px; line-height: 1.5; margin: 0;">
                  A complimentary gift on your first order — already packed with your shipment.
                </p>
              </div>
              ` : ''}

              <!-- Two Column: Shipping & Status -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="width: 48%; vertical-align: top;">
                    <!-- Shipping Address Card -->
                    <div style="background-color: #2a2a30; border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.12); height: 100%;">
                      <p style="color: ${styles.primaryColor}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px 0;">
                        SHIPPING TO
                      </p>
                      <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">
                        ${order.firstName} ${order.lastName}
                      </p>
                      <p style="color: #eeeeee; font-size: 14px; line-height: 1.6; margin: 0;">
                        ${order.address || ''}<br>
                        ${order.city || ''}, ${order.state || ''} ${order.zipCode || ''}<br>
                        ${order.country || 'USA'}
                      </p>
                    </div>
                  </td>
                  <td style="width: 4%;"></td>
                  <td style="width: 48%; vertical-align: top;">
                    <!-- Estimated Delivery Card -->
                    <div style="background-color: #2a2a30; border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.12); height: 100%;">
                      <p style="color: ${styles.accentColor}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px 0;">
                        ESTIMATED DELIVERY
                      </p>
                      <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">
                        3–5 Business Days
                      </p>
                      <p style="color: #eeeeee; font-size: 14px; line-height: 1.6; margin: 0;">
                        Ships within 24 hours<br>
                        Tracking sent via email
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Order Progress Timeline -->
              <div style="background: linear-gradient(135deg, #1a3a4a 0%, #1a2a35 100%); border: 1px solid #2a5a6a; border-radius: 16px; padding: 24px;">
                <p style="color: ${styles.accentColor}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 24px 0; text-align: center;">
                  Order Progress
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <!-- Step 1 - Active -->
                    <td style="width: 28%; text-align: center; vertical-align: top;">
                      <div style="width: 44px; height: 44px; background: ${styles.accentColor}; border-radius: 50%; margin: 0 auto 12px auto; line-height: 44px;">
                        <span style="color: #000; font-size: 18px; font-weight: 700;">1</span>
                      </div>
                      <p style="color: #ffffff; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Confirmed</p>
                      <p style="color: ${styles.accentColor}; font-size: 11px; font-weight: 600; margin: 0;">Just now</p>
                    </td>
                    <!-- Arrow Connector 1 -->
                    <td style="width: 8%; text-align: center; vertical-align: top; padding-top: 8px;">
                      <span style="color: ${styles.accentColor}; font-size: 24px; font-weight: 300;">&rarr;</span>
                    </td>
                    <!-- Step 2 - Pending -->
                    <td style="width: 28%; text-align: center; vertical-align: top;">
                      <div style="width: 44px; height: 44px; background: #2a2a30; border: 2px solid #4a4a50; border-radius: 50%; margin: 0 auto 12px auto; line-height: 40px;">
                        <span style="color: #999999; font-size: 18px; font-weight: 700;">2</span>
                      </div>
                      <p style="color: #999999; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Shipped</p>
                      <p style="color: #666666; font-size: 11px; margin: 0;">Pending</p>
                    </td>
                    <!-- Arrow Connector 2 -->
                    <td style="width: 8%; text-align: center; vertical-align: top; padding-top: 8px;">
                      <span style="color: #4a4a50; font-size: 24px; font-weight: 300;">&rarr;</span>
                    </td>
                    <!-- Step 3 - Pending -->
                    <td style="width: 28%; text-align: center; vertical-align: top;">
                      <div style="width: 44px; height: 44px; background: #2a2a30; border: 2px solid #4a4a50; border-radius: 50%; margin: 0 auto 12px auto; line-height: 40px;">
                        <span style="color: #999999; font-size: 18px; font-weight: 700;">3</span>
                      </div>
                      <p style="color: #999999; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Delivered</p>
                      <p style="color: #666666; font-size: 11px; margin: 0;">Pending</p>
                    </td>
                  </tr>
                </table>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1f; padding: 32px 40px; text-align: center;">
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 16px 0;">
                Questions about your order?
              </p>
              <a href="mailto:${EMAIL_CONFIG.replyTo}" style="display: inline-block; background: transparent; border: 1px solid ${styles.accentColor}; color: ${styles.accentColor}; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 20px;">
                Contact Support
              </a>
              
              ${getSharedFooterHtml(order.email, 'order')}
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

export function getAffiliateRejectionTemplate(applicant: {
  firstName: string;
  email: string;
}): { subject: string; text: string; html: string } {
  const { brand } = EMAIL_CONFIG;
  const styles = getEmailBaseStyles();
  const contactEmail = EMAIL_CONFIG.replyTo;

  const subject = `Your ${brand.name} Affiliate Application`;

  const text = `
${brand.name.toUpperCase()}
Affiliate Program Update

Hi ${applicant.firstName},

Thank you for applying to the ${brand.name} affiliate program. After reviewing your application, we're unable to move forward at this time.

We genuinely appreciate your interest in partnering with us. If you feel your situation has changed or you'd like to discuss your application further, you're welcome to reapply in the future or reach out to us directly at ${contactEmail}.

Thank you again for your interest in ${brand.name}.

${brand.name} Team
${getSharedFooterText(applicant.email, 'order')}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Affiliate Application</title>
</head>
<body style="${styles.body}">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0d0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #1a1a1f; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <p style="margin: 0 0 16px; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #999999;">AFFILIATE PROGRAM</p>
              <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">Application Update</h1>
              <p style="margin: 0; font-size: 16px; color: #999999;">Thank you for your interest in ${brand.name}.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #cccccc; line-height: 1.6;">Hi ${applicant.firstName},</p>
              <p style="margin: 0 0 16px; font-size: 16px; color: #cccccc; line-height: 1.6;">Thank you for taking the time to apply to the ${brand.name} affiliate program. After carefully reviewing your application, we're unable to move forward at this time.</p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #cccccc; line-height: 1.6;">We appreciate your interest in partnering with us. If your situation changes or you'd like to discuss your application further, you're welcome to reapply in the future or contact us directly.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;">
                <tr>
                  <td style="padding: 24px 28px;">
                    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #999999;">Questions?</p>
                    <p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.6;">Reach out to us at <a href="mailto:${contactEmail}" style="color: #21d8ff; text-decoration: none;">${contactEmail}</a> and we'll be happy to help.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
              <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #ffffff;">${brand.name}</p>
              <p style="margin: 0; font-size: 12px; color: #666666;">Premium Peptide Research Compounds</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

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
}, productName?: string, items?: OrderItem[], subtotal?: number, shipping?: number, tax?: number, taxState?: string): Promise<EmailResult> {
  const template = getOrderConfirmationTemplate(order, productName, items, subtotal, shipping, tax, taxState);
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

// Carrier tracking URL generators
function getCarrierTrackingUrl(carrier: string, trackingNumber: string): string {
  const carrierLower = carrier.toLowerCase();
  if (carrierLower.includes('usps')) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
  } else if (carrierLower.includes('ups')) {
    return `https://www.ups.com/track?tracknum=${trackingNumber}`;
  } else if (carrierLower.includes('fedex')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  } else if (carrierLower.includes('dhl')) {
    return `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`;
  }
  // Default to USPS if unknown
  return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;
}

// Email template: Shipped Notification
export function getShippedNotificationTemplate(order: {
  email: string;
  firstName: string;
  lastName: string;
  id: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}, trackingNumber: string, carrier: string, estimatedDelivery?: string): { subject: string; text: string; html: string } {
  const shortRef = getShortOrderRef(order.id);
  const { brand } = EMAIL_CONFIG;
  const styles = getEmailBaseStyles();
  const hasFirstName = order.firstName && order.firstName.trim().length > 0;
  const trackingUrl = getCarrierTrackingUrl(carrier, trackingNumber);
  const deliveryEstimate = estimatedDelivery || '3–5 Business Days';
  
  const subject = `Your Order Has Shipped! #${shortRef}`;
  
  const text = `
REVIVE RESEARCH
Your Order Has Shipped!

${hasFirstName ? `Hi ${order.firstName},` : 'Hello,'}

Great news! Your order #${shortRef} is on its way.

TRACKING INFORMATION
--------------------
Carrier: ${carrier}
Tracking Number: ${trackingNumber}
Track your package: ${trackingUrl}

SHIPPING TO
-----------
${order.firstName} ${order.lastName}
${order.address || ''}
${order.city || ''}, ${order.state || ''} ${order.zipCode || ''}
${order.country || 'USA'}

Estimated Delivery: ${deliveryEstimate}

Questions? Contact us at ${EMAIL_CONFIG.replyTo}
${getSharedFooterText(order.email, 'shipping')}
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped</title>
</head>
<body style="${styles.body}">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0d0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #1a1a1f; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);">
          
          <!-- Premium Header with Logo -->
          <tr>
            <td style="background: linear-gradient(180deg, #252529 0%, #1a1a1f 100%); padding: 0; text-align: center;">
              <!-- Top Gradient Accent Bar -->
              <div style="height: 4px; background: linear-gradient(90deg, ${styles.primaryColor} 0%, ${styles.accentColor} 50%, ${styles.primaryColor} 100%);"></div>
              
              <!-- Logo Section -->
              <div style="padding: 40px 40px 20px 40px;">
                <a href="https://reviveresearch.co" target="_blank" style="display: inline-block; text-decoration: none;">
                  <img src="https://reviveresearch.co/assets/email-logo.png" alt="Revive Research" width="280" style="display: block; margin: 0 auto 16px auto; max-width: 280px; height: auto;" />
                </a>
                
                <p style="color: #cccccc; font-size: 11px; letter-spacing: 2px; margin: 0 0 20px 0; text-transform: uppercase;">
                  Premium Research Compounds
                </p>
                
                <!-- Holographic Gradient Line -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="height: 2px; background: linear-gradient(90deg, transparent 0%, ${styles.accentColor} 20%, #9d4edd 50%, ${styles.primaryColor} 80%, transparent 100%);"></td>
                  </tr>
                </table>
              </div>
              
              <!-- Shipped Title Section -->
              <div style="padding: 30px 40px 40px 40px;">
                <!-- Shipped Badge -->
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 20px auto;">
                  <tr>
                    <td style="background: linear-gradient(135deg, ${styles.accentColor} 0%, #0891b2 100%); padding: 2px; border-radius: 100px;">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="background: #1a1a1f; padding: 10px 24px; border-radius: 100px;">
                            <span style="color: ${styles.accentColor}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">ORDER SHIPPED</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <h1 style="color: #ffffff; font-size: 42px; font-weight: 800; margin: 0 0 20px 0; letter-spacing: -1px; line-height: 1.1;">
                  On Its Way!
                </h1>
                
                <span style="display: inline-block; background: linear-gradient(135deg, ${styles.primaryColor} 0%, #c4d40d 100%); color: #000000; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 100px; letter-spacing: 1.5px; box-shadow: 0 0 30px rgba(212, 255, 31, 0.4);">
                  ORDER #${shortRef}
                </span>
              </div>
            </td>
          </tr>
          
          <!-- Tracking Info Card -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="background: linear-gradient(135deg, rgba(33, 216, 255, 0.15) 0%, rgba(33, 216, 255, 0.05) 100%); border: 1px solid rgba(33, 216, 255, 0.3); border-radius: 16px; padding: 28px; text-align: center;">
                <p style="color: ${styles.accentColor}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px 0;">
                  TRACKING INFORMATION
                </p>
                <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                  ${carrier}
                </p>
                <p style="color: #ffffff; font-size: 18px; font-weight: 700; font-family: monospace; letter-spacing: 2px; margin: 0 0 20px 0;">
                  ${trackingNumber}
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                  <tr>
                    <td style="background: ${styles.accentColor}; padding: 14px 32px; border-radius: 100px; box-shadow: 0 0 20px rgba(33, 216, 255, 0.4);">
                      <a href="${trackingUrl}" target="_blank" style="color: #000000; font-size: 14px; font-weight: 700; text-decoration: none; letter-spacing: 1px;">TRACK PACKAGE &rarr;</a>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 40px 40px 40px;">
              
              <!-- Two Column: Shipping & Estimated Delivery -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                <tr>
                  <td style="width: 48%; vertical-align: top;">
                    <div style="background-color: #2a2a30; border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.12); height: 100%;">
                      <p style="color: ${styles.primaryColor}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px 0;">
                        SHIPPING TO
                      </p>
                      <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">
                        ${order.firstName} ${order.lastName}
                      </p>
                      <p style="color: #eeeeee; font-size: 14px; line-height: 1.6; margin: 0;">
                        ${order.address || ''}<br>
                        ${order.city || ''}, ${order.state || ''} ${order.zipCode || ''}<br>
                        ${order.country || 'USA'}
                      </p>
                    </div>
                  </td>
                  <td style="width: 4%;"></td>
                  <td style="width: 48%; vertical-align: top;">
                    <div style="background-color: #2a2a30; border-radius: 16px; padding: 24px; border: 1px solid rgba(255,255,255,0.12); height: 100%;">
                      <p style="color: ${styles.accentColor}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 16px 0;">
                        ESTIMATED DELIVERY
                      </p>
                      <p style="color: #ffffff; font-size: 15px; font-weight: 600; margin: 0 0 8px 0;">
                        ${deliveryEstimate}
                      </p>
                      <p style="color: #eeeeee; font-size: 14px; line-height: 1.6; margin: 0;">
                        Carrier: ${carrier}<br>
                        Updates sent via email
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Order Progress Timeline - Step 2 Active -->
              <div style="background: linear-gradient(135deg, #1a3a4a 0%, #1a2a35 100%); border: 1px solid #2a5a6a; border-radius: 16px; padding: 24px;">
                <p style="color: ${styles.accentColor}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 24px 0; text-align: center;">
                  Order Progress
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <!-- Step 1 - Completed -->
                    <td style="width: 28%; text-align: center; vertical-align: top;">
                      <div style="width: 44px; height: 44px; background: #22c55e; border-radius: 50%; margin: 0 auto 12px auto; line-height: 44px;">
                        <span style="color: #000; font-size: 18px; font-weight: 700;">&#10003;</span>
                      </div>
                      <p style="color: #22c55e; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Confirmed</p>
                      <p style="color: #888888; font-size: 11px; margin: 0;">Complete</p>
                    </td>
                    <!-- Arrow Connector 1 -->
                    <td style="width: 8%; text-align: center; vertical-align: top; padding-top: 8px;">
                      <span style="color: #22c55e; font-size: 24px; font-weight: 300;">&rarr;</span>
                    </td>
                    <!-- Step 2 - Active (Shipped) -->
                    <td style="width: 28%; text-align: center; vertical-align: top;">
                      <div style="width: 44px; height: 44px; background: ${styles.accentColor}; border-radius: 50%; margin: 0 auto 12px auto; line-height: 44px;">
                        <span style="color: #000; font-size: 18px; font-weight: 700;">2</span>
                      </div>
                      <p style="color: #ffffff; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Shipped</p>
                      <p style="color: ${styles.accentColor}; font-size: 11px; font-weight: 600; margin: 0;">In Transit</p>
                    </td>
                    <!-- Arrow Connector 2 -->
                    <td style="width: 8%; text-align: center; vertical-align: top; padding-top: 8px;">
                      <span style="color: #4a4a50; font-size: 24px; font-weight: 300;">&rarr;</span>
                    </td>
                    <!-- Step 3 - Pending -->
                    <td style="width: 28%; text-align: center; vertical-align: top;">
                      <div style="width: 44px; height: 44px; background: #2a2a30; border: 2px solid #4a4a50; border-radius: 50%; margin: 0 auto 12px auto; line-height: 40px;">
                        <span style="color: #999999; font-size: 18px; font-weight: 700;">3</span>
                      </div>
                      <p style="color: #999999; font-size: 13px; font-weight: 600; margin: 0 0 4px 0;">Delivered</p>
                      <p style="color: #666666; font-size: 11px; margin: 0;">Pending</p>
                    </td>
                  </tr>
                </table>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1a1a1f; padding: 32px 40px; text-align: center;">
              <p style="color: #ffffff; font-size: 13px; margin: 0 0 16px 0;">
                Questions about your shipment?
              </p>
              <a href="mailto:${EMAIL_CONFIG.replyTo}" style="display: inline-block; background: transparent; border: 1px solid ${styles.accentColor}; color: ${styles.accentColor}; font-size: 13px; font-weight: 600; padding: 10px 24px; border-radius: 100px; text-decoration: none; margin-bottom: 20px;">
                Contact Support
              </a>
              
              ${getSharedFooterHtml(order.email, 'shipping')}
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

export async function sendShippedNotificationEmail(order: {
  email: string;
  firstName: string;
  lastName: string;
  id: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}, trackingNumber: string, carrier: string, estimatedDelivery?: string): Promise<EmailResult> {
  const template = getShippedNotificationTemplate(order, trackingNumber, carrier, estimatedDelivery);
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
    type: 'shipped_notification',
    recipientEmail: order.email,
    subject: template.subject,
    status: result.success ? 'sent' : 'failed',
    sesMessageId: result.messageId || null,
    error: result.error || null,
  };

  try {
    await storage.createEmailEvent(emailEvent);
    console.log(`[Email Event] Logged: orderId=${order.id}, type=shipped_notification, status=${emailEvent.status}, sesMessageId=${result.messageId || 'N/A'}, timestamp=${timestamp}`);
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
}, productName?: string, items?: OrderItem[], subtotal?: number, shipping?: number, tax?: number, taxState?: string): { subject: string; text: string; html: string } {
  const shortRef = getShortOrderRef(order.id);
  const styles = getEmailBaseStyles();
  
  // Use items array if provided, otherwise fall back to single product
  const orderItems = items && items.length > 0 ? items : [{ 
    name: productName || order.productId, 
    quantity: order.quantity, 
    price: parseFloat(order.totalAmount) 
  }];
  
  // Calculate subtotal from items if not provided
  const calculatedSubtotal = subtotal ?? orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shipping ?? 0;
  const shippingDisplay = shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`;
  const taxAmount = tax ?? 0;
  const taxDisplay = taxAmount === 0 ? 'No tax' : `$${taxAmount.toFixed(2)}`;
  const taxLabel = taxState ? `Tax (${taxState})` : 'Tax';
  
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

Subtotal: $${calculatedSubtotal.toFixed(2)}
Shipping: ${shippingDisplay}
${taxLabel}: ${taxDisplay}
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
                    <td colspan="2" style="padding: 8px 0;">
                      <span style="color: #6b7280; font-size: 13px;">Subtotal</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="color: #6b7280; font-size: 14px;">$${calculatedSubtotal.toFixed(2)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 8px 0;">
                      <span style="color: #6b7280; font-size: 13px;">Shipping</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="color: ${shippingCost === 0 ? '#16a34a' : '#6b7280'}; font-size: 14px; font-weight: ${shippingCost === 0 ? '600' : '400'};">${shippingDisplay}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 8px 0;">
                      <span style="color: #6b7280; font-size: 13px;">${taxLabel}</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="color: ${taxAmount === 0 ? '#16a34a' : '#6b7280'}; font-size: 14px; font-weight: ${taxAmount === 0 ? '600' : '400'};">${taxDisplay}</span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 10px 0; border-top: 1px solid #e5e7eb;">
                      <span style="color: #111827; font-size: 14px; font-weight: 600;">Total</span>
                    </td>
                    <td style="padding: 10px 0; text-align: right; border-top: 1px solid #e5e7eb;">
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
}, productName?: string, items?: OrderItem[], subtotal?: number, shipping?: number, tax?: number, taxState?: string): Promise<EmailResult> {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.warn('[Email] ADMIN_EMAIL not configured, skipping admin notification');
    return { success: false, error: 'ADMIN_EMAIL not configured' };
  }

  const template = getAdminOrderNotificationTemplate(order, productName, items, subtotal, shipping, tax, taxState);
  
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
    neonYellow: '#D4FF1F',
    cyan: '#21d8ff',
    purple: '#9d4edd',
    pink: '#ec4899',
    green: '#22c55e',
    darkBg: '#0a0a0c',
    cardBg: '#141417',
    cardBorder: '#2a2a2f',
    textPrimary: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#999999',
  };
  
  // Logo URL - served from public assets folder
  const logoUrl = 'https://reviveresearch.co/assets/email-logo.png';
  
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
${getSharedFooterText(email, 'newsletter')}`;

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
              <a href="https://reviveresearch.co" target="_blank" style="display: inline-block; text-decoration: none;">
                <img src="${logoUrl}" alt="Revive Research" width="280" style="display: block; margin: 0 auto 16px auto; max-width: 280px; height: auto;" />
              </a>
              
              <!-- Tagline -->
              <p style="color: #cccccc; font-size: 11px; letter-spacing: 2px; margin: 0 0 24px 0; text-transform: uppercase;">
                Premium Research Compounds
              </p>
              
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
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: ${colors.cardBg}; border: 1px solid rgba(212, 255, 31, 0.2); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 16px 20px; border-left: 3px solid ${colors.neonYellow};">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 44px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: rgba(212, 255, 31, 0.12); border-radius: 8px; text-align: center; line-height: 32px;">
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
                  <td style="background: ${colors.neonYellow}; border-radius: 10px; box-shadow: 0 0 30px rgba(212, 255, 31, 0.5), 0 0 60px rgba(212, 255, 31, 0.25);">
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
              
              ${getSharedFooterHtml(email, 'newsletter')}
              
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

// Email template: Pre-Launch Waitlist Confirmation
function getPreLaunchConfirmationTemplate(email: string): { subject: string; text: string; html: string } {
  const styles = getEmailBaseStyles();

  const subject = "You're on the list.";

  const text = `
REVIVE RESEARCH
You're on the list.

Thanks for signing up. We're building something different — and you'll be the first to know when it's ready.

WHAT WE'RE BUILDING
--------------------

01 — Revive Research Academy
Beginner or advanced — structured education built for real researchers.

02 — Revive Synergy Engine
Build stacks. See pathway interactions instantly.

03 — Trust Nothing. Verify Everything.
Scan any vial. Real third-party results. Instantly.

Peptides aren't the differentiator. We are.
EVERY VIAL. EVERY BATCH. EVERY SINGLE TIME.

You'll be the first to know when we go live.

— The Revive Research Team
${getSharedFooterText(email, 'newsletter')}
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're on the list.</title>
</head>
<body style="${styles.body}">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0d0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #1a1a1f; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(180deg, #252529 0%, #1a1a1f 100%); padding: 0; text-align: center;">
              <div style="height: 4px; background: linear-gradient(90deg, ${styles.primaryColor} 0%, ${styles.accentColor} 50%, #a78bfa 100%);"></div>
              
              <div style="padding: 40px 40px 20px 40px;">
                <a href="https://reviveresearch.co" target="_blank" style="display: inline-block; text-decoration: none;">
                  <img src="https://reviveresearch.co/assets/email-logo.png" alt="Revive Research" width="280" style="display: block; margin: 0 auto 16px auto; max-width: 280px; height: auto;" />
                </a>
                
                <p style="color: #cccccc; font-size: 11px; letter-spacing: 2px; margin: 0 0 20px 0; text-transform: uppercase;">
                  Premium Research Compounds
                </p>
                
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="height: 2px; background: linear-gradient(90deg, transparent 0%, ${styles.accentColor} 20%, #a78bfa 50%, ${styles.primaryColor} 80%, transparent 100%);"></td>
                  </tr>
                </table>
              </div>
              
              <!-- Main Headline -->
              <div style="padding: 30px 40px 40px 40px;">
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 20px auto;">
                  <tr>
                    <td style="background: linear-gradient(135deg, ${styles.primaryColor} 0%, #c4d40d 100%); padding: 2px; border-radius: 100px;">
                      <table role="presentation" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="background: #1a1a1f; padding: 10px 24px; border-radius: 100px;">
                            <span style="color: ${styles.primaryColor}; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">EARLY ACCESS</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                
                <h1 style="color: #ffffff; font-size: 38px; font-weight: 800; margin: 0 0 16px 0; letter-spacing: -1px; line-height: 1.1;">
                  You're on the list.
                </h1>
                
                <p style="color: #cccccc; font-size: 15px; line-height: 1.6; margin: 0;">
                  Thanks for signing up. We're building something different — and you'll be the first to know when it's ready.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- What We're Building Section -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="text-align: center;">
                    <span style="color: rgba(255,255,255,0.4); font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">WHAT WE'RE BUILDING</span>
                  </td>
                </tr>
              </table>
              
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                
                <!-- Pillar 1: Research Academy -->
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #252529; border: 1px solid rgba(212, 255, 31, 0.2); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 16px 20px; border-left: 3px solid ${styles.primaryColor};">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 44px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: rgba(212, 255, 31, 0.12); border-radius: 8px; text-align: center; line-height: 32px;">
                                  <span style="font-size: 14px; color: ${styles.primaryColor};">01</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #ffffff;">Revive Research Academy</p>
                                <p style="margin: 0; font-size: 13px; color: #bbbbbb; line-height: 1.5;">Beginner or advanced — structured education built for real researchers.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Pillar 2: Synergy Engine -->
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #252529; border: 1px solid rgba(33, 216, 255, 0.2); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 16px 20px; border-left: 3px solid ${styles.accentColor};">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 44px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: rgba(33, 216, 255, 0.15); border-radius: 8px; text-align: center; line-height: 32px;">
                                  <span style="font-size: 14px; color: ${styles.accentColor};">02</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #ffffff;">Revive Synergy Engine</p>
                                <p style="margin: 0; font-size: 13px; color: #bbbbbb; line-height: 1.5;">Build stacks. See pathway interactions instantly.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Pillar 3: Verification -->
                <tr>
                  <td style="padding: 8px 0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #252529; border: 1px solid rgba(167, 139, 250, 0.2); border-radius: 12px; overflow: hidden;">
                      <tr>
                        <td style="padding: 16px 20px; border-left: 3px solid #a78bfa;">
                          <table role="presentation" cellspacing="0" cellpadding="0">
                            <tr>
                              <td style="width: 44px; vertical-align: top;">
                                <div style="width: 32px; height: 32px; background: rgba(167, 139, 250, 0.15); border-radius: 8px; text-align: center; line-height: 32px;">
                                  <span style="font-size: 14px; color: #a78bfa;">03</span>
                                </div>
                              </td>
                              <td style="vertical-align: top;">
                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #ffffff;">Trust Nothing. Verify Everything.</p>
                                <p style="margin: 0; font-size: 13px; color: #bbbbbb; line-height: 1.5;">Scan any vial. Real third-party results. Instantly.</p>
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
          
          <!-- Bold Statement -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <div style="border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 28px 0;">
                <p style="color: #ff2d9b; font-size: 18px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.4; letter-spacing: 0.3px;">
                  Peptides aren't the differentiator. We are.
                </p>
                <p style="color: #888888; font-size: 13px; font-weight: 500; margin: 0; line-height: 1.4; letter-spacing: 1px; text-transform: uppercase;">
                  Every vial. Every batch. Every single time.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- What's Next -->
          <tr>
            <td style="padding: 0 40px 40px 40px; text-align: center;">
              <p style="color: ${styles.accentColor}; font-size: 14px; font-weight: 500; margin: 0 0 24px 0;">
                You'll be the first to know when we go live.
              </p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" align="center">
                <tr>
                  <td style="background: ${styles.primaryColor}; border-radius: 10px; box-shadow: 0 0 30px rgba(212, 255, 31, 0.5), 0 0 60px rgba(212, 255, 31, 0.25);">
                    <a href="https://reviveresearch.co/" style="display: inline-block; padding: 16px 40px; font-size: 15px; font-weight: 700; color: #000000; text-decoration: none; letter-spacing: 0.5px;">
                      Explore the Platform
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #252529; padding: 32px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
              
              <p style="margin: 0 0 20px 0; font-size: 14px; color: #bbbbbb;">
                <span style="color: #ffffff; font-weight: 500;">The Revive Research Team</span>
              </p>
              
              ${getSharedFooterHtml(email, 'newsletter')}
              
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

export async function sendPreLaunchConfirmationEmail(email: string): Promise<EmailResult> {
  const template = getPreLaunchConfirmationTemplate(email);
  
  const result = await sendEmail({
    to: email,
    subject: template.subject,
    text: template.text,
    html: template.html,
    from: 'noreply',
    replyTo: 'support@reviveresearch.co',
  });

  if (result.success) {
    console.log(`[Email] Pre-launch confirmation sent to ${email}`);
    try {
      await storage.updateLastEmailSent(email);
    } catch (err) {
      console.error(`[Email] Failed to update last email sent for ${email}:`, err);
    }
  } else {
    console.error(`[Email] Failed to send pre-launch confirmation to ${email}:`, result.error);
  }

  return result;
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

export function getAffiliateWelcomeTemplate(affiliate: {
  firstName: string;
  lastName: string;
  email: string;
  referralCode: string;
}): { subject: string; text: string; html: string } {
  const { brand } = EMAIL_CONFIG;
  const styles = getEmailBaseStyles();
  const dashboardUrl = `${process.env.SITE_URL || 'https://reviveresearch.co'}/affiliate-dashboard`;
  const referralUrl = `${process.env.SITE_URL || 'https://reviveresearch.co'}?ref=${affiliate.referralCode}`;

  const subject = `Welcome to the ${brand.name} Affiliate Program`;

  const text = `
${brand.name.toUpperCase()}
Welcome to the Affiliate Program!

Hi ${affiliate.firstName},

Your affiliate account has been approved. You're now part of the ${brand.name} affiliate program.

YOUR REFERRAL CODE
------------------
${affiliate.referralCode}

Your referral link: ${referralUrl}

HOW IT WORKS
------------
- Share your referral link with researchers and professionals
- Earn 10% commission on every qualifying purchase
- Your referred customers receive a 10% discount automatically
- Monthly payouts once you reach the $100 minimum threshold

GETTING STARTED
---------------
Log in to your affiliate dashboard to track clicks, conversions, and earnings:
${dashboardUrl}

Questions? Reply to this email or contact us at ${EMAIL_CONFIG.replyTo}
${getSharedFooterText(affiliate.email, 'order')}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Affiliate Program</title>
</head>
<body style="${styles.body}">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0d0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #1a1a1f; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <p style="margin: 0 0 16px; font-size: 13px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: #D4FF1F;">AFFILIATE PROGRAM</p>
              <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">You're Approved.</h1>
              <p style="margin: 0; font-size: 16px; color: #999999;">Welcome to the ${brand.name} affiliate team.</p>
            </td>
          </tr>
          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 40px 0;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #cccccc; line-height: 1.6;">Hi ${affiliate.firstName},</p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #cccccc; line-height: 1.6;">Your affiliate application has been reviewed and approved. You can now start sharing your unique referral link and earning commissions on qualifying purchases.</p>
            </td>
          </tr>
          <!-- Referral Code -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(212, 255, 31,0.08) 0%, rgba(33,216,255,0.06) 100%); border: 1px solid rgba(212, 255, 31,0.2); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px 28px;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #D4FF1F;">Your Referral Code</p>
                    <p style="margin: 0 0 16px; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: 2px;">${affiliate.referralCode}</p>
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #999999;">Your Referral Link</p>
                    <p style="margin: 0; font-size: 13px; color: #21d8ff; word-break: break-all;">${referralUrl}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- How it works -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: #ffffff;">How It Works</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5;"><span style="color: #D4FF1F; font-weight: 700;">10%</span> commission on every qualifying purchase you refer</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5;"><span style="color: #D4FF1F; font-weight: 700;">10%</span> discount automatically applied for your referred customers</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);">
                    <p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5;"><span style="color: #21d8ff; font-weight: 700;">30-day</span> cookie window on every referral click</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;">
                    <p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5;">Monthly payouts once you reach the <span style="color: #21d8ff; font-weight: 700;">$100</span> minimum threshold</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <a href="${dashboardUrl}" style="display: inline-block; padding: 14px 32px; background-color: #D4FF1F; color: #0a0a0c; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.3px;">View Affiliate Dashboard</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #666666;">Questions? Reply to this email or contact <a href="mailto:${EMAIL_CONFIG.replyTo}" style="color: #21d8ff; text-decoration: none;">${EMAIL_CONFIG.replyTo}</a></p>
              <p style="margin: 0; font-size: 12px; color: #444444;">${getSharedFooterHtml(affiliate.email, 'order')}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

// ─────────────────────────────────────────────────────────────────────────────
// User Invite Email
// ─────────────────────────────────────────────────────────────────────────────

export function getInviteEmailTemplate(params: {
  firstName?: string;
  email: string;
  inviteUrl: string;
}): { subject: string; text: string; html: string } {
  const { brand } = EMAIL_CONFIG;
  const { firstName, email, inviteUrl } = params;
  const greeting = firstName ? `Hi ${firstName},` : 'Hi there,';
  const year = new Date().getFullYear();
  const subject = `You're Invited to Revive Research`;

  const text = `
${brand.name.toUpperCase()}
You're Invited.

${greeting}

You've been invited to create an account on Revive Research — a platform built for researchers who demand transparency, verified quality, and precision. Every product comes with third-party Certificates of Analysis, and our team is here to support your research from day one.

WHAT YOU GET
------------
- COA-verified peptide research compounds with full lab documentation
- Research Stacks — curated compound bundles with synergy insights
- Free shipping on orders over $250
- AI-powered reconstitution calculator and research tools

Create your account here:
${inviteUrl}

RESEARCH USE ONLY
All products are intended for laboratory research purposes only.
Not for human or animal consumption. Must be 21+ to access.

Questions? Contact us at ${EMAIL_CONFIG.replyTo}

Revive Research Company, LLC | Frisco, TX 75033
You received this invitation because someone at Revive Research shared it with you.`;

  const siteUrl = 'https://reviveresearch.co';
  const logoUrl = `${siteUrl}/assets/email-logo.png`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited — ${brand.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0d0f; font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d0d0f;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #1a1a1f; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);">
          <!-- HEADER -->
          <tr>
            <td style="padding: 40px 40px 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); background: linear-gradient(180deg, #252529 0%, #1a1a1f 100%);">
              <img src="${logoUrl}" alt="${brand.name}" width="220" style="display: block; margin: 0 auto 24px auto; max-width: 220px; height: auto;" />
              <p style="margin: 0 0 12px; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #D4FF1F;">INVITATION</p>
              <h1 style="margin: 0 0 10px; font-size: 34px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; line-height: 1.15;">You're Invited.</h1>
              <p style="margin: 0; font-size: 16px; color: #999999; line-height: 1.5;">Join the ${brand.name} platform for premium peptide research compounds.</p>
            </td>
          </tr>
          <!-- GREETING -->
          <tr>
            <td style="padding: 36px 40px 0;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #cccccc; line-height: 1.65;">${greeting}</p>
              <p style="margin: 0 0 16px; font-size: 16px; color: #cccccc; line-height: 1.65;">You've been invited to create an account on <strong style="color: #ffffff;">${brand.name}</strong> — a platform built for researchers who demand transparency, verified quality, and precision.</p>
              <p style="margin: 0 0 32px; font-size: 16px; color: #cccccc; line-height: 1.65;">Every product comes with third-party Certificates of Analysis, and our team is here to support your research from day one.</p>
            </td>
          </tr>
          <!-- HIGHLIGHTS CARD -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(212, 255, 31,0.06) 0%, rgba(33,216,255,0.04) 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px 28px;">
                    <p style="margin: 0 0 20px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #D4FF1F;">What You Get</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);"><p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5;"><span style="color: #D4FF1F; font-weight: 700;">COA-verified</span> peptide research compounds with full lab documentation</p></td></tr>
                      <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);"><p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5;"><span style="color: #21d8ff; font-weight: 700;">Research Stacks</span> — curated compound bundles with synergy insights</p></td></tr>
                      <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);"><p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5;"><span style="color: #D4FF1F; font-weight: 700;">Free shipping</span> on orders over $250</p></td></tr>
                      <tr><td style="padding: 10px 0;"><p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5;"><span style="color: #21d8ff; font-weight: 700;">AI-powered</span> reconstitution calculator and research tools</p></td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding: 0 40px 16px; text-align: center;">
              <a href="${inviteUrl}" style="display: inline-block; padding: 15px 40px; background-color: #D4FF1F; color: #0a0a0c; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.3px;">Create Your Account</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px; text-align: center;">
              <p style="margin: 0; font-size: 13px; color: #555555;">Or copy this link into your browser:<br><a href="${inviteUrl}" style="color: #21d8ff; text-decoration: none; word-break: break-all; font-size: 12px;">${inviteUrl}</a></p>
            </td>
          </tr>
          <!-- RUO DISCLAIMER -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <div style="border: 1px solid rgba(239,68,68,0.35); background: rgba(239,68,68,0.07); border-radius: 8px; padding: 14px 18px; text-align: center;">
                <p style="margin: 0 0 4px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #ef4444;">Research Use Only</p>
                <p style="margin: 0; font-size: 12px; color: #cccccc; line-height: 1.5;">All products are intended for laboratory research purposes only. Not for human or animal consumption. Must be 21+ to access.</p>
              </div>
            </td>
          </tr>
          <!-- FOOTER -->
          <tr>
            <td style="padding: 24px 40px 32px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center;">
              <p style="margin: 0 0 6px; font-size: 13px; color: #666666;">Questions? Contact us at <a href="mailto:${EMAIL_CONFIG.replyTo}" style="color: #21d8ff; text-decoration: none;">${EMAIL_CONFIG.replyTo}</a></p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #444444;">Revive Research Company, LLC &nbsp;&bull;&nbsp; Frisco, TX 75033</p>
              <p style="margin: 0; font-size: 11px; color: #3a3a3a; line-height: 1.6;">You received this invitation because someone at ${brand.name} shared it with you.<br>&copy; ${year} ${brand.name}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export async function sendInviteEmail(params: {
  firstName?: string;
  email: string;
  inviteUrl: string;
}): Promise<EmailResult> {
  const { subject, html, text } = getInviteEmailTemplate(params);
  return sendEmail({
    to: params.email,
    subject,
    html,
    text,
    from: 'noreply',
    replyTo: EMAIL_CONFIG.replyTo,
  });
}
