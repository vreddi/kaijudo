# Package Generator

This generator creates a new component package in the `packages/` directory.

## Usage

```bash
npx nx g @kaijudo/package-plugin:package <package-name>
```

## Package Naming Convention

- **React components**: Use the `react-` prefix (e.g., `react-sidebar`, `react-card`)
- **Other packages**: Use descriptive names without prefix (e.g., `types`, `creature-images`)

Examples:
- `react-sidebar` → `@kaijudo/react-sidebar`
- `react-card` → `@kaijudo/react-card`
- `types` → `@kaijudo/types`
- `creature-images` → `@kaijudo/creature-images`

## Generated Structure

```
packages/<package-name>/
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── src/
│   ├── <ComponentName>.tsx
│   ├── <ComponentName>.stories.tsx
│   ├── index.ts
│   └── utils.ts
├── package.json
├── project.json
├── tsconfig.json
├── tsconfig.lib.json
└── tsup.config.ts
```

## Features

- TypeScript configuration
- Storybook setup
- tsup for building
- Vitest for testing
- Tailwind CSS support
- Framer Motion (motion) support
- shadcn/ui compatible utilities

## Dependencies

The generator includes:
- `clsx`, `tailwind-merge`, `class-variance-authority` for styling utilities
- React and React DOM
- Common dev dependencies for testing and building

## Peer Dependencies

- `react` and `react-dom`
- `tailwindcss` and `@tailwindcss/vite`
- `motion` (framer-motion)

