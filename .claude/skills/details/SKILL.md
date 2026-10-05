---
name: details
description: Explain a question on a DETAILS PAGE in VS Code's right side bar, and let Owen answer ON the page -- for a call that needs a picture (table, real code, diagram, live example) or more than the AskUserQuestion modal holds (4 options per question, 4 questions).  Use for `/details [topic]` ("show me that as a page"), and on your own whenever a question you're about to ask needs more than the modal.
argument-hint: "[topic]"
---

# /details

A DETAILS PAGE:  a small page that explains one decision, shown in the "Spell Docs" view (VS Code's right side
bar).  Owen picks on the page and clicks Send;  the page server writes his answer beside the page, and a waiter
running in the background exits with it, which wakes this session.  Docs:  `packages/docs/content/details.html`.

- Explain as `templates/epics/plan-doc.md` "Explaining a question or issue" says:  plain words, coined words
  defined, the real code, tables, options side by side, one recommended.

## Writing for Owen

Owen runs 5+ epics at once, and reads a page cold, coming from another session.  Dense, terse pages make him ask
"what do you mean?" (2026-10-03).  So:
- The "Where we are" box first, every time:  which epic or session, what that work is for (one line), what just
  happened, what this choice changes for him.
- Every question stands alone:  say what it's about in plain words BEFORE the options, as if nothing above it was
  read.
- Short sentences, one idea per line, bullets over paragraphs.  Not caveman:  full words, the articles back in.
- No bare internal ids (`J1`, `T3`, `D6`, `C1`), phase numbers or file names:  say what the thing is ("the call I
  made about how option cards are built").  Add the id after, in brackets, for reference.
- Options say what he'd SEE or GET, and the cost, not how it's built.  How it's built goes in the folded details.
- A concrete example per option:  what the page, the command or the output would look like.

## 1. Page or modal?

- Fits the modal (every question 4 options or fewer, 4 questions or fewer) AND needs no picture:  the modal, as
  always.  No page.
- Fits the modal, but a picture would help Owen decide:  a PICTURE PAGE (no questions on it), then the modal, its
  option labels matching the page's.
- Doesn't fit (more than 4 options, more than 4 questions, or answers that need typing):  an ANSWER PAGE:  Owen
  answers on it.
- Owen typed `/details [topic]`:  the topic (or, with none, the question just asked or the thing being discussed)
  as a page;  any choice in it answerable there.

## 2. Make the page

1. `yarn details new <slug> --title "<Title>"` -- prints the page's path.
   - many questions of one shape (a list to pick from):  `--from <spec.json>` builds the whole page from data
     instead:  title, lede, "Where we are", context, questions and their options (`DetailsSpec` in
     `packages/docs/tools/details.js`).  `/worktrees` and `/bedtime` use it.
   - in an epic (a plan doc this session keeps):  add `--epic <name>`.  The page goes in
     `epics/<name>/details/`, is committed with the plan doc, and the decision it leads to links it.
   - else scratch:  `packages/docs/content/details/`, ignored by version control, swept after 14 days (`new` sweeps).
   - `<slug>`:  lower-kebab-case, about the decision (`answer-path`, `card-layout`), unique.
2. Edit the page (the template's placeholders show where):
   - lede:  what's being decided, and why now;  meta:  "Asked by:  session `<name>`, while <doing what>"
   - the "Where we are" box:  filled in, never left as the template's placeholder ("Writing for Owen")
   - `1. Context`:  the picture.  Page widgets:  `packages/docs/AGENTS.md`, "Writing a page" (tables, code
     folded, pros / cons, steps ...).  Icons only from `ICONS` in `packages/docs/tools/bundle-spell-ui.js`.
   - one `ui-section.spell-question` per question, ids `q1`, `q2` ... header `Q1 · Short question`:

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
     - `data-title`:  2-5 words;  the summary:  one line;  everything longer in `.spell-option-details` (it folds)
     - pick several:  `data-multiple` on the section (checkboxes);  else pick one (radios)
     - every question gets an "Other" box, and the page a notes box and Send:  `_assets/details.js` adds them
   - a picture page:  delete the question sections;  nothing to send
3. Epic page:  `yarn vp fmt <page>` before committing it.

## 3. Show it, and wait

- Answer page:  `yarn details show <slug> --wait` with Bash `run_in_background: true`.  Then END THE TURN with the
  page's link pair (`yarn docs:link <page>`, below):  "answer in the side bar:  <link>".  Don't also ask in chat or
  the modal.
- Picture page:  `yarn details show <slug>` (foreground), then AskUserQuestion.
- Outside VS Code (a CLI session in a terminal):  `show` opens Chrome instead;  same flow.

## Links to pages

Any page you name to Owen (a details page, a plan doc, any docs page):  `yarn docs:link <page> --hash <id> --show`,
and paste what it prints.
- It shows the page in this session's side bar NOW (`--show`), and prints two links:  the title opens it in the
  side bar (again), `(_browser_)` in Chrome.  Both go through the page server (`packages/docs/tools/showRoutes.ts`):
  the Claude panel ignores `vscode://` links and opens `localhost` ones in a VS Code tab.
- `--hash`:  ALWAYS the id of what you mean (`q2`, `t4`, `p3` ...):  the page lands there, below the sticky titles,
  unfolded.
- No page server here has the route yet (older than it):  it prints a plain link and says so.

## 4. The answer

- The waiter exits 0:  its output IS the answer, as text:

  ```
  Answer to "Card layout" (/.../details/card-layout.html), sent 2026-10-03T22:00:00.000Z:
    Q1 · Which card layout?:  A · Stacked cards (recommended);  Other:  but collapsible
    Notes:  use spell/ui
  ```

  Act on it.  Epic:  `yarn plan-doc decide <name> Q<n> "..."` or `add <name> decision`, linking the page
  (`<a href="details/<slug>.html">`).
- Exit 2:  no answer in 8 hours.  One line saying so;  ask again only if it still matters.
- Owen answered in chat instead:  stop the waiter (`TaskStop`), or it wakes you later with a stale answer.
- Owen pressed "Change answer" and sent again:  `yarn details answer <slug>` prints the latest;  wait again
  (`yarn details wait <slug>`, background) only if he says he's changing it.

## 5. When it fails

- The page says "can't take answers yet":  the page server serving it is older than its route module
  (`packages/docs/tools/detailsRoutes.ts`):  route modules load when a page server starts.  Say so in one line;
  ask in chat or the modal meanwhile.  Owen restarts it (`yarn server stop`, then `yarn server ensure`, in the
  checkout whose server it is) when no other session needs it.
- "The page server restarted since this page loaded":  Owen reloads the page, then sends again.
- `show` couldn't reach VS Code:  `yarn vscode`, reload the window;  meanwhile the page's URL
  (`yarn server url <ABSOLUTE path>`) works in any browser.

## Commands (`yarn details ...`, from anywhere in the repo)

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
