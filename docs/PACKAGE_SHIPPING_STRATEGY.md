# Shipping Strategy for Tailwind/shadcn Component Packages

This document outlines the recommended approach for shipping Nx packages that use Tailwind CSS and shadcn/ui components without bundling their dependencies or configs.

## Core Principles

### ✅ DO Ship

- **Component source code** (JSX with Tailwind classes)
- **TypeScript types** (.d.ts files)
- **Runtime dependencies** (Radix UI, clsx, tailwind-merge, class-variance-authority)
- **Utility functions** (cn helper, etc.)

### ❌ DON'T Ship

- **Tailwind CSS** (peer dependency - consuming app provides)
- **Tailwind config files** (tailwind.config.js/ts - not needed with v4)
- **@tailwindcss/vite plugin** (peer dependency - consuming app provides)
- **Generated CSS** (consuming app generates it via Tailwind)
- **CSS variables** (consuming app defines them OR uses `@kaijudo/react-styling-config`)

## Package.json Configuration

### Dependencies (Bundled)

```json
{
  "dependencies": {
    // shadcn utilities - needed at runtime
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.2",
    "class-variance-authority": "^0.7.1",

    // Radix UI primitives - needed at runtime
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-slot": "^1.2.1",
    "@radix-ui/react-tooltip": "^1.1.3"
    // ... other Radix primitives used by components
  }
}
```

### Peer Dependencies (Not Bundled)

**These MUST be in `peerDependencies` - they are NOT bundled:**

```json
{
  "peerDependencies": {
    // React - consuming app provides (REQUIRED)
    "react": "^19.2.0",
    "react-dom": "^19.2.0",

    // Tailwind - consuming app provides (REQUIRED)
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",

    // Optional peer deps
    "motion": "^12.0.0" // if using animations
  }
}
```

**Why peer dependencies?**

- Prevents duplicate React/Tailwind in final bundle
- Allows consuming app to control versions
- Reduces bundle size significantly
- Follows npm best practices for libraries

### ⚠️ Common Mistake

**DON'T put React in dependencies:**

```json
// ❌ WRONG
"dependencies": {
  "react": "^19.2.0",
  "react-dom": "^19.2.0"
}

// ✅ CORRECT
"peerDependencies": {
  "react": "^19.2.0",
  "react-dom": "^19.2.0"
}
```

## tsup Configuration

### Externalize Everything That's a Peer Dependency

```typescript
// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    resolve: true,
  },
  splitting: false,
  sourcemap: true,
  clean: true,

  // Externalize peer dependencies - don't bundle them
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime", // Important for React 17+
    "tailwindcss",
    "@tailwindcss/vite",
    "motion", // if used
  ],

  // Don't bundle CSS - Tailwind classes stay in JSX
  // If you have component-specific CSS files, copy them:
  loader: {
    ".css": "copy", // Only if you have non-Tailwind CSS
  },

  publicDir: false, // Don't copy public assets
  tsconfig: "./tsconfig.lib.json",
});
```

### What Gets Bundled vs Externalized

**Bundled (included in dist):**

- ✅ Your component code
- ✅ `clsx`, `tailwind-merge`, `class-variance-authority`
- ✅ Radix UI primitives
- ✅ Utility functions (`cn`, etc.)

**Externalized (not bundled):**

- ❌ React/ReactDOM
- ❌ Tailwind CSS
- ❌ @tailwindcss/vite
- ❌ Motion (if used)

## Build Output Structure

### What Ships in the Package

```
dist/
├── index.js          # ESM bundle (with Tailwind classes in JSX)
├── index.cjs         # CommonJS bundle
├── index.d.ts        # TypeScript definitions
└── index.js.map      # Source maps
```

### What Does NOT Ship

```
❌ tailwind.config.js
❌ tailwind.config.ts
❌ postcss.config.js
❌ Any CSS files (unless component-specific, non-Tailwind)
❌ node_modules/
```

