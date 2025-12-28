import type { Meta, StoryObj } from "@storybook/react";
import { ComponentPage, MarkdownContent } from "@kaijudo/react-storybook";
import { Header } from "../../src/Header";
import { Examples } from "./Examples";

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"], // This story IS the docs page
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docsOnly: true, // Only show in docs, not as separate story
  },
  render: () => (
    <ComponentPage
      name="Header"
      description="A configurable header component with transparent background support and ProfileDropdown integration. Perfect for application headers that need to overlay content or provide user profile access."
      examples={<Examples />}
    >
      <div className="min-h-screen bg-white"></div>
    </ComponentPage>
  ),
};

