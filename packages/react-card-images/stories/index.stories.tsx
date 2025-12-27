import React, { useState, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { UtilityPage } from "@kaijudo/react-storybook";

// Import all creature images
import mieleVizierOfLightning from "../src/creatures/miele-vizier-of-lightning.png";
import astrocometDragon from "../src/creatures/astrocomet-dragon.png";
import boltailDragon from "../src/creatures/boltail-dragon.png";
import deadlyFighterBraidClaw from "../src/creatures/deadly-fighter-braid-claw.png";
import explosiveFighterUcarn from "../src/creatures/explosive-fighter-ucarn.png";
import fatalAttackerHorvath from "../src/creatures/fatal-attacker-horvath.png";
import fonchTheOracle from "../src/creatures/fonch-the-oracle.png";
import gigastand from "../src/creatures/gigastand.png";
import greatestEarthPlanetaryDragon from "../src/creatures/greatest-earth-planetary-dragon.png";
import grimSoulShadowOfReversal from "../src/creatures/grim-soul-shadow-of-reversal.png";
import immortalBaronVorg from "../src/creatures/immortal-baron-vorg.png";
import larbaGeerTheImmaculate from "../src/creatures/larba-geer-the-immaculate.png";
import marrowOozeTheTwister from "../src/creatures/marrow-ooze-the-twister.png";
import metalwingSkyterror from "../src/creatures/metalwing-skyterror.png";
import pyrofighterMagnus from "../src/creatures/pyrofighter-magnus.png";
import rimuelCloudbreakerElemental from "../src/creatures/rimuel-cloudbreaker-elemental.png";
import rippleLotusQ from "../src/creatures/ripple-lotus-q.png";
import stardustNexElementalDragonKnight from "../src/creatures/stardust-nex-elemental-dragon-knight.png";
import supernovaPlutoDeathbringer from "../src/creatures/supernova-pluto-deathbringer.png";
import technoTotem from "../src/creatures/techno-totem.png";

// Import all spell images
import brainSerum from "../src/spells/brain-serum.png";
import crystalMemory from "../src/spells/crystal-memory.png";
import holyAwe from "../src/spells/holy-awe.png";
import laserWing from "../src/spells/laser-wing.png";
import moonlightFlash from "../src/spells/moonlight-flash.png";
import solarRay from "../src/spells/solar-ray.png";
import sonicWing from "../src/spells/sonic-wing.png";

type CardImage = {
  name: string;
  image: string;
  category: "creature" | "spell";
};

const allCards: CardImage[] = [
  { name: "Miele, Vizier of Lightning", image: mieleVizierOfLightning, category: "creature" },
  { name: "Astrocomet Dragon", image: astrocometDragon, category: "creature" },
  { name: "Boltail Dragon", image: boltailDragon, category: "creature" },
  { name: "Deadly Fighter Braid Claw", image: deadlyFighterBraidClaw, category: "creature" },
  { name: "Explosive Fighter Ucarn", image: explosiveFighterUcarn, category: "creature" },
  { name: "Fatal Attacker Horvath", image: fatalAttackerHorvath, category: "creature" },
  { name: "Fonch, the Oracle", image: fonchTheOracle, category: "creature" },
  { name: "Gigastand", image: gigastand, category: "creature" },
  { name: "Greatest Earth Planetary Dragon", image: greatestEarthPlanetaryDragon, category: "creature" },
  { name: "Grim Soul, Shadow of Reversal", image: grimSoulShadowOfReversal, category: "creature" },
  { name: "Immortal Baron Vorg", image: immortalBaronVorg, category: "creature" },
  { name: "Larba Geer, the Immaculate", image: larbaGeerTheImmaculate, category: "creature" },
  { name: "Marrow Ooze, the Twister", image: marrowOozeTheTwister, category: "creature" },
  { name: "Metalwing Skyterror", image: metalwingSkyterror, category: "creature" },
  { name: "Pyrofighter Magnus", image: pyrofighterMagnus, category: "creature" },
  { name: "Rimuel, Cloudbreaker Elemental", image: rimuelCloudbreakerElemental, category: "creature" },
  { name: "Ripple Lotus Q", image: rippleLotusQ, category: "creature" },
  { name: "Stardust Nex, Elemental Dragon Knight", image: stardustNexElementalDragonKnight, category: "creature" },
  { name: "Supernova Pluto, Deathbringer", image: supernovaPlutoDeathbringer, category: "creature" },
  { name: "Techno Totem", image: technoTotem, category: "creature" },
  { name: "Brain Serum", image: brainSerum, category: "spell" },
  { name: "Crystal Memory", image: crystalMemory, category: "spell" },
  { name: "Holy Awe", image: holyAwe, category: "spell" },
  { name: "Laser Wing", image: laserWing, category: "spell" },
  { name: "Moonlight Flash", image: moonlightFlash, category: "spell" },
  { name: "Solar Ray", image: solarRay, category: "spell" },
  { name: "Sonic Wing", image: sonicWing, category: "spell" },
];

const CardImageGallery: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "creature" | "spell">("all");

  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      const matchesSearch = card.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "all" || card.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            <option value="creature">Creatures</option>
            <option value="spell">Spells</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredCards.length} of {allCards.length} cards
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredCards.map((card) => (
          <div
            key={card.name}
            className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <img
              src={card.image}
              alt={card.name}
              className="w-full h-auto rounded shadow-md"
            />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">{card.name}</p>
              <span className="text-xs text-gray-500 capitalize">{card.category}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No cards found matching your search.
        </div>
      )}
    </div>
  );
};

const meta = {
  title: "Utilities/Card Images",
  component: UtilityPage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof UtilityPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImageGallery: Story = {
  render: () => (
    <UtilityPage
      name="Card Images"
      description="Browse and search through all available card images including creatures and spells. Use the search and filter options to find specific cards."
    >
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <CardImageGallery />
        </div>
      </div>
    </UtilityPage>
  ),
};

