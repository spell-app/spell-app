/**
 * Every name `<epic-new-item>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type`, plus its texts and value lists from its types file, data too.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

import { NEW_ITEM_KINDS, NEW_ITEM_TEXTS, NEW_KIND_TEXTS } from "./EpicNewItem.types"

/****************
 * ### `<epic-new-item>`
 * A new todo or question, asked for from the page while it's reviewed (epic `airplane` P2):  its button and its form.
 ****************/
export const epicNewItemVocabulary = {
  tag: "epic-new-item",
  topics: ["forms", "buttons"],
  aka: ["new item", "new todo", "new question", "add todo", "add question", "ask"],
  skeleton: "inline 1 x 1",
  noun: "new item",
  ui: false,
  description:
    "A new todo or question Owen asks for while he reads (epic `airplane` P2), drawn by `<epic-page>` (its header's " +
    "`+`) and a Todos or Questions `<epic-section>` (at its end), never written in a doc:  a button, and while " +
    "`open`, the form.  What's asked for is a mark in the review inbox, made into an item by `plan-doc inbox apply`.",
  attributes: [
    {
      name: "open",
      kind: "boolean",
      description: "The form shows.  Its button sets it;  saving or cancelling the form clears it."
    },
    {
      name: "adds",
      kind: "enum",
      values: NEW_ITEM_KINDS,
      description:
        "A section's own kind:  the form starts on it, and the button says it (`New todo`, `New question`).  " +
        "Without it:  the form starts on a todo."
    },
    { name: "near", kind: "string", description: "What the form's About starts with:  an id (`p3`)." },
    {
      name: "editing",
      kind: "string",
      description: "The key of a waiting new item (`new1`):  the form changes it (Save) instead of adding one."
    },
    {
      name: "compact",
      kind: "boolean",
      description:
        "The page header's:  a round `+` named by its tooltip, which stays while the form is open, and the element " +
        "is `display: contents`, so the page places the button and the form (`::part(form)`) in its own row.  " +
        "Without it:  the `+` and its words, which the form takes the place of while open."
    }
  ],
  events: [],
  slots: [],
  parts: [
    { name: "base", description: "Its button and form." },
    { name: "button", description: "The button that opens the form:  a round `+`, or the `+` and its words." },
    { name: "form", description: "The form:  todo or question, its title, a note, what it's about, Add and Cancel." }
  ],
  states: [{ name: "open", description: "The form shows." }],
  texts: [...NEW_KIND_TEXTS, ...NEW_ITEM_TEXTS],
  children: []
} as const satisfies EpicVocabulary
