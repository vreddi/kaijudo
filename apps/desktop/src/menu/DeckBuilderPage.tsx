import { useState, useMemo, useCallback, useEffect } from 'react'
import { Card, CardSize } from '@kaijudo/react-card'
import { loadAllCards, getPrimaryCiv, normalizeRarity, normalizeCiv, type CollectionCard } from './collectionData'
import { theme } from './theme'
import {
  DECK_SIZE,
  MAX_COPIES,
  deleteDeck,
  listDecks,
  newDeckId,
  saveDeck,
  validateDeck,
  type SavedDeck,
} from '../decks/deckStorage'
import { civColors } from './deckbuilder/civColors'
import { CardRulesTooltip } from './deckbuilder/CardRulesTooltip'
import { DeckListView } from './deckbuilder/DeckListView'

type CivFilter = string

const civLabels: Record<string, string> = {
  all: 'All',
  Light: 'Light',
  Water: 'Water',
  Darkness: 'Darkness',
  Fire: 'Fire',
  Nature: 'Nature',
}

interface DeckEntry {
  card: CollectionCard
  count: number
}

interface HoverInfo {
  card: CollectionCard
  x: number
  y: number
}

const TOOLTIP_WIDTH = 248

function DeckBuilderPage(): JSX.Element {
  const [allCards, setAllCards] = useState<CollectionCard[]>([])
  const [loading, setLoading] = useState(true)

  // View + saved decks
  const [view, setView] = useState<'list' | 'editor'>('list')
  const [decks, setDecks] = useState<SavedDeck[]>([])

  // Editor state
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null)
  const [isReadonly, setIsReadonly] = useState(false)
  const [deckName, setDeckName] = useState('New Deck')
  const [deck, setDeck] = useState<DeckEntry[]>([])
  const [dirty, setDirty] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  // Collection filters
  const [filter, setFilter] = useState<CivFilter>('all')
  const [search, setSearch] = useState('')
  const [costFilter, setCostFilter] = useState<number | null>(null)

  // Card rules hover tooltip
  const [hover, setHover] = useState<HoverInfo | null>(null)

  useEffect(() => {
    loadAllCards().then((cards) => {
      setAllCards(cards)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setDecks(listDecks())
  }, [])

  const cardById = useMemo(() => new Map(allCards.map((c) => [c.id, c])), [allCards])

  const totalCards = deck.reduce((sum, e) => sum + e.count, 0)

  const flatCardIds = useMemo(
    () => deck.flatMap((e) => Array.from({ length: e.count }, () => e.card.id)),
    [deck]
  )

  const problems = useMemo(() => validateDeck(flatCardIds), [flatCardIds])

  // --- Deck management ---

  const openDeck = useCallback(
    (saved: SavedDeck) => {
      const counts = new Map<string, number>()
      for (const id of saved.cardIds) counts.set(id, (counts.get(id) ?? 0) + 1)
      const entries: DeckEntry[] = []
      for (const [id, count] of counts) {
        const card = cardById.get(id)
        if (card) entries.push({ card, count })
      }
      setDeck(entries)
      setDeckName(saved.name)
      setCurrentDeckId(saved.id)
      setIsReadonly(!!saved.readonly)
      setDirty(false)
      setConfirmDiscard(false)
      setJustSaved(false)
      setHover(null)
      setView('editor')
    },
    [cardById]
  )

  const handleNewDeck = useCallback(() => {
    setDeck([])
    setDeckName('New Deck')
    setCurrentDeckId(null)
    setIsReadonly(false)
    setDirty(false)
    setConfirmDiscard(false)
    setJustSaved(false)
    setHover(null)
    setView('editor')
  }, [])

  const duplicateDeck = useCallback(
    (source: SavedDeck) => {
      const saved = saveDeck({
        id: newDeckId(),
        name: `${source.name} (Copy)`,
        cardIds: [...source.cardIds],
      })
      setDecks(listDecks())
      openDeck(saved)
    },
    [openDeck]
  )

  const removeDeck = useCallback(
    (id: string) => {
      deleteDeck(id)
      setDecks(listDecks())
      if (currentDeckId === id) setCurrentDeckId(null)
    },
    [currentDeckId]
  )

  const flashSaved = useCallback(() => {
    setJustSaved(true)
    window.setTimeout(() => setJustSaved(false), 1500)
  }, [])

  const handleSave = useCallback(() => {
    if (isReadonly) return
    const id = currentDeckId ?? newDeckId()
    const name = deckName.trim() || 'Untitled Deck'
    saveDeck({ id, name, cardIds: flatCardIds })
    setCurrentDeckId(id)
    setDeckName(name)
    setDirty(false)
    setConfirmDiscard(false)
    setDecks(listDecks())
    flashSaved()
  }, [isReadonly, currentDeckId, deckName, flatCardIds, flashSaved])

  /** Starters are read-only: saving forks them into a new editable deck. */
  const handleSaveCopy = useCallback(() => {
    const source = decks.find((d) => d.id === currentDeckId)
    const trimmed = deckName.trim() || 'Untitled Deck'
    const name = source && source.name === trimmed ? `${trimmed} (Copy)` : trimmed
    const id = newDeckId()
    saveDeck({ id, name, cardIds: flatCardIds })
    setCurrentDeckId(id)
    setDeckName(name)
    setIsReadonly(false)
    setDirty(false)
    setConfirmDiscard(false)
    setDecks(listDecks())
    flashSaved()
  }, [decks, currentDeckId, deckName, flatCardIds, flashSaved])

  const handleBack = useCallback(() => {
    if (dirty && !confirmDiscard) {
      setConfirmDiscard(true)
      return
    }
    setConfirmDiscard(false)
    setHover(null)
    setDecks(listDecks())
    setView('list')
  }, [dirty, confirmDiscard])

  // --- Editor: add/remove cards ---

  const addCard = useCallback(
    (card: CollectionCard) => {
      if (totalCards >= DECK_SIZE) return
      const existing = deck.find((e) => e.card.id === card.id)
      if (existing && existing.count >= MAX_COPIES) return
      setDeck((prev) =>
        existing
          ? prev.map((e) => (e.card.id === card.id ? { ...e, count: e.count + 1 } : e))
          : [...prev, { card, count: 1 }]
      )
      setDirty(true)
    },
    [deck, totalCards]
  )

  const removeCard = useCallback((cardId: string) => {
    setDeck((prev) =>
      prev
        .map((e) => (e.card.id === cardId ? { ...e, count: e.count - 1 } : e))
        .filter((e) => e.count > 0)
    )
    setDirty(true)
  }, [])

  const removeAll = useCallback((cardId: string) => {
    setDeck((prev) => prev.filter((e) => e.card.id !== cardId))
    setDirty(true)
  }, [])

  const getCardCount = useCallback(
    (cardId: string) => deck.find((e) => e.card.id === cardId)?.count ?? 0,
    [deck]
  )

  // --- Card rules tooltip ---

  const showCardHover = useCallback(
    (card: CollectionCard, e: React.MouseEvent<HTMLElement>, side: 'right' | 'left') => {
      const rect = e.currentTarget.getBoundingClientRect()
      let x = side === 'right' ? rect.right + 10 : rect.left - TOOLTIP_WIDTH - 10
      if (x + TOOLTIP_WIDTH > window.innerWidth - 8) x = rect.left - TOOLTIP_WIDTH - 10
      if (x < 8) x = 8
      setHover({ card, x, y: rect.top })
    },
    []
  )

  const clearHover = useCallback(() => setHover(null), [])

  const filtered = useMemo(() => {
    return allCards.filter((card) => {
      if (filter !== 'all') {
        const civs = Array.isArray(card.civilization) ? card.civilization : [card.civilization]
        if (!civs.some((c) => c === filter)) return false
      }
      if (search && !card.name.toLowerCase().includes(search.toLowerCase())) return false
      if (costFilter !== null) {
        if (costFilter >= 7) {
          if (card.cost < 7) return false
        } else {
          if (card.cost !== costFilter) return false
        }
      }
      return true
    })
  }, [allCards, filter, search, costFilter])

  // Deck stats
  const deckStats = useMemo(() => {
    if (deck.length === 0) return null
    const civCounts: Record<string, number> = {}
    const manaCurve: Record<number, number> = {}
    let totalMana = 0
    let creatureCount = 0

    for (const entry of deck) {
      const civs = Array.isArray(entry.card.civilization) ? entry.card.civilization : [entry.card.civilization]
      for (const civ of civs) {
        civCounts[civ] = (civCounts[civ] ?? 0) + entry.count
      }
      const cost = Math.min(entry.card.cost, 7)
      manaCurve[cost] = (manaCurve[cost] ?? 0) + entry.count
      totalMana += entry.card.cost * entry.count
      if (entry.card.type.toLowerCase().includes('creature')) {
        creatureCount += entry.count
      }
    }

    const avgMana = totalCards > 0 ? (totalMana / totalCards).toFixed(1) : '0'
    return { civCounts, manaCurve, avgMana, creatureCount }
  }, [deck, totalCards])

  // Auto-detect civilizations in deck
  const deckCivs = useMemo(() => {
    const civs = new Set<string>()
    for (const entry of deck) {
      const cardCivs = Array.isArray(entry.card.civilization) ? entry.card.civilization : [entry.card.civilization]
      cardCivs.forEach((c) => civs.add(c))
    }
    return Array.from(civs)
  }, [deck])

  const maxCurveValue = deckStats
    ? Math.max(...Object.values(deckStats.manaCurve), 1)
    : 1

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-slate-500">Loading card database...</p>
      </div>
    )
  }

  if (view === 'list') {
    return (
      <DeckListView
        decks={decks}
        cardById={cardById}
        onNew={handleNewDeck}
        onLoad={openDeck}
        onDuplicate={duplicateDeck}
        onDelete={removeDeck}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Toolbar: back / name / status / save */}
      <div
        className="flex items-center gap-3 flex-shrink-0"
        style={{ ...theme.glass, padding: '10px 16px' } as React.CSSProperties}
      >
        <button
          onClick={handleBack}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors flex-shrink-0 ${
            confirmDiscard
              ? 'bg-red-500/20 border-red-500/50 text-red-400'
              : 'bg-slate-800/50 border-slate-700/40 text-slate-400 hover:border-slate-500 hover:text-slate-200'
          }`}
        >
          {confirmDiscard ? 'Discard changes?' : '← Decks'}
        </button>
        <div className="w-px h-5 bg-slate-700/40 flex-shrink-0" />
        <input
          type="text"
          value={deckName}
          onChange={(e) => {
            setDeckName(e.target.value)
            setDirty(true)
          }}
          className="bg-transparent border-none outline-none text-sm font-bold text-slate-100 flex-1 min-w-0"
        />
        {isReadonly && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/30 flex-shrink-0">
            Starter — read-only
          </span>
        )}
        {dirty && (
          <span className="flex items-center gap-1.5 text-[10px] text-amber-400 flex-shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Unsaved
          </span>
        )}
        <span
          title={problems.join('\n')}
          className={`text-[10px] font-semibold px-2 py-1 rounded flex-shrink-0 ${
            problems.length === 0
              ? 'bg-green-500/15 text-green-400'
              : 'bg-amber-500/10 text-amber-400/80'
          }`}
        >
          {problems.length === 0
            ? 'Playable'
            : `${totalCards}/${DECK_SIZE} cards · ${problems.length} issue${problems.length === 1 ? '' : 's'}`}
        </span>
        {isReadonly ? (
          <button
            onClick={handleSaveCopy}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors flex-shrink-0 bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
          >
            {justSaved ? 'Saved ✓' : 'Save a Copy'}
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors flex-shrink-0 bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30"
          >
            {justSaved ? 'Saved ✓' : 'Save'}
          </button>
        )}
      </div>

      <div className="flex gap-5 flex-1 overflow-hidden">
        {/* Left: Collection Browser */}
        <div className="flex-[3] flex flex-col gap-3 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-base font-semibold text-slate-100">Collection</h2>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50 w-44"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-1.5 flex-wrap">
            {['all', 'Light', 'Water', 'Darkness', 'Fire', 'Nature'].map((civ) => (
              <button
                key={civ}
                onClick={() => setFilter(civ)}
                className={`px-2 py-1 rounded text-[10px] font-medium border cursor-pointer transition-colors ${
                  filter === civ
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800/50 border-slate-700/30 text-slate-500 hover:border-slate-600'
                }`}
              >
                {civLabels[civ]}
              </button>
            ))}
            <div className="w-px bg-slate-700/30 mx-1" />
            {[1, 2, 3, 4, 5, 6, 7].map((cost) => (
              <button
                key={cost}
                onClick={() => setCostFilter(costFilter === cost ? null : cost)}
                className={`w-6 h-6 rounded text-[10px] font-bold border cursor-pointer transition-colors flex items-center justify-center ${
                  costFilter === cost
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                    : 'bg-slate-800/50 border-slate-700/30 text-slate-500 hover:border-slate-600'
                }`}
              >
                {cost >= 7 ? '7+' : cost}
              </button>
            ))}
          </div>

          {/* Card grid */}
          <div
            className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3 flex-1 overflow-auto pb-2"
            onScroll={clearHover}
          >
            {filtered.slice(0, 200).map((card) => {
              const count = getCardCount(card.id)
              const atMax = count >= MAX_COPIES || totalCards >= DECK_SIZE
              return (
                <div
                  key={card.id}
                  className="relative flex justify-center"
                  onMouseEnter={(e) => showCardHover(card, e, 'right')}
                  onMouseLeave={clearHover}
                >
                  <div
                    className={`cursor-pointer transition-opacity ${atMax ? 'opacity-40' : ''}`}
                    onClick={() => !atMax && addCard(card)}
                  >
                    <Card
                      imageSrc={card.imageSrc}
                      imageAlt={card.name}
                      size={CardSize.Deck}
                      civilization={normalizeCiv(getPrimaryCiv(card))}
                      rarity={normalizeRarity(card.rarity)}
                      displayMode="detailed"
                      name={card.name}
                      manaCost={card.cost}
                      power={card.power}
                      holographic={false}
                      tiltEnabled={false}
                    />
                  </div>
                  {count > 0 && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-500 text-[10px] font-bold text-black flex items-center justify-center z-20">
                      {count}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right: Deck Panel */}
        <div className="flex-[2] flex flex-col gap-4 min-w-[280px] overflow-hidden">
          {/* Deck header */}
          <div className="flex flex-col gap-2" style={{ ...theme.glass, padding: 16 } as React.CSSProperties}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${totalCards === DECK_SIZE ? 'text-green-400' : totalCards > DECK_SIZE ? 'text-red-400' : 'text-slate-400'}`}>
                {totalCards}/{DECK_SIZE}
              </span>
              {/* Auto civilization tags */}
              <div className="flex gap-1 ml-2">
                {deckCivs.map((civ) => (
                  <span
                    key={civ}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{ background: `${civColors[civ]}30`, color: civColors[civ] }}
                  >
                    {civ.charAt(0).toUpperCase() + civ.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Deck card list */}
          <div className="flex-1 overflow-auto flex flex-col gap-1" onScroll={clearHover}>
            {deck.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-slate-600 text-center">
                  Click cards from the collection to add them to your deck
                </p>
              </div>
            ) : (
              [...deck]
                .sort((a, b) => a.card.cost - b.card.cost)
                .map((entry) => (
                  <div
                    key={entry.card.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/30 border border-slate-700/20 group hover:border-slate-600/40 transition-colors"
                    onMouseEnter={(e) => showCardHover(entry.card, e, 'left')}
                    onMouseLeave={clearHover}
                  >
                    {/* Mana cost */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{ background: civColors[getPrimaryCiv(entry.card)] ?? '#555' }}
                    >
                      {entry.card.cost}
                    </div>
                    {/* Name */}
                    <span className="text-xs text-slate-200 truncate flex-1">{entry.card.name}</span>
                    {/* Power */}
                    <span className="text-[10px] text-slate-500 flex-shrink-0">
                      {entry.card.power.toLocaleString()}
                    </span>
                    {/* Count controls */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => removeCard(entry.card.id)}
                        className="w-5 h-5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-400 hover:bg-red-500/30 hover:text-red-400 cursor-pointer flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <span className="text-xs font-semibold text-amber-400 w-4 text-center">
                        {entry.count}
                      </span>
                      <button
                        onClick={() => addCard(entry.card)}
                        disabled={entry.count >= MAX_COPIES || totalCards >= DECK_SIZE}
                        className="w-5 h-5 rounded text-[10px] font-bold bg-slate-700/50 text-slate-400 hover:bg-green-500/30 hover:text-green-400 cursor-pointer flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-default"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeAll(entry.card.id)}
                        className="w-5 h-5 rounded text-[10px] bg-slate-700/50 text-slate-500 hover:bg-red-500/30 hover:text-red-400 cursor-pointer flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Deck stats */}
          {deckStats && totalCards > 0 && (
            <div className="flex flex-col gap-3" style={{ ...theme.glass, padding: 16 } as React.CSSProperties}>
              {/* Quick stats row */}
              <div className="flex justify-between text-xs">
                <div>
                  <span className="text-slate-500">Avg Mana: </span>
                  <span className="text-slate-200 font-semibold">{deckStats.avgMana}</span>
                </div>
                <div>
                  <span className="text-slate-500">Creatures: </span>
                  <span className="text-slate-200 font-semibold">{deckStats.creatureCount}</span>
                </div>
              </div>

              {/* Mana curve */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Mana Curve</div>
                <div className="flex items-end gap-1 h-16">
                  {[1, 2, 3, 4, 5, 6, 7].map((cost) => {
                    const count = deckStats.manaCurve[cost] ?? 0
                    const height = count > 0 ? (count / maxCurveValue) * 100 : 0
                    return (
                      <div key={cost} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {count > 0 ? count : ''}
                        </span>
                        <div className="w-full rounded-t" style={{
                          height: `${height}%`,
                          minHeight: count > 0 ? 4 : 0,
                          background: `linear-gradient(to top, ${theme.accent}, rgba(212,160,23,0.4))`,
                        }} />
                        <span className="text-[9px] text-slate-600">{cost >= 7 ? '7+' : cost}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Civilization distribution */}
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Civilizations</div>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(deckStats.civCounts)
                    .sort(([, a], [, b]) => b - a)
                    .map(([civ, count]) => {
                      const pct = (count / totalCards) * 100
                      return (
                        <div key={civ} className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 w-16 truncate capitalize">{civ}</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%`, background: civColors[civ] ?? '#555' }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 w-6 text-right">{count}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card rules tooltip */}
      {hover && <CardRulesTooltip card={hover.card} x={hover.x} y={hover.y} />}
    </div>
  )
}

export default DeckBuilderPage