## Consuming App Requirements

### 1. Install Peer Dependencies

```bash
# In consuming app
pnpm add react react-dom tailwindcss@^4.0.0 @tailwindcss/vite@^4.0.0
```

### 2. Install UI Config Package (Recommended)

For easy setup, install the shared config package:

```bash
pnpm add @kaijudo/react-styling-config
```

This package provides:

- ✅ All CSS variables (light & dark mode)
- ✅ Tailwind v4 `@theme inline` definitions
- ✅ Base styles
- ✅ Complete setup file

**Usage:**

```css
/* styles.css */
@import "@kaijudo/react-styling-config/index.css";
```

This single import provides everything needed for @kaijudo components to work.

See [@kaijudo/react-styling-config README](../../packages/react-styling-config/README.md) for details.

### 2. Configure Vite

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Auto-scans node_modules/@kaijudo/* for Tailwind classes
  ],
});
```

### 3. Import UI Config (Recommended)

**Option A: Use shared config package (easiest)**

```css
/* styles.css */
@import "@kaijudo/react-styling-config/index.css";
```

This single import provides:

- Tailwind import
- All CSS variables (light & dark mode)
- `@theme inline` definitions
- Base styles

**Option B: Manual setup**

If you prefer manual control:

```css
/* styles.css */
@import "tailwindcss";

:root {
  /* Component-specific variables */
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.2 0 0);
  --sidebar-accent: oklch(0.96 0 0);
  --sidebar-accent-foreground: oklch(0.2 0 0);

  /* Standard shadcn variables */
  --background: oklch(1 0 0);
  --foreground: oklch(0.2 0 0);
  --primary: oklch(0.5 0.2 250);
  /* ... */
}

@theme inline {
  /* Expose to Tailwind */
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... */
}
```

### 4. Import Components

```tsx
// App code
import { Sidebar } from "@kaijudo/react-sidebar";
import { Card } from "@kaijudo/react-card";

// Tailwind classes in components are automatically scanned
// CSS is generated by consuming app's Tailwind setup
```

## The @kaijudo/react-styling-config Package

We provide a shared config package (`@kaijudo/react-styling-config`) that ships:

- ✅ **CSS variables** (light & dark mode)
- ✅ **Tailwind v4 theme definitions** (`@theme inline`)
- ✅ **Base styles**
- ✅ **Complete setup file** (includes Tailwind import)

**Benefits:**

- Single source of truth for theme variables
- Easy setup: `@import '@kaijudo/react-styling-config/index.css'`
- No duplication across apps
- Version-controlled theme
- No JavaScript bundle (pure CSS)

**What it does NOT ship:**

- ❌ Tailwind CSS (peer dependency)
- ❌ @tailwindcss/vite (peer dependency)
- ❌ React (not needed - CSS only)

This package follows the same shipping strategy: it's a **CSS-only package** that consuming apps import. The consuming app must still provide Tailwind as a peer dependency.

See [@kaijudo/react-styling-config README](../../packages/react-styling-config/README.md) for full documentation.

## Verification Checklist

Before publishing a package, verify:

- [ ] ✅ No `tailwind.config.*` files in package
- [ ] ✅ No `postcss.config.*` files in package
- [ ] ✅ React/ReactDOM in `peerDependencies`, not `dependencies`
- [ ] ✅ Tailwind in `peerDependencies`
- [ ] ✅ `tsup.config.ts` externalizes all peer deps
- [ ] ✅ No CSS files shipped (unless non-Tailwind component CSS)
- [ ] ✅ Component code has Tailwind classes in JSX (not compiled CSS)
- [ ] ✅ TypeScript types exported correctly
- [ ] ✅ README documents required CSS variables

## Example: Complete Package Setup

### package.json

```json
{
  "name": "@kaijudo/react-example",
  "version": "0.0.1",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.2",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.2",
    "class-variance-authority": "^0.7.1"
  },
  "peerDependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

