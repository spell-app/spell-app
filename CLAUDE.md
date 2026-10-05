All Claude Code rules come from cross-model `AGENTS.md` file.

@AGENTS.md

@agents/wwod/WWOD.md


Shared content (`packages/docs/content`, `goals`, `agents`) lives in ONE repo beside this one, `spell-app-dev`, linked into every checkout (AGENTS.md "Shared content"):  edit and write those files at their REAL path, `/Users/owen/www/spell-app/spell-app-dev/<path>` (a worktree session's Edit / Write refuses a path through the links);  read and run tools through the links as usual;  never commit them (every turn auto-commits `spell-app-dev`).

Maintain `agents/PAPERCUTS.md` (shared), a log of anything that slowed down development. When you lose time to one mid-session, append date · symptom · fix · project. Check this file first when tooling fails mysteriously.

In your own words, without jargon, narrate each step in the order it actually happens, and bold inline anything in the current PR that has drifted from my most recently stated intent.

When a question needs a picture to decide, or more than the AskUserQuestion modal holds (4 options per question, 4
questions), use `/details` (`.claude/skills/details/`):  a page in VS Code's right side bar that Owen answers on.
Naming any docs page in a reply:  `yarn docs:link <page> --hash <id> --show`, and paste its side bar link +
`(_browser_)` link.

If you see something that appears to be a bug but you are not sure, add to `agents/SUSPECTED-BUGS.md` (shared), in the appropriate section under its package.

When a summary closes out the session's work (merged, worktree gone, `/isolate done`, a `/bedtime` night reviewed ...), end it with a line of its own, `*You can close this tab*`, if nothing is left for THIS session:  no uncommitted or unmerged work, no background task or agent still running, no question waiting on Owen.  Open items may remain only if they're recorded elsewhere (plan doc, `agents/CODE-DEBT.md` ...) and need no context from this session.  Otherwise leave the line out, and say what's keeping the tab open.
