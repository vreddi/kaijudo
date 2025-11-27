# @kaijudo/creature-images

Image assets for Duel Master card creatures.

## Usage

Import individual creature images directly to enable tree-shaking. Only the imported image will be bundled, not the entire package.

### Direct Image Import (Recommended for Tree-shaking)

```tsx
// In your web project, import images directly with ?url suffix
import exampleCreature from '@kaijudo/creature-images/creatures/example-creature.png?url';

// Use in component
<img src={exampleCreature} alt="Example Creature" />
```

### Named Export Import (Alternative)

```tsx
// If exported from index.ts
import { exampleCreature } from '@kaijudo/creature-images';
```

**Note:** The direct import method (`/creatures/*.png?url`) provides better tree-shaking because Vite can statically analyze which images are actually used.

## Adding Images

1. Add image files to `src/creatures/` directory (e.g., `src/creatures/fire-dragon.png`)
2. Optionally export them in `src/index.ts` for convenience:

```ts
export { default as fireDragon } from './creatures/fire-dragon.png';
```

3. Import directly in your code:

```tsx
import fireDragon from '@kaijudo/creature-images/creatures/fire-dragon.png?url';
```

## Tree-shaking

This package is configured for optimal tree-shaking:
- Images are not bundled into the package build
- Each image import is resolved at build time by the consuming app (web project)
- Only imported images are included in the final bundle
- The `?url` suffix tells Vite to treat images as static assets

