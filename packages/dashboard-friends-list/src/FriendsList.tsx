'use client'

import { motion } from 'motion/react'
import { cn } from './utils'
import { FriendItem } from './FriendItem'

export interface Friend {
  id: string
  name: string
  avatar?: string
  online?: boolean
}

export interface FriendsListProps {
  friends: Friend[]
  className?: string
}

/**
 * FriendsList component
 * Displays a scrollable list of friends with avatars and online status
 */
export function FriendsList({ friends, className }: FriendsListProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
        FRIENDS
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        {friends.map((friend, index) => (
          <motion.div
            key={friend.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <FriendItem friend={friend} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

