# Update tech stack doc

Scan the repo for tech stack changes and update `docs/overview/stack.md` (and logo assets if needed) so the doc stays the source of truth.

**When to run:** After adding/removing dependencies, changing framework or tooling (e.g. Convex, Clerk, Nx, CI), or when onboarding (to confirm docs match reality). Run periodically (e.g. before releases or when touching `package.json`).

## Steps

1. **Discover current stack** by reading (in parallel where possible):
   - `package.json` (root) and `pnpm-workspace.yaml`
   - `apps/web/package.json` (dependencies + devDependencies)
   - `apps/web/convex/schema.ts` (backend/tables mention)
   - `apps/web/src/env.ts` (env/validation tools)
   - `nx.json` and `apps/web/project.json` (monorepo, targets)
   - `.github/workflows/*.yml` (CI)
   - Root `biome.json` and any config that implies tooling (e.g. Vitest, TypeScript)
   - Key packages under `packages/` that are part of the public stack (e.g. `packages/*/package.json` names)

2. **Compare with the doc:** Read `docs/overview/stack.md` and optionally `docs/overview/assets/README.md`. Identify:
   - New technologies (new deps or config) that should be documented
   - Removed or renamed technologies that should be removed or updated
   - Version or description updates (e.g. Tailwind 4 → 5, new Nx target)
   - Internal packages list: ensure `docs/overview/stack.md` “Internal packages” table matches what’s in `packages/` and is consumed by `apps/web`

3. **Update the doc:**
   - Edit `docs/overview/stack.md` only. Keep the existing structure: Overview, Technology logos, Frontend, Backend & data, Auth, File uploads, Monitoring, Environment & validation, Monorepo & build, Testing, Code quality & tooling, CI/CD, Internal packages.
   - Use the same format: tables with **Layer** | **Technology** | **Notes** (or equivalent per section); markdown links for tech names; relative links for assets (`./assets/...`).
   - If you add a **new** technology that has a logo:
     - If it exists on [Simple Icons](https://simpleicons.org/), add `docs/overview/assets/<slug>.svg` by downloading from `https://cdn.simpleicons.org/<slug>/<hex>` (use a sensible brand color), and add a row to the Technology logos table and to `docs/overview/assets/README.md`.
     - If no Simple Icons slug, add a minimal transparent SVG placeholder in `docs/overview/assets/` and document it as a placeholder in the assets README.
   - If you **remove** a technology, remove its row from the logos table and, if unused elsewhere, you may remove the asset file and its line from the assets README.
   - Preserve the TOC at the top of the file so links stay valid.

4. **Do not** change CLAUDE.md, README, or other docs unless the user explicitly asks. This command is scoped to keeping the stack doc and its assets up to date.

5. **Output:** Summarize what you found (additions, removals, edits) and list the files you changed.

$ARGUMENTS
