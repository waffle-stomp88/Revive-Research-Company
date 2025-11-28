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
- Primary Blue: #3C82F6 (vibrant cyan-blue with glow effects)
- Dark Background: #222222 (deep charcoal)
- Accent Dark: #0A0F1A (very dark navy for contrast)

**Dark Mode (Active)**:
- Background: Deep dark with neon accents
- Foreground: Bright white/light gray for contrast against dark
- Cards: Slightly elevated dark surfaces with subtle glow

**Neon Glow Effects**:
- Primary elements glow with cyan/blue light (box-shadow with blue)
- Hover states intensify the glow
- Active states create dramatic neon lighting effect
- Icons and buttons have subtle backlit appearance

---

## Typography System

**Font Stack**:
- Primary Font: DM Sans (body text)
- Display Font: Bebas Neue (headlines - bold, energetic)
- Monospace: JetBrains Mono (technical content, code)

**Hierarchy**:
- Hero Headlines: Bebas Neue, text-6xl md:text-8xl, tracking-wide, glowing effect
- Section Headers: Bebas Neue, text-3xl md:text-5xl, uppercase tracking
- Subheadings: DM Sans, font-medium, text-xl md:text-2xl
- Body Text: DM Sans, font-normal, text-base md:text-lg
- Labels/Captions: DM Sans, font-medium, text-sm uppercase
- Product Names: Bebas Neue, font-bold, text-2xl
- Pricing: Bebas Neue, text-4xl, with glow effect

---

## Layout System

**Spacing Primitives**: Use Tailwind units for consistency
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

## Component Design

### Navigation
- Fixed top navigation with dark backdrop blur
- Logo prominent and eye-catching
- Navigation items with hover glow effects
- Mobile: Full-screen overlay with neon-lit menu

### Buttons & CTAs
- Primary: Vibrant blue (#3C82F6) with glowing box-shadow
- Hover: Intensified glow effect
- Active: Dramatic neon lighting
- All interactive elements have subtle glow

### Cards & Surfaces
- Dark backgrounds with minimal visible borders
- Subtle glow on hover (hover-elevate with blue tint)
- Content elevated slightly from background
- Icons with neon glow effects

### Forms & Inputs
- Dark inputs with light text
- Blue focus states with glow
- Validation states with color-coded glow (green for success, red for error)
- Labels clearly visible on dark backgrounds

### Hero Section
- Full-width dark background
- Neon-lit headline text (Bebas Neue, glowing)
- Subheading with good contrast
- Primary CTA button with prominent glow
- Ambient lighting through glow effects

---

## Glow & Shadow Effects

**Neon Glow Utilities**:
- `.glow-primary`: Blue neon glow around element
- `.glow-hover`: Intensified glow on hover state
- `.glow-text`: Text with subtle glow effect

**Implementation**:
- Use box-shadow with blue (#3C82F6) at various blur radii
- Color: rgba(60, 130, 246, 0.5) to rgba(60, 130, 246, 0.8)
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
- Neon accent lighting/elements
- High contrast for text readability
- Subtle parallax or ambient movement

**Product Images**:
- Clean, professional
- Lit against dark backgrounds
- Supporting neon accent lighting where applicable

**Icons**:
- Lucide React icons
- Enhanced with glow effects on key elements
- Outlined style for clean aesthetic
- Neon-blue color for primary icons

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
- **Energetic**: Vibrant neon accents create excitement and engagement
- **Premium**: Dark backgrounds convey sophistication and quality
- **Inviting**: High contrast and glow effects draw users in
- **Trustworthy**: Clear information hierarchy and professional presentation
