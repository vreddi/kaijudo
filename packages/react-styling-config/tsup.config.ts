import { defineConfig } from "tsup";
import { copyFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: {
    resolve: true,
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  // This package only exports CSS files, no JS dependencies to externalize
  // CSS files are exported directly from src/ via package.json exports
  tsconfig: "./tsconfig.lib.json",
  // Copy CSS files to dist so they're available after build
  onSuccess: async () => {
    const cssFiles = ["theme.css", "base.css", "index.css"];
    const distDir = join(process.cwd(), "dist");

    // Ensure dist directory exists
    if (!existsSync(distDir)) {
      mkdirSync(distDir, { recursive: true });
    }

    // Copy CSS files to dist
    cssFiles.forEach((file) => {
      const srcPath = join(process.cwd(), "src", file);
      const distPath = join(distDir, file);
      if (existsSync(srcPath)) {
        copyFileSync(srcPath, distPath);
        console.log(`✓ Copied ${file} to dist/`);
      }
    });
  },
});
