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
- **Payment Integration**: Stripe Checkout for secure payment processing, including hosted sessions and webhook handling.

### Feature Specifications
- **Product Navigation**: Tiered navigation with sections for Peptides, Bulk Packs, Supplies (coming soon), and Wholesale Program.
- **3D Model Viewer**: Interactive 3D product visualization on detail pages using Google's model-viewer web component, with AR capability and a `model_3d_url` database column.
- **Age Verification**: A 21+ age gate on first visit, storing status in localStorage.
- **Checkout RUO Reminder**: A compact, non-dismissible popup on the checkout page requiring acknowledgment of "Research Use Only" terms and 21+ age confirmation via two checkboxes.
- **Shipping**: Free shipping on orders over $175, otherwise a flat $20. Offers 24-hour standard and same-day shipping.
- **No Refunds Policy**: Clearly stated.
- **Affiliate Program**: Two-tier commission structure (10% direct + 10% customer discount, 10% team override) with a 20% total cap, 30-day cookie window, $100 minimum payout, and monthly payouts. Includes application, tracking, dashboard, and non-MLM disclaimer.
- **Product Bundles**: Curated "Research Stacks" offering discounted peptide combinations.
- **Sale of the Week**: Prominently displayed promotions with a "HOT DEAL" badge and countdown.
- **AI Chatbot**: Floating chat button powered by OpenAI (gpt-4o-mini) for customer support with product context.
- **AI Dynamic Pricing**: Admin panel "Pricing" tab uses OpenAI (gpt-4o-mini) to suggest optimal product prices with confidence ratings, reasoning, and one-click apply functionality.
- **Subscription System**: Weekly (15% off), bi-weekly (12% off), and monthly (10% off) subscription options.
- **Legal Compliance**: Footer contains consolidated sections for FDA & Regulatory Compliance and Researcher Responsibility, with "Research Use Only" disclaimers across all pages.
- **Cart & Checkout UX**: Clickable cart items navigate to detail pages. Checkout shows login option for unauthenticated users.
- **Discount Code System**: Cart page input with validation for affiliate (Basic Referral 10%, Personal 20%) and promotional codes.
- **Price Transparency System**: Stock exchange-style pricing transparency showing price trends (green ↓ for decreases, red ↑ for increases, gray "Stable") with tooltips and 30-day minimum between changes.
- **Google Analytics Integration**: GA4 tracking with auto page views and custom event tracking.
- **Account Deletion Feature**: Users and affiliates can permanently delete their accounts from settings with confirmation.
- **Dosage-Specific Stock Management**: Admin Products tab manages inventory per dosage, with inline editor, quick actions, and derived product-level stock.
- **Trust & Transparency Features**: Includes an Education Center (onboarding course, article library), Quality Process Page (interactive 6-step visualization), Package Warm Guide, Batch Archive, Ethical Pricing Page, Transparency Page, Lab Notes Blog, Buyer Checklist, Troubleshooting Guides, and Support Status Widget.
- **Peptide Academy**: Gamified learning experience at `/academy` featuring a 4-module curriculum (Orientation, Core Foundations, Research Skills, Lab Confidence) with 17 lessons. Features include persona quiz for personalized learning paths, XP points system, achievement badges (First Lesson, Orientation Complete, etc.), progress rings, and localStorage + database sync for progress tracking. Uses glassmorphism hero design with neon accents.
- **Visual Infographic Components**: `client/src/components/infographics/` contains `AnimatedTrustStats`, `VerificationJourney`, `ProcessPipeline`, and `LearningRoadmap` for visual storytelling.
- **Education Article Visuals**: `client/src/components/education/` contains interactive diagrams like `COAAnatomyDiagram`, `HPLCExplainer`, `StorageTemperatureGuide`, `TelomereVisual`, `GLP1ReceptorComparison`, and `GHAxisDiagram` to enhance educational content.

## External Dependencies

- **Database**: Neon Database (PostgreSQL)
- **Payment Gateway**: Stripe
- **AI Chatbot**: OpenAI (gpt-4o-mini) via Replit AI Integrations
- **CDN**: Google Fonts (DM Sans, Bebas Neue)
- **UI Libraries**: Radix UI, shadcn/ui, cmdk, embla-carousel-react, lucide-react
- **Form & Validation**: react-hook-form, @hookform/resolvers, zod, drizzle-zod
- **Utilities**: date-fns, clsx, tailwind-merge, class-variance-authority, nanoid