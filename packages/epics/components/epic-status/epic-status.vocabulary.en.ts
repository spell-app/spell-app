/**
 * Every name `<epic-status>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-status>`
 * Claude's status card on an item:  what Claude took Owen's review mark to mean, then that it's done.
 ****************/
export const epicStatusVocabulary = {
  tag: "epic-status",
  topics: ["documentation", "cards", "status"],
  aka: ["status", "underway", "done", "progress", "task", "work"],
  skeleton: null,
  noun: "status",
  ui: false,
  description:
    "Claude's status card on an item or an Overview sub-section (P13):  `Claude • Underway` (orange) with Claude's " +
    "reading of the task, then the same card `Claude • Done` (violet), the reading kept, a summary added when " +
    "there's something worth saying.  The heading and the date at its right are drawn;  the reading and the summary " +
    "are its children.",
  attributes: [
    {
      name: "state",
      kind: "enum",
      values: ["underway", "done"],
      // NOT `required`:  `<epic-item state>` is optional, and a key required on one tag and optional on another
      // makes `Markup.set()`'s untyped data `never`.  The tool always writes it
      description: "`underway` (orange:  Claude is on it;  absent too), `done` (violet:  finished)."
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
        "When it was done (a card that was underway first);  drawn in its place once there.  A card born done " +
        "(a pick or a todo `inbox apply` filed) has `at` alone."
    }
  ],
  events: [],
  slots: [
    { name: "", description: "The reading:  what Claude understood the task to be, in a sentence or two." },
    { name: "summary", description: "Once done, and only when worth saying:  what Owen should know about it." }
  ],
  parts: [
    { name: "base", description: "The card:  orange underway, violet done." },
    { name: "header", description: "Its heading band, a flex row:  `who` left, `date` right." },
    { name: "who", description: "The heading's left:  `Claude • Underway` / `Claude • Done`." },
    { name: "date", description: "The heading's right:  `done-at`, else `at`, as `10/8/26 14:34`;  never wraps." },
    { name: "body", description: "The reading." },
    { name: "summary", description: "The summary, under the reading;  not drawn without one." }
  ],
  states: [
    { name: "underway", description: "`state=underway`." },
    { name: "done", description: "`state=done`." }
  ],
  texts: [
    { key: "underway", text: "Claude • Underway", description: "The heading while Claude is on it." },
    { key: "done", text: "Claude • Done", description: "The heading once done." },
    {
      key: "started",
      text: "taken {date}",
      description: "The date's tooltip once done:  when Claude took the mark (`at`)."
    }
  ],
  children: [
    { tag: "flow", description: "The reading:  one or two sentences, no file names." },
    { tag: "flow", slot: "summary", description: 'The summary, once done:  `<p slot="summary">`, one or more.' }
  ]
} as const satisfies EpicVocabulary
