# Revive Research - E-commerce Platform for Premium Peptide Research Compounds

## Overview

Revive Research is a modern e-commerce platform specializing in premium peptide research compounds. The application combines scientific credibility with a sleek, Apple-inspired design aesthetic, built on a full-stack TypeScript architecture with React frontend and Express backend.

The platform emphasizes transparency through third-party lab verification, providing Certificate of Authenticity (COA) verification for all products. It targets researchers and professionals seeking high-quality peptide compounds with verifiable testing results.

## Current State: Full E-commerce Site

The full e-commerce site is now active with all features including:
- Age verification modal (21+ requirement)
- Free shipping banner ($150 threshold)
- Sale of the Week promotions
- Research Stack bundles
- Comprehensive legal compliance pages

## User Preferences

Preferred communication style: Simple, everyday language.

## Key Features

### Age Verification
- Modal appears on first visit requiring age confirmation (21+)
- Required for legal compliance before accessing the site
- Stores verification status in localStorage

### Free Shipping Banner
- Displays at top of site
- Free shipping on orders over $150
- Flat rate $15 shipping under $150

### Shipping Policy
- **24hr standard shipping** on all orders
- **Same-day shipping** if ordered before 12:00 CT on business days
- Flat rate: $15 (free over $150)

### NO REFUNDS Policy
- Due to the nature of research compounds, all sales are final
- Prominently displayed on FAQ page

### Affiliate Program
- Exclusivity-focused messaging ("We Don't Need Partners. We Choose Them.")
- Selective partner program, not desperate for affiliates
- 20% commission rate
- 30-day cookie window
- $100 minimum payout
- Application form with qualification questions

### Product Bundles (Research Stacks)
1. **The Wolverine Stack** - BPC-157 + TB-500 ($89.99, saves 15%)
2. **Longevity Stack** - Epithalon + GHK-Cu + NAD+ ($189.99, saves 14%)
3. **Performance Stack** - CJC-1295 + Ipamorelin ($199.99, saves 15%)
4. **Complete Healing Protocol** - BPC-157 + TB-500 + GHK-Cu ($119.99, saves 17%)

### Sale of the Week
- Featured prominently on products page
- Currently: Retatrutide at 17% off
- HOT DEAL badge with countdown

## Design System

### Color Palette
- **Primary Background**: #1a1a1f (dark charcoal)
- **Neon Yellow (Primary Accent)**: #E7FB10
- **Neon Cyan (Secondary Accent)**: #21d8ff
- **Card Background**: Dark elevated surfaces with subtle gradients
- **Text**: White primary, gray-400/500 for secondary

### Visual Effects
- Glowing borders on product cards (cyan for in-stock, red for out-of-stock)
- Neon shadows using `shadow-glow-*` utilities
- Animated pulse effects on icons and badges
- Scale-up hover effect on product cards (hover:scale-105)

### Typography
- Font family: DM Sans (body), Bebas Neue (display)
- Bold headlines with tight tracking
- Research-focused, professional tone

## Product Catalog (16 Products)

All products use research-specific benefits (not generic quality statements):

1. **BPC-157** - $49.99 (was $59.99) - Tissue repair, gastric research
2. **TB-500** - $54.99 (was $64.99) - Thymosin Beta-4, cell migration
3. **GHK-Cu** - $39.99 - Copper peptide, collagen synthesis
4. **Epithalon** - $44.99 (was $54.99) - Telomerase activation
5. **Ipamorelin** - $59.99 - Selective GH secretagogue
6. **Semax** - $64.99 (was $74.99) - ACTH neuroresearch (Out of Stock)
7. **Tesamorelin** - $189.99 (was $219.99) - GHRH analog
8. **Retatrutide** - $249.99 (was $299.99) - Triple receptor agonist (SALE OF THE WEEK)
9. **Tirzepatide** - $224.99 (was $274.99) - Dual GIP/GLP-1
10. **Semaglutide** - $199.99 (was $249.99) - Long-acting GLP-1
11. **GLOW Peptide Complex** - $159.99 (was $189.99) - Multi-peptide blend
12. **NAD+ Precursor** - $134.99 (was $164.99) - Cellular energy
13. **CJC-1295** - $174.99 (was $209.99) - GHRH with DAC
14. **MOTS-c** - $89.99 (was $109.99) - Mitochondrial peptide
15. **IGF-1 LR3** - $149.99 (was $179.99) - Extended IGF-1
16. **HCG** - $79.99 - Gonadotropin signaling

### Product Badges
- **SALE!** badge (red, top-left) for products with originalPrice
- **Featured** badge (cyan, top-right) for featured products
- **Out of Stock** badge (red, bottom-left) for unavailable products

## Subscription System

Three subscription intervals with discounts:
- Weekly: 15% off
- Bi-weekly: 12% off
- Monthly: 10% off

## Legal Compliance

Footer contains two consolidated compliance sections:
1. **FDA & Regulatory Compliance** (red border) - 503A/503B notices, FDA disclaimers
2. **Researcher Responsibility** (yellow border) - Educational use, user responsibility

All pages display "Research Use Only" messaging with comprehensive disclaimers.

### Legal Pages
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy
- `/faq` - Frequently Asked Questions (includes NO REFUNDS policy)
- `/shipping` - Shipping Details (24hr standard, same-day before 12:00 CT)

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (alternative to React Router)
- Framer Motion for animations and page transitions

