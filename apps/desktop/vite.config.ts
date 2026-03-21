import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      'convex/react-clerk': path.resolve(
        __dirname,
        'node_modules/convex/dist/esm/react-clerk/index.js'
      ),
    },
  },

  // Vite options tailored for Tauri development
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: 'ws',
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // Tell Vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },

  build: {
    outDir: 'dist',
    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
    // Tauri uses Chromium on Windows and WebKit on macOS/Linux
    target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari14',
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // Recommended by Tauri for better performance
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
