# Revive Research - E-commerce Platform for Premium Peptide Research Compounds

## Overview
Revive Research is an e-commerce platform specializing in premium peptide research compounds. It features an Apple-inspired design, a full-stack TypeScript architecture with React and Express, and emphasizes scientific credibility through third-party lab verification and Certificates of Analysis (COA). The platform targets researchers and professionals, offering key capabilities such as age verification, tiered affiliate programs, product bundling ("Research Stacks"), and an AI chatbot for customer support. The business vision is to provide high-quality, verifiable research compounds with a focus on legal compliance and user experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features an Apple-inspired design with a dark charcoal background (`#1a1a1f`) and neon yellow (`#E7FB10`) and cyan (`#21d8ff`) accents. Visual effects include glowing borders, neon shadows, animated pulse effects, and scale-up hover effects. Typography uses DM Sans for body text and Bebas Neue for display. Legal compliance elements, such as FDA disclaimers and "Research Use Only" (RUO) warning boxes, are prominently displayed with distinct color borders and a subtle red pulsing animation (`animate-pulse-subtle`).

### Technical Implementations
- **Frontend**: React 18+ with TypeScript, Vite, Wouter for routing, Framer Motion for animations. UI components use Radix UI primitives and shadcn/ui with Tailwind CSS. State management is handled by TanStack Query, React Hook Form with Zod for validation, and a custom cart context. Theming supports dark mode only.
- **Backend**: Express.js with TypeScript for a RESTful API. API endpoints are prefixed with `/api` and feature Zod schema validation.
- **Data Layer**: PostgreSQL database (via Neon serverless driver) with Drizzle ORM for type-safe queries. The schema includes tables for users, products, COAs, orders, contacts, affiliates, and affiliate applications/sales/payouts, and `price_history`.
- **Object Storage**: Replit Object Storage (Google Cloud Storage) for file uploads using presigned URLs.
- **Payment Integration**: PayPal for payments with both one-time purchases and recurring subscriptions. Uses PayPal REST API for order creation, capture, and subscription management. Files: `server/paypal.ts`, `client/src/components/PayPalCheckout.tsx`, `client/src/components/SubscriptionCheckout.tsx`. Required secrets: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`.
- **Notification System**: Unified email and SMS notifications via Amazon SES (SMTP) and Amazon SNS. Order confirmations sent to customers; admin alerts sent to configured admin email/phone. Files: `server/email.ts`, `server/sms.ts`, `server/notifications.ts`. Required env vars: `SES_SMTP_HOST`, `SES_SMTP_USERNAME`, `SES_SMTP_PASSWORD`, `SES_FROM_EMAIL`, `ADMIN_EMAIL`, optionally `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `ADMIN_PHONE` for SMS.

