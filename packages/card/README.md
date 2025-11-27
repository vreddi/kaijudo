# @kaijudo/react-card

A React component library for creating holographic trading card effects, inspired by Pokemon Trading Cards.

## Features

- ✨ Holographic card effects with mouse interaction
- 🎨 Multiple variant styles (holo, reverse-holo, rainbow)
- 🎯 Built with Tailwind CSS (no CSS bundle included)
- 📦 Tree-shakeable and optimized
- 🎭 Storybook support for development

## Installation

```bash
pnpm add @kaijudo/react-card
```

## Prerequisites

This package requires consumers to have:

1. **Tailwind CSS v4+** installed and configured
2. **React 19+** installed

### Setting up Tailwind CSS

If you haven't set up Tailwind CSS yet:

```bash
pnpm add -D tailwindcss
npx tailwindcss init
```

Add to your `tailwind.config.js`:

```js
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@kaijudo/react-card/**/*.{js,ts,jsx,tsx}", // Include card package
  ],
  // ... rest of config
}
```

### Setting up shadcn/ui (Optional)

If you want to use shadcn/ui components alongside:

```bash
npx shadcn@latest init
```

The card component works independently but can be styled to match shadcn/ui themes.

## Usage

### Basic Example

```tsx
import { Card, CardHeader, CardContent } from '@kaijudo/react-card';
import creatureImage from '@kaijudo/creature-images/creatures/fire-dragon.png?url';

function App() {
  return (
    <Card imageSrc={creatureImage} imageAlt="Fire Dragon" variant="holo">
      <CardHeader>Fire Dragon</CardHeader>
      <CardContent>
        <p>A powerful fire-breathing creature</p>
      </CardContent>
    </Card>
  );
}
```

### Without Holographic Effect

```tsx
<Card imageSrc={imageSrc} holographic={false}>
  <CardContent>Simple card</CardContent>
</Card>
```

### Different Variants

```tsx
{/* Standard holo effect */}
<Card variant="holo" imageSrc={imageSrc}>...</Card>

{/* Reverse holo effect */}
<Card variant="reverse-holo" imageSrc={imageSrc}>...</Card>

{/* Rainbow effect */}
<Card variant="rainbow" imageSrc={imageSrc}>...</Card>
```

## Components

### Card

Main card component with holographic effects.

**Props:**
- `children` - Card content (typically CardHeader and CardContent)
- `imageSrc` - Image URL for the card
- `imageAlt` - Alt text for the image
- `holographic` - Enable/disable holographic effect (default: `true`)
- `variant` - Card variant: `'default' | 'holo' | 'reverse-holo' | 'rainbow'`
- `className` - Additional CSS classes

### CardHeader

Header component for card titles.

### CardContent

Content wrapper for card body text.

## Styling

The component uses Tailwind CSS classes that will be processed by your Tailwind setup. The package includes a small CSS file (`Card.css`) for complex holographic animations that can't be achieved with Tailwind alone.

### Importing the CSS

The CSS file contains animations needed for the holographic effects. Import it in your app's entry point:

```tsx
// In your main.tsx or App.tsx
import '@kaijudo/react-card/styles';
// or
import '@kaijudo/react-card/dist/Card.css';
```

Or add it to your main CSS file:

```css
@import '@kaijudo/react-card/styles';
```

### Customization

To customize the card:

1. Override with your own Tailwind classes via `className` prop
2. Use Tailwind's `@apply` directive in your CSS
3. Extend Tailwind config with custom colors/effects
4. Override the CSS variables or animations in your own CSS

## Development

```bash
# Build the package
pnpm build

# Run Storybook
pnpm storybook

# Run tests
pnpm test
```

## Inspiration

This component is inspired by the [Pokemon Cards CSS Holographic effect](https://github.com/simeydotme/pokemon-cards-css) by [@simeydotme](https://github.com/simeydotme).

