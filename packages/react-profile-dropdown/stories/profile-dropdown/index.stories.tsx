import type { Meta, StoryObj } from "@storybook/react";
import { ComponentPage, MarkdownContent } from "@kaijudo/react-storybook";
import ProfileDropdown from "../../src/profile-dropdown/ProfileDropdown";
import { Examples } from "./Examples";
import changelogContent from "../../CHANGELOG.md?raw";

const meta = {
  title: "Components/ProfileDropdown",
  component: ProfileDropdown,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"], // This story IS the docs page
} satisfies Meta<typeof ProfileDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docsOnly: true, // Only show in docs, not as separate story
  },
  render: () => (
    <ComponentPage
      name="ProfileDropdown"
      description="Menu dropdown with action buttons. Built on top of shadcn/ui DropdownMenu component with KokonutUI styling."
      examples={<Examples />}
      changelogs={<MarkdownContent content={changelogContent} />}
    >
      <div className="min-h-screen bg-white"></div>
    </ComponentPage>
  ),
};

