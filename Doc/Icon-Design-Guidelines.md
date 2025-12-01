# Habitz Icon Design Guidelines

## Overview

This document defines the design standards for all icons in the Habitz app. Our icon system follows the **Streaks app aesthetic**: minimalist, geometric, and instantly recognizable.

**Total Icons**: 56
**Style**: Geometric Minimalism
**Rendering**: Stroke-based outlines
**Contexts**: Categories (gray circles) and Habits (lime circles)

---

## Design Principles

### 1. Geometric Minimalism

Icons must use **pure geometric forms only**:
- ✅ Circles, rectangles, straight lines
- ✅ Simple curves (arcs, bezier for organic shapes)
- ❌ Complex paths with many control points
- ❌ Decorative details or ornaments

**Example (Good)**:
```tsx
// Clean geometric running figure
run: createIcon([
  <circle key="1" cx="12" cy="5" r="2" />,      // Head
  <path key="2" d="M12 7v7" />,                  // Body
  <path key="3" d="M8 14l4-2 4 4" />,           // Legs
]),
```

**Example (Bad)**:
```tsx
// Too complex, too many paths
run: createIcon([
  <path key="1" d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,  // Overly complex circle
  <path key="2" d="M10 7c1-1 2-1 3 0l1 2v5" />,
  <path key="3" d="M8 12l2 2v4" />,
  <path key="4" d="M14 14l-2-2-1 4" />,
  <path key="5" d="M9 18h2" />,
  <path key="6" d="M13 16h2" />,
]),
```

---

## Technical Standards

### Grid System
- **Base grid**: 24×24px
- **Safe area**: 20×20px (2px padding on all sides)
- **Alignment**: Center elements on pixel grid to avoid sub-pixel rendering

### Stroke Properties
- **Stroke width**: 2.2px (NEVER override in individual icons)
- **Stroke cap**: round
- **Stroke join**: round
- **Fill**: none (all icons are stroke-based)

### Path Complexity
- **Target**: Maximum 3 paths per icon
- **Acceptable**: 4 paths if absolutely necessary
- **Prohibited**: 5+ paths (redesign required)

**Icons with 4 paths (exceptional cases)**:
1. `cycle` - Two wheels + frame + handlebars (justified)
2. `swim` - Head + arm + two wave patterns (justified)
3. `meal` - Fork (3 paths) + Knife (justified)
4. `organize` - 4 grid squares (justified)
5. `no_skip_meals` - Face + slash (justified)
6. `active` - Person + arms + legs (justified)

---

## Icon Categories

### 1. Category Icons (5 main)
Used to represent top-level habit categories. Gray circles in UI.

| Icon | Purpose | Paths |
|------|---------|-------|
| `run` | Fitness/Exercise | 3 |
| `meal` | Nutrition/Food | 4 |
| `plan` | Productivity/Planning | 3 |
| `clock` | Time/Routine | 2 |
| `ban` | Avoidance/Prohibition | 2 |

**Design Pattern**: Clear, instantly recognizable symbols that work at any size.

### 2. No_* Pattern Icons (8 prohibition)
All prohibition icons MUST use the consistent slash pattern.

**Mandatory slash**: `d="M5 5l14 14"`

```tsx
no_[thing]: createIcon([
  <[element representing thing] key="1" .../>,
  <path key="last" d="M5 5l14 14" />,  // ALWAYS THIS EXACT PATH
]),
```

**Examples**:
- `no_fast_food`: Square + vertical line + slash
- `no_screens`: Monitor + stand + slash
- `no_sugar`: Candy shape + slash
- `no_late_sleep`: Crescent moon + slash

**Why consistent**: Users instantly recognize the prohibition pattern across all icons.

### 3. Stick Figures (6 human activities)
Geometric person representations for physical activities.

