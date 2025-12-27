# Kaijudo Workspace Instructions

This document provides context and conventions for working with the Kaijudo Nx monorepo.

## Workspace Type

This is an **Nx monorepo** using:
- **Package Manager**: pnpm (with workspace protocol)
- **Nx Version**: 22.1.0
- **TypeScript**: ~5.9.2
- **React**: ^19.2.0

## Workspace Structure

```
kaijudo/
├── apps/
│   └── web/              # Main web application
├── packages/              # Shared libraries and components
│   ├── react-*/          # React component packages
│   ├── react-card-images/ # Image assets package
│   ├── react-game-types/ # Type definitions
│   └── react-storybook/  # Storybook utilities (private)
├── tools/
│   └── package-plugin/   # Custom Nx generator for packages
└── .nx/
    └── version-plans/    # Version plan files for releases
```

## Package Naming Conventions

- **React components**: Use `react-` prefix (e.g., `react-card`, `react-sidebar`)
- **Type packages**: Use descriptive names (e.g., `react-game-types`)
- **Utility packages**: Use descriptive names (e.g., `react-card-images`, `react-storybook`)
- **All packages**: Scoped under `@kaijudo/` namespace

## Package Structure

Each package follows this structure:
```
packages/<package-name>/
├── .storybook/           # Storybook configuration
├── src/                  # Source code
├── dist/                 # Build output
├── package.json          # Package manifest
├── project.json          # Nx project configuration
├── tsconfig.json         # TypeScript config
├── tsconfig.lib.json     # Library TypeScript config
└── tsup.config.ts        # Build configuration
```

## Key Technologies

- **Build Tool**: tsup (for packages)
- **Testing**: Vitest
- **Styling**: Tailwind CSS v4 with `@tailwindcss/vite`
- **UI Components**: shadcn/ui compatible components
- **Animation**: Framer Motion (motion)
- **Storybook**: v8.3.5 for component documentation
- **Styling Utilities**: `clsx`, `tailwind-merge`, `class-variance-authority`

## Publishing & Versioning

### Publishable Packages

Packages are marked as publishable using the `publishable` tag in `project.json`:
```json
{
  "tags": ["publishable"]
}
```

Currently publishable:
- `@kaijudo/react-game-types`

### Version Plans

This workspace uses **Nx version plans** for independent versioning:
- Version plans are stored in `.nx/version-plans/*.md`
- Format: Markdown with Front Matter YAML
- Package names must be quoted: `"@kaijudo/package-name": minor`

### Release Workflow

1. Create version plan: `nx release plan` or manually create `.nx/version-plans/*.md`
2. Commit version plan
3. Apply version: `pnpm nx release --skip-publish`
4. Push tags: `git push && git push --tags`
5. CI automatically publishes via GitHub Actions

### Changelogs

- **Project-level changelogs**: Each publishable package has its own `CHANGELOG.md`
- Location: `packages/<package-name>/CHANGELOG.md`
- Workspace-level changelog is disabled

## Build Configuration

### Package Builds

- **Executor**: `nx:run-commands` with `tsup`
- **Output**: `{projectRoot}/dist`
- **Working Directory**: `{projectRoot}`

### Image Assets

For packages with image assets (like `react-card-images`):
- Images are copied to `dist/` during build
- TypeScript definitions are generated with `dts: { resolve: true }`
- Images exported as named exports from `index.ts`

## Custom Generator

Use the workspace generator to create new packages:
```bash
nx g @kaijudo/package-plugin:package <package-name>
```

The generator creates:
- TypeScript configuration
- Storybook setup
- tsup build config
- Basic component structure
- Test setup

## Dependencies

### Workspace Protocol

All internal dependencies use pnpm workspace protocol:
```json
{
  "dependencies": {
    "@kaijudo/react-card": "workspace:*"
  }
}
```

### Peer Dependencies

React component packages typically have these peer dependencies:
- `react` and `react-dom`
- `tailwindcss` and `@tailwindcss/vite`
- `motion` (framer-motion)

## Storybook

- Each component package has its own Storybook instance
- Configuration in `.storybook/main.ts` and `.storybook/preview.ts`
- Common Storybook utilities available from `@kaijudo/react-storybook`
- ComponentPage component provides a template for component documentation pages

## Git Conventions

- Use **conventional commits**
- Format: `<type>(<scope>): <description>`
- Common types: `feat`, `fix`, `refactor`, `chore`, `docs`

## Important Files

- `nx.json`: Nx workspace configuration
- `pnpm-workspace.yaml`: pnpm workspace configuration
- `.nx/version-plans/`: Version plan files (tracked in git)
- `tsconfig.base.json`: Base TypeScript configuration

## Common Commands

```bash
# Build a package
pnpm nx build @kaijudo/package-name

# Run tests
pnpm nx test @kaijudo/package-name

# Run Storybook
pnpm nx storybook @kaijudo/package-name

# Generate a new package
nx g @kaijudo/package-plugin:package package-name

# Create a version plan
nx release plan

# Apply version plans
pnpm nx release --skip-publish
```

## Notes for AI Assistants

1. **Always check `project.json`** for package configuration
2. **Use workspace protocol** (`workspace:*`) for internal dependencies
3. **Respect package naming conventions** (react- prefix for React components)
4. **Version plans** use quoted package names in YAML front matter
5. **Project-level changelogs** are used, not workspace-level
6. **Build outputs** go to `{projectRoot}/dist`, not workspace root
7. **Image assets** need special handling in tsup config (copy loader, DTS resolve)

