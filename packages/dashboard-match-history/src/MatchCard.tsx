'use client'

import { cn } from './utils'
import type { Match } from './MatchHistory'

export interface MatchCardProps {
  match: Match
  className?: string
}

/**
 * MatchCard component
 * Displays a single match with win/loss indicator
 */
export function MatchCard({ match, className }: MatchCardProps) {
  return (
    <div
      className={cn(
        'min-w-[200px] bg-slate-800 rounded-lg p-4 border transition-colors',
        match.won ? 'border-green-500/50 hover:border-green-500/70' : 'border-red-500/50 hover:border-red-500/70',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-slate-200">
          {match.map || match.opponent || 'Match'}
        </div>
        <div
          className={cn(
            'text-xs px-2 py-1 rounded font-semibold',
            match.won
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          )}
        >
          {match.won ? 'W' : 'L'}
        </div>
      </div>
      <div className="text-lg font-bold text-slate-100">{match.score}</div>
      {match.date && (
        <div className="text-xs text-slate-500 mt-2">
          {typeof match.date === 'string' ? match.date : match.date.toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

