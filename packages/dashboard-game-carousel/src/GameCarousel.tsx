"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./utils";
import { RecentGameCard } from "./RecentGameCard";
import { SetupGuideCard } from "./SetupGuideCard";

export interface RecentGame {
  id: string;
  date: Date | string;
  won: boolean;
  opponent?: string;
  score?: string;
  trumpCard: {
    name: string;
    imageSrc: string;
    power: number;
    toughness: number;
    civilization: string;
  };
  stats: {
    turns: number;
    damageDealt: number;
    cardsPlayed: number;
    creaturesSummoned: number;
  };
}

export interface GameCarouselProps {
  recentGames: RecentGame[];
  className?: string;
}

/**
 * GameCarousel component
 * Displays a carousel of recent games and setup guide
 */
export function GameCarousel({ recentGames = [], className }: GameCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Combine setup guide with recent games (filter out invalid games)
  const items = [
    { type: "setup" as const },
    ...recentGames
      .filter((game) => game && game.trumpCard && game.stats)
      .map((game) => ({ type: "game" as const, game })),
  ];

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-xl">
        <AnimatePresence mode="wait">
          {items.map((item, index) => {
            if (index !== currentIndex) return null;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                {item.type === "setup" ? (
                  <SetupGuideCard />
                ) : (
                  <RecentGameCard game={item.game} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex
                ? "bg-purple-500 w-8"
                : "bg-slate-700 hover:bg-slate-600"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors z-10"
        aria-label="Previous slide"
      >
        <svg
          className="w-5 h-5 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full transition-colors z-10"
        aria-label="Next slide"
      >
        <svg
          className="w-5 h-5 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
