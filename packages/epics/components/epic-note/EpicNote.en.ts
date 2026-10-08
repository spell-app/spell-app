/**
 * Every name `<epic-note>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-note>`
 * A small UPDATE or DONE note in a plan doc's prose.
 ****************/
export const epicNoteVocabulary = {
  tag: "epic-note",
  topics: ["documentation", "messages", "status"],
  aka: ["note", "update", "done", "callout", "notice", "flag"],
  noun: "note",
  ui: false,
  description:
    "A small note in prose, by `state`:  `update`, an orange card headed `UPDATE` (changed since you looked);  " +
    "`done`, a green one headed `DONE`.  `title` follows the label (`UPDATE · partly fixed by J9, 2026-10-06`);  " +
    "the note is its children.  Not `<epic-update>`, which belongs to a phase and goes when it's done:  this one " +
    "stays.  Replaces the old hand-written `ui-message.plan-update`.",
  attributes: [
    {
      name: "state",
      kind: "enum",
      values: ["update", "done"],
      required: true,
      description: "`update` (orange:  changed since you looked) or `done` (green:  decided or done)."
    },
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      description: "After the label, WITHOUT it:  `partly fixed by J9, 2026-10-06`.  None:  the label alone."
    }
  ],
  events: [],
  slots: [{ name: "", description: "The note." }],
  parts: [
    { name: "base", description: "The card:  orange (`update`) or green (`done`)." },
    { name: "header", description: "Its heading:  the label, then the title." },
    { name: "label", description: "`UPDATE` or `DONE`." },
    { name: "body", description: "The note;  not drawn when empty." }
  ],
  states: [],
  texts: [
    { key: "update", text: "UPDATE", description: "The label of an `update` note." },
    { key: "done", text: "DONE", description: "The label of a `done` note." }
  ],
  children: [{ tag: "flow", description: "The note." }],
  flow: true
} as const satisfies EpicVocabulary