**UI Component System**
- Radix UI primitives for accessible, unstyled components (@radix-ui/*)
- shadcn/ui component architecture using the "new-york" style variant
- Tailwind CSS for utility-first styling with custom design tokens
- Typography system using DM Sans (body) and Bebas Neue (headlines)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management, caching, and API requests
- Custom query client with automatic error handling and credential inclusion
- React Hook Form with Zod validation for form state and validation
- Cart context for shopping cart state management

**Theming**
- Custom theme provider supporting light/dark modes with system preference detection
- CSS custom properties for dynamic color theming
- Theme persistence via localStorage

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for RESTful API
- HTTP server creation using Node's native `http` module
- Custom middleware for JSON parsing with raw body preservation (for webhook verification)
- Request logging middleware with timestamp formatting

**API Design**
- RESTful endpoints under `/api` prefix:
  - `GET /api/products` - Retrieve all products
  - `GET /api/products/:id` - Get single product details
  - `GET /api/coa/:batchNumber` - Verify Certificate of Authenticity
  - `POST /api/orders` - Create new orders
  - `POST /api/contact` - Submit contact inquiries
  - `POST /api/affiliate-apply` - Submit affiliate application
  - `GET /api/stripe/config` - Get Stripe publishable key
  - `POST /api/stripe/create-checkout-session` - Create Stripe checkout session
  - `GET /api/stripe/checkout-session/:sessionId` - Verify payment and create order
  - Admin routes under `/api/admin/*` for product, COA, order, and contact management
- Zod schema validation for request payloads

**Static File Serving**
- Vite-built production assets served from `dist/public`
- SPA fallback routing to `index.html` for client-side navigation
- Development mode uses Vite's middleware mode with HMR over `/vite-hmr` path

**Build Process**
- Custom build script using esbuild for server bundling
- Selective dependency bundling (allowlist) to reduce cold start times
- Vite handles client bundle generation
- Output to `dist/` directory with separate public assets folder

### Data Layer

**Database**
- PostgreSQL as the primary database (via Neon serverless driver `@neondatabase/serverless`)
- Drizzle ORM for type-safe database queries and migrations
- Schema definition in `shared/schema.ts` for code sharing between client/server

**Schema Design**
- **users**: Authentication with username/password (UUID primary keys)
- **products**: Peptide compounds with pricing, descriptions, categories, stock status, and featured flags
- **coas**: Certificate of Authenticity records linked to products by batch number
- **orders**: Customer orders with shipping details and order items
- **contacts**: Contact form submissions

**Migrations**
- Drizzle Kit for schema migrations in `migrations/` directory
- `npm run db:push` script for pushing schema changes

### Payment Integration

**Stripe Checkout**
- Stripe SDK for payment processing (via `stripe` and `stripe-replit-sync` packages)
- Hosted checkout sessions for secure payment collection
- Webhook handling for payment confirmation
- Order creation on successful payment

**Payment Flow**
1. Customer selects product → Creates Stripe Checkout Session
2. Customer redirected to Stripe's hosted checkout
3. On success, redirected to `/checkout/success?session_id=...`
4. Backend verifies session and creates order with payment details

**Files**
- `server/stripeClient.ts` - Stripe client initialization and credentials
- `server/webhookHandlers.ts` - Stripe webhook processing
- `client/src/pages/checkout.tsx` - Checkout page with Stripe redirect
- `client/src/pages/checkout-success.tsx` - Order confirmation page

### Key Files

**Pages**
- `client/src/pages/home.tsx` - Main landing page (24hr shipping in trust metrics)
- `client/src/pages/products.tsx` - Product catalog with Sale of the Week & Research Stacks
- `client/src/pages/product-detail.tsx` - Individual product pages
- `client/src/pages/checkout.tsx` - Stripe checkout integration
- `client/src/pages/checkout-success.tsx` - Order confirmation
- `client/src/pages/cart.tsx` - Shopping cart page
- `client/src/pages/coa.tsx` - COA verification
- `client/src/pages/dashboard.tsx` - Customer dashboard
- `client/src/pages/admin.tsx` - Admin panel
- `client/src/pages/affiliate.tsx` - Affiliate program (exclusivity-focused)
- `client/src/pages/faq.tsx` - FAQ with NO REFUNDS policy
- `client/src/pages/shipping.tsx` - Shipping details
- `client/src/pages/terms-of-service.tsx` - Terms of Service
- `client/src/pages/privacy-policy.tsx` - Privacy Policy

**Components**
- `client/src/components/navigation.tsx` - Header navigation
- `client/src/components/footer.tsx` - Legal compliance footer
- `client/src/components/age-verification-modal.tsx` - 21+ age gate
- `client/src/components/free-shipping-banner.tsx` - Free shipping banner

**Assets**
- `attached_assets/reta bottle_1764310671562.jpg` - Product placeholder image

### External Dependencies

**Third-Party Services**
- Neon Database: Serverless PostgreSQL hosting
- Stripe: Payment processing (sandbox/live modes)
- Google Fonts CDN: DM Sans and Bebas Neue typography
- Replit-specific integrations for development

**UI Component Libraries**
- Radix UI: 20+ primitive components for accessibility
- cmdk: Command palette component
- embla-carousel-react: Carousel/slider functionality
- lucide-react: Icon library

**Form & Validation**
- react-hook-form: Form state management
- @hookform/resolvers: Zod integration for validation
- zod: Runtime schema validation
- drizzle-zod: Generate Zod schemas from Drizzle tables

**Utilities**
- date-fns: Date manipulation and formatting
- clsx + tailwind-merge: Conditional className utilities (via cn helper)
- class-variance-authority: Component variant management
- nanoid: Unique ID generation

**Development Tools**
- tsx: TypeScript execution for development and build scripts
- TypeScript with strict mode and path aliases (@/, @shared/, @assets/)
- PostCSS with Tailwind and Autoprefixer