**Pattern**:
```tsx
[activity]: createIcon([
  <circle key="1" cx="12" cy="5" r="2" />,  // Head (always)
  <path key="2" d="..." />,                   // Body/torso
  <path key="3" d="..." />,                   // Legs/pose
]),
```

**Examples**: cycle, swim, meditate, stretch, yoga, active

**Design Rule**: Head is always a circle at top. Body and limbs are clean lines/curves.

---

## Implementation Pattern

### createIcon Factory
All icons use the `createIcon()` factory function:

```tsx
const createIcon = (paths: JSX.Element[], viewBox = "0 0 24 24") => (props: IconProps) => (
  <svg
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}        // ⚠️ NEVER override this
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {paths}
  </svg>
);
```

### Icon Definition Template
```tsx
// REDESIGNED: [Description] - Streaks style
icon_name: createIcon([
  <circle key="1" cx="12" cy="12" r="8" />,
  <path key="2" d="M..." />,
  <path key="3" d="M..." />,
]),
```

**Required**:
- Comment with brief description
- Unique `key` prop for each path
- Maximum 3-4 paths

**Prohibited**:
- `strokeWidth` overrides
- `fill` attributes
- More than 4 paths
- Complex bezier curves

---

## Design Process for New Icons

### 1. Research & Reference
- Look at Streaks app icons for inspiration
- Identify the core concept (what does this icon represent?)
- Find 2-3 reference icons from similar apps

### 2. Sketch & Simplify
- Start with realistic representation
- Remove ALL decorative elements
- Break down into 2-4 basic shapes
- Ensure it's recognizable at 30px size

### 3. Create Geometric Version
- Use only circles, rectangles, straight lines
- Position on 24×24 grid with 2px padding
- Center elements, align to pixel grid
- Test at both 30px and 52px sizes

### 4. Validate
- [ ] Maximum 3 paths (or 4 if justified)
- [ ] No strokeWidth overrides
- [ ] Works in gray circle (category context)
- [ ] Works in lime circle (habit context)
- [ ] Clear in dark mode
- [ ] Clear in light mode
- [ ] Instantly recognizable

### 5. Add to System
```tsx
// REDESIGNED: [Clear description] - Streaks style
new_icon: createIcon([
  <[shape] key="1" ... />,
  <[shape] key="2" ... />,
]),
```

---

## Common Patterns

### Circular Icons (activity rings, targets)
```tsx
icon: createIcon([
  <circle key="1" cx="12" cy="12" r="10" />,  // Outer ring
  <circle key="2" cx="12" cy="12" r="6" />,   // Middle ring
  <circle key="3" cx="12" cy="12" r="2" />,   // Center dot
]),
```

### Objects with Detail
```tsx
icon: createIcon([
  <rect key="1" x="6" y="4" width="12" height="16" rx="2" />,  // Main shape
  <path key="2" d="M9 8h6" />,                                   // Detail
]),
```

### Organic Shapes (droplets, flames)
```tsx
icon: createIcon([
  <path key="1" d="M12 3s4 5 4 9a4 4 0 0 1-8 0c0-4 4-9 4-9Z" />,
]),
```

**Note**: Use smooth bezier curves, but keep path count to 1-2 max.

---

## Color Usage

Icons themselves are **monochrome** (stroke-only). Colors are applied via contexts:

### In Category Context
- Background: `#2C2C2E` (dark gray circle)
- Icon stroke: `#FFFFFF` (white)

### In Habit Context
- Background: `#A3E635` (lime circle)
- Icon stroke: `#000000` (black)

### Implementation
```tsx
// DashboardHabitCard.tsx
<div className={cn(
  "rounded-full",
  completed
    ? "bg-primary text-primary-foreground"        // Lime bg, black icon
    : "bg-primary/10 text-primary"                // Light lime bg, lime icon
)}>
  <Icon width={30} height={30} strokeWidth={2.5} />
</div>
```

---

## Testing Checklist

Before finalizing any icon:

