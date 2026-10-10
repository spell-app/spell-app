---
name: bg
description: Run a task in the BACKGROUND, so the Claude panel is free again in seconds -- one named helper agent (a fork of this session) does it, with a hard agent budget, and its report comes back when it's done.  Use for `/bg ["name"] [n] <task>` (`n`:  the most agents it may use in all, default 1), `/bg ?` (what's running), `/bg stop <name>`, or when Owen says "do this in the background", "run X in the background", "don't lock up the panel with this".
argument-hint: '["name"] [n] <task> | ? | stop <name>'
---

# /bg

Hand a task to a helper agent that works in the background (epic `skillz`), so the panel is free again at once.
- Owen keeps talking to this session, or sends more `/bg` tasks, while it works.
- When it's done, its notice wakes this session, which reports.

- Every agent this session starts, `/bg` or not, is NAMED and LISTED the same way.
  - That's the root `CLAUDE.md`'s rule, "Delegated work".
  - This skill is that rule's full text.
- The list:  `spell dev agents` ([agents.ts](packages/docs/tools/agents.ts)).
  - In an epic, it's `epics/<epic>/agents.json`;  else `.spell-agents.json` at the checkout's root.
  - Git-ignored, and gone when empty.

## Forms

```
/bg ["name"] [n] <task>     start one:  /bg "docstrings" 2 add a docstring to every export in util/string.ts
/bg ?                       what's running:  name, status, age, task
/bg stop <name>             stop one
```

- `"name"`:  a quoted FIRST word:  its name, before the prefix.
  - None:  make one up from the task, 1-3 words, kebab-case (`string-docstrings`).
- `n`:  a whole number 1-5 next (after the name, if any).
  - It's the most agents the task may use IN ALL, the helper itself included.
  - Default 1:  the helper alone.
  - A HARD cap, unlike the root rule's "up to 5, unasked".
- The rest:  the task, word for word.
  - No task:  ask for one (one line), nothing started.

## Names

- The REAL name is the list's prefix + the name.
  - The prefix:  the epic's name, else the worktree's, else `main`.
  - `/bg "aaa" ...` in epic `skillz` is `skillz-aaa`.
  - `spell dev agents add` adds the prefix, and prints the full name.
- Claude Code's `Agent` call has no name field:  the name goes FIRST in its `description`.
  - E.g. `skillz-aaa: docstrings in string.ts`.
- Taken (`add` exits 1, "running already"):  add a number, `aaa-2`.

## Start:  `/bg ["name"] [n] <task>`

Quick:  the point is a free panel.
No exploring, no reading the files the task names.

1. Parse it (Forms).
2. Same files?  `spell dev agents list --json`.
   - Does a running agent's task touch the files or folders this one will?
     The tasks name them, or plainly mean them ("the plan doc", "the /epic skill").
   - Yes:  list this one as blocked, and DON'T start it.

     ```sh
     spell dev agents add <name> "<task, a sentence or less>" --status "blocked on <its full name>"
     ```

     - Reply one line:  `waiting:  <full name> starts when <other> is done (same files:  <which>)`.
     - End the turn.
   - Plan-doc work always overlaps other plan-doc work:  one at a time.
