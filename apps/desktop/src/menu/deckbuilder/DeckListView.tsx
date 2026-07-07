import { useState } from 'react'
import { DECK_SIZE, type SavedDeck } from '../../decks/deckStorage'
import type { CollectionCard } from '../collectionData'
import { civColors } from './civColors'

interface DeckListViewProps {
  decks: SavedDeck[]
  cardById: Map<string, CollectionCard>
  onNew: () => void
  onLoad: (deck: SavedDeck) => void
  onDuplicate: (deck: SavedDeck) => void
  onDelete: (id: string) => void
}

const actionButtonClass =
  'px-2.5 py-1 rounded text-[10px] font-medium border cursor-pointer transition-colors bg-slate-800/50 border-slate-700/40 text-slate-400 hover:border-slate-500 hover:text-slate-200'

/** Deck selector: all saved decks (starters + user decks) with manage actions. */
export function DeckListView({
  decks,
  cardById,
  onNew,
  onLoad,
  onDuplicate,
  onDelete,
}: DeckListViewProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const starters = decks.filter((d) => d.readonly)
  const userDecks = decks.filter((d) => !d.readonly)

  const civsFor = (deck: SavedDeck): string[] => {
    const civs: string[] = []
    const seen = new Set<string>()
    for (const id of deck.cardIds) {
      const card = cardById.get(id)
      if (!card) continue
      const cardCivs = Array.isArray(card.civilization) ? card.civilization : [card.civilization]
      for (const civ of cardCivs) {
        if (!seen.has(civ)) {
          seen.add(civ)
          civs.push(civ)
        }
      }
    }
    return civs
  }

  const renderDeck = (deck: SavedDeck) => {
    const count = deck.cardIds.length
    const countColor =
      count === DECK_SIZE ? 'text-green-400' : count > DECK_SIZE ? 'text-red-400' : 'text-slate-400'
    return (
      <div
        key={deck.id}
        className="flex flex-col gap-2.5 rounded-xl border border-slate-700/40 bg-slate-800/30 hover:border-amber-500/40 transition-colors p-4"
        onMouseLeave={() => setConfirmDeleteId((v) => (v === deck.id ? null : v))}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-semibold text-slate-100 truncate" title={deck.name}>
            {deck.name}
          </span>
          {deck.readonly && (
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 flex-shrink-0">
              Starter
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-semibold ${countColor}`}>
            {count}/{DECK_SIZE}
          </span>
          <div className="flex gap-1 flex-wrap">
            {civsFor(deck).map((civ) => (
              <span
                key={civ}
                className="text-[9px] font-bold px-1.5 py-0.5 rounded capitalize"
                style={{ background: `${civColors[civ] ?? '#555'}30`, color: civColors[civ] ?? '#999' }}
              >
                {civ}
              </span>
            ))}
          </div>
          {!deck.readonly && deck.updatedAt > 0 && (
            <span className="text-[9px] text-slate-600 ml-auto">
              {new Date(deck.updatedAt).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex gap-1.5 mt-1">
          <button
            onClick={() => onLoad(deck)}
            className="px-2.5 py-1 rounded text-[10px] font-medium border cursor-pointer transition-colors bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25"
          >
            {deck.readonly ? 'Open' : 'Edit'}
          </button>
          <button onClick={() => onDuplicate(deck)} className={actionButtonClass}>
            Duplicate
          </button>
          {!deck.readonly && (
            <button
              onClick={() => {
                if (confirmDeleteId === deck.id) {
                  onDelete(deck.id)
                  setConfirmDeleteId(null)
                } else {
                  setConfirmDeleteId(deck.id)
                }
              }}
              className={`px-2.5 py-1 rounded text-[10px] font-medium border cursor-pointer transition-colors ml-auto ${
                confirmDeleteId === deck.id
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-slate-800/50 border-slate-700/40 text-slate-500 hover:border-red-500/40 hover:text-red-400'
              }`}
            >
              {confirmDeleteId === deck.id ? 'Confirm delete?' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-100">Decks</h2>
        <button
          onClick={onNew}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
        >
          + New Deck
        </button>
      </div>
      <div className="flex-1 overflow-auto flex flex-col gap-5 pb-2">
        <section>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">My Decks</div>
          {userDecks.length === 0 ? (
            <p className="text-xs text-slate-600">
              No custom decks yet — create a new deck or duplicate a starter below.
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
              {userDecks.map(renderDeck)}
            </div>
          )}
        </section>
        <section>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
            Starter Decks
          </div>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-3">
            {starters.map(renderDeck)}
          </div>
        </section>
      </div>
    </div>
  )
}
