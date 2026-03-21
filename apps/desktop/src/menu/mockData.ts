export const playerProfile = {
  username: 'DragonLord_99',
  avatar: '/images/creature.png',
  level: 25,
  xp: 4560,
  xpToNext: 6000,
  rank: 'Gold II',
  totalHours: 284,
  registeredDate: 'Dec 17, 2025',
}

export const playerStats = {
  wins: 186,
  losses: 124,
  winStreak: 4,
  matchesThisWeek: 18,
  playedThisWeek: '12H 45M',
}

export interface Deck {
  id: string
  name: string
  civilization: string
  cardCount: number
  winRate: number
  color: string
}

export const myDecks: Deck[] = [
  { id: '1', name: 'Dragon Fury', civilization: 'Fire', cardCount: 40, winRate: 72, color: '#e63946' },
  { id: '2', name: 'Aqua Control', civilization: 'Water', cardCount: 40, winRate: 65, color: '#00b4d8' },
  { id: '3', name: 'Nature\'s Wrath', civilization: 'Nature', cardCount: 40, winRate: 58, color: '#2d6a4f' },
]

export interface Friend {
  id: string
  username: string
  level: number
  online: boolean
  inGame: boolean
}

export const friends: Friend[] = [
  { id: '1', username: 'BlazeMaster', level: 32, online: true, inGame: true },
  { id: '2', username: 'AquaPhantom', level: 28, online: true, inGame: false },
  { id: '3', username: 'ShadowKnight', level: 19, online: true, inGame: false },
  { id: '4', username: 'NatureSage', level: 45, online: false, inGame: false },
  { id: '5', username: 'LightBringer', level: 22, online: false, inGame: false },
]

export interface Match {
  id: string
  opponent: string
  result: 'win' | 'loss'
  deckUsed: string
  turnsPlayed: number
  timeAgo: string
}

export const recentMatches: Match[] = [
  { id: '1', opponent: 'BlazeMaster', result: 'win', deckUsed: 'Dragon Fury', turnsPlayed: 12, timeAgo: '2h ago' },
  { id: '2', opponent: 'VoidWalker', result: 'loss', deckUsed: 'Aqua Control', turnsPlayed: 18, timeAgo: '3h ago' },
  { id: '3', opponent: 'StormCaller', result: 'win', deckUsed: 'Dragon Fury', turnsPlayed: 9, timeAgo: '5h ago' },
  { id: '4', opponent: 'IronGuard', result: 'win', deckUsed: 'Nature\'s Wrath', turnsPlayed: 15, timeAgo: '1d ago' },
]

export interface Goal {
  id: string
  title: string
  current: number
  target: number
  icon: string
}

export const goals: Goal[] = [
  { id: '1', title: 'Win 50 ranked matches', current: 38, target: 50, icon: '🏆' },
  { id: '2', title: 'Play 100 matches', current: 86, target: 100, icon: '⚔️' },
  { id: '3', title: 'Build 5 decks', current: 3, target: 5, icon: '🃏' },
  { id: '4', title: 'Add 10 friends', current: 5, target: 10, icon: '👥' },
]
