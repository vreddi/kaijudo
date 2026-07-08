import type { GameCard } from '@kaijudo/game-engine'

/** Compact card renderings for the duel board, with a hover preview. */

const CIV_COLORS: Record<string, string> = {
  light: '#e6c619',
  water: '#1e90ff',
  darkness: '#9b59b6',
  fire: '#e63946',
  nature: '#2d9e5c',
}

export function civColor(civ: string | undefined): string {
  return CIV_COLORS[(civ ?? '').toLowerCase()] ?? '#64748b'
}

const SIZES = {
  hand: { w: 72, h: 100 },
  battle: { w: 80, h: 112 },
} as const

export function MiniCard(props: {
  card: GameCard
  size: keyof typeof SIZES
  tapped?: boolean
  sick?: boolean
  badge?: string
  highlight?: boolean
  glow?: boolean
  dimmed?: boolean
  onClick?: () => void
  onPreview?: (c: GameCard | null) => void
}): JSX.Element {
  const { card } = props
  const { w, h } = SIZES[props.size]
  const color = civColor(card.civilizations[0])
  return (
    <div
      onClick={props.onClick}
      onMouseEnter={() => props.onPreview?.(card)}
      onMouseLeave={() => props.onPreview?.(null)}
      className={`relative rounded-md overflow-hidden cursor-pointer transition-all duration-150 ${
        props.tapped ? 'rotate-90 mx-3' : ''
      } ${props.dimmed ? 'opacity-30' : ''}`}
      style={{
        width: w,
        height: h,
        border: `2px solid ${props.highlight ? '#f59e0b' : props.glow ? `${color}` : '#1e293b'}`,
        boxShadow: props.highlight
          ? '0 0 14px rgba(245,158,11,0.8)'
          : props.glow
            ? `0 0 10px ${color}80`
            : '0 2px 6px rgba(0,0,0,0.5)',
      }}
    >
      <img
        src={card.imageSrc}
        alt={card.name}
        draggable={false}
        loading="lazy"
        className="w-full h-full object-cover"
        onError={(e) => {
          // Fallback: colored placeholder with the name.
          const el = e.currentTarget
          el.style.display = 'none'
          const parent = el.parentElement
          if (parent && !parent.querySelector('.card-fallback')) {
            const div = document.createElement('div')
            div.className = 'card-fallback'
            div.style.cssText = `position:absolute;inset:0;background:${color}22;color:#e2e8f0;font-size:9px;padding:4px;display:flex;align-items:center;justify-content:center;text-align:center;`
            div.textContent = card.name
            parent.appendChild(div)
          }
        }}
      />
      {/* cost chip */}
      <span
        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
        style={{ background: color }}
      >
        {card.cost}
      </span>
      {props.badge && (
        <span className="absolute bottom-0 inset-x-0 text-center text-[9px] font-bold bg-black/70 text-slate-100 py-0.5">
          {props.badge}
        </span>
      )}
      {props.sick && !props.tapped && (
        <span className="absolute top-0.5 right-0.5 text-[9px]" title="Summoning sickness">
          💤
        </span>
      )}
    </div>
  )
}

export function CardPreview({ card, onClose }: { card: GameCard; onClose: () => void }): JSX.Element {
  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[75] w-56 pointer-events-none">
      <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900" onClick={onClose}>
        <img src={card.imageSrc} alt={card.name} className="w-full" draggable={false} />
        <div className="p-2 flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-100">{card.name}</span>
          <span className="text-[10px] text-slate-500">
            {card.civilizations.join(' / ')} · {card.type}
            {card.race ? ` · ${card.race}` : ''}
            {card.power ? ` · ${card.power.toLocaleString()}` : ''}
          </span>
          {card.rulesText.length > 0 && (
            <div className="flex flex-col gap-0.5 max-h-32 overflow-auto">
              {card.rulesText.map((line, i) => (
                <span key={i} className="text-[10px] text-slate-400 leading-snug">
                  {line}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
