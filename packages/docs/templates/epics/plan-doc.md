# Plan docs

How to write and update `epics/<name>/<name>.html`, the live doc behind a `/epic <name>` session.
`plan.html` beside this is the template;  `scripts/plan-doc.js` (`yarn plan-doc`) edits the structured parts.

## Rules

- Use `yarn plan-doc <command>` wherever one exists (below):  it keeps ids, icons, UPDATE markers and the
  "updated" date consistent, and locks the file against parallel agents.  Hand-edit only prose:  the summary,
  Overview, phase bodies, item details.
- Style:  caveman lite.
  - drop filler words and articles where they don't help;  fragments OK
  - keep a full sentence where a fragment would be ambiguous
  - identifiers, paths and numbers exact
- Lists:  bulleted, or numbered when order or reference matters.
- NEVER delete an item:  close it (`yarn plan-doc close`), and it stays, struck through.
- Keep the doc current as you go:  a caveat, issue or decision found mid-phase goes in NOW, not at the end.

## Page header

The h1 sits in a sticky header, `<ui-sticky class="spell-h1"><header class="spell-page-head">`, with the step
label at its right (`.plan-step`, written by the script):  the active phase (orange), else `DONE` (green) once every
phase is, else the next phase (grey).

Below the meta lines, while planning:  the "Plan hung?" notice, `ui-message.plan-hung`.
- How to restart a hung plan:  a new session in the worktree's window, `/epic <name>`, "Reuse".  Plus the kickoff
  prompt in a `ui-code.plan-hung-prompt` with a copy button (`setPrompt()` keeps it in step with the Overview's
  quote).
- Why:  `/epic` writes this stub doc BEFORE planning, so the prompt survives a hung or lost session.
- The script removes it once any phase leaves `todo`;  never add it back by hand.

## Sections (ids are fixed)

| Section | id | What |
|---|---|---|
| 1. Overview | `#overview` | 2-sentence summary (`p.plan-summary lede`), the prompt that started the plan (`blockquote.plan-prompt`), the total estimate (`p.plan-estimate`, written by the script), then the substance in numbered sub-sections (`#o1` "1.1 Structure" ...):  becomes durable docs |
| 2. Phases | `#phases` | progress bar, then one sub-section per phase (`#p1` ...):  goal, files, verify, estimate |
| 3. Questions & Decisions | `#decisions` | open questions first (waiting on the user;  each also asked with AskUserQuestion), then what was decided and why:  settled unless new facts arrive.  `decide` answers a question:  the decision goes at the end, the struck question just above it |
| 4. Judgement calls | `#judgements` | choices Claude made WITHOUT the user (a `/bedtime` run, an agent mid-phase):  title the choice, details "chose X over Y because Z" + the options;  open until the user reviews it, `close` = accepted, disagreement becomes a question.  Every one ALSO linked from its phase's body (`<ui-item icon="compass"><b>Judgement calls:</b>  <a href="#j2">J2</a></ui-item>`) |
| 5. Caveats | `#caveats` | limits and risks we accept |
| 6. Todos | `#todos` | later work that isn't a caveat or an issue |
| 7. Issues | `#issues` | problems found, open until fixed |
| 8. To test | `#tests` | what Owen checks by hand before merging:  each a step and what should happen (`add <name> test`);  `close` one once it passes |
| 9. Log | `#log` | one-liners of plan changes, stamped with local date and time |

- Every section is a `<ui-section>` (markup below):  its title sticks, it folds from its chevron (the reader's folds
  are remembered per page), a rule runs under its title.
- A section with items shows `open/all` at its title's right (its `badge`, set by the page runtime), and its open
  count as a badge in the contents and the rail.  Open:  any `data-status` but `done` and `decided`, so "Questions &
  Decisions" counts the questions waiting.
- Older docs:  `yarn plan-doc migrate <name>` brings one up to date, whatever its age, and prints what it changed:
  - before 2026-10-01:  a `#plan` section (summary + phase list), a separate `#questions`, another order (an
    answered question moves beside the decision whose title names it, `(Q8)`)
  - before 2026-10-02:  `section.s2|s3` > `ui-sticky.spell-h2|h3` > `h2|h3` sections, phases in
    `#phases-section` (the id is gone:  `#phases` is the section now), `data-fold="closed"`

