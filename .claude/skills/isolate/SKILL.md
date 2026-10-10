---
name: isolate
description: Move this session into its own git worktree `<name>` (worktree, branch and session all named `<name>`) and either open it in a new, tinted VS Code window or stay in this one (Owen picks, `stay-check` recommends);  `/isolate done` offers to merge it into `main` and to open a pull request for it, then leaves it.  Use for `/isolate <name>`, `/isolate done`, or when Owen says "isolate as <name>" / "isolate this" about the current session.
argument-hint: <name> | done
---

# /isolate

Work in worktree `.claude/worktrees/<name>`, so this session's edits never collide with another session's.
- The worktree, its branch and the session share one name.
- `/epic` runs these steps too.
- The session either moves to a NEW window of the worktree's own, or STAYS in this one.
  Owen picks, each time (step 2b).

## Start:  `/isolate <name>`

0. Checks and rename, BEFORE anything else.
   - A typed `/isolate <name>` got them from the repo's `UserPromptSubmit` hook
     ([prompt-gate.mjs](.claude/hooks/prompt-gate.mjs), read its header):
     it renamed the session `<name>`, or blocked the prompt.
   - "Isolate as <name>" in plain words never reaches the hook, so do its checks here:
   - in plan mode:  it's read-only apart from the plan file.
     - So `EnterWorktree` can't run, and ExitPlanMode would ask to APPROVE a half-made plan.
     - Ask the user to leave plan mode (shift+tab);  the plan file survives.
   - in another worktree:  the session's folder is under `.claude/worktrees/<other>`,
     or its window is a worktree's (`spell dev window which`:  `workspace` under `workspaces/ongoing/`).
     - `<other>` isn't `<name>`:  stop, saying so in one line
       ("`/isolate done` first, or start from a package window").
   - rename:  `spell dev session title "🚧 <name>"`.
     It lands on the next prompt, or when the session opens in its new window.
   - a saved prompt, `~/.spell/prompts/<name>.md`:  it's the task to carry on with once isolated.
     - The hook saved it while blocking an earlier `/isolate <name> ...`.
     - Delete it once done.

   Already mid-work ("isolate as <name>" in a running session):
   - edits already made in the main checkout won't follow:  the worktree is cut from COMMITTED `main`.
     - Shared content does follow, and `git status` never lists it.
       `epics`, `guides`, `pages`, `templates`, `goals` and `agents` are links into `../spell-app-dev`
       in every checkout.
     - List the edits (`git status --short`) and AskUserQuestion, options:
       - "Carry them over"
       - "Commit on `main` first" (stage, then ask)
       - "Leave them"
     - Carry over with a TAGGED stash:  the stash stack is shared with every worktree.

       ```sh
       git stash push -u -m "isolate:<name>"     # here;  its sha from:
       git stash list --format='%H %gs'
       git stash apply <sha>                     # in the worktree, after step 3;  then drop that entry
       ```

