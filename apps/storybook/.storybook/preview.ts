import type { Preview } from "@storybook/react";
import "./preview.css";

// Import component CSS files to ensure they're loaded
import "../../../packages/react-card/src/Card.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#1a1a1a",
        },
      ],
    },
    layout: "fullscreen",
  },
};

export default preview;
