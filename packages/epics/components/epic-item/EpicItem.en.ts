/**
 * Every name `<epic-item>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type`, plus the review controls' parts and button names (`REVIEW_*`) from `epic-review`'s
 *   types file, data too:  it draws `<epic-review>`, and its id chip's tooltip names the chosen button.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

import { REVIEW_NAME_TEXTS, REVIEW_PARTS } from "$/epics/components/epic-review/EpicReview.types"

/****************
 * ### `<epic-item>`
 * One item of a plan doc:  a question, judgement call, caveat, todo, issue or test.
 ****************/
export const epicItemVocabulary = {
  tag: "epic-item",
  topics: ["documentation", "lists", "status"],
  aka: ["item", "question", "decision", "judgement call", "caveat", "todo", "issue", "test", "ticket"],
  noun: "item",
  ui: false,
  description:
    "One item:  a question, judgement call, caveat, todo, issue or test -- ONE element for every kind, the kind " +
    "its id's letter (Q11).  Its line (id chip in its state's colour, title, review label, review buttons) and " +
    "note box are drawn;  its details, choices, answer, replies, earlier versions and commits are its children.",
  attributes: [
    {
      name: "id",
      property: "epicId",
      kind: "string",
      required: true,
      format: "item id",
      description:
        "`q7` (question), `j3` (judgement call), `c1` (caveat), `t4` (todo), `i2` (issue), `v1` (test):  shown as " +
        "`Q7`;  links use it (`#q7`)."
    },
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      required: "or slot",
      description: "Its line, WITHOUT its id (`Which colour names?`);  an answered question keeps its question's."
    },
    {
      name: "status",
      kind: "enum",
      values: ["open", "decided", "done", "canceled"],
      required: true,
      description:
        "`open`;  `decided` (an answered question:  a decision in force);  `done` (closed:  fixed, passed, " +
        "accepted);  `canceled` (made moot:  struck through)."
    },
    {
      name: "state",
      kind: "enum",
      values: ["attention", "replied", "progress", "open", "recent", "old"],
      description:
        "Its id chip's colour, written by the script on every edit:  `attention` (red:  needs Owen), `replied` " +
        "(orange:  Claude answered with options, Owen's turn to pick), `progress` (blue:  Claude is working on it), " +
        "`open` (yellow:  still undecided, or queued work), `recent` (green:  decided or done, however long ago), " +
        "`old` (grey:  no longer relevant, canceled)."
    },
    {
      name: "changed",
      kind: "string",
      format: "time",
      description: "When a command last changed its status or review marks (ISO, with offset)."
    },
    { name: "phase", kind: "number", description: "The phase active when it was added:  its To review line lists it." },
    {
      name: "answered",
      kind: "boolean",
      description: "An answered question:  its details read question, Choices, then the answer."
    },
    { name: "reviewed", kind: "string", format: "date", description: "Gone through with Owen, that day." },
    {
      name: "review-as",
      kind: "enum",
      values: ["approve", "todo", "revisit", "now", "next", "drop", "skip"],
      description:
        "How Owen's review mark was handled (`now`:  a Do Now request, done;  `next`, `drop`:  a todo queued into " +
        "the next phase, or dropped;  `skip`:  the note box's x, nothing to do):  the record, not drawn on the " +
        "buttons (they clear once handled);  `approve` or `todo` on an open item make it `recent` (green)."
    },
    {
      name: "deferred",
      kind: "string",
      format: "date",
      description: "Put off, that day:  still not reviewed, offered again next review."
    },
    {
      name: "queued",
      kind: "string",
      format: "date",
      description: "A review decided on work, that day, not started yet:  the next review offers it first."
    },
    { name: "work", kind: "string", description: "The queued work, in a few words (`Skip short sections`)." },
    { name: "working", kind: "boolean", description: "Work on it is under way." },
    {
      name: "bedtime",
      kind: "boolean",
      description: "Changed during a `/bedtime` run, until reviewed (it no longer colours the chip)."
    },
    {
      name: "overnight",
      kind: "boolean",
      description:
        "Made during a `/bedtime` run (the converter:  an old doc's `data-bedtime` item, or one its Overnight report " +
        "linked):  a small bed icon on its line, for good.  The tool sets it on every item added in bedtime mode."
    },
    {
      name: "calm",
      kind: "boolean",
      description:
        "Not urgent:  an open judgement call or issue not reviewed yet is `open` (yellow), not `attention` (red).  " +
        "For a call that simply follows WWOD (`plan-doc add ... --calm`);  Owen flips it by clicking the id chip " +
        "while the page is reviewed (the inbox's `urgency`, applied by `plan-doc inbox apply`)."
    },
    {
      name: "source",
      kind: "string",
      description:
        "Its details' part file (`parts/q7.html`), loaded into its children the first time it opens (its children " +
        "without a `slot` are a placeholder the part replaces)."
    },
    {
      name: "part-ids",
      kind: "string",
      format: "ids",
      description: "The ids inside its part file (an old `d7` answer):  a link to one loads the body first, then lands."
    },
    { name: "commits", kind: "boolean", description: "Its details list commits (the page's git buttons)." },
    {
      name: "open",
      kind: "boolean",
      description:
        "Unfolded:  a click on its line, a link to it (`#q7`, or an id in `part-ids`), find-in-page.  Page state " +
        "only:  the script never writes it, so a doc opens folded."
    }
  ],
  events: [
    {
      name: "ui-open",
      detail: "{ open: boolean, item: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "About to unfold:  its line was clicked;  after the fact (not cancelable) for a link or find-in-page.  " +
        "Cancel to stay folded."
    },
    {
      name: "ui-close",
      detail: "{ open: boolean, item: Element, originalEvent?: Event }",
      cancelable: true,
      description: "About to fold:  its line was clicked.  Cancel to stay open."
    },
    {
      name: "ui-load",
      detail: "{ source: string, content: string }",
      description: "Its `source` part arrived and is in its children (`content` is the file's text)."
    },
    {
      name: "ui-error",
      detail: "{ kind: 'load' | 'cross-origin' | 'file-protocol' | 'render', source: string, error: unknown }",
      cancelable: true,
      description:
        "Its `source` part couldn't be loaded;  `kind` says why.  A note shows in its details unless cancelled;  " +
        "opening it again tries again."
    }
  ],
  slots: [
    { name: "", description: "Its details." },
    { name: "title", description: "A title with markup, in place of `title`." },
    {
      name: "status",
      description:
        "Claude's status cards (`<epic-status slot=\"status\">`, P13):  drawn last in its details, under Owen's " +
        "marked note, above the note box."
    }
  ],
  parts: [
    { name: "base", description: "The item." },
    { name: "line", description: "Its line:  fold button, id chip, title, review label, actions;  sticky while open." },
    { name: "toggle", description: "The fold `<button>` (the chevron), on an item with details." },
    {
      name: "collapse-all",
      description: "Open, holding cards or panels that fold:  the double chevron at its line's end, folding them all."
    },
    {
      name: "id",
      description:
        "The id chip (`Q7`), a link to the item, in its state's colour.  While the page is reviewed, an open " +
        "judgement call's or issue's chip is a button instead:  urgent (red) <-> not urgent (yellow)."
    },
    { name: "title", description: "The title." },
    {
      name: "review",
      description:
        "The review label:  `reviewed 10/6/26`, `deferred`, `to do`.  Not while the page is reviewed:  the review " +
        "buttons' tooltips say it then."
    },
    { name: "overnight", description: "With `overnight`:  the bed icon at the line's end, `made overnight`." },
    {
      name: "git",
      description:
        "With commits (`commits`, or `<epic-commit>` children):  a git icon at the line's end that shows or hides " +
        "this item's own commits, whatever the page's git toggle says (T17);  pressed while they show."
    },
    {
      name: "actions",
      description: "The box at the end of the line:  the git icon, the review label, then the review buttons."
    },
    { name: "details", description: "Its details:  hidden while folded." },
    { name: "label", description: "`Original question` / `Original reply` over its own text." },
    { name: "error", description: "With `source`:  the line saying the part couldn't be loaded." },
    ...REVIEW_PARTS
  ],
  states: [
    { name: "open", description: "Unfolded." },
    { name: "loaded", description: "With `source`:  the part is in its children." },
    { name: "error", description: "With `source`:  the part couldn't be loaded." },
    { name: "commits", description: "Its own commits show:  its git icon pressed." }
  ],
  texts: [
    { key: "fold", text: "Fold {id}", description: "Accessible name of the fold button while open." },
    { key: "unfold", text: "Unfold {id}", description: "Accessible name of the fold button while folded." },
    {
      key: "collapseAll",
      text: "Fold everything in {id}",
      description: "The collapse-all button's name and tooltip:  folds every card and panel in the item."
    },
    {
      key: "showCommits",
      text: "Show this item's commits",
      description: "The git icon's tooltip, its commits hidden."
    },
    { key: "hideCommits", text: "Hide this item's commits", description: "The git icon's tooltip, its commits shown." },
    { key: "originalQuestion", text: "Original question", description: "Over an answered question's own text." },
    { key: "originalReply", text: "Original reply", description: "Over an item's own text, above More Details." },
    { key: "reviewTodo", text: "to do", description: "Review label:  a review decided on work (`queued`)." },
    { key: "reviewDeferred", text: "deferred", description: "Review label:  put off (`deferred`)." },
    { key: "reviewed", text: "reviewed {date}", description: "Review label:  `reviewed 10/6/26`." },
    { key: "stateAttention", text: "Needs attention", description: "Id chip tooltip, `state=attention`." },
    {
      key: "stateReplied",
      text: "Claude answered:  your turn to pick",
      description: "Id chip tooltip, `state=replied`."
    },
    { key: "stateProgress", text: "Claude is working on it", description: "Id chip tooltip, `state=progress`." },
    { key: "stateOpen", text: "Open, still undecided", description: "Id chip tooltip, `state=open`." },
    { key: "stateRecent", text: "Decided or done", description: "Id chip tooltip, `state=recent`." },
    { key: "stateOld", text: "No longer relevant", description: "Id chip tooltip, `state=old`." },
    { key: "tipTodo", text: "to do:  {work}", description: "Id chip and review label tooltip:  the queued work." },
    { key: "tipReviewed", text: "reviewed {date}", description: "Id chip tooltip:  reviewed." },
    { key: "tipDeferred", text: "deferred {date}", description: "Id chip and review label tooltip:  deferred." },
    { key: "tipNotReviewed", text: "not reviewed yet", description: "Id chip tooltip:  open, never reviewed." },
    {
      key: "tipMakeCalm",
      text: "click:  not urgent",
      description: "Id chip tooltip while reviewed, an urgent judgement call or issue:  what a click does."
    },
    {
      key: "tipMakeUrgent",
      text: "click:  urgent",
      description: "Id chip tooltip while reviewed, a judgement call or issue that isn't urgent:  what a click does."
    },
    {
      key: "tipUrgencyUnsent",
      text: "not sent yet",
      description: "Id chip tooltip:  Owen changed its urgency, not sent yet."
    },
    {
      key: "tipMarkUnsent",
      text: "you chose {chosen} · not sent yet",
      description: "Id chip tooltip:  Owen's mark (the chosen button, `{chosen}`), not sent:  the chip dashed."
    },
    {
      key: "tipMarkSent",
      text: "you chose {chosen} · sent",
      description: "Id chip tooltip:  Owen's mark (the chosen button, `{chosen}`), sent:  the chip outlined."
    },
    { key: "tipPick", text: "pick {letter}", description: "Id chip tooltip:  Owen's pick, as `{chosen}`." },
    { key: "madeOvernight", text: "made overnight", description: "The bed icon's tooltip (`overnight`)." },
    { key: "sourceLoadError", text: "Couldn't load {source}.", description: "The part's fetch failed." },
    {
      key: "sourceCrossOrigin",
      text: "Can't load {source}:  only files from this site load.",
      description: "`source` is on another origin."
    },
    {
      key: "sourceFileProtocol",
      text: "Loads from {source} when opened (needs the page server).",
      description: "The page was opened from disk (`file://`):  parts need the page server, as today's docs say."
    },
    {
      key: "sourceRenderError",
      text: "Couldn't show {source}.",
      description: "The part arrived, but couldn't be shown."
    },
    ...REVIEW_NAME_TEXTS
  ],
  children: [
    { tag: "flow", slot: "title", max: 1, description: "A title with markup." },
    { tag: "epic-question", max: 1, description: "A question's text as first asked, before the rest of its text." },
    {
      tag: "flow",
      description:
        "Its text:  the question as asked, the call and why, the details;  with the prose elements (`flow`) " +
        "among it:  option cards (`<epic-choices>`, a question's own last, on any kind:  P14), labelled blocks " +
        '(`<epic-field label="Where">`), Net effect, code, asides, notes.'
    },
    { tag: "epic-answer", max: 1, description: "An answered question's answer." },
    { tag: "epic-more", max: 1, description: "More Details, added after its text." },
    { tag: "epic-reply", description: "Replies, oldest first." },
    {
      tag: "epic-status",
      slot: "status",
      description: "Claude's status cards, oldest first:  one per review mark Claude took (`plan-doc status`)."
    },
    { tag: "epic-original", max: 1, description: "Its earlier text, folded." },
    { tag: "epic-commit", description: "Commits that fixed or built it, oldest first." }
  ],
  childOrder: "listed"
} as const satisfies EpicVocabulary