1. `<name>` is `$ARGUMENTS`, or the `<name>` in "isolate as <name>".
   - Lower-kebab-cased:  `Docs Index` -> `docs-index`.
   - No name:  propose one from the work so far in AskUserQuestion;  the user can type another.
   - Then rename (step 0's `spell dev session title`), since the hook only renames a name it was given.
2. Collisions, from the repo root:
   - a worktree at `.claude/worktrees/<name>` (`git worktree list`)
   - a branch `<name>` or `worktree-<name>`
   - Any hit:  AskUserQuestion, options "Reuse `<name>`" and "Different name" (typed in "Other").

2b. Where:  `spell dev window stay-check` prints `recommend stay|window`, and why.
   - From `/epic`, add `--epic`.
   - AskUserQuestion "Where should `<name>` run?", its reasons in the question,
     the recommended option first, with "(Recommended)":
   - "New window `⎇ <name>`":  steps 3-6.
     - Tinted, with Explorer and Source Control on the worktree.
     - This window keeps its other sessions.
   - "Stay in this window":  step 3, then "Stay" below.
     - No move, same tab.
     - Its changes show in Source Control, not in Explorer
       (each worktree is its own repo there:  `git.detectWorktrees`).
     - The window is retitled `⎇ <name>` and tinted (`stay`).
   - Why ask:  staying is quicker, and touches nothing else when this is the window's only session.
     With others, they share its doc preview and Source Control ([window.mjs](scripts/window.mjs), "Staying put").
3. `EnterWorktree` with `name: "<name>"`, or `path: ".claude/worktrees/<name>"` when reusing one.
   - The repo's `WorktreeCreate` hook ([worktree.mjs](.claude/hooks/worktree.mjs))
     makes it on branch `<name>`, from local `main`.
   - It keeps this session listed in every window.
4. Open it in its own window, from the worktree's root (the root `AGENTS.md`, "Worktrees"):
   - `spell dev window open <name> [--color <look>]`:  a NEW window.
     - Its file:  `workspaces/ongoing/<name>.code-workspace`, in the main checkout, git-ignored.
     - Its look:  this window's, or `<look>`'s, one of the 12 of `spell dev window color`
       (`/isolate <name> -purple`, `/epic <name> -purple`;  epic `windows-and-review` P5).
     - Its folders:  the MAIN root (so every session is listed), then the worktree's root, `⎇ <name>`.
     - `<pkg>`:  this session's window's.
   - This isn't a package window (a worktree's ...):  `open` takes `spell-app`'s, the whole repo's window and its look.
     - Never ask which package (Owen, 2026-10-07).
     - `--pkg <pkg>` only when Owen names one.
   - `spell dev window` works before the worktree's `yarn install`.
     - The `spell` link runs the MAIN checkout's CLI, which has its packages.
     - `yarn window` didn't:  yarn runs no script before `yarn install`.
   - It fails otherwise:  say so in one line, skip step 5, and do "Continue" now, in this window.
     - NEVER `code --add` / `-r`:  they restart the Claude panel, or target the focused window.
5. Move the session there:  `spell dev window handoff <name> --prompt continue`.
   - When this turn ends:
     - the new window opens the session in an editor tab (never the sidebar)
     - `continue` is typed into its input
     - this window closes its tab
   - The move itself is the `Stop` hook's ([handoff.mjs](.claude/hooks/handoff.mjs)).
   - A doc shown from here on (`spell dev plan-doc open`) waits for the move,
     then shows beside the session in the new window.
   - It fails:  say so in one line, and do "Continue" now, in this window.
6. END THE TURN now, so the move happens at once.
   - Nothing else this turn:  no `yarn install`, no exploring, no questions.
   - One line:  "isolated in worktree `<name>` (branch `<name>`);  moving to `⎇ <name>`:
     press enter on `continue` there".
   - Why:  the move waits for the turn to end, and Owen waits for the move.

## Stay:  in this window

After step 3, when Owen picked "Stay in this window":  no `open`, no `handoff`, no turn end.

0. `spell dev window stay <name>`:  the window says so at once.
   - It's titled `⎇ <name>`, its title bar tinted:  no reload, the Claude panel untouched.
   - `-<look>` given:  `spell dev window color <look>` too.
1. "Continue" below, steps 2-4, at once, in this turn.
2. One line:  "isolated in worktree `<name>` (branch `<name>`), staying in this window;
   its changes are in Source Control under `<name>`".

- Later, to move after all:  steps 4-6, any time.
  - That's `open <name>`, `handoff <name> --prompt continue`, then end the turn.

## Continue:  the first turn in the new window

