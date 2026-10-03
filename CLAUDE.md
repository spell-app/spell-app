All Claude Code rules come from cross-model `AGENTS.md` file.

@AGENTS.md


Maintain `PAPERCUTS.md` in the repo root, a log of anything that slowed down development. When you lose time to one mid-session, append date · symptom · fix · project. Check this file first when tooling fails mysteriously.

In your own words, without jargon, narrate each step in the order it actually happens, and bold inline anything in the current PR that has drifted from my most recently stated intent.

If you see something that appears to be a bug but you are not sure, add to `SUSPECTED-BUGS.md` in the repo root, in the appropriate section under its package.

When a summary closes out the session's work (merged, worktree gone, `/isolate done`, `/wakeup` finished ...), end it with a line of its own, `*You can close this tab*`, if nothing is left for THIS session:  no uncommitted or unmerged work, no background task or agent still running, no question waiting on Owen.  Open items may remain only if they're recorded elsewhere (plan doc, `CODE-DEBT.md` ...) and need no context from this session.  Otherwise leave the line out, and say what's keeping the tab open.
