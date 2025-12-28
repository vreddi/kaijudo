import type { Meta, StoryObj } from "@storybook/react";
import { ComponentPage, MarkdownContent } from "@kaijudo/react-storybook";
import { Avatar } from "../../src/avatar";
import { Examples } from "./Examples";
import changelogContent from "../../CHANGELOG.md?raw";

const meta = {
  title: "Components/Avatar",
  component: Avatar,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"], // This story IS the docs page
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docsOnly: true, // Only show in docs, not as separate story
  },
  render: () => (
    <ComponentPage
      name="Avatar"
      description="An image element with a fallback for representing the user. Built on top of Radix UI's Avatar primitive with shadcn/ui styling."
      examples={<Examples />}
      changelogs={<MarkdownContent content={changelogContent} />}
    >
      <div className="min-h-screen bg-white"></div>
    </ComponentPage>
  ),
};

