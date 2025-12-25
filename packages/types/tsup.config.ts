import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'tailwindcss'],
  // Copy CSS files to dist
  loader: {
    '.css': 'copy',
  },
  // Include CSS in the bundle output
  publicDir: false,
  tsconfig: './tsconfig.lib.json',
});

