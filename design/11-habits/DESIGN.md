---
name: Northstar
colors:
  surface: '#14121b'
  surface-dim: '#14121b'
  surface-bright: '#3a3842'
  surface-container-lowest: '#0f0d16'
  surface-container-low: '#1c1a24'
  surface-container: '#211e28'
  surface-container-high: '#2b2932'
  surface-container-highest: '#36333d'
  on-surface: '#e6e0ee'
  on-surface-variant: '#cac4cf'
  inverse-surface: '#e6e0ee'
  inverse-on-surface: '#322f39'
  outline: '#938f99'
  outline-variant: '#48454e'
  surface-tint: '#cdbff3'
  primary: '#cdbff3'
  on-primary: '#342a54'
  primary-container: '#5a4f7c'
  on-primary-container: '#d2c4f8'
  inverse-primary: '#635885'
  secondary: '#c9beff'
  on-secondary: '#311c7e'
  secondary-container: '#4a3998'
  on-secondary-container: '#bbaeff'
  tertiary: '#cac2e0'
  on-tertiary: '#322d44'
  tertiary-container: '#57526b'
  on-tertiary-container: '#cec6e4'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e8ddff'
  primary-fixed-dim: '#cdbff3'
  on-primary-fixed: '#1f143e'
  on-primary-fixed-variant: '#4b406c'
  secondary-fixed: '#e6deff'
  secondary-fixed-dim: '#c9beff'
  on-secondary-fixed: '#1b0062'
  on-secondary-fixed-variant: '#483795'
  tertiary-fixed: '#e6defc'
  tertiary-fixed-dim: '#cac2e0'
  on-tertiary-fixed: '#1c192e'
  on-tertiary-fixed-variant: '#48445b'
  background: '#14121b'
  on-background: '#e6e0ee'
  surface-variant: '#36333d'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.015em
  page-title:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  page-title-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  section-title:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  subtitle:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.005em
  body:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 21px
    letterSpacing: 0em
  body-medium:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 21px
    letterSpacing: 0em
  small:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 19.5px
    letterSpacing: 0em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  metric-lg:
    fontFamily: IBM Plex Mono
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  metric-md:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 21px
    letterSpacing: 0em
  data-mono:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.02em
  shortcut:
    fontFamily: IBM Plex Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an intentional, focused personal operating system for high-agency individuals managing their life visions, goals, OKRs, habits, and reflective reviews. The aesthetic direction embraces a restrained, architectural dark minimalism centered on calmness, precision, and cognitive ergonomics.

Rather than relying on aggressive gamification or decorative visual noise, the interface functions as a digital sanctuary:
- **Calm & Distraction-Free**: Deep obsidian foundations suppress visual fatigue and reduce ambient cognitive strain during extended planning cycles.
- **Precision & High Legibility**: Clear structural geometry, explicit 1px boundary rules, and dedicated monospace metadata anchoring evoke the reliability of physical index systems and scientific instruments.
- **Approachable Sophistication**: Clean, modern humanist-geometric typography balances precision with warmth, keeping life architecture accessible to non-technical users while preserving structural discipline.
- **Flat Discipline**: Avoids fleeting trends like frosted glassmorphism, heavy skeuomorphism, and vibrant decorative gradients. Surfaces are solid, crisp, and tactile through micro-contrast alone.

## Colors

The palette is strictly dark-mode first and relies on nuanced tonal steps derived from deep slate-violet obsidian to produce natural contrast without harsh black-and-white disparity.

### Base & Structural Surfaces
- **Background (Obsidian Canvas)**: `#121019` — Base canvas for main application viewpoints and workspace roots.
- **Surface (Panel, Card, Sidebar)**: `#1E1B2E` — Primary structural surface for content modules, side navigation, list cards, and workspace partitions.
- **Elevated Surface (Hover, Menus, Modals)**: `#262238` — Raised state for active floating panels, popovers, contextual flyouts, and list row hover states.
- **Border, Divider & Subtle Fills**: `#40375C` — Global 1px structural stroke for separation, component perimeters, and ghost element fills.

### Accents & Controls
- **Primary Accent & Filled Controls**: `#5A4F7C` — Solid controls, default active state fills, and primary button fills.
- **Primary Hover**: `#675B8C` — Interaction hover state for primary fills.
- **Interactive Highlight & Focus Ring**: `#9D8DF1` — Active navigation indicators, hyperlink accents, focus halos, and text selection.

