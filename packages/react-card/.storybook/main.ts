import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

const config: StorybookConfig = {
  stories: [
    "../stories/**/*.@(js|jsx|mjs|ts|tsx|mdx)",
    "!../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag", // Only generate docs for stories with "autodocs" tag
  },
  async viteFinal(config) {
    // Dynamic imports to avoid ESM/CommonJS conflicts
    const { mergeConfig } = await import("vite");
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    const viteTsConfigPaths = (await import("vite-tsconfig-paths")).default;

    const workspaceRoot = path.resolve(__dirname, "../../..");

    return mergeConfig(config, {
      plugins: [
        tailwindcss(),
        viteTsConfigPaths({
          projects: [path.resolve(__dirname, "../tsconfig.json")],
        }),
      ],
      resolve: {
        alias: {
          "@kaijudo/creature-images": path.resolve(
            __dirname,
            "../../creature-images/src"
          ),
          "@kaijudo/react-storybook": path.resolve(
            __dirname,
            "../../react-storybook/src"
          ),
          // Alias for styling config CSS imports
          "@kaijudo/react-styling-config": path.resolve(
            __dirname,
            "../../react-styling-config/src"
          ),
        },
      },
      server: {
        fs: {
          // Allow serving files from workspace root so Tailwind can scan workspace packages
          allow: [workspaceRoot],
        },
      },
    });
  },
};

export default config;
