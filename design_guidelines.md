# Revive Research - Design Guidelines

## Design Approach
**Reference-Based Approach** drawing from:
- **Apple HIG**: Minimal, content-focused aesthetic with generous whitespace
- **Linear**: Bold typography with strong hierarchy and clean layouts
- **Stripe**: Professional, trustworthy design for transactional experiences

Core principle: Scientific credibility meets modern e-commerce—clean, minimal, professional with subtle sophistication.

---

## Typography System

**Primary Font**: Inter (Google Fonts)
**Secondary Font**: Space Grotesk (Google Fonts) for headlines/emphasis

**Hierarchy**:
- Hero Headlines: Space Grotesk, font-bold, text-5xl md:text-7xl lg:text-8xl
- Section Headers: Space Grotesk, font-semibold, text-4xl md:text-5xl
- Subheadings: Inter, font-medium, text-xl md:text-2xl
- Body Text: Inter, font-normal, text-base md:text-lg, leading-relaxed
- Labels/Captions: Inter, font-medium, text-sm uppercase tracking-wider
- Product Names: Space Grotesk, font-semibold, text-2xl
- Pricing: Space Grotesk, font-bold, text-4xl

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 8, 12, 16, 24, 32 for consistency
- Section padding: py-24 md:py-32 lg:py-40
- Component spacing: gap-8 md:gap-12
- Card padding: p-8 md:p-12
- Tight groupings: gap-4

**Container Strategy**:
- Full-width sections with inner max-w-7xl mx-auto px-4 md:px-8
- Content sections: max-w-6xl
- Form containers: max-w-2xl
- Text blocks: max-w-prose

---

## Component Library

### Navigation
- Fixed top navigation with backdrop blur (backdrop-blur-lg)
- Logo left, menu items center/right alignment
- Mobile: Hamburger menu with full-screen overlay slide animation
- CTA button in navigation ("Shop Products" or "Get Started")

### Landing Page Structure

**Hero Section** (100vh):
- Large hero image background: Abstract scientific/molecular imagery or clean laboratory aesthetic
- Centered content overlay
- Headline: "Something New Is Forming"
- Subheading: "Engineered with intention. Built for those who don't wait for permission."
- Primary CTA button with blurred background (backdrop-blur-md bg-white/10 border border-white/20)
- Scroll indicator at bottom

**Trust Signals Section**:
- Single row of 4 key metrics/badges
- Icons from Heroicons
- Layout: grid-cols-2 md:grid-cols-4 gap-12
- Each metric: Large number + descriptive label below

**Product Showcase** (Featured Products):
- Grid layout: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
- Product cards with:
  - Product image placeholder (square aspect ratio)
  - Product name (Space Grotesk bold)
  - Brief description (2 lines max)
  - Price display (prominent)
  - "View Details" CTA
- Card hover: Subtle lift effect (transform translate-y-[-4px])

**Science/Credibility Section**:
- Two-column layout (md:grid-cols-2 gap-16)
- Left: Image of laboratory/research setting
- Right: Headline + body text about research standards, third-party testing
- Include "COA Verification" link/CTA

**How It Works**:
- Three-column grid (grid-cols-1 md:grid-cols-3 gap-12)
- Step cards with:
  - Large number indicator (01, 02, 03)
  - Icon from Heroicons
  - Step title
  - Brief description

**Footer**:
- Three-column layout (Company Info | Quick Links | Support)
- Newsletter signup form
- Social media icons
- Legal links (Privacy Policy, Terms, COA Verification)
- Copyright notice

### Checkout/Sales Page Structure

**Product Header**:
- Breadcrumb navigation
- Product name as h1
- Price display (prominent, Space Grotesk)

**Two-Column Layout** (md:grid-cols-2 gap-16):

**Left Column - Product Details**:
- Large product image gallery (main image + thumbnails)
- Product description with expandable sections:
  - Benefits (bulleted list)
  - Usage Instructions
  - Research & Testing
  - COA Information with batch number display
- Trust badges row (Third-Party Tested, GMP Certified, etc.)

**Right Column - Purchase Panel** (sticky positioning):
- Variant selector (if applicable)
- Quantity selector
- Price summary breakdown
- "Add to Cart" primary button (large, prominent)
- Secure checkout badges
- Shipping information
- Return policy link

**Cart Sidebar/Modal**:
- Slide-in from right
- Line items with product image thumbnails
- Quantity adjusters
- Subtotal/Total
- "Proceed to Checkout" CTA
- "Continue Shopping" secondary action

**Checkout Form**:
- Single column, max-w-2xl
- Progress indicator (Steps: Cart → Information → Payment → Confirmation)
- Form sections with clear headers:
  - Contact Information
  - Shipping Address
  - Payment Details (Stripe integration)
- Order summary sidebar (sticky on desktop)
- Security badges near payment section

### COA Verification Page

**Hero Section**:
- Centered layout with max-w-3xl
- Headline: "Certificate of Authenticity"
- Subheading explaining the verification process
- Large search input field for batch number
- "Verify" button (prominent)

**Search Results Section**:
- Appears after verification
- Card layout displaying:
  - Product name and image
  - Batch number (large, monospace font)
  - Test date
  - Expiration date
  - Test results table (compound, specification, result, pass/fail)
  - Lab certification logo
  - "Download PDF" button
- Status indicator (Verified badge with checkmark icon)

**Information Section**:
- Two-column grid explaining COA importance
- Icons for key points
- CTA to contact support if batch not found

---

## Animations & Interactions

Use Framer Motion sparingly for:
- Page transitions: Fade in with slight upward motion (y: 20 to y: 0)
- Scroll reveals: Elements fade in as they enter viewport (intersection observer)
- Card hovers: Subtle elevation change (scale: 1.02, shadow increase)
- Modal/sidebar: Slide animations with backdrop fade
- Button clicks: Gentle scale feedback (scale: 0.98)

**Performance**: Limit animations to 3-4 key moments per page—hero entrance, section reveals, interactive elements.

---

## Images

**Hero Image** (Landing Page):
- Full-viewport background image
- Abstract molecular structure, peptide chains, or clean laboratory aesthetic
- High contrast to support white text overlay
- Subtle parallax scroll effect

**Product Images**:
- Clean white background product photography
- Square format (1:1 aspect ratio)
- Consistent lighting and styling

**Credibility Images**:
- Professional laboratory/research setting photos
- Testing equipment close-ups
- Scientific imagery that reinforces trust

**Icons**:
- Use Heroicons throughout for consistency
- Outlined style for cleaner aesthetic

---

## Form Design

**Input Fields**:
- Generous padding (px-4 py-3)
- Border styling with focus states
- Floating labels or clear placeholder text
- Error states with inline validation messages
- Success states with checkmark icons

**Buttons**:
- Primary: Large, high-contrast, Space Grotesk font
- Secondary: Outlined variant
- Disabled state clearly differentiated
- Min-width for consistency (min-w-[160px])

---

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support throughout
- Focus indicators clearly visible
- Form validation with descriptive error messages
- Sufficient contrast ratios maintained
- Alt text for all images