# Revive Research - E-commerce Platform for Premium Peptide Research Compounds

## Overview
Revive Research is an e-commerce platform specializing in premium peptide research compounds, featuring an Apple-inspired design and a full-stack TypeScript architecture. The platform emphasizes scientific credibility through third-party lab verification and Certificates of Analysis (COA). It targets researchers and professionals, offering features like age verification, tiered affiliate programs, product bundling ("Research Stacks"), an AI chatbot, and a subscription system. The core vision is to provide high-quality, verifiable research compounds with a focus on legal compliance, user experience, and a gamified educational experience through the "Peptide Academy." The project aims to capture market share by offering premium products and a transparent, educational approach.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform utilizes an Apple-inspired aesthetic with a dark charcoal background (`#1a1a1f`) complemented by neon yellow (`#E7FB10`) and cyan (`#21d8ff`) accents. Visual elements include glowing borders, neon shadows, animated pulse effects, and scale-up hover effects. DM Sans is used for body text and Bebas Neue for display. Legal compliance is visually reinforced with prominent FDA disclaimers and "Research Use Only" (RUO) warning boxes, featuring distinct color borders and subtle animations. Dashboards incorporate ambient background gradients and time-based greetings for an immersive experience.

### Technical Implementations
The platform is built with a full-stack TypeScript architecture.
- **Frontend**: React 18+ with Vite, Wouter for routing, and Framer Motion for animations. UI components are developed using Radix UI primitives and shadcn/ui with Tailwind CSS. State management is handled by TanStack Query, and forms utilize React Hook Form with Zod for validation. A custom cart context manages shopping cart state. Theming is dark mode only.
- **Backend**: Express.js powers a RESTful API, with Zod ensuring schema validation.
- **Data Layer**: PostgreSQL database (Neon serverless driver) integrated with Drizzle ORM for type-safe queries. The schema supports users, products, COAs, orders, contacts, affiliates, price history, and subscriptions.
- **Object Storage**: Replit Object Storage (Google Cloud Storage) is used for file uploads via presigned URLs.
- **Payment Integration**: PayPal facilitates both one-time purchases and recurring subscriptions, leveraging the PayPal REST API for order and subscription management.
- **Notification System**: A unified system for email and SMS notifications is implemented using Amazon SES (SMTP) and Amazon SNS.

### Feature Specifications
- **Product & Compliance**: Features tiered product navigation, interactive 3D model viewers (with AR), "Research Stacks" (bundles), and "Sale of the Week." GLP-1 related products have strict naming restrictions, avoiding compound names in public-facing text, meta titles, descriptions, and URLs. The platform includes a 21+ age verification gate, authentication-protected pages, and non-dismissible RUO reminders. Free shipping is offered on orders over $200, with a flat rate otherwise, and a no-refunds policy.
- **Affiliate Program**: A two-tier commission structure (10% direct + 10% customer discount, 10% team override) with a 30-day cookie window, $100 minimum payout, and monthly payouts.
- **AI Integration**: An AI Chatbot (OpenAI gpt-4o-mini) provides customer support. Admin tools include AI Dynamic Pricing for optimal price suggestions and AI Synergy Analysis for custom stack building, providing research-focused pathway mechanism descriptions.
- **Dynamic Stack/Bundle Pricing**: Prices for stacks and bundles are dynamically computed from the database, applying a 10% discount on component sums.
- **Custom Stack Builder**: Users can create custom research bundles of 2-4 peptides with a 10% discount, featuring real-time synergy visualization (Synergy Ring, Known Stack Detection with UI badges, Smart Recommendations), Body System Heatmap, Shared Pathway Detection, and save/share functionality.
- **Subscription System**: PayPal-based recurring subscriptions with weekly, bi-weekly, and monthly options and tiered discounts.
- **User Experience**: Includes guest checkout, paginated shop pages with in-stock priority, discount codes, and a price transparency system.
- **Pre-Launch Waitlist**: A waitlist system with "Founding Members" incentives and exit-intent/OOS product page captures.
- **Analytics**: Google Analytics GA4 integration for tracking.
- **Account Management**: User and affiliate account deletion.
- **Admin Dashboard**: Consolidated dashboard for orders, customers, contacts, affiliates, COAs, products (with inventory and AI pricing), communications (stock notifications, email logs), and settings (discount codes).
- **Shipping & Tracking**: Admin can manage tracking numbers and carriers, triggering automated "Order Shipped" emails with tracking links. Customer dashboards display tracking information.
- **Trust & Transparency**: An Education Center, Quality Process Page, Lab Notes Blog, and various transparency-focused pages to build user trust.
- **SEO & Content**: Structured SEO entry articles under `/guides/` for search traffic capture, individual peptide articles, and a consistent, keyword-rich URL structure for all content pages. 301 redirects are configured for old URLs.
- **Peptide Academy**: A gamified learning platform at `/academy` with modules, lessons, persona-based personalization, XP-based rewards, achievement badges, and progress tracking.
- **Research Phase System**: Tracks user progression and awards titles based on activity thresholds.
- **Dashboard Interface**: Tabbed interface (`/dashboard`) with sections for General, Orders (subscriptions, history, wishlist), and Settings.

## External Dependencies

- **Database**: Neon Database (PostgreSQL)
- **Payment Gateway**: PayPal
- **AI Services**: OpenAI (gpt-4o-mini) via Replit AI Integrations
- **Cloud Storage**: Replit Object Storage (Google Cloud Storage)
- **Email/SMS**: Amazon SES, Amazon SNS
- **CDN**: Google Fonts (DM Sans, Bebas Neue)
- **UI Libraries**: Radix UI, shadcn/ui, cmdk, embla-carousel-react, lucide-react
- **Form & Validation**: react-hook-form, @hookform/resolvers, zod, drizzle-zod