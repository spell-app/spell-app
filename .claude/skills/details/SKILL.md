---
name: details
description: Explain a question on a DETAILS PAGE in VS Code's right side bar, and let Owen answer ON the page -- for a call that needs a picture (table, real code, diagram, live example) or more than the AskUserQuestion modal holds (4 options per question, 4 questions).  Use for `/details [topic]` ("show me that as a page"), and on your own whenever a question you're about to ask needs more than the modal.
argument-hint: "[topic]"
---

# /details

A DETAILS PAGE:  a small page that explains one decision.
- It shows in the "Review" view:  VS Code's right side bar, beside "Spell Docs", where Owen answers things.
- Owen picks on the page, and clicks Send.
- The page server writes his answer beside the page,
  and a waiter running in the background exits with it, which wakes this session.
- Docs:  [the details guide](guides/details.html).

- Explain as [plan-doc.md](templates/epics/plan-doc.md), "Explaining a question or issue", says:
  - plain words, coined words defined
  - the real code, tables
  - options side by side, one recommended

## Writing for Owen

Owen runs 5+ epics at once, and reads a page cold, coming from another session.
Dense, terse pages make him ask "what do you mean?" (2026-10-03), so:
- The "Where we are" box first, every time:
  - which epic or session
  - what that work is for (one line)
  - what just happened
  - what this choice changes for him
- Every question stands alone:  say what it's about in plain words BEFORE the options,
  as if nothing above it was read.
- Short sentences, one idea per line, bullets over paragraphs.
  Not caveman:  full words, the articles back in.
- No bare internal ids (`J1`, `T3`, `D6`, `C1`), phase numbers or file names.
  - Say what the thing is ("the call I made about how option cards are built").
  - Add the id after, in brackets, for reference.
- Options say what he'd SEE or GET, and the cost, not how it's built.
  How it's built goes in the folded details.
- A concrete example per option:  what the page, the command or the output would look like.

## 1. Page or modal?

- Fits the modal (every question 4 options or fewer, 4 questions or fewer) AND needs no picture:
  the modal, as always.  No page.
- Fits the modal, but a picture would help Owen decide:  a PICTURE PAGE (no questions on it), then the modal.
  Its option labels match the page's.
- Doesn't fit (more than 4 options, more than 4 questions, or answers that need typing):
  an ANSWER PAGE.  Owen answers on it.
- Owen typed `/details [topic]`:  the topic as a page, any choice in it answerable there.
  With no topic:  the question just asked, or the thing being discussed.

## 2. Make the page

