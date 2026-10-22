Claude Code loads the cross-model `AGENTS.md` (and WWOD), then these Claude-only rules.

@AGENTS.md

@agents/wwod/WWOD.md

In your own words, without jargon, narrate each step in the order it actually happens, and bold inline anything in the current PR that has drifted from my most recently stated intent.

Questions that need a picture, or more than the AskUserQuestion modal holds (4 options per question, 4 questions):
use `/details`, spell-epic's skill ([its folder](../spell-epic/skills/details/)).
- It's a page in VS Code's right side bar, which Owen answers on.

Naming any docs page in a reply:  its side bar link, then its browser link (`• 🌐`), as `Title • 🌐`.
- `epic pages link <page> --hash <id> --show` gives both.

Delegated work (epic `skillz`, Owen, 2026-10-07):  every agent you start is NAMED and LISTED, as `/bg` does it.
- The steps:  [the bg skill](../spell-epic/skills/bg/SKILL.md), "Names", "When its notice arrives", "Redirects".
- Before it starts:  `epic agents add <name> "<task>"`.
  - The full name it prints, `<epic>-<name>`, goes first in the `Agent` call's `description`.
- When it's back:  `epic agents done <name>`.
- `epic agents` says what's running.
  While any runs, an `epic agents wait` waits in the background for Owen's redirect notes.
- Relaying what it found:  your reply's first line, bold, by itself:  `**Agent <full name> came back with:**`.
- Epic-page work (filling, updating, marking a phase done) goes to a background agent,
  as if Owen had typed `/bg "epic-page" ...`:  the panel stays free.

Tooling requests (epic `epic-workflow`, Owen, 2026-10-11):  when Owen asks for a change to how he WORKS,
not to what this session builds, SEND it, don't do it.
- `/send` ([its folder](../spell-epic/skills/send/)) writes it into the tooling home's epic (`epic home`),
  and wakes that epic's session.
- Reply one line, "sent to `<home>` as r3", and carry on.
- How he works:
  - the epic page, its comments and marks, the Review tab, details pages, every skill and hook
  - windows, worktrees, the page server, the repo's `spell` commands / `epic`
  - e.g. "Comment mechanism doesn't look right", a screenshot of the Review tab,
    "fix this in the plan doc" about how the page draws
- NOT this session's own epic's content ("fix P4's file list"):  that's its job.
  Unsure:  ask in the modal.
- The tooling home's own session (`🚧 <home>`) does tooling work itself.

When a summary closes out the session's work, end it with a line of its own, `*You can close this tab*`,
if nothing is left for THIS session.
- Closing out:
  merged, worktree gone, a worktree left with `ExitWorktree`, `/isolate done`, a `/bedtime` night reviewed ...
- Nothing left:
  - no uncommitted or unmerged work
  - no background task or agent still running
  - no question waiting on Owen
- Open items may remain only if they're recorded elsewhere (the epic page, [the code-debt log](agents/CODE-DEBT.md) ...)
  and need no context from this session.
- Otherwise leave the line out, and say what's keeping the tab open.
- With the closing line, ALSO ask (AskUserQuestion) whether to run `/isolate done`
  when this session's worktree is still there (Owen, 2026-10-07).
  - Or the worktrees it made and left:  `/isolate done`'s step 0 cleans those up.
  - Options:  "Run `/isolate done`" (recommended) and "Leave it".
- Leaving a worktree counts (`ExitWorktree`, keep or remove;  Owen, 2026-10-17, epic `epic-eject` r1):
  - the reply that says the session left ends with the line, on the same checks
  - kept, the worktree is still on disk:  ask the question above too