The turn after step 6, whatever Owen sends (`continue`, typed in by the move, or anything else):
1. Old tab still open in the old window (its title didn't match):  say so in one line, close it by hand.
   - The log is `~/.spell/windows/handoffs/<session id>.log`.
   - Only after a move:  "Stay" skips this.
2. No `node_modules/` at the worktree's root:  `yarn install` (a few seconds).
3. Check the session's name ("Session name" below).
4. Carry on, with the first of these there is:
   - the saved prompt `~/.spell/prompts/<name>.md`, then delete it
   - the work under way (mid-session)
   - `/epic`'s next step
   - Nothing to carry on with:  one line, "ready in `<name>`".

## Session name

The session MUST stay titled `🚧 <name>` while its work is under way.
- Other icons:  `📅 <name>`, a future epic written down;  `✅ <name>`, merged (`spell dev session done`).
  Owen, 2026-10-07.
- Why:  the handoff finds its old tab by title,
  and Owen finds it in the panel's list by name, its icon saying where it stands.
- It drifts:  Claude's own title ("Doc-plan SEO") wins when the hook never ran, or Owen renamed it.
  - The hook never runs for a plain-words "isolate as ...", or a resumed or reopened session.
- Check, and rename if needed, whenever an isolated or epic session STARTS or RESUMES work:
  - "Continue" above (the first turn in the new window)
  - each `/epic` phase start ("5. Each phase", step 1;  Doc Review is a phase too)
  - [the park skill](.claude/skills/park/SKILL.md)'s "Resume" (`/unpark`, `/wait-for`)
  - Owen reopening the session to carry on ("start P3", "continue")
- How:  `spell dev session title "🚧 <name>"`.
  - It checks first:  already `🚧 <name>` (or queued), it does nothing.
  - Else it queues it, which lands on Owen's NEXT prompt.
  - The prompt hook titles a typed `/isolate`, `/epic` or `/unpark <name>` so by itself.
  - Renamed:  one line, "session renamed `🚧 <name>` (was "<old>");  shows on your next message".
  - `spell dev session title` alone shows the current title, and any queued one.
- `<name>`:  the worktree's (`.claude/worktrees/<name>`), which is the branch's and the plan doc's.

## Finish:  `/isolate done`

0. Not in a worktree (the session's folder isn't under `.claude/worktrees/`):
   say so in one line, then offer to clean up.
   - Candidates:  each `.claude/worktrees/<name>` that
     - no session is in:  under "No session in" from `spell dev worktree list`.
       Why:  a fresh worktree has nothing outside `main` either, but its session is still using it.
     - has nothing uncommitted:  `git -C .claude/worktrees/<name> status --short`, fine from the main checkout
     - has nothing outside `main`:  `git log --oneline main..<branch>` empty.
       An agent's `<owner>-agent-<id>` (below):  or nothing outside branch `<owner>`.
   - None:  stop.
   - Else AskUserQuestion, multi-select, one option per candidate:  "`<name>` (`<branch>`)".
     - It takes 2-4 options, so one candidate is "Remove `<name>`" / "Keep it".
     - More than 4 go in several questions.
   - For each picked:
     - `git worktree remove .claude/worktrees/<name>`
     - `git branch -d <branch>`
       - `-D` for an agent's branch that's only in `<owner>`, since `-d` checks against `main`
   - Then stop:  steps 1-8 are for a session IN a worktree.
1. Report what's uncommitted and unmerged in the worktree:
   `git status --short`, `git log --oneline main..HEAD`.
   - Commit only as the root's rules allow (stage, then ask).
2. Unmerged commits (`main..HEAD` not empty):  AskUserQuestion "Merge `<name>` into `main`?",
   options "Merge now" and "Leave unmerged", listing the commits in the question.
   - On "Merge now", get the BRANCH ready to fast-forward `main`.
     All from the worktree:  branches are shared, so `main` is visible here.
   - NEVER `git -C <main checkout>` or `cd` there:  a worktree session refuses both.
     `main` itself moves in step 7.
   - First, the changelog:  add or move this branch's entry in [the changelog](guides/changelog.html)
     ("Changelog" in the root's `AGENTS.md`).
     - It's shared content:  write it straight in, nothing to commit on the branch for it.
     - It's committed for you at the turn's end.
   - A worktree cut before 2026-10-04 (`spell dev shared status` shows its folders `tracked`, not `ok`):
     `spell dev shared migrate <name>` first.
     - `--dry-run` shows what it moves.
     - Else merging `main` drags its old tracked copies of the docs, goals and logs into conflicts.
   - `git log --oneline HEAD..main` empty (`main` hasn't moved):  ready, go on to step 4.
   - Else `git merge-tree --write-tree --name-only main HEAD`, which merges without touching any files:
     - exit 0, or conflicts ONLY in generated files:  `spell dev worktree merge-main`, then step 4.
       - No asking (Owen, 2026-10-03);  say in one line what it regenerated.
       - Generated:  the root `.gitattributes`' `merge=binary` paths, and `yarn.lock`.
         Those paths are bundles, site and brand assets, snapshots.
       - `merge-main` rebuilds each one both sides changed, from the merged source,
         with the command in `GENERATORS` ([mergeMain.ts](packages/cli/src/dev/mergeMain.ts)).
         Then it commits the merge ("Merge main into `<name>`").
       - Its `REVIEW` lines:  snapshot entries with a value NEITHER side had, i.e. new behaviour nobody looked at.
         Show each to Owen, in bold, in the summary.
       - It fails (a generator errors):  the merge is left in progress.
         Fix the cause, then `spell dev worktree merge-main --continue`;
         or `git merge --abort` and step 3's "Can't fix them".
     - Other files conflict:  step 3.
   - Nothing unmerged:  skip this step and say "nothing to merge".
3. Merge conflicts in other files (code, skills, docs prose).
   - These can't conflict any more:  the logs (`agents/*.md`), the changelog, the docs index and plan docs.
     - They're shared content, untracked by spell-app.
     - One in conflict means a worktree not migrated yet (step 2).
   - AskUserQuestion, listing the conflicting files, options:
     - "Fix conflicts, then merge":
       - `spell dev worktree merge-main`:  it stops mid-merge, listing them
       - resolve each file, keeping BOTH sides' intent, and `git add` it
       - run the checks of each package the conflicts touch (`yarn ts`, `yarn test` there), if installed
       - `spell dev worktree merge-main --continue`:  regenerates the generated files and commits the merge
         (the answer counts as the ask), then step 4
     - "Exit anyway":  go on to step 4, unmerged
     - "Stay isolated":  stop here, still in the worktree
   - Can't fix them:  keeping both sides needs a decision only the user can make, or the checks fail.
     - `git merge --abort`, say so, and list each file and why.
     - Then AskUserQuestion "Continue exiting?", options "Exit, unmerged" and "Stay isolated".
4. Pull request:  an offer, ASKED first, since pushing publishes the branch on GitHub.
   - Only when GitHub's `main` is up to date with local `main` (Q16 of `review-review`, answer C).
   - All from the worktree.
   - `git fetch origin main`, then `git rev-list --count origin/main..main`:
     how far local `main` is ahead of GitHub's.
     - Not 0:  NO offer;  say why in one line, e.g.
       "No pull request:  GitHub's `main` is 62 commits behind local `main`,
       so a PR would list all 62 as well as this branch's.  Push `main` first if you want one."
     - NEVER push `main` from here.
     - The fetch fails (offline, not signed in):  "No pull request:  couldn't reach GitHub (<the error's gist>)".
   - `git rev-list --count origin/main..HEAD` is 0:  nothing GitHub lacks, so nothing to show.
     Skip, silently.
   - `gh pr list --head <name> --state open --json number,url`:
     one open already, so the offer is to push the branch, which updates it.
   - AskUserQuestion "Open a pull request for `<name>` on GitHub?",
     saying how many commits it shows and that pushing publishes them.
     - Options:  "Push and open a PR", and "No PR".
     - When one is open, the first is "Push `<name>` (updates PR #<n>)".
   - On yes:
     - `git push -u origin <name>`:  never `--force`.
       Refused:  say why, and stop the offer there.
     - Unless one was open, `gh pr create`:

       ```sh
       gh pr create --base main --head <name> --title "<title>" --body-file <file in the scratchpad>
       ```

       - Title:  the branch's changelog entry's header without its date
         (`2026-10-05 · Review Review` -> `Review Review`).
         No entry (left unmerged):  the plan doc's title, else the branch name.
       - Body:
         - the entry's bullets, as a markdown list (`- ...`)
         - plain text:  its links point into shared docs, which aren't on GitHub
         - then the attribution line the session's instructions give for pull requests
     - One line with the PR's URL.
   - Merged later (step 7) and `main` pushed:  GitHub marks the PR merged by itself, its commits being in `main`.
5. NO move back:  the session stays in the window it's in (the worktree's, or the one it stayed in).
   - Why:  Owen (2026-10-03) "we don't need to go back into the originating window.
     That's just confusing things".
   - The worktree's window stays open for Owen to read the summary;  he closes it.
   - Its file goes with `spell dev window close <name>` later, or `/worktrees` lists it.
     That file:  `workspaces/ongoing/<name>.code-workspace`.
   - NEVER `handoff <name> --back` from here.
   - It STAYED in its window ("Stay" above):
     `spell dev window stay --end` puts the window's title and title bar back.
     It says "nothing to put back" when there's nothing.
6. `ExitWorktree` with `action: "keep"`:  the worktree and branch stay, and the session is back in the main checkout.
   - Never `remove` unasked.
   - On a hook-made worktree, `remove` refuses without `discard_changes` anyway.
7. Merging, only after "Merge now" got the branch ready.
   Now in the main checkout:
   - It must be on `main`, with nothing uncommitted:  another session may be working there.
     - The checks:  `git branch --show-current`, `git status --short`.
     - Either fails:  say which, and don't merge.
   - `git merge --ff-only <name>`.
     - Refused (`main` moved since step 2):  say so, and don't merge.
     - `/isolate <name>` re-enters the worktree to merge `main` in again.
   - Merged:  `spell dev session done`.
     - This session's name gets a ✅ (`✅ <name>`), so the Claude panel tells finished work from live work.
     - It shows after Owen's next message here:  a hook applies it, and nothing else can.
     - `/isolate <name>`, `/epic <name>` or `/unpark <name>` takes it off again (epic `windows-and-review` P6).

7b. Agents' worktrees, WITHOUT asking (Owen, 2026-10-05), now in the main checkout.
   - An agent this session started with `isolation: "worktree"` (an epic's phases)
     got `.claude/worktrees/<name>-agent-<id>`, on branch `<name>-agent-<id>`.
     The `WorktreeCreate` hook names it for its owner.
   - It was kept when the agent finished, because its commits weren't in `main` yet.
   - For each in `git worktree list`:
   - Remove it when it's clean and its commits are in `<name>`:
     - clean:  `git -C <path> status --short` empty
     - in `<name>`:  `git log --oneline <name>..<branch>` empty
     - then `git worktree remove <path>`, and `git branch -D <branch>`.
       `-d` checks against `main` only;  the `log` check is the safety.
   - Else keep it, and list it in step 8 with why (uncommitted files, or commits `<name>` lacks).
   - A pre-2026-10-05 agent worktree is plain `agent-<id>`.
     Remove it on the same checks when its branch is in `<name>`:
     `git merge-base --is-ancestor <branch> <name>`.
8. One line;  in a worktree's window, plus "close this window when you're done with it".
   - Merged:  the worktree can go (`git worktree remove .claude/worktrees/<name>`, `git branch -d <name>`).
   - Not merged:  how to merge later (`git merge <name>` from the main checkout), then the same cleanup.
   - Agents' worktrees:  how many step 7b removed, and any it kept.