### tsup.config.ts

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "tailwindcss",
    "@tailwindcss/vite",
  ],
});
```

### src/Component.tsx

```tsx
import { cn } from "./utils";
import * as Dialog from "@radix-ui/react-dialog";

export function ExampleComponent({ className, ...props }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        className={cn(
          "bg-primary text-primary-foreground px-4 py-2 rounded-md",
          className
        )}
      >
        Open Dialog
      </Dialog.Trigger>
      {/* Tailwind classes stay in JSX - consuming app generates CSS */}
    </Dialog.Root>
  );
}
```

## Benefits of This Approach

1. **Small Bundle Size**

   - Only component code + small utilities
   - No Tailwind CSS bundled
   - No duplicate CSS

2. **Flexibility**

   - Consuming app controls Tailwind version
   - App defines theme colors
   - Supports multiple themes/dark mode

3. **Performance**

   - Tailwind v4 generates only used classes
   - Automatic tree-shaking
   - Optimal CSS output

4. **Maintainability**
   - Single source of truth for styles (app CSS)
   - Easy to update Tailwind version
   - No version conflicts

## Troubleshooting

### Components Not Styled

- ✅ Check consuming app has `@tailwindcss/vite` plugin
- ✅ Check `@import 'tailwindcss'` in app CSS
- ✅ Check CSS variables defined in app
- ✅ Check `@theme inline` exposes variables

### TypeScript Errors

- ✅ Rebuild package: `nx build @kaijudo/package-name`
- ✅ Restart TS server in IDE
- ✅ Check peer dependencies installed in consuming app

### Bundle Size Too Large

- ✅ Check `external` array in `tsup.config.ts`
- ✅ Verify React/ReactDOM not in `dependencies`
- ✅ Check no CSS files being bundled

## Migration Checklist

If you have existing packages to fix:

1. Move React/ReactDOM from `dependencies` → `peerDependencies`
2. Add Tailwind to `peerDependencies`
3. Update `tsup.config.ts` to externalize peer deps
4. Remove any `tailwind.config.*` files
5. Remove CSS from bundle (keep Tailwind classes in JSX)
6. Update README with CSS variable requirements
7. Test in consuming app

## Summary: Complete Setup

### For Component Packages

1. **package.json:**

   - ✅ Runtime deps in `dependencies` (Radix UI, clsx, tailwind-merge)
   - ✅ React/Tailwind in `peerDependencies` (NOT in dependencies)

2. **tsup.config.ts:**

   - ✅ Externalize all peer dependencies
   - ✅ Don't bundle CSS (keep Tailwind classes in JSX)

3. **Component code:**
   - ✅ Use Tailwind classes in JSX
   - ✅ Export TypeScript types

### For Consuming Apps

1. **Install dependencies:**

   ```bash
   pnpm add react react-dom tailwindcss@^4.0.0 @tailwindcss/vite@^4.0.0
   pnpm add @kaijudo/react-styling-config  # Optional but recommended
   ```

2. **Configure Vite:**

   ```typescript
   plugins: [react(), tailwindcss()];
   ```

3. **Import CSS:**

   ```css
   @import "@kaijudo/react-styling-config/index.css"; // Recommended
   // OR manually define variables
   ```

4. **Use components:**
   ```tsx
   import { Sidebar } from "@kaijudo/react-sidebar";
   ```

### The @kaijudo/react-styling-config Package

- ✅ Ships CSS variables and theme config
- ✅ No JavaScript, no dependencies
- ✅ Single source of truth for theme
- ✅ Easy setup: `@import '@kaijudo/react-styling-config/index.css'`
- ❌ Does NOT ship Tailwind (still a peer dependency)

## Resources

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [tsup Documentation](https://tsup.egoist.dev/)
- [@kaijudo/ui-config README](../../packages/ui-config/README.md)
