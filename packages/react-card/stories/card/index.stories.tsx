import type { Meta, StoryObj } from "@storybook/react";
import { ComponentPage, MarkdownContent } from "@kaijudo/react-storybook";
import { Card } from "../../src/Card";
import { Examples } from "./Examples";
import changelogContent from "../../CHANGELOG.md?raw";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"], // This story IS the docs page
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docsOnly: true, // Only show in docs, not as separate story
  },
  render: () => (
    <ComponentPage
      name="Card"
      description="A flexible card component for displaying content with optional holographic effects and creature images. Perfect for game cards, creature displays, and interactive content."
      examples={<Examples />}
      changelogs={<MarkdownContent content={changelogContent} />}
    >
      <div className="min-h-screen bg-white"></div>
    </ComponentPage>
  ),
};
