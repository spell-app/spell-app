---
name: send
description: Send a request to another epic instead of doing it here -- Owen's words verbatim, the screenshots he pasted, what this session was looking at -- and wake that epic's session, or open its window.  Use for `/send [<epic>] <text>`, and BY ITSELF whenever Owen asks this session to change how he WORKS (dev tooling:  the epic page, comments, the Review tab, details pages, skills, hooks, windows, worktrees, `spell dev` / `epic`) rather than this session's own work -- the root `CLAUDE.md`'s "Tooling requests".  E.g. "fix this in the plan doc", "comment mechanism doesn't look right", a screenshot of the Review tab.
argument-hint: "[<epic>] <text>"
---

# /send

Owen says what he wants where he is;  it goes to the epic that owns it, and this session carries on with its own work
(epic `epic-workflow`, Owen, 2026-10-11).
- The request is written FIRST, into the epic's shared folder:  nothing is lost if that epic's session is closed.
- The epic's session turns it into a phase:  [the epic skill](.claude/skills/epic/SKILL.md), "12. Request".
- The command:  `epic send` ([Requests.ts](packages/epics/src/command/Requests.ts)).

## When

- `/send [<epic>] <text>`:  always.
- By itself (no `/send`):  Owen asks for a change to DEV TOOLING, how he works, not what this session builds.
  - Dev tooling:  the epic page and its comments, marks and buttons;  the Review tab;  details pages;
    every skill and hook;  windows, worktrees, the page server;  `spell dev` and `epic`.
  - Not:  this session's OWN epic's content.
    "Fix P4's file list in the plan doc" in `🚧 python` is python's job;
    "the plan doc's comment box covers the text" is tooling.
  - Unsure which:  AskUserQuestion, "Send to `<home>`, or do it here?", saying what you took it to mean.
- NOT in the tooling home's own session (titled `🚧 <home>`):  tooling work is its own.

## Steps

1. Which epic:
   - the first word after `/send`, when `epics/<word>/<word>.plan.html` exists
   - else the tooling home:  `epic home` prints it
2. Owen's words, VERBATIM, into a scratchpad file (quotes and all survive a file, not a shell string):
   - `/send`:  the text after it (and the epic's name, if given)
   - by itself:  his whole message about it
3. Screenshots:  count the images he pasted WITH this request (his message, or the ones just before it about the
   same thing):  `--images <count>`.
   - `send` takes the newest ones from this session's transcript.
4. Context:  one or two lines the receiver needs to find it COLD.
   - What this session was looking at:  the page and item id (`epics/python/python.plan.html#p4`), the file and line,
     the command that misbehaved.
   - And what this session works on (its epic or worktree).
5. Send, from the repo:

   ```sh
   epic send <epic> --file <words.md> --images <count> --context "<context>"
   ```

   - Until `epic` is on `main`:  `node <a checkout that has it>/packages/cli/bin/epic.mjs send ...`.
6. Wake the receiver, as `send` printed:
   - `tell:  <name>` (its session is running):  `SendMessage` to `<name>`:
     "New request `<rN>` for epic `<epic>`, from `<this session's title>`:  <his first line>.
     Run `/epic request <epic> <rN>`'s steps (`epics/<epic>/requests/<rN>/request.md`)."
   - `this session is <epic>'s own`:  do it here, as [the epic skill](.claude/skills/epic/SKILL.md), "12. Request".
   - `no session of <epic> is running`:  run the `epic window launch ...` line it printed.
     It opens the epic's window with `/epic request <epic> <rN>` typed in:  Owen presses Enter there.
   - The epic page's own Send and Do Now wake an epic the same way, from the page server (epic `epic-workflow` P16).
7. Reply ONE line, then go back to this session's own work:
   - "sent to `<epic>` as `<rN>`";  plus "its window is open:  press Enter on `/epic request ...` there", when it was.
   - NEVER do the request here as well, nor edit the tooling's files because of it.

## Never

- Stage or commit the request folder:  `epics/` is shared content, committed by the turn-end hook.
- Paraphrase Owen's words in the request:  the receiver needs them as he said them.
