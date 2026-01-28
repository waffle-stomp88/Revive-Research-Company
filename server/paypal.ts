// PayPal integration - based on blueprint:javascript_paypal
import PayPalSDK from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";

const { Client, Environment, LogLevel, OAuthAuthorizationController, OrdersController } = PayPalSDK;

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
    client = new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: PAYPAL_CLIENT_ID,
        oAuthClientSecret: PAYPAL_CLIENT_SECRET,
      },
      timeout: 0,
      environment:
        process.env.NODE_ENV === "production"
          ? Environment.Production
          : Environment.Sandbox,
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
