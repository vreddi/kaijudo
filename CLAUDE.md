# Kaijudo — Common Agent Instructions

These instructions apply to **every agent and slash command** working in this repository. They override any default behavior.

## Git Workflow — Non-Negotiable Rules

1. **NEVER force push to `develop` or `main`.** These are protected branches. All changes go through pull requests.
2. **NEVER commit directly to `develop` or `main`.** Always create a feature branch first.
3. **Always create a pull request** to merge into `develop` (or `main` for releases). PRs must:
   - Target `develop` as the base branch (unless it's a hotfix or release targeting `main`)
   - Have a clear title using conventional commit format: `<type>(<scope>): <description>`
   - Include a body with `## Summary`, `## Test plan`, and link to the relevant GitHub issue(s)
   - Use `Closes #<issue>` or `Resolves #<issue>` in the PR body to auto-link issues
4. **Conventional commits** are mandatory. Format:
   ```
   <type>(<scope>): <short description>

   <optional body>

   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
   ```
   - **type**: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`, `build`
   - **scope**: Nx project name (e.g., `game-engine`, `react-card`, `desktop`) — omit if cross-cutting
5. **Branch naming**: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/` prefix + kebab-case description (e.g., `feat/game-state-model`)
6. **Stage specific files** — never `git add -A` or `git add .`. Never stage `.env`, credentials, or secrets.

## GitHub Issue Tracking

- **Every feature or bug fix must have a GitHub issue** before work starts. If one doesn't exist, create it first.
- **Issues must be in the appropriate milestone** (e.g., `v0.1 Local Test Game`).
- **PRs must reference their issue(s)** using `Closes #N` in the body.
- **Labels**: use existing labels (`engine`, `ui`, `design`, `types`, `logic`, `session`, `interaction`, `ai`, `integration`, `priority:high`, `priority:medium`).

## Repository Structure

- **Monorepo**: Nx workspace with pnpm
- **Apps**: `apps/desktop` (Tauri), `apps/web` (TanStack Start), `apps/storybook`
- **Packages**: `packages/<name>/` — each is an independent library
- **Backend**: `packages/backend/` (Convex)
- Repo: `vreddi/kaijudo` on GitHub

## Code Standards

- TypeScript strict mode, no `any`
- Tailwind CSS 4 for styling
- Vitest for testing
- tsup for package builds
- Biome for linting/formatting
