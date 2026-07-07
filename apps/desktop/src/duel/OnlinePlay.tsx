import { useCallback, useEffect, useState } from 'react'
import type { Engine, GameAction } from '@kaijudo/game-engine'
import { DeckPicker } from './PlayPage'
import DuelScreen from './DuelScreen'
import type { DuelSession } from './session'
import { getEngine } from './engineProvider'
import {
  useCancelLobby,
  useCreateLobby,
  useGame,
  useJoinGame,
  useSubmitAction,
} from '../multiplayer/useMultiplayer'

/**
 * Online multiplayer flow: create a lobby (share the code) or join with
 * a friend's code, then play through the Convex-backed session.
 */
function OnlinePlay({ playerName, onBack }: { playerName: string; onBack: () => void }): JSX.Element {
  const [step, setStep] = useState<'menu' | 'create' | 'join'>('menu')
  const [gameId, setGameId] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createLobby = useCreateLobby()
  const joinGame = useJoinGame()
  const cancelLobby = useCancelLobby()

  if (gameId) {
    return (
      <OnlineDuel
        gameId={gameId}
        onExit={() => {
          setGameId(null)
          setStep('menu')
        }}
        onCancelLobby={() => {
          void cancelLobby(gameId).catch(() => undefined)
          setGameId(null)
          setStep('menu')
        }}
      />
    )
  }

  if (step === 'create') {
    return (
      <DeckPicker
        title="Choose your deck"
        subtitle="You'll get a match code to share with your opponent."
        onBack={() => setStep('menu')}
        onPick={(deck) => {
          setBusy(true)
          setError(null)
          createLobby({ playerName, deckCardIds: deck.cardIds })
            .then((res) => setGameId(res.gameId))
            .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
            .finally(() => setBusy(false))
        }}
      />
    )
  }

  if (step === 'join') {
    return (
      <DeckPicker
        title={`Join match ${joinCode.toUpperCase()}`}
        subtitle="Choose the deck you'll play."
        onBack={() => setStep('menu')}
        onPick={(deck) => {
          setBusy(true)
          setError(null)
          joinGame({ code: joinCode.trim().toUpperCase(), playerName, deckCardIds: deck.cardIds })
            .then((res) => setGameId(res.gameId))
            .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)))
            .finally(() => setBusy(false))
        }}
      />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5 min-h-[400px]">
      <button onClick={onBack} className="self-start text-xs text-slate-500 hover:text-slate-300 cursor-pointer">
        ← Back
      </button>
      <h2 className="text-xl font-bold text-slate-100">Online Match</h2>
      {error && <p className="text-xs text-red-400 max-w-md text-center">{error}</p>}
      <div className="flex gap-6 items-stretch">
        <button
          onClick={() => setStep('create')}
          disabled={busy}
          className="flex flex-col items-center gap-2 w-56 px-6 py-8 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-amber-500/50 cursor-pointer disabled:opacity-50"
        >
          <span className="text-3xl">➕</span>
          <span className="text-sm font-bold text-slate-100">Create match</span>
          <span className="text-xs text-slate-500 text-center">Get a code to share with a friend</span>
        </button>
        <div className="flex flex-col items-center gap-2 w-56 px-6 py-8 rounded-2xl bg-slate-800/40 border border-slate-700/40">
          <span className="text-3xl">🔑</span>
          <span className="text-sm font-bold text-slate-100">Join match</span>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            maxLength={6}
            className="w-full text-center tracking-[0.3em] font-mono text-sm bg-slate-900/70 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-100 outline-none focus:border-amber-500/60"
          />
          <button
            onClick={() => joinCode.trim().length >= 4 && setStep('join')}
            disabled={busy || joinCode.trim().length < 4}
            className="w-full px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-black disabled:opacity-40 cursor-pointer"
          >
            Join
          </button>
        </div>
      </div>
      <p className="text-[11px] text-slate-600 max-w-sm text-center">
        Online play requires being signed in. Both players need the app connected to the same backend.
      </p>
    </div>
  )
}

function OnlineDuel(props: { gameId: string; onExit: () => void; onCancelLobby: () => void }): JSX.Element {
  const game = useGame(props.gameId)
  const submitAction = useSubmitAction()
  const [engine, setEngine] = useState<Engine | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void getEngine().then(setEngine)
  }, [])

  const submit = useCallback(
    (action: GameAction) => {
      submitAction({ gameId: props.gameId, action }).catch((e: unknown) => {
        setError(e instanceof Error ? cleanConvexError(e.message) : String(e))
      })
    },
    [submitAction, props.gameId],
  )

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-sm text-slate-500">Connecting…</p>
      </div>
    )
  }

  // Waiting room: show the code until the opponent joins.
  if (game.status === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <h3 className="text-base font-bold text-slate-100">Waiting for opponent…</h3>
        <div className="text-3xl font-mono font-black tracking-[0.4em] text-amber-400 bg-slate-900/70 border border-amber-700/40 rounded-xl px-8 py-4">
          {game.code}
        </div>
        <p className="text-xs text-slate-500">Share this code with your opponent</p>
        <button onClick={props.onCancelLobby} className="text-xs text-slate-500 hover:text-red-400 cursor-pointer">
          Cancel match
        </button>
      </div>
    )
  }

  const session: DuelSession = {
    engine,
    view: game.view,
    myPlayerId: game.myPlayerId ?? 1,
    myName: game.myPlayerId === 2 ? (game.guestName ?? 'You') : game.hostName,
    opponentName: game.myPlayerId === 2 ? game.hostName : (game.guestName ?? 'Opponent'),
    submit,
    error,
    clearError: () => setError(null),
    opponentThinking: false,
  }

  return <DuelScreen session={session} onExit={props.onExit} />
}

function cleanConvexError(message: string): string {
  // Convex wraps thrown errors with a long prefix; keep the useful tail.
  const idx = message.lastIndexOf('Error:')
  return idx >= 0 ? message.slice(idx + 6).trim() : message
}

export default OnlinePlay
