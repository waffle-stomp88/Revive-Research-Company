// PayPal integration - based on blueprint:javascript_paypal
import PayPalSDK from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";

const { Client, Environment, LogLevel, OAuthAuthorizationController, OrdersController } = PayPalSDK;

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
    const { amount, currency, intent, shippingAddress, lineItems, breakdown } = req.body;

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

    const total = parseFloat(amount);

    // Build enriched purchase unit when shipping address and line items are provided
    let purchaseUnit: Record<string, any>;

    if (
      shippingAddress &&
      Array.isArray(lineItems) &&
      lineItems.length > 0 &&
      breakdown
    ) {
      const shippingAmt = parseFloat(breakdown.shipping ?? "0") || 0;
      const taxAmt = parseFloat(breakdown.taxTotal ?? "0") || 0;
      // Derive item total so that itemTotal + shipping + tax === total exactly
      const itemTotal = parseFloat((total - shippingAmt - taxAmt).toFixed(2));

      // Distribute itemTotal across line items proportional to their unit prices.
      // Apply a last-item adjustment guardrail so the sum is exact.
      const enrichedItems: Array<{ name: string; sku?: string; quantity: string; unitAmount: { currencyCode: string; value: string } }> = [];
      let runningSum = 0;
      for (let i = 0; i < lineItems.length; i++) {
        const item = lineItems[i];
        const qty = Math.max(1, parseInt(String(item.quantity), 10) || 1);
        const isLast = i === lineItems.length - 1;
        let unitAmt: number;
        if (isLast) {
          // Guardrail: last item absorbs rounding delta
          const remaining = parseFloat((itemTotal - runningSum).toFixed(2));
          unitAmt = parseFloat((remaining / qty).toFixed(2));
          // If per-unit amount doesn't divide evenly, nudge the total via the last unit
          const check = parseFloat((unitAmt * qty).toFixed(2));
          if (check !== remaining) {
            unitAmt = parseFloat(((remaining + (remaining - check)) / qty).toFixed(2));
          }
        } else {
          unitAmt = parseFloat(parseFloat(String(item.unitAmount)).toFixed(2));
        }
        runningSum = parseFloat((runningSum + unitAmt * qty).toFixed(2));
        const entry: Record<string, any> = {
          name: item.name || "Lab Supplies",
          quantity: String(qty),
          unitAmount: { currencyCode: currency, value: unitAmt.toFixed(2) },
        };
        if (item.sku) entry.sku = String(item.sku).substring(0, 127);
        enrichedItems.push(entry as any);
      }

      purchaseUnit = {
        amount: {
          currencyCode: currency,
          value: amount,
          breakdown: {
            itemTotal: { currencyCode: currency, value: itemTotal.toFixed(2) },
            shipping: { currencyCode: currency, value: shippingAmt.toFixed(2) },
            taxTotal: { currencyCode: currency, value: taxAmt.toFixed(2) },
          },
        },
        items: enrichedItems,
        shipping: {
          name: { fullName: String(shippingAddress.fullName || "").substring(0, 300) },
          address: {
            addressLine1: String(shippingAddress.street || "").substring(0, 300),
            adminArea2: String(shippingAddress.city || "").substring(0, 120),
            adminArea1: String(shippingAddress.state || "").substring(0, 2),
            postalCode: String(shippingAddress.zip || "").substring(0, 60),
            countryCode: "US",
          },
        },
      };
    } else {
      purchaseUnit = {
        amount: {
          currencyCode: currency,
          value: amount,
        },
      };
    }

    const collect = {
      body: {
        intent: intent,
        purchaseUnits: [purchaseUnit],
      } as any,
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
   PayPal REST helpers
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
