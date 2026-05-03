#!/usr/bin/env bash
# Clean up local branches whose remote tracking branch has been deleted.
# Usage: pnpm clean:branches [--dry-run]

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 Dry run — no branches will be deleted."
  echo ""
fi

# Prune stale remote-tracking references
git fetch --prune --quiet

# Find branches marked as [gone]
GONE_BRANCHES=$(git branch -v | grep '\[gone\]' | sed 's/^[+* ]*//' | awk '{print $1}' || true)

if [[ -z "$GONE_BRANCHES" ]]; then
  echo "No stale branches found. Nothing to clean up."
  exit 0
fi

echo "Found stale branches:"
echo "$GONE_BRANCHES" | while read -r branch; do
  echo "  - $branch"
done
echo ""

if [[ "$DRY_RUN" == true ]]; then
  echo "Re-run without --dry-run to delete these branches."
  exit 0
fi

echo "$GONE_BRANCHES" | while read -r branch; do
  # Check for associated worktree
  worktree=$(git worktree list | grep "\\[$branch\\]" | awk '{print $1}' || true)
  if [[ -n "$worktree" && "$worktree" != "$(git rev-parse --show-toplevel)" ]]; then
    echo "Removing worktree: $worktree"
    git worktree remove --force "$worktree"
  fi

  echo "Deleted: $branch"
  git branch -D "$branch"
done

echo ""
echo "Done."
