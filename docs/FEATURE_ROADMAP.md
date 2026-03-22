# Feature Roadmap

Planned features for Kaijudo, roughly ordered by priority and dependency.

## Upcoming

### 1. Card Image API / Storage Service
Self-hosted image service for card artwork. Currently images are downloaded locally from db.duelmasters.us and gitignored. Goal: host card images on our own infrastructure (S3/Cloudflare R2/similar) with a queryable API so all clients (desktop, web, mobile) can fetch card art from a single source.

### 2. Play / Matchmaking Lobby
"Find Match" screen with casual and ranked queues. Queue selection UI, searching animation, opponent-found transition.

### 3. Profile Page
Full player profile view — level ring, detailed match history, win/loss stats, achievements badges, registration date, and settings link.

### 4. Friends System
Expand beyond the dashboard widget — friend requests, search players by username, view friend profiles, challenge to duel.

### 5. Card Game Board / Battle Screen
The actual game board layout — mana zone, battle zone, shields, hand, graveyard. Start as a static layout, then add interactivity.

### 6. Settings Page
Music volume control, display settings, account management, sign out.

## Completed

- [x] Tauri desktop app with intro video and disclaimer
- [x] Title screen with press-enter prompt and floating creature art
- [x] Clerk + Convex authentication integration
- [x] Background music player with toast notifications (Howler.js)
- [x] Menu dashboard (stats, decks, friends, recent matches, goals)
- [x] Card collection page with civilization filters, search, and detail modal
- [x] Creature type and game types package
- [x] Enhanced card component with 3D tilt, holographic effects, civilization glow
- [x] Deck builder with mana curve, civilization distribution, and 40-card enforcement
- [x] Full card database scraped (2,647 cards across 35 sets from db.duelmasters.us)
- [x] Comprehensive Duel Masters game rules reference document
