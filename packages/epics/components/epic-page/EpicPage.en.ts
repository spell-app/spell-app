/**
 * Every name `<epic-page>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type`, plus data from `epic-section`'s types file.
 *   - the state filter's texts (`FILTER_TEXTS`), for its toolbar's chips
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

// the state filter's chips, as a section's
import { FILTER_TEXTS } from "$/epics/components/epic-section/EpicSection.types"

/****************
 * ### `<epic-page>`
 * A plan doc:  one epic's page.
 ****************/
export const epicPageVocabulary = {
  tag: "epic-page",
  topics: ["documentation", "layout", "containers"],
  aka: ["plan doc", "epic", "plan", "project plan"],
  skeleton: "header, 4 line paragraph",
  noun: "page",
  ui: false,
  description:
    "A plan doc:  one epic's page -- its crumbs, header and meta lines, the Overview, then its sections in a fixed " +
    "order.  Runs edge to edge:  it breaks out of the docs' `<main>` padding (`--spell-doc-pad-inline`).",
  attributes: [
    {
      name: "epic",
      kind: "string",
      required: true,
      format: "epic name",
      description: "The epic's name:  its folder in `epics/`, and its branch's (`epic-components`)."
    },
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      required: true,
      description:
        "The epic's title (`Windows and Review`):  the subhead under the h1, which reads `/epic <name>`;  the " +
        "crumbs' last."
    },
    { name: "branch", kind: "string", description: "Its git branch;  absent for a future epic." },
    {
      name: "worktree",
      kind: "string",
      description: "Its worktree's folder, absolute;  absent for a future epic, or once the worktree is gone."
    },
    { name: "started", kind: "string", format: "date", description: "The day the plan doc was made." },
    { name: "updated", kind: "string", format: "date", description: "The day a command last changed it." },
    {
      name: "future",
      kind: "boolean",
      description:
        "A FUTURE epic (`/epic future`):  an idea written down, not planned yet;  its open questions are on " +
        "`details/analysis.html`."
    },
    {
      name: "bedtime",
      kind: "string",
      description: "A `/bedtime` run is on, and what it runs (`P3-P6`):  items it changes are `recent`."
    },
    {
      name: "recent-since",
      kind: "string",
      format: "time",
      description:
        "Items decided, reviewed or closed since then are `recent` (green):  the commit time of `HEAD~2` in the " +
        "doc's checkout.  Absent without git history."
    },
    {
      name: "repo",
      kind: "string",
      description:
        "The repo's web address (`https://github.com/spell-app/spell-app`):  `<epic-commit>` links are made from " +
        "it.  Absent:  commits show without links."
    },
    {
      name: "reviewing",
      kind: "boolean",
      description:
        "PAGE state, never in a doc:  the page is being reviewed -- served by the page server with a token, its " +
        "review inbox answering -- so items and Overview parts show their review controls, and the header Send and " +
        "Review Now.  Set by them (P9, `ReviewState`);  the old runtime's `body.plan-reviewing`."
    }
  ],
  events: [],
  slots: [
    { name: "", description: "The Overview, then the sections." },
    {
      name: "durable",
      description:
        'A link to the durable doc, once Doc Review wrote one:  `<a slot="durable" href="../../guides/x.html">X</a>`.'
    },
    {
      name: "toolbar",
      description:
        "The sticky bar's last row:  the section toolbar the docs runtime adds to a plan doc " +
        '(`<nav slot="toolbar" class="spell-toolbar">`, `spell-doc-runtime.js` `buildToolbar()`);  never in a doc.'
    }
  ],
  parts: [
    { name: "base", description: "The page." },
    {
      name: "crumbs",
      description:
        "Above the header:  `Docs › Epics › <title>`, the docs' eyebrow.  None while the doc still holds its old " +
        "`ui-breadcrumb.spell-crumbs` before the page."
    },
    {
      name: "header",
      description:
        "The sticky page header:  the h1, then at its right Send and Review Now (while reviewed), the bedtime label, " +
        "the step label (the state in it) and the git toggle."
    },
    { name: "heading", description: "The h1, `/epic <name>`:  a click copies it." },
    { name: "subhead", description: "Under the header:  the epic's title, NOT sticky:  it scrolls away." },
    {
      name: "bar",
      description:
        "The toolbar's sticky bar, right below the header once the title has scrolled away:  the new item form " +
        "(while open), then the toolbar."
    },
    {
      name: "toolbar",
      description:
        "The sticky bar's last row:  the docs runtime's section buttons (`slot=\"toolbar\"`), then at the right the page's " +
        "state filter, collapse-all and (reviewed) the new todo or question button."
    },
    {
      name: "filter",
      description:
        "The toolbar's state filter:  a chip per state the page's items are in, with how many;  filters every section."
    },
    { name: "collapse-all", description: "The toolbar's double chevron:  folds everything on the page." },
    {
      name: "pill",
      description:
        "Under the review line, while marks wait and nobody can take them:  no Claude session reviewing (orange), or " +
        "airplane mode;  a click copies the review line's command."
    },
    {
      name: "send",
      description:
        "In the header while the page is reviewed, the paper plane:  every unsent mark and comment to Claude.  A " +
        "grey outline with nothing to send, dashed blue with unsent marks or comments, outlined blue once sent."
    },
    {
      name: "review-now",
      description:
        "In the header while the page is reviewed, the wand:  every mark sent, each revisit asked now.  Outlined " +
        "blue while there's anything for Claude to work through, else grey."
    },
    { name: "git", description: "The git toggle:  shows or hides every commit (only when the doc has some)." },
    {
      name: "status",
      description:
        "The header's right side:  Send and Review Now (while reviewed), the bedtime label, the step label, the git " +
        "toggle."
    },
    {
      name: "state",
      description:
        "The step label while the epic has a state, its icon and colour the state's (`$/server/site/EpicState`):  " +
        "in progress (blue half circle), errors (red:  every phase done, items need you), paused (grey:  phases " +
        "left, untouched for days);  why on hover.  None for a future epic or a done one:  FUTURE or DONE says so."
    },
    {
      name: "review-line",
      description:
        "Under the header:  `To review this doc, type /epic review <name>` (airplane mode:  `/airplane land`), " +
        "copied on click."
    },
    { name: "meta", description: "The meta lines:  branch, worktree, dates, durable doc." },
    { name: "notice", description: "A future epic's notice:  not planned yet." },
    {
      name: "hung",
      description:
        "A doc still planning (no phases, not future):  the folded `Plan hung?` aside, with the prompt to copy."
    },
    {
      name: "new-button",
      description:
        "The toolbar's New todo or question (comment dots, epic `airplane` P2):  opens the form.  Only while the page " +
        "is reviewed."
    },
    {
      name: "new-form",
      description:
        "The new todo or question form the toolbar button opened (an `<epic-new-item open>`):  a row of its own " +
        "across the header."
    },
    {
      name: "agents",
      description:
        "The running agents (an `<epic-agents>`, epic `skillz` P3), right before its blocks:  only while an agent runs."
    }
  ],
  states: [
    { name: "future", description: "A future epic." },
    { name: "commits", description: "Every commit shows (the git toggle is on)." }
  ],
  texts: [
    { key: "copyHeading", text: "Copy {command}", description: "The h1's tooltip." },
    {
      key: "newButton",
      text: "New todo or question",
      description: "The toolbar's new item button (comment dots):  its name and tooltip."
    },
    { key: "crumbs", text: "Breadcrumb", description: "The crumbs, spoken." },
    { key: "crumbDocs", text: "Docs", description: "The crumbs' first:  the docs home." },
    { key: "crumbEpics", text: "Epics", description: "The crumbs' second:  the epics' index." },
    { key: "planDoc", text: "Plan doc for", description: "Meta line:  `Plan doc for /epic x, branch x`." },
    { key: "branch", text: "branch", description: "Meta line:  before the branch's name." },
    { key: "futureEpic", text: "Future epic:", description: "Meta line of a future epic." },
    { key: "noBranch", text: "no branch yet", description: "Meta line of a future epic." },
    { key: "worktree", text: "Worktree:", description: "Meta line:  before the worktree's folder." },
    { key: "noWorktree", text: "none yet", description: "Meta line:  no worktree." },
    { key: "started", text: "Started", description: "Meta line:  `Started 10/6/26, updated 10/7/26`." },
    { key: "updated", text: "updated", description: "Meta line:  before the last change's day." },
    { key: "durable", text: "Durable doc:", description: "Meta line:  before the durable doc's link." },
    { key: "done", text: "DONE", description: "Step label:  every phase is done." },
    { key: "future", text: "FUTURE", description: "Step label:  a future epic." },
    { key: "next", text: "Next:  ", description: "Step label's tooltip, before the next phase." },
    { key: "bedtime", text: "Bedtime {phases}", description: "The bedtime label:  a `/bedtime` run is on." },
    {
      key: "bedtimeTip",
      text: "A /bedtime run is on ({phases}):  what it changes shows green until you review it.",
      description: "The bedtime label's tooltip."
    },
    { key: "showCommits", text: "Show the commits", description: "The git toggle, off." },
    { key: "hideCommits", text: "Hide the commits", description: "The git toggle, on." },
    { key: "futureHeader", text: "Future epic:  not planned yet", description: "A future epic's notice." },
    {
      key: "futureBody",
      text:
        "No worktree, no phases yet.  Its high-level open questions are on its analysis page, answered in the side " +
        "bar's Review tab;  the answers land here as decided questions.",
      description: "A future epic's notice."
    },
    { key: "analysisPage", text: "Open its analysis page", description: "The notice's link." },
    { key: "futurePlan", text: "plans it.", description: "The notice's last line, after `/epic <name>`." },
    {
      key: "send",
      text: "Send {what} to Claude",
      description: "Send, marks or comments unsent;  `what` counts them (`marksOne` ..., `2 marks, 1 comment`)."
    },
    { key: "sent", text: "Sent:  waiting for Claude", description: "Send, every mark and comment sent." },
    {
      key: "sendIdle",
      text: "Nothing to send:  mark an item (its buttons) or leave a comment (its bullhorn)",
      description: "Send, no marks or comments."
    },
    { key: "marksOne", text: "1 mark", description: "Send's and Review Now's count:  one mark." },
    { key: "marksMany", text: "{count} marks", description: "Send's and Review Now's count:  marks." },
    { key: "commentsOne", text: "1 comment", description: "Send's and Review Now's count:  one comment." },
    { key: "commentsMany", text: "{count} comments", description: "Send's and Review Now's count:  comments." },
    {
      key: "reviewNowOne",
      text: "Review Now:  Claude works through {what} at once, answers in its item",
      description: "Review Now, one mark or comment to work through;  `what` counts it."
    },
    {
      key: "reviewNowMany",
      text: "Review Now:  Claude works through {what} at once, answers in their items",
      description: "Review Now, marks or comments to work through;  `what` counts them."
    },
    {
      key: "reviewNowIdle",
      text: "Review Now:  nothing to work through yet",
      description: "Review Now, nothing to work through."
    },
    { key: "reviewLine", text: "To review this doc, type", description: "The review line, before the command." },
    {
      key: "nobodyPill",
      text: "No Claude session is reviewing:  start one with",
      description: "The pill while nobody listens, before the command it copies."
    },
    {
      key: "airplanePill",
      text: "Airplane mode:  this waits for",
      description: "The pill in airplane mode, before `/airplane land`."
    },
    {
      key: "collapseAll",
      text: "Fold everything on the page",
      description: "The toolbar's collapse-all button:  its name and tooltip."
    },
    ...FILTER_TEXTS,
    {
      key: "reviewLineAirplane",
      text: "Airplane mode:  what you mark here waits for",
      description: "The review line in airplane mode (no Claude), before `/airplane land`."
    },
    { key: "copyCommand", text: "Copy the command", description: "The review line's tooltip." },
    {
      key: "startReview",
      text: "Start the review in this epic's Claude session (and copy the command)",
      description: "The nobody-listening pill's tooltip:  a click types the command into the epic's session."
    },
    { key: "copied", text: "copied", description: "The review line, just copied." },
    { key: "hung", text: "Plan hung?", description: "The planning aside's title." },
    { key: "hungBefore", text: "Close its Claude tab, then run", description: "The aside, before `/epic <name>`." },
    { key: "hungAfter", text: "and pick \u201cReuse\u201d.", description: "The aside, after `/epic <name>`." }
  ],
  children: [
    { tag: "flow", slot: "durable", max: 1, description: "The durable doc's link." },
    { tag: "epic-overview", min: 1, max: 1, description: "1. Overview." },
    {
      tag: "epic-section",
      where: { attribute: "kind", values: ["report"] },
      description: "Reports a run wrote (an overnight `/bedtime` report), after the Overview:  unnumbered."
    },
    { tag: "epic-section", where: { attribute: "kind", values: ["phases"] }, max: 1, description: "2. Phases." },
    {
      tag: "epic-section",
      where: { attribute: "kind", values: ["questions"] },
      max: 1,
      description: "3. Questions."
    },
    {
      tag: "epic-section",
      where: { attribute: "kind", values: ["judgements"] },
      max: 1,
      description: "4. Judgement calls."
    },
    { tag: "epic-section", where: { attribute: "kind", values: ["caveats"] }, max: 1, description: "5. Caveats." },
    { tag: "epic-section", where: { attribute: "kind", values: ["todos"] }, max: 1, description: "6. Todos." },
    { tag: "epic-section", where: { attribute: "kind", values: ["issues"] }, max: 1, description: "7. Issues." },
    { tag: "epic-section", where: { attribute: "kind", values: ["tests"] }, max: 1, description: "8. To test." },
    { tag: "epic-section", where: { attribute: "kind", values: ["log"] }, max: 1, description: "9. Log." }
  ],
  childOrder: "listed"
} as const satisfies EpicVocabulary
