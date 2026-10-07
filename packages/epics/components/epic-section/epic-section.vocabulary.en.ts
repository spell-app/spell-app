/**
 * Every name `<epic-section>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 * - `kind`'s values are `SectionIds`' keys plus `overview-part`:  `Definitions.test.ts` checks they agree.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-section>`
 * One section of a plan doc:  Phases, Questions ... Log, or one of the Overview's sub-sections.
 ****************/
export const epicSectionVocabulary = {
  tag: "epic-section",
  topics: ["documentation", "containers", "layout"],
  aka: ["section", "chapter", "panel"],
  skeleton: null,
  noun: "section",
  ui: false,
  description:
    "One section of a plan doc, by `kind`:  its phases, its items or its log;  or, inside `<epic-overview>`, one " +
    "of the Overview's sub-sections (`overview-part`), which gets review notes as items do.",
  attributes: [
    {
      name: "id",
      property: "epicId",
      kind: "string",
      required: true,
      format: "anchor",
      description:
        "Its id, which links use:  FIXED per kind (`phases`, `decisions` for Questions ...);  `o1`, `o2` ... for " +
        "an Overview sub-section."
    },
    {
      name: "kind",
      kind: "enum",
      values: ["overview-part", "phases", "questions", "judgements", "caveats", "todos", "issues", "tests", "log"],
      required: true,
      description:
        "What it holds:  `phases` its `<epic-phase>`s;  `questions` ... `tests` its `<epic-item>`s;  `log` its " +
        "`<epic-event>`s;  `overview-part` prose."
    },
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      description:
        "An Overview sub-section's title, WITHOUT its number (`Structure`, drawn as `1.1 Structure`):  required " +
        'there (or a `slot="title"` child, for a title with markup).  The page\'s sections draw their own.'
    },
    {
      name: "source",
      kind: "string",
      description: "Its body's part file (`parts/o3.htm`, `parts/log.htm`), loaded into its children when it opens."
    },
    {
      name: "part-ids",
      kind: "string",
      format: "ids",
      description: "The ids inside its part file:  a link to one loads the body first, then lands."
    }
  ],
  events: [],
  slots: [
    { name: "", description: "Its phases, items, log events or prose." },
    { name: "title", description: "A title with markup, in place of `title`." }
  ],
  parts: [{ name: "base", description: "The section." }],
  states: [],
  texts: [],
  children: [
    { tag: "flow", slot: "title", max: 1, description: "A title with markup." },
    {
      tag: "flow",
      when: { attribute: "kind", values: ["overview-part"] },
      description: "An Overview sub-section's prose."
    },
    { tag: "epic-phase", when: { attribute: "kind", values: ["phases"] }, description: "The phases, in order." },
    {
      tag: "epic-item",
      when: { attribute: "kind", values: ["questions", "judgements", "caveats", "todos", "issues", "tests"] },
      description: "The items, their id's letter the section's (`q` in Questions)."
    },
    { tag: "epic-event", when: { attribute: "kind", values: ["log"] }, description: "The log, oldest first." }
  ]
} as const satisfies EpicVocabulary
