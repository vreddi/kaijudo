# Release Workflow with Version Plans

This document explains how version plans integrate with Nx Cloud and the GitHub Actions publishing workflow.

## Overview

The release process is split into two phases:
1. **Versioning** (local or CI): Apply version plans, update versions, generate changelogs, create tags
2. **Publishing** (CI only): Publish packages to npm registry

This separation provides safety and control over when packages are published.

## Nx Cloud Integration

Nx Cloud is already configured in your workspace (`nxCloudId` in `nx.json`). It provides:
- **Distributed caching**: Build artifacts are cached and shared across CI runs
- **Task distribution**: Parallel execution across multiple agents
- **Analytics**: Insights into build performance and cache hit rates

When you run `nx release` or `nx release publish` in CI, Nx Cloud automatically:
- Caches build outputs
- Shares cache across workflow runs
- Speeds up subsequent builds

No additional configuration needed - it works automatically with your existing `nxCloudId`.

## Workflow Options

### Option 1: Tag-Based Publishing (Recommended - Industry Standard)

This is the most common pattern used by major open-source projects.

#### Process:
1. **Create version plans** (local):
   ```bash
   nx release plan
   # Or manually create files in .nx/version-plans/
   ```

2. **Commit version plans**:
   ```bash
   git add .nx/version-plans/
   git commit -m "chore: add version plans for release"
   git push
   ```

3. **Create release** (local):
   ```bash
   nx release --skip-publish
   ```
   This will:
   - Apply version plans
   - Update package.json versions
   - Generate/update CHANGELOG.md files
   - Create git tags (e.g., `@kaijudo/types@1.0.0`)
   - Commit changes
   - **Skip publishing** (done in CI)

4. **Push tags**:
   ```bash
   git push && git push --tags
   ```

5. **Automatic publish** (GitHub Actions):
   - The `publish.yml` workflow triggers on tag push
   - Runs `nx release publish` to publish to npm
   - Uses Nx Cloud for caching

#### Benefits:
- ✅ Automatic publishing when tags are pushed
- ✅ No manual intervention needed
- ✅ Standard industry practice
- ✅ Clear audit trail (tags in git)

### Option 2: Manual Workflow Dispatch

For more control, you can use the `release.yml` workflow:

1. **Create version plans** (same as above)
2. **Commit version plans** (same as above)
3. **Trigger workflow manually**:
   - Go to GitHub Actions → "Create Release" workflow
   - Click "Run workflow"
   - Optionally enable "Dry run" to preview
4. **Automatic publish** (same as above)

#### Benefits:
- ✅ More control over timing
- ✅ Can preview with dry-run
- ✅ Good for teams that want explicit approval

## Recommended Approach

**Use Option 1 (Tag-based)** for most cases:
- It's the industry standard
- Used by projects like React, Vue, Angular
- Automatic and reliable
- Clear git history

Use Option 2 (Manual dispatch) if you need:
- Additional approval gates
- Scheduled releases
- More complex release logic

## GitHub Actions Workflows

### `publish.yml`
- **Triggers**: Tag pushes (`v*.*.*` or `@kaijudo/*@*.*.*`)
- **Purpose**: Publish packages to npm
- **What it does**:
  - Checks out code
  - Installs dependencies
  - Runs `nx release publish` (publishes only, doesn't version)
  - Uses Nx Cloud for caching

### `release.yml` (Optional)
- **Triggers**: Manual workflow dispatch
- **Purpose**: Create releases from CI
- **What it does**:
  - Checks out code
  - Runs `nx release --skip-publish`
  - Pushes tags to trigger publish workflow

## Setup Requirements

### 1. NPM Access Token

Add an NPM access token as a GitHub secret:

1. Create an npm access token:
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Create a "Automation" token (for CI/CD)
   - Copy the token

2. Add to GitHub secrets:
   - Go to your repo → Settings → Secrets and variables → Actions
   - Add secret: `NPM_ACCESS_TOKEN` with your token value

### 2. Package Access

Ensure your npm account has publish permissions for `@kaijudo` scope:
- If using an organization, ensure your account is a member
- Verify package names match your npm scope

## Example Release Flow

```bash
# 1. Create version plan
nx release plan
# Follow prompts to select packages and version bumps

# 2. Review the created plan file
cat .nx/version-plans/version-plan-*.md

# 3. Commit the plan
git add .nx/version-plans/
git commit -m "chore: prepare release for @kaijudo/types"
git push

# 4. Apply version plans and create tags
nx release --skip-publish

# 5. Push tags to trigger publish
git push && git push --tags

# 6. GitHub Actions automatically publishes to npm
```

## Dry Run

Always test with `--dry-run` first:

```bash
nx release --skip-publish --dry-run
```

This shows what would happen without making changes.

## Troubleshooting

### Nx Cloud Not Working
- Verify `nxCloudId` in `nx.json` is correct
- Check Nx Cloud dashboard: https://cloud.nx.app

### Publishing Fails
- Verify `NPM_ACCESS_TOKEN` secret is set correctly
- Check npm account has publish permissions
- Ensure package.json has correct `name` and `version`

### Tags Not Triggering Workflow
- Verify tag format matches workflow pattern
- Check workflow file is in `.github/workflows/`
- Ensure workflow file has correct YAML syntax

