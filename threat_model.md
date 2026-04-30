# Threat Model

## Project Overview

Revive Research is a full-stack TypeScript e-commerce app for selling research-use compounds. The production app is a React/Vite frontend talking to an Express API in `server/`, with PostgreSQL via Drizzle in `server/storage.ts` and `shared/schema.ts`. The app handles guest checkout, authenticated user dashboards, admin operations, PayPal and Stripe payments, Amazon SES/SNS notifications, Auth0/Replit-style auth flows, and object storage uploads.

Production scope for this scan is limited to code that can affect the deployed app. Mockup sandbox code is out of scope unless production reachability is shown. Assume `NODE_ENV=production` in production. TLS between clients and the platform edge is provided by the platform.

## Assets

- **User accounts and sessions** — session cookies, identity records, admin flags, affiliate identities, and any server-side mapping between a logged-in user and a database user row. Compromise allows account takeover and admin takeover.
- **Order and customer data** — names, emails, shipping addresses, phone numbers, order contents, fulfillment state, and payment-related identifiers. This is sensitive personal and business data.
- **Payment state and order integrity** — whether an order is really paid, the amount paid, subscription state, discount application, and inventory side effects. If this is wrong, attackers can get products for free, underpay, or disrupt operations.
- **Admin capabilities** — product editing, pricing, inventory, order fulfillment, email logs, contacts, affiliate data, and customer history. Abuse here has business-wide impact.
- **Application secrets and outbound service privileges** — database credentials, session secret, PayPal/Stripe credentials, SES/SNS privileges, and object storage access. Misuse can lead to broad compromise or brand abuse.
- **Public trust and sender reputation** — branded email delivery, transactional notifications, AI-assisted public features, and public-facing content. Abuse can harm deliverability, provider spend, and user trust.
- **Draft and unpublished content** — legal documents and education content that may exist in the database before publication. Disclosure can leak internal messaging, future content, or unfinished compliance copy.

## Trust Boundaries

- **Browser to API** — all client input is untrusted, including checkout totals, profile fields, order IDs, subscription IDs, and any auth-sync payloads.
- **Public to authenticated to admin** — the app has public storefront routes, user dashboard routes, and admin-only routes. The server must enforce each boundary itself.
- **API to PostgreSQL** — the API can read and change all customer, order, and admin data. Broken auth or unsafe query scoping here becomes full data compromise.
- **API to payment providers** — server routes call PayPal and Stripe. The server must verify payment state with the provider instead of trusting the browser.
- **API to email/SMS providers** — server routes can send branded outbound messages. Public abuse of these routes can turn the app into a spam or phishing relay.
- **API to object storage** — upload and file-serving paths need strict authorization and path validation.

## Scan Anchors

- **Production entry points**: `server/index.ts`, `server/routes.ts`
- **Highest-risk code areas**: `server/routes.ts`, `server/storage.ts`, `server/paypal.ts`, `server/auth0Auth.ts`, `server/replitAuth.ts`
- **Public/auth/admin boundary**: public storefront and checkout routes in `server/routes.ts`; user routes gated by `isAuthenticated`; admin routes gated by `isAdmin`
- **Sensitive client consumers**: `client/src/pages/order-confirmation.tsx`, checkout and PayPal components, dashboard pages
- **Extra public-risk endpoints**: `/api/chat`, `/api/ai/synergy-analysis`, `/api/legal/:slug`, `/api/education/:slug`
- **Shared data model**: `shared/schema.ts`
- **Usually dev-only / lower-priority unless proven reachable**: mockup-only code, local-only tooling, and experimental sandbox flows

## Threat Categories

### Spoofing

This app depends on server-side identity binding to decide who a user is and whether they are an admin. The server must only create or resume a session from validated identity provider data, never from caller-supplied profile fields or identifiers. Payment and webhook callbacks must also be tied to a verified provider response, not just a client-provided ID string.

Required guarantees:
- Identity synchronization routes MUST require validated identity claims from the real auth provider.
- Session state MUST be created only after the server has verified who the caller is.
- Admin status MUST come from trusted server-side state and must never be attachable by choosing another user identifier.
- Payment completion routes and webhooks MUST verify the provider response before changing order state.

### Tampering

The storefront accepts carts, totals, discount inputs, and payment flow data from the browser. The client is not trustworthy. The server must calculate authoritative prices, quantities, shipping, and paid status before creating or fulfilling orders.

Required guarantees:
- Order totals, currencies, and item prices MUST be computed or revalidated server-side.
- Order status MUST NOT move to paid from browser input alone.
- Inventory and fulfillment side effects MUST happen only after verified payment.
- Subscription actions MUST verify that the caller owns the subscription being changed.

### Information Disclosure

The app stores and serves customer PII, order history, shipping details, email events, affiliate data, admin operational data, and draft content records. Public routes that return any of this data must be carefully scoped to the requesting user or disabled entirely.

Required guarantees:
- Order lookup routes MUST require ownership checks or another strong proof of possession.
- Admin APIs MUST never be reachable from public or guest contexts.
- API responses and logs MUST avoid exposing unnecessary customer data.
- Publication-state controls MUST be enforced consistently on both list and direct-by-slug content lookups.
- Public content rendering MUST not allow stored script execution from less-trusted content sources.

### Denial of Service

Several public endpoints trigger database writes or outbound provider actions such as sending email or calling payment APIs. If these routes are public and unthrottled, attackers can create operational cost, queue growth, or service degradation.

Required guarantees:
- Public endpoints that send email, create orders, or trigger third-party API calls MUST be authenticated, rate-limited, or otherwise abuse-resistant.
- Expensive provider calls MUST have bounded inputs and sensible timeouts.
- Public write endpoints MUST validate payload size and reject malformed or repetitive abuse traffic.

### Elevation of Privilege

The main privilege boundary is between guest users, normal logged-in users, and admins. Broken ownership checks or weak identity binding can let a normal user act as another user or as an admin, which would expose customer data and powerful admin operations.

Required guarantees:
- Every admin route MUST enforce a server-side admin check based on trusted identity.
- User-scoped routes MUST verify the requested resource belongs to the current user.
- Account linking or upsert logic MUST not transfer privileged flags based only on a shared email address or other user-controlled field.
- Public order, account, and fulfillment endpoints MUST not rely on hidden URLs or client-side routing for protection.
