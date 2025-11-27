'use client'

import { motion } from 'motion/react'
import { cn } from './utils'

export interface DeckCardProps {
  /**
   * Deck name
   */
  name: string
  /**
   * Win rate percentage
   */
  winRate: number
  /**
   * Total number of cards in deck
   */
  cardCount: number
  /**
   * Number of games played
   */
  gamesPlayed?: number
  /**
   * Show favorite toggle
   */
  favorite?: boolean
  /**
   * Callback when favorite is toggled
   */
  onFavoriteToggle?: (deckId: string) => void
  /**
   * Deck ID
   */
  deckId?: string
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * DeckCard component
 * Displays deck statistics with win rate and card count
 */
export function DeckCard({
  name,
  winRate,
  cardCount,
  gamesPlayed,
  favorite = false,
  onFavoriteToggle,
  deckId,
  className,
}: DeckCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'bg-slate-800 rounded-lg p-4 border border-slate-700/50 cursor-pointer group',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-200 line-clamp-2 flex-1">
          {name}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFavoriteToggle?.(deckId || name)
          }}
          className={cn(
            'ml-2 shrink-0 transition-colors',
            favorite ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
          )}
        >
          <svg
            className="w-4 h-4"
            fill={favorite ? 'currentColor' : 'none'}
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

      <div className="space-y-2">
        {/* Win Rate */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Win Rate</span>
          <span
            className={cn(
              'text-sm font-semibold',
              winRate >= 60 ? 'text-green-400' : winRate >= 50 ? 'text-yellow-400' : 'text-red-400'
            )}
          >
            {winRate.toFixed(1)}%
          </span>
        </div>

        {/* Card Count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Cards</span>
          <span className="text-sm font-semibold text-slate-200">{cardCount}</span>
        </div>

        {/* Games Played */}
        {gamesPlayed !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Games</span>
            <span className="text-sm font-semibold text-slate-200">{gamesPlayed}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

