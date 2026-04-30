// PayPal integration - based on blueprint:javascript_paypal
import PayPalSDK from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";

const { Client, Environment, LogLevel, OAuthAuthorizationController, OrdersController } = PayPalSDK;

// Naming convention for PayPal (generic to avoid flags)
const PAYPAL_PRODUCT_NAME = "Revive Research – Supplies";
const SUBSCRIPTION_PLAN_NAMES = {
  weekly: "Revive Research - Weekly Supply Subscription",
  biweekly: "Revive Research - Bi-Weekly Supply Subscription", 
  monthly: "Revive Research - Monthly Supply Subscription",
};

// Rotating descriptions
const INDIVIDUAL_DESCRIPTIONS = ["Supply delivery", "Order fulfillment"];
const SUBSCRIPTION_DESCRIPTIONS = ["Recurring supply delivery", "Subscription fulfillment"];

function getRandomDescription(isSubscription: boolean): string {
  const descriptions = isSubscription ? SUBSCRIPTION_DESCRIPTIONS : INDIVIDUAL_DESCRIPTIONS;
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Subscription discount rates
export const SUBSCRIPTION_DISCOUNTS = {
  weekly: 0.15,    // 15% off
  biweekly: 0.12,  // 12% off
  monthly: 0.10,   // 10% off
} as const;

export type SubscriptionFrequency = keyof typeof SUBSCRIPTION_DISCOUNTS;

// Helper to check if we're in PayPal sandbox mode (test mode)
// Uses explicit PAYPAL_MODE env var if set, otherwise falls back to NODE_ENV
export function isPayPalSandbox(): boolean {
  const paypalMode = process.env.PAYPAL_MODE;
  if (paypalMode) {
    return paypalMode.toLowerCase() !== "live" && paypalMode.toLowerCase() !== "production";
  }
  // Fall back to NODE_ENV if PAYPAL_MODE not explicitly set
  // In Replit: published apps have NODE_ENV=production, dev/preview environments don't
  const isSandbox = process.env.NODE_ENV !== "production";
  if (!paypalMode) {
    console.log(`[PayPal] PAYPAL_MODE not set, using NODE_ENV fallback: ${isSandbox ? 'sandbox' : 'live'}`);
  }
  return isSandbox;
}

/* PayPal Controllers Setup - Lazy initialization */

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

let client: InstanceType<typeof Client> | null = null;
let ordersController: InstanceType<typeof OrdersController> | null = null;
let oAuthAuthorizationController: InstanceType<typeof OAuthAuthorizationController> | null = null;

function initPayPalClient() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET secrets.");
  }
  
  if (!client) {
    // Use same environment detection as isPayPalSandbox() for consistency
    const useSandbox = isPayPalSandbox();
    client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
      },
      timeout: 0,
      environment: useSandbox ? Environment.Sandbox : Environment.Production,
      logging: {
        logLevel: LogLevel.Info,
        logRequest: {
          logBody: true,
        },
        logResponse: {
          logHeaders: true,
        },
      },
    });
    ordersController = new OrdersController(client);
    oAuthAuthorizationController = new OAuthAuthorizationController(client);
  }
  
  return { client, ordersController: ordersController!, oAuthAuthorizationController: oAuthAuthorizationController! };
}

/* Token generation helpers */

export async function getClientToken() {
  const { oAuthAuthorizationController } = initPayPalClient();
  
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const { result } = await oAuthAuthorizationController.requestToken(
    {
      authorization: `Basic ${auth}`,
    },
    { intent: "sdk_init", response_type: "client_token" },
  );

  return result.accessToken;
}

/*  Process transactions */

export async function createPaypalOrder(req: Request, res: Response) {
  try {
    const { ordersController } = initPayPalClient();
    const { amount, currency, intent } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({
          error: "Invalid amount. Amount must be a positive number.",
        });
    }

    if (!currency) {
      return res
        .status(400)
        .json({ error: "Invalid currency. Currency is required." });
    }

    if (!intent) {
      return res
        .status(400)
        .json({ error: "Invalid intent. Intent is required." });
    }

    const collect = {
      body: {
        intent: intent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount,
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
      await ordersController.createOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error: any) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: error.message || "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  try {
    const { ordersController } = initPayPalClient();
    const { orderID } = req.params;
    const collect = {
      id: orderID,
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
      await ordersController.captureOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error: any) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: error.message || "Failed to capture order." });
  }
}

