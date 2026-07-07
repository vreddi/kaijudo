import { useMemo, useState } from 'react'
import { useUser } from '@clerk/clerk-react'
import { listDecks, validateDeck, STARTER_DECKS, type SavedDeck } from '../decks/deckStorage'
import { useLocalGame } from './session'
import DuelScreen from './DuelScreen'
import { civColor } from './cards'
import OnlinePlay from './OnlinePlay'

/**
 * The Play tab: pick a mode (vs computer / online), pick a deck, duel.
 */
function PlayPage(): JSX.Element {
  const { user } = useUser()
  const playerName = user?.firstName ?? user?.username ?? 'Duelist'
  const [mode, setMode] = useState<'menu' | 'local' | 'online'>('menu')
  const [localGame, setLocalGame] = useState<{ playerDeck: string[]; aiDeck: string[] } | null>(null)

  if (localGame) {
    return <LocalDuel playerName={playerName} {...localGame} onExit={() => setLocalGame(null)} />
  }

  if (mode === 'online') {
    return <OnlinePlay playerName={playerName} onBack={() => setMode('menu')} />
  }

  if (mode === 'local') {
    return (
      <DeckPicker
        title="Choose your deck"
        subtitle="The computer will play a random starter deck."
        onBack={() => setMode('menu')}
        onPick={(deck) => {
          const aiDeck = STARTER_DECKS[Math.floor(Math.random() * STARTER_DECKS.length)]
          setLocalGame({ playerDeck: deck.cardIds, aiDeck: aiDeck.cardIds })
        }}
      />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[400px]">
      <h2 className="text-xl font-bold text-slate-100">Play</h2>
      <div className="flex gap-6">
        <ModeCard
          icon="🤖"
          title="vs Computer"
          description="Duel the AI opponent locally. Great for testing decks."
          onClick={() => setMode('local')}
        />
        <ModeCard
          icon="🌐"
          title="Online Match"
          description="Create a match code or join a friend's game."
          onClick={() => setMode('online')}
        />
      </div>
    </div>
  )
}

function LocalDuel(props: {
  playerName: string
  playerDeck: string[]
  aiDeck: string[]
  onExit: () => void
}): JSX.Element {
  const params = useMemo(
    () => ({ playerName: props.playerName, playerDeck: props.playerDeck, aiDeck: props.aiDeck }),
    [props.playerName, props.playerDeck, props.aiDeck],
  )
  const session = useLocalGame(params)
  return <DuelScreen session={session} onExit={props.onExit} />
}

function ModeCard(props: { icon: string; title: string; description: string; onClick: () => void }): JSX.Element {
  return (
    <button
      onClick={props.onClick}
      className="flex flex-col items-center gap-3 w-60 px-8 py-10 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-amber-500/50 hover:bg-slate-800/70 transition-all cursor-pointer group"
    >
      <span className="text-4xl group-hover:scale-110 transition-transform">{props.icon}</span>
      <span className="text-base font-bold text-slate-100">{props.title}</span>
      <span className="text-xs text-slate-500 text-center leading-relaxed">{props.description}</span>
    </button>
  )
}

export function DeckPicker(props: {
  title: string
  subtitle?: string
  onBack: () => void
  onPick: (deck: SavedDeck) => void
}): JSX.Element {
  const decks = useMemo(() => listDecks(), [])
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={props.onBack} className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer">
          ← Back
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-100">{props.title}</h2>
          {props.subtitle && <p className="text-xs text-slate-500">{props.subtitle}</p>}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {decks.map((deck) => {
          const problems = validateDeck(deck.cardIds)
          const playable = problems.length === 0
          return (
            <button
              key={deck.id}
              disabled={!playable}
              onClick={() => props.onPick(deck)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/40 hover:border-amber-500/50 disabled:opacity-40 disabled:cursor-default cursor-pointer text-left"
            >
              <DeckCivDots cardIds={deck.cardIds} />
              <span className="text-sm font-semibold text-slate-200 flex-1">{deck.name}</span>
              {deck.readonly && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">STARTER</span>
              )}
              <span className={`text-xs ${playable ? 'text-slate-500' : 'text-red-400'}`}>
                {playable ? `${deck.cardIds.length} cards` : problems[0]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DeckCivDots({ cardIds }: { cardIds: string[] }): JSX.Element {
  // Rough civ indicator based on starter naming or card id prefix is not
  // reliable — just show a neutral chip count; deck builder shows details.
  const count = new Set(cardIds).size
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
      style={{ background: civColor(undefined) }}
    >
      {count}
    </span>
  )
}

export default PlayPage
