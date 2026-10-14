/**
 * Every name `<epic-choice-rows>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-choice-rows>`
 * One section's table on a syntax-choices page:  its column heads, then its `<epic-choice-row>`s.
 ****************/
export const epicChoiceRowsVocabulary = {
  tag: "epic-choice-rows",
  topics: ["tables", "forms"],
  aka: ["syntax choices", "names table", "rename table", "choices table"],
  skeleton: "8 tall",
  noun: "choice rows",
  ui: false,
  description:
    "One section's table on a syntax-choices page (epic `epic-workflow` P12):  the column heads File | Purpose | " +
    "Current | Recommended, then its rows, each an `<epic-choice-row>` whose Recommended box Owen types over.  " +
    "It counts its section's rows on the section's title (`3 to rename · 1 stay · 1 changed`).  Under 720px it " +
    "scrolls inside its own box.",
  attributes: [
    {
      name: "stacked",
      kind: "boolean",
      description: "Current and Recommended in ONE column, Syntax:  today's text over the box (`stacked: true`)."
    },
    {
      name: "no-file",
      kind: "boolean",
      description:
        "No File column (`fileColumn: false`):  for rows whose place in the code doesn't matter to the reader."
    }
  ],
  events: [],
  slots: [{ name: "", description: "Its rows, `<epic-choice-row>`s, in order." }],
  parts: [
    { name: "base", description: "The box that scrolls sideways when narrow." },
    { name: "table", description: "The grid:  the heads, then the rows." },
    { name: "head", description: "The column heads' row." }
  ],
  states: [],
  texts: [
    { key: "file", text: "File", description: "The File column's head." },
    { key: "purpose", text: "Purpose", description: "The Purpose column's head." },
    { key: "current", text: "Current", description: "The Current column's head." },
    { key: "recommended", text: "Recommended", description: "The Recommended column's head." },
    { key: "syntax", text: "Syntax:  today, then yours", description: "The one column of `stacked`." },
    {
      key: "count",
      text: "{renames} to rename · {stay} stay",
      description: "Its section's badge:  the rows Claude would change, and those he'd keep."
    },
    {
      key: "countChanged",
      text: "{count} · {changed} changed",
      description: "Its section's badge, once Owen changed some."
    }
  ],
  children: [{ tag: "epic-choice-row", description: "Its rows." }]
} as const satisfies EpicVocabulary
