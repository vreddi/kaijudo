"use client";

import { Link } from "@tanstack/react-router";
import { cn } from "./utils";

export interface SetupGuideCardProps {
  className?: string;
}

/**
 * SetupGuideCard component
 * Displays a setup/startup guide for new users
 */
export function SetupGuideCard({ className }: SetupGuideCardProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-8 border border-purple-500/30",
        className
      )}
    >
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/50 mb-4">
          <svg
            className="w-8 h-8 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>

        <h3 className="text-2xl font-bold text-slate-100">
          Welcome to Kaijudo!
        </h3>
        <p className="text-slate-300">
          Get started by building your first deck, exploring creatures, and
          joining your first match.
        </p>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm font-semibold text-slate-200 mb-1">
              Build Deck
            </div>
            <div className="text-xs text-slate-400">Create your first deck</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="text-2xl mb-2">🎮</div>
            <div className="text-sm font-semibold text-slate-200 mb-1">
              Play Match
            </div>
            <div className="text-xs text-slate-400">Start your first game</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm font-semibold text-slate-200 mb-1">
              View Stats
            </div>
            <div className="text-xs text-slate-400">Track your progress</div>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            to="/dashboard/explore"
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium"
          >
            Explore Creatures
          </Link>
          <Link
            to="/dashboard/analysis"
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
