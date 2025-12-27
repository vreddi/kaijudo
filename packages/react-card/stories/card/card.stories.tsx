import React, { useState } from "react";
import { StoryObj } from "@storybook/react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import { Card, CardProps } from "../../src";
import { DraggableCard } from "../../src/DraggableCard";
import { mieleVizierOfLightning } from "@kaijudo/react-card-images";
import { boltailDragon } from "@kaijudo/react-card-images";
import { gigastand } from "@kaijudo/react-card-images";
import { aquaHulcus } from "@kaijudo/react-card-images";
import { bronzeArmTribe } from "@kaijudo/react-card-images";
import { CardSize } from "../../src/types/cardSize";

type Story = StoryObj<CardProps>;

export const Default: Story = {
  args: {
    size: CardSize.Small,
  },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
      <Card {...args} imageSrc={mieleVizierOfLightning} />
      <Card {...args} imageSrc={boltailDragon} />
      <Card {...args} imageSrc={gigastand} />
      <Card {...args} imageSrc={aquaHulcus} />
      <Card {...args} imageSrc={bronzeArmTribe} />
    </div>
  ),
};

interface CardData {
  id: string;
  imageSrc: string;
  name: string;
  zone: CardSize;
}

const initialCards: CardData[] = [
  {
    id: "1",
    imageSrc: mieleVizierOfLightning,
    name: "Miele",
    zone: CardSize.Hand,
  },
  { id: "2", imageSrc: boltailDragon, name: "Boltail", zone: CardSize.Hand },
  {
    id: "3",
    imageSrc: gigastand,
    name: "Gigastand",
    zone: CardSize.Battlefield,
  },
  { id: "4", imageSrc: aquaHulcus, name: "Aqua", zone: CardSize.Graveyard },
];

const zoneLabels: Record<CardSize, string> = {
  [CardSize.Small]: "Small",
  [CardSize.Medium]: "Medium",
  [CardSize.Large]: "Large",
  [CardSize.Hand]: "Hand",
  [CardSize.Deck]: "Deck",
  [CardSize.Graveyard]: "Graveyard",
  [CardSize.Library]: "Library",
  [CardSize.Exile]: "Exile",
  [CardSize.Stack]: "Stack",
  [CardSize.ManaZone]: "Mana Zone",
  [CardSize.Battlefield]: "Battlefield",
};

function DroppableZone({
  id,
  label,
  children,
  isActive,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  isActive: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        min-h-[300px] p-6 rounded-lg border-2 border-dashed
        transition-all duration-300
        ${isActive ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-white"}
      `}
    >
      <h3 className="text-lg font-semibold mb-4">{label}</h3>
      <div className="flex flex-wrap gap-4">{children}</div>
    </div>
  );
}

export const DragBetweenZones: Story = {
  render: () => {
    const [cards, setCards] = useState<CardData[]>(initialCards);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeCard, setActiveCard] = useState<CardData | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
      const { active } = event;
      const card = cards.find((c) => c.id === active.id);
      setActiveId(active.id as string);
      setActiveCard(card || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setActiveCard(null);

      if (!over) return;

      const newZone = over.id as CardSize;
      if (!Object.values(CardSize).includes(newZone)) return;

      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === active.id ? { ...card, zone: newZone } : card
        )
      );
    };

    // Group cards by zone
    const cardsByZone = cards.reduce((acc, card) => {
      if (!acc[card.zone]) acc[card.zone] = [];
      acc[card.zone].push(card);
      return acc;
    }, {} as Record<CardSize, CardData[]>);

    const zones = [
      CardSize.Hand,
      CardSize.Battlefield,
      CardSize.Graveyard,
      CardSize.Stack,
    ];

    return (
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="p-8 space-y-8 bg-gray-100 min-h-screen">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
              Drag Cards Between Zones
            </h2>
            <p className="text-gray-600">
              Drag cards from one zone to another. Cards will transition in size
              when moved between zones.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {zones.map((zone) => (
              <DroppableZone
                key={zone}
                id={zone}
                label={zoneLabels[zone]}
                isActive={activeId !== null}
              >
                {cardsByZone[zone]?.map((card) => (
                  <DraggableCard
                    key={card.id}
                    id={card.id}
                    imageSrc={card.imageSrc}
                    imageAlt={card.name}
                    size={zone}
                    data={{ card }}
                  />
                ))}
                {(!cardsByZone[zone] || cardsByZone[zone].length === 0) && (
                  <div className="text-gray-400 text-sm">Drop cards here</div>
                )}
              </DroppableZone>
            ))}
          </div>

          <DragOverlay>
            {activeCard && (
              <Card
                imageSrc={activeCard.imageSrc}
                imageAlt={activeCard.name}
                size={activeCard.zone}
                className="opacity-90 rotate-6 scale-110"
              />
            )}
          </DragOverlay>
        </div>
      </DndContext>
    );
  },
};
