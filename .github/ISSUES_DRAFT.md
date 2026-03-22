# GitHub Issues — Kaijudo Game Engine (Milestone: v0.1 Local Test Game)

---

## Issue 1: Game State Model — TypeScript types for full game state

**Labels:** `engine`, `types`, `priority:high`

### Description
Define the complete TypeScript type system for game state in a new `packages/game-engine` package.

### Acceptance Criteria
- [ ] Create `packages/game-engine` with Nx project config, tsconfig, vitest
- [ ] `GameState` interface: full snapshot of a game at any point in time
- [ ] `PlayerState`: hand, battleZone, manaZone, shieldZone, graveyard, deck (all as card arrays)
- [ ] `Zone` enum: Hand, BattleZone, ManaZone, ShieldZone, Graveyard, Deck
- [ ] `TurnPhase` enum: Untap, Draw, ChargeMana, Main, Attack, End
- [ ] `GameAction` discriminated union: DrawCard, ChargeMana, SummonCreature, CastSpell, Attack, DirectAttack, EndTurn, etc.
- [ ] `GameEvent` type for logging/replay: timestamped actions with results
- [ ] `MatchTimer` type: totalTimeMs, player1RemainingMs, player2RemainingMs
- [ ] `GameConfig`: deck size (40), max shields (5), opening hand size (5), match timer duration
- [ ] `CardInPlay` extends Creature with zone-specific state (tapped, summoningSick, canAttack)
- [ ] Reuse `Civilization`, `Rarity`, `Race`, `Creature` from `@kaijudo/react-game-types`
- [ ] 100% type coverage, no `any`

### Package Structure
```
packages/game-engine/
  src/
    types/
      game-state.ts
      player-state.ts
      actions.ts
      events.ts
      zones.ts
      timer.ts
      config.ts
    index.ts
  package.json
  tsconfig.json
  vitest.config.ts
```

---

## Issue 2: Game State Machine — Turn engine and action validation

**Labels:** `engine`, `logic`, `priority:high`

### Description
Implement the core game state machine that processes actions and advances game state through turn phases.

### Depends On
- Issue 1 (Game State Model)

