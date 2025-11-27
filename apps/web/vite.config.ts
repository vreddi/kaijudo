import { defineConfig } from "vite";

export default defineConfig(async ({ command }) => {
  // Lazy load all plugins to avoid ESM/CommonJS conflicts during config loading
  const [
    { devtools },
    { tanstackStart },
    { default: viteReact },
    { default: viteTsConfigPaths },
    { default: tailwindcss },
  ] = await Promise.all([
    import("@tanstack/devtools-vite"),
    import("@tanstack/react-start/plugin/vite"),
    import("@vitejs/plugin-react"),
    import("vite-tsconfig-paths"),
    import("@tailwindcss/vite"),
  ]);

  const plugins: any[] = [
    devtools(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ];

  // Only add Cloudflare plugin for dev/build, skip for preview
  const isPreview = process.argv.includes("preview");

  if (!isPreview) {
    try {
      const { cloudflare } = await import("@cloudflare/vite-plugin");
      const { existsSync } = await import("fs");
      const { join } = await import("path");
      const wranglerConfigExists = existsSync(
        join(process.cwd(), ".wrangler/deploy/config.json")
      );
      if (wranglerConfigExists) {
        plugins.splice(1, 0, cloudflare({ viteEnvironment: { name: "ssr" } }));
      }
    } catch (e) {
      // Cloudflare plugin not available or has issues, continue without it
    }
  }

  return {
    plugins,
    optimizeDeps: {
      exclude: ["xmlbuilder2"],
    },
  };
});
