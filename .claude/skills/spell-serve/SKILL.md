---
name: spell-serve
description: Start the spell web servers of this checkout that aren't running -- the page server (docs, epics, goals, the app's API), the editor (vite, the spell app) and Spell UI's docs (static pages at /ui/) -- and say which port each is on.  Use for `/spell-serve`, or when Owen says "start the servers", "is the editor running?", "what port is the page server on?".
---

# /spell-serve

1. From the checkout this session is in (a worktree has its OWN servers):  `yarn serve` (`scripts/serve.mjs`).
   - starts the page server if it isn't running (`yarn server ensure`);  the page server starts the editor once it
     listens (`packages/app/src/server/EditorServer.ts`)
   - waits for the editor (up to 90s:  vite may be building its dependency cache), then checks Spell UI's docs:
     static pages the page server serves at `/ui/` (`packages/ui/site/`), by asking for their bundle,
     `/ui/_assets/site.js` (missing:  `yarn site:build` in `packages/ui`)
   - prints one row per server:  name, port, URL, what it serves, and `started` / `running` / why not;  exit code 1
     if any didn't come up
2. Reply with the rows as a small table:  server, port, URL (linked).  For a failed row, the last lines of the log it
   names (`.spell-server.editor.log`, `.spell-server.log`), and what to try:
   - the editor didn't answer, page server `running`:  it may be from before the editor was tied to it --
     `yarn server stop`, then `yarn serve` again
   - `yarn: command not found`, or nothing installed:  `yarn install` first
3. Stopping them all:  `yarn server stop` (the editor is the page server's child).
