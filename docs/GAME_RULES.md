# Duel Masters / Kaijudo -- Comprehensive Game Rules

> **Purpose**: This document serves as the definitive implementation reference for building the digital game engine. Every rule, edge case, and interaction is documented with enough precision to translate directly into code.

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Deck Building Rules](#2-deck-building-rules)
3. [Game Zones](#3-game-zones)
4. [Card Anatomy](#4-card-anatomy)
5. [Card Types](#5-card-types)
6. [Civilizations](#6-civilizations)
7. [Game Setup](#7-game-setup)
8. [Turn Structure](#8-turn-structure)
9. [Mana System](#9-mana-system)
10. [Summoning Creatures](#10-summoning-creatures)
11. [Casting Spells](#11-casting-spells)
12. [Combat](#12-combat)
13. [Shield Triggers](#13-shield-triggers)
14. [Win Conditions](#14-win-conditions)
15. [Keywords and Abilities](#15-keywords-and-abilities)
16. [Evolution Creatures](#16-evolution-creatures)
17. [Cross Gear](#17-cross-gear)
18. [Multi-Civilization Cards](#18-multi-civilization-cards)
19. [Edge Cases](#19-edge-cases)
20. [Kaijudo-Specific Variations](#20-kaijudo-specific-variations)
21. [Glossary](#21-glossary)

---

## 1. Game Overview

Duel Masters (known as **Kaijudo** in its Western reboot) is a two-player trading card game (TCG) created by Wizards of the Coast and published by Takara Tomy in Japan. The game shares lineage with Magic: The Gathering but introduces several streamlined mechanics that make it distinct.

### Core Design Principles

- **Every card can be mana.** There is no separate "land" or "energy" card type. Any card in your hand can be placed face-up into your Mana Zone to pay for other cards. This eliminates mana-screw/mana-flood while forcing strategic decisions about which cards to sacrifice for resources.
- **Five shields protect each player.** At the start of the game, each player places the top 5 cards of their deck face-down as shields. Attacking players break shields rather than dealing direct damage. Only when all shields are gone can a player deliver the final **Todomeda** (direct attack) to win.
- **Summoning sickness is universal.** Creatures cannot attack on the turn they enter the battle zone unless they have the **Speed Attacker** keyword.
- **Blockers provide reactive defense.** Creatures with the **Blocker** keyword can intercept attacks during the opponent's turn, creating a layer of defensive interaction that does not exist in the attacking player's decision tree alone.
- **No instant-speed interaction.** Unlike Magic: The Gathering, there is no stack. Spells resolve immediately when cast, and players cannot interrupt each other's turns with spells from hand (with the exception of **Shield Triggers** and **Ninja Strike**).

### Victory at a Glance

A player wins by breaking all 5 of the opponent's shields and then making one final direct attack (Todomeda), or by forcing the opponent to draw from an empty deck.

---

## 2. Deck Building Rules

### Duel Masters (OCG -- Original Card Game)

| Rule | Value |
|------|-------|
| Deck size | Exactly **40 cards** |
| Maximum copies of any single card | **4** (identified by card name) |
| Minimum copies | 0 (no mandatory inclusions) |
| Side deck | **Not used** in standard play |
| Hyperspatial Zone | 0--8 psychic/dragheart creatures (separate from the 40-card deck) |
| Super Gacharange Zone | 0--12 GR creatures (separate, exact count depends on format) |

### Kaijudo (TCG -- Western Version)

| Rule | Value |
|------|-------|
| Deck size | Exactly **40 cards** |
| Maximum copies of any single card | **3** |
| Side deck | **Not used** |
| Hyperspatial Zone | Not applicable (Kaijudo does not use psychic creatures) |

### Additional Constraints

- A deck may contain cards from any number of civilizations.
- There is no color identity restriction (unlike Commander in MTG).
- Cards are identified by their **English name** (or Japanese name in OCG) for the copy limit. Cards with different collector numbers but the same name count toward the same limit.
- Evolution creatures, Cross Gear, spells, and all other card types all count toward the 40-card deck limit.

---

## 3. Game Zones

There are **7 distinct game zones**. Each zone has specific visibility and ordering rules.

```
+------------------------------------------------------------------+
|                        GAME ZONE LAYOUT                          |
|                                                                  |
|  +------------+  +-----------+  +-----------------------------+  |
|  |   DECK     |  |  SHIELDS  |  |       BATTLE ZONE           |  |
|  | (face-down |  | (face-down|  | (face-up, tapped/untapped)  |  |
|  |  ordered)  |  |  ordered) |  |                             |  |
|  +------------+  +-----------+  +-----------------------------+  |
|                                                                  |
|  +------------+  +-----------+  +-----------------------------+  |
|  |   HAND     |  | MANA ZONE |  |       GRAVEYARD             |  |
|  | (hidden    |  | (face-up) |  | (face-up, public,           |  |
|  |  from opp) |  |           |  |  ordered by arrival)        |  |
|  +------------+  +-----------+  +-----------------------------+  |
|                                                                  |
|  +-----------------------------+                                 |
|  |     HYPERSPATIAL ZONE       |                                 |
|  | (face-up, public, separate) |                                 |
|  +-----------------------------+                                 |
+------------------------------------------------------------------+
```

### 3.1 Deck (Yamafuda)

- **Visibility**: Face-down. Neither player may look at the contents unless a card effect permits it.
- **Ordering**: Maintained. The top card is the next to be drawn.
- **Count**: Public information -- both players can always see how many cards remain.
- Cards are drawn from the top. Effects that search the deck require shuffling afterward.

### 3.2 Hand (Tefuda)

- **Visibility**: Hidden from the opponent. The owner may view their hand at any time.
- **Count**: Public information -- both players can always see the number of cards in each hand.
- **Maximum hand size**: None. There is no discard-to-hand-size rule in Duel Masters.

### 3.3 Battle Zone (Battle Zone)

- **Visibility**: Face-up. All cards are public information.
- **State**: Each creature in the battle zone is either **tapped** (turned sideways) or **untapped** (upright).
- Contains: Creatures, Evolution Creatures, Cross Gear (both crossed and uncrossed), Fortresses, and other permanents.
- Cards in the battle zone are not ordered; spatial arrangement is irrelevant to game rules.

### 3.4 Mana Zone (Mana Zone)

- **Visibility**: Face-up. All mana cards are public information.
- **State**: Each card is either tapped (used) or untapped (available).
- Any card type can exist in the mana zone. When placed here, the card functions solely as a mana source providing its civilization(s).
- Mana cards are not ordered.

### 3.5 Shield Zone (Shield Zone)

- **Visibility**: Face-down. Neither player may look at shield cards unless a card effect permits it.
- **Count**: Public information.
- **Ordering**: Shields are individually identifiable (e.g., "shield 1, shield 2...") but their content is hidden. For digital implementation, track them as an ordered list or assign each an index.
- When a shield is broken, it goes to the owner's hand (and may trigger Shield Trigger effects).

### 3.6 Graveyard (Bochi)

- **Visibility**: Face-up. Both players may examine either graveyard at any time.
- **Ordering**: Cards are placed on top of the graveyard in chronological order of arrival. Some effects reference "the top card of your graveyard."
- Contains destroyed creatures, cast spells, discarded cards, and any other cards sent to the graveyard by effects.

### 3.7 Hyperspatial Zone (Chourikiiki Zone)

- **Visibility**: Face-up. Both players can see all psychic/dragheart creatures in either player's Hyperspatial Zone at all times.
- **Not part of the main deck.** These cards are set aside at the start of the game.
- Psychic creatures and Dragheart creatures are summoned from this zone via specific spell effects or abilities (e.g., Hyperspatial spells).
- When a psychic/dragheart creature would leave the battle zone for any reason other than being flipped, it returns to the Hyperspatial Zone instead of going to the graveyard.

---

## 4. Card Anatomy

### 4.1 Creature Card Layout

```
+-----------------------------------------------+
|  [Civilization Banner / Color]                 |
|                                                |
|  CARD NAME                          COST: 5    |
|                                                |
|  +-------------------------------------------+|
|  |                                           ||
|  |              ARTWORK                      ||
|  |                                           ||
|  +-------------------------------------------+|
|                                                |
|  Race: Armored Dragon                          |
|  Civilization: Fire                            |
|                                                |
|  [Card Text / Abilities]                       |
|  "Speed Attacker"                              |
|  "Double Breaker"                              |
|  "When you put this creature into the battle   |
|   zone, destroy one of your opponent's          |
|   creatures that has power 5000 or less."      |
|                                                |
|  [Flavor Text in italics]                      |
|                                                |
|  POWER: 7000                                   |
|  [Set Symbol]  [Rarity]  [Collector Number]    |
+-----------------------------------------------+
```

**Fields:**

| Field | Description |
|-------|-------------|
| **Card Name** | Unique identifier. Copy limits are enforced by name. |
| **Cost** | Mana cost (top-right corner). An integer representing how many mana cards must be tapped. |
| **Civilization** | The color/faction (Light, Water, Darkness, Fire, Nature). Determines the card's frame color and mana requirements. Multi-civ cards have split frames. |
| **Race** | One or more race types (e.g., Armored Dragon, Human, Beast Folk). Races are referenced by evolution requirements and tribal effects. |
| **Card Text** | Rules text describing keywords, triggered abilities, static abilities, and activated abilities. |
| **Flavor Text** | Non-rules text for lore purposes. Italicized. Has no game effect. |
| **Power** | The creature's strength (bottom-right). Used for combat comparison. Always a positive multiple of 500 in most sets (though some break this convention). |
| **Set Symbol** | Identifies which expansion set the card belongs to. |
| **Rarity** | Common, Uncommon, Rare, Very Rare, Super Rare, etc. |
| **Collector Number** | Unique within a set for cataloging. |

### 4.2 Spell Card Layout

```
+-----------------------------------------------+
|  [Civilization Banner / Color]                 |
|                                                |
|  CARD NAME                          COST: 3    |
|                                                |
|  +-------------------------------------------+|
|  |              ARTWORK                      ||
|  +-------------------------------------------+|
|                                                |
|  Spell                                         |
|  Civilization: Water                           |
|                                                |
|  [Card Text / Effect]                          |
|  "Draw 2 cards."                               |
|                                                |
|  [Flavor Text in italics]                      |
|                                                |
|  [Set Symbol]  [Rarity]  [Collector Number]    |
+-----------------------------------------------+
```

**Key differences from creatures:**
- Spells have **no Power** value.
- Spells have **no Race**.
- Spells resolve immediately and go to the graveyard after resolution (unless they are Charger spells that go to the mana zone).

---

## 5. Card Types

### 5.1 Creatures

The primary card type. Creatures enter the battle zone, participate in combat, and have Power values. They remain in the battle zone until destroyed or removed by an effect.

- Subject to summoning sickness (cannot attack the turn they are played).
- Can be tapped to attack shields or tapped opponent creatures.
- Can be assigned as blockers if they have the Blocker keyword.

### 5.2 Evolution Creatures

A specialized subtype of creature that must be placed **on top of** a qualifying base creature already in the battle zone.

- The base creature must share at least one Race with the evolution creature's specified evolution requirement.
- Evolution creatures are **not** subject to summoning sickness -- they can attack immediately.
- When an evolution creature is destroyed, all cards underneath it also go to the graveyard (unless a specific effect says otherwise).
- See [Section 16](#16-evolution-creatures) for full details.

### 5.3 Spells

One-shot effects. When cast, the spell's effect resolves immediately, then the spell card goes to the graveyard.

- **Charger** spells go to the mana zone instead of the graveyard after resolution.
- Spells cannot remain in the battle zone.
- See [Section 11](#11-casting-spells) for full details.

### 5.4 Cross Gear

Cross Gear are equipment-like permanents that exist in the battle zone independently and can be attached ("crossed") to creatures.

- Cross Gear are first **generated** (played into the battle zone uncrossed) by paying their cost.
- They can then be **crossed** onto a creature by paying a separate cross cost.
- When uncrossed, they remain in the battle zone as standalone cards.
- When the creature they are crossed with is destroyed, the Cross Gear remains in the battle zone (uncrossed).
- See [Section 17](#17-cross-gear) for full details.

### 5.5 Fortresses

Fortress cards (introduced in later OCG sets) are permanents that occupy the shield zone face-up, providing ongoing effects.

- A Fortress is placed into the shield zone as a card effect (not as a regular shield).
- Fortresses have ongoing static or triggered abilities.
- When a Fortress is "broken" (attacked as a shield), it goes to the graveyard.
- Fortresses are not present in all formats and are absent from Kaijudo.

### 5.6 Other Types (Advanced)

Later OCG expansions introduced additional types:

- **Psychic Creatures**: Reside in the Hyperspatial Zone. Double-sided cards that can "awaken" (flip) when conditions are met.
- **Dragheart Creatures/Weapons/Fortresses**: Three-phase cards that transform from Weapon to Creature to Fortress (or vice versa).
- **GR Creatures**: Part of the Gacharange system with randomized summoning.
- **Tamaseed**: Seed-type cards that can evolve into creatures.
- **Star Evolution Creatures**: Evolution creatures that stack on top but allow the base creature to remain as a separate entity if the evolution is removed.

---

## 6. Civilizations

Every card belongs to one or more of five civilizations. Civilizations define a card's color identity and mechanical themes.

### 6.1 Light (Hikari) -- White/Yellow

| Attribute | Detail |
|-----------|--------|
| **Mechanical Focus** | Defense, blocking, tapping opponent creatures, untapping own creatures, shield manipulation, "can't be attacked" effects |
| **Signature Keywords** | Blocker, Shield Trigger (high density), "can't attack" / "can't be attacked" |
| **Common Races** | Angel Command, Berserker, Guardian, Mecha del Sol, Initiate, Gladiator |
| **Flavor** | Order, justice, protection, holy warriors |

Light excels at **board control through defensive permanents**. Light creatures tend to have high power relative to cost but often carry restrictions such as "this creature can't attack players."

### 6.2 Water (Mizu) -- Blue

| Attribute | Detail |
|-----------|--------|
| **Mechanical Focus** | Card draw, bounce (returning cards to hand), deck/hand manipulation, unblockable attacks |
| **Signature Keywords** | "Can't be blocked," Shield Trigger (on draw spells) |
| **Common Races** | Cyber Lord, Cyber Virus, Liquid People, Leviathan, Merfolk, Sea Hacker |
| **Flavor** | Intelligence, technology, the deep ocean |

Water is the **card advantage** civilization. It struggles with raw power but compensates with information advantage and tempo plays.

### 6.3 Darkness (Yami) -- Black/Purple

| Attribute | Detail |
|-----------|--------|
| **Mechanical Focus** | Creature destruction, hand destruction (discard), graveyard recursion, self-sacrifice for advantage, "slayer" effects |
| **Signature Keywords** | Slayer, Shield Trigger (on removal spells) |
| **Common Races** | Demon Command, Ghost, Living Dead, Dark Lord, Brain Jacker, Chimera |
| **Flavor** | Death, corruption, forbidden power |

Darkness specializes in **resource denial and attrition**. It has the most efficient single-target removal and can reanimate creatures from the graveyard.

### 6.4 Fire (Hi) -- Red

| Attribute | Detail |
|-----------|--------|
| **Mechanical Focus** | Speed Attacker, power-based destruction (destroy creatures with power X or less), multi-target attacks, Double/Triple Breaker, aggressive tempo |
| **Signature Keywords** | Speed Attacker, Power Attacker, Double Breaker, Triple Breaker |
| **Common Races** | Armored Dragon, Dragonoid, Human, Armorloid, Rock Beast, Beat Jockey |
| **Flavor** | Aggression, warfare, dragons, volcanoes |

Fire is the **aggressive** civilization. It trades efficiency and card advantage for speed. Fire creatures can attack immediately and break multiple shields per attack.

### 6.5 Nature (Shizen) -- Green

| Attribute | Detail |
|-----------|--------|
| **Mechanical Focus** | Mana acceleration (putting extra cards into mana zone), mana recovery (returning mana to hand), high-power creatures, searching deck for cards |
| **Signature Keywords** | "Put the top card of your deck into your mana zone," Power Attacker |
| **Common Races** | Beast Folk, Giant, Tree Folk, Horned Beast, Mystery Totem, Snow Faerie |
| **Flavor** | Raw strength, forests, primal beasts |

Nature is the **ramp** civilization. It accelerates mana development to deploy large threats ahead of schedule.

### Civilization Interaction Matrix

Civilizations have allied and enemy pairings that influence multi-civilization card design:

```
         Light
        /     \
    Water --- Darkness
      |    X    |
    Nature --- Fire
```

- **Allied pairs** (adjacent): Light-Water, Water-Darkness, Darkness-Fire, Fire-Nature, Nature-Light
- **Enemy pairs** (across): Light-Darkness, Water-Fire, Nature-Water, Light-Fire, Darkness-Nature

Multi-civilization cards typically use allied pairs, though enemy-pair cards exist in later sets.

---

## 7. Game Setup

### Step-by-Step Setup Procedure

```
SETUP SEQUENCE
==============

1. Both players shuffle their 40-card decks.
   (Opponent may cut/shuffle the other player's deck.)

2. Determine who goes first.
   (Random method: coin flip, rock-paper-scissors, etc.)

3. Each player places their deck face-down in the Deck Zone.

4. Each player takes the TOP 5 CARDS of their deck and
   places them face-down in their Shield Zone WITHOUT
   looking at them.

   IMPORTANT: Neither player may look at their shields
   during setup.

5. Each player draws 5 cards from the top of their deck
   into their hand.

6. (Optional) If using Hyperspatial Zone cards (psychic
   creatures, draghearts), place them face-up in the
   Hyperspatial Zone.

7. The first player begins their turn.
   NOTE: The player who goes first SKIPS their draw step
   on their very first turn.
```

### Setup State Summary

| Zone | Player 1 (goes first) | Player 2 |
|------|-----------------------|----------|
| Deck | 30 cards remaining | 30 cards remaining |
| Hand | 5 cards | 5 cards |
| Shields | 5 cards (face-down) | 5 cards (face-down) |
| Mana Zone | Empty | Empty |
| Battle Zone | Empty | Empty |
| Graveyard | Empty | Empty |

### Mulligan Rule

- **Duel Masters (OCG)**: There is no official mulligan rule in standard Duel Masters.
- **Kaijudo (TCG)**: Similarly, no mulligan. However, some tournament formats may adopt house rules.
- **Digital Implementation Note**: Consider offering a mulligan option as a configurable rule for casual play.

---

## 8. Turn Structure

Each turn consists of **6 phases** executed in strict order. A player must complete each phase before moving to the next.

### Turn Sequence Flow Diagram

```
+================================================================+
|                      TURN STRUCTURE                             |
+================================================================+
|                                                                 |
|   +------------------+                                          |
|   | 1. UNTAP PHASE   |  Untap all your tapped cards in the     |
|   |                  |  Battle Zone and Mana Zone.              |
|   +--------+---------+                                          |
|            |                                                    |
|            v                                                    |
|   +------------------+                                          |
|   | 2. DRAW PHASE    |  Draw 1 card from the top of your deck.  |
|   |                  |  (Skipped on the very first turn of the  |
|   |                  |   game for the first player ONLY.)       |
|   +--------+---------+                                          |
|            |                                                    |
|            v                                                    |
|   +------------------+                                          |
|   | 3. CHARGE MANA   |  You MAY place 1 card from your hand     |
|   |    PHASE         |  into your Mana Zone face-up.            |
|   |                  |  (This is optional. Max 1 per turn.)     |
|   +--------+---------+                                          |
|            |                                                    |
|            v                                                    |
|   +------------------+                                          |
|   | 4. MAIN PHASE    |  Summon creatures, cast spells,          |
|   |                  |  generate/cross Cross Gear.              |
|   |                  |  (You may play multiple cards if you     |
|   |                  |   can pay for them.)                     |
|   +--------+---------+                                          |
|            |                                                    |
|            v                                                    |
|   +------------------+                                          |
|   | 5. ATTACK PHASE  |  Attack with your untapped creatures     |
|   |                  |  that do NOT have summoning sickness.    |
|   |                  |  (Each creature may attack once.)        |
|   |                  |  Attacks are declared one at a time.     |
|   +--------+---------+                                          |
|            |                                                    |
|            v                                                    |
|   +------------------+                                          |
|   | 6. END PHASE     |  Resolve any "at end of turn" effects.   |
|   |                  |  Turn passes to the opponent.            |
|   +------------------+                                          |
|                                                                 |
+=================================================================+
```

### 8.1 Untap Phase

- Untap **all** of your cards in the Battle Zone (creatures and Cross Gear).
- Untap **all** of your cards in the Mana Zone.
- No player may use abilities during this phase.
- This is mandatory and automatic.

### 8.2 Draw Phase

- Draw exactly **1 card** from the top of your deck.
- **Exception**: The very first player of the game skips their draw on their first turn. (The second player draws normally on their first turn.)
- If you cannot draw because your deck is empty, you **lose the game immediately** (see [Section 14](#14-win-conditions)).
- Some card effects modify the number of cards drawn (e.g., "draw 2 cards instead of 1 at the start of your turn").

### 8.3 Charge Mana Phase

- You **may** place exactly **1 card** from your hand into your Mana Zone face-up.
- This is **optional**. You are never forced to charge mana.
- The card is placed face-up, revealing its civilization(s) to both players.
- You can place **any** card type as mana (creature, spell, Cross Gear, etc.).
- You may not charge more than 1 card per turn (unless a card effect says otherwise).
- Mana charged this turn enters **untapped** (available for use during the Main Phase).

### 8.4 Main Phase

During the Main Phase, you may perform any combination of the following actions, in any order, as many times as you can pay for:

- **Summon a creature** from your hand by paying its mana cost.
- **Cast a spell** from your hand by paying its mana cost.
- **Generate Cross Gear** from your hand by paying its cost.
- **Cross a Cross Gear** already in the battle zone onto a creature by paying the cross cost.
- **Use activated abilities** of creatures/permanents you control (if they have any that are usable during the Main Phase).
- **Evolve a creature** by placing an Evolution Creature from your hand onto a qualifying base creature and paying the evolution creature's cost.

There is no limit to the number of cards you can play in a single Main Phase, provided you can pay for each one.

### 8.5 Attack Phase

- You may attack with any number of your **untapped** creatures that **do not have summoning sickness**.
- Each creature may attack **at most once** per turn.
- Attacks are declared and resolved **one at a time** (you do not declare all attacks simultaneously).
- For each attack, you must choose one of the following targets:
  1. **An opponent's shield** (any one shield).
  2. **An opponent's tapped creature** in the battle zone.
  3. **The opponent directly** (Todomeda) -- only if the opponent has **zero shields**.
- You **cannot** attack an opponent's untapped creature directly (but blockers can intercept; see [Section 12](#12-combat)).
- Attacking causes your creature to become **tapped**.
- See [Section 12](#12-combat) for full combat rules.

### 8.6 End Phase

- Resolve any "at the end of your turn" triggered abilities.
- Remove any "until end of turn" effects.
- Announce that your turn is over.
- The opponent begins their turn.

---

## 9. Mana System

### Core Mana Rules

1. **Any card can be mana.** When placed in the Mana Zone, a card functions as one mana of its civilization(s), regardless of the card's type, cost, or other attributes.

2. **One mana per card.** Each card in the Mana Zone provides exactly **1 mana** when tapped, regardless of the card's printed cost. A 10-cost dragon in the mana zone still provides only 1 mana.

3. **Civilization requirements.** When paying a cost, you must tap a number of mana cards equal to the cost. At least **one** of the tapped mana cards must share a civilization with the card you are playing. The remaining mana can be of any civilization.

   **Example:** To play a 5-cost Fire creature, you tap 5 mana cards. At least 1 of those 5 must be a Fire civilization card. The other 4 can be any civilization.

4. **Multi-civilization mana.** A multi-civilization card in the Mana Zone counts as **all** of its civilizations simultaneously. A Light/Water card in the mana zone can satisfy either a Light requirement or a Water requirement (or both, if the card being paid for requires both).

5. **Tapping and untapping.** Mana cards are tapped when used and untap at the beginning of your next turn (Untap Phase). You cannot use tapped mana.

### Mana Charging Details

- Charging mana happens during the Charge Mana Phase (Phase 3).
- The card enters the Mana Zone **untapped** (it is immediately available).
- Charging is face-up, revealing the card to the opponent.
- Once in the Mana Zone, a card stays there unless moved by a card effect (e.g., Nature effects that return mana to hand, or effects that destroy mana).

### Mana Cost Payment Algorithm (for Implementation)

```
function canPayCost(card, manaZone):
    cost = card.cost
    requiredCivs = card.civilizations
    availableMana = manaZone.filter(m => m.untapped)

    if availableMana.length < cost:
        return false

    // Check if at least one available mana matches each required civilization
    for civ in requiredCivs:
        if not availableMana.any(m => civ in m.civilizations):
            return false

    return true

function payMana(card, manaZone):
    cost = card.cost
    requiredCivs = card.civilizations

    // Step 1: Reserve one mana for each unique required civilization
    reserved = []
    for civ in requiredCivs:
        // Find an untapped mana that provides this civ
        // Prefer multi-civ cards that cover multiple requirements
        candidate = findBestMatch(civ, manaZone, reserved)
        reserved.add(candidate)

    // Step 2: Tap remaining (cost - reserved.length) from any untapped mana
    remaining = cost - reserved.length
    tapAny(remaining, manaZone, reserved)

    // Step 3: Tap all reserved mana
    tapAll(reserved)
```

### Special Mana Interactions

- **Mana acceleration**: Nature effects like "put the top card of your deck into your mana zone" give extra mana beyond the 1-per-turn charge.
- **Mana removal**: Some Darkness and Fire effects destroy opponent's mana cards (send them to the graveyard from the mana zone).
- **Mana recovery**: Nature effects can return mana zone cards to the hand, reclaiming them for other uses.
- **Free costs**: A card with cost 0 can be played without tapping any mana (no civilization requirement applies since you tap 0 cards -- implementation note: some rulings require having at least the appropriate civilization in your mana zone even for 0-cost cards).

---

## 10. Summoning Creatures

### Basic Summoning Procedure

1. **Announce** the creature you wish to summon from your hand.
2. **Pay the mana cost** by tapping the required number of mana cards (at least 1 matching the creature's civilization).
3. **Place the creature** face-up in your Battle Zone in the **untapped** position.
4. **Resolve any "when you put this creature into the battle zone" (CIP) abilities** immediately.
5. The creature now has **summoning sickness** and cannot attack this turn.

### Summoning Sickness

- A creature cannot attack on the turn it enters the battle zone.
- Summoning sickness is not a status -- it is a rule: a creature may only attack if it was in the battle zone at the start of the current turn.
- Summoning sickness does **not** prevent a creature from using activated abilities (unless the ability specifically requires tapping, in which case the creature may still be tapped for the ability cost in Duel Masters, unlike MTG).
  - **Clarification**: In Duel Masters, summoning sickness ONLY restricts attacking. It does not prevent tapping for ability costs.
- Summoning sickness does **not** prevent a creature from being used as an evolution base.

### Exceptions to Summoning Sickness

| Exception | Rule |
|-----------|------|
| **Speed Attacker** | A creature with Speed Attacker can attack the turn it enters the battle zone. |
| **Evolution Creatures** | Evolution Creatures ignore summoning sickness entirely. They can attack immediately regardless of when the base creature was played. |
| **Specific card effects** | Some card effects grant "this creature can attack the turn it enters the battle zone." |

### Summoning Restrictions

- You may only summon creatures during your Main Phase.
- You may summon multiple creatures in a single turn if you can pay for each.
- You must have enough untapped mana of the correct civilization(s) to pay the cost.

---

## 11. Casting Spells

### Basic Spell Procedure

1. **Announce** the spell you wish to cast from your hand.
2. **Pay the mana cost** by tapping the required number of mana cards (at least 1 matching the spell's civilization).
3. **Resolve the spell effect immediately.** There is no stack. The effect happens right away.
4. **Place the spell card into your graveyard** (unless it has the Charger keyword).

### No Stack Mechanism

Unlike Magic: The Gathering, Duel Masters has **no stack**. When a spell is cast:

- Its effect resolves immediately and completely before any other actions can be taken.
- The opponent cannot respond to a spell being cast with spells of their own (no counterspells from hand during opponent's turn, though Shield Triggers function as reactive spells when shields are broken).
- If a spell has multiple effects, they resolve in the order printed on the card.

### Charger Keyword

Spells with the **Charger** keyword go to the **Mana Zone** instead of the graveyard after resolution.

- The spell resolves normally first.
- After resolution, instead of going to the graveyard, it is placed in the Mana Zone face-up and untapped.
- This effectively makes the spell cost 1 less in net resources (you get a mana card out of it).

### Spell Timing

- Spells may only be cast during your Main Phase (from hand).
- Exception: **Shield Trigger** spells can be cast for free when the shield containing them is broken (during the opponent's turn). See [Section 13](#13-shield-triggers).
- Exception: **Ninja Strike** allows certain creatures/spells to be played from hand during the opponent's attack phase under specific conditions.

---

## 12. Combat

### Combat Overview

Combat in Duel Masters is asymmetric: the attacking player chooses what to attack, and the defending player can optionally intercept with blockers.

### Attack Targets

An attacking creature must target one of the following:

1. **A shield** -- the attack breaks (removes) the targeted shield.
2. **A tapped opponent creature** -- combat occurs between the two creatures.
3. **The opponent directly (Todomeda)** -- only legal when the opponent has **0 shields** remaining.

**You cannot directly attack an untapped creature.** This is a fundamental rule. The only way to engage an untapped creature is if it has Blocker and its controller chooses to block with it.

### Combat Flow Diagram

```
+=================================================================+
|                    COMBAT FLOW (Per Attack)                      |
+=================================================================+
|                                                                  |
|  ATTACKER declares attack                                        |
|  (Creature taps --> becomes tapped)                              |
|           |                                                      |
|           v                                                      |
|  Choose target:                                                  |
|    [A] Shield  [B] Tapped Creature  [C] Direct (0 shields)      |
|           |                                                      |
|           v                                                      |
|  +--------------------+     YES    +-------------------------+   |
|  | Defender has an     |---------->| Defender CHOOSES to      |   |
|  | untapped creature   |           | block? (optional)        |   |
|  | with BLOCKER?       |           +------------+------------+   |
|  +---------+----------+                        |                 |
|            | NO                          YES    |    NO           |
|            |                     +------+       +------+         |
|            v                     v                     v         |
|  +---------+----------+  +------+--------+   +---------+-----+  |
|  | Proceed to target   |  | BLOCKER       |   | Proceed to    |  |
|  | resolution           |  | intercepts    |   | original      |  |
|  |                      |  | the attack    |   | target        |  |
|  +----------+----------+  +------+--------+   +--------+-----+  |
|             |                     |                     |        |
|             v                     v                     |        |
|  +----------+---------------------+---------------------+-----+  |
|  |                    TARGET RESOLUTION                        |  |
|  +-----+-----------------------------------------------------+  |
|        |                                                         |
|        +--------+-----------+-----------+                        |
|                 |           |           |                         |
|                 v           v           v                         |
|          [SHIELD]    [CREATURE]   [DIRECT]                       |
|                 |           |           |                         |
|                 v           v           v                         |
|           Break the    Compare     Attacking                     |
|           shield and   power:      player WINS                   |
|           add to       Higher      the game!                     |
|           owner's      power                                     |
|           hand.        wins.                                     |
|                 |           |                                    |
|                 v           v                                    |
|           Check for   Loser is                                   |
|           SHIELD      DESTROYED                                  |
|           TRIGGER!    (goes to                                   |
|                       graveyard)                                 |
|                 |           |                                    |
|                 v           v                                    |
|           If trigger, Equal power?                               |
|           owner MAY   --> BOTH are                               |
|           cast it     destroyed!                                 |
|           for free.                                              |
|                                                                  |
+=================================================================+
```

### Blocker Interception

When an attack is declared:

1. The defending player checks if they have any **untapped** creatures with the **Blocker** keyword.
2. If yes, the defending player **may** (but is not required to) choose one Blocker to intercept.
3. The Blocker taps and becomes the new target of the attack, replacing the original target entirely.
4. Combat is then resolved between the attacker and the Blocker.
5. **A Blocker can intercept attacks targeting shields, tapped creatures, or direct attacks.**
6. Only **one** Blocker can intercept a single attack.

### Power Comparison (Creature vs. Creature Combat)

When two creatures are in combat (either because the attacker targeted a tapped creature or a Blocker intercepted):

| Scenario | Result |
|----------|--------|
| Attacker power > Defender power | Defender is destroyed (sent to graveyard). Attacker survives. |
| Attacker power < Defender power | Attacker is destroyed (sent to graveyard). Defender survives. |
| Attacker power = Defender power | **Both** creatures are destroyed. |

- Power modifiers from abilities (e.g., Power Attacker) are applied during this comparison.
- Power Attacker only applies when the creature is **attacking**, not when blocking or being attacked.

### Shield Breaking

When an attack targeting a shield resolves (no blocker intercepted):

1. The targeted shield is **broken** -- removed from the Shield Zone.
2. The broken shield card goes to the **owner's hand**.
3. Before it goes to the hand, check for **Shield Trigger** (see [Section 13](#13-shield-triggers)).
4. If the creature has **Double Breaker**, it breaks **2 shields** instead of 1.
5. If the creature has **Triple Breaker**, it breaks **3 shields** instead of 1.
6. If the creature has **World Breaker**, it breaks **all shields**.
7. If there are fewer shields than the number to be broken, break all remaining shields. No excess carry-over to direct attack.

### Multiple Shield Breaks

When a creature with Double Breaker or Triple Breaker attacks:

- The attacker's controller chooses which shields to break.
- All chosen shields are broken simultaneously.
- Each broken shield is checked for Shield Trigger individually.
- If multiple Shield Triggers are activated, the defending player chooses the order in which to resolve them.
- All Shield Trigger resolutions happen **before** play continues.

### Attacking a Tapped Creature

- You may choose to attack any of the opponent's **tapped** creatures.
- The attack is resolved as creature-vs-creature combat (power comparison).
- If the attacker wins, the tapped creature is destroyed.
- If the tapped creature wins, the attacker is destroyed.
- If they tie, both are destroyed.
- Blockers can still intercept attacks targeted at tapped creatures.

---

## 13. Shield Triggers

### What is a Shield Trigger?

A Shield Trigger is a keyword found on certain creature and spell cards. When a card with Shield Trigger is broken as a shield and added to the player's hand, the player may **immediately cast or summon it for free**.

### Shield Trigger Rules

1. **Activation Timing**: Shield Triggers activate at the moment the shield is broken, before play continues. This happens during the **opponent's attack phase**.

2. **Optional**: Activating a Shield Trigger is always **optional**. The player may choose to simply add the card to their hand instead.

3. **Free Cost**: When a Shield Trigger is activated, the card is played **without paying its mana cost**. No mana is tapped.

4. **Spell Shield Triggers**: The spell resolves immediately (as normal for spells), then goes to the graveyard (or mana zone if it is also a Charger).

5. **Creature Shield Triggers**: The creature is placed directly into the Battle Zone. It **does** have summoning sickness (unless it also has Speed Attacker). It can, however, block during that same opponent's attack phase if it has the Blocker keyword.

6. **Multiple Shield Triggers**: If multiple shields are broken simultaneously (by a Double/Triple Breaker) and more than one has Shield Trigger, the defending player:
   - First adds all broken shields to hand.
   - Then chooses the order to resolve Shield Triggers.
   - Each trigger resolves fully before the next one begins.

7. **Shield Trigger vs. Attacking Creature**: A Shield Trigger spell that destroys the attacking creature **does not prevent the remaining shields from being broken** if the attacker has Double/Triple Breaker. All shield breaks from a single attack are considered simultaneous. However, if the Shield Trigger destroys the attacking creature, any **subsequent attacks** by that creature are obviously prevented (since it no longer exists).

### Shield Trigger vs. Direct Attack (Todomeda)

If a player attacks directly (opponent has 0 shields), Shield Triggers cannot activate because no shields are broken. The attack simply wins the game. However, Blockers and Ninja Strike effects can still intervene before the direct attack resolves.

---

## 14. Win Conditions

### 14.1 Todomeda (Direct Attack)

The primary win condition. A player wins when:

1. The opponent has **0 shields** remaining, AND
2. One of the player's creatures makes a **successful direct attack** (attacking the opponent rather than a shield).

The attacking creature must:
- Be untapped and not have summoning sickness.
- Declare an attack against the opponent (legal only when opponent has 0 shields).
- Not be intercepted by a Blocker (if blocked, the attack is redirected to the Blocker creature instead).
- The direct attack must resolve successfully.

**Multiple Attacks**: You do not need to break all shields and deliver the finishing blow in a single turn. You can break shields over multiple turns and deliver Todomeda whenever the opponent has 0 shields.

### 14.2 Deck Out (Library Out)

A player who must draw a card but has **no cards remaining in their deck** loses the game immediately.

- This is checked during the Draw Phase.
- This is also checked whenever a card effect instructs a player to draw cards.
- If a player is instructed to draw multiple cards and runs out mid-draw, they lose immediately (they do not get to use cards already drawn).

### 14.3 Special Win Conditions

Some cards have text that directly states an alternate win condition:

| Card Example | Win Condition |
|--------------|---------------|
| **Alphadios, Lord of Spirits** | "Whenever this creature wins a battle or isn't blocked, your opponent must choose and destroy one of their shields. If your opponent has no shields, you win the game." |
| **Mega Magma Dragon** | Various "you win the game" effects exist in later sets. |
| **Specific card effects** | "If [condition], you win the game." These override normal win conditions and resolve immediately when the condition is met. |

### 14.4 Loss Conditions Summary

| Condition | Result |
|-----------|--------|
| Opponent creature directly attacks you with 0 shields | You lose |
| You must draw but deck is empty | You lose |
| A card effect says "you lose the game" | You lose |
| Both players would lose simultaneously | The turn player loses (active player loses rule in OCG) |

---

## 15. Keywords and Abilities

### Core Keywords

#### Speed Attacker
- The creature **can attack the turn it enters the battle zone** (ignores summoning sickness).
- Does not affect anything else about the creature.

#### Blocker
- The creature **can intercept attacks** during the opponent's turn.
- To block, the Blocker must be **untapped**. It taps to block.
- Blocking is always **optional** -- the controller chooses whether to block.
- After blocking, combat is resolved normally (power comparison).
- Many Blocker creatures also have the restriction **"This creature can't attack players"** (but can still attack tapped creatures).

#### Double Breaker
- When this creature attacks a shield, it **breaks 2 shields** instead of 1.
- The controller chooses which 2 shields to break.
- Typically found on creatures with 6000+ power.

#### Triple Breaker
- When this creature attacks a shield, it **breaks 3 shields** instead of 1.
- Typically found on creatures with 12000+ power.

#### World Breaker
- When this creature attacks, it **breaks all of the opponent's shields**.
- Extremely rare; found on the most powerful creatures.

#### Power Attacker +X
- "Power Attacker +2000" means the creature gets **+2000 power while attacking**.
- This bonus applies only during attacks (both against shields and creatures).
- The bonus does **not** apply when the creature is blocking or being attacked.

#### Slayer
- When this creature **battles another creature** (either attacking or blocking), the other creature is **destroyed regardless of the power comparison**.
- Both creatures can still be destroyed if the Slayer creature loses the power comparison (Slayer creature dies to normal combat, opponent creature dies to Slayer effect).
- Net result: Slayer creatures almost always trade in combat.

#### Shield Trigger
- See [Section 13](#13-shield-triggers).
- When this card is broken as a shield, you may use it immediately for free.

#### Charger
- After this spell resolves, put it into your **Mana Zone** instead of the graveyard.

### Tribal / Conditional Keywords

#### Survivor
- While this creature is in the battle zone, it grants its abilities to **all other creatures** in the battle zone that also have the Survivor keyword.
- Example: If one Survivor has "Power Attacker +2000" and another Survivor has "Blocker," both creatures gain both abilities.

#### Wave Striker
- This creature's Wave Striker ability activates only if you have **3 or more creatures** in the battle zone.
- Example: "Wave Striker -- While you have 3 or more creatures in the battle zone, this creature gets +4000 power."

#### Sympathy
- "Sympathy: [Race]" reduces this creature's cost by 1 for each creature of the specified race you have in the battle zone.
- The cost cannot be reduced below 1 (in most rulings) or 0 (varies by specific implementation).

#### Ninja Strike X
- During your opponent's turn, when one of your opponent's creatures attacks, if you have X or more mana, you may **summon this creature from your hand** without paying its cost.
- The creature enters the battle zone and may block if it has Blocker.
- At the end of the turn, the creature returns to your hand (unless an effect changes this).
- This is one of the few ways to play cards during the opponent's turn.

### Triggered Abilities

#### CIP Trigger (Comes Into Play / "When you put this creature into the battle zone")
- Triggers when the creature enters the battle zone from any zone (hand, mana, graveyard, etc.).
- Resolves immediately upon entry.
- Cannot be responded to by the opponent (no stack).

#### PIG Trigger (Put Into Graveyard / "When this creature is destroyed")
- Triggers when the creature is sent to the graveyard from the battle zone.
- Resolves before the creature actually leaves play (the creature is still in the battle zone when the trigger resolves, per some rulings) OR after it reaches the graveyard (varies by card wording -- check specific text).
- Common in Darkness civilization.

#### Attack Trigger ("When this creature attacks")
- Triggers when the creature is declared as an attacker and tapped.
- Resolves before blockers are declared.
- The attack still proceeds after the trigger resolves.

#### Destroy Trigger ("Whenever a creature is destroyed")
- Triggers whenever any creature (yours or opponent's) is destroyed, depending on the card's text.
- Example: "Whenever one of your other creatures is destroyed, draw a card."

### Advanced Keywords (OCG)

#### Meteorburn
- Found on psychic creatures and some evolution creatures.
- "Meteorburn -- Whenever this creature attacks, you may put a card under this creature into the graveyard. If you do, [effect]."
- Cards "under" an evolution or psychic creature serve as fuel for Meteorburn.

#### Mana Arms X
- "If you have X or more cards in your mana zone, [effect]."
- A conditional ability that checks mana count.

#### Guardman
- Similar to Blocker but with the restriction that the creature can **only** block attacks targeting a specific other creature or creature type.

#### Turbo Rush
- "Turbo Rush -- Whenever one of your creatures attacks for the first time this turn, [effect]."
- Rewards aggressive multiattack strategies.

#### Galaxy Vortex Evolution
- An evolution mechanic that requires multiple base creatures of specific races.
- See [Section 16](#16-evolution-creatures).

---

## 16. Evolution Creatures

### Basic Evolution

Evolution creatures are a special category that must be played **on top of** an existing creature in the battle zone.

#### Requirements

1. You must have a creature in the battle zone that matches the evolution creature's specified **Race requirement**.
   - Example: "Evolution -- Put on one of your Armored Dragons" requires an Armored Dragon race creature.
2. You pay the evolution creature's **mana cost** as normal (tapping mana cards with civilization requirements).
3. The evolution creature is placed **on top of** the base creature. The base creature is now "under" the evolution.

#### Key Properties

| Property | Rule |
|----------|------|
| **No summoning sickness** | Evolution creatures can **attack immediately** the turn they are played, regardless of when the base creature was played. |
| **Base creature abilities** | The base creature's abilities are **overridden** by the evolution creature. The base creature is treated as not in the battle zone (its abilities do not function). |
| **Power** | The evolution creature uses its **own** power value, not the base creature's. |
| **Race** | The evolution creature uses its **own** race(s). The base creature's race is not considered. |
| **Cards underneath** | The base creature card remains physically underneath the evolution creature. This is relevant for Meteorburn and destruction rules. |

#### Destruction Rules

When an evolution creature is destroyed:

1. The evolution creature card goes to the graveyard.
2. **All cards underneath** the evolution creature also go to the graveyard.
3. This happens simultaneously.
4. Any PIG (destruction) triggers on the evolution creature activate.
5. The base creature's PIG triggers do **not** activate (the base creature was not "in the battle zone" as an independent entity when destroyed).

### Vortex Evolution

Vortex Evolution requires **two or more** base creatures as evolution material.

- Example: "Vortex Evolution -- Put on 2 of your creatures (one Light creature and one Water creature)."
- Both base creatures must be in the battle zone.
- Both are placed under the Vortex Evolution creature.
- All cards underneath follow the same destruction rules as basic evolution.

### Ultimate Evolution

Ultimate Evolution requires an **evolution creature** as its base (evolving on top of an evolution).

- Example: "Ultimate Evolution -- Put on one of your Evolution creatures."
- The entire stack (original base + first evolution + ultimate evolution) is treated as a single entity.
- Destruction sends the entire stack to the graveyard.

### Galaxy Vortex Evolution

Requires **three or more** creatures of specified types.

- Example: "Galaxy Vortex Evolution -- Put on 3 of your creatures (at least one from each: Angel Command, Demon Command, and Armored Dragon)."
- Extremely powerful creatures with extremely strict requirements.

### Star Evolution (Modern OCG)

Star Evolution creatures evolve differently:

- When a Star Evolution creature would leave the battle zone, only the top card (the Star Evolution creature) leaves. The base creature remains in the battle zone.
- This is a departure from classic evolution rules.

---

## 17. Cross Gear

### Cross Gear Lifecycle

Cross Gear have a unique three-phase lifecycle:

```
+-----------------------------------------------------------+
|                  CROSS GEAR LIFECYCLE                       |
+-----------------------------------------------------------+
|                                                            |
|  1. GENERATE                                               |
|     Pay the Cross Gear's cost from your hand.              |
|     Place it in the Battle Zone UNCROSSED.                 |
|     (It exists independently, not attached to anything.)   |
|            |                                               |
|            v                                               |
|  2. CROSS                                                  |
|     Pay the Cross cost (printed on the card) during        |
|     your Main Phase.                                       |
|     Attach the Cross Gear to one of your creatures.        |
|     The creature gains the Cross Gear's abilities.         |
|            |                                               |
|            v                                               |
|  3. UNCROSS (when creature leaves)                         |
|     If the crossed creature is destroyed/removed, the      |
|     Cross Gear REMAINS in the Battle Zone uncrossed.       |
|     It can be crossed onto another creature later.         |
|                                                            |
+-----------------------------------------------------------+
```

### Generate (Step 1)

- Pay the Cross Gear's mana cost during your Main Phase.
- Place it in the battle zone face-up.
- It sits in the battle zone doing nothing until crossed.
- An uncrossed Cross Gear is **not a creature** -- it cannot attack, block, or be attacked.

### Cross (Step 2)

- During your Main Phase, pay the **cross cost** (a separate cost printed on the Cross Gear card).
- Attach the Cross Gear to **one of your creatures** in the battle zone.
- The creature now gains all abilities granted by the Cross Gear.
- A creature can have **multiple** Cross Gear attached to it.
- A Cross Gear can only be attached to **one creature** at a time.

### Uncross (Step 3)

- When the creature a Cross Gear is attached to leaves the battle zone (destroyed, bounced, etc.), the Cross Gear **stays in the battle zone** uncrossed.
- You can re-cross it later by paying the cross cost again.

### Cross Gear Destruction

- Cross Gear can be destroyed by card effects that specifically target Cross Gear or permanents.
- Some effects say "destroy a creature or Cross Gear."
- When a Cross Gear is destroyed, it goes to the graveyard.

### Cross Gear as Mana

- Cross Gear cards can be placed in the Mana Zone like any other card.
- They provide 1 mana of their civilization.

---

## 18. Multi-Civilization Cards

### Definition

Multi-civilization cards belong to **two or more** civilizations simultaneously. They have split-frame artwork showing both civilization colors.

### Mana Payment Rules

When paying the mana cost for a multi-civilization card:

1. You must tap a total number of mana cards equal to the card's cost.
2. Among the tapped mana cards, you must have **at least one mana card for each civilization** on the multi-civ card.

**Example:** A Light/Water creature with cost 4 requires:
- 4 mana tapped total
- At least 1 of those must be Light civilization
- At least 1 of those must be Water civilization
- The remaining 2 can be any civilization(s)

**Edge Case:** A single multi-civ mana card can satisfy multiple requirements if it shares civilizations with the card being played.

**Example:** You want to play a Light/Water creature costing 3. Your mana zone has:
- 1 Light/Water card
- 2 Fire cards

You can play the creature! The Light/Water mana card satisfies both the Light requirement and the Water requirement. Tap all 3 mana.

### Multi-Civ Cards in the Mana Zone

- A multi-civ card in the mana zone counts as **all** of its civilizations.
- When tapped for mana, it can satisfy the civilization requirement for any of its civilizations.

### Multi-Civ Cards in the Shield Zone

- Function as normal shields.
- If they have Shield Trigger, they activate as normal when broken.

### Multi-Civ and Evolution

- A multi-civ creature satisfies evolution requirements for **any** of its civilizations or races.
- Example: A Light/Darkness Angel Command counts as both a Light creature and a Darkness creature, and as an Angel Command.

---

## 19. Edge Cases

### 19.1 Shield Trigger vs. Attacker

**Scenario**: An attacker breaks a shield, and the shield is a Shield Trigger creature with "destroy one of your opponent's creatures."

**Resolution**:
- The shield is broken and the Shield Trigger activates.
- The defending player may cast the Shield Trigger for free.
- If it targets and destroys the attacking creature, the attacking creature is destroyed.
- However, the shield was **already broken** before the trigger resolved. The break is not undone.
- If the attacker had Double Breaker, all shields from that attack are already broken simultaneously. Destroying the attacker does not "save" the other shields from that attack.
- Subsequent attacks by that creature (if it somehow survived or if other creatures were planning to attack) are affected if the creature is destroyed.

### 19.2 Multiple Breakers and Insufficient Shields

**Scenario**: A Double Breaker attacks and the opponent has only 1 shield.

**Resolution**:
- Break the 1 remaining shield. The "extra" break does not carry over as a direct attack or any other effect.
- A separate attack is needed to deliver Todomeda.

### 19.3 Power Reduced to 0 or Below

**Scenario**: A creature's power is reduced to 0 or less by an effect (e.g., "target creature gets -4000 power this turn" applied to a 3000-power creature).

**Resolution**:
- A creature whose power is **reduced to 0 or less** is **destroyed** as a state-based action.
- This happens immediately when the power becomes 0 or less.
- This is not combat damage; it is a state-based check.

### 19.4 "Can't" vs. "Can" (Conflicting Effects)

**Rule**: When a "can't" effect conflicts with a "can" effect, **"can't" always wins**.

**Examples**:
- "This creature can't be blocked" vs. "This creature may block" -- the creature still cannot be blocked (the blocking creature cannot block it).
- "This creature can't attack" vs. Speed Attacker -- the creature cannot attack. Speed Attacker only removes summoning sickness; it does not override "can't attack."
- "Your opponent can't cast spells" vs. Shield Trigger -- Shield Triggers are casting spells, so they are prevented by this effect.

### 19.5 Simultaneous Destruction

**Scenario**: An effect says "destroy all creatures."

**Resolution**:
- All creatures are destroyed simultaneously.
- All PIG triggers check the game state at the moment of destruction (before any creatures are actually removed).
- All PIG triggers are placed on a queue and resolved in the turn player's order of choice (for their own triggers) followed by the non-turn player.

### 19.6 Self-Referencing Destruction

**Scenario**: A creature's CIP trigger says "destroy a creature." Can it target itself?

**Resolution**:
- Generally, yes, unless the card specifies "another creature" or "one of your opponent's creatures."
- If the card says "destroy a creature," the controller may choose any creature in the battle zone, including the one that just entered.

### 19.7 Shield Trigger Creature with Blocker

**Scenario**: A shield is broken, revealing a Shield Trigger creature with Blocker. The opponent still has more attacks to make this turn.

**Resolution**:
- The creature is summoned for free via Shield Trigger.
- It enters the battle zone untapped.
- It has summoning sickness (cannot attack on the controlling player's next turn if this is the opponent's turn, but this is irrelevant on the opponent's turn).
- It **can** use its Blocker ability immediately to block subsequent attacks this turn, because Blocker is a defensive ability that does not require the creature to be free of summoning sickness.

### 19.8 Evolution onto Tapped Creature

**Scenario**: You want to evolve a creature that is currently tapped (e.g., it attacked last turn and hasn't untapped yet).

**Resolution**:
- You may evolve onto a tapped creature.
- The evolution creature enters the battle zone in the **same tapped/untapped state** as the base creature.
- However, evolution creatures ignore summoning sickness. If the evolution is untapped (or you untap it), it can attack immediately.
- If the base was tapped, the evolution enters tapped and would need to be untapped before it can attack (it untaps during your next Untap Phase as normal).

### 19.9 Attacking with No Valid Targets

**Scenario**: The opponent has 0 shields and no tapped creatures, and you want to attack.

**Resolution**:
- You may declare a direct attack (Todomeda).
- If the opponent has a Blocker, it can intercept.
- If the attack is not blocked, you win the game.

### 19.10 Card Effects that Conflict with Zone Rules

**Scenario**: An effect says "put a spell into the battle zone."

**Resolution**:
- Normally spells cannot exist in the battle zone. Effects that conflict with zone rules are handled by the specific card's text. If the card does not clarify, the effect fails (you cannot put a spell into the battle zone unless the card creates a special exception).

---

## 20. Kaijudo-Specific Variations

Kaijudo is the Western rebranding of Duel Masters, produced by Wizards of the Coast from 2012 to 2014. While it shares the core mechanics, several differences exist:

### 20.1 Deck Building

| Rule | Duel Masters (OCG) | Kaijudo (TCG) |
|------|---------------------|---------------|
| Max copies per card | 4 | **3** |
| Deck size | 40 | 40 |

### 20.2 Terminology Changes

| Duel Masters Term | Kaijudo Term |
|-------------------|--------------|
| Destroy | **Banish** |
| Graveyard | **Discard Pile** |
| Summoning sickness | **"Fast Attack"** replaces Speed Attacker |
| Power Attacker | **"Power Attacker"** (same term) |
| Todomeda | **Direct attack** (no special term) |
| Yamafuda (Deck) | **Deck** |
| Bochi (Graveyard) | **Discard Pile** |
| Race | **Race** (same term) |

### 20.3 Card Types

| Feature | Duel Masters (OCG) | Kaijudo (TCG) |
|---------|---------------------|---------------|
| Cross Gear | Present | **Not present** |
| Evolution Creatures | Present | Present (simplified) |
| Psychic Creatures | Present | **Not present** |
| Fortresses | Present | **Not present** |
| Spells | Present | Present |

### 20.4 Mechanical Simplifications

- **No Cross Gear**: Kaijudo removed the Cross Gear card type entirely, simplifying the card types to creatures, evolution creatures, and spells.
- **No Hyperspatial Zone**: Psychic creatures and the Hyperspatial Zone mechanic are not used.
- **Simplified Evolution**: Evolution mechanics are present but with fewer variants (no Vortex Evolution, Ultimate Evolution, etc.).
- **Race system**: Kaijudo uses a simplified race system compared to the extensive OCG race catalog.

### 20.5 Rule Clarifications Unique to Kaijudo

- **Banish** is functionally identical to "destroy" -- the creature/card goes to the Discard Pile (graveyard equivalent).
- **Fast Attack** is functionally identical to Speed Attacker.
- **Guard** is functionally identical to Blocker.
- The core combat system, shield mechanics, and mana system are identical between the two games.

### 20.6 Civilization Names

Both games use the same five civilization names: Light, Water, Darkness, Fire, and Nature.

---

## 21. Glossary

| Term | Definition |
|------|------------|
| **Attack Phase** | The phase of the turn where creatures can attack shields, tapped creatures, or the opponent directly. |
| **Banish** | Kaijudo term for "destroy." Sends a card from the battle zone to the discard pile/graveyard. |
| **Base Creature** | The creature underneath an Evolution Creature. Provides the evolution requirement. |
| **Battle Zone** | The shared play area where creatures, Cross Gear, and other permanents exist face-up. |
| **Blocker** | A keyword allowing a creature to intercept an opponent's attack by tapping. Blocking is optional. |
| **Break** | To remove a shield from the Shield Zone and add it to the owner's hand. |
| **Charge** | The act of placing a card from your hand into your Mana Zone during the Charge Mana Phase. |
| **Charger** | A spell keyword. After resolution, the spell goes to the Mana Zone instead of the graveyard. |
| **CIP (Comes Into Play)** | Shorthand for "when you put this creature into the battle zone" triggered abilities. |
| **Civilization** | The color/faction of a card (Light, Water, Darkness, Fire, Nature). Determines mana requirements and thematic mechanics. |
| **Cost** | The number of mana cards that must be tapped to play a card. |
| **Cross** | To attach a Cross Gear to a creature by paying the cross cost. |
| **Cross Gear** | An equipment-type card that can be generated (played) and then crossed (attached) to creatures. |
| **Cross Cost** | The mana cost to attach a Cross Gear to a creature (separate from the generate cost). |
| **Deck** | The face-down pile of cards a player draws from. Contains exactly 40 cards at the start. |
| **Deck Out** | Losing the game by being unable to draw a card from an empty deck. |
| **Destroy** | To remove a creature or permanent from the battle zone and send it to the graveyard. |
| **Direct Attack** | An attack against an opponent who has 0 shields. If successful, the attacking player wins. |
| **Discard Pile** | Kaijudo term for the graveyard. |
| **Double Breaker** | A keyword that causes a creature to break 2 shields per attack instead of 1. |
| **Draw Phase** | The phase where the active player draws 1 card. Skipped for the first player's first turn. |
| **End Phase** | The final phase of the turn. "Until end of turn" effects expire and the turn passes. |
| **Evolution Creature** | A creature played on top of a qualifying base creature. Not subject to summoning sickness. |
| **Fast Attack** | Kaijudo term for Speed Attacker. |
| **Fortress** | A permanent card type that occupies a shield zone slot face-up (OCG only). |
| **Galaxy Vortex Evolution** | An evolution requiring 3+ creatures of specified types as base material. |
| **Generate** | To play a Cross Gear from hand into the battle zone by paying its mana cost (uncrossed). |
| **Graveyard (Bochi)** | The face-up discard pile. Destroyed creatures, used spells, and discarded cards go here. |
| **Guard** | Kaijudo term for Blocker. |
| **Hand** | Cards held by a player, hidden from the opponent. No maximum hand size. |
| **Hyperspatial Zone** | A separate face-up zone for psychic/dragheart creatures (OCG only). |
| **Main Phase** | The phase where creatures are summoned, spells are cast, and Cross Gear are managed. |
| **Mana** | The resource used to pay for cards. Generated by tapping cards in the Mana Zone. |
| **Mana Arms** | A keyword that provides an effect when you have X or more cards in your mana zone. |
| **Mana Zone** | The face-up area where mana cards are placed. Each card provides 1 mana of its civilization(s). |
| **Meteorburn** | A keyword that lets you discard cards from under a creature (evolution stack) for effects. |
| **Multi-Civilization** | A card belonging to 2+ civilizations, requiring mana of each to cast. |
| **Ninja Strike** | A keyword allowing a creature to be summoned from hand during the opponent's attack, if you have enough mana. |
| **PIG (Put Into Graveyard)** | Shorthand for "when this creature is destroyed" triggered abilities. |
| **Power** | A creature's combat strength. Higher power wins battles. Ties destroy both creatures. |
| **Power Attacker** | A keyword granting bonus power when the creature attacks (+X to power while attacking). |
| **Psychic Creature** | A double-sided creature from the Hyperspatial Zone that can awaken/flip (OCG only). |
| **Race** | A creature's tribal type (e.g., Armored Dragon, Human, Beast Folk). Referenced by evolution and tribal effects. |
| **Shield** | One of the 5 face-down cards protecting each player. Must be broken before a direct attack. |
| **Shield Trigger** | A keyword that lets a card be played for free when broken as a shield. |
| **Shield Zone** | The area where shields are placed face-down. |
| **Slayer** | A keyword that destroys any creature this creature battles, regardless of power. |
| **Speed Attacker** | A keyword allowing a creature to attack the turn it enters the battle zone. |
| **Star Evolution** | A modern evolution type where the base creature survives if the evolution leaves play. |
| **Summoning Sickness** | The restriction preventing a creature from attacking on the turn it enters the battle zone. |
| **Survivor** | A keyword that shares abilities among all Survivor creatures in the battle zone. |
| **Sympathy** | A keyword that reduces cost by 1 for each creature of a specified race you control. |
| **Tap** | To turn a card sideways, indicating it has been used (for mana or attacking). |
| **Todomeda** | Japanese term for the final direct attack that wins the game. Literally "final blow." |
| **Triple Breaker** | A keyword that causes a creature to break 3 shields per attack instead of 1. |
| **Turbo Rush** | A keyword that triggers an effect when one of your creatures attacks for the first time each turn. |
| **Ultimate Evolution** | An evolution that requires an evolution creature as its base (evolution on an evolution). |
| **Uncross** | To detach a Cross Gear from a creature. The Cross Gear remains in the battle zone. |
| **Untap** | To return a tapped card to the upright position, making it available for use again. |
| **Untap Phase** | The first phase of the turn. All your tapped cards in the battle zone and mana zone untap. |
| **Vortex Evolution** | An evolution requiring 2+ creatures of specified types as base material. |
| **Wave Striker** | A keyword whose effect activates only when you have 3+ creatures in the battle zone. |
| **World Breaker** | A keyword that causes a creature to break all opponent shields in one attack. |

---

*This document is intended as the authoritative implementation reference for the Kaijudo digital game engine. All rule interactions should be validated against this specification. For ambiguous cases not covered here, refer to the official Duel Masters Comprehensive Rules (Japanese) or Kaijudo Tournament Rules (English).*