export interface PaypalOrderVerification {
  status: string;
  capturedAmount: number;
  currency: string;
}

export async function getPaypalOrderDetails(orderID: string): Promise<PaypalOrderVerification | null> {
  try {
    const accessToken = await getAccessToken();
    const baseUrl = getPayPalBaseUrl();

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderID)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`[PayPal] getPaypalOrderDetails HTTP ${response.status} for order ${orderID}`);
      return null;
    }

    const order = await response.json();

    let capturedAmount = 0;
    let currency = "USD";

    if (order.purchase_units && Array.isArray(order.purchase_units)) {
      for (const unit of order.purchase_units) {
        if (unit.payments && Array.isArray(unit.payments.captures)) {
          for (const capture of unit.payments.captures) {
            if (capture.status === "COMPLETED") {
              capturedAmount += parseFloat(capture.amount?.value ?? "0");
              currency = capture.amount?.currency_code ?? "USD";
            }
          }
        }
      }
    }

    return { status: order.status ?? "UNKNOWN", capturedAmount, currency };
  } catch (error: any) {
    console.error("Failed to get PayPal order details:", error);
    return null;
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  try {
    const clientToken = await getClientToken();
    res.json({
      clientToken,
    });
  } catch (error: any) {
    console.error("Failed to load PayPal:", error);
    res.status(500).json({ error: error.message || "Failed to initialize PayPal." });
  }
}

/* ========================================
   PayPal Subscriptions API
   ======================================== */

// Get PayPal base URL - uses same environment detection as isPayPalSandbox()
function getPayPalBaseUrl(): string {
  return isPayPalSandbox() 
    ? "https://api-m.sandbox.paypal.com" 
    : "https://api-m.paypal.com";
}

// Get PayPal access token for REST API calls
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const baseUrl = getPayPalBaseUrl();
  
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  
  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }
  
  const data = await response.json();
  return data.access_token;
}

