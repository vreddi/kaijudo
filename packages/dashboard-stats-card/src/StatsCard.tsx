'use client'

import { motion } from 'motion/react'
import { cn } from './utils'
import { StatItem } from './StatItem'

export interface Stat {
  label: string
  value: string | number
  icon?: React.ReactNode
}

export interface StatsCardProps {
  /**
   * Title of the stats card
   */
  title: string
  /**
   * Main entity name (e.g., creature name, agent name)
   */
  entityName: string
  /**
   * Play time or usage time
   */
  playTime?: string
  /**
   * Array of stats to display in grid
   */
  stats: Stat[]
  /**
   * Large prominent stat (e.g., win ratio)
   */
  prominentStat?: {
    label: string
    value: number
    unit?: string
  }
  /**
   * Optional image/illustration to display
   */
  image?: string
  /**
   * Image alt text
   */
  imageAlt?: string
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * StatsCard component
 * Displays a card with large prominent stat and grid of smaller stats
 */
export function StatsCard({
  title,
  entityName,
  playTime,
  stats,
  prominentStat,
  image,
  imageAlt,
  className,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700/50 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm text-slate-400 mb-1 uppercase tracking-wider">
            {title}
          </h3>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-100">{entityName}</h2>
            {playTime && (
              <span className="text-sm text-slate-400">Play Time {playTime}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-5 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <StatItem label={stat.label} value={stat.value} icon={stat.icon} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Prominent Stat */}
      {prominentStat && (
        <div className="relative flex items-center justify-between">
          <div className="relative z-10">
            <div className="text-6xl font-bold text-purple-400">
              {prominentStat.value.toFixed(1)}
              {prominentStat.unit || '%'}
            </div>
            <div className="text-sm text-slate-400 mt-1">{prominentStat.label}</div>
          </div>
          {image && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute right-0 top-0 w-48 h-48 opacity-20 pointer-events-none"
            >
              <img
                src={image}
                alt={imageAlt || entityName}
                className="w-full h-full object-contain"
              />
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}

