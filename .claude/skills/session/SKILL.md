---
name: session
description: Find and reopen a saved Claude Code session in the VS Code Claude panel, or title THIS session -- things the panel has no `/resume` or `/rename` for.  Use for `/session` (asks which session), `/session <words or id>` (find and open), `/session name [title]` (title this one, as `/title` does), or when Owen says "resume / reopen / go back to the <x> session".
argument-hint: "[<words> | <id> | name [<title>]]"
---

# /session

The command:  `spell dev session <verb>`, run from the session's folder (it lists THAT repo's sessions:  main
checkout, worktrees and package folders together).  `spell help dev` lists the verbs;  the logic is
`packages/cli/src/dev/sessions.ts`.  (Moved into the repo from `~/.claude/skills/session` on 2026-10-03, its
python ported to `spell dev session`;  naming split out as `/title` on 2026-10-04.)

## 1. Arguments

- `$ARGUMENTS` empty:  ask which session (step 2).
- `name [<title>]`:  title this session (step 4).
- anything else:  words or an id prefix -- find and open (step 3).

## 2. Ask which session

- `spell dev session list --limit 12`:  newest first, this session left out.  Columns:  id (first 8), last active,
  `saved` / `running (<status>, <where>)`, title (`*` = named by hand, else Claude's own title or the first
  prompt), latest folder.
- Ask in the AskUserQuestion modal:  the 4 most likely as options (label:  the title, shortened;  description:
  id, last active, running or not, folder).  "Other" takes words to search with -- then step 3 with those words.
- Web / cloud sessions never appear:  it lists local transcripts only.

## 3. Find and open

- `spell dev session list <words>` (`--all` if nothing matches here:  every project).
  - One match:  open it.
  - Several:  the modal, as step 2.
  - None:  say so in one line.
- `spell dev session open <id prefix>`.  It opens the session in the Claude panel of the right VS Code window:
  - a RUNNING session (in VS Code):  revealed in the window it runs in -- say which, since it's not this one.
  - running in a terminal or Desktop:  refused;  say where it runs (`/worktrees` shows it).
  - otherwise:  a new tab in THIS window.
- Reply in one line:  what opened, where.
- A session can't swap itself for another:  the old conversation opens BESIDE this one, which keeps running.

## 4. Name this session

- `/session name [<title>]` is `/title [<title>]`:  follow `.claude/skills/title/SKILL.md` (a skill can't invoke
  another).
