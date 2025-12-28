import type { Meta, StoryObj } from "@storybook/react";
import { ComponentPage, MarkdownContent } from "@kaijudo/react-storybook";
import { DropdownMenu } from "../../src/dropdown-menu";
import { Examples } from "./Examples";

const meta = {
  title: "Components/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"], // This story IS the docs page
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docsOnly: true, // Only show in docs, not as separate story
  },
  render: () => (
    <ComponentPage
      name="DropdownMenu"
      description="Displays a menu to the user — such as a set of actions or functions — triggered by a button. Built on top of Radix UI's DropdownMenu primitive with shadcn/ui styling."
      examples={<Examples />}
    >
      <div className="min-h-screen bg-white"></div>
    </ComponentPage>
  ),
};

