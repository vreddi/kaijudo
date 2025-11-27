# Integration Guide for @kaijudo/react-sidebar

## Overview

This package contains React components built on top of shadcn/ui and uses Tailwind CSS for styling. This guide explains how to integrate it into your application.

## How It Works

### Tailwind CSS v4 (Current Setup)

The web app uses Tailwind CSS v4 via `@tailwindcss/vite`, which has automatic dependency scanning:

1. **Automatic Scanning**: The Vite plugin automatically scans:
   - All source files in your app (`src/**`)
   - All files in `node_modules/@kaijudo/react-sidebar`
   - Generates utility classes for all Tailwind classes used

2. **No Configuration Needed**: Unlike Tailwind v3, you don't need to add content paths to a config file

3. **CSS Variables Required**: The consuming application must define the CSS variables used by the components

### What the Package Provides

The `@kaijudo/react-sidebar` package:
- ✅ Contains React components with Tailwind classes
- ✅ Includes Radix UI primitives as dependencies
- ✅ Exports TypeScript types
- ❌ **Does NOT** bundle CSS or Tailwind classes
- ❌ **Does NOT** define CSS variables (app's responsibility)

## Integration Steps

### 1. Install Dependencies

The web app already has these, but for reference:

```json
{
  "dependencies": {
    "@kaijudo/react-sidebar": "workspace:*",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "motion": "^12.0.0"
  }
}
```

### 2. Configure Vite

Ensure your `vite.config.ts` includes the Tailwind plugin:

```typescript
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(), // This automatically scans dependencies
    // ... other plugins
  ],
});
```

### 3. Add CSS Variables

In your app's global CSS file (e.g., `src/styles.css`), add:

```css
@import 'tailwindcss';

:root {
  /* Base shadcn/ui variables */
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.871 0.006 286.286);
  
  /* Sidebar-specific variables */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.21 0.006 285.885);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.92 0.004 286.32);
  --sidebar-ring: oklch(0.871 0.006 286.286);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --border: oklch(0.274 0.006 286.033);
  --input: oklch(0.274 0.006 286.033);
  --ring: oklch(0.442 0.017 285.786);
  
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.274 0.006 286.033);
  --sidebar-ring: oklch(0.442 0.017 285.786);
}

/* Expose variables to Tailwind */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}
```

### 4. Use the Component

```tsx
import { Sidebar, SidebarInset } from "@kaijudo/react-sidebar";
import { Link } from "@tanstack/react-router";

const menuGroups = [
  {
    items: [
      { id: "home", label: "Home", href: "/" },
      { id: "dashboard", label: "Dashboard", href: "/dashboard" },
    ],
  },
];

const LinkComponent = ({ to, className, children }) => (
  <Link to={to} className={className}>
    {children}
  </Link>
);

function App() {
  return (
    <div className="flex h-screen">
      <Sidebar
        groups={menuGroups}
        linkComponent={LinkComponent}
      />
      <SidebarInset>
        {/* Your content */}
      </SidebarInset>
    </div>
  );
}
```

## Why This Architecture?

### CSS Variables in Consuming App

**Reason**: Different apps might want different color schemes. By defining CSS variables in the app:
- ✅ Centralized theming
- ✅ Easy to customize colors
- ✅ Supports dark mode
- ✅ Consistent across all components

### No Bundled CSS

**Reason**: Tailwind v4 generates only the CSS classes you actually use:
- ✅ Smaller bundle sizes
- ✅ No duplicate CSS
- ✅ Automatic tree-shaking
- ✅ Works with app's Tailwind configuration

### Component Library Pattern

This follows the modern approach for sharing React components with Tailwind:
1. **Package**: Ships JSX with Tailwind classes (not compiled CSS)
2. **App**: Scans package files and generates CSS
3. **Result**: Optimal bundle size and flexibility

## Troubleshooting

### Components Not Styled

**Problem**: Components render but have no styling

**Solution**: 
1. Verify Tailwind plugin is in `vite.config.ts`
2. Check that `@import 'tailwindcss'` is in your CSS
3. Ensure CSS variables are defined
4. Clear Vite cache: `rm -rf node_modules/.vite`

### Colors Don't Match

**Problem**: Colors look wrong

**Solution**: Update CSS variables in your app's global CSS to match your design system

### Type Errors

**Problem**: TypeScript errors when importing

**Solution**:
1. Rebuild the package: `nx build @kaijudo/react-sidebar`
2. Restart TypeScript server in your IDE

## Advanced: Creating More shadcn-based Packages

When creating new component packages that use shadcn:

1. **Use the generator**:
   ```bash
   npx nx g @kaijudo/package-plugin:package react-[component-name]
   ```

2. **Install shadcn component dependencies** as needed:
   - Add Radix UI primitives to `dependencies`
   - Keep `tailwindcss`, `@tailwindcss/vite`, `motion` in `peerDependencies`

3. **Don't bundle Tailwind classes**:
   - Use `tsup` to bundle only TypeScript
   - Don't include CSS in the build

4. **Document required CSS variables**:
   - List any new CSS variables needed
   - Update the consuming app's CSS

## Migration from Tailwind v3

If you're using Tailwind v3 with a `tailwind.config.js` file:

```javascript
// tailwind.config.js
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@kaijudo/*/src/**/*.{js,ts,jsx,tsx}", // Scan workspace packages
  ],
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          // ... other sidebar colors
        },
      },
    },
  },
}
```

However, we recommend upgrading to Tailwind v4 for better performance and simpler configuration.

