import { api } from '@convex/_generated/api'
import type { Id } from '@convex/_generated/dataModel'
import type { GameAction, VisibleGameState } from '@kaijudo/game-engine'
import { useMutation, useQuery } from 'convex/react'
import { useCallback, useMemo } from 'react'

export type GameId = Id<'games'>
export type DeckId = Id<'decks'>

export type GameRole = 'host' | 'guest'
export type GameLobbyStatus = 'waiting' | 'inProgress' | 'completed'

export interface MultiplayerGame {
  role: GameRole
  /** 1 when hosting, 2 when joined as guest. */
  myPlayerId: 1 | 2
  status: GameLobbyStatus
  /** 6-character join code to share with the opponent. */
  code: string
  hostName: string
  guestName: string | null
  /** Winning playerId once the game completes, null otherwise. */
  winner: number | null
  /** Player-scoped engine view. Null until the game starts. */
  view: VisibleGameState | null
}

export interface ActiveGameSummary {
  gameId: GameId
  code: string
  status: GameLobbyStatus
  role: GameRole
  hostName: string
  guestName: string | null
  createdAt: number
}

/**
 * Live subscription to a multiplayer game. Re-renders whenever either
 * player acts. Returns null while loading, if the game does not exist,
 * or if the current user is not a participant.
 */
export function useGame(gameId: string | null): MultiplayerGame | null {
  const raw = useQuery(
    api.games.get,
    gameId ? { gameId: gameId as GameId } : 'skip'
  )

  return useMemo<MultiplayerGame | null>(() => {
    if (!raw) {
      return null
    }
    const { view, ...rest } = raw
    return {
      ...rest,
      view: view ? (JSON.parse(view) as VisibleGameState) : null,
    }
  }, [raw])
}

/**
 * Create a lobby with the caller as host. Resolves with the game id and
 * the 6-character join code to share with the opponent.
 */
export function useCreateLobby(): (args: {
  playerName: string
  deckCardIds: string[]
}) => Promise<{ gameId: GameId; code: string }> {
  return useMutation(api.games.createLobby)
}

/** Join a waiting lobby by its 6-character code. The game starts immediately. */
export function useJoinGame(): (args: {
  code: string
  playerName: string
  deckCardIds: string[]
}) => Promise<{ gameId: GameId }> {
  return useMutation(api.games.join)
}

/**
 * Submit an engine action for the current user's seat. The server forces
 * the action's playerId to match the caller's seat and rejects illegal
 * moves (surfaced as a rejected promise).
 */
export function useSubmitAction(): (args: {
  gameId: string
  action: GameAction
}) => Promise<void> {
  const submit = useMutation(api.games.submitAction)
  return useCallback(
    async ({ gameId, action }: { gameId: string; action: GameAction }) => {
      await submit({ gameId: gameId as GameId, action })
    },
    [submit]
  )
}

/** Cancel a waiting lobby the current user hosts. */
export function useCancelLobby(): (gameId: string) => Promise<void> {
  const cancel = useMutation(api.games.cancelLobby)
  return useCallback(
    async (gameId: string) => {
      await cancel({ gameId: gameId as GameId })
    },
    [cancel]
  )
}

/**
 * All games the current user is part of that are not completed.
 * Returns undefined while loading.
 */
export function useMyActiveGames(): ActiveGameSummary[] | undefined {
  return useQuery(api.games.myActiveGames)
}
