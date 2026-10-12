Claude Code loads the cross-model `AGENTS.md` (and WWOD), then these Claude-only rules.

@AGENTS.md

@agents/wwod/WWOD.md

In your own words, without jargon, narrate each step in the order it actually happens, and bold inline anything in the current PR that has drifted from my most recently stated intent.

When a question needs a picture to decide, or more than the AskUserQuestion modal holds (4 options per question, 4
questions), use `/details` (`.claude/skills/details/`):  a page in VS Code's right side bar that Owen answers on.
Naming any docs page in a reply:  `spell dev docs link <page> --hash <id> --show`, and paste its side bar link +
`• 🌐` (browser) link:  `Title • 🌐`.

Delegated work (epic `skillz`, Owen, 2026-10-07):  every agent you start is NAMED and LISTED, as `/bg` does it
(`.claude/skills/bg/SKILL.md`, "Names", "When its notice arrives", "Redirects").
- `epic agents add <name> "<task>"` before it starts (the full name it prints, `<epic>-<name>`, goes first in
  the `Agent` call's `description`), `epic agents done <name>` when it's back;  `epic agents` says what's
  running.  While any runs, an `epic agents wait` waits in the background for Owen's redirect notes.
- Relaying what it found:  your reply's first line, bold, by itself:  `**Agent <full name> came back with:**`.
- Plan-doc work (filling, updating, marking a phase done) goes to a background agent, as if Owen had typed `/bg
  "plan-doc" ...`:  the panel stays free.

Tooling requests (epic `epic-workflow`, Owen, 2026-10-11):  when Owen asks for a change to how he WORKS, not to what
this session builds, SEND it, don't do it:  `/send` (`.claude/skills/send/`) writes it into the tooling home's epic
(`epic home`) and wakes that epic's session;  reply one line, "sent to `<home>` as r3", and carry on.
- How he works:  the plan doc page, its comments and marks, the Review tab, details pages, every skill and hook,
  windows, worktrees, the page server, `spell dev` / `epic`.  "Comment mechanism doesn't look right", a
  screenshot of the Review tab, "fix this in the plan doc" about how the doc draws.
- NOT this session's own epic's content ("fix P4's file list"):  that's its job.  Unsure:  ask in the modal.
- The tooling home's own session (`🚧 <home>`) does tooling work itself.

When a summary closes out the session's work (merged, worktree gone, `/isolate done`, a `/bedtime` night reviewed ...), end it with a line of its own, `*You can close this tab*`, if nothing is left for THIS session:  no uncommitted or unmerged work, no background task or agent still running, no question waiting on Owen.  Open items may remain only if they're recorded elsewhere (plan doc, `agents/CODE-DEBT.md` ...) and need no context from this session.  Otherwise leave the line out, and say what's keeping the tab open.
- With the closing line, ALSO ask (AskUserQuestion) whether to run `/isolate done` when this session's worktree is
  still there (or the worktrees it made and left:  `/isolate done`'s step 0 cleans those up):  options "Run
  `/isolate done`" (recommended) and "Leave it" (Owen, 2026-10-07).
