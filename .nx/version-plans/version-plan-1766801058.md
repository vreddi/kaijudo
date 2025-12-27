---
"@kaijudo/react-card": minor
"@kaijudo/react-card-images": minor
"@kaijudo/react-game-types": patch
---

# Release: Card Components and Image Assets

## @kaijudo/react-card (v0.1.0)

Initial public release of the Card component package.

### Features
- **Card Component**: Holographic card component with Pokemon-style foil effects
- **Size Support**: Dynamic card sizing based on game zones (Hand, Battlefield, Graveyard, etc.)
- **Zone Transitions**: Smooth size transitions when cards move between zones
- **Drag and Drop**: Full drag-and-drop support using @dnd-kit
- **DraggableCard Component**: Wrapper component for drag-and-drop functionality
- **Multiple Variants**: Support for default, holo, reverse-holo, and rainbow variants
- **Storybook Integration**: Complete Storybook setup with examples and draggable demos

### Technical Details
- Built with Tailwind CSS v4
- Uses peer dependencies for optimal tree-shaking
- Supports all CardSize enum values with automatic transitions
- TypeScript support with full type definitions

## @kaijudo/react-card-images (v0.1.0)

Initial public release of the card image assets package.

### Features
- **27 Creature Images**: High-quality PNG images for Duel Masters creatures
- **7 Spell Images**: Spell card images
- **Tree-shaking Optimized**: Only imported images are bundled
- **Direct Path Imports**: Support for importing images directly from package paths
- **TypeScript Definitions**: Complete type definitions for all image exports
- **Efficient Distribution**: Images copied to dist/ during build for optimal consumption

### Technical Details
- Images are NOT bundled into JavaScript - remain as separate files
- Package exports expose `./creatures/*` and `./spells/*` directories
- Supports both named exports and direct path imports
- Optimized for workspace and npm registry consumption

## @kaijudo/react-game-types (v0.4.1)

Patch release with minor updates.

### Changes
- Updated package dependencies
- Minor configuration improvements

