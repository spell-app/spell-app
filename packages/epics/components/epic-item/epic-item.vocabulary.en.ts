/**
 * Every name `<epic-item>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-item>`
 * One item of a plan doc:  a question, judgement call, caveat, todo, issue or test.
 ****************/
export const epicItemVocabulary = {
  tag: "epic-item",
  topics: ["documentation", "lists", "status"],
  aka: ["item", "question", "decision", "judgement call", "caveat", "todo", "issue", "test", "ticket"],
  skeleton: null,
  noun: "item",
  ui: false,
  description:
    "One item:  a question, judgement call, caveat, todo, issue or test -- ONE element for every kind, the kind " +
    "its id's letter (Q11).  Its line (id chip in its state's colour, title, review label) is drawn;  its details, " +
    "choices, answer, replies, earlier versions and commits are its children.",
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
      values: ["attention", "progress", "open", "recent", "old"],
      description:
        "Its id chip's colour, written by the script on every edit:  `attention` (red:  needs Owen), `progress` " +
        "(orange:  queued or being worked), `open` (blue), `recent` (green:  closed or reviewed lately), `old` (grey)."
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
      values: ["approve", "todo", "revisit"],
      description: "How Owen's review mark was applied:  its button stays outlined in that colour."
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
      description: "Changed during a `/bedtime` run:  `recent` until reviewed."
    },
    {
      name: "source",
      kind: "string",
      description:
        "Its details' part file (`parts/q7.htm`), loaded into its children the first time it opens (its children " +
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
    { name: "actions", description: "Controls at the end of its line:  the review buttons (P9).  Page state only." },
    { name: "note", description: "Under its details, last:  the note box (P9).  Page state only." }
  ],
  parts: [
    { name: "base", description: "The item." },
    { name: "line", description: "Its line:  fold button, id chip, title, review label, actions;  sticky while open." },
    { name: "toggle", description: "The fold `<button>` (the chevron), on an item with details." },
    { name: "id", description: "The id chip (`Q7`), a link to the item, in its state's colour." },
    { name: "title", description: "The title." },
    { name: "review", description: "The review label:  `reviewed 10-06`, `deferred`, `to do`." },
    { name: "actions", description: "The box at the end of the line around the `actions` slot." },
    { name: "details", description: "Its details:  hidden while folded." },
    { name: "label", description: "`Original question` / `Original reply` over its own text." },
    { name: "error", description: "With `source`:  the line saying the part couldn't be loaded." }
  ],
  states: [
    { name: "open", description: "Unfolded." },
    { name: "loaded", description: "With `source`:  the part is in its children." },
    { name: "error", description: "With `source`:  the part couldn't be loaded." }
  ],
  texts: [
    { key: "fold", text: "Fold {id}", description: "Accessible name of the fold button while open." },
    { key: "unfold", text: "Unfold {id}", description: "Accessible name of the fold button while folded." },
    { key: "originalQuestion", text: "Original question", description: "Over an answered question's own text." },
    { key: "originalReply", text: "Original reply", description: "Over an item's own text, above More Details." },
    { key: "reviewTodo", text: "to do", description: "Review label:  a review decided on work (`queued`)." },
    { key: "reviewDeferred", text: "deferred", description: "Review label:  put off (`deferred`)." },
    { key: "reviewed", text: "reviewed {date}", description: "Review label:  `reviewed 10-06`." },
    { key: "stateAttention", text: "Needs attention", description: "Id chip tooltip, `state=attention`." },
    { key: "stateProgress", text: "In progress", description: "Id chip tooltip, `state=progress`." },
    { key: "stateOpen", text: "Open, not urgent", description: "Id chip tooltip, `state=open`." },
    { key: "stateRecent", text: "Decided or reviewed recently", description: "Id chip tooltip, `state=recent`." },
    { key: "stateOld", text: "Decided or reviewed earlier", description: "Id chip tooltip, `state=old`." },
    { key: "tipTodo", text: "to do:  {work}", description: "Id chip and review label tooltip:  the queued work." },
    { key: "tipReviewed", text: "reviewed {date}", description: "Id chip tooltip:  reviewed." },
    { key: "tipDeferred", text: "deferred {date}", description: "Id chip and review label tooltip:  deferred." },
    { key: "tipNotReviewed", text: "not reviewed yet", description: "Id chip tooltip:  open, never reviewed." },
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
    }
  ],
  children: [
    { tag: "flow", slot: "title", max: 1, description: "A title with markup." },
    { tag: "flow", description: "Its text:  the question as asked, the call and why, the details." },
    { tag: "epic-choices", max: 1, description: "A question's option cards." },
    { tag: "epic-answer", max: 1, description: "An answered question's answer." },
    { tag: "epic-more", max: 1, description: "More Details, added after its text." },
    { tag: "epic-reply", description: "Replies, oldest first." },
    { tag: "epic-original", max: 1, description: "Its earlier text, folded." },
    { tag: "epic-commit", description: "Commits that fixed or built it, oldest first." }
  ],
  childOrder: "listed"
} as const satisfies EpicVocabulary
