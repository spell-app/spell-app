---
name: isolate
description: Move this session into its own git worktree `<name>` (worktree, branch and session all named `<name>`) and show it in the user's current VS Code window;  `/isolate done` offers to merge it into `main`, then leaves it.  User-invoked as `/isolate <name>` or `/isolate done`.
argument-hint: <name> | done
disable-model-invocation: true
---

# /isolate

Work in worktree `.claude/worktrees/<name>`, so this session's edits never collide with another session's.  The
worktree, its branch and the session share one name.  `/plan-doc` runs these steps too.

## Start:  `/isolate <name>`

1. `<name>` is `$ARGUMENTS`, lower-kebab-cased (`Docs Index` -> `docs-index`).  No argument:  ask for one.
2. Collisions (from the repo root):  a worktree at `.claude/worktrees/<name>` (`git worktree list`), a branch `<name>`
   or `worktree-<name>`.  Any hit:  AskUserQuestion, options "Reuse `<name>`" and "Different name" (typed in "Other").
3. Tell the user, in one line:  run `/rename <name>` so the session's tab and list entry show it.  A skill can't
   rename its own session.
4. `EnterWorktree` with `name: "<name>"`, or `path: ".claude/worktrees/<name>"` when reusing one.  The repo's
   `WorktreeCreate` hook (`.claude/hooks/worktree.mjs`) makes it on branch `<name>` from local `main`, and keeps this
   session listed in every window.
5. Show it in the user's window (root `AGENTS.md` "Worktrees"), from the worktree's root:
   - `node scripts/window.mjs`, NOT `yarn window`:  a fresh worktree has no `node_modules/` yet, and `yarn` runs no
     script before `yarn install`
   - `node scripts/window.mjs which`:  the window's second folder is its package, `packages/<pkg>`
   - `node scripts/window.mjs add packages/<pkg> --name "<pkg> ⎇ <name>"`:  the path resolves from the current folder,
     so `packages/<pkg>` is the worktree's copy (`.claude/worktrees/<name>/...` would nest it twice)
   - no window, or `add` refused (a window not opened from its `.code-workspace`):  say so in one line and go on.
     NEVER `code --add` / `-n` / `-r`:  they restart the Claude panel or target the focused window.
6. In the worktree, no `node_modules/` at the root:  `yarn install`.
7. One line:  "isolated in worktree `<name>` (branch `<name>`), shown in your VS Code window as `<pkg> ⎇ <name>`".

## Finish:  `/isolate done`

1. Report what's uncommitted and unmerged in the worktree (`git status --short`, `git log --oneline main..HEAD`).
   Commit only as the root's rules allow (stage, then ask).
2. Unmerged commits (`main..HEAD` not empty):  AskUserQuestion "Merge `<name>` into `main`?", options "Merge now"
   and "Leave unmerged", listing the commits in the question.  On "Merge now":
   - the main checkout is the FIRST line of `git worktree list`;  run git there with `git -C <main checkout>`, never
     `cd` (a worktree session refuses it)
   - it must be on `main` (`git -C <main checkout> branch --show-current`) with nothing uncommitted
     (`git -C <main checkout> status --short`):  another session may be working there.  Either fails:  say which,
     don't merge, and go on
   - `git -C <main checkout> merge <name>`;  a fast-forward or a clean merge commit is fine
   - conflicts:  `git -C <main checkout> merge --abort` at once (never leave `main` mid-merge), then step 3
   - nothing unmerged:  skip this step and say "nothing to merge"
3. Merge conflicts:  AskUserQuestion, listing the conflicting files, options:
   - "Fix conflicts, then merge":  fix them in the WORKTREE, never in the main checkout:
     - `git merge main` in the worktree;  resolve each file, keeping BOTH sides' intent
     - run the checks of each package the conflicts touch (`yarn ts`, `yarn test` there), if installed
     - commit the merge ("Merge main into `<name>`";  the answer counts as the ask), then re-check the main checkout
       as in step 2 and `git -C <main checkout> merge --ff-only <name>`
   - "Exit anyway":  go on to step 4, unmerged
   - "Stay isolated":  stop here, still in the worktree
   - Can't fix them (keeping both sides needs a decision only the user can make, or the checks fail):
     `git merge --abort` in the worktree, say so, list each file and why, then AskUserQuestion "Continue exiting?"
     options "Exit, unmerged" and "Stay isolated"
4. Take it out of the window, from the worktree's root:  `node scripts/window.mjs remove packages/<pkg>` (the path
   `add` used).
5. `ExitWorktree` with `action: "keep"`:  the worktree and branch stay.  Never `remove` unasked (and on a hook-made
   worktree `remove` refuses without `discard_changes`).
6. One line:
   - merged:  the worktree can go (`git worktree remove .claude/worktrees/<name>`, `git branch -d <name>`)
   - not merged:  how to merge later (`git merge <name>` from the main checkout), then the same cleanup
