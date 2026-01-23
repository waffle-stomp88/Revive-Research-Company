import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail, isEmailConfigured } from './email';
import { sendOrderConfirmationSMS, sendAdminOrderAlertSMS, sendShippingUpdateSMS, isSMSConfigured } from './sms';

interface OrderNotificationData {
  orderId: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  productId: string;
  productName?: string;
  quantity: number;
  totalAmount: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface NotificationResult {
  customerEmail: { sent: boolean; error?: string };
  adminEmail: { sent: boolean; error?: string };
  customerSMS: { sent: boolean; error?: string };
  adminSMS: { sent: boolean; error?: string };
}

export async function sendOrderNotifications(data: OrderNotificationData): Promise<NotificationResult> {
  const results: NotificationResult = {
    customerEmail: { sent: false },
    adminEmail: { sent: false },
    customerSMS: { sent: false },
    adminSMS: { sent: false },
  };

  const orderData = {
    id: data.orderId,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    productId: data.productId,
    quantity: data.quantity,
    totalAmount: data.totalAmount,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    country: data.country,
    phone: data.phone,
  };

  console.log(`[Notifications] Processing order notifications for ${data.orderId}`);

  const promises: Promise<void>[] = [];

  if (isEmailConfigured()) {
    promises.push(
      sendOrderConfirmationEmail(orderData, data.productName)
        .then((result) => {
          results.customerEmail = { sent: result.success, error: result.error };
        })
        .catch((error) => {
          results.customerEmail = { sent: false, error: error.message };
        })
    );

    promises.push(
      sendAdminOrderNotificationEmail(orderData, data.productName)
        .then((result) => {
          results.adminEmail = { sent: result.success, error: result.error };
        })
        .catch((error) => {
          results.adminEmail = { sent: false, error: error.message };
        })
    );
  } else {
    const reason = 'Email service not configured (missing SES credentials)';
    console.log(`[Notifications] ${reason}`);
    results.customerEmail = { sent: false, error: reason };
    results.adminEmail = { sent: false, error: reason };
  }

  if (isSMSConfigured()) {
    if (data.phone) {
      promises.push(
        sendOrderConfirmationSMS(data.phone, data.orderId, data.totalAmount)
          .then((result) => {
            results.customerSMS = { sent: result.success, error: result.error };
          })
          .catch((error) => {
            results.customerSMS = { sent: false, error: error.message };
          })
      );
    } else {
      results.customerSMS = { sent: false, error: 'Customer phone number not provided' };
    }

    const adminPhone = process.env.ADMIN_PHONE;
    if (adminPhone) {
      promises.push(
        sendAdminOrderAlertSMS(adminPhone, data.orderId, `${data.firstName} ${data.lastName}`, data.totalAmount)
          .then((result) => {
            results.adminSMS = { sent: result.success, error: result.error };
          })
          .catch((error) => {
            results.adminSMS = { sent: false, error: error.message };
          })
      );
    } else {
      results.adminSMS = { sent: false, error: 'ADMIN_PHONE not configured' };
    }
  } else {
    const reason = 'SMS service not configured (missing AWS credentials)';
    console.log(`[Notifications] ${reason}`);
    results.customerSMS = { sent: false, error: reason };
    results.adminSMS = { sent: false, error: reason };
  }

  await Promise.allSettled(promises);

  console.log(`[Notifications] Results for order ${data.orderId}:`, JSON.stringify(results));

  return results;
}

export async function sendShippingNotifications(
  orderId: string,
  phone?: string,
  trackingNumber?: string
): Promise<{ sms: { sent: boolean; error?: string } }> {
  const result = { sms: { sent: false, error: undefined as string | undefined } };

  if (!isSMSConfigured()) {
    console.log('[Notifications] SMS not configured, skipping shipping SMS');
    return result;
  }

  if (!phone) {
    console.log('[Notifications] No phone number provided, skipping shipping SMS');
    return result;
  }

  try {
    const smsResult = await sendShippingUpdateSMS(phone, orderId, trackingNumber);
    result.sms = { sent: smsResult.success, error: smsResult.error };
  } catch (error: any) {
    result.sms = { sent: false, error: error.message };
  }

  return result;
}

export function getNotificationStatus(): {
  email: boolean;
  sms: boolean;
} {
  return {
    email: isEmailConfigured(),
    sms: isSMSConfigured(),
  };
}
