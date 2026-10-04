# goals/ -- goal sets

Plans, one GOAL SET per project or idea:  a page per topic for people, a brief per topic for agents, thoughts
waiting to be worked in, and the tools that keep it all consistent.  As the root's `AGENTS.md`, plus what's below.

- Start at `index.html` (every goal set), or a set's own `<set>/index.html`.  `yarn goals open` shows them served
  live;  they also open straight from disk.
- The /goals skills (`packages/docs/tools/goals/skills/`, linked into the repo's `.claude/skills/`) drive dialogs,
  thoughts and updates.
- Built in this repo, meant for any project later:  keep paths relative, and project specifics in the preferences.

## Layout

- `goals.preferences.json5` -- preferences (below).  Its presence marks this folder as a goals folder.
- `index.html` -- the home page:  one card per goal set.  Made from its template if missing;  its cards and numbers
  sit between `<!-- sets:start -->` / `<!-- sets:end -->` and `<!-- stats:start -->` / `<!-- stats:end -->`.
- `<set>/index.html` -- a set's contents page (`<body data-set>`):  topic cards between `<!-- topics:start -->` /
  `<!-- topics:end -->`, numbers between the `stats` markers;  the rest (the plan's arc, how we work) by hand.
- `<set>/<topic>/<topic>.html` -- a topic's page, for people.  THE SOURCE OF TRUTH for its goals, questions,
  decisions and thoughts.
- `<set>/<topic>/<topic>.md` -- the same topic as a brief for agents:  context, decisions, work, the questions they
  must not decide, pointers.  Same ids as the page.
- This folder holds content only.  It may be a symlink into a peer content repo, so the tools find it as
  `<repo root>/goals`, never beside themselves.
- `packages/docs/tools/goals/` -- the tools:
  - `goals.js` -- `yarn goals ...` / `spell goals ...` (below)
  - `page.js` -- `GoalsPage`:  every edit to a page, pure (HTML in, HTML out)
  - `targets.js` -- preferences, sets, topics, and what a target means;  where the repo root and this folder are
  - `launch.js` -- Claude sessions in a terminal window
  - `goalsRoutes.ts` -- the pages' buttons, as a route module of the page server (below);  tests:
    `goalsRoutes.test.ts` (`yarn goals:test`)
- The tools run under `tsx` (`goals.sh`, `yarn goals`), with `packages/docs/tsconfig.json` for the repo's aliases:
  they use the page server's code (`$/server`).
- `packages/docs/tools/goals/skills/` -- the /goals skills:  `goals`, `goals-thought`, `goals-update`, `goals-open`,
  `goals-open-vs`.  `goals/scripts/goals.sh` there runs its checkout's tool:  every skill calls it.
- Templates:  `packages/docs/content/templates/goals/`.  Look:  `packages/docs/tools/_assets/goals.css`.  Live buttons:
  `packages/docs/tools/_assets/goals-live.js`.

## Words

- **people**, never "users".
- Voice:  concise, friendly, professional.  Bullets and numbered lists over paragraphs.  Short titles (2-6 words),
  then a one-line note.
- Pages talk TO Owen ("your 2017 talk");  the `.md` notes talk to agents ABOUT Owen ("Owen's 2017 talk").
- Topics have a short name (`app`, `spell/ui`, `AI`) used in conversation and on cards;  folders are
  lower-kebab-case (`spell-ui`, `ai`).

## Targets

A TARGET names a set, a topic, or one place on a page:  `[set/]topic[/anchor]`.

| Target | Means |
|---|---|
| `spell` | the set's contents page |
| `spell/motivation`, or `motivation` | a topic (the set left out:  the active set) |
| `motivation/G1`, `spell/ui/Q3` | an item (topics by folder or short name, any case) |
| `motivation/questions`, `spell/arc` | a section:  a heading's id, on a topic or on the set's page |
| `motivation/T2` | a thought |

- `yarn goals resolve <target>` says what one means.  No set given and no active set:  "which goal set?", with the
  sets as choices:  ask Owen.

## Items and ids

| Kind | Id | Section | Meaning |
|---|---|---|---|
| goal | `G1` | `#goals` (`#now`, `#next`, `#someday`) | something we want, on a horizon |
| idea | `I1` | `#ideas` | a way we might get there;  not decided |
| question | `Q1` | `#questions` | waiting on a conversation;  details carry context and Claude's suggestion |
| risk | `R1` | `#risks` | what's likely to bite us |
| decision | `D1` | `#decisions` | settled, with the why;  agents don't relitigate |
| work | `W1` | `#work` | a piece of work someone can pick up |
| thought | `T1` | where it was added | Owen's note, waiting to be worked in |

- Ids count per kind across the page and NEVER change or get reused.
- NEVER delete an item or a thought:  close it (`yarn goals close`) or digest it (`yarn goals digest`);  it stays.
  - a closed question:  answered (its decision says how)
  - a closed decision:  no longer holds (log why, and add the decision that replaced it)
  - a closed work item:  done (or dropped:  log which)
  - a digested thought:  worked in;  its note says what came of it (`→ D2;  Q3 closed`)
- Markup (written by the tool;  `plan-doc.css` styles item chips, `goals.css` the rest):

```html
<li id="q3" data-status="open">
  <a class="plan-id" href="#q3">Q3</a> <span class="plan-title">Short title</span>
  <span class="goals-note">one line</span>
  <ul class="goals-thoughts" data-for="q3">
    <li id="t2" class="goals-thought" data-status="new">
      <span class="goals-thought-icon"><ui-icon name="comment dots"></ui-icon></span>
      <time datetime="2026-10-01T12:08-04:00">2026-10-01 12:08</time>
      <span class="goals-thought-text">Owen's words</span>
    </li>
  </ul>
  <ui-accordion class="spell-aside" styled><ui-title>details</ui-title><ui-content>...</ui-content></ui-accordion>
</li>
```

- Thoughts on a section sit right under its heading;  on the page as a whole, right under the hero.

## Topic status

`<body data-status>`, shown in the hero and on the topic's card.

| Status | Means |
|---|---|
| `draft` | Claude's first pass, from the code and old notes;  not yet talked through |
| `dialog` | being talked through |
| `agreed` | direction agreed;  the `.md` is ready to hand to agents |
| `building` | work under way |
| `shipped` | done for now |

## Editing

- Structured parts go through the tool:  it keeps ids, the "updated" date, the history and the contents pages
  consistent, and locks the page against parallel agents (and the server).
- Hand-edit only prose:  Summary and Today, item details and notes, new sections a topic needs.  Then
  `yarn goals check <target> --no-browser`.
- Keep the `.md` in step after every dialog or update:  new decisions, work status (`proposed` → `ready` →
  `done`), closed questions.  Same ids, same titles.
- Links between goals pages open in the SAME tab (`target="_self"`, added by the tool);  every other link gets a
  named new-tab target from `packages/docs/tools/doc-links.js`.  Write code references as
  `<code>path/from/repo/root</code>`:  the tool links them.
- History (`#history`):  newest first, one line per session or change, via `yarn goals log`.

## The tool

`yarn goals <command>` at the repo root, `spell goals <command>` anywhere (the spell CLI finds the nearest goals
folder), or `.claude/skills/goals/scripts/goals.sh <command>` from anywhere.  `help` lists everything.

```
sets  /  use <set>                        the goal sets;  make one the active set
resolve <target> [--json]                 what a target means
summary [target] [--json]                 status and open items
thoughts [target] [--all] [--json]        thoughts waiting (--all:  digested ones too)
new-set <set> --title .. --description .. [--icon ..] [--accent ..]
new <set/topic> --n N --title .. --description .. --icon .. --accent .. [--short ..]
add <target> <kind> "title" [--horizon now|next|someday] [--note ..] [--tag ..] [--details html]
close <target/ID>  /  reopen <target/ID>
log <target> "text" [--icon comments|gavel|flag|pen to square|comment dots|robot|rocket]
status <target> draft|dialog|agreed|building|shipped
thought <target> "text" | -               a thought (-:  the text from stdin)
digest <target/T3> "what came of it"
index                                     rewrite every contents page's cards and numbers
check [target] [--no-browser]             ids, links, status;  then check-spell.js in a real browser
serve  /  server start|stop|status        the page server, which serves the goals pages
open [target]  /  open-vs [target]        a new browser window  /  VS Code, beside the editor
talk [target] [--window]                  a /goals dialog with Claude, here (or in a new terminal window)
update [target] [--print] [--window]      /goals-update with Claude (--print:  headless, no questions)
claude                                    is Claude Code installed and logged in?
```

- An icon a page uses must be in `ICONS` in `packages/docs/tools/bundle-spell-ui.js`, then
  `node packages/docs/tools/bundle-spell-ui.js --skip-ui-build`:  any other name draws nothing.

## The page server

- Goals pages are served by the repo's PAGE SERVER (`packages/server`, `yarn server`), one per checkout, which
  serves docs, plans and Spell UI too.  Goals plug in as a ROUTE MODULE, `packages/docs/tools/goals/goalsRoutes.ts`, listed in the
  root `package.json`'s `"pageServer"`.
- `yarn goals open` starts it in the background if need be (`yarn goals server start|stop|status`;  `serve` runs
  it in front).  It asks for `server.port` (the preferences) first, else any free port.  State and log:
  `<repo>/.spell-server.json`, `.spell-server.log` (git-ignored).
- Each goals page gets `window.GOALS_SERVER` (`{ api }`) from the route module, and the server's
  `window.SPELL_SERVER` (token, live reload).  The page server reloads the page (keeping the scroll) when the page,
  a stylesheet or a script changes on disk.  The page's `goals-live.js`:
  - adds buttons:  Talk / Thought / Update under the contents' head, a round VS Code button beside its own, and a
    thought bubble and a talk button on every section heading and item (on hover)
  - saves thoughts (`POST /api/goals/thought`), starts Claude sessions in a terminal window
    (`POST /api/goals/run`, skills `goals` and `goals-update` only), and opens VS Code
    (`POST /api/goals/open-vscode`)
  - no Claude Code, or not logged in:  a setup dialog, with Copy / Install guide / Log in buttons and "Check again"
- Opened from disk instead, the buttons say how to start the server, and link to the page on it.
- Safety (the page server's `SRV.Guard`):  loopback only;  any other `Host` refused;  POSTs need this run's token
  (`x-server-token`) and a same-origin `Origin`;
  dot-files and anything outside the project root are never served;  targets are resolved and skills checked
  before anything reaches a command line.
- `GOALS_DRY_RUN=1` (for tests):  "starting" Claude only says what it would run.

## Preferences (`goals.preferences.json5`)

| Key | Means |
|---|---|
| `activeSet` | the set a target without one means;  `yarn goals use <set>` rewrites it, keeping comments |
| `server.port` | the port the page server asks for first |
| `browser` | where `open` shows pages, in a NEW window:  "Google Chrome", "Safari", or "default" |
| `terminal` | where Claude sessions start from a page:  "Terminal" or "iTerm" |
| `claude.command`, `claude.args` | the Claude Code command (a path, or the newest `claude` found) and extra arguments |
| `horizons` | labels of the three goal horizons on new topic pages |

## For agents doing the work

- Read the topic's `.md` first, then its page for detail.
- Start only work marked `ready` in the `.md`, or a `W` item Owen handed you.  Goals and ideas are direction, not
  orders.
- NEVER decide an open question:  ask, or note what you found under it.
- Record as you go, not at the end:
  - progress or findings:  `yarn goals log <set/topic> "W2:  ..." --icon robot`
  - a new risk or question:  `yarn goals add <set/topic> risk|question "..."`
  - done:  `yarn goals close <set/topic/W2>`, and mark it `done` in the `.md`
- Repo-wide rules still apply:  `agents/CODE-DEBT.md`, `agents/SUSPECTED-BUGS.md`, `agents/PAPERCUTS.md`.
