# @kaijudo/react-card-images

Image assets for Duel Master card creatures and spells.

## Efficient Image Consumption

This package is optimized for **tree-shaking** - when you import a single image, only that image is downloaded/bundled, not all images in the package.

## Usage

### Method 1: Direct Path Import (Recommended - Best Tree-shaking)

Import images directly from the package path. This provides the best tree-shaking because bundlers can statically analyze which images are used.

```tsx
// Import a single creature image
import mieleImage from "@kaijudo/react-card-images/creatures/miele-vizier-of-lightning.png";

// Import a single spell image
import brainSerum from "@kaijudo/react-card-images/spells/brain-serum.png";

// Use in component
<img src={mieleImage} alt="Miele Vizier" />;
```

**With Vite/Webpack:** You can also use the `?url` suffix to get the URL string:

```tsx
import mieleImageUrl from "@kaijudo/react-card-images/creatures/miele-vizier-of-lightning.png?url";
// mieleImageUrl is a string URL
```

### Method 2: Named Exports (Convenience)

Import from the main export. Only the imported images are bundled.

```tsx
import { mieleVizierOfLightning } from "@kaijudo/react-card-images";

<img src={mieleVizierOfLightning} alt="Miele Vizier" />;
```

**Note:** Method 1 (direct path import) provides better tree-shaking because bundlers can statically analyze the import path.

## How It Works

1. **Images are NOT bundled into JavaScript** - They remain as separate PNG files
2. **Package exports expose image directories** - `./creatures/*` and `./spells/*` are exposed via `package.json` exports
3. **Bundler handles images at build time** - Vite/Webpack processes images when they're imported
4. **Only imported images are included** - Unused images are tree-shaken away

## Available Images

### Creatures

- `miele-vizier-of-lightning.png`
- `astrocomet-dragon.png`
- `boltail-dragon.png`
- `deadly-fighter-braid-claw.png`
- `explosive-fighter-ucarn.png`
- `fatal-attacker-horvath.png`
- `fonch-the-oracle.png`
- `gigastand.png`
- `greatest-earth-planetary-dragon.png`
- `grim-soul-shadow-of-reversal.png`
- `immortal-baron-vorg.png`
- `larba-geer-the-immaculate.png`
- `marrow-ooze-the-twister.png`
- `metalwing-skyterror.png`
- `pyrofighter-magnus.png`
- `rimuel-cloudbreaker-elemental.png`
- `ripple-lotus-q.png`
- `stardust-nex-elemental-dragon-knight.png`
- `supernova-pluto-deathbringer.png`
- `techno-totem.png`

### Spells

- `brain-serum.png`
- `crystal-memory.png`
- `holy-awe.png`
- `laser-wing.png`
- `moonlight-flash.png`
- `solar-ray.png`
- `sonic-wing.png`

## Adding New Images

1. Add image files to the appropriate directory:

   - `src/creatures/` for creature images
   - `src/spells/` for spell images

2. Optionally export them in `src/index.ts`:

   ```ts
   export { default as newCreature } from "./creatures/new-creature.png";
   ```

3. Images are automatically copied to `dist/` during build

4. Import directly:
   ```tsx
   import newCreature from "@kaijudo/react-card-images/creatures/new-creature.png";
   ```

## Tree-shaking Guarantee

✅ **Only imported images are bundled** - If you import 1 image, only 1 image is included in your bundle  
✅ **No JavaScript overhead** - Images are separate files, not embedded in JS  
✅ **Works in workspace and published packages** - Supports both `workspace:*` and npm registry imports
