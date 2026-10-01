# Plan docs

How to write and update `plans/<name>/<name>.html`, the live doc behind a `/plan-doc <name>` session.
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

## Sections (ids are fixed)

| Section | id | What |
|---|---|---|
| 1. Plan | `#plan` | 2-sentence summary (`p.plan-summary`), progress bar, then the phase list (`.plan-phases`) |
| 2. Questions | `#questions` | waiting on the user;  each also asked with AskUserQuestion |
| 3. Overview | `#overview` | the plan's substance in numbered h3s (`#o1` "3.1 Structure" ...):  becomes durable docs |
| 4. Caveats | `#caveats` | limits and risks we accept |
| 5. Issues | `#issues` | problems found, open until fixed |
| 6. Todos | `#todos` | later work that isn't a caveat or an issue |
| 7. Decisions | `#decisions` | what was decided and why:  settled unless new facts arrive |
| 8. Phases | `#phases` | one h3 per phase (`#p1` ...):  goal, decisions, files, verify |
| 9. Log | `#log` | one-liners of plan changes, stamped with local date and time |

## Ids:  short, so they're easy to say in chat

- Items:  `q1` questions, `c1` caveats, `i1` issues, `t1` todos, `d1` decisions.  Shown as `Q1`, `C1` ...
- Phases:  `p1` ...  Shown as `P1 · Short Name`:  a 2-4 word name, so "start P2" is unambiguous.
- Link to them in prose:  `<a href="#i2">I2</a>`.  `yarn plan-doc check` fails on a link to a missing id.

## Markup the script writes

Phase list entry (in `#plan`'s `<ui-steps class="plan-phases" vertical ordered>`):

```html
<ui-step data-phase="2" data-status="active" href="#p2" header="P2 · Short Name" selected></ui-step>
```

- status:  `active` -> `selected`, `done` -> `completed` (its number becomes a check)
- above the list, `<ui-progress class="plan-progress">`:  `value` = phases done, `total` = all phases, `hidden`
  while there are none
- the phase's h3 carries a status icon:  `todo` -> `circle outline` grey, `active` -> `circle half stroke` orange,
  `done` -> `circle check` green;  it shows in the contents sidebar too
- docs made before 2026-10-01 have `<ul class="plan-phases">` of `<li data-phase data-status>` with the same icon
  and a link;  the script still edits those

Phase section (in `#phases`):

```html
<section class="s3" data-phase="2" data-status="active">
  <ui-sticky class="spell-h3"
    ><h3 id="p2"><ui-icon name="circle half stroke" color="orange"></ui-icon> P2 · Short Name</h3></ui-sticky
  >
  <ul class="plan-phase-body">
    <li><b>Goal:</b>  one line</li>
    <li><b>Files:</b>  what changes</li>
    <li><b>Verify:</b>  how we know it worked</li>
  </ul>
</section>
```

Item (in any `ol.plan-items`):

```html
<li id="c3" data-status="open">
  <a class="plan-id" href="#c3">C3</a> <span class="plan-title">One line</span>
  <ui-accordion class="spell-aside" styled>
    <ui-title>details</ui-title>
    <ui-content>...</ui-content>
  </ui-accordion>
</li>
```

- `data-status="done"`:  struck through, never removed
- details are optional;  they start collapsed

Log line (in `#log`'s `<ui-feed class="plan-log">`;  a `<ul>` of `<time>` + text before 2026-10-01):

```html
<ui-event icon="pen to square">
  <ui-content><ui-summary><ui-date><time datetime="...">2026-10-01 09:05</time></ui-date> P2 active</ui-summary></ui-content>
</ui-event>
```

Each section's h2 carries an icon (`map`, `circle question`, `lightbulb` ...):  keep it when editing a heading.

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
decide from WITHOUT asking back:  in the item's details, or an Overview `h3` the item links to when it's long.

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
| `new <name> [--title "..."]` | copy the template to `plans/<name>/<name>.html`, fill it, update the docs index |
| `add-phase <name> "Short Name" [--goal ...] [--files ...] [--verify ...]` | append a phase to the list and to `#phases` |
| `phase <name> <N> todo\|active\|done [--no-open]` | set a phase's status;  `done` removes its UPDATE markers;  reloads the doc's Chrome tab |
| `add <name> question\|caveat\|issue\|todo\|decision "<title>" [--details "<html>"]` | append an item, print its id |
| `close <name> <id>` / `reopen <name> <id>` | strike / unstrike an item |
| `log <name> "<text>"` | add a timestamped line to the log |
| `summary <name> [--json]` | open questions, issues, caveats, todos, and the next phase |
| `check <name>` | ids unique, every `#id` link resolves, every phase has a status, then `check-spell.js` |
| `open <name>` | show the doc in Chrome IN THE BACKGROUND, in its tab (named `<name>`;  any checkout of the doc reuses it), reloaded |
