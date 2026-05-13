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
                <span style="display: inline-block; background: linear-gradient(135deg, ${styles.primaryColor} 0%, #c4d40d 100%); color: #000000; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 100px; letter-spacing: 1.5px; box-shadow: 0 0 30px rgba(231, 251, 16, 0.4);">
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
                        2–5 Business Days
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
You received this invitation because someone at Revive Research shared it with you.
© ${year} Revive Research. All rights reserved.`;

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
              <img src="https://reviveresearch.co/assets/email-logo.png" alt="${brand.name}" width="220" style="display: block; margin: 0 auto 24px auto; max-width: 220px; height: auto;" />
              <p style="margin: 0 0 12px; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #E7FB10;">INVITATION</p>
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
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(231,251,16,0.06) 0%, rgba(33,216,255,0.04) 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px 28px;">
                    <p style="margin: 0 0 20px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #E7FB10;">What You Get</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);"><p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5;"><span style="color: #E7FB10; font-weight: 700;">COA-verified</span> peptide research compounds with full lab documentation</p></td></tr>
                      <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);"><p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5;"><span style="color: #21d8ff; font-weight: 700;">Research Stacks</span> — curated compound bundles with synergy insights</p></td></tr>
                      <tr><td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.06);"><p style="margin: 0; font-size: 15px; color: #cccccc; line-height: 1.5;"><span style="color: #E7FB10; font-weight: 700;">Free shipping</span> on orders over $250</p></td></tr>
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
              <a href="${inviteUrl}" style="display: inline-block; padding: 15px 40px; background-color: #E7FB10; color: #0a0a0c; font-size: 16px; font-weight: 700; text-decoration: none; border-radius: 8px; letter-spacing: 0.3px;">Create Your Account</a>
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
