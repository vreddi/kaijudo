import { useState } from 'react'
import {
  GameStatus,
  TurnPhase,
  getTimerStatus,
  selectManaFor,
  type CardInMana,
  type CreatureInBattle,
  type GameCard,
  type GameEvent,
  type PendingDecision,
  type VisibleGameState,
} from '@kaijudo/game-engine'
import type { DuelSession } from './session'
import { MiniCard, CardPreview, civColor } from './cards'

/**
 * The duel board. Renders a DuelSession (local AI game or online match):
 * opponent zones on top, event log + controls in the middle band,
 * player zones below, decision prompts as overlays.
 */
export function DuelScreen({ session, onExit }: { session: DuelSession; onExit: () => void }): JSX.Element {
  const { engine, view, myPlayerId, submit } = session
  const [selectedHand, setSelectedHand] = useState<string | null>(null)
  const [attacker, setAttacker] = useState<string | null>(null)
  const [evolutionCard, setEvolutionCard] = useState<string | null>(null)
  const [preview, setPreview] = useState<GameCard | null>(null)
  const [discardPicks, setDiscardPicks] = useState<string[]>([])

  if (!engine || !view) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-slate-400">Preparing duel…</p>
      </div>
    )
  }

  const me = view.me
  const opp = view.opponent
  const myTurn = view.activePlayer === myPlayerId && !view.pendingDecision
  const decision = view.pendingDecision && view.pendingDecision.playerId === myPlayerId ? view.pendingDecision : null
  const waitingOnOpponent =
    view.status === GameStatus.InProgress &&
    ((view.pendingDecision && view.pendingDecision.playerId !== myPlayerId) ||
      (!view.pendingDecision && view.activePlayer !== myPlayerId))

  const defOf = (card: { cardId: string }) => engine.registry.get(card.cardId)

  // ---- affordances -------------------------------------------------------
  const canCharge = myTurn && view.currentPhase === TurnPhase.ChargeMana && !me.hasChargedMana
  const inMain = myTurn && (view.currentPhase === TurnPhase.ChargeMana || view.currentPhase === TurnPhase.Main)
  const inAttack = myTurn

  function playableFromHand(card: GameCard): { playable: boolean; needsBase: boolean } {
    const d = defOf(card)
    if (!d || !inMain) return { playable: false, needsBase: false }
    if (!selectManaFor(me.manaZone, d)) return { playable: false, needsBase: false }
    if (d.type === 'Evolution Creature') {
      const bases = evolutionBases(card)
      return { playable: bases.length > 0, needsBase: true }
    }
    return { playable: true, needsBase: false }
  }

  function evolutionBases(card: GameCard): CreatureInBattle[] {
    const d = defOf(card)
    if (!d) return []
    const req = d.evolutionRace?.toLowerCase()
    return me.battleZone.filter((c) => {
      if (!req || req === 'creature' || req === 'creatures') return true
      return (c.race ?? '').toLowerCase().includes(req.replace(/s$/, ''))
    })
  }

  function canAttackWith(c: CreatureInBattle): boolean {
    if (!inAttack || c.tapped) return false
    const d = defOf(c)
    if (!d || d.keywords.cantAttack) return false
    if (c.summoningSick) {
      return view!.keywordMods.some((m) => m.instanceId === c.instanceId && m.keyword === 'speedAttacker')
    }
    return true
  }

  const attackerCard = attacker ? me.battleZone.find((c) => c.instanceId === attacker) : null
  const attackerDef = attackerCard ? defOf(attackerCard) : undefined
  const canTargetPlayer = Boolean(attackerCard && attackerDef && !attackerDef.keywords.cantAttackPlayers)
  function isAttackTarget(c: CreatureInBattle): boolean {
    if (!attackerCard || !attackerDef || attackerDef.keywords.cantAttackCreatures) return false
    return c.tapped || Boolean(attackerDef.keywords.canAttackUntapped)
  }

  function effectivePowerOf(c: CreatureInBattle): number {
    let p = c.power
    for (const mod of view!.powerMods) if (mod.instanceId === c.instanceId) p += mod.amount
    return p
  }

  // ---- interactions ------------------------------------------------------
  function handleHandClick(card: GameCard): void {
    setAttacker(null)
    setEvolutionCard(null)
    setSelectedHand(selectedHand === card.instanceId ? null : card.instanceId)
  }

  function chargeSelected(): void {
    if (!selectedHand) return
    submit({ type: 'chargeMana', playerId: myPlayerId, cardInstanceId: selectedHand })
    setSelectedHand(null)
  }

  function playSelected(): void {
    if (!selectedHand) return
    const card = me.hand.find((c) => c.instanceId === selectedHand)
    if (!card) return
    const d = defOf(card)
    if (!d) return
    if (d.type === 'Spell') {
      submit({ type: 'castSpell', playerId: myPlayerId, cardInstanceId: selectedHand, manaTapIds: [] })
      setSelectedHand(null)
    } else if (d.type === 'Evolution Creature') {
      setEvolutionCard(selectedHand)
      setSelectedHand(null)
    } else {
      submit({ type: 'summonCreature', playerId: myPlayerId, cardInstanceId: selectedHand, manaTapIds: [] })
      setSelectedHand(null)
    }
  }

  function handleBattleClick(c: CreatureInBattle, mine: boolean): void {
    setSelectedHand(null)
    if (evolutionCard && mine) {
      const bases = evolutionBases(me.hand.find((h) => h.instanceId === evolutionCard) ?? c)
      if (bases.some((b) => b.instanceId === c.instanceId)) {
        submit({
          type: 'summonCreature',
          playerId: myPlayerId,
          cardInstanceId: evolutionCard,
          manaTapIds: [],
          evolutionBaseInstanceId: c.instanceId,
        })
      }
      setEvolutionCard(null)
      return
    }
    if (mine) {
      if (canAttackWith(c)) setAttacker(attacker === c.instanceId ? null : c.instanceId)
      return
    }
    if (attacker && isAttackTarget(c)) {
      submit({ type: 'attackCreature', playerId: myPlayerId, attackerInstanceId: attacker, targetInstanceId: c.instanceId })
      setAttacker(null)
    }
  }

  function attackPlayer(): void {
    if (!attacker) return
    submit({ type: 'attackPlayer', playerId: myPlayerId, attackerInstanceId: attacker })
    setAttacker(null)
  }

  const selectedCard = selectedHand ? me.hand.find((c) => c.instanceId === selectedHand) : null
  const selectedInfo = selectedCard ? playableFromHand(selectedCard) : null

  // ---- render ------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[#060714] via-[#0a0c22] to-[#060714] text-slate-200 select-none">
      {/* Opponent bar */}
      <PlayerBar
        name={opp.name}
        deckCount={opp.deckCount}
        handCount={opp.handCount}
        graveCount={opp.graveyard.length}
        shieldCount={opp.shieldCount}
        timerMs={myPlayerId === 1 ? view.timer.player2RemainingMs : view.timer.player1RemainingMs}
        active={view.activePlayer !== myPlayerId}
        top
      />

      {/* Opponent mana + battle zone */}
      <div className="flex-1 flex flex-col justify-start gap-1 px-4 pt-1 min-h-0">
        <ManaRow mana={opp.manaZone} onPreview={setPreview} />
        <ZoneRow
          label="Opponent battle zone"
          cards={opp.battleZone}
          onPreview={setPreview}
          renderBadge={(c) => `${effectivePowerOf(c).toLocaleString()}`}
          onClick={(c) => handleBattleClick(c, false)}
          highlight={(c) => Boolean(attacker && isAttackTarget(c))}
          dimmed={(c) => Boolean(attacker && !isAttackTarget(c))}
        />
      </div>

      {/* Middle band: attack-the-player target, status, log */}
      <div className="flex items-center gap-4 px-4 py-1">
        <div className="flex-1 flex items-center gap-3">
          <PhaseTrack current={view.currentPhase} myTurn={view.activePlayer === myPlayerId} turn={view.turnNumber} />
          {attacker && (
            <button
              onClick={attackPlayer}
              disabled={!canTargetPlayer}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600/80 hover:bg-red-500 disabled:opacity-40 disabled:cursor-default cursor-pointer animate-pulse"
            >
              ⚔ Attack {opp.name} {opp.shieldCount > 0 ? `(${opp.shieldCount} shields)` : '— FINAL BLOW!'}
            </button>
          )}
          {evolutionCard && <span className="text-xs text-amber-300">Choose one of your creatures to evolve</span>}
          {waitingOnOpponent && <span className="text-xs text-slate-500 italic">Waiting for {opp.name}…</span>}
        </div>
        <EventLog events={view.eventLog} me={myPlayerId} />
        <div className="flex gap-2">
          {myTurn && (
            <>
              <button
                onClick={() => submit({ type: 'endPhase', playerId: myPlayerId })}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/60 hover:bg-slate-600 cursor-pointer"
              >
                {view.currentPhase === TurnPhase.ChargeMana ? 'Skip charge' : view.currentPhase === TurnPhase.Main ? 'To attack' : 'End turn'}
              </button>
              <button
                onClick={() => submit({ type: 'endTurn', playerId: myPlayerId })}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600/80 hover:bg-amber-500 text-black cursor-pointer"
              >
                End turn
              </button>
            </>
          )}
          <button
            onClick={() => {
              if (view.status === GameStatus.InProgress && !window.confirm('Concede the duel?')) return
              if (view.status === GameStatus.InProgress) submit({ type: 'surrender', playerId: myPlayerId })
              else onExit()
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-red-900/60 text-slate-400 cursor-pointer"
          >
            {view.status === GameStatus.InProgress ? 'Concede' : 'Exit'}
          </button>
        </div>
      </div>

      {/* My battle zone + mana */}
      <div className="flex-1 flex flex-col justify-end gap-1 px-4 pb-1 min-h-0">
        <ZoneRow
          label="Your battle zone"
          cards={me.battleZone}
          onPreview={setPreview}
          renderBadge={(c) => `${effectivePowerOf(c).toLocaleString()}`}
          onClick={(c) => handleBattleClick(c, true)}
          highlight={(c) =>
            (Boolean(attacker) && attacker === c.instanceId) ||
            (Boolean(evolutionCard) &&
              evolutionBases(me.hand.find((h) => h.instanceId === evolutionCard) ?? c).some(
                (b) => b.instanceId === c.instanceId,
              ))
          }
          glow={(c) => !attacker && !evolutionCard && canAttackWith(c)}
        />
        <ManaRow mana={me.manaZone} onPreview={setPreview} />
      </div>

      {/* My bar + hand */}
      <PlayerBar
        name={me.name}
        deckCount={me.deck.length}
        handCount={me.hand.length}
        graveCount={me.graveyard.length}
        shieldCount={me.shieldZone.length}
        timerMs={myPlayerId === 1 ? view.timer.player1RemainingMs : view.timer.player2RemainingMs}
        active={view.activePlayer === myPlayerId}
      />
      <div className="flex justify-center items-end gap-1.5 px-4 pb-3 pt-1 min-h-[120px]">
        {me.hand.map((card) => {
          const info = playableFromHand(card)
          const isSelected = selectedHand === card.instanceId
          return (
            <div key={card.instanceId} className={`transition-transform ${isSelected ? '-translate-y-3' : 'hover:-translate-y-2'}`}>
              <MiniCard
                card={card}
                size="hand"
                onClick={() => handleHandClick(card)}
                onPreview={setPreview}
                highlight={isSelected}
                glow={canCharge || info.playable}
              />
            </div>
          )
        })}
        {me.hand.length === 0 && <span className="text-xs text-slate-600 pb-8">No cards in hand</span>}
      </div>

      {/* Hand action popover */}
      {selectedCard && (
        <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-[60] flex gap-2 bg-slate-900/95 border border-slate-700 rounded-xl px-3 py-2 shadow-2xl">
          {canCharge && (
            <button onClick={chargeSelected} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/80 hover:bg-emerald-500 cursor-pointer">
              ⬢ Charge mana
            </button>
          )}
          {selectedInfo?.playable && (
            <button onClick={playSelected} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600/80 hover:bg-sky-500 cursor-pointer">
              {defOf(selectedCard)?.type === 'Spell' ? '✦ Cast spell' : selectedInfo.needsBase ? '⇧ Evolve…' : '☆ Summon'}
            </button>
          )}
          {!canCharge && !selectedInfo?.playable && (
            <span className="text-xs text-slate-500 px-2 py-1.5">
              {myTurn ? 'Not enough mana' : 'Not your turn'}
            </span>
          )}
          <button onClick={() => setSelectedHand(null)} className="px-2 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Decision overlays */}
      {decision && (
        <DecisionOverlay
          decision={decision}
          view={view}
          myPlayerId={myPlayerId}
          submit={submit}
          onPreview={setPreview}
          discardPicks={discardPicks}
          setDiscardPicks={setDiscardPicks}
        />
      )}

      {/* Game over */}
      {view.status === GameStatus.Completed && view.result && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70">
          <div className="flex flex-col items-center gap-4 bg-slate-900 border border-slate-700 rounded-2xl px-12 py-10 shadow-2xl">
            <h2 className={`text-3xl font-black ${view.result.winner === myPlayerId ? 'text-amber-400' : 'text-slate-400'}`}>
              {view.result.winner === myPlayerId ? '🏆 VICTORY!' : 'DEFEAT'}
            </h2>
            <p className="text-sm text-slate-400">
              {describeReason(view.result.reason, view.result.winner === myPlayerId, opp.name)} · {view.result.totalTurns} turns
            </p>
            <button onClick={onExit} className="mt-2 px-6 py-2 rounded-xl text-sm font-bold bg-amber-600 hover:bg-amber-500 text-black cursor-pointer">
              Back to menu
            </button>
          </div>
        </div>
      )}

      {/* Error toast */}
      {session.error && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] bg-red-900/90 border border-red-700 text-red-100 text-xs px-4 py-2 rounded-lg cursor-pointer"
          onClick={session.clearError}
        >
          {session.error}
        </div>
      )}

      {/* Card preview */}
      {preview && <CardPreview card={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}

// ---------------------------------------------------------------------------

function PlayerBar(props: {
  name: string
  deckCount: number
  handCount: number
  graveCount: number
  shieldCount: number
  timerMs: number
  active: boolean
  top?: boolean
}): JSX.Element {
  const timer = formatTimer(props.timerMs)
  const timerStatus = getTimerStatus(props.timerMs)
  return (
    <div className={`flex items-center gap-4 px-4 py-1.5 bg-slate-900/60 ${props.top ? 'border-b' : 'border-t'} border-slate-800`}>
      <span className={`text-sm font-bold ${props.active ? 'text-amber-400' : 'text-slate-300'}`}>
        {props.active && '▶ '}
        {props.name}
      </span>
      <Stat icon="🛡" label="Shields" value={props.shieldCount} accent={props.shieldCount <= 1} />
      <Stat icon="🂠" label="Hand" value={props.handCount} />
      <Stat icon="≡" label="Deck" value={props.deckCount} accent={props.deckCount <= 3} />
      <Stat icon="✝" label="Grave" value={props.graveCount} />
      <span
        className={`ml-auto text-xs font-mono font-semibold ${
          timerStatus === 'critical' || timerStatus === 'expired'
            ? 'text-red-400'
            : timerStatus === 'warning'
              ? 'text-amber-400'
              : 'text-slate-500'
        }`}
      >
        ⏱ {timer}
      </span>
    </div>
  )
}

function Stat({ icon, label, value, accent }: { icon: string; label: string; value: number; accent?: boolean }): JSX.Element {
  return (
    <span className="text-xs text-slate-500">
      {icon} {label}: <span className={`font-bold ${accent ? 'text-red-400' : 'text-slate-200'}`}>{value}</span>
    </span>
  )
}

function ManaRow({ mana, onPreview }: { mana: readonly CardInMana[]; onPreview: (c: GameCard) => void }): JSX.Element {
  const untapped = mana.filter((m) => !m.tapped).length
  return (
    <div className="flex items-center gap-1 min-h-[34px]">
      <span className="text-[10px] text-slate-600 w-16 shrink-0 uppercase tracking-wide">
        Mana {untapped}/{mana.length}
      </span>
      <div className="flex gap-1 flex-wrap">
        {mana.map((m) => (
          <div
            key={m.instanceId}
            onMouseEnter={() => onPreview(m)}
            onMouseLeave={() => onPreview(null as unknown as GameCard)}
            className={`w-6 h-8 rounded-sm border text-[8px] flex items-center justify-center font-bold transition-opacity ${
              m.tapped ? 'opacity-30 rotate-90' : ''
            }`}
            style={{ borderColor: civColor(m.civilizations[0]), color: civColor(m.civilizations[0]), background: `${civColor(m.civilizations[0])}18` }}
            title={m.name}
          >
            {m.cost}
          </div>
        ))}
      </div>
    </div>
  )
}

function ZoneRow(props: {
  label: string
  cards: readonly CreatureInBattle[]
  onClick?: (c: CreatureInBattle) => void
  onPreview: (c: GameCard | null) => void
  highlight?: (c: CreatureInBattle) => boolean
  glow?: (c: CreatureInBattle) => boolean
  dimmed?: (c: CreatureInBattle) => boolean
  renderBadge?: (c: CreatureInBattle) => string
}): JSX.Element {
  return (
    <div className="flex items-center gap-2 min-h-[96px]">
      {props.cards.length === 0 ? (
        <span className="text-[10px] text-slate-700 uppercase tracking-widest mx-auto">{props.label} — empty</span>
      ) : (
        <div className="flex gap-2 mx-auto">
          {props.cards.map((c) => (
            <MiniCard
              key={c.instanceId}
              card={c}
              size="battle"
              tapped={c.tapped}
              sick={c.summoningSick}
              badge={props.renderBadge?.(c)}
              onClick={() => props.onClick?.(c)}
              onPreview={props.onPreview}
              highlight={props.highlight?.(c)}
              glow={props.glow?.(c)}
              dimmed={props.dimmed?.(c)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PhaseTrack({ current, myTurn, turn }: { current: TurnPhase; myTurn: boolean; turn: number }): JSX.Element {
  const phases: Array<[TurnPhase, string]> = [
    [TurnPhase.ChargeMana, 'Charge'],
    [TurnPhase.Main, 'Main'],
    [TurnPhase.Attack, 'Attack'],
  ]
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-slate-500 mr-1">T{turn}</span>
      {phases.map(([phase, label]) => (
        <span
          key={phase}
          className={`text-[10px] px-2 py-0.5 rounded-full border ${
            current === phase
              ? myTurn
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-sky-700 text-sky-400 bg-sky-500/10'
              : 'border-slate-800 text-slate-600'
          }`}
        >
          {label}
        </span>
      ))}
    </div>
  )
}

function EventLog({ events, me }: { events: readonly GameEvent[]; me: 1 | 2 }): JSX.Element {
  const recent = events.slice(-4).reverse()
  return (
    <div className="w-64 max-h-16 overflow-hidden flex flex-col gap-0.5">
      {recent.map((e) => {
        const text = describeEvent(e, me)
        return text ? (
          <span key={e.seq} className="text-[10px] text-slate-500 truncate leading-tight">
            {text}
          </span>
        ) : null
      })}
    </div>
  )
}

function describeEvent(e: GameEvent, me: 1 | 2): string | null {
  switch (e.type) {
    case 'shieldBreak':
      return `💥 Shield broken (${e.defendingPlayer === me ? 'yours' : 'opponent'})`
    case 'creatureDestroyed':
      return `☠ Creature destroyed (${e.owner === me ? 'yours' : 'opponent'})`
    case 'battle':
      return `⚔ Battle: ${e.outcome === 'attackerWins' ? 'attacker wins' : e.outcome === 'defenderWins' ? 'defender wins' : 'both destroyed'}`
    case 'effect':
      return `✦ ${e.description}`
    case 'turnChange':
      return `— Turn ${e.turnNumber}: ${e.activePlayer === me ? 'your turn' : "opponent's turn"}`
    case 'gameOver':
      return `🏁 Game over`
    default:
      return null
  }
}

function DecisionOverlay(props: {
  decision: PendingDecision
  view: VisibleGameState
  myPlayerId: 1 | 2
  submit: DuelSession['submit']
  onPreview: (c: GameCard | null) => void
  discardPicks: string[]
  setDiscardPicks: (ids: string[]) => void
}): JSX.Element {
  const { decision, view, myPlayerId, submit, onPreview } = props
  const findCard = (id: string): GameCard | undefined =>
    view.me.hand.find((c) => c.instanceId === id) ??
    view.me.battleZone.find((c) => c.instanceId === id) ??
    view.me.manaZone.find((c) => c.instanceId === id) ??
    view.me.graveyard.find((c) => c.instanceId === id) ??
    view.me.deck.find((c) => c.instanceId === id) ??
    view.opponent.battleZone.find((c) => c.instanceId === id) ??
    view.opponent.manaZone.find((c) => c.instanceId === id) ??
    view.opponent.graveyard.find((c) => c.instanceId === id)

  let title = ''
  let skippable = false
  let onSkip: (() => void) | undefined
  let onPick: (id: string) => void = () => {}
  let candidates: string[] = []
  let multi: { count: number; confirm: () => void } | null = null

  switch (decision.kind) {
    case 'block': {
      title = decision.attackTarget === 'player' ? 'Your opponent attacks you — block?' : 'Your opponent attacks your creature — block?'
      skippable = true
      candidates = decision.candidateIds
      onSkip = () => submit({ type: 'block', playerId: myPlayerId, blockerInstanceId: null })
      onPick = (id) => submit({ type: 'block', playerId: myPlayerId, blockerInstanceId: id })
      break
    }
    case 'shieldTrigger': {
      title = '⚡ Shield trigger! Play for free?'
      skippable = true
      candidates = decision.candidateIds
      onSkip = () => submit({ type: 'shieldTrigger', playerId: myPlayerId, cardInstanceId: null })
      onPick = (id) => submit({ type: 'shieldTrigger', playerId: myPlayerId, cardInstanceId: id })
      break
    }
    case 'chooseTargets': {
      title = `${decision.sourceName}: ${decision.description}`
      skippable = decision.optional
      candidates = decision.candidateIds
      onSkip = () => submit({ type: 'chooseTargets', playerId: myPlayerId, targetInstanceIds: [] })
      if (decision.count === 1) {
        onPick = (id) => submit({ type: 'chooseTargets', playerId: myPlayerId, targetInstanceIds: [id] })
      } else {
        onPick = (id) => {
          const next = props.discardPicks.includes(id)
            ? props.discardPicks.filter((x) => x !== id)
            : [...props.discardPicks, id].slice(0, decision.count)
          props.setDiscardPicks(next)
        }
        multi = {
          count: decision.count,
          confirm: () => {
            submit({ type: 'chooseTargets', playerId: myPlayerId, targetInstanceIds: props.discardPicks })
            props.setDiscardPicks([])
          },
        }
      }
      break
    }
    case 'discard': {
      title = `Discard ${decision.count} card${decision.count > 1 ? 's' : ''} from your hand`
      candidates = decision.candidateIds
      if (decision.count === 1) {
        onPick = (id) => submit({ type: 'discard', playerId: myPlayerId, cardInstanceIds: [id] })
      } else {
        onPick = (id) => {
          const next = props.discardPicks.includes(id)
            ? props.discardPicks.filter((x) => x !== id)
            : [...props.discardPicks, id].slice(0, decision.count)
          props.setDiscardPicks(next)
        }
        multi = {
          count: decision.count,
          confirm: () => {
            submit({ type: 'discard', playerId: myPlayerId, cardInstanceIds: props.discardPicks })
            props.setDiscardPicks([])
          },
        }
      }
      break
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-32 z-[65] flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-center gap-3 bg-slate-900/95 border border-amber-700/50 rounded-2xl px-6 py-4 shadow-2xl max-w-[80vw]">
        <span className="text-sm font-semibold text-amber-300">{title}</span>
        <div className="flex gap-2 flex-wrap justify-center max-h-48 overflow-auto">
          {candidates.map((id) => {
            const card = findCard(id)
            if (!card) return null
            const picked = props.discardPicks.includes(id)
            return (
              <MiniCard
                key={id}
                card={card}
                size="battle"
                onClick={() => onPick(id)}
                onPreview={onPreview}
                highlight={picked}
                glow
              />
            )
          })}
        </div>
        <div className="flex gap-2">
          {multi && (
            <button
              onClick={multi.confirm}
              disabled={props.discardPicks.length !== multi.count}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 text-black disabled:opacity-40 cursor-pointer"
            >
              Confirm ({props.discardPicks.length}/{multi.count})
            </button>
          )}
          {skippable && onSkip && (
            <button onClick={onSkip} className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-700/70 hover:bg-slate-600 cursor-pointer">
              {decision.kind === 'block' ? "Don't block" : decision.kind === 'shieldTrigger' ? 'Skip' : 'Decline'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function describeReason(reason: string, iWon: boolean, oppName: string): string {
  switch (reason) {
    case 'directAttack':
      return iWon ? `You landed the final blow on ${oppName}` : `${oppName} landed the final blow`
    case 'deckOut':
      return iWon ? `${oppName} ran out of cards` : 'You ran out of cards'
    case 'timerExpired':
      return iWon ? `${oppName} ran out of time` : 'You ran out of time'
    case 'surrender':
      return iWon ? `${oppName} conceded` : 'You conceded'
    default:
      return reason
  }
}

function formatTimer(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default DuelScreen
