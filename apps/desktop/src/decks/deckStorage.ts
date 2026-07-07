/**
 * Local deck persistence (localStorage) plus bundled starter decks.
 * Signed-in users can additionally sync decks to Convex — that layer
 * lives in the deck builder / multiplayer code; this module is the
 * offline source of truth.
 */

export interface SavedDeck {
  id: string
  name: string
  /** 40 card ids from the card database (duplicates = copies). */
  cardIds: string[]
  updatedAt: number
  /** Starter decks ship with the app and can't be deleted. */
  readonly?: boolean
}

const STORAGE_KEY = 'kaijudo.decks.v1'

export const DECK_SIZE = 40
export const MAX_COPIES = 4

function readStore(): SavedDeck[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedDeck[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStore(decks: SavedDeck[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
}

/** All decks: starters first, then user decks (most recent first). */
export function listDecks(): SavedDeck[] {
  const user = readStore().sort((a, b) => b.updatedAt - a.updatedAt)
  return [...STARTER_DECKS, ...user]
}

export function getDeck(id: string): SavedDeck | undefined {
  return listDecks().find((d) => d.id === id)
}

export function saveDeck(deck: Omit<SavedDeck, 'updatedAt'> & { updatedAt?: number }): SavedDeck {
  const saved: SavedDeck = { ...deck, updatedAt: Date.now(), readonly: false }
  const decks = readStore().filter((d) => d.id !== deck.id)
  decks.push(saved)
  writeStore(decks)
  return saved
}

export function deleteDeck(id: string): void {
  writeStore(readStore().filter((d) => d.id !== id))
}

export function newDeckId(): string {
  return `deck-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

/** Problems with a deck (empty array = playable). */
export function validateDeck(cardIds: string[]): string[] {
  const problems: string[] = []
  if (cardIds.length !== DECK_SIZE) {
    problems.push(`Deck must have exactly ${DECK_SIZE} cards (has ${cardIds.length})`)
  }
  const counts = new Map<string, number>()
  for (const id of cardIds) counts.set(id, (counts.get(id) ?? 0) + 1)
  for (const [id, n] of counts) {
    if (n > MAX_COPIES) problems.push(`Too many copies of card ${id} (${n}/${MAX_COPIES})`)
  }
  return problems
}

/** Bundled starter decks — one per civilization, built from DM-01–DM-03 staples. */
export const STARTER_DECKS: SavedDeck[] = [
  {
    id: 'starter-light',
    name: 'Light Starter — Sky Guardians',
    readonly: true,
    updatedAt: 0,
    cardIds: [
      '0019', '0019', '0019', '0019', '0013', '0013', '0013', '0013',
      '0018', '0018', '0018', '0018', '0026', '0026', '0026', '0026',
      '0136', '0136', '0136', '0136', '0028', '0028', '0028', '0028',
      '0017', '0017', '0017', '0017', '0027', '0027', '0027', '0027',
      '0029', '0029', '0029', '0029', '0030', '0030', '0030', '0030',
    ],
  },
  {
    id: 'starter-water',
    name: 'Water Starter — Deep Currents',
    readonly: true,
    updatedAt: 0,
    cardIds: [
      '0045', '0045', '0045', '0045', '0041', '0041', '0041', '0041',
      '0036', '0036', '0036', '0036', '0199', '0199', '0199', '0199',
      '0046', '0046', '0046', '0046', '0197', '0197', '0197', '0197',
      '0033', '0033', '0033', '0033', '0035', '0035', '0035', '0035',
      '0050', '0050', '0050', '0050', '0144', '0144', '0144', '0144',
    ],
  },
  {
    id: 'starter-darkness',
    name: 'Darkness Starter — Grave Whispers',
    readonly: true,
    updatedAt: 0,
    cardIds: [
      '0055', '0055', '0055', '0055', '0157', '0157', '0157', '0157',
      '0056', '0056', '0056', '0056', '0075', '0075', '0075', '0075',
      '0076', '0076', '0076', '0076', '0209', '0209', '0209', '0209',
      '0058', '0058', '0058', '0058', '0071', '0071', '0071', '0071',
      '0059', '0059', '0059', '0059', '0210', '0210', '0210', '0210',
    ],
  },
  {
    id: 'starter-fire',
    name: 'Fire Starter — Blazing Rush',
    readonly: true,
    updatedAt: 0,
    cardIds: [
      '0078', '0078', '0078', '0078', '0084', '0084', '0084', '0084',
      '0227', '0227', '0227', '0227', '0090', '0090', '0090', '0090',
      '0165', '0165', '0165', '0165', '0168', '0168', '0168', '0168',
      '0080', '0080', '0080', '0080', '0094', '0094', '0094', '0094',
      '0081', '0081', '0081', '0081', '0082', '0082', '0082', '0082',
    ],
  },
  {
    id: 'starter-nature',
    name: 'Nature Starter — Wild Growth',
    readonly: true,
    updatedAt: 0,
    cardIds: [
      '0239', '0239', '0239', '0239', '0115', '0115', '0115', '0115',
      '0101', '0101', '0101', '0101', '0112', '0112', '0112', '0112',
      '0172', '0172', '0172', '0172', '0105', '0105', '0105', '0105',
      '0107', '0107', '0107', '0107', '0108', '0108', '0108', '0108',
      '0110', '0110', '0110', '0110', '0238', '0238', '0238', '0238',
    ],
  },
]
