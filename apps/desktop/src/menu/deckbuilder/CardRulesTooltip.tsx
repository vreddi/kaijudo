import { getCivs, getPrimaryCiv, type CollectionCard } from '../collectionData'
import { theme } from '../theme'
import { civColors } from './civColors'

interface CardRulesTooltipProps {
  card: CollectionCard
  x: number
  y: number
}

/** Floating card-detail panel shown while hovering a card. */
export function CardRulesTooltip({ card, x, y }: CardRulesTooltipProps) {
  const top = Math.max(8, Math.min(y, window.innerHeight - 280))
  return (
    <div
      className="fixed z-50 pointer-events-none flex flex-col gap-1.5"
      style={{ left: x, top, width: 248, ...theme.glass, padding: 14 } as React.CSSProperties}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
          style={{ background: civColors[getPrimaryCiv(card)] ?? '#555' }}
        >
          {card.cost}
        </div>
        <span className="text-xs font-bold text-slate-100 leading-tight">{card.name}</span>
      </div>
      <div className="text-[10px] text-slate-400">
        {card.type}
        {card.race ? ` — ${card.race}` : ''}
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {getCivs(card).map((civ) => (
          <span
            key={civ}
            className="text-[9px] font-bold px-1.5 py-0.5 rounded capitalize"
            style={{ background: `${civColors[civ] ?? '#555'}30`, color: civColors[civ] ?? '#999' }}
          >
            {civ}
          </span>
        ))}
        {card.power > 0 && (
          <span className="text-[10px] text-slate-500 ml-auto">{card.power.toLocaleString()} power</span>
        )}
      </div>
      {card.rulesText && card.rulesText.length > 0 ? (
        <div className="flex flex-col gap-1 border-t border-slate-700/40 pt-2 mt-0.5">
          {card.rulesText.map((line, i) => (
            <p key={i} className="text-[10px] leading-relaxed text-slate-300">
              {line}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-[10px] italic text-slate-600 border-t border-slate-700/40 pt-2 mt-0.5">
          No rules text.
        </p>
      )}
    </div>
  )
}
