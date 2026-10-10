/**
 * Every name `<ui-brand-check>` uses:  tag, attributes, events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary`.
 * - Pure data:  `import type` only.
 * - No class words from attributes:  the component adds its state (`check done`, `check active checkable`).
 * - Chosen state:  `selected` is canonical (Spell UI's rule);  `checked` is another name for it, as on `<ui-checkbox>`:
 *   the DOM element's `checked` PROPERTY reads and writes `selected`, and a `checked` ATTRIBUTE in markup ticks it.
 *   The DOM element's class, `DOMBrandCheckElement`, owns that name:  it is no vocabulary attribute.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-brand-check>`
 * One line of a checklist:  a round mark (done, active or pending) and its text.
 ****************/
export const brandCheckVocabulary = {
  tag: "ui-brand-check",
  topics: ["lists", "progress", "selection", "controls"],
  aka: ["check item", "to-do", "todo", "task", "habit", "progress step", "check mark"],
  noun: "check",
  ui: false,
  description: "A brand check is one line of a checklist:  a round mark, filled with a check once done, and its text.",
  attributes: [
    {
      name: "state",
      kind: "enum",
      values: ["done", "active", "pending"],
      default: "pending",
      description:
        "Progress:  `done` (filled, a check), `active` (soft, pulsing) or `pending` (an empty ring, subtle text).  " +
        "A checklist's `step` overrides it."
    },
    {
      name: "selected",
      kind: "boolean",
      description:
        "Ticked:  done.  What a `checkable` check toggles;  `ui-change` first.  Alias:  `checked` (attribute and " +
        "property)."
    },
    {
      name: "checkable",
      kind: "boolean",
      description:
        "A checkbox the user ticks (click, Space, Enter):  done once ticked, the text struck through.  Inherited " +
        "from a `checkable` checklist."
    },
    {
      name: "font",
      kind: "enum",
      values: ["sans", "serif"],
      description: "Text:  `sans` (14px) or `serif` (15px);  default the checklist's, else `sans`."
    }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ selected: boolean, checked: boolean, originalEvent?: Event }",
      description: "The user ticked or unticked a `checkable` check (`checked` ~== `selected`)."
    }
  ],
  slots: [{ name: "", description: "The text." }],
  parts: [
    { name: "check", description: "The line:  a `<button role=checkbox>` when `checkable`, else a box." },
    { name: "marker", description: "The round mark." },
    { name: "label", description: "The text's box." }
  ],
  states: [
    { name: "done", description: "Done (or ticked)." },
    { name: "active", description: "The step in progress." },
    { name: "pending", description: "Not started (or not ticked)." },
    { name: "checkable", description: "A checkbox the user ticks." }
  ],
  texts: [
    {
      key: "done",
      text: "done",
      description: "Visually hidden after a done step's text:  the mark alone says nothing."
    },
    { key: "active", text: "in progress", description: "Visually hidden after the active step's text." }
  ]
} as const satisfies E.ComponentVocabulary
