# shadcn Component Packages Architecture

This document explains how shadcn/ui components work when packaged in a monorepo component library.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Component Package                        │
│              (@kaijudo/react-sidebar)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React Components (.tsx files)                      │    │
│  │  - Uses Tailwind classes (e.g., "bg-sidebar")      │    │
│  │  - Uses Radix UI primitives                         │    │
│  │  - Exports TypeScript types                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Built with tsup:                                            │
│  - Bundles TypeScript → JavaScript + .d.ts               │
│  - Does NOT bundle CSS                                      │
│  - JSX preserved with Tailwind classes intact               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ import
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Consuming Application                      │
│                      (apps/web)                              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. Tailwind CSS v4 Configuration                   │    │
│  │     @tailwindcss/vite plugin                         │    │
│  │     - Auto-scans src/ files                          │    │
│  │     - Auto-scans node_modules/@kaijudo/*            │    │
│  │     - Generates CSS for used classes only            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  2. Global CSS (styles.css)                          │    │
│  │     @import 'tailwindcss'                            │    │
│  │                                                       │    │
│  │     :root {                                           │    │
│  │       --sidebar: oklch(0.985 0 0);                   │    │
│  │       --sidebar-foreground: oklch(...);              │    │
│  │       /* ... more CSS variables ... */               │    │
│  │     }                                                 │    │
│  │                                                       │    │
│  │     @theme inline {                                   │    │
│  │       --color-sidebar: var(--sidebar);               │    │
│  │       /* Expose to Tailwind */                       │    │
│  │     }                                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  3. Use Components                                   │    │
│  │     import { Sidebar } from '@kaijudo/react-sidebar'│    │
│  │                                                       │    │
│  │     <Sidebar groups={...} />                         │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Build Output:                                               │
│  - Optimized CSS (only used classes)                        │
│  - Tree-shaken JavaScript                                   │
│  - No duplicate styles                                      │
└─────────────────────────────────────────────────────────────┘
```

## Key Concepts

### 1. Component Package Does NOT Bundle CSS

**Why?**
- Tailwind generates utility classes on-demand
- Bundling would include ALL Tailwind classes (huge file)
- Would create duplicate CSS if app also uses Tailwind

**What it does:**
- Ships raw JSX with Tailwind classes
- Exports TypeScript types
- Includes Radix UI as dependencies

### 2. Consuming App Generates CSS

**How?**
- Tailwind v4 Vite plugin scans all files
- Finds Tailwind classes in both app and packages
- Generates minimal CSS with only used classes

**Benefits:**
- Optimal bundle size
- No duplicate CSS
- Automatic tree-shaking
- Works with app's Tailwind config

### 3. CSS Variables in App

**Why not in package?**
- Different apps need different themes
- Centralized color management
- Supports dark mode
- Easy customization

**What's required:**
```css
/* App must define these */
:root {
  --sidebar: /* color */;
  --sidebar-foreground: /* color */;
  /* ... */
}

/* Expose to Tailwind v4 */
@theme inline {
  --color-sidebar: var(--sidebar);
  /* ... */
}
```

## Comparison: Tailwind v3 vs v4

### Tailwind v3 (Old Way)

```javascript
// tailwind.config.js
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@kaijudo/*/src/**/*.{js,ts,jsx,tsx}", // ← Manual
  ],
  theme: {
    extend: {
      colors: {
        sidebar: "hsl(var(--sidebar))", // ← Manual
      },
    },
  },
}
```

**Issues:**
- Manual content paths
- Manual color configuration
- Config file required

### Tailwind v4 (New Way)

```css
/* styles.css */
@import 'tailwindcss';

:root {
  --sidebar: oklch(0.985 0 0);
}

@theme inline {
  --color-sidebar: var(--sidebar);
}
```

**Benefits:**
- ✅ Automatic scanning (no content config)
- ✅ CSS-based configuration
- ✅ No config file needed
- ✅ Better performance

## Creating New Component Packages

### 1. Generate Package

```bash
npx nx g @kaijudo/package-plugin:package react-[name]
```

### 2. Add shadcn Dependencies

If using shadcn components, add Radix UI to `dependencies`:

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-slot": "^1.2.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.2"
  },
  "peerDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

### 3. Use Tailwind Classes

```tsx
export function MyComponent() {
  return (
    <div className="bg-primary text-primary-foreground p-4">
      {/* Tailwind classes will be generated by consuming app */}
    </div>
  )
}
```

### 4. Document CSS Variables

If introducing new colors, document them:

```markdown
## Required CSS Variables

Add to your app's CSS:

\`\`\`css
:root {
  --my-custom-color: oklch(0.5 0.2 250);
}

@theme inline {
  --color-my-custom: var(--my-custom-color);
}
\`\`\`
```

## Benefits of This Architecture

1. **Optimal Bundle Size**
   - Only CSS for used classes
   - Automatic tree-shaking
   - No duplicate styles

2. **Flexibility**
   - Each app can customize colors
   - Supports dark mode
   - No CSS conflicts

3. **Developer Experience**
   - Automatic scanning (Tailwind v4)
   - Type-safe components
   - Hot module replacement works

4. **Maintainability**
   - Single source of truth for colors (app CSS)
   - Components focus on structure
   - Easy to update themes

## Common Issues & Solutions

### Components Not Styled

**Problem:** Components render but have no styles

**Check:**
1. ✅ Tailwind plugin in `vite.config.ts`?
2. ✅ `@import 'tailwindcss'` in CSS?
3. ✅ CSS variables defined?
4. ✅ `@theme inline` exposing variables?

**Fix:**
```bash
# Clear cache and rebuild
rm -rf node_modules/.vite
pnpm install
```

### Wrong Colors

**Problem:** Colors don't match design

**Solution:** Update CSS variables in app's `styles.css`

### TypeScript Errors

**Problem:** Cannot find module

**Solution:**
```bash
# Rebuild package
nx build @kaijudo/react-sidebar

# Restart TS server in IDE
```

## Best Practices

1. **Package Structure**
   - Keep components simple and focused
   - Export types for props
   - Document required CSS variables

2. **CSS Variables**
   - Use semantic names (`--sidebar`, not `--gray-900`)
   - Support both light and dark modes
   - Document all required variables

3. **Dependencies**
   - Add Radix UI to `dependencies`
   - Keep Tailwind in `peerDependencies`
   - Use workspace protocol (`workspace:*`)

4. **Testing**
   - Test in consuming app
   - Verify in both light/dark modes
   - Check responsive behavior

## Resources

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs/v4-beta)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
- [Package: @kaijudo/react-sidebar](../packages/react-sidebar/README.md)