### Feature Specifications
- **Product Navigation**: Tiered navigation with sections for Peptides, Bulk Packs, Supplies (coming soon), and Wholesale Program.
- **3D Model Viewer**: Interactive 3D product visualization on detail pages using Google's model-viewer web component, with AR capability and a `model_3d_url` database column.
- **Age Verification**: A 21+ age gate on first visit, storing status in localStorage.
- **Authentication-Protected Pages**: Research Stacks, Bulk Packs, and Research Academy require user authentication. Unauthenticated visitors see an AuthGate component prompting account creation with benefits list and RUO disclaimer. Protected routes: `/research-stacks`, `/bulk-packs`, `/academy`, and related detail pages. Note: Product pages (`/peptides`, `/products`) are publicly accessible without login.
- **Checkout RUO Reminder**: A compact, non-dismissible popup on the checkout page requiring acknowledgment of "Research Use Only" terms and 21+ age confirmation via two checkboxes.
- **Shipping**: Free shipping on orders over $200, otherwise a flat $20. Shipping typically takes 2 business days. Offers 24-hour standard and same-day shipping.
- **No Refunds Policy**: Clearly stated.
- **Affiliate Program**: Two-tier commission structure (10% direct + 10% customer discount, 10% team override) with a 20% total cap, 30-day cookie window, $100 minimum payout, and monthly payouts. Includes application, tracking, dashboard, and non-MLM disclaimer.
- **Product Bundles**: Curated "Research Stacks" offering discounted peptide combinations.
- **Sale of the Week**: Prominently displayed promotions with a "HOT DEAL" badge and countdown.
- **AI Chatbot**: Floating chat button powered by OpenAI (gpt-4o-mini) for customer support with product context.
- **AI Dynamic Pricing**: Admin panel "Pricing" tab uses OpenAI (gpt-4o-mini) to suggest optimal product prices with confidence ratings, reasoning, and one-click apply functionality.
- **Subscription System**: PayPal-based recurring subscriptions with three frequency options - Weekly (15% off), Bi-weekly (12% off), and Monthly (10% off). Product detail pages have a subscription toggle with frequency selector. Checkout page uses `SubscriptionCheckout` component which creates PayPal plans and subscriptions. Success page at `/subscription/success` confirms activation. Webhook handler at `/api/paypal/webhook` processes subscription events (activated, cancelled, payment failed, etc.). Naming convention uses generic "Revive Research - Supplies" to avoid payment processor flags.
- **Legal Compliance**: Footer contains consolidated sections for FDA & Regulatory Compliance and Researcher Responsibility, with "Research Use Only" disclaimers across all pages.
- **Cart & Checkout UX**: Clickable cart items navigate to detail pages. Guest checkout supported with optional account creation encouragement.
- **Guest Checkout**: Purchases can be completed without an account. Guest checkout page shows "No account needed" confirmation with cyan accent, plus optional "Want to save your order?" section encouraging signup with benefits (order history, shipment tracking, faster checkouts, wishlist, rewards & discounts). Email and shipping info collected for order confirmation. Logged-in users see their account info with logout option.
- **Shop Page Pagination**: Products page displays 12 items per page with numbered pagination controls above and below the product grid. Products are sorted with in-stock items first, followed by "Coming Soon" items (out-of-stock). Out-of-stock products display a soft muted gray "Coming Soon" badge instead of harsh red styling, creating a more positive browsing experience while showing the full catalog.
- **Discount Code System**: Cart page input with validation for affiliate (Basic Referral 10%, Personal 20%) and promotional codes.
- **Price Transparency System**: Stock exchange-style pricing transparency showing price trends (green ↓ for decreases, red ↑ for increases, gray "Stable") with tooltips and 30-day minimum between changes.
- **Google Analytics Integration**: GA4 tracking with auto page views and custom event tracking.
- **Account Deletion Feature**: Users and affiliates can permanently delete their accounts from settings with confirmation.
- **Dosage-Specific Stock Management**: Admin Products tab manages inventory per dosage, with inline editor, quick actions, and derived product-level stock.
- **Test Order Indicators**: Orders created in PayPal sandbox mode are automatically marked with `isTest: true`. Admin dashboard shows orange "TEST" badge on test orders in order table and detail view. Filter button allows hiding/showing test orders with count display.
- **Admin Orders Management**: Simplified Orders tab with manual fulfillment workflow:
  - **4 KPI Cards**: Gross Revenue (paid only, yellow accent), Paid Orders (cyan accent), AOV, Email Issues (conditional red)
  - **Needs Attention Flag**: Computed per order when: (paid AND fulfillment ≠ delivered) OR emailStatus = failed OR isRefunded = true
  - **Visual Indicators**: Yellow left border + warning icon on orders needing attention, alert strip with count
  - **Filter System**: Quick filters for All, Needs Attention, Paid, Pending, Email Failed
  - **Order Table**: Order ID, Date, Customer, Amount, Payment/Fulfillment/Email status, inline fulfillment dropdown
  - **Order Types**: one_time or subscription (cyan "Sub" badge for subscriptions)
  - **View Order Dialog**: Fulfillment checklist (Payment Confirmed, Address Verified, Order Packed), notes field, email retry (only if failed), refund display
  - **Fulfillment Status Flow**: pending → preparing → ready → delivered (fully manual, no shipping automation)
  - **Email Status Tracking**: pending → sent → failed with retry capability
  - **Refund Tracking**: Minimal - isRefunded boolean, optional refundAmount/refundReason, no workflows
