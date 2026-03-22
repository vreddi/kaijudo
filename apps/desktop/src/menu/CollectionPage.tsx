import { useState, useMemo, useEffect } from 'react'
import { Card, CardSize } from '@kaijudo/react-card'
import { loadAllCards, getPrimaryCiv, normalizeRarity, normalizeCiv, type CollectionCard } from './collectionData'

type CivFilter = string

const CIVS = ['All', 'Light', 'Water', 'Darkness', 'Fire', 'Nature']

function CollectionPage(): JSX.Element {
  const [allCards, setAllCards] = useState<CollectionCard[]>([])
  const [filter, setFilter] = useState<CivFilter>('All')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [setFilter_, setSetFilter] = useState('All')
  const [selectedCard, setSelectedCard] = useState<CollectionCard | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllCards().then((cards) => {
      setAllCards(cards)
      setLoading(false)
    })
  }, [])

  const sets = useMemo(() => {
    const s = new Set<string>()
    allCards.forEach((c) => s.add(c.set))
    return ['All', ...Array.from(s).sort()]
  }, [allCards])

  const filtered = useMemo(() => {
    return allCards.filter((card) => {
      if (filter !== 'All') {
        const civs = Array.isArray(card.civilization) ? card.civilization : [card.civilization]
        if (!civs.some((c) => c === filter)) return false
      }
      if (typeFilter !== 'All' && !card.type.toLowerCase().includes(typeFilter.toLowerCase())) return false
      if (setFilter_ !== 'All' && card.set !== setFilter_) return false
      if (search && !card.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [allCards, filter, search, typeFilter, setFilter_])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-slate-500">Loading card database...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-slate-100 m-0">Card Collection</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">{allCards.length} total &middot; {filtered.length} shown</p>
        </div>
        <input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50 w-48"
        />
      </div>

      {/* Filters row */}
      <div className="flex gap-2 flex-wrap items-center">
        {/* Civilization */}
        {CIVS.map((civ) => (
          <button
            key={civ}
            onClick={() => setFilter(civ)}
            className={`px-2.5 py-1 rounded text-[10px] font-medium border cursor-pointer transition-colors ${
              filter === civ
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-800/50 border-slate-700/30 text-slate-500 hover:border-slate-600'
            }`}
          >
            {civ}
          </button>
        ))}
        <div className="w-px h-5 bg-slate-700/30 mx-1" />
        {/* Type filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1 text-[10px] text-slate-400 outline-none cursor-pointer"
        >
          <option value="All">All Types</option>
          <option value="Creature">Creature</option>
          <option value="Spell">Spell</option>
          <option value="Evolution">Evolution</option>
          <option value="Cross Gear">Cross Gear</option>
          <option value="Castle">Castle</option>
        </select>
        {/* Set filter */}
        <select
          value={setFilter_}
          onChange={(e) => setSetFilter(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded px-2 py-1 text-[10px] text-slate-400 outline-none cursor-pointer"
        >
          {sets.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 flex-1 overflow-auto pb-4">
        {filtered.slice(0, 200).map((card) => (
          <div key={`${card.id}-${card.set}`} className="flex justify-center">
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
              onClick={() => setSelectedCard(card)}
            />
          </div>
        ))}
        {filtered.length > 200 && (
          <div className="col-span-full text-center py-4">
            <p className="text-xs text-slate-500">Showing first 200 of {filtered.length} cards. Use filters to narrow results.</p>
          </div>
        )}
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="flex gap-8 items-start"
            onClick={(e) => e.stopPropagation()}
          >
            <Card
              imageSrc={selectedCard.imageSrc}
              imageAlt={selectedCard.name}
              size={CardSize.Large}
              civilization={normalizeCiv(getPrimaryCiv(selectedCard))}
              rarity={normalizeRarity(selectedCard.rarity)}
              displayMode="detailed"
              name={selectedCard.name}
              manaCost={selectedCard.cost}
              power={selectedCard.power}
              holographic
              tiltMaxAngle={20}
            />
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl p-6 w-72">
              <h2 className="text-base font-bold text-slate-100">{selectedCard.name}</h2>
              <div className="flex gap-1.5 mt-3 flex-wrap">
                {(Array.isArray(selectedCard.civilization) ? selectedCard.civilization : [selectedCard.civilization]).map((civ) => (
                  <span key={civ} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-700/50 border border-slate-600/30 text-slate-300">
                    {civ}
                  </span>
                ))}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-700/50 border border-slate-600/30 text-slate-300">
                  {selectedCard.rarity || 'No Rarity'}
                </span>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mana Cost</span>
                  <span className="text-slate-200 font-semibold">{selectedCard.cost}</span>
                </div>
                {selectedCard.power > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Power</span>
                    <span className="text-amber-400 font-semibold">{selectedCard.power.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Type</span>
                  <span className="text-slate-200">{selectedCard.type}</span>
                </div>
                {selectedCard.race && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Race</span>
                    <span className="text-slate-200">{selectedCard.race}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Set</span>
                  <span className="text-slate-200">{selectedCard.set}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Collector #</span>
                  <span className="text-slate-200">{selectedCard.collectorNum}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCard(null)}
                className="mt-5 w-full py-2 text-xs font-medium text-slate-400 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:text-slate-200 hover:border-slate-600 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectionPage
