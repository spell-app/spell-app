---
name: airplane
description: Get the laptop ready for Owen to work on the epics and docs with NO Claude (on a plane, or bad wifi) -- check and fix what pages need offline, turn airplane mode on, say how it works;  `/airplane land` afterwards gathers everything he left (marks, notes, new items, Do Now requests) across every epic and page, and works through it in the background.  Use for `/airplane`, `/airplane land`, `/airplane status`, or when Owen says "I'm going offline", "I'm getting on a plane", "I'm back, go through what I left".
argument-hint: '[land | status]'
---

# /airplane

Owen works on the pages ALONE:  he reads plan docs and guides in VS Code's right side bar, marks items, writes notes,
adds todos and questions.  Every page saves to this laptop's page server, and nothing needs the internet or Claude.
`/airplane` gets the laptop ready before;  `/airplane land` works through what he left, after (epic `airplane`).

- The repo actions are `spell dev airplane ...` (`packages/docs/tools/airplane.ts`);  this skill holds the dialog.
- The switch:  `~/.spell/airplane.json` (`AirplaneMode`, `packages/server/src/page/`).  While it's on, the page server
  tells every page, and the review controls say "queued for when you land" instead of "start `/epic review`".
- Runs from the MAIN checkout:  its page server is the one the side bar uses.  In a worktree:  say so in one line,
  and stop.

## `/airplane`:  before the flight

1. `spell dev airplane check --fix`:  fixes what it can on the spot, then lists each check (`ok`, `fixed`, `fail`,
   `note`).
   - `page server`:  `--fix` starts it, or restarts one older than its code
   - `offline pages`:  `--fix` points every page's highlight.js at the repo's copy;  anything else remote it
     names:  fix the page by hand, or tell Owen which pages will look plain
   - `extension`:  too old:  `spell dev vscode` (from `main`, never a branch behind it:  it installs into VS Code),
     then ask Owen to reload the window (Developer:  Reload Window)
   - `waiting`:  marks already in the inboxes from before:  say which epics;  they'll be gathered at landing too
2. Running sessions:  `spell dev worktree list`.  A session mid-work will stall offline:  list them for Owen, one
   line each, and ask (modal, multi-select) which to `/park` first.  Nothing running:  skip.
3. `spell dev airplane on`.
4. Reply, short, for Owen about to close the lid:
   - what was fixed, and anything still failing, in bold
   - how it works on the plane, as bullets:
     - open a plan doc:  the Review tab's list button, "Review:  Open Epic...";  any page:  "Review:  Docs Index"
     - mark items as usual;  Send isn't needed:  every mark is taken at landing, sent or not
     - "+" on a plan doc's header (or its Todos / Questions):  a new todo or question;  the bubble on a phase or
       the summary:  a note
     - any other page:  the bubble on a section's title, or the header's Note pill
     - Do Now still works:  it waits, dashed, for landing
     - the page server stopped (laptop asleep, restarted):  the Review tab's "Restart Page Server" button
     - turn Wi-Fi fully off while reading:  a "pay first" wifi page makes requests hang
   - last line:  "When you're back:  `/airplane land`."

## `/airplane land`:  after

Owen is back online.  Gather everything, work through it in the background, then hand him the review.

1. `spell dev airplane off`.
2. `spell dev airplane inbox --json`:  everything waiting, by place (each epic's marks sent or not, drafts, Do Now
   requests, new items;  page notes;  details answers;  goals thoughts).  Nothing:  say so in one line, and stop.
3. Reply at once, short:  the counts by place, and that the work runs in the background now.
4. Per epic, in the session itself (quick):  `spell dev plan-doc inbox <name> apply --all`:  approvals, picks, todos
   and new items land in the doc, sent or not (Owen's decision Q3 of `airplane`).
5. The rest goes to background agents, named and listed (root `CLAUDE.md`, "Delegated work"), up to 5 at once:
   - each Do Now, revisit and phase note:  as `/epic review` answers one ("7.3", step 2):  the status card first,
     the answer INTO the item, `status ... done`, `inbox done | clear`
   - each page note:  read the page and the note, answer under it (`spell dev notes answer <page> <id> --file`);
     a note asking for work in an epic:  `plan-doc add <epic> todo` too, linked from the answer
   - details answers and goals thoughts:  as `/details` and `/goals-update` take them
   - nothing is decided for Owen:  an answer that needs him ends in option cards, and the item stays red
6. Drafts (text he typed and never submitted):  never acted on.  List them for Owen as a question each, in the reply
   (or a details page when there are more than 4).
7. When every agent is back:  the summary (what landed where, in words, ids after;  what needs Owen, in bold),
   then `/epic review <name>` on the epic with the most waiting, as that skill's "7.2 Start".

## `/airplane status`

`spell dev airplane status`, and `spell dev airplane inbox` when it's on:  one line each.
