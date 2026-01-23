import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const SMS_CONFIG = {
  brand: 'Revive Research',
  maxLength: 160,
} as const;

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

let snsClient: SNSClient | null = null;

function getSNSClient(): SNSClient | null {
  if (snsClient) return snsClient;
  
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    console.warn('[SMS] AWS credentials not configured. SMS notifications disabled.');
    return null;
  }

  snsClient = new SNSClient({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return snsClient;
}

export async function sendSMS(phoneNumber: string, message: string): Promise<SMSResult> {
  const client = getSNSClient();
  
  if (!client) {
    return { 
      success: false, 
      error: 'SMS service not configured - missing AWS credentials' 
    };
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);
  if (!formattedPhone) {
    return { 
      success: false, 
      error: 'Invalid phone number format' 
    };
  }

  const truncatedMessage = message.length > SMS_CONFIG.maxLength 
    ? message.slice(0, SMS_CONFIG.maxLength - 3) + '...'
    : message;

  try {
    const command = new PublishCommand({
      PhoneNumber: formattedPhone,
      Message: truncatedMessage,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'ReviveRes',
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    });

    console.log(`[SMS] Sending to ${formattedPhone}: "${truncatedMessage.slice(0, 50)}..."`);
    
    const response = await client.send(command);
    
    console.log(`[SMS] Successfully sent. MessageId: ${response.MessageId}`);
    
    return {
      success: true,
      messageId: response.MessageId,
    };
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown SMS error';
    console.error('[SMS Error]', errorMessage);
    console.error('[SMS Error Details]', error);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

function formatPhoneNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  
  return null;
}

export function getShortOrderRef(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}

export async function sendOrderConfirmationSMS(
  phoneNumber: string,
  orderRef: string,
  totalAmount: string
): Promise<SMSResult> {
  const shortRef = getShortOrderRef(orderRef);
  const message = `${SMS_CONFIG.brand}: Order #${shortRef} confirmed! Total: $${totalAmount}. Your order will ship within 24 hrs. Questions? support@reviveresearch.co`;
  
  return sendSMS(phoneNumber, message);
}

export async function sendAdminOrderAlertSMS(
  adminPhone: string,
  orderRef: string,
  customerName: string,
  totalAmount: string
): Promise<SMSResult> {
  const shortRef = getShortOrderRef(orderRef);
  const message = `NEW ORDER #${shortRef} | ${customerName} | $${totalAmount}`;
  
  return sendSMS(adminPhone, message);
}

export async function sendShippingUpdateSMS(
  phoneNumber: string,
  orderRef: string,
  trackingNumber?: string
): Promise<SMSResult> {
  const shortRef = getShortOrderRef(orderRef);
  const message = trackingNumber
    ? `${SMS_CONFIG.brand}: Order #${shortRef} shipped! Tracking: ${trackingNumber}`
    : `${SMS_CONFIG.brand}: Order #${shortRef} shipped! Check your email for tracking info.`;
  
  return sendSMS(phoneNumber, message);
}

export function isSMSConfigured(): boolean {
  return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}
