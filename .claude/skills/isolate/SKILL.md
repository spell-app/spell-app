---
name: isolate
description: Move this session into its own git worktree `<name>` (worktree, branch and session all named `<name>`) and open it in a new, tinted VS Code window;  `/isolate done` offers to merge it into `main`, then leaves it.  Use for `/isolate <name>`, `/isolate done`, or when Owen says "isolate as <name>" / "isolate this" about the current session.
argument-hint: <name> | done
---

# /isolate

Work in worktree `.claude/worktrees/<name>`, so this session's edits never collide with another session's.  The
worktree, its branch and the session share one name.  `/epic` runs these steps too.

## Start:  `/isolate <name>`

0. Checks and rename, BEFORE anything else.  A typed `/isolate <name>` got them from the repo's `UserPromptSubmit`
   hook (`.claude/hooks/prompt-gate.mjs`, read its header):  it renamed the session `<name>`, or blocked the prompt.
   "Isolate as <name>" in plain words never reaches the hook, so do its checks here:
   - in plan mode:  it's read-only apart from the plan file, so `EnterWorktree` can't run, and ExitPlanMode would
     ask to APPROVE a half-made plan.  Ask the user to leave plan mode (shift+tab);  the plan file survives.
   - in another worktree:  the session's folder is under `.claude/worktrees/<other>`, or its window is a worktree's
     (`node scripts/window.mjs which`:  `workspace` under `workspaces/ongoing/`).  `<other>` isn't `<name>`:  stop,
     saying so in one line ("`/isolate done` first, or start from a package window").
   - rename:  `python3 ~/.claude/skills/session/scripts/session.py name <name>`.  It lands on the next prompt, or
     when the session opens in its new window.
   - a saved prompt `~/.spell/prompts/<name>.md` (the hook saved it while blocking an earlier `/isolate <name>
     ...`):  it's the task to carry on with once isolated.  Delete it once done.
   Already mid-work ("isolate as <name>" in a running session):
   - edits already made in the main checkout:  the worktree is cut from COMMITTED `main`, so they won't follow.
     List them (`git status --short`) and AskUserQuestion:  "Carry them over" (`git stash -u` here, `git stash pop`
     in the worktree after step 4), "Commit on `main` first" (stage, then ask) or "Leave them".
1. `<name>` is `$ARGUMENTS` (or the `<name>` in "isolate as <name>"), lower-kebab-cased (`Docs Index` ->
   `docs-index`).  No name:  propose one from the work so far in AskUserQuestion;  the user can type another.
2. Collisions (from the repo root):  a worktree at `.claude/worktrees/<name>` (`git worktree list`), a branch `<name>`
   or `worktree-<name>`.  Any hit:  AskUserQuestion, options "Reuse `<name>`" and "Different name" (typed in "Other").
3. Tell the user, in one line:  run `/rename <name>` in the session's new tab (step 6) so the tab and list entry
   show it.  A skill can't rename its own session.
4. `EnterWorktree` with `name: "<name>"`, or `path: ".claude/worktrees/<name>"` when reusing one.  The repo's
   `WorktreeCreate` hook (`.claude/hooks/worktree.mjs`) makes it on branch `<name>` from local `main`, and keeps this
   session listed in every window.
5. Open it in its own window (root `AGENTS.md` "Worktrees"), from the worktree's root:
   - `node scripts/window.mjs open <name>`:  a NEW window from `workspaces/ongoing/<name>.code-workspace` (main
     checkout, git-ignored), the package window's theme with a tinted title bar.  Folders:  the MAIN root (so every
     session is listed), then the worktree's `packages/<pkg>` and root.
     `<pkg>`:  this session's window's;  `--pkg <pkg>` when it isn't a package window.
   - `node scripts/window.mjs`, NOT `yarn window`:  a fresh worktree has no `node_modules/` yet, and `yarn` runs no
     script before `yarn install`
   - fails:  say so in one line and go on.  NEVER `code --add` / `-r`:  they restart the Claude panel or target
     the focused window.
6. Move the session there:  `node scripts/window.mjs handoff <name>`.  When this turn ends (whatever else it does
   first), the new window opens the session in an editor tab (never the sidebar) and this window closes its tab.
   The move itself is the `Stop` hook's (`.claude/hooks/handoff.mjs`).
   - a doc shown from here on this turn (`yarn plan-doc open`) waits for the move, then shows beside the session
     in the new window
   - fails, or step 5 did:  say so in one line;  the session stays here
