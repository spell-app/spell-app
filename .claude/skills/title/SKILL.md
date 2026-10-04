---
name: title
description: Show or change THIS session's title -- the name in the VS Code Claude panel's tab and session list -- which Claude can't set with `/rename` itself.  Use for `/title` (shows it, then offers names), `/title <title>`, or when Owen says "name this session", "call this session <x>", "rename this session".
argument-hint: "[<title>]"
---

# /title

The command:  `spell dev session title [<title>]` (`packages/cli/src/commands/sessionCommand.ts`).  Other skills
that rename a session (`/isolate`, `/park`, `/unpark`, `/session`) run the same command.

## 1. With a title:  `/title <title>`

- `spell dev session title <title>`.  It checks first:  this session already has `<title>` (or has it queued):
  nothing to do;  else it queues `<title>`.
- Reply in one line:  "titled `<title>` (was "<old>");  shows on your next message".

## 2. Without:  `/title`

- `spell dev session title`:  the current title (`*` = set by hand, else Claude's own or the first prompt), and any
  title queued.
- Offer 3 short titles (2-4 words, the work's name, e.g. `session tools`) in the AskUserQuestion modal, the current
  one described in the question;  "Other" takes a typed title.  Then step 1 with the pick.

## How it lands

- Claude can't run `/rename`:  the command writes `~/.claude/session-titles/<session id>`, and the
  `UserPromptSubmit` hook `~/.claude/hooks/session-title.mjs` returns it as `sessionTitle` on Owen's NEXT message,
  then deletes the file.  Say so.
- NOTE:  undocumented hook output, found in CLI 2.1.287.  If a later message shows the title didn't change:  say
  so, and fall back to "rename it from the tab's context menu" (VS Code) or `/rename <title>` (terminal).