### Typography & Text Tokens
- **Primary Text**: `#ECE9F6` — Titles, body copy, and essential data values.
- **Secondary Text**: `#A39FB8` — Supporting labels, metadata explanations, and inactive navigation links.
- **Tertiary / Disabled Text**: `#6F6A87` — Deactivated items, secondary icons, placeholder hints, and subtle keyboard shortcut icons.

### Semantic Signals
- **Success / On Track / Achieved**: `#6FCF97` — Positive progress, goals on target, completed tasks, and streak states.
- **Warning / At Risk**: `#E8B866` — Behind pace, impending review deadlines, and warning calls.
- **Danger / Destructive / Off Track**: `#E5707F` — Critical status delays, negative performance indicators, and destructive confirmations.
- **Not Started / Neutral Status**: `#A39FB8` — Backlog items and pending milestones.

## Typography

Typography establishes an intentional contrast between qualitative human reflection and quantitative progress tracking.

### Type Pairings & Behavioral Usage
- **Primary Typeface**: Plus Jakarta Sans handles narrative prose, task descriptions, headers, contextual navigation, and standard inputs. Weights are confined to 400 (Regular), 500 (Medium), and 600 (Semi-bold) to preserve clean readability.
- **Monospace Numerical Typeface**: IBM Plex Mono acts as the precise computational voice. It is used strictly for Key Result progress metrics, completion ratios, dates, timestamps, keyboard shortcuts, tabular indices, and tag micro-labels.

### Typesetting Rules
- All line heights honor a clean 1.5 ratio across prose and numerical treatments to ensure steady vertical cadence.
- Monospace tokens must always enforce tabular sizing (`font-variant-numeric: tabular-nums`) to prevent jitter during real-time value updates.
- Headers larger than 24px adjust downwards on mobile screens to retain tight layout footprints.

## Layout & Spacing

The layout is constructed on a strict 4px spatial baseline. Every internal component dimension, padding step, and gap interval is an exact multiple of 4px.

### Layout Topology
- **Desktop (1200px and up)**: Fixed collapsible lateral navigation sidebar (260px expanded, 64px compact), accompanied by an adaptive content canvas spanning 12 columns with 24px (`1.5rem`) gutters and 32px (`2rem`) outer boundaries. Max readable content bounds for reflective views (Reviews, Daily Plan) freeze at 840px to eliminate horizontal eye strain.
- **Tablet (768px – 1199px)**: 8-column layout. Navigation shifts to a persistent condensed rail or top header. Gutter contracts to 16px (`1rem`) and canvas margins step down to 24px (`1.5rem`).
- **Mobile (below 768px)**: Single-column vertical stream with 16px (`1rem`) page margins. Secondary split panels convert to full-bleed drawers or stacked sheets. Bottom navigation sheet supports quick-entry logging for daily habits and tasks.

### Spacing Scale System
- `space-xs` (4px): Icon-to-text gaps within chips, inline tag margins, and micro-dividers.
- `space-sm` (8px): Button internal vertical padding, dense table row gaps, input field internal padding.
- `space-md` (16px): Card internal content padding, default flex item separation, drawer sub-gaps.
- `space-lg` (24px): Card-to-card module gaps, modal internal padding, section margins.
- `space-xl` (32px): Major page section breaks, high-level dashboard segmentation.

## Elevation & Depth

This design system rejects deep blur filters and heavy diffused dropshadows. Depth is articulated purely through surface stepping and crisp 1px structural framing.

### The Three Spatial Planes
1. **Plane 0 (Canvas Base — `#121019`)**: Ground zero. Used for root application framing, structural rails, and empty backdrop canvas.
2. **Plane 1 (Structural Content — `#1E1B2E`)**: Cards, lateral panels, headers, habit grids, and goal cards. Separated from Plane 0 through contrast and a persistent `1px solid #40375C` stroke.
3. **Plane 2 (Interactive Floating Tier — `#262238`)**: Menus, command palettes, tooltips, dialogs, and active card hover states.

### Shadow Guidance
- In-page modules, panels, and standard cards **never** carry shadows.
- Flyouts, popovers, and elevated modal panels receive a crisp, controlled boundary drop to demarcate floating focus against dark surfaces:
  - `box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.75), 0 0 0 1px #40375C;`
- Hover states do not lift cards using translation or simulated elevation. Instead, hover is registered through an immediate flat border highlight (`#5A4F7C`) or surface background transition to `#262238`.

