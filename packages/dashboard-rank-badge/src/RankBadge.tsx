'use client'

import { motion } from 'motion/react'
import { cn } from './utils'

export interface RankBadgeProps {
  tier: string
  level: string
  peak?: boolean
  className?: string
}

/**
 * RankBadge component
 * Displays player rank with tier, level, and peak indicator
 */
export function RankBadge({
  tier,
  level,
  peak = false,
  className,
}: RankBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className={cn(
        'bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl p-4 border border-purple-500/30',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400 uppercase tracking-wider">
          {peak ? 'Peak Rating' : 'Current Rating'}
        </div>
        {peak && (
          <div className="text-xs text-yellow-400 font-semibold">PEAK</div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-purple-400">{tier}</div>
        <div className="text-lg text-slate-300">{level}</div>
      </div>
    </motion.div>
  )
}

