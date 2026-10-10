---
name: airplane
description: Get the laptop ready for Owen to work on the epics and docs with NO Claude (on a plane, or bad wifi) -- check and fix what pages need offline, turn airplane mode on, say how it works;  `/airplane land` afterwards gathers everything he left (marks, notes, new items, Do Now requests, new epics) across every epic and page, works through it in the background, and asks which new epics to start.  Use for `/airplane`, `/airplane land`, `/airplane status`, or when Owen says "I'm going offline", "I'm getting on a plane", "I'm back, go through what I left".
argument-hint: '[land | status]'
---

# /airplane

Airplane mode:  Owen works on the pages ALONE, with no internet and no Claude (epic `airplane`).
- He reads plan docs and guides in VS Code's right side bar, marks items, writes notes, adds todos and questions.
- Every page saves to this laptop's page server.
- `/airplane` gets the laptop ready before;  `/airplane land` works through what he left, after.

- The repo actions are `spell dev airplane ...` (`packages/docs/tools/airplane.ts`);  this skill holds the dialog.
- The switch:  `~/.spell/airplane.json` (`AirplaneMode`, `packages/server/src/page/`).  While it's on, the page server
  tells every page, and the review controls say "queued for when you land" instead of "start `/epic review`".
- Runs from the MAIN checkout:  its page server is the one the side bar uses.
  In a worktree:  say so in one line, and stop.

## `/airplane`:  before the flight

1. `spell dev airplane check --fix`:
   fixes what it can on the spot, then lists each check (`ok`, `fixed`, `fail`, `note`).
   - `page server`:  `--fix` starts it, or restarts one older than its code
   - `offline pages`:  `--fix` points every page's highlight.js at the repo's copy;
     anything else remote it names:  fix the page by hand, or tell Owen which pages will look plain
   - `extension`:  too old:  `spell dev vscode` (from `main`, never a branch behind it:  it installs into VS Code),
     then ask Owen to reload the window (Developer:  Reload Window)
   - `waiting`:  marks already in the inboxes from before:  say which epics;  they'll be gathered at landing too
2. Running sessions:  `spell dev worktree list`.
   - A session mid-work will stall offline:
     list them for Owen, one line each, and ask (modal, multi-select) which to `/park` first.
   - Nothing running:  skip.
3. `spell dev airplane on`.
4. Reply, short, for Owen about to close the lid:
   - what was fixed, and anything still failing, in bold
   - how it works on the plane, as bullets:
     - open a plan doc:  the Review tab's list button, "Review:  Open Epic...";  any page:  "Review:  Docs Index"
     - mark items as usual;  Send isn't needed:  every mark is taken at landing, sent or not
     - "+" on a plan doc's header (or its Todos / Questions):  a new todo or question;
       the bubble on a phase or the summary:  a note
     - any page, plan docs too:  the bullhorn beside a block (a section, table, aside, code, an item, a phase's
       field ...), or select text and press ⌘ I (or the bullhorn floating beside it):  a comment, saved at once,
       "Saved 14:02 · waiting for Claude" on its card
     - a new epic:  the Epics page's New epic pill (its seedling):  a title and what it's for;  it's written down
       as a future epic at once, and the landing asks whether to start it
     - Do Now still works:  it waits, dashed, for landing
     - the page server stopped (laptop asleep, restarted):  the Review tab's "Restart Page Server" button
     - turn Wi-Fi fully off while reading:  a "pay first" wifi page makes requests hang
   - last line:  "When you're back:  `/airplane land`."

## `/airplane land`:  after

Owen is back online.  Gather everything, work through it in the background, then hand him the review.

1. `spell dev airplane inbox --json`:  everything waiting, by place:
   - each epic's marks, sent or not, its drafts, Do Now requests, and new items from the page's `+`
   - new epics made from the Epics page, not started (`newEpics`)
   - each epic's comments (`comments`:  on its plan doc's blocks)
   - comments on docs pages (`comments`);  page notes;  details answers since the flight;  goals thoughts
   - Run it FIRST, while the switch is on:  its `since` is when the flight began, which picks the details answers.
2. `spell dev airplane off`.  Nothing waiting:  say so in one line, and stop.
3. Reply at once, short:  the counts by place, and that the work runs in the background now.
4. Per epic, in the session itself (quick):  `spell dev plan-doc inbox <name> apply --all`:
   approvals, picks, todos, a todo's plane (queued into the next phase) and x (dropped:  canceled), a note box's x
   (skipped:  reviewed, nothing to do), and new items
   land in the doc, sent or not (Owen's decision Q3 of `airplane`).
4b. Docs pages' comments, in the session itself (quick):  `spell dev comments gather --json`:  every waiting comment
   (and page note still new) goes into epic `guide-changes`, one phase per page (made the first time;  a page whose
   phase is still open gets an Updated block in it), each marked taken on its page.  Say which pages, and that
   `/epic guide-changes` works them;  nothing else to do for them now.
5. The rest goes to background agents, named and listed (root `CLAUDE.md`, "Delegated work"), up to 5 at once:
   - each Do Now, revisit and phase note:  as `/epic review` answers one ("7.3", step 2):
     the status card first, the answer INTO the item, `status ... done`, `inbox done | clear`
   - a mark that only asked to RECORD a choice (no answer to write):  `status ... noted "<what was recorded;  what
     happens next>"`, never `done` (Owen, 2026-10-10:  a Done card means work was done);  `apply --all`'s own cards
     for picks, todos and new items are Noted already
   - each comment on a plan doc (`epics[].comments`):  as `/epic review` answers one ("7.3", step 3b):  into the
     item or phase it's on, then `plan-doc inbox <name> done cm3`
   - page notes were gathered in 4b with the comments;  one written into a page since:  read the page and the
     note, answer under it (`spell dev notes answer <page> <id> --file`)
   - details answers and goals thoughts:  as `/details` and `/goals-update` take them
   - nothing is decided for Owen:  an answer that needs him ends in option cards, and the item stays red
5b. New epics (`newEpics`, made with the Epics page's New epic):  ask which to start, with CHECKBOXES (Owen,
   2026-10-09):  AskUserQuestion, `multiSelect`, "Start which new epics?", one option per epic (label its title,
   description `<name>` and the prompt's first line), 4 per question, up to 4 questions;  more than 16:  a
   details page with a `multiple` question instead.
   - each picked:  `spell dev window launch <name>`:  its own worktree and window, a NEW session there with
     `/epic <name>` typed in (it plans the future epic where it is:  prompt kept).  One line per window.
   - not picked:  they stay future epics, seedlings on the Epics page;  `/epic <name>` any time
   - asked while the agents of step 5 run:  the modal doesn't wait for them
6. Drafts (text he typed and never submitted):  never acted on.
   List them for Owen as a question each, in the reply (or a details page when there are more than 4).
7. When every agent is back:  the summary (what landed where, in words, ids after;  what needs Owen, in bold),
   then `/epic review <name>` on the epic with the most waiting, as that skill's "7.2 Start".

## `/airplane status`

`spell dev airplane status`, and `spell dev airplane inbox` when it's on:  one line each.