### Visual Tests
- [ ] Preview at 30px (dashboard cards)
- [ ] Preview at 52px (circular progress rings)
- [ ] Test in gray circle (category)
- [ ] Test in lime circle (habit)
- [ ] Test in dark mode
- [ ] Test in light mode

### Technical Tests
- [ ] Path count ≤ 3 (max 4)
- [ ] No strokeWidth overrides
- [ ] No fill attributes
- [ ] Proper key props on all elements
- [ ] Comment with description

### Recognition Tests
- [ ] Instantly recognizable at 30px
- [ ] Unambiguous meaning
- [ ] Consistent with icon family
- [ ] Works without color (grayscale test)

---

## Preview Tool

Use `Doc/icon-preview.html` to preview all icons:

```bash
# Open in browser
open Doc/icon-preview.html
# or
start Doc/icon-preview.html
```

**Features**:
- Dark/Light mode toggle
- Size variations (30px, 52px)
- Category and Habit contexts side-by-side
- All 56 icons organized by category

---

## Examples: Good vs Bad

### ✅ GOOD: Clean, geometric, recognizable
```tsx
// Clock - 2 paths, instantly recognizable
clock: createIcon([
  <circle key="1" cx="12" cy="12" r="10" />,
  <path key="2" d="M12 6v6l3 3" />,
]),
```

### ❌ BAD: Too complex, too many details
```tsx
// Clock - 7 paths, overly detailed
clock: createIcon([
  <circle key="1" cx="12" cy="12" r="10" />,
  <circle key="2" cx="12" cy="12" r="9.5" />,
  <path key="3" d="M12 6v6l3 3" />,
  <path key="4" d="M12 4v1M12 19v1M4 12h1M19 12h1" />,
  <path key="5" d="M6 6l.5.5M17.5 17.5l.5.5" />,
  <path key="6" d="M6 18l.5-.5M17.5 6.5l.5-.5" />,
  <circle key="7" cx="12" cy="12" r="1" />,
]),
```

---

## Maintenance

### When to Redesign
- Icon is not instantly recognizable
- Users confuse it with another icon
- Path count > 4
- Icon uses strokeWidth overrides
- Icon looks "AI-generated" or generic

### How to Redesign
1. Identify the problem (complexity, recognition, etc.)
2. Simplify to core geometric shapes
3. Reduce path count
4. Test in all contexts
5. Update preview HTML
6. Commit with clear description

### Version Control
Always commit icon changes with descriptive messages:

```bash
git commit -m "feat(icons): redesign [icon] to geometric style

- Reduced from X to Y paths
- Improved recognition at small sizes
- Better alignment with Streaks aesthetic
"
```

---

## Resources

### Design Inspiration
- **Streaks app**: Our primary reference for style
- **Apple SF Symbols**: For geometric icon patterns
- **Feather Icons**: For stroke-based simplicity
- **Lucide Icons**: For modern minimalism

### Tools
- **Figma**: For designing icons before coding
- **SVGOMG**: For optimizing SVG paths
- **Preview HTML**: `Doc/icon-preview.html` for testing

### Documentation
- Icon catalog: `App/src/components/icons/HabitIcons.tsx`
- Preview tool: `Doc/icon-preview.html`
- This guide: `Doc/Icon-Design-Guidelines.md`

---

## Conclusion

The Habitz icon system prioritizes **clarity over decoration**. Every icon should be:
1. **Geometric**: Pure shapes, no complex paths
2. **Minimal**: 2-4 paths maximum
3. **Recognizable**: Clear at any size
4. **Consistent**: Follows established patterns

When in doubt, **simplify**. A clean, simple icon that's instantly recognizable is always better than a complex, detailed icon that's hard to parse at small sizes.

---

**Last Updated**: 2025-01-28
**Total Icons**: 56
**Design System**: Streaks-style Geometric Minimalism
**Maintained by**: Habitz Development Team
