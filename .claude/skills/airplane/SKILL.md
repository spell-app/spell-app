---
name: airplane
description: Get the laptop ready for Owen to work on the epics and docs with NO Claude (on a plane, or bad wifi) -- check and fix what pages need offline, turn airplane mode on, say how it works;  `/airplane land` afterwards gathers everything he left (marks, notes, new items, Do Now requests, new epics) across every epic and page, works through it in the background, and asks which new epics to start.  Use for `/airplane`, `/airplane land`, `/airplane status`, or when Owen says "I'm going offline", "I'm getting on a plane", "I'm back, go through what I left".
argument-hint: '[land | status]'
---

# /airplane

Airplane mode:  Owen works on the pages ALONE, with no internet and no Claude (epic `airplane`).
- He reads epic pages and guides in VS Code's right side bar, marks items, writes notes, adds todos and questions.
- Every page saves to this laptop's page server.
- `/airplane` gets the laptop ready before;  `/airplane land` works through what he left, after.

- The repo actions are `epic airplane ...` ([airplane.ts](packages/epics/tools/airplane.ts));
  this skill holds the dialog.
- The switch:  `~/.spell/airplane.json`, read by [`AirplaneMode`](packages/server/src/page/AirplaneMode.ts).
  - While it's on, the page server tells every page.
  - Then the review controls say "queued for when you land", instead of "start `/epic review`".
- Works from ANY session, a worktree's too (Owen, 2026-10-10:  "when I land in any session, all should come back
  online").
  - Its commands act on the MAIN checkout:  its page server is the one the side bar uses.
  - So run each `spell dev ...` here from the main checkout's root:
    `cd "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")" && epic airplane ...`.
  - The inboxes, epic pages and pages are shared content:  the same files from every checkout.
  - Only `/docs-check` (step 3) stays per checkout:  it checks epics merged into `main`, so it runs there too.

## `/airplane`:  before the flight

1. `epic airplane check --fix`:  fixes what it can on the spot, then lists each check.
   - Each check's result:  `ok`, `fixed`, `fail` or `note`.
   - `page server`:  `--fix` starts it, or restarts one older than its code
   - `offline pages`:  `--fix` points every page's highlight.js at the repo's copy.
     Anything else remote it names:  fix the page by hand, or tell Owen which pages will look plain.
   - `extension`, too old:  `spell dev vscode`.
     - Run it from `main`, never a branch behind it:  it installs into VS Code.
     - Then ask Owen to reload the window (Developer:  Reload Window).
   - `waiting`:  marks already in the inboxes from before:  say which epics;  they'll be gathered at landing too
2. Running sessions:  `spell dev worktree list`.
   - A session mid-work will stall offline:
     list them for Owen, one line each, and ask (modal, multi-select) which to `/park` first.
   - Nothing running:  skip.
3. The docs first?  Ask, ALWAYS (Owen, 2026-10-10, epic `airplane` J20:
   "When I airplane, ask if I want to do docs-check first").
   - Which epics:  the ones `/docs-check` alone offers ([its skill](.claude/skills/docs-check/SKILL.md), "Forms"):
     merged since the last flight, or done in the last week, newest first.
     - Only those merged into `main`:  this session is in the main checkout,
       and an unmerged epic's docs are checked from its own worktree.
   - AskUserQuestion, yes / no:  "Run /docs-check on the epics changed since the last flight first?"
     - its description names those epics;  none:  says so, and Other takes names
     - asked in the same modal as step 2's, when both ask
   - Yes (or names):  run `/docs-check <those epics>`, as its skill says, before step 4.
     - Its diff waits in Source Control, to review on the plane;
       the shared docs it fixes are committed at the turn's end.
   - No:  go on.
4. `epic airplane on`.
5. Reply, short, for Owen about to close the lid:
   - what was fixed, and anything still failing, in bold
   - `/docs-check`, when it ran:  how many fixes, and where to review them
   - how it works on the plane, as bullets:
     - open an epic page:  the Review tab's list button, "Review:  Open Epic...";  any page:  "Review:  Home Page"
     - mark items as usual;  Send isn't needed:  every mark is taken at landing, sent or not
     - "+" on an epic page's header (or its Todos / Questions):  a new todo or question;
       the bubble on a phase or the summary:  a note
     - any page, epic pages too:  the bullhorn beside a block (a section, table, aside, code, an item, a phase's
       field ...), or select text and press ⌘ I (or the bullhorn floating beside it):  a comment, saved at once;
       closed, it's a thread under its paragraph
     - a thread Claude answered:  its header's pills -- the check ("that's good"), Revisit (reply:  into the box
       at the thread's end, saved as you type), the x ("skip it");  a reply is taken at landing like a new comment
     - Tab or a click away saves a comment or reply;  emptied, it's gone
     - a new epic:  the Epics page's New epic pill (its seedling):  a title and what it's for.
       It's written down as a future epic at once, and the landing asks whether to start it.
     - Do Now still works:  it waits, dashed, for landing
     - the page server stopped (laptop asleep, restarted):  the Review tab's "Restart Page Server" button
     - turn Wi-Fi fully off while reading:  a "pay first" wifi page makes requests hang
   - last line:  "When you're back:  `/airplane land`."

## `/airplane land`:  after

Owen is back online.  Gather everything, work through it in the background, then hand him the review.

