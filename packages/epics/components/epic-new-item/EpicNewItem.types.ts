/**
 * Loose types and constants of the `epic-new-item` family:  NEW ITEMS from the page (epic `airplane` P2).
 * - Data only:  nothing here runs.  `<epic-section>` reads it too:  it lists the new items waiting to be made.
 */

import type { NewKind } from "$/epics/review"

import type { epicNewItemVocabulary } from "./EpicNewItem.en"

/** `epicNewItemVocabulary`'s type. */
export type EpicNewItemVocabulary = typeof epicNewItemVocabulary

/** The kinds of new item, as its `adds` attribute takes them. */
export const NEW_ITEM_KINDS = ["todo", "question"] as const satisfies readonly NewKind[]

/**
 * Each kind of new item Owen may ask for from the page:
 * - `icon`
 * - its words' keys:
 *   - `label`:  its name, on the form's kind button and on its waiting card
 *   - `add`:  on its section's button
 * - `section`:  the section it lands in
 */
export const NEW_KIND_LOOKS = {
  todo: { icon: "list check", label: "newTodo", add: "addTodo", section: "todos" },
  question: { icon: "circle question", label: "newQuestion", add: "addQuestion", section: "questions" }
} as const satisfies Record<
  NewKind,
  {
    icon: string
    label: (typeof NEW_KIND_TEXTS)[number]["key"]
    add: (typeof NEW_ITEM_TEXTS)[number]["key"]
    section: string
  }
>

/** Class names inside the shadow root (`EpicNewItem.css`). */
export const NEW_BUTTON = "new-button"
export const NEW_FORM = "new-form"
export const NEW_KINDS_GROUP = "new-kinds"
export const NEW_INPUT = "new-input"
export const NEW_ACTIONS = "new-actions"

/**
 * The event an `<epic-new-item>` sends as its form closes, saved or cancelled:
 * `<epic-page>`, which opened it from its toolbar, lets go of it.
 */
export const NEW_CLOSED = "epic-new-closed"

////////////////
// ## In the vocabularies
////////////////

/** The kinds' names:  `<epic-new-item>`'s (its form's kind buttons), and `<epic-section>`'s (its waiting cards). */
export const NEW_KIND_TEXTS = [
  { key: "newTodo", text: "Todo", description: "Kind:  a todo." },
  { key: "newQuestion", text: "Question", description: "Kind:  a question." }
] as const

/** The rest of `<epic-new-item>`'s texts. */
export const NEW_ITEM_TEXTS = [
  { key: "newButton", text: "New todo or question", description: "The button's words without `adds`." },
  { key: "addTodo", text: "New todo", description: "The Todos section's button, at its end." },
  { key: "addQuestion", text: "New question", description: "The Questions section's button, at its end." },
  { key: "newForm", text: "A new todo or question, for Claude to add", description: "The form, for a screen reader." },
  { key: "newKind", text: "What it is", description: "The form's kind buttons, for a screen reader." },
  { key: "newTitle", text: "Title:  what to do, or what to ask", description: "The title field's placeholder." },
  {
    key: "newNote",
    text: "More, if it helps:  why, what you know, what to check",
    description: "The note field's placeholder."
  },
  {
    key: "newNear",
    text: "About (an id, if any):  P3, Q7, O1, summary",
    description: "The about field's placeholder."
  },
  { key: "newAdd", text: "Add", description: "The form's button:  a new one." },
  { key: "newSave", text: "Save", description: "The form's button:  one being changed." },
  { key: "newCancel", text: "Cancel", description: "The form's button:  closes it, nothing saved." },
  { key: "newNeedsTitle", text: "Give it a title first", description: "Add pressed with no title." }
] as const

/** The waiting cards' texts:  `<epic-section>`'s (a Todos or Questions section lists them). */
export const NEW_LIST_TEXTS = [
  { key: "newUnsent", text: "not sent yet:  Send hands it to Claude", description: "A pending new item, not sent." },
  {
    key: "newSent",
    text: "sent:  Claude adds it at the next review",
    description: "A pending new item, sent, not made yet."
  },
  { key: "newAbout", text: "About {id}", description: "A pending new item's link to what it's about." },
  { key: "newEdit", text: "Edit", description: "A pending new item's button:  back into the form." },
  { key: "newRemove", text: "Remove", description: "A pending new item's button:  gone, never made." }
] as const
