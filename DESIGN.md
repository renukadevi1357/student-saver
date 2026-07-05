---
name: Academic Growth
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#005ac2'
  on-tertiary: '#ffffff'
  tertiary-container: '#71a1ff'
  on-tertiary-container: '#00367a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max-width: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is anchored in the "Academic Ledger" aesthetic, bridging the gap between disciplined scholarship and modern financial growth. It targets a demographic that values clarity, progress, and institutional trust. The visual language is **Corporate Modern** with an **Editorial** influence, emphasizing structured information density and clean, high-contrast layouts.

The personality is professional yet approachable—evoking the feeling of a clean, premium digital notebook or a modern financial dashboard. The UI should feel intentional, precise, and encouraging, using generous whitespace and sharp typography to reduce cognitive load during complex financial tasks.

## Colors
The palette is centered around **Emerald Green (#10b981)**, a color signifying vitality, growth, and financial health. This primary hue is supported by a deep **Slate Navy** for text and structural elements to maintain a sense of grounded authority.

To ensure visual harmony, surface and container colors utilize a subtle green-tinted grayscale. Backgrounds use a very light emerald wash to move away from sterile whites, creating a more cohesive "ledger" feel. Functional colors (success, warning, error) are adjusted to match the saturation and vibrance of the emerald primary.

## Typography
The typographic strategy employs a sophisticated pairing: **Source Serif 4** for headlines to provide a scholarly, authoritative tone, and **Hanken Grotesk** for body and functional text to ensure modern legibility and a fintech-forward feel.

Headlines should use tighter letter spacing and optical sizing where available to maintain a "printed" quality. Labels and data points are rendered in Hanken Grotesk with slightly increased tracking to improve scannability in dense financial tables.

## Layout & Spacing
This design system utilizes a **Fixed Grid** philosophy for desktop screens to simulate the structured margins of a physical ledger, transitioning to a fluid model for mobile devices. 

The layout is built on an 8px base unit. For desktop, a 12-column grid is used with 24px gutters. Margin sizes are generous to emphasize the premium, academic feel. Content is organized into logical "modules" or "cards" that align strictly to the grid, ensuring that even data-heavy pages feel organized and intentional.

## Elevation & Depth
Depth is communicated through **Tonal Layers** rather than heavy drop shadows. Surfaces are stacked using varying levels of the emerald-tinted neutrals. 

A primary surface sits at the bottom, with secondary containers using a slightly darker or lighter tint to indicate hierarchy. When a shadow is necessary (e.g., for floating action buttons or dropdowns), it should be a highly diffused, low-opacity emerald-tinted shadow (`rgba(16, 185, 129, 0.08)`) to maintain the "fresh" feeling of the brand without introducing muddy grays.

## Shapes
The shape language is **Soft**, utilizing a 0.25rem (4px) base radius. This provides a subtle nod to modern digital interfaces while maintaining enough crispness to feel professional and "ledger-like." 

Larger components like cards or modal containers may use the `rounded-lg` (8px) setting to soften the overall composition of the page. Buttons and input fields should strictly adhere to the base `rounded` setting to ensure a consistent, tool-like appearance.

## Components
### Buttons
Primary buttons use a solid Emerald Green fill with white text. Secondary buttons use an emerald outline with a subtle `surface_emerald_tint` hover state. Ghost buttons are reserved for tertiary actions and use the Slate Navy text color.

### Input Fields
Inputs are styled with a 1px border using a mid-tone neutral. On focus, the border shifts to the Primary Emerald color with a 2px stroke and a soft emerald glow. This provides clear feedback during data entry.

### Cards
Cards are the primary container for information. They should have no border, instead relying on a subtle tonal shift (e.g., `container_emerald_low`) and the 8px corner radius. This creates a "blocky" but sophisticated information hierarchy.

### Chips & Badges
Chips for status (e.g., "Paid," "Pending") use high-contrast emerald or semantic colors with a 10% opacity background of the same hue. This keeps the interface colorful but readable and prevents the vibrant primary color from overwhelming the content.