1. `epic airplane inbox --json`:  everything waiting, by place:
   - each epic's marks, sent or not, its drafts, Do Now requests, and new items from the page's `+`
   - new epics made from the Epics page, not started (`newEpics`)
   - each epic's comments (`comments`:  on its epic page's blocks)
   - comments on docs pages (`comments`);  page notes;  details answers since the flight;  (goals thoughts:  parked since 2026-10-11)
   - A comment is listed when it's Claude's turn on its THREAD:  a new one, or one Owen REPLIED on since Claude
     answered (his latest words:  the last of its `replies`, `by: "Owen"`).  Those he closed ("that's good",
     "skip it") aren't.
   - Run it FIRST, while the switch is on:  its `since` is when the flight began, which picks the details answers.
2. `epic airplane off`.
2b. Bring every session back online:  `spell dev park list`, each entry still `parked`.
   - Its session running (`spell dev worktree status <name>`, `running: true`):
     `SendMessage` to it:  "Run `/unpark <name>` (asked by `/airplane land`)."
     This session itself:  unpark it here, as [the unpark skill](.claude/skills/unpark/SKILL.md) says, once the rest is done.
   - Not running:  list it in the reply, with `/session <name>` to reopen it, then `/unpark <name>` there.
   - Nothing waiting AND nothing parked:  say so in one line, and stop.
3. Reply at once, short:  the counts by place, and that the work runs in the background now.
4. Per epic, in the session itself (quick):  `epic inbox <name> apply --all`.
   - Into the doc go, sent or not (Owen's decision Q3 of `airplane`):
     - approvals, picks, todos, and new items
     - a todo's plane:  queued into the next phase
     - a todo's x:  dropped, canceled
     - a note box's x:  skipped, reviewed with nothing to do

4b. Docs pages' comments, in the session itself (quick):  `epic comments gather --json`.
   - A comment on a page an epic OWNS (its `epic` in step 1's list:  epic `epic-workflow` P13) is NOT gathered:
     it's that epic's.  Its running session takes it with its next `wait`;  none running:  answer it in 5, as that
     epic's session would (`epic comments working`, then `answer`), or list it for `/epic review <epic>`.
   - Every other waiting comment (and page note still new) goes into epic `guide-changes`, one phase per page.
     - The phase is made the first time.
     - A page whose phase is still open gets an Updated block in it.
     - A reply on a thread goes too, under its comment ("Owen replied on the thread").
   - Each is marked taken on its page.
   - `/epic guide-changes` answers each on its thread:  `epic comments working <page>#<id> on` as it starts
     (the thread shows "Claude: thinking…"), then `epic comments answer <page>#<id> --file <html>
     [--commit <sha>]`, which turns it off.
   - Say which pages, and that `/epic guide-changes` works them;  nothing else to do for them now.
5. The rest goes to background agents, up to 5 at once.
   They're named and listed (the root `CLAUDE.md`, "Delegated work").
   - Each Do Now, revisit and phase note:  as `/epic review` answers one ("7.3", step 2).
     - The status card first, then the answer INTO the item.
     - Then `status ... done`, and `inbox done | clear`.
   - A mark that only asked to RECORD a choice (no answer to write):
     `status ... noted "<what was recorded;  what happens next>"`.
     - Never `done` (Owen, 2026-10-10:  a Done card means work was done).
     - The cards `apply --all` makes for picks, todos and new items are Noted already.
   - Each comment on an epic page (`epics[].comments`):  as `/epic review` answers one ("7.3", step 3b).
     - First `epic inbox <name>#M3 working on`:  his thread shows "Claude: thinking…" until the answer lands.
     - Into the item or phase it's on, then `epic inbox <name>#M3 done --file <answer.html>`:  the answer on
       his thread too, his turn (and the thinking stub gone).  A reply of his:  answer his latest words.
   - Page notes were gathered in 4b with the comments.
     One written into a page since:  read the page and the note, and answer under it
     (`epic notes answer <page>#<id> --file`).
   - Details answers:  as `/details` takes them.  (Goals thoughts:  goals is parked, epic `epic-goals`.)
   - Nothing is decided for Owen:  an answer that needs him ends in option cards, and the item stays red.

5b. New epics (`newEpics`, made with the Epics page's New epic):  ask which to start, with CHECKBOXES
   (Owen, 2026-10-09).
   - AskUserQuestion, `multiSelect`, "Start which new epics?"
   - One option per epic:  its title for the label;  `<name>` and the prompt's first line for the description.
   - 4 per question, up to 4 questions.
     More than 16:  a details page with a `multiple` question instead.
   - Each picked:  `spell dev window launch <name>`.
     - Its own worktree and window, with a NEW session there, `/epic <name>` typed in.
     - That session plans the future epic where it is:  prompt kept.
     - One line per window.
   - not picked:  they stay future epics, seedlings on the Epics page;  `/epic <name>` any time
   - asked while the agents of step 5 run:  the modal doesn't wait for them
6. Drafts (text he typed and never submitted):  never acted on.
   List them for Owen as a question each, in the reply (or a details page when there are more than 4).
7. When every agent is back:  the summary (what landed where, in words, ids after;  what needs Owen, in bold),
   then `/epic review <name>` on the epic with the most waiting, as that skill's "7.2 Start".

## `/airplane status`

`epic airplane status`, and `epic airplane inbox` when it's on:  one line each.
