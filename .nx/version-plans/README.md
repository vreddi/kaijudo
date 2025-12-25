# Version Plans

This directory contains version plan files that specify version bumps for publishable packages in the workspace.

## How Version Plans Work

Version plan files are markdown files (`.md`) with Front Matter YAML at the top that specify which packages should be versioned and by how much (major, minor, or patch).

## Creating a Version Plan

### Using the Nx CLI

Run the interactive command:

```bash
nx release plan
```

This will guide you through creating a version plan file with the correct format.

### Manual Creation

Create a markdown file in this directory with the following format:

```markdown
---
@kaijudo/types: minor
---

Description of the changes that will appear in the CHANGELOG.

You can include multiple paragraphs, lists, or any markdown content here.
```

The Front Matter YAML section (between `---`) maps project names to semver bump types:

- `major`: Breaking changes
- `minor`: New features (backward compatible)
- `patch`: Bug fixes (backward compatible)

## Applying Version Plans

When you run `nx release`, Nx will:

1. Read all version plan files in this directory
2. Apply the version bumps to the specified packages
3. Generate/update CHANGELOG.md files
4. Delete the version plan files (they're committed as part of the release)

## Example

```markdown
---
@kaijudo/types: minor
---

Added new Era type definitions for better type safety.

- Added `Era` enum
- Updated type exports
- Improved TypeScript definitions
```

## Publishable Packages

Only packages tagged with `publishable` in their `project.json` will be included in releases. Currently, the following packages are publishable:

- `@kaijudo/types`

To make additional packages publishable, add the `publishable` tag to their `project.json`:

```json
{
  "tags": ["publishable"]
}
```
