# @kaijudo/react-styling-config

Shared Tailwind CSS v4 styling configuration for @kaijudo React component packages.

## What This Package Ships

This package ships **CSS configuration files only** - no JavaScript, no runtime dependencies, no bundled code. It provides:

### 📦 Package Contents

1. **`index.css`** - Complete setup file
   - Includes `@import 'tailwindcss'`
   - All CSS variables (light & dark mode)
   - Tailwind v4 `@theme inline` definitions
   - Base styles

2. **`theme.css`** - Theme configuration only
   - CSS variables for `:root` and `.dark`
   - `@theme inline` block exposing variables to Tailwind
   - No Tailwind import (use when Tailwind is already imported)

3. **`base.css`** - Base styles only
   - Body and code font styles
   - Base layer styles

### ✅ What's Included

**CSS Variables:**
- **Base colors**: `--background`, `--foreground`, `--card`, `--popover`
- **Semantic colors**: `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`
- **UI elements**: `--border`, `--input`, `--ring`
- **Chart colors**: `--chart-1` through `--chart-5`
- **Sidebar colors**: `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, etc.
- **Border radius**: `--radius` with variants (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`)

**Dark Mode Support:**
- All variables have dark mode variants under `.dark` selector
- Automatic theme switching when `.dark` class is applied

**Tailwind Integration:**
- All variables exposed via `@theme inline` for Tailwind v4
- Use classes like `bg-background`, `text-primary`, `border-border`, etc.

### ❌ What This Package Does NOT Ship

- ❌ **Tailwind CSS** (peer dependency - consuming app must provide)
- ❌ **@tailwindcss/vite** (peer dependency - consuming app must provide)
- ❌ **React** (not needed - this is CSS only)
- ❌ **JavaScript/TypeScript code** (pure CSS package)
- ❌ **Build tools or configs** (consuming app handles build)

## Installation

```bash
pnpm add @kaijudo/react-styling-config
```

### Required Peer Dependencies

The consuming app must install these:

```bash
pnpm add tailwindcss@^4.0.0 @tailwindcss/vite@^4.0.0
```

**Why peer dependencies?**
- Prevents duplicate Tailwind in final bundle
- Allows consuming app to control Tailwind version
- Follows npm best practices for libraries

## Usage for Consumers

### Option 1: Complete Setup (Recommended for New Apps)

Import the complete setup file that includes everything:

```css
/* styles.css or main.css */
@import "@kaijudo/react-styling-config/index.css";
```

**What this provides:**
- ✅ Tailwind CSS import
- ✅ All CSS variables (light & dark mode)
- ✅ `@theme inline` definitions
- ✅ Base styles

**When to use:**
- New applications
- Apps that want the simplest setup
- Storybook configurations

**Example:**

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
@import "@kaijudo/react-styling-config/index.css";
```

```tsx
// src/main.tsx
import "./styles.css";
import { createRoot } from "react-dom/client";
// ... rest of your app
```

### Option 2: Theme Only (For Existing Apps)

If you already have Tailwind imported elsewhere:

```css
/* styles.css */
@import "tailwindcss"; /* Your existing import */
@import "@kaijudo/react-styling-config/theme.css";
@import "@kaijudo/react-styling-config/base.css";
```

**When to use:**
- Apps with existing Tailwind setup
- Apps that need custom Tailwind configuration
- Apps importing Tailwind from multiple sources

### Option 3: Custom Setup (Advanced)

Import individual files as needed:

```css
/* styles.css */
@import "tailwindcss";
@import "@kaijudo/react-styling-config/theme.css"; /* Variables and @theme inline */
/* Add your custom styles here */
```

**When to use:**
- Apps with complex styling requirements
- Apps that need to customize base styles
- Apps that want fine-grained control

## Usage Examples

### Example 1: Storybook Setup

```typescript
// .storybook/preview.ts
import type { Preview } from "@storybook/react";
import "@kaijudo/react-styling-config/index.css";

const preview: Preview = {
  parameters: {
    // ... your config
  },
};

export default preview;
```

### Example 2: Next.js App

```css
/* app/globals.css */
@import "@kaijudo/react-styling-config/index.css";
```

```typescript
// app/layout.tsx
import "./globals.css";
// ... rest of layout
```

### Example 3: Vite + React App

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
/* src/index.css */
@import "@kaijudo/react-styling-config/index.css";
```

