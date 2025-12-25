"use client";

import { motion } from "motion/react";
import { cn } from "./utils";
import type { Creature } from "@kaijudo/react-game-types";

export interface CreatureCardProps {
  /**
   * Creature data
   */
  creature: Creature & {
    imageSrc?: string;
    playCount?: number;
    winRate?: number;
  };
  /**
   * Show favorite toggle
   */
  favorite?: boolean;
  /**
   * Callback when favorite is toggled
   */
  onFavoriteToggle?: (creatureId: string) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * CreatureCard component
 * Displays a creature card with image, stats, and favorite toggle
 */
export function CreatureCard({
  creature,
  favorite = false,
  onFavoriteToggle,
  className,
}: CreatureCardProps) {
  const civilizationColors = {
    water: "bg-blue-500/20 border-blue-500/50 text-blue-400",
    light: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
    darkness: "bg-purple-500/20 border-purple-500/50 text-purple-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        "relative min-w-[180px] bg-slate-800 rounded-lg overflow-hidden border border-slate-700/50 cursor-pointer group",
        className
      )}
    >
      {/* Creature Image */}
      {creature.imageSrc && (
        <div className="relative w-full h-32 overflow-hidden">
          <img
            src={creature.imageSrc}
            alt={creature.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Name and Favorite */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-200 line-clamp-1">
            {creature.name}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.(creature.name);
            }}
            className={cn(
              "ml-2 shrink-0 transition-colors",
              favorite ? "text-red-500" : "text-slate-500 hover:text-red-500"
            )}
          >
            <svg
              className="w-4 h-4"
              fill={favorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 mb-2">
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              {creature.power}
            </span>
            /
            <span className="font-semibold text-slate-200">
              {creature.toughness}
            </span>
          </div>
          {creature.winRate !== undefined && (
            <div className="text-xs text-green-400">
              {creature.winRate.toFixed(1)}% WR
            </div>
          )}
        </div>

        {/* Civilization Badge */}
        <div
          className={cn(
            "inline-flex items-center px-2 py-1 rounded text-xs font-medium border",
            civilizationColors[creature.civilization]
          )}
        >
          {creature.civilization.charAt(0).toUpperCase() +
            creature.civilization.slice(1)}
        </div>
      </div>
    </motion.div>
  );
}
