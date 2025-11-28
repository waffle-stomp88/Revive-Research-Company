# Revive Research - E-commerce Platform for Premium Peptide Research Compounds

## Overview

Revive Research is a modern e-commerce platform specializing in premium peptide research compounds. The application combines scientific credibility with a sleek, Apple-inspired design aesthetic, built on a full-stack TypeScript architecture with React frontend and Express backend.

The platform emphasizes transparency through third-party lab verification, providing Certificate of Authenticity (COA) verification for all products. It targets researchers and professionals seeking high-quality peptide compounds with verifiable testing results.

## Current State: Coming Soon Mode

The site is currently showing a "Coming Soon" landing page. The full e-commerce site is saved and can be restored.

### To Restore Full Site:
1. Replace `client/src/App.tsx` with the contents of `client/src/App.full.tsx`
2. Restart the application

### Coming Soon Page Features:
- Animated particle background with floating neon orbs
- DNA helix animation
- Pulsing ring effects
- Email signup form with success animation
- Same neon yellow (#E7FB10) and cyan (#21d8ff) color scheme
- Framer Motion animations throughout

## User Preferences

Preferred communication style: Simple, everyday language.

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
8. **Retatrutide** - $249.99 (was $299.99) - Triple receptor agonist
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

**Coming Soon**
- `client/src/pages/coming-soon.tsx` - Current landing page
- `client/src/App.tsx` - Shows coming soon page only
- `client/src/App.full.tsx` - BACKUP of full site App.tsx

**Full Site Pages**
- `client/src/pages/home.tsx` - Main landing page
- `client/src/pages/products.tsx` - Product catalog with search/filter
- `client/src/pages/product-detail.tsx` - Individual product pages
- `client/src/pages/checkout.tsx` - Stripe checkout integration
- `client/src/pages/checkout-success.tsx` - Order confirmation
- `client/src/pages/coa.tsx` - COA verification
- `client/src/pages/dashboard.tsx` - Customer dashboard
- `client/src/pages/admin.tsx` - Admin panel
- `client/src/pages/affiliate.tsx` - Affiliate program

**Components**
- `client/src/components/navigation.tsx` - Header navigation
- `client/src/components/footer.tsx` - Legal compliance footer

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
