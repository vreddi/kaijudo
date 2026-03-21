import { useState, useMemo } from 'react'
import { Civilization } from '@kaijudo/react-game-types'
import { allCards, type CollectionCard } from './collectionData'

type CivFilter = 'all' | Civilization

const civColors: Record<Civilization, string> = {
  [Civilization.Light]: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400',
  [Civilization.Water]: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
  [Civilization.Darkness]: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
  [Civilization.Fire]: 'bg-red-500/20 border-red-500/40 text-red-400',
  [Civilization.Nature]: 'bg-green-500/20 border-green-500/40 text-green-400',
}

const civLabels: Record<string, string> = {
  all: 'All',
  [Civilization.Light]: 'Light',
  [Civilization.Water]: 'Water',
  [Civilization.Darkness]: 'Darkness',
  [Civilization.Fire]: 'Fire',
  [Civilization.Nature]: 'Nature',
}

function CollectionPage(): JSX.Element {
  const [filter, setFilter] = useState<CivFilter>('all')
  const [search, setSearch] = useState('')
  const [selectedCard, setSelectedCard] = useState<CollectionCard | null>(null)

  const filtered = useMemo(() => {
    return allCards.filter((card) => {
      if (filter !== 'all' && card.civilization !== filter) return false
      if (search && !card.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [filter, search])

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header with filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 m-0">Card Collection</h2>
          <p className="text-xs text-slate-500 mt-1">{allCards.length} cards total &middot; {filtered.length} shown</p>
        </div>
        <input
          type="text"
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500/50 w-56"
        />
      </div>

      {/* Civilization filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...Object.values(Civilization)] as CivFilter[]).map((civ) => (
          <button
            key={civ}
            onClick={() => setFilter(civ)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              filter === civ
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-800/50 border-slate-700/30 text-slate-400 hover:border-slate-600'
            }`}
          >
            {civLabels[civ]}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4 flex-1 overflow-auto pb-4">
        {filtered.map((card) => (
          <div
            key={card.id}
            onClick={() => setSelectedCard(card)}
            className="group relative bg-slate-800/40 rounded-xl border border-slate-700/30 overflow-hidden cursor-pointer hover:border-amber-500/30 hover:scale-[1.03] transition-all duration-200"
          >
            {/* Card image */}
            <div className="relative w-full aspect-[5/7] overflow-hidden">
              <img
                src={card.imageSrc}
                alt={card.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
              {/* Rarity badge */}
              <div className="absolute top-2 right-2">
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                  civColors[card.civilization]
                }`}>
                  {card.civilization.charAt(0).toUpperCase() + card.civilization.slice(1)}
                </span>
              </div>
            </div>

            {/* Card info */}
            <div className="p-3">
              <h3 className="text-xs font-semibold text-slate-200 truncate">{card.name}</h3>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-slate-500">
                  Cost {card.manaCost}
                </span>
                <span className="text-[10px] font-semibold text-amber-400">
                  {card.power.toLocaleString()} PWR
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Card detail modal */}
      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelectedCard(null)}
        >
          <div
            className="bg-slate-900/95 border border-slate-700/50 rounded-2xl p-6 max-w-md w-full mx-4 flex gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card image */}
            <div className="w-40 flex-shrink-0 rounded-xl overflow-hidden">
              <img
                src={selectedCard.imageSrc}
                alt={selectedCard.name}
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Card details */}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-slate-100">{selectedCard.name}</h2>
              <div className="flex gap-2 mt-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  civColors[selectedCard.civilization]
                }`}>
                  {selectedCard.civilization.charAt(0).toUpperCase() + selectedCard.civilization.slice(1)}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-700/50 border border-slate-600/30 text-slate-300">
                  {selectedCard.rarity.charAt(0).toUpperCase() + selectedCard.rarity.slice(1)}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mana Cost</span>
                  <span className="text-slate-200 font-semibold">{selectedCard.manaCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Power</span>
                  <span className="text-amber-400 font-semibold">{selectedCard.power.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Race</span>
                  <span className="text-slate-200">{selectedCard.race}</span>
                </div>
              </div>

              {selectedCard.abilities && selectedCard.abilities.length > 0 && (
                <div className="mt-4">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Abilities</div>
                  {selectedCard.abilities.map((ability, i) => (
                    <p key={i} className="text-xs text-slate-300 leading-relaxed">
                      {ability}
                    </p>
                  ))}
                </div>
              )}

              <button
                onClick={() => setSelectedCard(null)}
                className="mt-4 w-full py-2 text-xs font-medium text-slate-400 bg-slate-800/50 border border-slate-700/30 rounded-lg hover:text-slate-200 hover:border-slate-600 transition-colors cursor-pointer"
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
