/**
 * Every name `<epic-phase>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type`, plus the fold pieces (`FOLD_*`) from `epic-section`'s types file, data too.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

// the fold pieces every folding block shares
import {
  FOLD_EVENTS,
  FOLD_OPEN_ATTRIBUTE,
  FOLD_PARTS,
  FOLD_STATES,
  FOLD_TEXTS
} from "$/epics/components/epic-section/EpicSection.types"

/****************
 * ### `<epic-phase>`
 * One phase of the plan, in `<epic-section kind="phases">`.
 ****************/
export const epicPhaseVocabulary = {
  tag: "epic-phase",
  topics: ["documentation", "progress", "containers"],
  aka: ["phase", "milestone", "step", "stage"],
  noun: "phase",
  ui: false,
  description:
    "One phase of the plan:  its status icon and estimate in its title line;  its fields (Symptom, Changes, Goal, " +
    "Done, Files, Verify, To review), plan updates and commits as children, in that order.",
  attributes: [
    {
      name: "id",
      property: "epicId",
      kind: "string",
      required: true,
      format: "phase id",
      description: "`p1`, `p2` ...:  shown as `P2 · <title>`;  links use it (`#p2`)."
    },
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      required: "or slot",
      description: "Its short name, 2-4 words, WITHOUT its id (`Saved Replies`, drawn as `P1 · Saved Replies`)."
    },
    {
      name: "status",
      kind: "enum",
      values: ["todo", "active", "done"],
      required: true,
      description: "`todo`, `active` (one at a time, orange) or `done` (green)."
    },
    {
      name: "estimate",
      kind: "string",
      description:
        "Wall-clock time for Claude to do it, agents included, Owen's review not:  `30m`, `2h`, `1h30m`, `1-2h`."
    },
    {
      name: "source",
      kind: "string",
      description: "Its body's part file (`parts/p2.html`), loaded into its children when it opens."
    },
    {
      name: "part-ids",
      kind: "string",
      format: "ids",
      description: "The ids inside its part file:  a link to one loads the body first, then lands."
    },
    { name: "commits", kind: "boolean", description: "Its body lists commits (the page's git buttons)." },
    FOLD_OPEN_ATTRIBUTE
  ],
  events: [...FOLD_EVENTS],
  slots: [
    { name: "", description: "Its fields, plan updates and commits." },
    { name: "title", description: "A title with markup, in place of `title`." }
  ],
  parts: [...FOLD_PARTS, { name: "status", description: "Its status icon, in its status's colour." }],
  states: [...FOLD_STATES],
  texts: [
    ...FOLD_TEXTS,
    { key: "todo", text: "To do", description: "The status icon's name:  `todo`." },
    { key: "active", text: "Under way", description: "The status icon's name:  `active`." },
    { key: "done", text: "Done", description: "The status icon's name:  `done`." }
  ],
  children: [
    { tag: "flow", slot: "title", max: 1, description: "A title with markup." },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["symptom"] },
      max: 1,
      description: "Symptom:  what's wrong today, one line."
    },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["changes"] },
      max: 1,
      description: "Changes:  what changes, two or three lines."
    },
    { tag: "epic-updated", description: "Changes to the phase's plan, one dated line each, oldest first." },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["goal"] },
      max: 1,
      description: "Goal:  a bullet per outcome."
    },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["done"] },
      max: 1,
      description: "Done:  what was built, once done."
    },
    { tag: "epic-commit", description: "Its commits, oldest first." },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["files"] },
      max: 1,
      description: "Files:  what changes."
    },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["verify"] },
      max: 1,
      description: "Verify:  how we know it worked."
    },
    {
      tag: "epic-field",
      where: { attribute: "name", values: ["to-review"] },
      max: 1,
      description: "To review:  the items added during it still open and not reviewed (written by the script)."
    }
  ],
  childOrder: "listed"
} as const satisfies EpicVocabulary