```tsx
// src/main.tsx
import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### Example 4: Using Components

Once configured, use @kaijudo components with Tailwind classes:

```tsx
import { Sidebar } from "@kaijudo/react-sidebar";
import { Card } from "@kaijudo/react-card";

function App() {
  return (
    <div className="bg-background text-foreground">
      <Sidebar groups={...} />
      <Card>
        <CardHeader>Hello</CardHeader>
      </Card>
    </div>
  );
}
```

## Customization

You can override any CSS variable in your app:

```css
/* styles.css */
@import "@kaijudo/react-styling-config/index.css";

:root {
  /* Override primary color */
  --primary: oklch(0.5 0.2 250); /* Your custom color */
  
  /* Override sidebar background */
  --sidebar: oklch(0.15 0 0); /* Dark sidebar */
}

.dark {
  /* Override dark mode primary */
  --primary: oklch(0.7 0.2 250);
}
```

**Note:** Your overrides must come **after** the import to take effect.

## Package Structure

```
@kaijudo/react-styling-config/
├── src/
│   ├── index.css      # Complete setup (includes Tailwind import)
│   ├── theme.css      # Variables and theme only (no Tailwind import)
│   └── base.css       # Base styles only
├── package.json       # Exports CSS files directly from src/
└── README.md          # This file
```

## Package Exports

The package exports CSS files directly:

```json
{
  "exports": {
    "./index.css": "./src/index.css",
    "./theme.css": "./src/theme.css",
    "./base.css": "./src/base.css"
  }
}
```

Import using:
- `@kaijudo/react-styling-config/index.css`
- `@kaijudo/react-styling-config/theme.css`
- `@kaijudo/react-styling-config/base.css`

## Why This Package Exists

1. **No Duplication**: Single source of truth for theme variables across all @kaijudo packages
2. **Easy Setup**: One import for complete configuration
3. **Flexible**: Import only what you need
4. **No Dependencies**: Pure CSS, no JavaScript bundle, zero runtime cost
5. **Version Control**: All apps use the same theme version
6. **Type Safety**: Works with TypeScript projects
7. **Framework Agnostic**: Works with any framework that supports CSS imports

## Related Packages

This package is used by all @kaijudo React component packages:

- `@kaijudo/react-sidebar` - Sidebar component
- `@kaijudo/react-card` - Card component
- Other `@kaijudo/*` component packages

## Migration from Manual Setup

If you have existing CSS variables, you can migrate:

1. **Replace variable definitions:**
   ```css
   /* Before */
   :root {
     --background: oklch(1 0 0);
     --foreground: oklch(0.141 0.005 285.823);
     /* ... many more variables ... */
   }
   
   /* After */
   @import "@kaijudo/react-styling-config/theme.css";
   ```

2. **Remove duplicate `@theme inline` blocks:**
   ```css
   /* Before */
   @theme inline {
     --color-background: var(--background);
     /* ... many more ... */
   }
   
   /* After */
   @import "@kaijudo/react-styling-config/theme.css";
   /* Already includes @theme inline */
   ```

3. **Keep app-specific customizations:**
   ```css
   @import "@kaijudo/react-styling-config/index.css";
   
   :root {
     /* Your custom overrides */
     --custom-color: oklch(0.5 0.2 250);
   }
   ```

## Troubleshooting

### Components Not Styled

**Check:**
1. ✅ Tailwind plugin in `vite.config.ts`?
2. ✅ `@import '@kaijudo/react-styling-config/index.css'` in CSS?
3. ✅ CSS file imported in your app entry point?
4. ✅ Peer dependencies installed?

**Fix:**
```bash
# Install peer dependencies
pnpm add tailwindcss@^4.0.0 @tailwindcss/vite@^4.0.0

# Clear cache and rebuild
rm -rf node_modules/.vite
pnpm install
```

### Wrong Colors

**Solution:** Override CSS variables in your app's CSS file (after the import).

### TypeScript Errors

**Solution:** The package exports CSS files, not TypeScript. Import in CSS files, not TypeScript.

## See Also

- [Package Shipping Strategy](../../docs/PACKAGE_SHIPPING_STRATEGY.md) - How @kaijudo packages are shipped
- [shadcn Component Packages](../../docs/SHADCN_COMPONENT_PACKAGES.md) - Architecture overview
