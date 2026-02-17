# Revive Research - E-commerce Platform for Premium Peptide Research Compounds

## Overview
Revive Research is an e-commerce platform specializing in premium peptide research compounds, featuring an Apple-inspired design and a full-stack TypeScript architecture. It emphasizes scientific credibility through third-party lab verification and Certificates of Analysis (COA). The platform targets researchers and professionals, offering features like age verification, tiered affiliate programs, product bundling ("Research Stacks"), an AI chatbot, and a subscription system. The core vision is to provide high-quality, verifiable research compounds with a focus on legal compliance, user experience, and a gamified educational experience through the "Peptide Academy."

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
The platform features an Apple-inspired design with a dark charcoal background (`#1a1a1f`) and neon yellow (`#E7FB10`) and cyan (`#21d8ff`) accents. Visual effects include glowing borders, neon shadows, animated pulse effects, and scale-up hover effects. Typography uses DM Sans for body text and Bebas Neue for display. Legal compliance elements, such as FDA disclaimers and "Research Use Only" (RUO) warning boxes, are prominently displayed with distinct color borders and subtle animations. The dashboard uses ambient background gradients and a time-based greeting for an immersive atmosphere.

### Technical Implementations
- **Frontend**: React 18+ with TypeScript, Vite, Wouter for routing, Framer Motion for animations. UI components use Radix UI primitives and shadcn/ui with Tailwind CSS. State management is handled by TanStack Query, React Hook Form with Zod for validation, and a custom cart context. Theming supports dark mode only.
- **Backend**: Express.js with TypeScript for a RESTful API, utilizing Zod for schema validation.
- **Data Layer**: PostgreSQL database (via Neon serverless driver) with Drizzle ORM for type-safe queries. The schema includes tables for users, products, COAs, orders, contacts, affiliates, price history, and subscription-related data.
- **Object Storage**: Replit Object Storage (Google Cloud Storage) for file uploads using presigned URLs.
- **Payment Integration**: PayPal for both one-time purchases and recurring subscriptions, utilizing PayPal REST API for order creation, capture, and subscription management.
- **Notification System**: Unified email and SMS notifications via Amazon SES (SMTP) and Amazon SNS.

### Feature Specifications
- **Product Presentation**: Tiered navigation, interactive 3D model viewer with AR capability, "Research Stacks" (product bundles), and "Sale of the Week" promotions.
- **Compliance & Security**: 21+ age verification gate, authentication-protected pages (Research Stacks, Bulk Packs, Research Academy), and a non-dismissible RUO reminder on the checkout page. Prominent legal disclaimers and compliance pages.
- **Shipping & Returns**: Free shipping on orders over $200, flat rate otherwise. No refunds policy.
- **Affiliate Program**: Two-tier commission structure (10% direct + 10% customer discount, 10% team override), 30-day cookie window, $100 minimum payout, monthly payouts, with application and dashboard features.
- **AI Integration**: AI Chatbot (OpenAI gpt-4o-mini) for customer support with product context. AI Dynamic Pricing for admin product management, suggesting optimal prices with confidence ratings. AI Synergy Analysis for custom stack builder providing research-focused pathway mechanism descriptions.
- **Custom Stack Builder**: Located at `/research-stacks` under "Build Custom" tab with two-column layout (65% peptide selection grid left, 35% sticky build panel right). Users select 2-4 peptides for custom research bundles with flat 10% discount (pre-built stacks offer better 15-20% value). Features real-time synergy visualization with:
  - **Synergy Ring**: Animated circular progress meter (0-100%) showing synergy score based on peptide combinations
  - **Known Stack Detection**: Recognizes famous combinations with celebration UI badges:
    - Wolverine Stack: BPC-157+TB-500 (95% synergy)
    - Glow Protocol: BPC-157+TB-500+GHK-Cu (90%)
    - GH Amplifier: Ipamorelin+CJC-1295 (88%)
    - Cognitive Edge: Semax+Selank (86%)
    - Lean Mass Protocol: CJC-1295+Ipamorelin+MOTS-C (87%)
    - Deep Sleep Formula: Epithalon+Ipamorelin (83%)
    - Longevity Protocol: Epithalon+GHK-Cu (84%)
    - Total Regen: BPC-157+TB-500+Ipamorelin (92%)
    - Recovery+ Protocol: BPC-157+GHK-Cu+TB-500 (82%)
    - KLOW Stack: BPC-157+TB-500+GHK-Cu+KPV (94%) — 3-phase regeneration: inflammation control → tissue repair → collagen remodeling
    - GH Max: CJC-1295+Ipamorelin+Sermorelin (91%) — triple GHRH/GHRP stimulation
    - Gut Restore: BPC-157+KPV (88%) — gut lining repair + NF-κB inhibition
    - Longevity+: Epithalon+Thymalin (87%) — telomerase + thymic immune restoration
    - Neuro Stack: Semax+Cerebrolysin (86%) — BDNF + neurotrophic dual neuroprotection
    - Performance: IGF-1 LR3+BPC-157 (86%) — muscle growth factor + tissue repair
    - Immune Shield: Thymosin Alpha-1+LL-37 (85%) — adaptive + antimicrobial immune defense
    - Fat Burner: AOD-9604+5-Amino-1MQ (84%) — GH fragment + NNMT enzyme inhibitor
    - Skin Renewal: GHK-Cu+Snap-8 (83%) — collagen remodeling + expression line reduction
  - **Smart Recommendations**: Suggests peptides to complete known stacks ("Add TB-500 to unlock Wolverine Stack")
  - **Body System Heatmap**: Visual icons (Healing, Metabolic, Cognitive, Skin, Growth, Longevity) with hover tooltips explaining the biological mechanisms
  - **Shared Pathway Detection**: Shows common mechanisms between selected peptides with tooltips (Angiogenesis, Collagen Synthesis, mTOR Pathway, etc.)
  - **Save & Share System**: Authenticated users can save custom stacks with names, automatically generates shareable URLs, quick share button for copying links
  - **Popular Stacks**: Displays trending community combinations sorted by save count
