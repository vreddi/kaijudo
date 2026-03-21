import { useState, useMemo } from 'react'
import { Civilization } from '@kaijudo/react-game-types'
import { Card, CardSize } from '@kaijudo/react-card'
import { allCards, type CollectionCard } from './collectionData'

type CivFilter = 'all' | Civilization

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

      {/* Card grid using the enhanced Card component */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-5 flex-1 overflow-auto pb-4">
        {filtered.map((card) => (
          <div key={card.id} className="flex justify-center">
            <Card
              imageSrc={card.imageSrc}
              imageAlt={card.name}
              size={CardSize.Small}
              civilization={card.civilization}
              rarity={card.rarity}
              displayMode="detailed"
              name={card.name}
              manaCost={card.manaCost}
              power={card.power}
              holographic
              tiltMaxAngle={12}
              onClick={() => setSelectedCard(card)}
            />
          </div>
        ))}
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
            {/* Large card preview */}
            <Card
              imageSrc={selectedCard.imageSrc}
              imageAlt={selectedCard.name}
              size={CardSize.Large}
              civilization={selectedCard.civilization}
              rarity={selectedCard.rarity}
              displayMode="detailed"
              name={selectedCard.name}
              manaCost={selectedCard.manaCost}
              power={selectedCard.power}
              holographic
              tiltMaxAngle={20}
            />

            {/* Card info panel */}
            <div className="bg-slate-900/95 border border-slate-700/50 rounded-2xl p-6 w-72">
              <h2 className="text-base font-bold text-slate-100">{selectedCard.name}</h2>

              <div className="flex gap-2 mt-3">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-700/50 border border-slate-600/30 text-slate-300">
                  {selectedCard.civilization.charAt(0).toUpperCase() + selectedCard.civilization.slice(1)}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-700/50 border border-slate-600/30 text-slate-300">
                  {selectedCard.rarity.charAt(0).toUpperCase() + selectedCard.rarity.slice(1)}
                </span>
              </div>

              <div className="mt-5 space-y-3 text-xs">
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
                <div className="mt-5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Abilities</div>
                  {selectedCard.abilities.map((ability, i) => (
                    <p key={i} className="text-xs text-slate-300 leading-relaxed mb-1">
                      {ability}
                    </p>
                  ))}
                </div>
              )}

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