3. `spell dev agents add <name> "<task, a sentence or less>"`:  prints the full name.
4. ONE `Agent` call, with:
   - `subagent_type: "fork"`:  a copy of this session.
     It sees the conversation, so "fix the thing we just talked about" works.
   - `run_in_background: true`
   - `description: "<full name>: <task gist>"`
   - `prompt`:  the template below
   - `Agent type 'fork' not found`:  a session without forks (the VS Code panel's, 2026-10-07, I3 of `skillz`).
     - Make the same call with `subagent_type: "general-purpose"`.
     - It sees NOTHING of the conversation.
     - So fill the template's Context line with what the task leans on
       ("the thing we just talked about":  which thing, which files).
5. `spell dev agents set <name> --task-id <the agent's id>`, the id from the `Agent` result.
   - It's what `/bg stop` stops, and where a redirect goes.
6. No redirect waiter running in this session yet ("Redirects" below):  start one.
7. Reply ONE line, then END THE TURN:  `started:  <full name> (<n> agent|agents)`.

### The helper's prompt

Fill in the `<...>`;  keep the rest as it is.

```
You are agent `<full name>`, working in the BACKGROUND for this session:  Owen isn't watching you.

The task, word for word:
<task>

- Context:  <what the conversation said that the task leans on;  "none" when the task stands alone>
- Checkout:  <the session's checkout root>  (<"worktree <name>, branch <branch>" | "the main checkout">)
- Epic:  <name>, plan doc <epics/<name>/<name>.plan.html>   (or:  no epic)
- Budget:  <n> agents IN ALL, you included:  a HARD cap.  You may start at most <n-1> helpers of your own:  ordinary
  agents (`general-purpose`, `Explore` ...), never forks.  Each one:  named `<full name>-<x>`, listed first with
  `spell dev agents add <full name>-<x> "<its task>"`, and `spell dev agents done <full name>-<x>` when it's back.
  <n> is 1:  start none.
- House rules:  WWOD (`agents/wwod/WWOD.md`) and the package's `AGENTS.md` for code;  stage your changes, NEVER
  commit unless the task says to;  shared content (`epics/`, `guides/`, `agents/` ...) edited at its REAL path,
  `/Users/owen/www/spell-app/spell-app-dev/<path>`, never git-added;  in a worktree, plain separate shell commands
  (no `$(...)`, no `&&` chains, no `cd`).
- You can't ask Owen anything:  no AskUserQuestion.  A choice he might make differently:  take the default the code
  and plan best support, and record it:  in an epic, `spell dev plan-doc add <epic> judgement "<the call>" --details
  "<p>chose X over Y because Z</p>"`;  else in your report.  A choice you can't make safely (it would delete or
  overwrite work, publish anything, or change what the task means):  stop there, and make it your report's question.
- Other running agents:  `spell dev agents list`.  Don't edit files another one's task names.
- Your LAST message is your report, short:  what changed (files), where to look, checks run with numbers, judgement
  calls (ids), and anything that needs Owen, a question last.  Don't run `spell dev agents done` for yourself:  the
  session does.
```

## When its notice arrives

The helper's report reaches this session as a notice, between whatever else it's doing.
1. `spell dev agents done <name>`.
2. Reply, the FIRST line in bold, by itself:  `**Agent <full name> came back with:**`.
   - Then the report, short, in Owen's words:  what changed, where to look, what needs him.
   - Links as the root rules say:
     - a page:  side bar + browser, `spell dev docs link ... --show`
     - a plan doc:  `--review`
     - files:  `[file.ts](path)`
3. A question in its report that only Owen can answer:  AskUserQuestion, with the epic and what it's for.
4. An agent `blocked on` this one:  `spell dev agents set <its name> --status active`.
   - Then start it (Start, steps 4-6), in the same turn.

## Redirects

In an epic, the plan doc shows its running agents at the top ("Agents running"), each with a note box.
- Owen types there to STEER an agent mid-task
  (P3 of epic `skillz`;  [agentRoutes.ts](packages/docs/tools/agentRoutes.ts)).
- The note waits in the list, untold, until this session passes it on.
- The waiter:  `spell dev agents wait`, with Bash `run_in_background: true`.
  - ONE per session, while any agent this session started runs.
  - Its exit wakes the session, by its code:
  - 0:  it printed the untold notes, `skillz-aaa:  <note>` each.  Per note:
    - `SendMessage` to that agent:  "Owen redirects you, from the plan doc:  <note>".
      Its `to` is the agent's `taskId`, from `spell dev agents list --json`.
    - Then `spell dev agents told <name>`:  the page shows it told.
    - One line in the reply per note:  `redirected:  <name>`.
    - Start the waiter again.
  - 3:  nothing runs any more:  don't start it again
  - 2:  timed out (an hour):  start it again while agents run
- The agent isn't this session's (another session's, same epic):  leave its notes untold.
  That session's waiter takes them.

## `/bg ?`

`spell dev agents list --json`, shown as a short table:  name, status, age, task.  Nothing running:  one line.
- The list is the record, not this session's memory:  it survives a compacted session, and lists the agents other
  sessions in this epic started too.

## `/bg stop <name>`

1. `spell dev agents list --json`:  its `taskId`.  Not there:  say so, and show `/bg ?`'s table.
2. `TaskStop` with that id (not this session's agent:  say whose it is, and stop nothing).
3. `spell dev agents done <name>`.  Its staged changes stay:  say which files, if any.
4. One line:  `stopped:  <full name>`.
