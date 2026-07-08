/**
 * Dev-only harness: mounts a local AI duel directly, no auth/backend.
 * Open http://localhost:1420/duel-dev.html with `pnpm dev:frontend`.
 * Not part of the shipped app (only index.html is bundled by Tauri).
 */
import { StrictMode, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { STARTER_DECKS } from '../decks/deckStorage'
import { useLocalGame } from './session'
import DuelScreen from './DuelScreen'
import DeckBuilderPage from '../menu/DeckBuilderPage'
import '../index.css'

function DevDuel(): JSX.Element {
  const [gameKey, setGameKey] = useState(0)
  return <DevGame key={gameKey} onExit={() => setGameKey((k) => k + 1)} />
}

function DevGame({ onExit }: { onExit: () => void }): JSX.Element {
  const params = useMemo(
    () => ({
      playerName: 'Dev Duelist',
      playerDeck: STARTER_DECKS[3].cardIds, // fire
      aiDeck: STARTER_DECKS[4].cardIds, // nature
    }),
    [],
  )
  const session = useLocalGame(params)
  return <DuelScreen session={session} onExit={onExit} />
}

const page = new URLSearchParams(window.location.search).get('page')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    {page === 'decks' ? (
      <div className="h-screen overflow-hidden bg-[#08091a] p-6">
        <DeckBuilderPage />
      </div>
    ) : (
      <DevDuel />
    )}
  </StrictMode>,
)
