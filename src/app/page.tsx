"use client";

import { GameCard } from "@/components/composite/gameCard";
import { DebugGameCard } from "@/components/composite/gameCard/gameCard";
export default function Home() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <GameCard img="https://images.pokemontcg.io/sm115/7_hires.png" />
    </div>
  );
}
