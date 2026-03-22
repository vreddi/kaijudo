export interface CollectionCard {
  id: string
  name: string
  civilization: string | string[]
  cost: number
  type: string
  race: string
  power: number
  rarity: string
  collectorNum: string
  set: string
  imageSrc: string
}

let cachedCards: CollectionCard[] | null = null

export async function loadAllCards(): Promise<CollectionCard[]> {
  if (cachedCards) return cachedCards
  const res = await fetch('/data/all-cards.json')
  const cards: CollectionCard[] = await res.json()
  cachedCards = cards
  return cards
}

/** Get the primary civilization string for filtering/display */
export function getPrimaryCiv(card: CollectionCard): string {
  if (Array.isArray(card.civilization)) {
    return card.civilization[0] ?? ''
  }
  return card.civilization
}

/** Get all civilizations as an array */
export function getCivs(card: CollectionCard): string[] {
  if (Array.isArray(card.civilization)) {
    return card.civilization
  }
  return [card.civilization]
}

/** Normalize rarity string to match our enum-style values */
export function normalizeRarity(rarity: string): string {
  const map: Record<string, string> = {
    'Common': 'common',
    'Uncommon': 'uncommon',
    'Rare': 'rare',
    'Very Rare': 'veryRare',
    'Super Rare': 'superRare',
  }
  return map[rarity] ?? 'none'
}

/** Normalize civilization to lowercase for card component */
export function normalizeCiv(civ: string): string {
  return civ.toLowerCase()
}