7. In the worktree, no `node_modules/` at the root:  `yarn install`.
8. One line:  "isolated in worktree `<name>` (branch `<name>`);  this session moves to its own window,
   `<pkg> ⎇ <name>`, when this turn ends".  Old tab still open afterwards (its title didn't match):  close it by
   hand;  the log is `~/.spell/windows/handoffs/<session id>.log`.

## Finish:  `/isolate done`

0. Not in a worktree (the session's folder isn't under `.claude/worktrees/`):  say so in one line, then offer to
   clean up:
   - candidates:  each `.claude/worktrees/<name>` that
     - no session is in:  under "No session in" from `python3 ~/.claude/skills/worktrees/scripts/worktrees.py`.
       Why:  a fresh worktree has nothing outside `main` either, but its session is still using it.
     - has nothing uncommitted (`git -C .claude/worktrees/<name> status --short`;  fine from the main checkout)
     - has nothing outside `main` (`git log --oneline main..<branch>` empty)
   - none:  stop
   - else AskUserQuestion, multi-select, one option per candidate ("`<name>` (`<branch>`)";  it takes 2-4 options,
     so one candidate is "Remove `<name>`" / "Keep it", and more than 4 go in several questions);  for each picked:
     `git worktree remove .claude/worktrees/<name>`, `git branch -d <branch>`.  Then stop:  steps 1-7 are for a
     session IN a worktree.
1. Report what's uncommitted and unmerged in the worktree (`git status --short`, `git log --oneline main..HEAD`).
   Commit only as the root's rules allow (stage, then ask).
2. Unmerged commits (`main..HEAD` not empty):  AskUserQuestion "Merge `<name>` into `main`?", options "Merge now"
   and "Leave unmerged", listing the commits in the question.  On "Merge now", get the BRANCH ready to fast-forward
   `main`, all from the worktree (branches are shared, so `main` is visible here):
   - NEVER `git -C <main checkout>` or `cd` there:  a worktree session refuses both.  `main` itself moves in step 6.
   - `git log --oneline HEAD..main` empty (`main` hasn't moved):  ready, go on to step 4
   - else `git merge-tree --write-tree --name-only main HEAD`, which merges without touching any files:
     - exit 0:  `git merge main` (a clean merge commit), then step 4
     - exit 1:  conflicts, the file names follow the tree id;  step 3
   - nothing unmerged:  skip this step and say "nothing to merge"
3. Merge conflicts:  AskUserQuestion, listing the conflicting files, options:
   - "Fix conflicts, then merge":
     - `git merge main` in the worktree;  resolve each file, keeping BOTH sides' intent
     - run the checks of each package the conflicts touch (`yarn ts`, `yarn test` there), if installed
     - commit the merge ("Merge main into `<name>`";  the answer counts as the ask), then step 4
   - "Exit anyway":  go on to step 4, unmerged
   - "Stay isolated":  stop here, still in the worktree
   - Can't fix them (keeping both sides needs a decision only the user can make, or the checks fail):
     `git merge --abort`, say so, list each file and why, then AskUserQuestion "Continue exiting?"
     options "Exit, unmerged" and "Stay isolated"
4. Move the session back, from the worktree's root:  `node scripts/window.mjs handoff <name> --back`.  When this
   turn ends, the package's window opens the session in an editor tab, and the worktree's window closes (its
   `.code-workspace` deleted).  A session that never moved there (it still ran in the package window):  it closes
   the worktree's window at once instead.  An older session that `add`ed the worktree to its own window:
   `node scripts/window.mjs remove packages/<pkg>`.
5. `ExitWorktree` with `action: "keep"`:  the worktree and branch stay, and the session is back in the main checkout.
   Never `remove` unasked (and on a hook-made worktree `remove` refuses without `discard_changes`).
6. Merging (only after "Merge now" got the branch ready), now in the main checkout:
   - it must be on `main` (`git branch --show-current`) with nothing uncommitted (`git status --short`):  another
     session may be working there.  Either fails:  say which and don't merge.
   - `git merge --ff-only <name>`.  Refused (`main` moved since step 2):  say so and don't merge;  `/isolate <name>`
     re-enters the worktree to merge `main` in again.
7. One line (plus "this session moves back to `<pkg>`'s window when this turn ends", after step 4's move):
   - merged:  the worktree can go (`git worktree remove .claude/worktrees/<name>`, `git branch -d <name>`)
   - not merged:  how to merge later (`git merge <name>` from the main checkout), then the same cleanup
