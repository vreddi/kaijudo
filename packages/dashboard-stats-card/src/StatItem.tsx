'use client'

import { cn } from './utils'

export interface StatItemProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  className?: string
}

/**
 * StatItem component
 * Displays a single stat with label and value
 */
export function StatItem({ label, value, icon, className }: StatItemProps) {
  return (
    <div className={cn('text-center', className)}>
      {icon && <div className="flex justify-center mb-1">{icon}</div>}
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-semibold text-slate-200">{value}</div>
    </div>
  )
}