- **Admin Contacts Management**: Unified inbox consolidating Contact Us and Wholesale form submissions:
  - **Type System**: Contact type field ("contact" | "wholesale") with visual badges
  - **Status Workflow**: New → Responded → Archived (replaces old isRead boolean)
  - **Filter Buttons**: All / Contact / Wholesale / New quick filters
  - **Detail Panel**: Full message view with status dropdown, internal notes field
  - **Wholesale Info**: Phone number and order volume displayed for wholesale inquiries
  - **Dashboard Integration**: "New" count updates on dashboard when status changes
  - **State Management**: Mutations update selectedContact and clear selection when no longer matching filter
- **Trust & Transparency Features**: Includes an Education Center (onboarding course, article library), Quality Process Page (interactive 6-step visualization), Package Warm Guide, Batch Archive, Ethical Pricing Page, Transparency Page, Lab Notes Blog, Buyer Checklist, Troubleshooting Guides, and Support Status Widget.
- **Peptide Academy**: Gamified learning experience at `/academy` featuring a 4-module curriculum (Orientation, Core Foundations, Research Skills, Lab Confidence) with 17 lessons. Features include:
  - **Persona-Based Personalization**: Three personas (Beginner, Intermediate, Advanced) with distinct unlock modes:
    - Beginner: Linear progression (must complete lessons in order)
    - Intermediate: Module-level access (any lesson within unlocked modules)
    - Advanced: Full access (all lessons unlocked immediately)
  - **Personalized Dashboard**: Custom welcome messages, learning mode indicators (Guided/Standard/Quick Review), and persona-specific recommended lessons
  - **Reward Milestones**: XP-based milestones at 100 XP (First Badge), 250 XP (Complete Badge), 400 XP (Discount Code), 600 XP (Certificate)
  - **Change Persona**: Users can change their learning persona at any time via the settings button
  - XP points system, achievement badges (First Lesson, Orientation Complete, etc.), progress rings, and localStorage + database sync for progress tracking
  - Uses glassmorphism hero design with neon accents
- **Visual Infographic Components**: `client/src/components/infographics/` contains `AnimatedTrustStats`, `VerificationJourney`, `ProcessPipeline`, and `LearningRoadmap` for visual storytelling.
- **Education Article Visuals**: `client/src/components/education/` contains interactive diagrams like `COAAnatomyDiagram`, `HPLCExplainer`, `StorageTemperatureGuide`, `TelomereVisual`, `GLP1ReceptorComparison`, and `GHAxisDiagram` to enhance educational content.
- **Research Phase & Title System**: Tracks user progression through research phases (Observer → Initiate → Researcher → Analyst → Specialist) based on activity thresholds (education views, batch verifications, compounds tracked). Titles awarded for specific behaviors (Getting Started, Safety-First, COA Confident, Compound Tracker, Stack Builder, Verification Regular, Early Access Member). Database stores `researchPhase`, `researchTitles`, and activity counts in user table.
- **Tabbed Dashboard Interface**: Dashboard at `/dashboard` uses a 3-tab structure (General, Orders, Settings) with a navigation hub design:
  - **Immersive Atmosphere**: Ambient background gradients (5 colored glow orbs with blur-[100px-150px]) for a welcoming feel
  - **Time-Based Greeting**: Dynamic "Good morning/afternoon/evening" based on current hour
  - **General Tab (Navigation Hub)**: Quick Stats cards, Quick Navigation vertical stack (My Orders, Research Academy, Verify COA, Browse Products, Support), Achievements with animated icons (pulse/glow effects), Member Perks card (4 dynamic perks: Free Shipping $200+, Early Access for founder members, Priority Support 3+ orders, Affiliate Earnings), Research Quiz CTA (coming soon), Affiliate Program CTA
  - **Orders Tab**: Subscriptions, Order History with detailed order cards, Wishlist section (moved from General), Product Reviews, quick links to Academy and COA verification
  - **Settings Tab**: Profile information, Security settings, Account deletion

## External Dependencies

- **Database**: Neon Database (PostgreSQL)
- **Payment Gateway**: PayPal (one-time and subscription payments)
- **AI Chatbot**: OpenAI (gpt-4o-mini) via Replit AI Integrations
- **CDN**: Google Fonts (DM Sans, Bebas Neue)
- **UI Libraries**: Radix UI, shadcn/ui, cmdk, embla-carousel-react, lucide-react
- **Form & Validation**: react-hook-form, @hookform/resolvers, zod, drizzle-zod
- **Utilities**: date-fns, clsx, tailwind-merge, class-variance-authority, nanoid