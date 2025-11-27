// Export individual creature images for tree-shaking
// Each import will only load the specific image file
// Use ?url suffix in consuming projects: import exampleCreature from '@kaijudo/creature-images/creatures/example-creature.png?url'

// Re-export images as named exports for convenience
// When importing from '@kaijudo/creature-images', only the imported image is bundled

export { default as mieleVizierOfLightning } from "./creatures/miele-vizier-of-lightning.png";
