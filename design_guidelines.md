# Revive Research - Design Guidelines

## Design Approach
**High-Energy Neon Aesthetic** drawing from:
- Dark, sophisticated backgrounds with vibrant neon accents
- Backlit glow effects on key interactive elements
- Bold, energetic typography
- Modern, inviting feel with cutting-edge energy

Core principle: Premium peptide research with high-energy engagement—dark yet vibrant, sophisticated yet accessible, energetic yet trustworthy.

---

## Color System

**Primary Colors**:
- Primary Neon Yellow: #E7FB10 (bright, energetic, glowing)
- Dark Background: #222222 (deep charcoal)
- Accent Dark: #0A0F1A (very dark navy for contrast)

**Dark Mode (Active)**:
- Background: Deep dark with neon yellow accents
- Foreground: Bright white/light gray for contrast against dark
- Cards: Slightly elevated dark surfaces with subtle glow

**Neon Glow Effects**:
- Primary elements glow with neon yellow light (box-shadow with #E7FB10)
- Hover states intensify the glow
- Active states create dramatic neon lighting effect
- Icons and buttons have subtle backlit appearance

---

## Typography System

**Font Stack**:
- Primary Font: DM Sans (body text)
- Display Font: Bebas Neue (headlines - bold, energetic)
- Monospace: JetBrains Mono (technical content, code)

**Hierarchy** (Mobile-First):
- Hero Headlines: Bebas Neue, text-4xl sm:text-5xl md:text-7xl lg:text-8xl, tracking-wide, glowing effect
- Section Headers: Bebas Neue, text-2xl sm:text-3xl md:text-4xl lg:text-5xl, uppercase tracking
- Subheadings: DM Sans, font-medium, text-base sm:text-lg md:text-xl lg:text-2xl
- Body Text: DM Sans, font-normal, text-sm sm:text-base md:text-lg
- Labels/Captions: DM Sans, font-medium, text-xs sm:text-sm uppercase
- Product Names: Bebas Neue, font-bold, text-lg sm:text-xl md:text-2xl
- Pricing: Bebas Neue, text-2xl sm:text-3xl md:text-4xl, with glow effect

---

## Layout System

**Spacing Primitives** (Mobile-First): Use Tailwind units for consistency
- Section padding: py-12 sm:py-16 md:py-24 lg:py-32
- Component spacing: gap-4 sm:gap-6 md:gap-8 lg:gap-12
- Card padding: p-4 sm:p-6 md:p-8 lg:p-12
- Container padding: px-4 sm:px-6 md:px-8 lg:px-0
- Tight groupings: gap-2 sm:gap-3 md:gap-4

**Container Strategy**:
- Full-width sections with inner max-w-7xl mx-auto px-4 md:px-8
- Content sections: max-w-6xl
- Form containers: max-w-2xl
- Text blocks: max-w-prose

---

## Component Design

### Navigation
- Fixed top navigation with dark backdrop blur
- Logo prominent and eye-catching
- Navigation items with hover glow effects
- Mobile: Full-screen overlay with neon-lit menu

### Buttons & CTAs
- Primary: Vibrant neon yellow (#E7FB10) with glowing box-shadow
- Hover: Intensified glow effect
- Active: Dramatic neon lighting
- All interactive elements have subtle glow

### Cards & Surfaces
- Dark backgrounds with neon yellow borders (30% opacity, full on hover)
- Glow on hover (hover-elevate with yellow tint)
- Content elevated slightly from background
- Icons with neon glow effects

### Forms & Inputs
- Dark inputs with light text
- Yellow focus states with glow
- Validation states with color-coded glow (green for success, red for error)
- Labels clearly visible on dark backgrounds

### Hero Section
- Full-width dark background
- Neon-lit headline text (Bebas Neue, glowing)
- Subheading with good contrast
- Primary CTA button with prominent neon glow
- Ambient lighting through glow effects

---

## Glow & Shadow Effects

**Neon Glow Utilities**:
- `.glow-primary`: Yellow neon glow around element
- `.glow-hover`: Intensified glow on hover state
- `.glow-text`: Text with subtle glow effect

**Implementation**:
- Use box-shadow with neon yellow (#E7FB10) at various blur radii
- Color: rgba(231, 251, 16, 0.4) to rgba(231, 251, 16, 0.8)
- Blur: 10px to 30px depending on intensity
- Multiple layers for depth effect

---

## Animations & Interactions

Use Framer Motion for:
- Page transitions: Fade in with upward motion
- Scroll reveals: Elements glow in as they enter viewport
- Card hovers: Glow intensifies, subtle lift
- Button clicks: Brief glow pulse
- Icon animations: Subtle floating or pulse effects

**Performance**: 
- Limit animations to key moments
- Glow effects use CSS box-shadow (performant)
- Combine animations with glow for energy

---

## Imagery

**Hero Images**:
- Dark, sophisticated backgrounds
- Neon yellow accent lighting/elements
- High contrast for text readability
- Subtle parallax or ambient movement

**Product Images**:
- Clean, professional
- Lit against dark backgrounds
- Supporting neon yellow accent lighting where applicable

**Icons**:
- Lucide React icons
- Enhanced with glow effects on key elements
- Outlined style for clean aesthetic
- Neon yellow color for primary icons

---

## Accessibility

- High contrast: Bright text on dark backgrounds (WCAG AAA)
- Clear focus states with glowing outlines
- Keyboard navigation fully supported
- Glow effects don't obscure functionality
- Alt text for all images
- Form validation messages clear and color-coded

---

## Overall Feel

- **Modern**: Cutting-edge design with contemporary aesthetics
- **Energetic**: Vibrant neon yellow accents create excitement and engagement
- **Premium**: Dark backgrounds convey sophistication and quality
- **Inviting**: High contrast and glow effects draw users in
- **Trustworthy**: Clear information hierarchy and professional presentation
