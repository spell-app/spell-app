/**
 * Every name `<epic-event>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-event>`
 * One line of the plan's log.
 ****************/
export const epicEventVocabulary = {
  tag: "epic-event",
  topics: ["documentation", "lists", "date & time"],
  aka: ["log line", "event", "history", "changelog entry"],
  skeleton: null,
  noun: "event",
  ui: false,
  description:
    'One line of the log (`<epic-section kind="log">`):  its time and icon are drawn;  its text is its children.',
  attributes: [
    {
      name: "at",
      kind: "string",
      required: true,
      format: "time",
      description: "When, local time with offset (`2026-10-06T08:12-04:00`):  shown as `2026-10-06 08:12`."
    },
    { name: "icon", kind: "string", description: "Its icon, a Spell UI icon name;  default `pen to square`." }
  ],
  events: [],
  slots: [{ name: "", description: "What happened, one line." }],
  parts: [{ name: "base", description: "The line." }],
  states: [],
  texts: [],
  children: [{ tag: "flow", description: "What happened, one line." }]
} as const satisfies EpicVocabulary
