import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";

// Get workspace root path
const workspaceRoot = path.resolve(__dirname, "../../..");

const config: StorybookConfig = {
  stories: [
    // Consume index.stories.tsx at any level under stories/ directory
    // Path is relative to workspace root
    `${workspaceRoot}/packages/*/stories/**/index.stories.@(js|jsx|mjs|ts|tsx)`,
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
    autodocs: "tag",
  },
  async viteFinal(config) {
    // Dynamic imports to avoid ESM/CommonJS conflicts
    const { mergeConfig } = await import("vite");
    const { default: tailwindcss } = await import("@tailwindcss/vite");
    const viteTsConfigPaths = (await import("vite-tsconfig-paths")).default;

    return mergeConfig(config, {
      plugins: [
        tailwindcss(),
        viteTsConfigPaths({
          projects: [path.resolve(__dirname, "../../../tsconfig.json")],
          ignoreConfigErrors: true, // Ignore missing referenced tsconfig files (tools/tsconfig.json)
        }),
      ],
      resolve: {
        alias: {
          // Alias workspace packages to their source for Tailwind scanning
          "@kaijudo/react-storybook": path.resolve(
            __dirname,
            "../../../packages/react-storybook/src"
          ),
          "@kaijudo/react-card-images": path.resolve(
            __dirname,
            "../../../packages/react-card-images/src"
          ),
          "@kaijudo/react-card": path.resolve(
            __dirname,
            "../../../packages/react-card/src"
          ),
          // Alias for styling config CSS imports
          "@kaijudo/react-styling-config": path.resolve(
            __dirname,
            "../../../packages/react-styling-config/src"
          ),
        },
      },
      server: {
        fs: {
          // Allow serving files from workspace root
          allow: [workspaceRoot],
        },
      },
    });
  },
};

export default config;
