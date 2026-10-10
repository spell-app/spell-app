/**
 * Every name `<ui-brand-checklist>` uses:  tag, attributes, slots, parts, texts.  Schema:  `E.ComponentVocabulary`.
 * - Pure data:  `import type` only.
 * - No class words:  every attribute is a plain property (`number`, `boolean`, `enum`).
 * - Owner of its `<ui-brand-check>`s (`ownsParts:  check`):  each asks it how to show (`ChecklistOwner`).
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-brand-checklist>`
 * A list of `<ui-brand-check>`s:  a build's progress (`step`), or things to tick off (`checkable`).
 ****************/
export const brandChecklistVocabulary = {
  tag: "ui-brand-checklist",
  topics: ["lists", "progress", "status", "selection"],
  aka: ["checklist", "to-do list", "todo list", "task list", "progress list", "habit list", "stepper"],
  skeleton: "6 tall",
  noun: "checklist",
  ui: false,
  description:
    "A brand checklist shows a build's progress step by step, or a list of things to tick off, each with a round mark.",
  attributes: [
    {
      name: "step",
      kind: "number",
      description:
        "Progress:  checks before index `step` (from 0) are done, the one at `step` is active, the rest pending;  " +
        "`step` at or past the last check marks them all done.  Unset:  each check's own `state`."
    },
    {
      name: "checkable",
      kind: "boolean",
      description: "Every check is a checkbox the user ticks (click, Space, Enter);  `step` is ignored."
    },
    {
      name: "font",
      kind: "enum",
      values: ["sans", "serif"],
      default: "sans",
      description:
        "Text:  `sans` (14px, 20px marks, the build progress) or `serif` (15px, 19px marks, the phone's habits)."
    }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-brand-check>`s." }],
  parts: [
    { name: "list", description: "The list box (`role=list`)." },
    { name: "status", description: "The visually hidden live region announcing progress." }
  ],
  states: [],
  texts: [
    {
      key: "stepDone",
      text: "{label} done",
      description: "Announced when `step` moves past a check;  `{label}` is its text."
    },
    { key: "allDone", text: "All done", description: "Announced when `step` reaches the end." }
  ],
  ownsParts: ["check"]
} as const satisfies E.ComponentVocabulary