Section markup (the template's;  a hand-written Overview sub-section is the same, nested in `#overview`):

```html
<ui-section id="overview" header="1. Overview" sticky collapsible dividing>
  <ui-icon slot="icon" name="lightbulb"></ui-icon>
  <p class="plan-summary lede">...</p>
  <ui-section id="o1" header="1.1 Structure" sticky collapsible dividing>
    ...  <!-- sub-sub-items:  <h4 id> -->
  </ui-section>
</ui-section>
```

- `header` is the title;  a title with markup is a `<span slot="header">` first inside instead (`1.2 The <code>x</code>
  API`)
- every section `sticky collapsible dividing`;  `collapsed` starts it folded
- NEVER change an `id`:  the items, the log and other docs link to them

## Ids:  short, so they're easy to say in chat

- Items:  `q1` questions, `j1` judgement calls, `c1` caveats, `i1` issues, `t1` todos, `v1` tests ("verify":  `t` is taken), `d1` decisions.  Shown as `Q1`, `J1`, `C1` ...
- Phases:  `p1` ...  Shown as `P1 · Short Name`:  a 2-4 word name, so "start P2" is unambiguous.
- Link to them in prose:  `<a href="#i2">I2</a>`.  `yarn plan-doc check` fails on a link to a missing id.

## Markup the script writes

Step label (in the page header's `.plan-step`):

```html
<ui-label basic color="orange" icon="circle half stroke" href="#p2">P2 · Short Name</ui-label>
```

Phase section (in `#phases`, after `<ui-progress class="plan-progress">`:  `value` = phases done, `total` = all,
`hidden` while there are none):

```html
<ui-section id="p2" data-phase="2" data-status="active" header="P2 · Short Name" sticky collapsible dividing>
  <ui-icon slot="icon" name="circle half stroke" color="orange"></ui-icon>
  <ui-list class="plan-phase-body">
    <ui-item icon="bullseye"><b>Goal:</b>  one line</ui-item>
    <ui-item icon="folder"><b>Files:</b>  what changes</ui-item>
    <ui-item icon="flask"><b>Verify:</b>  how we know it worked</ui-item>
    <ui-item icon="clock"><b>Estimate:</b>  1-2h</ui-item>
  </ui-list>
</ui-section>
```

- Estimate:  wall-clock time for Claude to do the phase, agents included, Owen's review not.  `30m`, `2h`, `1h30m`,
  or a range, `1-2h`.  `yarn plan-doc estimate <name> <N> "..."` changes it.
- The total, in the Overview below the summary and the prompt:

  ```html
  <p class="plan-estimate"><b>Estimate:</b>  4h-5h 30m in all, 2h-3h left (P5 not estimated)</p>
  ```

  every phase's estimate added up, and the phases not done;  rewritten whenever a phase is added, estimated or
  changes status.  An estimate that won't parse is named as not counted.

- the status icon (`slot="icon"`):  `todo` -> `circle outline` grey, `active` -> `circle half stroke` orange,
  `done` -> `circle check` green;  it shows in the contents sidebar too
- `collapsed`:  starts folded.  Setting a phase `done` folds every OTHER done phase:  the one finished last stays
  open
- docs not yet migrated (`section.s3[data-phase]` in `#phases-section`, an h3 with the icon, `data-fold="closed"`):
  the script still edits them as they are

Item (in any `ui-list.plan-items`):

```html
<ui-item id="c3" data-status="open"><a class="plan-id" href="#c3">C3</a> <span class="plan-title">One line</span></ui-item>
```

With details, the item's line IS the panel's title (it opens on a click, or on a link to `#c3`):

```html
<ui-item id="c3" data-status="open">
  <ui-accordion class="plan-item">
    <ui-title><a class="plan-id" href="#c3">C3</a> <span class="plan-title">One line</span></ui-title>
    <ui-content>...</ui-content>
  </ui-accordion>
</ui-item>
```

- `data-status`:  `open` (questions, caveats, issues, todos), `decided` (a decision in force), `done` (struck
  through, never removed:  fixed, answered, or a superseded decision)
- an answered question:  `<a class="plan-answer" href="#d7">→ D7</a>` after its title;  its decision's title ends in
  `(<a href="#q3">Q3</a>)` and its details say what was asked
- details are optional;  they start collapsed
- docs made before 2026-10-01 have `ol.plan-items` of `<li>`s with a "details" panel, and a phase list under
  `#plan`;  the script still edits those, and `migrate` converts them

Log line (in `#log`'s `<ui-feed class="plan-log">`;  a `<ul>` of `<time>` + text before 2026-10-01):

```html
<ui-event icon="pen to square">
  <ui-content><ui-summary><ui-date><time datetime="...">2026-10-01 09:05</time></ui-date> P2 active</ui-summary></ui-content>
</ui-event>
```

Each top-level section carries an icon (`<ui-icon slot="icon">`:  `lightbulb`, `layer group`, `gavel` ...):  keep
it when editing a section.  It is also the section's entry in the rail.

Prompt (in `#overview`, after the summary;  `new --prompt` / `prompt` write it, escaped):

```html
<blockquote class="plan-prompt"><p>first paragraph<br>next line</p><p>second paragraph</p></blockquote>
```

## UPDATE markers

While a phase is active, flag what changed so the user can spot it:

- a new or changed item gets `<ui-label class="plan-update" size="mini" color="orange" data-phase="2">UPDATE</ui-label>`
  (the script adds it)
- a changed prose block gets, just before it:
  `<ui-message class="plan-update" state="warning" size="tiny" header="UPDATE" data-phase="2"><p>what changed</p></ui-message>`
- `yarn plan-doc phase <name> 2 done` removes every `.plan-update[data-phase="2"]`

## Prose

- Code:  ALWAYS folded and colored:
  `<ui-accordion class="spell-code" styled open="0"><ui-title>file.ts · N lines</ui-title><ui-content><pre><code class="language-ts">`
  (`open="0"` for 30 lines or fewer).
- Digressions:  a collapsed `<ui-accordion class="spell-aside" styled>`, title starting "Aside:".
- Link caveats, issues, decisions and phases wherever prose mentions them.

## Explaining a question or issue

Anything the user must decide or weigh in on (a question, an issue with options) gets an explanation the user can
decide from WITHOUT asking back:  in the item's details, or an Overview sub-section the item links to when it's long.

- Plain words first:  what goes wrong (or what's being chosen), for whom, and how they'd notice.  Define every
  coined or jargon word on first use:  "stacking:  things side by side go one under another when there's no room".
- The real thing:  the actual code / markup / CSS rule it's about, excerpted from the file (folded `spell-code`),
  never pseudo-code.
- Concrete cases:  name the affected components / examples / tests ("breadcrumb `divider-icon`:  the divider stays
  empty in Safari").
- Many values:  a `ui-table` (the 19 renamed emoji:  name, today, if changed, other names that reach each).
- Options:  side by side, `<ui-grid class="spell-pros-cons" columns="2" stackable>` of `<ui-segment>` with a
  top-`attached` `<ui-label>` naming the option;  each says what changes, the cost, and a short code sample;  mark
  ONE "(recommended)" and say why.
- Live:  when the doc's bundle has the components, a working example (a resizable box for layout;  real buttons
  for behaviour);  click it through in a browser before handing back.
- Keep code in side-by-side boxes short (~40 columns) or it clips;  look at the screenshot.
- The AskUserQuestion that asks it uses the same option names and order as the doc.

## Commands (`yarn plan-doc ...`, from anywhere in the repo)

| Command | Does |
|---|---|
| `new <name> [--title "..."] [--prompt "..." \| --prompt-file <path>]` | copy the template to `epics/<name>/<name>.html`, fill it (the prompt that started the plan goes in the Overview), update the docs index |
| `add-phase <name> "Short Name" [--goal ...] [--files ...] [--verify ...]` | append a phase to the list and to `#phases` |
| `phase <name> <N> todo\|active\|done [--no-open]` | set a phase's status;  `done` removes its UPDATE markers;  reloads the doc's VS Code tab |
| `add <name> question\|judgement\|caveat\|issue\|todo\|test\|decision "<title>" [--details "<html>"]` | append an item, print its id |
| `close <name> <id>` / `reopen <name> <id>` | strike / unstrike an item |
| `decide <name> <Q id> "<decision>" [--details "<html>"]` | answer a question:  a new decision (prints its id), the question struck and moved just above it |
| `log <name> "<text>"` | add a timestamped line to the log |
| `prompt <name> "<text>"` / `prompt <name> --file <path>` | set (replace) the prompt quoted in the Overview;  `""` removes it |
| `migrate <name>` | bring an older doc (before 2026-10-01, or with `section.s2` markup) into this layout (prints what changed;  "already current" otherwise) |
| `summary <name> [--json]` | open questions, judgement calls, issues, caveats, todos, tests, and the next phase |
| `check <name>` | ids unique, every `#id` link resolves, every phase has a status, then `check-spell.js` |
| `open <name>` | show the doc rendered in VS Code (Simple Browser, beside the editor), reusing its tab and reloading it;  needs the spell extension (`yarn vscode`) |