- **Subscription System**: PayPal-based recurring subscriptions with weekly, bi-weekly, and monthly options, offering tiered discounts.
- **User Experience**: Guest checkout, shop page pagination with in-stock priority, discount code system, and a price transparency system showing price trends.
- **Pre-Launch Waitlist System**: Founding Members popup (first 50 signups get lifetime locked pricing, 48hr early access, Founding Member badge #1-50). Triggers 7s after age gate dismissal, 7-day cookie suppression. After 50 founding members, popup converts to regular waitlist capture. Exit Intent popup (desktop-only, 30s+ time on site) as secondary capture. OOS product pages also capture to waitlist with product interest tracking. Database: waitlist_signups table with founding_member_number column. API: POST /api/waitlist/signup, GET /api/waitlist/count (returns total, foundingMembers, spotsRemaining).
- **Analytics**: Google Analytics GA4 integration for tracking page views and custom events.
- **Account Management**: User and affiliate account deletion feature.
- **Admin Dashboard**: Consolidated dashboard with streamlined tabs for Overview, Orders, Customers, Contacts, Affiliates, COAs, Products (with Inventory and AI Pricing sub-tabs), Communications (with Stock Notifications and Email Logs sub-tabs), and Settings (with Discount Codes).
- **Shipping & Tracking**: Admin can enter tracking number and carrier (USPS/UPS/FedEx/DHL) in order detail panel. Saving tracking info auto-triggers branded "Your Order Has Shipped" email via Amazon SES with tracking link. Customer dashboard shows tracking info with "Track Package" button linking to carrier tracking URL. Status timeline reflects fulfillment progress (Confirmed → Processing → Shipped → Delivered). Orders table shows "Shipped" badge for orders with tracking.
    - **Orders Management**: Manual fulfillment workflow with KPI cards, "Needs Attention" flags, visual indicators, filtering, and detailed order view with fulfillment checklist, notes, and email retry. Supports one-time and subscription orders.
    - **Contacts Management**: Unified inbox for contact and wholesale submissions with type system, status workflow (New, Responded, Archived), filtering, and detail panel with internal notes.
- **Trust & Transparency**: Education Center, Quality Process Page, Package Warm Guide, Batch Archive, Ethical Pricing Page, Transparency Page, Lab Notes Blog, Buyer Checklist, Troubleshooting Guides, and Support Status Widget.
- **SEO Entry Articles**: Trust-funnel strategy with 6 educational articles under `/guides/` prefix designed to capture skeptical search traffic:
  - `/guides/are-peptide-coas-trustworthy` - Are Peptide COAs Trustworthy?
  - `/guides/how-batch-testing-works` - How Batch Testing Works
  - `/guides/what-research-use-only-means` - What "Research Use Only" Actually Means
  - `/guides/how-to-verify-peptide-quality` - How to Verify Peptide Quality
  - `/guides/peptide-purity-explained` - What Peptide Purity Percentages Mean
  - `/guides/why-cheap-peptides-are-cheap` - Why Cheap Peptides Are Cheap
  - Uses shared `EntryArticleLayout` component with JSON-LD schemas (Article + FAQ), SEO metadata, and confidence CTAs routing to proof pages.
  - 301 redirects configured for old URLs to preserve SEO authority.
- **Individual Peptide Article Pages**: 30 peptide research articles each have their own indexable URL at `/guides/what-is-[name]-peptide` pattern (e.g., `/guides/what-is-bpc-157-peptide`). Article slugs stored in database as `what-is-[name]-peptide` format. Exceptions: non-peptide compounds use `/guides/what-is-glutathione`, `/guides/what-is-vitamin-b12`, `/guides/what-is-nad-precursor`, and complex names use `/guides/what-is-glow-peptide-complex`.
- **SEO URL Structure**: All content pages use keyword-rich, descriptive URLs:
  - Education Center: `/guides/peptide-education-center`
  - Quality Process: `/guides/peptide-quality-assurance-process`
  - Transparency: `/about/our-transparency-commitment`
  - Standards: `/guides/peptide-vendor-ethics-standards`
  - Pricing: `/guides/peptide-pricing-breakdown`
  - Lab Notes: `/guides/peptide-lab-research-archive`
  - Troubleshooting: `/guides/peptide-handling-troubleshooting`
  - Package Warm: `/guides/peptide-package-arrived-warm`
  - Buyer Checklist: `/guides/peptide-vendor-checklist`
  - Dosage Calculator: `/tools/peptide-reconstitution-calculator`
  - COA Verification: `/coa/verify-certificate-of-analysis`
  - Batch Archive: `/coa/batch-testing-archive`
  - FAQ: `/peptide-research-faq`
  - Shipping: `/peptide-shipping-and-handling`
  - Resources: `/peptide-research-resources`
  - 301 redirects configured for all old URLs in App.tsx to preserve SEO authority.
- **Peptide Academy**: Gamified learning experience at `/academy` with a 4-module curriculum (17 lessons), persona-based personalization (Beginner, Intermediate, Advanced), personalized dashboard, XP-based reward milestones, achievement badges, and progress tracking.
- **Research Phase & Title System**: Tracks user progression through research phases (Observer → Initiate → Researcher → Analyst → Specialist) and awards titles based on activity thresholds.
- **Dashboard Interface**: Tabbed interface (`/dashboard`) with "General" (navigation hub, quick stats, achievements, member perks), "Orders" (subscriptions, order history, wishlist, product reviews), and "Settings" tabs.

## Batch Number System

**Format: `[MfgID]-[YYMM][Cycle]`**

The batch number system uses manufacturer product IDs combined with production date and cycle letter.

### Manufacturer Product IDs (Current In-Stock)
| MfgID | Product | Dosage |
|-------|---------|--------|
| BA3   | Bacteriostatic Water | 3ML |
| BA10  | Bacteriostatic Water | 10ML |
| BC10  | BPC-157 | 10mg |
| CU50  | GHK-Cu | 50mg |
| MS10  | MOTS-c | 10mg |
| RT10  | RR-A3 | 10mg |
| BT5   | TB-500 | 5mg |

### Batch Number Components
- **MfgID**: Manufacturer product shortcode (see table above)
- **YY**: Two-digit year (e.g., 26 for 2026)
- **MM**: Two-digit month (e.g., 01 for January)
- **Cycle**: Letter starting at A, incrementing per production run that month (A, B, C...)

### Examples
- `RT10-2601A` = First batch of RR-A3 10mg, January 2026
- `RT10-2601B` = Second batch of RR-A3 10mg, January 2026
- `BC10-2602A` = First batch of BPC-157 10mg, February 2026
- `BA3-2601A` = First batch of Bac Water 3ML, January 2026

### Validation Pattern
Regex: `/^[A-Z]{2,4}\d{1,4}-\d{4}[A-Z]$/`

## External Dependencies

- **Database**: Neon Database (PostgreSQL)
- **Payment Gateway**: PayPal
- **AI Services**: OpenAI (gpt-4o-mini) via Replit AI Integrations
- **Cloud Storage**: Replit Object Storage (Google Cloud Storage)
- **Email/SMS**: Amazon SES, Amazon SNS
- **CDN**: Google Fonts (DM Sans, Bebas Neue)
- **UI Libraries**: Radix UI, shadcn/ui, cmdk, embla-carousel-react, lucide-react
- **Form & Validation**: react-hook-form, @hookform/resolvers, zod, drizzle-zod