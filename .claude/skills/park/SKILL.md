---
name: park
description: Park this session's work so it can be picked up quickly later -- commit it as a WIP commit in its own worktree `<name>` and leave a PARKED note saying where it stopped and what's next;  `/park <other>` tells another running session to park itself.  Holds the shared "Resume" steps `/unpark` and `/wait-for` use.  Use for `/park [<name>]`, or when Owen says "park this" / "park <name>" / "shelve this until <x> is done".
argument-hint: "[<name>]"
---

# /park

Get this session's work out of the way, e.g. while another session restructures packages, and make it cheap to
pick back up.  The work ends up as a WIP commit on branch `<name>` in worktree `.claude/worktrees/<name>`, plus a
note.  `/unpark` picks it up by hand;  `/wait-for <other>` waits for another session, then picks it up by itself.

- PARKED note:  `PARKED-<name>.md` at the worktree root (gitignored, never committed).  First line
  `<!-- park: <state> -->`, `<state>` one of `parked`, `waiting:<target>`, `resumed`.  It's how a compacted or
  reopened session knows it's parked.
- Status:  `spell dev worktree status <name>` (JSON:  where a worktree / branch / plan / session stands), and
  `spell dev park list|candidates|wait`, from the repo root or a worktree (`spell help dev`).
- Running `/park` IS Owen's go-ahead to commit the WIP commit:  no "stage, then ask".  Nothing else gets committed.
- Style:  caveman lite, as in `/epic`.

## Park this session:  `/park` (or `/park <name>` naming this session)

`$ARGUMENTS` empty, or the name of this session's worktree:  park THIS session.  Any other name that matches a
session (`spell dev worktree status <name>` lists one in `sessions`):  "Park another session" below.  Matches nothing:  it's the
name to park this session under.

0. In plan mode:  ask Owen to leave it (shift+tab) first, as in `.claude/skills/isolate/SKILL.md`, "Start", step 0.
1. `<name>`:
   - in a worktree (the session's folder is under `.claude/worktrees/`):  that worktree's name
   - else `$ARGUMENTS`, lower-kebab-cased;  none:  propose one from the work so far in AskUserQuestion
   - then rename the session `<name>` at once, before step 2:
     `spell dev session title <name>`.  (Not done by the prompt hook:  `/park
     <name>` may name ANOTHER session.)
2. In the MAIN checkout:  move the work into worktree `<name>`, following `.claude/skills/isolate/SKILL.md`
   "Start", with these changes:
   - step 0, "Carry them over" WITHOUT asking, but ONLY this session's files:  the main checkout may hold other
     sessions' edits too.  `git status --short`;  any file this session didn't touch:  AskUserQuestion,
     multiSelect, "Which of these are this session's?" (preselect none).  Then `git stash push -u -m
     "park:<name>" -- <paths>`, its sha from `git stash list --format='%H %gs'`, and `git stash apply <sha>` in
     the worktree after step 3 (then drop that entry).  Shared content (`packages/docs/content`, `goals`,
     `agents`:  links into `../spell-app-dev`) needs no carrying:  every checkout already sees it.
   - steps 1-3 as written, then NOT steps 4-6 yet:  the commit and note (steps 3-4 below) come first, since
     isolate's step 6 ends the turn.  No `yarn install`:  parked work doesn't run.
   - then, only for a plain `/park`:  isolate's steps 4-6 (own window, move, end the turn), after step 5 below.
     From `/wait-for`, SKIP them:  the move restarts the session in the new window, which would kill the
     background wait.  `/unpark`'s window check offers the move later.
3. Commit, in the worktree:  `git add -A`, then `git commit -m "WIP (parked): <name> -- <where it stopped, one
   line>"`.  Nothing to commit:  skip, and say so.  BEFORE step 4, so the note can't be swept into the commit.
   Shared content (the plan doc, logs, docs pages) is never in it:  committed for you, in `../spell-app-dev`.
4. Write `PARKED-<name>.md` at the worktree root:

   ```
   <!-- park: parked -->
   # Parked:  <name>

   Branch `<name>` (worktree `.claude/worktrees/<name>`).  Plan doc:  [<name>](<link>) (or "none").
   Parked <YYYY-MM-DD HH:MM>, session `<session id>`.

   ## Goal
   <what this session is for, 1-3 lines>

   ## Where it stopped
   - WIP commit `<hash>`:  <one line>
   - <files in flight, half-done steps, anything not obvious from the diff>

   ## Next steps
   1. <next concrete step>
   2. ...

   ## Open questions
   1. <anything waiting on Owen;  "none">

   ## Waiting for
   <filled in by /wait-for;  "nothing">
   ```

   - The note must stand on its own:  a new session reading only it, plus the diff, can carry on.
5. Plan doc (`packages/docs/content/epics/<name>/`, shared by every checkout):  `spell dev plan-doc log <name>
   "Parked at <hash>:  <one line>;  next:  <step 1>"`.  No plan doc, or no `node_modules/`:  skip.
6. One line:  "parked `<name>` at `<hash>`;  pick it up with `/unpark <name>`, or `/wait-for <other>` to resume
   when <other> is done".

## Park another session:  `/park <other>`

1. `spell dev worktree status <other>`:  its `sessions`.
2. One running (`running: true`):  `SendMessage` to it:  "Run `/park` now (asked by session `<this session's
   title or id>`).  Reply when parked, with the worktree name."  Several running:  AskUserQuestion, which.
3. None running:  say so in one line and offer `/session <other>` to reopen it, then `/park` there.  NEVER park
   another session's files from here:  only that session knows which edits are its own.

## Resume

Used by `/unpark` (after its window check) and by `/wait-for` when the wait ends.  In the worktree:

1. Read `PARKED-<name>.md`:  goal, where it stopped, next steps.  Check the session's name
   (`.claude/skills/isolate/SKILL.md`, "Session name").
2. Bring in the new `main`, the same way as `.claude/skills/isolate/SKILL.md` "Finish" steps 2-3:
   - a worktree cut before 2026-10-04 (`spell dev shared status` shows its folders `tracked`):  `spell dev shared
     migrate <name>` first
   - `git log --oneline HEAD..main` empty:  nothing new, go on to step 4
   - `git merge-tree --write-tree --name-only main HEAD`:  exit 0, `git merge main`;  exit 1, conflicts:
     - `git merge main`, resolve each file keeping BOTH sides' intent.  Packages moved or renamed on `main` show
       up as rename / delete conflicts:  follow the move, carrying this branch's edits to the new path, and
       update its imports to the new aliases.
     - commit the merge ("Merge main into `<name>`";  parking was the go-ahead)
3. Checks:
   - `package.json` workspaces or any `yarn.lock` changed in the merge, or no `node_modules/`:  `yarn install`
   - `yarn ts` and `yarn test` in each package this branch touches (`git diff --name-only main...HEAD`)
4. Can't resolve a conflict (keeping both sides needs Owen's call) or checks fail on this branch's code:
   `git merge --abort` if still merging, then AskUserQuestion listing each file and why.  Stop there.
5. Otherwise:  set line 1 to `<!-- park: resumed -->`, add `Resumed <YYYY-MM-DD HH:MM>, merged main at <hash>`
   under "Where it stopped", log it in the plan doc as in step 5 above, and carry on with "Next steps".  Leave the
   WIP commit as it is (a merge sits on top now):  squash later if Owen wants.
6. One line:  "resumed `<name>`:  merged main (<n> conflicts fixed), checks <pass/fail>;  now on:  <next step>".
   Then do it.
