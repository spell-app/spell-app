/**
 * Every name `<epic-field>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-field>`
 * One named field of a phase (Symptom, Changes, Goal ...), or a labelled block in prose (`Where:`).
 ****************/
export const epicFieldVocabulary = {
  tag: "epic-field",
  topics: ["documentation", "content parts"],
  aka: ["field", "goal", "symptom", "verify", "labelled block", "where", "step"],
  noun: "field",
  ui: false,
  description:
    "One field of a phase, by `name`:  its icon and label are drawn;  its prose is its children.  In an item's " +
    'prose (anywhere prose goes), a labelled block by `label` instead:  `<epic-field label="Where">` draws `Where:` ' +
    "before its prose, no icon (epic `epic-components` P14).",
  attributes: [
    {
      name: "name",
      kind: "enum",
      values: ["symptom", "changes", "goal", "done", "files", "verify", "to-review"],
      description:
        "A phase's field (every field in a phase has one):  `symptom` (one line), `changes` (two or three), `goal` " +
        "(a bullet per outcome), `done` (what was built), `files`, `verify` (both hidden until the Phases title's " +
        "toggles), `to-review` (the script's)."
    },
    {
      name: "label",
      kind: "string",
      description:
        "A labelled block's label, WITHOUT its colon (drawn):  `Where`, `What should happen`, `Step`.  For a field " +
        "in prose, never in a phase:  a field has `name` or `label`."
    }
  ],
  events: [],
  slots: [{ name: "", description: "The field's prose." }],
  parts: [
    { name: "base", description: "The field:  its icon column, then its label and prose." },
    { name: "icon", description: "Its icon, centred on its first line:  none on a labelled block." },
    { name: "label", description: "Its label:  `Symptom:`, `Where:` ..." }
  ],
  states: [],
  texts: [
    { key: "symptom", text: "Symptom:" },
    { key: "changes", text: "Changes:" },
    { key: "goal", text: "Goal:" },
    { key: "done", text: "Done:" },
    { key: "files", text: "Files:" },
    { key: "verify", text: "Verify:" },
    { key: "toReview", text: "To review:" },
    { key: "labelled", text: "{label}:", description: "A labelled block's label (`label`)." }
  ],
  children: [{ tag: "flow", description: "The field's prose." }],
  flow: true
} as const satisfies EpicVocabulary
