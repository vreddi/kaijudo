'use client'

import { cn } from './utils'
import type { Friend } from './FriendsList'

export interface FriendItemProps {
  friend: Friend
  className?: string
}

/**
 * FriendItem component
 * Displays a single friend with avatar and online status
 */
export function FriendItem({ friend, className }: FriendItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group',
        className
      )}
    >
      <div className="relative">
        {friend.avatar ? (
          <img
            src={friend.avatar}
            alt={friend.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-xs text-slate-400">{friend.name[0]}</span>
          </div>
        )}
        {friend.online && (
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-900" />
        )}
      </div>
      <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">
        {friend.name}
      </span>
    </div>
  )
}

