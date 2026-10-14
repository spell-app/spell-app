/**
 * Every name `<epic-choice-row>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-choice-row>`
 * One row of a syntax-choices page:  a use site, and the box holding Claude's recommendation for it.
 ****************/
export const epicChoiceRowVocabulary = {
  tag: "epic-choice-row",
  topics: ["tables", "forms"],
  aka: ["syntax choice", "rename", "name choice", "row"],
  noun: "choice row",
  ui: false,
  description:
    "One row of a syntax-choices page (epic `epic-workflow` P12), in an `<epic-choice-rows>`:  the use site " +
    "(File, opening VS Code at the line), what it's for, how it reads today, and a box pre-filled with Claude's " +
    "recommendation.  Owen types over it, or leaves it;  a changed box is orange, with a round button putting " +
    "the recommendation back.",
  attributes: [
    {
      name: "name",
      kind: "string",
      required: true,
      description: "Its id in the rows file (`q1-UISection-169`):  its box's key in the draft and the answer."
    },
    {
      name: "file",
      kind: "string",
      description: "Its file, from the repo's root:  the File cell opens it in VS Code."
    },
    { name: "line", kind: "number", description: "Its line in `file`, from 1." },
    { name: "purpose", kind: "string", description: "What it's for, in words a reader new to it follows." },
    {
      name: "note",
      kind: "string",
      description: "A short why, small, under the purpose;  `` `code` `` in it shows as code."
    },
    { name: "current", kind: "string", description: "How the use site reads today (`this.isOpen()`)." },
    {
      name: "recommended",
      kind: "string",
      description: "Claude's call, the box's starting text;  the same as `current` for a row that stays."
    }
  ],
  events: [],
  slots: [],
  parts: [
    { name: "base", description: "Its cells, laid out on its table's columns." },
    {
      name: "file",
      description: "The File cell:  the file's name and line, a link into VS Code;  its folder under it."
    },
    { name: "purpose", description: "The Purpose cell:  the purpose, `stays` when it stays, the note." },
    { name: "current", description: "The Current cell:  today's text, as code." },
    { name: "pick", description: "The Recommended cell:  the box, and the reset button once it differs." },
    { name: "box", description: "The `<textarea>`:  one line of text, wrapping and growing;  Enter adds no line." },
    { name: "reset", description: "The round button putting the recommendation back." }
  ],
  states: [
    { name: "changed", description: "Its box differs from the recommendation:  orange." },
    { name: "stays", description: "Claude recommends no change." }
  ],
  texts: [
    { key: "stays", text: "stays", description: "The tag after a purpose whose row stays." },
    { key: "boxLabel", text: "Recommended for {current}", description: "The box's name, for a screen reader." },
    { key: "reset", text: "Back to the recommendation", description: "The reset button's name." },
    { key: "resetTip", text: "Back to {recommended}", description: "The reset button's tooltip." },
    { key: "openTip", text: "Open {file}:{line} in VS Code", description: "The file link's tooltip." }
  ],
  children: []
} as const satisfies EpicVocabulary
