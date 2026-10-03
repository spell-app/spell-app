---
name: spell-docs
description: Open the spell docs (the docs index, `packages/docs/index.html`, or one page of it) in VS Code's doc preview -- the "Spell Docs" view in the right side bar, served live by the page server.  Use for `/spell-docs [page]` (e.g. `/spell-docs`, `/spell-docs solid/solid-2`), or when Owen says "show me the docs" / "open the docs in VS Code".
argument-hint: "[page]"
---

# /spell-docs

1. From the checkout this session is in (a worktree shows ITS docs):  `yarn docs:open $ARGUMENTS --vs`.
   - No argument:  the docs index, `packages/docs/index.html` (the page server's `/`).
   - `<page>` is relative to `packages/docs`;  `.html` and a folder's own page may be left off (`solid/solid-2`,
     `server`).
   - It starts the page server first (live reload), then asks THIS session's window, through the spell extension,
     to show the page in the doc preview:  the "Spell Docs" view, in the right (secondary) side bar.  ONE page at a
     time, shared with `yarn plan-doc open`.  Setting `spell.docPreview.location` `beside`:  Simple Browser beside
     the editor instead.
   - Its title bar:  docs index, reload, open in the browser.
   - Mid-move to a worktree's window (`/isolate`, `/epic`):  shown there once the session has moved.
2. `no page <page>`:  `ls packages/docs` (and the folder it named), offer the closest in AskUserQuestion, run again.
3. Nothing shows up (it fell back to the `vscode://` link, or the window has no bridge):  `yarn vscode`, reload
   the window, try again.  Meanwhile `yarn docs:open [page]` shows it in Chrome.
4. Reply in one line, the page linked on the page server (`yarn server url <ABSOLUTE path>`).
