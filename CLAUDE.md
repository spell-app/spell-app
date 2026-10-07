Claude Code loads the cross-model `AGENTS.md` (and WWOD), then these Claude-only rules.

@AGENTS.md

@agents/wwod/WWOD.md

In your own words, without jargon, narrate each step in the order it actually happens, and bold inline anything in the current PR that has drifted from my most recently stated intent.

When a question needs a picture to decide, or more than the AskUserQuestion modal holds (4 options per question, 4
questions), use `/details` (`.claude/skills/details/`):  a page in VS Code's right side bar that Owen answers on.
Naming any docs page in a reply:  `spell dev docs link <page> --hash <id> --show`, and paste its side bar link +
`(_browser_)` link.

When a summary closes out the session's work (merged, worktree gone, `/isolate done`, a `/bedtime` night reviewed ...), end it with a line of its own, `*You can close this tab*`, if nothing is left for THIS session:  no uncommitted or unmerged work, no background task or agent still running, no question waiting on Owen.  Open items may remain only if they're recorded elsewhere (plan doc, `agents/CODE-DEBT.md` ...) and need no context from this session.  Otherwise leave the line out, and say what's keeping the tab open.
- With the closing line, ALSO ask (AskUserQuestion) whether to run `/isolate done` when this session's worktree is
  still there (or the worktrees it made and left:  `/isolate done`'s step 0 cleans those up):  options "Run
  `/isolate done`" (recommended) and "Leave it" (Owen, 2026-10-07).