### Acceptance Criteria
- [ ] `createGame(player1Deck, player2Deck, config)` — initializes GameState (shuffle, deal, set shields)
- [ ] `processAction(state, action)` — returns new GameState (immutable updates)
- [ ] `validateAction(state, action)` — returns boolean + error message
- [ ] Turn phase transitions: Untap → Draw → ChargeMana → Main → Attack → End
- [ ] Untap phase: untap all creatures in active player's battle zone
- [ ] Draw phase: draw 1 card (skip on player 1's first turn)
- [ ] Charge mana: move 1 card from hand to mana zone (optional, max 1 per turn)
- [ ] Main phase: summon creatures / cast spells if mana available
- [ ] Mana payment: tap mana zone cards to pay costs (any civilization)
- [ ] Summoning sickness: newly summoned creatures can't attack this turn
- [ ] Attack phase: select attacker → select target (creature or player)
- [ ] Battle resolution: compare power, loser goes to graveyard
- [ ] Shield break: attacking player breaks 1 shield (card goes to opponent's hand)
- [ ] Direct attack: if no shields, attack wins the game
- [ ] Deck-out detection: drawing from empty deck = lose
- [ ] Win condition check after every action
- [ ] Full test suite with vitest (≥90% coverage)

---

## Issue 3: Game Session Manager — Match lifecycle and timer

**Labels:** `engine`, `session`, `priority:high`

### Description
Manage the lifecycle of a game session: creation, timer, turn switching, and match completion.

### Depends On
- Issue 1, Issue 2

### Acceptance Criteria
- [ ] `GameSession` class/object managing a single match
- [ ] `createSession(player1Deck, player2Deck, config)` — sets up and starts a game
- [ ] Total match timer: configurable duration (default 20 minutes)
- [ ] Timer ticks down only for the active player's turn
- [ ] Timer events: `onTimerWarning` (3 min remaining), `onTimerCritical` (1 min), `onTimerExpired`
- [ ] Timer expiry = that player loses
- [ ] Turn management: `startTurn()`, `endTurn()`, `getCurrentPlayer()`
- [ ] Action dispatch: `submitAction(playerId, action)` — validates and processes
- [ ] Session state: `waiting`, `in_progress`, `completed`
- [ ] Match result: winner, loser, reason (shields broken, deck out, timer, surrender)
- [ ] Event emitter pattern for UI to subscribe to state changes
- [ ] `getVisibleState(playerId)` — returns state with opponent's hand/deck hidden
- [ ] Surrender / concede support
- [ ] Full test suite

---

## Issue 4: Battlefield UI — Game board layout and zone rendering

**Labels:** `ui`, `design`, `priority:high`

### Description
Create the battlefield React components in `packages/react-game-ui` — the visual game board with all zones.

### Depends On
- Issue 1 (types)

### Acceptance Criteria
- [ ] Create `packages/react-game-ui` with Nx config, Tailwind, Storybook stories
- [ ] `GameBoard` — full board layout (opponent area top, player area bottom, shared center)
- [ ] `PlayerArea` — contains all zones for one player
- [ ] `HandZone` — fan of cards at bottom, hover to enlarge, civilization glow
- [ ] `BattleZone` — horizontal row of creatures, shows tapped state, power badges
- [ ] `ManaZone` — stacked/fanned cards showing count and civilization breakdown
- [ ] `ShieldZone` — 5 shield slots, face-down cards, break animation placeholder
- [ ] `GraveyardZone` — card pile with count badge, click to expand/view
- [ ] `DeckZone` — face-down pile with remaining count
- [ ] Civilization-themed styling (colors, glows, borders per civilization color system)
- [ ] Dark fantasy aesthetic inspired by WarcraftCN but Duel Masters themed
- [ ] Responsive sizing (works at 900x670 Tauri window minimum)
- [ ] Storybook stories for each component with mock data

---

## Issue 5: Game HUD — Timer, turn indicator, player info, action buttons

**Labels:** `ui`, `design`, `priority:high`

### Description
Create the heads-up display components: match timer, turn phase indicator, player info bars, and action buttons.

### Depends On
- Issue 1 (types), Issue 4 (board layout)

### Acceptance Criteria
- [ ] `MatchTimer` — displays remaining time, pulses yellow at 3min, red at 1min, shakes at 30s
- [ ] `TurnPhaseIndicator` — shows current phase (Untap/Draw/Mana/Main/Attack/End) with active highlight
- [ ] `PlayerInfoBar` — avatar, player name, shield count, deck count, mana count
- [ ] `ActionButton` — styled fantasy button with civilization glow, variants: primary, secondary, danger
- [ ] `EndTurnButton` — prominent "End Turn" button with hotkey hint
- [ ] `AttackButton` — context-sensitive, shows when valid attack targets exist
- [ ] `SurrenderButton` — with confirmation dialog
- [ ] `GameOverOverlay` — victory/defeat screen with match stats
- [ ] All use WarcraftCN-inspired border-image frames and glow effects
- [ ] Motion animations for state transitions
- [ ] Storybook stories for each component

---

## Issue 6: Card Actions UI — Drag, summon, attack, and zone transitions

**Labels:** `ui`, `interaction`, `priority:medium`

### Description
Implement card interaction mechanics: dragging cards between zones, summoning, attacking, and visual feedback.

### Depends On
- Issue 2 (state machine), Issue 4 (battlefield), Issue 5 (HUD)

### Acceptance Criteria
- [ ] Drag card from hand → mana zone (charge mana)
- [ ] Drag card from hand → battle zone (summon, if mana available)
- [ ] Click creature → select as attacker → click target (attack flow)
- [ ] Visual mana payment: highlight which mana cards are being tapped
- [ ] Summoning sickness indicator on newly played creatures
- [ ] Tap/untap animation (90° rotation)
- [ ] Card hover: enlarge and show full details
- [ ] Invalid action feedback: shake animation + red flash
- [ ] Shield break: card flies from shield zone to hand
- [ ] Graveyard: defeated creature slides to graveyard pile
- [ ] Turn phase auto-advance when no more valid actions
- [ ] Keyboard shortcuts: Space = end turn, Escape = cancel action

---

## Issue 7: AI Opponent (Basic) — Simple bot for local testing

**Labels:** `engine`, `ai`, `priority:medium`

### Description
Create a basic AI opponent that can play a full game, enabling local single-player testing.

### Depends On
- Issue 2 (state machine), Issue 3 (session manager)

### Acceptance Criteria
- [ ] `BasicAI` class implementing a simple strategy
- [ ] Charge mana: always charges mana if hand has cards (prioritize non-creature or highest cost)
- [ ] Summon: play the most expensive creature it can afford each turn
- [ ] Attack: attack with all non-summoning-sick creatures
- [ ] Target selection: attack shields if no blockers, attack weakest creature if forced
- [ ] Configurable difficulty: `easy` (random choices), `medium` (greedy strategy above)
- [ ] Artificial delay between actions (500ms-1500ms) so it feels natural
- [ ] Works with GameSession — subscribes to events, submits actions on its turn
- [ ] Test suite verifying AI can complete a full game without errors
- [ ] Logging of AI decision-making for debugging

---

## Issue 8: Integration — Wire up local test game end-to-end

**Labels:** `integration`, `priority:high`

### Description
Connect all pieces: create a "Play" screen in the desktop app that starts a local game with the AI opponent.

### Depends On
- Issues 1-7

### Acceptance Criteria
- [ ] "Play" tab in desktop app navigates to deck selection screen
- [ ] Deck selection: choose from decks built in deck builder
- [ ] "Start Game" button creates a GameSession with selected deck vs AI
- [ ] Full game loop works: draw, mana, summon, attack, shields, win/lose
- [ ] Match timer displays and counts down
- [ ] Game over screen shows result and option to play again
- [ ] AI opponent plays reasonable moves with no errors
- [ ] No crashes or infinite loops during a full game
- [ ] Basic sound effects for key actions (optional)
