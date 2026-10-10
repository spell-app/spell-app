/**
 * Every name `<epic-status>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-status>`
 * Claude's status card on an item:  what Claude took Owen's review mark to mean,
 * then that it's done (work was done) or noted (Owen's choice recorded).
 ****************/
export const epicStatusVocabulary = {
  tag: "epic-status",
  topics: ["documentation", "cards", "status"],
  aka: ["status", "underway", "done", "noted", "progress", "task", "work"],
  noun: "status",
  ui: false,
  description:
    "Claude's status card on an item or an Overview sub-section (P13):  `Claude • Underway` (blue) with Claude's " +
    "reading of the task, then the same card `Claude • Done` (green) when work was done, the reading kept, a " +
    "summary added when there's something worth saying.  `Claude • Noted` (a calm outline) when Claude only " +
    "recorded what Owen chose (a pick, a todo made or queued):  what was recorded and what happens next.  The " +
    "heading and the date at its right are drawn;  the reading and the summary are its children.",
  attributes: [
    {
      name: "state",
      kind: "enum",
      values: ["underway", "done", "noted"],
      // NOT `required`:  `<epic-item state>` is optional, and a key required on one tag and optional on another
      // makes `Markup.set()`'s untyped data `never`.  The tool always writes it
      description:
        "`underway` (blue:  Claude is on it;  absent too), `done` (green:  work was done), `noted` (a calm " +
        "outline:  Claude recorded what Owen chose, nothing built yet;  Owen, 2026-10-10)."
    },
    {
      name: "at",
      kind: "string",
      format: "time",
      required: true,
      description: "When Claude took the mark:  `2026-10-08 14:34`, drawn `10/8/26 14:34` (`PlanDates`)."
    },
    {
      name: "done-at",
      kind: "string",
      format: "time",
      description:
        "When it was done or noted (a card that was underway first);  drawn in its place once there.  A card born " +
        "noted (a pick or a todo `inbox apply` recorded) has `at` alone."
    }
  ],
  events: [],
  slots: [
    {
      name: "",
      description:
        "The reading:  what Claude understood the task to be, in a sentence or two;  a card born noted:  what was " +
        "recorded and what happens next, in one line."
    },
    { name: "summary", description: "Once done, and only when worth saying:  what Owen should know about it." }
  ],
  parts: [
    { name: "base", description: "The card:  blue underway, green done, a calm outline noted." },
    {
      name: "header",
      description: "Its heading band, a flex row:  the fold chevron, `who` left, `date` right;  a click folds it."
    },
    { name: "toggle", description: "The fold chevron, a `<button>`, first in the band:  folds reading and summary." },
    { name: "who", description: "The heading's left:  `Claude • Underway` / `Claude • Done` / `Claude • Noted`." },
    { name: "date", description: "The heading's right:  `done-at`, else `at`, as `10/8/26 14:34`;  never wraps." },
    { name: "body", description: "The reading." },
    { name: "summary", description: "The summary, under the reading;  not drawn without one." }
  ],
  states: [
    { name: "underway", description: "`state=underway`." },
    { name: "done", description: "`state=done`." },
    { name: "noted", description: "`state=noted`." },
    { name: "open", description: "Unfolded:  it starts so (page state, never written)." }
  ],
  texts: [
    { key: "underway", text: "Claude • Underway", description: "The heading while Claude is on it." },
    { key: "done", text: "Claude • Done", description: "The heading once work was done." },
    { key: "noted", text: "Claude • Noted", description: "The heading once Claude recorded what Owen chose." },
    {
      key: "started",
      text: "taken {date}",
      description: "The date's tooltip once done or noted:  when Claude took the mark (`at`)."
    }
  ],
  children: [
    { tag: "flow", description: "The reading:  one or two sentences, no file names." },
    { tag: "flow", slot: "summary", description: 'The summary, once done:  `<p slot="summary">`, one or more.' }
  ]
} as const satisfies EpicVocabulary
