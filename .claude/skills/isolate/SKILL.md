---
name: isolate
description: Move this session into its own git worktree `<name>` (worktree, branch and session all named `<name>`) and either open it in a new, tinted VS Code window or stay in this one (Owen picks, `stay-check` recommends);  `/isolate done` offers to merge it into `main`, then leaves it.  Use for `/isolate <name>`, `/isolate done`, or when Owen says "isolate as <name>" / "isolate this" about the current session.
argument-hint: <name> | done
---

# /isolate

Work in worktree `.claude/worktrees/<name>`, so this session's edits never collide with another session's.  The
worktree, its branch and the session share one name.  `/epic` runs these steps too.  The session either moves to a
NEW window of the worktree's own, or STAYS in this one:  Owen picks, each time (step 2b).

## Start:  `/isolate <name>`

0. Checks and rename, BEFORE anything else.  A typed `/isolate <name>` got them from the repo's `UserPromptSubmit`
   hook (`.claude/hooks/prompt-gate.mjs`, read its header):  it renamed the session `<name>`, or blocked the prompt.
   "Isolate as <name>" in plain words never reaches the hook, so do its checks here:
   - in plan mode:  it's read-only apart from the plan file, so `EnterWorktree` can't run, and ExitPlanMode would
     ask to APPROVE a half-made plan.  Ask the user to leave plan mode (shift+tab);  the plan file survives.
   - in another worktree:  the session's folder is under `.claude/worktrees/<other>`, or its window is a worktree's
     (`spell dev window which`:  `workspace` under `workspaces/ongoing/`).  `<other>` isn't `<name>`:  stop,
     saying so in one line ("`/isolate done` first, or start from a package window").
   - rename:  `spell dev session title <name>`.  It lands on the next prompt, or
     when the session opens in its new window.
   - a saved prompt `~/.spell/prompts/<name>.md` (the hook saved it while blocking an earlier `/isolate <name>
     ...`):  it's the task to carry on with once isolated.  Delete it once done.
   Already mid-work ("isolate as <name>" in a running session):
   - edits already made in the main checkout:  the worktree is cut from COMMITTED `main`, so they won't follow
     (shared content does:  `packages/docs/content`, `goals`, `agents` are links into `../spell-app-dev` in every
     checkout, and `git status` never lists them).  List them (`git status --short`) and AskUserQuestion:  "Carry
     them over", "Commit on `main` first" (stage, then ask) or "Leave them".  Carry over with a TAGGED stash (the stash stack is shared with every worktree):
     `git stash push -u -m "isolate:<name>"` here, its sha from `git stash list --format='%H %gs'`, then
     `git stash apply <sha>` in the worktree after step 3, and drop that entry.
