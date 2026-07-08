import { useCallback, useEffect, useRef, useState } from 'react'
import {
  GameStatus,
  aiMustAct,
  chooseAction,
  type Engine,
  type GameAction,
  type GameState,
  type VisibleGameState,
} from '@kaijudo/game-engine'
import { getEngine } from './engineProvider'

/**
 * A duel as seen by the local player, independent of transport.
 * DuelScreen renders one of these; implementations exist for local
 * AI games (below) and online games (src/multiplayer).
 */
export interface DuelSession {
  engine: Engine | null
  view: VisibleGameState | null
  myPlayerId: 1 | 2
  myName: string
  opponentName: string
  /** Submit an action. Errors surface via `error`. */
  submit: (action: GameAction) => void
  error: string | null
  clearError: () => void
  /** True while the opponent (AI or remote player) is acting. */
  opponentThinking: boolean
}

const AI_STEP_DELAY_MS = 700

/** Run a local game against the computer. Local player is always player 1. */
export function useLocalGame(params: {
  playerName: string
  playerDeck: string[]
  aiDeck: string[]
} | null): DuelSession {
  const [engine, setEngine] = useState<Engine | null>(null)
  const [state, setState] = useState<GameState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!params || startedRef.current) return
    startedRef.current = true
    getEngine().then((eng) => {
      setEngine(eng)
      const game = eng.createGame({
        gameId: `local-${Date.now().toString(36)}`,
        seed: `${Date.now()}-${Math.random()}`,
        players: [
          { name: params.playerName, deckCardIds: params.playerDeck },
          { name: 'Computer', deckCardIds: params.aiDeck },
        ],
        now: Date.now(),
      })
      setState(game)
    })
  }, [params])

  // Drive the AI whenever it must act.
  useEffect(() => {
    if (!engine || !state) return
    if (state.status !== GameStatus.InProgress) return
    if (!aiMustAct(state, 2)) return
    const timer = setTimeout(() => {
      setState((current) => {
        if (!current || !aiMustAct(current, 2)) return current
        try {
          const action = chooseAction(engine, current, 2)
          return engine.applyAction(current, action, Date.now())
        } catch (e) {
          // The AI should never pick an illegal action; surrender if it does.
          console.error('AI action failed', e)
          return engine.applyAction(current, { type: 'surrender', playerId: 2 }, Date.now())
        }
      })
    }, AI_STEP_DELAY_MS)
    return () => clearTimeout(timer)
  }, [engine, state])

  const submit = useCallback(
    (action: GameAction) => {
      if (!engine) return
      setState((current) => {
        if (!current) return current
        try {
          const next = engine.applyAction(current, action, Date.now())
          setError(null)
          return next
        } catch (e) {
          setError(e instanceof Error ? e.message : String(e))
          return current
        }
      })
    },
    [engine],
  )

  return {
    engine,
    view: engine && state ? engine.getVisibleState(state, 1) : null,
    myPlayerId: 1,
    myName: params?.playerName ?? 'You',
    opponentName: 'Computer',
    submit,
    error,
    clearError: useCallback(() => setError(null), []),
    opponentThinking: Boolean(state && state.status === GameStatus.InProgress && aiMustAct(state, 2)),
  }
}
