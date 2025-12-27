## 0.1.0 (2025-12-27)

### 🚀 Features

- # Initial Public Release: Card Image Assets ([6b76633](https://github.com/vreddi/kaijudo/commit/6b76633))

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