1. `<name>` is `$ARGUMENTS` (or the `<name>` in "isolate as <name>"), lower-kebab-cased (`Docs Index` ->
   `docs-index`).  No name:  propose one from the work so far in AskUserQuestion;  the user can type another.
   Then rename (step 0's `spell dev session title`), since the hook only renames a name it was given.
2. Collisions (from the repo root):  a worktree at `.claude/worktrees/<name>` (`git worktree list`), a branch `<name>`
   or `worktree-<name>`.  Any hit:  AskUserQuestion, options "Reuse `<name>`" and "Different name" (typed in "Other").
2b. Where:  `spell dev window stay-check` (`--epic` from `/epic`) prints `recommend stay|window` and why.
   AskUserQuestion "Where should `<name>` run?", its reasons in the question, the recommended option first with
   "(Recommended)":
   - "New window `<pkg> ⎇ <name>`":  tinted, Explorer and Source Control on the worktree;  this window keeps its
     other sessions.  Steps 3-6.
   - "Stay in this window":  no move, same tab;  its changes show in Source Control (each worktree is its own repo
     there, `git.detectWorktrees`), not in Explorer;  no tint.  Step 3, then "Stay" below.
   - Why ask:  staying is quicker and touches nothing else when this is the window's only session.  With others,
     they share its doc preview and Source Control (`scripts/window.mjs`, "Staying put").
3. `EnterWorktree` with `name: "<name>"`, or `path: ".claude/worktrees/<name>"` when reusing one.  The repo's
   `WorktreeCreate` hook (`.claude/hooks/worktree.mjs`) makes it on branch `<name>` from local `main`, and keeps this
   session listed in every window.
4. Open it in its own window (root `AGENTS.md` "Worktrees"), from the worktree's root:
   - `spell dev window open <name>`:  a NEW window from `workspaces/ongoing/<name>.code-workspace` (main
     checkout, git-ignored), the package window's theme with a tinted title bar.  Folders:  the MAIN root (so every
     session is listed), then the worktree's `packages/<pkg>` and root.
     `<pkg>`:  this session's window's.
   - "which package?" (this isn't a package window):  AskUserQuestion "Which package's window?", up to 4 packages
     the work touches, most likely first and "(Recommended)";  then `open <name> --pkg <pkg>`.
   - `spell dev window` works before the worktree's `yarn install`:  the `spell` link runs the MAIN checkout's
     CLI, which has its packages (`yarn window` didn't:  yarn runs no script before `yarn install`)
   - fails otherwise:  say so in one line, skip step 5, and do "Continue" now, in this window.  NEVER
     `code --add` / `-r`:  they restart the Claude panel or target the focused window.
5. Move the session there:  `spell dev window handoff <name> --prompt continue`.  When this turn ends, the
   new window opens the session in an editor tab (never the sidebar), `continue` typed into its input, and this
   window closes its tab.  The move itself is the `Stop` hook's (`.claude/hooks/handoff.mjs`).
   - a doc shown from here on (`spell dev plan-doc open`) waits for the move, then shows beside the session in the
     new window
   - fails:  say so in one line, and do "Continue" now, in this window
6. END THE TURN now, so the move happens at once:  nothing else this turn (no `yarn install`, no exploring, no
   questions).  One line:  "isolated in worktree `<name>` (branch `<name>`);  moving to `<pkg> ⎇ <name>`:  press
   enter on `continue` there".  Why:  the move waits for the turn to end, and Owen waits for the move.

## Stay:  in this window

After step 3, when Owen picked "Stay in this window":  no `open`, no `handoff`, no turn end.
1. "Continue" below, steps 2-4, at once, in this turn.
2. One line:  "isolated in worktree `<name>` (branch `<name>`), staying in this window;  its changes are in Source
   Control under `<name>`".
- Later, to move after all:  steps 4-6 (`open <name>`, `handoff <name> --prompt continue`, end the turn), any time.

## Continue:  the first turn in the new window

The turn after step 6, whatever Owen sends (`continue`, typed in by the move, or anything else):
1. Old tab still open in the old window (its title didn't match):  say so in one line, close it by hand;  the log
   is `~/.spell/windows/handoffs/<session id>.log`.  (Only after a move:  "Stay" skips this.)
2. No `node_modules/` at the worktree's root:  `yarn install` (a few seconds).
3. Check the session's name ("Session name" below).
4. Carry on:  the saved prompt `~/.spell/prompts/<name>.md` if any (then delete it), the work under way
   (mid-session), or `/epic`'s next step.  Nothing to carry on with:  one line, "ready in `<name>`".

## Session name

The session MUST stay titled `<name>`:  the handoff finds its old tab by title, and Owen finds it in the panel's
list by name.  It drifts:  Claude's own title ("Doc-plan SEO") wins when the hook never ran (a plain-words
"isolate as ...", a resumed or reopened session), or Owen renamed it.
- Check, and rename if needed, whenever an isolated or epic session STARTS or RESUMES work:
  - "Continue" above (the first turn in the new window)
  - each `/epic` phase start ("5. Each phase", step 1;  Doc Review is a phase too)
  - `.claude/skills/park/SKILL.md` "Resume" (`/unpark`, `/wait-for`)
  - Owen reopening the session to carry on ("start P3", "continue")
- How:  `spell dev session title <name>`.  It checks first:  already `<name>`
  (or queued), it does nothing;  else it queues `<name>`, which lands on Owen's NEXT prompt.
  - renamed:  one line, "session renamed `<name>` (was "<old>");  shows on your next message"
  - `spell dev session title` alone shows the current title, and any queued one
- `<name>`:  the worktree's (`.claude/worktrees/<name>`), which is the branch's and the plan doc's.

## Finish:  `/isolate done`

0. Not in a worktree (the session's folder isn't under `.claude/worktrees/`):  say so in one line, then offer to
   clean up:
   - candidates:  each `.claude/worktrees/<name>` that
     - no session is in:  under "No session in" from
       `spell dev worktree list`.
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
   - first, the changelog:  add or move this branch's entry in `packages/docs/content/changelog.html` ("Changelog" in
     the root's `AGENTS.md`).  It's shared content:  write it straight in, nothing to commit on the branch for it
     (committed for you at the turn's end)
   - a worktree cut before 2026-10-04 (`spell dev shared status` shows its folders `tracked`, not `ok`):
     `spell dev shared migrate <name>` first (`--dry-run` to see what it moves), else merging `main` drags its old
     tracked copies of the docs, goals and logs into conflicts
   - `git log --oneline HEAD..main` empty (`main` hasn't moved):  ready, go on to step 4
   - else `git merge-tree --write-tree --name-only main HEAD`, which merges without touching any files:
     - exit 0:  `git merge main` (a clean merge commit), then step 4
     - exit 1:  conflicts, the file names follow the tree id;  step 3
   - nothing unmerged:  skip this step and say "nothing to merge"
3. Merge conflicts.  ONLY in built files:  fix them WITHOUT asking (Owen, 2026-10-03), say in one line which files
   and how, commit the merge ("Merge main into `<name>`"), then step 4.
   - the logs (`agents/*.md`), the changelog, the docs index and plan docs can't conflict any more:  shared
     content, untracked by spell-app.  One in conflict means a worktree not migrated yet (step 2)
   - built files:  regenerate with their command instead of merging by hand:  `yarn.lock` (`yarn install`), bundles
     (`packages/docs/tools/_assets/spell-ui.js` ...:  their build)
   - any OTHER file in conflict (code, skills, docs prose):  AskUserQuestion, listing the conflicting files, options:
     - "Fix conflicts, then merge":
       - `git merge main` in the worktree;  resolve each file, keeping BOTH sides' intent
       - run the checks of each package the conflicts touch (`yarn ts`, `yarn test` there), if installed
       - commit the merge ("Merge main into `<name>`";  the answer counts as the ask), then step 4
     - "Exit anyway":  go on to step 4, unmerged
     - "Stay isolated":  stop here, still in the worktree
   - Can't fix them (keeping both sides needs a decision only the user can make, or the checks fail):
     `git merge --abort`, say so, list each file and why, then AskUserQuestion "Continue exiting?"
     options "Exit, unmerged" and "Stay isolated"
4. NO move back:  the session stays in the window it's in (the worktree's, or the one it stayed in).  Why:  Owen
   (2026-10-03) "we don't need to go back into the originating window.  That's just confusing things".
   - The worktree's window stays open for Owen to read the summary;  he closes it.  Its file
     (`workspaces/ongoing/<name>.code-workspace`) goes with `spell dev window close <name>` later, or
     `/worktrees` lists it.
   - NEVER `handoff <name> --back` from here.
5. `ExitWorktree` with `action: "keep"`:  the worktree and branch stay, and the session is back in the main checkout.
   Never `remove` unasked (and on a hook-made worktree `remove` refuses without `discard_changes`).
6. Merging (only after "Merge now" got the branch ready), now in the main checkout:
   - it must be on `main` (`git branch --show-current`) with nothing uncommitted (`git status --short`):  another
     session may be working there.  Either fails:  say which and don't merge.
   - `git merge --ff-only <name>`.  Refused (`main` moved since step 2):  say so and don't merge;  `/isolate <name>`
     re-enters the worktree to merge `main` in again.
7. One line (plus, in a worktree's window, "close this window when you're done with it"):
   - merged:  the worktree can go (`git worktree remove .claude/worktrees/<name>`, `git branch -d <name>`)
   - not merged:  how to merge later (`git merge <name>` from the main checkout), then the same cleanup
