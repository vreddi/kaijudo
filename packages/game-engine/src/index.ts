// Types
export type { GameState, VisibleGameState, MatchResult } from "./types/game-state";
export { GameStatus } from "./types/game-state";
export type { PlayerState } from "./types/player-state";
export type {
  GameCard,
  CreatureInBattle,
  CardInMana,
} from "./types/card-in-play";
export { isCreatureInBattle, isCardInMana } from "./types/card-in-play";
export type {
  GameAction,
  DrawCardAction,
  ChargeManaAction,
  SummonCreatureAction,
  CastSpellAction,
  AttackCreatureAction,
  AttackPlayerAction,
  BlockAction,
  ShieldTriggerAction,
  ChooseTargetsAction,
  DiscardAction,
  EndPhaseAction,
  EndTurnAction,
  SurrenderAction,
} from "./types/actions";
export type {
  BaseEvent,
  GameEvent,
  ActionEvent,
  PhaseChangeEvent,
  TurnChangeEvent,
  ShieldBreakEvent,
  CreatureDestroyedEvent,
  BattleEvent,
  EffectEvent,
  GameOverEvent,
  TimerWarningEvent,
  GameOverReason,
} from "./types/events";
export type { MatchTimer } from "./types/timer";
export {
  TimerStatus,
  TIMER_WARNING_MS,
  TIMER_CRITICAL_MS,
  getTimerStatus,
} from "./types/timer";
export type { GameConfig } from "./types/config";
export { DEFAULT_GAME_CONFIG } from "./types/config";
export { Zone } from "./types/zones";
export { TurnPhase, TURN_PHASE_ORDER } from "./types/turn-phase";
export type {
  CardData,
  CardDefinition,
  Keywords,
  Ability,
  AbilityTrigger,
  Aura,
  EffectOp,
  TargetSpec,
  TargetSide,
  CreatureFilter,
  PlayableCardType,
} from "./types/ability";
export type {
  PendingDecision,
  BlockDecision,
  ShieldTriggerDecision,
  ChooseTargetsDecision,
  DiscardDecision,
  QueuedEffect,
} from "./types/decision";
export type { CombatState, PowerMod } from "./types/game-state";

// Engine
export {
  compileCard,
  buildCardRegistry,
  normalizeCivs,
  normalizeRarity,
} from "./compile";
export type { CardRegistry } from "./compile";
export { createEngine, IllegalActionError } from "./engine";
export type { Engine, NewGameParams, NewGamePlayer } from "./engine";
export { chooseAction, aiMustAct } from "./ai";
export { seedFromString, shuffle, nextRandom, randomIndex } from "./rng";
