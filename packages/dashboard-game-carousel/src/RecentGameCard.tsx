"use client";

import { motion } from "motion/react";
import { Card } from "@kaijudo/react-card";
import { cn } from "./utils";
import type { RecentGame } from "./GameCarousel";

export interface RecentGameCardProps {
  game: RecentGame;
  className?: string;
}

/**
 * RecentGameCard component
 * Displays a recent game with the trump card on the left (with auto-tilt animation) and stats on the right
 */
export function RecentGameCard({ game, className }: RecentGameCardProps) {
  // Guard against missing data
  if (!game || !game.trumpCard || !game.stats) {
    console.warn("RecentGameCard: Missing game data", { game });
    return null;
  }

  // Guard against missing imageSrc
  if (!game.trumpCard.imageSrc) {
    console.error("RecentGameCard: Missing trumpCard.imageSrc", game.trumpCard);
    return null;
  }

  return (
    <div
      className={cn(
        "bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-slate-400 uppercase tracking-wider">
          Recent Game
        </h3>
        <div
          className={cn(
            "text-xs px-2 py-1 rounded font-semibold",
            game.won
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          )}
        >
          {game.won ? "Victory" : "Defeat"}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Trump Card with Auto-Tilt Animation */}
        <div className="col-span-5 flex items-center justify-center">
          <motion.div
            animate={{
              rotateY: [0, 5, -5, 5, -5, 0],
              rotateX: [0, -2, 2, -2, 2, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
          >
            <Card
              imageSrc={game.trumpCard.imageSrc}
              imageAlt={game.trumpCard.name}
              holographic={true}
              variant="holo"
              className="w-[200px] h-[280px]"
            />
          </motion.div>
        </div>

        {/* Game Stats */}
        <div className="col-span-7 space-y-4">
          <div>
            <h4 className="text-2xl font-bold text-slate-100 mb-1">
              {game.trumpCard.name}
            </h4>
            <p className="text-sm text-slate-400">
              {typeof game.date === "string"
                ? game.date
                : game.date.toLocaleDateString()}
              {game.opponent && ` • vs ${game.opponent}`}
            </p>
          </div>

          {/* Card Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Power</div>
              <div className="text-lg font-semibold text-slate-200">
                {game.trumpCard.power}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Toughness</div>
              <div className="text-lg font-semibold text-slate-200">
                {game.trumpCard.toughness}
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Turns</div>
              <div className="text-lg font-semibold text-slate-200">
                {game.stats.turns}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Damage Dealt</div>
              <div className="text-lg font-semibold text-purple-400">
                {game.stats.damageDealt}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">Cards Played</div>
              <div className="text-lg font-semibold text-slate-200">
                {game.stats.cardsPlayed}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1">
                Creatures Summoned
              </div>
              <div className="text-lg font-semibold text-green-400">
                {game.stats.creaturesSummoned}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