## Shapes

The shape vocabulary uses compact, disciplined rounding that provides ergonomic tactility without appearing cartoonish.

### Structural Radius Allocations
- **Controls & Small Components (6px / `0.375rem`)**: Buttons, text inputs, search fields, chips, pill badges, and habit toggle cells.
- **Containers & Surfaces (10px / `0.625rem`)**: Content cards, modal containers, flyout menus, slide-over panels, and notification toasts.
- **Nested Radii Rule**: When a 6px control sits inside a 10px panel with 8px padding, visual harmony is preserved naturally without corner pinching.
- **Focus Indicators**: Every interactive control adopts an offset focus boundary consisting of a `2px solid #9D8DF1` ring with a `2px` offset (`outline-offset: 2px; outline-color: #9D8DF1`).

## Components

### Buttons
- **Primary**: Background `#5A4F7C`, text `#ECE9F6`, border `1px solid transparent`, radius `6px`. Height 36px (desktop) / 40px (mobile). Hover shifts background to `#675B8C`. Focus produces `2px #9D8DF1` halo with `2px` offset.
- **Secondary / Outline**: Background transparent, text `#ECE9F6`, border `1px solid #40375C`, radius `6px`. Hover background `#262238`.
- **Ghost**: Background transparent, text `#A39FB8`. Hover background `#262238`, text `#ECE9F6`.
- **Destructive**: Background transparent, border `1px solid #E5707F`, text `#E5707F`. Hover background `rgba(229, 112, 127, 0.1)`.

### Inputs & Form Controls
- **Text Inputs**: Height 36px, background `#1E1B2E`, border `1px solid #40375C`, radius `6px`, padding `0 12px`, typography `14px Plus Jakarta Sans`, text `#ECE9F6`, placeholder `#6F6A87`. Active focus updates border to `#9D8DF1`.
- **Checkboxes**: 18px x 18px square, radius `4px`, border `1.5px solid #40375C`, background `#121019`. Checked state: background `#5A4F7C`, border `#5A4F7C`, crisp white check icon.
- **Radio Buttons**: 18px circle, border `1.5px solid #40375C`, background `#121019`. Checked state: border `#9D8DF1`, filled interior pip `#9D8DF1`.

### Badges & Entity Chips
- Badges never use color fills alone. They always feature an icon, label, and semantic hue:
  - **On Track / Achieved**: Text `#6FCF97`, border `1px solid rgba(111, 207, 151, 0.3)`, fill `rgba(111, 207, 151, 0.08)`.
  - **At Risk**: Text `#E8B866`, border `1px solid rgba(232, 184, 102, 0.3)`, fill `rgba(232, 184, 102, 0.08)`.
  - **Off Track / Destructive**: Text `#E5707F`, border `1px solid rgba(229, 112, 127, 0.3)`, fill `rgba(229, 112, 127, 0.08)`.
  - **Not Started**: Text `#A39FB8`, border `1px solid #40375C`, fill `rgba(64, 55, 92, 0.2)`.
- Geometry: Height 22px, border-radius `6px`, typography `11px IBM Plex Mono`, uppercase, letter-spacing `0.04em`.

### Cards & Grouping Panels
- Cards use background `#1E1B2E`, border `1px solid #40375C`, radius `10px`, and padding `16px`.
- Interactive cards transition border color to `#675B8C` upon hover.
- Card Header: Displays entity icon (16px), title (`16px Plus Jakarta Sans Medium`), and trailing status chip.

### Iconography & Entity Alignment
- Line icon standard: 1.5px stroke width, matching ambient text color or secondary token `#A39FB8`.
- Canonical entity mappings:
  - **Life Area**: Compass
  - **Goal**: Flag
  - **Objective**: Target
  - **Key Result**: Gauge
  - **Project**: Folder
  - **Task**: CheckSquare
  - **Habit**: Repeat
  - **Review**: Notebook

### Progress Meters & Habit Heatmaps
- **Key Result Meters**: 6px track height, background `#262238`, radius `3px`. Fill bar matches target health status (`#6FCF97`, `#E8B866`, or `#E5707F`). Accompanying progress percentages render in `12px IBM Plex Mono`.
- **Habit Streaks**: Daily habit blocks render as 24px x 24px rounded squares (radius `4px`). Inactive days use `#262238` with `1px solid #40375C`. Completed days use solid `#5A4F7C` with check icon.