import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function copyImagesRecursively(srcDir: string, distDir: string, subPath: string = '') {
  const currentSrcDir = join(srcDir, subPath);
  const currentDistDir = join(distDir, subPath);
  let copiedCount = 0;

  if (!existsSync(currentSrcDir)) return copiedCount;

  const entries = readdirSync(currentSrcDir);

  for (const entry of entries) {
    const srcPath = join(currentSrcDir, entry);
    const distPath = join(currentDistDir, entry);
    const relativePath = join(subPath, entry);

    if (statSync(srcPath).isDirectory()) {
      // Recursively copy subdirectories
      if (!existsSync(distPath)) {
        mkdirSync(distPath, { recursive: true });
      }
      copiedCount += copyImagesRecursively(srcDir, distDir, relativePath);
    } else if (entry.endsWith('.png')) {
      // Copy PNG files
      if (!existsSync(currentDistDir)) {
        mkdirSync(currentDistDir, { recursive: true });
      }
      copyFileSync(srcPath, distPath);
      copiedCount++;
    }
  }

  return copiedCount;
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    // Only generate types for .ts files, skip image imports
    resolve: true,
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  outDir: 'dist',
  // Don't bundle images - they're copied separately
  loader: {
    '.png': 'copy',
  },
  // Don't bundle - let the consuming app handle images
  // This allows tree-shaking at the app level
  noExternal: [],
  onSuccess: async () => {
    // Copy all PNG images from src to dist, preserving directory structure
    const distDir = join(process.cwd(), 'dist');
    const srcDir = join(process.cwd(), 'src');
    
    const copiedCount = copyImagesRecursively(srcDir, distDir);
    console.log(`✓ Copied ${copiedCount} image(s) to dist/`);
  },
});

