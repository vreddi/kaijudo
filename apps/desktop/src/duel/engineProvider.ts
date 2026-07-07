import { buildCardRegistry, createEngine, type CardData, type Engine } from '@kaijudo/game-engine'
import { loadAllCards } from '../menu/collectionData'

/**
 * Singleton game engine for the desktop app, compiled from the bundled
 * card database. The same engine drives local AI games and renders
 * multiplayer views (the server runs its own authoritative copy).
 */

let enginePromise: Promise<Engine> | null = null

export function getEngine(): Promise<Engine> {
  if (!enginePromise) {
    enginePromise = loadAllCards().then((cards) => {
      const registry = buildCardRegistry(cards as unknown as CardData[])
      return createEngine(registry)
    })
  }
  return enginePromise
}
