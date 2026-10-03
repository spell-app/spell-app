---
name: worktrees
description: List the Claude Code sessions running on this machine and which git worktree (and branch, and folder) each one is in, plus the worktrees no session is using. Use for `/worktrees`, "what worktree is X in", "which sessions are running where", "what agents are running and where", or when Owen can't find a session.
---

# /worktrees

(Moved into the repo from `~/.claude/skills/worktrees` on 2026-10-03, its python ported to `spell dev worktree list`.)

1. Run `spell dev worktree list` (`--json` for the data).
   - One row per LIVE session (`~/.claude/sessions/<pid>.json`, dead pids skipped):  name (what `ListAgents` and
     `SendMessage` call it), id (first 8 of the session id, what `claude --resume` takes), status, where it runs
     (terminal / VS Code / Desktop), worktree (`main checkout` or `worktree <name>`), branch, folder inside the checkout.
   - The folder is the session's LATEST `cwd` (from its transcript), not where it started.
   - `<- this` marks the session that ran it.
   - Then, per repo, the worktrees with no session in them.
2. Reply with the table as a markdown table (drop empty columns), then one line per thing worth acting on:  a
   session `waiting` for input, two sessions in the SAME worktree (their edits collide), a session whose branch
   isn't the one its worktree is named for.  Nothing else.
3. If a session the user asks about isn't listed, it isn't running:  `spell dev session list <id or words>` finds
   it;  say `cd <its folder> && claude --resume <id>`.
