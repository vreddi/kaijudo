'use client'

import { motion } from 'motion/react'
import { cn } from './utils'
import { MatchCard } from './MatchCard'

export interface Match {
  id?: string
  map?: string
  opponent?: string
  score: string
  won: boolean
  date?: Date | string
}

export interface MatchHistoryProps {
  /**
   * Array of matches to display
   */
  matches: Match[]
  /**
   * Title of the section
   */
  title?: string
  /**
   * Show "View all" link
   */
  showViewAll?: boolean
  /**
   * View all link href
   */
  viewAllHref?: string
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * MatchHistory component
 * Displays a horizontal scrollable list of match cards
 */
export function MatchHistory({
  matches,
  title = 'LAST MATCH',
  showViewAll = true,
  viewAllHref = '#',
  className,
}: MatchHistoryProps) {
  return (
    <div className={cn('bg-slate-900 rounded-xl p-6 border border-slate-800', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-200">{title}</h2>
        {showViewAll && (
          <a
            href={viewAllHref}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            View all
          </a>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        {matches.map((match, index) => (
          <motion.div
            key={match.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <MatchCard match={match} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

