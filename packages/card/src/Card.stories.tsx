import type { Meta, StoryObj } from "@storybook/react";
import { Card } from "./Card";
import { CardContent } from "./CardContent";
import { CardHeader } from "./CardHeader";
import mieleImage from "@kaijudo/creature-images/creatures/miele-vizier-of-lightning.png?url";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    holographic: {
      control: "boolean",
      description: "Enable holographic effect",
    },
    variant: {
      control: "select",
      options: ["default", "holo", "reverse-holo", "rainbow"],
      description: "Card variant style",
    },
    imageSrc: {
      control: "text",
      description: "Image source URL",
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>Fire Dragon</CardHeader>
        <CardContent>
          <p className="text-sm">A powerful fire-breathing creature</p>
        </CardContent>
      </>
    ),
    imageSrc:
      "https://via.placeholder.com/350x490/FF6B6B/FFFFFF?text=Fire+Dragon",
    imageAlt: "Fire Dragon",
    holographic: true,
    variant: "holo",
  },
};

export const WithoutHolographic: Story = {
  args: {
    children: (
      <>
        <CardHeader>Water Elemental</CardHeader>
        <CardContent>
          <p className="text-sm">A mystical water creature</p>
        </CardContent>
      </>
    ),
    imageSrc:
      "https://via.placeholder.com/350x490/4ECDC4/FFFFFF?text=Water+Elemental",
    imageAlt: "Water Elemental",
    holographic: false,
  },
};

export const ReverseHolo: Story = {
  args: {
    children: (
      <>
        <CardHeader>Lightning Bolt</CardHeader>
        <CardContent>
          <p className="text-sm">Electric energy card</p>
        </CardContent>
      </>
    ),
    imageSrc:
      "https://via.placeholder.com/350x490/FFE66D/000000?text=Lightning",
    imageAlt: "Lightning Bolt",
    holographic: true,
    variant: "reverse-holo",
  },
};

export const Rainbow: Story = {
  args: {
    children: (
      <>
        <CardHeader>Rainbow Unicorn</CardHeader>
        <CardContent>
          <p className="text-sm">A magical rainbow creature</p>
        </CardContent>
      </>
    ),
    imageSrc: "https://via.placeholder.com/350x490/FF6B9D/FFFFFF?text=Rainbow",
    imageAlt: "Rainbow Unicorn",
    holographic: true,
    variant: "rainbow",
  },
};

export const MieleVizierOfLightning: Story = {
  args: {
    children: (
      <>
        <CardHeader>Miele, Vizier of Lightning</CardHeader>
        <CardContent>
          <p className="text-xs font-semibold mb-1">INITIATE</p>
          <p className="text-xs mb-2">
            When you put this creature into the battle zone, you may choose 1 of
            your opponent's creatures in the battle zone and tap it.
          </p>
          <p className="text-sm font-bold mt-2">Power: 1000</p>
        </CardContent>
      </>
    ),
    imageSrc: mieleImage,
    imageAlt: "Miele, Vizier of Lightning",
    holographic: true,
    variant: "holo",
  },
};