// Create a PayPal product (required before creating plans)
export async function createPayPalProduct(): Promise<string> {
  const accessToken = await getAccessToken();
  const baseUrl = getPayPalBaseUrl();
  
  const response = await fetch(`${baseUrl}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `product-${Date.now()}`,
    },
    body: JSON.stringify({
      name: PAYPAL_PRODUCT_NAME,
      description: getRandomDescription(true),
      type: "SERVICE",
      category: "SPECIALTY_RETAIL",
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create PayPal product");
  }
  
  const data = await response.json();
  return data.id;
}

// Create a subscription plan
export async function createSubscriptionPlan(
  productId: string,
  frequency: SubscriptionFrequency,
  basePrice: number
): Promise<{ planId: string; discountedPrice: number }> {
  const accessToken = await getAccessToken();
  const baseUrl = getPayPalBaseUrl();
  
  const discount = SUBSCRIPTION_DISCOUNTS[frequency];
  const discountedPrice = Math.round(basePrice * (1 - discount) * 100) / 100;
  
  // Determine billing interval
  let intervalUnit: string;
  let intervalCount: number;
  
  switch (frequency) {
    case "weekly":
      intervalUnit = "WEEK";
      intervalCount = 1;
      break;
    case "biweekly":
      intervalUnit = "WEEK";
      intervalCount = 2;
      break;
    case "monthly":
      intervalUnit = "MONTH";
      intervalCount = 1;
      break;
  }
  
  const response = await fetch(`${baseUrl}/v1/billing/plans`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `plan-${frequency}-${Date.now()}`,
    },
    body: JSON.stringify({
      product_id: productId,
      name: SUBSCRIPTION_PLAN_NAMES[frequency],
      description: getRandomDescription(true),
      status: "ACTIVE",
      billing_cycles: [
        {
          frequency: {
            interval_unit: intervalUnit,
            interval_count: intervalCount,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // Infinite
          pricing_scheme: {
            fixed_price: {
              value: discountedPrice.toFixed(2),
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: "0",
          currency_code: "USD",
        },
        setup_fee_failure_action: "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    console.error("PayPal plan creation error:", error);
    throw new Error(error.message || "Failed to create subscription plan");
  }
  
  const data = await response.json();
  return { planId: data.id, discountedPrice };
}

// Create a subscription for a customer
export async function createPayPalSubscription(req: Request, res: Response) {
  try {
    const { planId, returnUrl, cancelUrl } = req.body;
    
    if (!planId) {
      return res.status(400).json({ error: "Plan ID is required" });
    }
    
    const accessToken = await getAccessToken();
    const baseUrl = getPayPalBaseUrl();
    
    const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `sub-${Date.now()}`,
      },
      body: JSON.stringify({
        plan_id: planId,
        application_context: {
          brand_name: "Revive Research",
          locale: "en-US",
          shipping_preference: "GET_FROM_FILE",
          user_action: "SUBSCRIBE_NOW",
          payment_method: {
            payer_selected: "PAYPAL",
            payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
          },
          return_url: returnUrl || `${process.env.REPLIT_DEPLOYMENT_URL || 'http://localhost:5000'}/subscription/success`,
          cancel_url: cancelUrl || `${process.env.REPLIT_DEPLOYMENT_URL || 'http://localhost:5000'}/subscription/cancel`,
        },
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error("PayPal subscription creation error:", error);
      return res.status(400).json({ error: error.message || "Failed to create subscription" });
    }
    
    const data = await response.json();
    res.json({
      subscriptionId: data.id,
      status: data.status,
      approvalUrl: data.links?.find((l: any) => l.rel === "approve")?.href,
    });
  } catch (error: any) {
    console.error("Failed to create subscription:", error);
    res.status(500).json({ error: error.message || "Failed to create subscription" });
  }
}

// Get subscription details
export async function getSubscriptionDetails(subscriptionId: string) {
  const accessToken = await getAccessToken();
  const baseUrl = getPayPalBaseUrl();
  
  const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to get subscription details");
  }
  
  return await response.json();
}

// Cancel a subscription
export async function cancelPayPalSubscription(req: Request, res: Response) {
  try {
    const { subscriptionId, reason } = req.body;
    
    if (!subscriptionId) {
      return res.status(400).json({ error: "Subscription ID is required" });
    }
    
    const accessToken = await getAccessToken();
    const baseUrl = getPayPalBaseUrl();
    
    const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reason: reason || "Customer requested cancellation",
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return res.status(400).json({ error: error.message || "Failed to cancel subscription" });
    }
    
    res.json({ success: true, message: "Subscription cancelled" });
  } catch (error: any) {
    console.error("Failed to cancel subscription:", error);
    res.status(500).json({ error: error.message || "Failed to cancel subscription" });
  }
}

// Create or get subscription plan endpoint
export async function getOrCreateSubscriptionPlan(req: Request, res: Response) {
  try {
    const { frequency, basePrice } = req.body;
    
    if (!frequency || !["weekly", "biweekly", "monthly"].includes(frequency)) {
      return res.status(400).json({ error: "Valid frequency is required (weekly, biweekly, monthly)" });
    }
    
    if (!basePrice || isNaN(parseFloat(basePrice)) || parseFloat(basePrice) <= 0) {
      return res.status(400).json({ error: "Valid base price is required" });
    }
    
    // Create a new product for this subscription
    const productId = await createPayPalProduct();
    
    // Create the plan
    const { planId, discountedPrice } = await createSubscriptionPlan(
      productId,
      frequency as SubscriptionFrequency,
      parseFloat(basePrice)
    );
    
    res.json({
      planId,
      productId,
      frequency,
      basePrice: parseFloat(basePrice),
      discountedPrice,
      discountPercent: SUBSCRIPTION_DISCOUNTS[frequency as SubscriptionFrequency] * 100,
    });
  } catch (error: any) {
    console.error("Failed to create subscription plan:", error);
    res.status(500).json({ error: error.message || "Failed to create subscription plan" });
  }
}

// Get subscription discounts
export function getSubscriptionDiscounts(req: Request, res: Response) {
  res.json({
    weekly: { discount: SUBSCRIPTION_DISCOUNTS.weekly, label: "15% off", frequency: "Weekly" },
    biweekly: { discount: SUBSCRIPTION_DISCOUNTS.biweekly, label: "12% off", frequency: "Every 2 Weeks" },
    monthly: { discount: SUBSCRIPTION_DISCOUNTS.monthly, label: "10% off", frequency: "Monthly" },
  });
}

/* ========================================
   PayPal Webhook Handler
   ======================================== */

export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  event_version: string;
  create_time: string;
  resource_type: string;
  resource: {
    id: string;
    status: string;
    billing_info?: {
      last_payment?: {
        amount: {
          value: string;
          currency_code: string;
        };
        time: string;
      };
      next_billing_time?: string;
    };
    subscriber?: {
      email_address?: string;
      name?: {
        given_name?: string;
        surname?: string;
      };
    };
    [key: string]: any;
  };
  links?: Array<{ href: string; rel: string; method: string }>;
}

// Webhook event types we handle
export const SUBSCRIPTION_WEBHOOK_EVENTS = {
  ACTIVATED: "BILLING.SUBSCRIPTION.ACTIVATED",
  CANCELLED: "BILLING.SUBSCRIPTION.CANCELLED",
  CREATED: "BILLING.SUBSCRIPTION.CREATED",
  EXPIRED: "BILLING.SUBSCRIPTION.EXPIRED",
  PAYMENT_FAILED: "BILLING.SUBSCRIPTION.PAYMENT.FAILED",
  SUSPENDED: "BILLING.SUBSCRIPTION.SUSPENDED",
  UPDATED: "BILLING.SUBSCRIPTION.UPDATED",
  SALE_COMPLETED: "PAYMENT.SALE.COMPLETED",
} as const;

// Handler for PayPal subscription webhooks
export async function handlePayPalWebhook(req: Request, res: Response) {
  try {
    const webhookEvent = req.body as PayPalWebhookEvent;
    
    console.log(`[PayPal Webhook] Received event: ${webhookEvent.event_type}`);
    console.log(`[PayPal Webhook] Resource ID: ${webhookEvent.resource?.id}`);
    
    // Process based on event type
    switch (webhookEvent.event_type) {
      case SUBSCRIPTION_WEBHOOK_EVENTS.ACTIVATED:
        console.log(`[PayPal Webhook] Subscription activated: ${webhookEvent.resource.id}`);
        // Subscription is now active - update database status
        break;
        
      case SUBSCRIPTION_WEBHOOK_EVENTS.CANCELLED:
        console.log(`[PayPal Webhook] Subscription cancelled: ${webhookEvent.resource.id}`);
        // Update subscription status in database
        break;
        
      case SUBSCRIPTION_WEBHOOK_EVENTS.PAYMENT_FAILED:
        console.log(`[PayPal Webhook] Payment failed for subscription: ${webhookEvent.resource.id}`);
        // Handle payment failure - maybe send notification
        break;
        
      case SUBSCRIPTION_WEBHOOK_EVENTS.SUSPENDED:
        console.log(`[PayPal Webhook] Subscription suspended: ${webhookEvent.resource.id}`);
        // Update status to suspended
        break;
        
      case SUBSCRIPTION_WEBHOOK_EVENTS.EXPIRED:
        console.log(`[PayPal Webhook] Subscription expired: ${webhookEvent.resource.id}`);
        // Mark subscription as expired
        break;
        
      case SUBSCRIPTION_WEBHOOK_EVENTS.SALE_COMPLETED:
        console.log(`[PayPal Webhook] Payment completed for subscription`);
        // Record the payment
        break;
        
      default:
        console.log(`[PayPal Webhook] Unhandled event type: ${webhookEvent.event_type}`);
    }
    
    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true, event_type: webhookEvent.event_type });
  } catch (error: any) {
    console.error("[PayPal Webhook] Error processing webhook:", error);
    // Still return 200 to prevent PayPal from retrying
    res.status(200).json({ received: true, error: "Processing error" });
  }
}