1. `spell dev details new <slug> --title "<Title>"`:  prints the page's path.
   - Many questions of one shape (a list to pick from):  `--from <spec.json>` builds the whole page from data instead.
     - The data:  title, lede, "Where we are", context, questions and their options.
     - Its shape:  `DetailsSpec`, in [details.js](packages/docs/tools/details.js).
     - `/worktrees` and `/bedtime` use it.
   - In an epic (a plan doc this session keeps):  add `--epic <name>`.
     - The page goes in `epics/<name>/details/`, beside the plan doc
       (shared content, committed for you at the turn's end).
     - The decision it leads to links it.
   - Else scratch:  `pages/details/`.
     - Ignored by the shared repo too.
     - Swept after 14 days (`new` sweeps).
   - `<slug>`:  lower-kebab-case, about the decision (`answer-path`, `card-layout`), unique.
2. Edit the page (the template's placeholders show where):
   - lede:  what's being decided, and why now
   - meta:  "Asked by:  session `<name>`, while <doing what>"
   - the "Where we are" box:  filled in, never left as the template's placeholder ("Writing for Owen")
   - `1. Context`:  the picture.
     - Page widgets:  [docs' AGENTS.md](packages/docs/AGENTS.md), "Writing a page"
       (tables, code folded, pros / cons, steps ...).
     - Icons only from `ICONS`, in [bundle-spell-ui.js](packages/docs/tools/bundle-spell-ui.js).
   - one `ui-section.spell-question` per question, ids `q1`, `q2` ..., header `Q1 · Short question`:

     ```html
     <ui-section id="q1" class="spell-question" header="Q1 · Which card layout?" sticky collapsible dividing>
       <ui-icon slot="icon" name="circle question"></ui-icon>
       <p>The question in full, one or two lines.</p>
       <div class="spell-option" data-option="A" data-title="Stacked cards" data-recommended>
         <p>One line:  what changes, why recommended.</p>
         <div class="spell-option-details"><!-- folded:  table, code, picture --></div>
       </div>
       <div class="spell-option" data-option="B" data-title="Side by side">
         <p>One line:  what changes, its cost.</p>
       </div>
     </ui-section>
     ```

     - letters `A`, `B` ...;  the recommended one FIRST, with `data-recommended`
     - `data-title`:  2-5 words
     - the summary:  one line;  everything longer in `.spell-option-details` (it folds)
     - pick several:  `data-multiple` on the section (checkboxes);  else pick one (radios)
     - The page's script, `_assets/details.js`, adds the rest:
       - every question gets an "Other" box
       - every other section with no section inside it, a comment box
       - the page, a notes box
       - its sticky header, Send
     - The page NEVER locks:  Owen sends partial answers, and sends again whenever he likes (2026-10-08).
   - a picture page:  delete the question sections;  nothing to send
3. Epic page:  `yarn vp fmt <page>` once it's written.

## 3. Show it, and wait

- Answer page:  `spell dev details show <slug> --wait`, with Bash `run_in_background: true`.
  - Then END THE TURN with the page's link pair (`spell dev docs link <page>`, below):
    "answer in the side bar:  <link>".
  - Don't also ask in chat or the modal.
- Picture page:  `spell dev details show <slug>` (foreground), then AskUserQuestion.
- Outside VS Code (a CLI session in a terminal):  `show` opens Chrome instead;  same flow.

## Links to pages

Any page you name to Owen (a details page, a plan doc, any docs page):
`spell dev docs link <page> --hash <id> --show`, and paste what it prints.
- It shows the page in this session's side bar NOW (`--show`), and prints two links:
  - the title opens it in the side bar (again)
  - `(_browser_)` opens it in Chrome
  - Both go through the page server ([showRoutes.ts](packages/docs/tools/showRoutes.ts)):
    the Claude panel ignores `vscode://` links, and opens `localhost` ones in a VS Code tab.
- `--hash`:  ALWAYS the id of what you mean (`q2`, `t4`, `p3` ...).
  The page lands there, below the sticky titles, unfolded.
- No page server here has the route yet (older than it):  it prints a plain link, and says so.

## 4. The answer

- The waiter exits 0:  its output IS the answer, as text:

  ```
  Answer to "Card layout" (/.../details/card-layout.html), sent 2026-10-03T22:00:00.000Z:  (sent 2×)
    1 of 2 decided
    Q1 · Which card layout?:  A · Stacked cards (recommended);  Other:  but collapsible  (new)
    Q2 · Where does it live?:  (not decided yet)
    Comments:
      1.2 What exists today:  the table is confusing  (new)
    Notes:  use spell/ui
  ```

  Act on it.
  - Epic:  record it, linking the page (`<a href="details/<slug>.html">`):
    `spell dev plan-doc decide <name> Q<n> "..."`, or `add <name> decision`.
  - "(not decided yet)":  Owen hasn't picked.
    Never read it as "no", or as the recommended one.
  - "(new)":  changed since his send before.
    Act on those;  the rest you've seen.
  - comments:  answer each (in chat, or on the page when it's a fix to the page)
- A PARTIAL answer (anything "not decided yet"):  act on what's there, then wait again at once.
  - `spell dev details wait <slug>`, Bash `run_in_background: true`:  every Send wakes you.
  - Stop once every question is decided, or Owen says he's done.
- Exit 2:  no answer in 8 hours.
  One line saying so;  ask again only if it still matters.
- Owen answered in chat instead:  stop the waiter (`TaskStop`), or it wakes you later with a stale answer.
- He sent again while no waiter ran:  `spell dev details answer <slug>` prints the latest.

## 5. When it fails

- The page says "can't take answers yet":  the page server serving it is older than its route module.
  - That's [detailsRoutes.ts](packages/docs/tools/detailsRoutes.ts).
    Route modules load when a page server starts.
  - Say so in one line;  ask in chat or the modal meanwhile.
  - Owen restarts it when no other session needs it:
    `spell dev server stop`, then `spell dev server ensure`, in the checkout whose server it is.
- "The page server restarted since this page loaded":  Owen reloads the page, then sends again.
- `show` couldn't reach VS Code:  `spell dev vscode`, and reload the window.
  Meanwhile the page's URL (`spell dev server url <ABSOLUTE path>`) works in any browser.

## Commands (`spell dev details ...`, from anywhere in the repo)

```
new <slug> [--title "..."] [--epic <name>] [--description "..."] [--from <spec.json>]
                                           a page from the template (or a spec);  prints its path
show <page> [--wait] [--timeout 8h]        in this session's side bar (Chrome outside VS Code);  then wait
wait <page> [--timeout 8h]                 until a NEW answer;  prints it, exit 0;  timeout:  exit 2
answer <page>                              the answer already sent (exit 1:  none)
list                                       every details page, answered or waiting
sweep [--days 14]                          delete old scratch pages and answers;  never an epic's
```

`<page>`:  a slug, `<epic>/<slug>`, or a path.  Flags go after it.
