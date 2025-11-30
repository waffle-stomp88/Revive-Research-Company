# Revive Research - E-commerce Platform for Premium Peptide Research Compounds

## Overview
Revive Research is an e-commerce platform specializing in premium peptide research compounds. It features a sleek, Apple-inspired design and is built on a full-stack TypeScript architecture with React and Express. The platform emphasizes scientific credibility through third-party lab verification and Certificate of Authenticity (COA) for all products, targeting researchers and professionals. Key capabilities include age verification, tiered affiliate programs, product bundling ("Research Stacks"), and an AI chatbot for customer support. The business vision is to provide high-quality, verifiable research compounds with a focus on legal compliance and user experience.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features an Apple-inspired design with a dark charcoal background (`#1a1a1f`), neon yellow (`#E7FB10`) and cyan (`#21d8ff`) accents. Visual effects include glowing borders on product cards, neon shadows using `shadow-glow-*` utilities, animated pulse effects, and scale-up hover effects. Typography uses DM Sans for body text and Bebas Neue for display, maintaining a professional and research-focused tone. Legal compliance elements, such as FDA disclaimers and researcher responsibilities, are prominently displayed with distinct color borders.

### Technical Implementations
- **Frontend**: React 18+ with TypeScript, Vite, Wouter for routing, Framer Motion for animations. UI components leverage Radix UI primitives and shadcn/ui with Tailwind CSS. State management is handled by TanStack Query, React Hook Form with Zod for validation, and a custom cart context. Theming supports light/dark modes and persists via localStorage.
- **Backend**: Express.js with TypeScript for a RESTful API, Node's native `http` module. API endpoints are prefixed with `/api` and feature Zod schema validation. Static files are served from `dist/public`, with Vite handling client bundle generation.
- **Data Layer**: PostgreSQL database (via Neon serverless driver) with Drizzle ORM for type-safe queries and migrations. The schema includes tables for users, products, COAs, orders, contacts, affiliates, and affiliate applications/sales/payouts.
- **Object Storage**: Replit Object Storage (Google Cloud Storage) is used for file uploads, utilizing presigned URLs and access control policies (ACL).
- **Payment Integration**: Stripe Checkout handles secure payment processing, including hosted sessions and webhook handling for order creation upon successful payment.

### Feature Specifications
- **Age Verification**: A 21+ age gate appears on the first visit, storing verification status in localStorage for legal compliance.
- **Shipping**: Free shipping on orders over $175, otherwise a flat $20. Features 24-hour standard shipping and same-day shipping before 12:00 CT.
- **No Refunds Policy**: Clearly stated due to the nature of research compounds.
- **Affiliate Program**: Two-tier commission structure (10% direct + 10% customer discount, 10% team override) with 20% total cap per order, 30-day cookie window, $100 minimum payout, and monthly payouts. Affiliates receive a private 20% personal-use discount code. Includes an application form, referral tracking, affiliate dashboard, and Non-MLM disclaimer. Not an MLM - commission stops at one level with no ranks, forced purchases, or recruitment requirements.
- **Product Bundles**: Curated "Research Stacks" offer discounted combinations of peptides.
- **Sale of the Week**: Prominently displayed promotions with a "HOT DEAL" badge and countdown.
- **AI Chatbot**: A floating chat button powered by OpenAI (gpt-4o-mini) provides customer support with product context and enforces platform policies.
- **Subscription System**: Offers weekly (15% off), bi-weekly (12% off), and monthly (10% off) subscription options.
- **Legal Compliance**: Footer contains consolidated sections for FDA & Regulatory Compliance and Researcher Responsibility, with "Research Use Only" disclaimers across all pages.
- **Cart & Checkout UX**: Cart items (both products and bundles) are clickable and navigate back to their detail pages. Checkout page shows an account section with login option for unauthenticated users, displaying benefits like order tracking and verified reviews.
- **Discount Code System**: Cart page includes discount code input with validation API supporting affiliate codes (Basic Referral 10%, Personal 20%) and promotional codes.

### Phase 2 Trust & Transparency Features
- **Education Center**: Comprehensive 5-part researcher onboarding course (Research Use Only, Reading COAs, Batch Numbers, Storage 101, Ordering Expectations) with full article library covering peptide profiles, research basics, storage, safety, and terminology.
- **Quality Process Page**: Interactive 6-step visualization (Synthesis → Lyophilization → QC → Testing → Packaging → Fulfillment) showing production transparency.
- **Package Warm Guide**: Diagnostic tool explaining why cold packs melt, lyophilization stability, and when to contact support.
- **Batch Archive**: Historical record of all batches including active and retired/archived batches with COA links.
- **Ethical Pricing Page**: Transparent breakdown of pricing factors (synthesis complexity, third-party testing, purity, stability).
- **Transparency Page**: Company story, core values, and detailed "What We Do/Don't Do" commitments.
- **Lab Notes Blog**: Technical micro-posts on endotoxin testing, lyophilization, purity percentages, color variation, cross-contamination prevention.
- **Buyer Checklist**: Vendor evaluation checklist positioning brand as ethical leader with testing, product info, and business practice criteria.
- **Troubleshooting Guides**: Expandable "What To Do If..." guides for warm packages, clumpy vials, flat powder, smudged labels, moisture, and broken COA links.
- **Support Status Widget**: Real-time support availability indicator (2-4 hour response) displayed in footer.

## External Dependencies

- **Database**: Neon Database (PostgreSQL)
- **Payment Gateway**: Stripe
- **AI Chatbot**: OpenAI (gpt-4o-mini) via Replit AI Integrations
- **CDN**: Google Fonts (DM Sans, Bebas Neue)
- **UI Libraries**: Radix UI, shadcn/ui, cmdk, embla-carousel-react, lucide-react
- **Form & Validation**: react-hook-form, @hookform/resolvers, zod, drizzle-zod
- **Utilities**: date-fns, clsx, tailwind-merge, class-variance-authority, nanoid
- **Development Tools**: tsx, TypeScript, PostCSS (Tailwind, Autoprefixer)