Create a conventional commit, push to a feature branch, and open a pull request targeting develop.

**IMPORTANT:** This command NEVER pushes directly to `develop` or `main`. It always creates/uses a feature branch and opens a PR.

## Steps

1. Run `git status` (never use `-uall`), `git diff --staged`, `git diff`, and `git log --oneline -5` in parallel. Also check the current branch name.

2. **Branch check:**
   - If on `develop` or `main`: create a new feature branch from the current branch. Name it using the convention `<type>/<kebab-case-description>` (e.g., `feat/game-state-machine`, `fix/timer-overflow`). Ask the user for a branch name if unclear.
   - If already on a feature branch: stay on it.

3. Determine the Nx project scope from the changed files:
   - If changes are in `apps/<name>/`, scope is `<name>` (e.g., `desktop`, `web`)
   - If changes are in `packages/<name>/`, scope is `<name>` (e.g., `game-engine`, `react-card`)
   - If changes span multiple projects or are at root level, omit the scope
   - The scope is the directory name, NOT the full `@kaijudo/` package name

4. Stage all relevant changed files (use specific file paths, not `git add -A`). Do NOT stage files that contain secrets (.env, credentials, tokens).

5. Write a conventional commit message:
   ```
   <type>(<scope>): <short description>

   <optional body explaining what and why>

   Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
   ```
   - **type**: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`, `build`
   - **description**: imperative mood, lowercase, no period, under 72 chars

6. Commit using a HEREDOC for the message.

7. Push to the remote feature branch: `git push -u origin HEAD`

8. **Create a pull request** using `gh pr create`:
   - **Base branch**: `develop` (unless user specifies otherwise)
   - **Title**: same as the commit message first line
   - **Body** must include:
     - `## Summary` with bullet points describing the changes
     - `Closes #<issue>` or `Resolves #<issue>` linking the relevant GitHub issue(s). Look at the commit message and branch name to determine which issue(s) are relevant. If unsure, check `gh issue list --milestone "v0.1 Local Test Game"` and ask the user.
     - `## Test plan` with a checklist
     - The footer: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
   - Add the milestone `v0.1 Local Test Game` if the work falls under it
   - Add appropriate labels from: `engine`, `ui`, `design`, `types`, `logic`, `session`, `interaction`, `ai`, `integration`, `priority:high`, `priority:medium`

9. Output the PR URL so the user can review it.

$ARGUMENTS
