---
name: spell-serve
description: Start the spell web servers of this checkout that aren't running -- the page server (docs, epics, goals, the app's API), the editor (vite, the spell app) and Spell UI's docs (static pages at /components/ui/) -- and say which port each is on.  Use for `/spell-serve`, or when Owen says "start the servers", "is the editor running?", "what port is the page server on?".
---

# /spell-serve

1. From the checkout this session is in (a worktree has its OWN servers):
   `spell server start all` (the kit's `spell`;  spell-app's `scripts/serve.mjs` until epic `repo-split` P13).
   - It starts the page server if it isn't running (`spell server start`).
     The page server starts the editor once it listens ([EditorServer.ts](packages/spaces/src/server/node/routes/EditorServer.ts)).
   - It waits for the editor:  up to 90s, since vite may be building its dependency cache.
   - Then it checks Spell UI's docs, by asking for their bundle, `/components/ui/_assets/site.js`.
     - They're static pages the page server serves at `/components/ui/`:
       their pages (`packages/ui/docs/`), with this branch's built `_assets/` (from `packages/ui/site/`) laid over them.
     - The bundle is NOT committed.
       The page server builds it (and the brand pages' bundle) when it starts, if stale,
       and the request waits for that.
     - Failed:  see `.spell-server.log`, and `spell bundle ui-site`.
   - It prints one row per server:  name, port, URL, what it serves, and `started` / `running` / why not.
     Exit code 1 if any didn't come up.
2. Reply with the rows as a small table:  server, port, URL (linked).
   For a failed row:  the last lines of the log it names (`.spell-server.editor.log`, `.spell-server.log`),
   and what to try:
   - the editor didn't answer, page server `running`:  it may be from before the editor was tied to it.
     `spell server stop`, then `spell server start all` again.
   - `yarn: command not found`, or nothing installed:  `yarn install` first
3. Stopping them all:  `spell server stop all` (the page server, and the editor with it, even one left running).
