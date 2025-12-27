## 0.1.1 (2025-12-27)

### 🩹 Fixes

- # Patch Release: New Creature and Spell Images ([a815195](https://github.com/vreddi/kaijudo/commit/a815195))

  Added 4 new card images to the package.

  ## New Images

  ### Creatures (3):
  - **Burning Mane** - New creature card image
  - **Deathblade Beetle** - New creature card image
  - **Roaring Great Horn** - New creature card image

  ### Spells (1):
  - **Aura Blast** - New spell card image

  All images are exported from index.ts and available for tree-shaking imports. The package now includes 30 creature images and 8 spell images total.

### ❤️ Thank You

- Vishrut Reddi @vreddi

## 0.1.0 (2025-12-27)

### 🚀 Features

- # Initial Public Release: Card Image Assets ([8a13cbd](https://github.com/vreddi/kaijudo/commit/8a13cbd))

  Initial public release of the card image assets package.

  ## Features

  - **27 Creature Images**: High-quality PNG images for Duel Masters creatures
  - **7 Spell Images**: Spell card images
  - **Tree-shaking Optimized**: Only imported images are bundled
  - **Direct Path Imports**: Support for importing images directly from package paths
  - **TypeScript Definitions**: Complete type definitions for all image exports
  - **Efficient Distribution**: Images copied to dist/ during build for optimal consumption

  ## Technical Details

  - Images are NOT bundled into JavaScript - remain as separate files
  - Package exports expose `./creatures/*` and `./spells/*` directories
  - Supports both named exports and direct path imports
  - Optimized for workspace and npm registry consumption

### ❤️ Thank You

- Vishrut Reddi @vreddi