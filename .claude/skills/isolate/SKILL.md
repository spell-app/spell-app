---
name: isolate
description: Move this session into its own git worktree `<name>` (worktree, branch and session all named `<name>`) and show it in the user's current VS Code window;  `/isolate done` leaves it.  User-invoked as `/isolate <name>` or `/isolate done`.
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
5. Show it in the user's window (root `AGENTS.md` "Worktrees"):
   - `yarn window which`:  the window's second folder is its package, `packages/<pkg>`
   - `yarn window add .claude/worktrees/<name>/packages/<pkg> --name "<pkg> ⎇ <name>"`
   - no window, or `add` refused (a window not opened from its `.code-workspace`):  say so in one line and go on.
     NEVER `code --add` / `-n` / `-r`:  they restart the Claude panel or target the focused window.
6. In the worktree, no `node_modules/` at the root:  `yarn install`.
7. One line:  "isolated in worktree `<name>` (branch `<name>`), shown in your VS Code window as `<pkg> ⎇ <name>`".

## Finish:  `/isolate done`

1. Report what's uncommitted and unmerged in the worktree (`git status --short`, `git log --oneline main..HEAD`).
   Commit only as the root's rules allow (stage, then ask).
2. Take it out of the window:  `yarn window remove .claude/worktrees/<name>/packages/<pkg>` (the path `add` used).
3. `ExitWorktree` with `action: "keep"`:  the worktree and branch stay for merging.  Never `remove` unasked (and on a
   hook-made worktree `remove` refuses without `discard_changes`).
4. One line:  how to merge (`git merge <name>` from the main checkout), and that the worktree can then go
   (`git worktree remove .claude/worktrees/<name>`, `git branch -d <name>`).
