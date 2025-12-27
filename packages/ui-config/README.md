# @kaijudo/ui-config

Shared Tailwind CSS v4 theme configuration for @kaijudo component packages.

## What This Package Provides

This package ships **CSS configuration files only** - no JavaScript, no dependencies. It provides:

- ✅ CSS variables for light and dark modes
- ✅ Tailwind v4 `@theme inline` definitions
- ✅ Base styles for consistent theming
- ✅ Complete setup file with Tailwind import

## Installation

```bash
pnpm add @kaijudo/ui-config
```

**Peer Dependencies Required:**

- `tailwindcss@^4.0.0`
- `@tailwindcss/vite@^4.0.0`

## Usage

### Option 1: Complete Setup (Recommended)

Import the complete setup file that includes Tailwind:

```css
/* styles.css */
@import "@kaijudo/ui-config/index.css";
```

This includes:

- `@import 'tailwindcss'`
- All CSS variables
- Theme definitions
- Base styles

### Option 2: Theme Only

If you already have Tailwind imported elsewhere:

```css
/* styles.css */
@import "tailwindcss";
@import "@kaijudo/ui-config/theme.css";
@import "@kaijudo/ui-config/base.css";
```

### Option 3: Custom Setup

Import individual files as needed:

```css
/* styles.css */
@import "tailwindcss";
@import "@kaijudo/ui-config/theme.css"; /* Variables and @theme inline */
/* Add your custom styles */
```

## What's Included

### CSS Variables

All standard shadcn/ui variables plus sidebar-specific ones:

- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, etc.
- `--chart-1` through `--chart-5`
- `--radius` (with variants: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`)

### Dark Mode

All variables have dark mode variants defined under `.dark` selector.

### Tailwind Integration

All variables are exposed to Tailwind v4 via `@theme inline`:

```css
@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* ... etc */
}
```

This allows using Tailwind classes like `bg-background`, `text-primary`, etc.

## Example: Using in Storybook

```typescript
// .storybook/preview.ts
import type { Preview } from "@storybook/react";
import "@kaijudo/ui-config/index.css";

const preview: Preview = {
  // ... your config
};

export default preview;
```

## Example: Using in Vite App

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/styles.css */
@import "@kaijudo/ui-config/index.css";
```

```tsx
// src/main.tsx
import "./styles.css";
import { createRoot } from "react-dom/client";
// ...
```

## Customization

You can override any CSS variable in your app:

```css
/* styles.css */
@import "@kaijudo/ui-config/index.css";

:root {
  /* Override primary color */
  --primary: oklch(0.5 0.2 250); /* Your custom color */
}

.dark {
  /* Override dark mode primary */
  --primary: oklch(0.7 0.2 250);
}
```

## Package Structure

```
@kaijudo/ui-config/
├── src/
│   ├── index.css      # Complete setup (includes Tailwind)
│   ├── theme.css      # Variables and theme only
│   └── base.css       # Base styles only
└── package.json       # Exports CSS files directly
```

## Why This Package?

1. **No Duplication**: Single source of truth for theme variables
2. **Easy Setup**: One import for complete configuration
3. **Flexible**: Import only what you need
4. **No Dependencies**: Pure CSS, no JavaScript bundle
5. **Version Control**: All apps use the same theme version

## Related Packages

- `@kaijudo/react-sidebar` - Sidebar component (uses these variables)
- `@kaijudo/react-card` - Card component (uses these variables)
- Other `@kaijudo/*` component packages

## Migration from Manual Setup

If you have existing CSS variables, you can:

1. Replace your variable definitions with `@import '@kaijudo/ui-config/theme.css'`
2. Remove duplicate `@theme inline` blocks
3. Keep any app-specific customizations

## See Also

- [Package Shipping Strategy](../../docs/PACKAGE_SHIPPING_STRATEGY.md)
- [shadcn Component Packages](../../docs/SHADCN_COMPONENT_PACKAGES.md)
