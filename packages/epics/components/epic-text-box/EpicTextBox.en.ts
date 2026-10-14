/**
 * Every name `<epic-text-box>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type` only.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

/****************
 * ### `<epic-text-box>`
 * A box Owen types in, on a page he answers on:  the page's notes, a comment, Other, the feedback.
 ****************/
export const epicTextBoxVocabulary = {
  tag: "epic-text-box",
  topics: ["forms", "text"],
  aka: ["notes box", "comment box", "textarea", "text field", "other", "feedback"],
  skeleton: "2 tall",
  noun: "text box",
  ui: false,
  description:
    "A box Owen types in, on a page he answers on (epic `epic-workflow` P12):  one line to start, growing with its " +
    "text.  What he types is part of the page's answer, by `type` and `for`:  the page's notes, a comment on a " +
    "section or an option, a question's Other, a syntax-choices page's feedback.",
  attributes: [
    {
      name: "type",
      kind: "enum",
      values: ["notes", "comment", "other", "feedback"],
      default: "comment",
      description:
        "What it holds:  `notes` (the page's notes for Claude, once a page), `comment` (on the section `for` " +
        "names, or an option, `q1-B`), `other` (question `for`'s Other, drawn by `<epic-ask>`), `feedback` " +
        "(a syntax-choices page's, drawn by `<epic-choices-bar>`)."
    },
    {
      name: "for",
      property: "htmlFor",
      kind: "string",
      description:
        "Whose it is:  a comment's section id (`context`) or option (`q1-B`), Other's question key (`q1`).  " +
        "Notes and feedback need none."
    },
    {
      name: "placeholder",
      kind: "string",
      description: "Its grey hint while empty;  none:  its type's own (`Notes for Claude:  anything, any time`)."
    },
    {
      name: "label",
      kind: "string",
      description: "Its name for a screen reader;  none:  its placeholder."
    }
  ],
  events: [],
  slots: [],
  parts: [
    { name: "base", description: "The box around the text field." },
    {
      name: "field",
      description: "The `<textarea>`:  one line to start, growing with its text to a third of the window."
    }
  ],
  states: [{ name: "filled", description: "Something is typed in it." }],
  texts: [
    { key: "notes", text: "Notes for Claude:  anything, any time", description: "A `notes` box's placeholder." },
    { key: "comment", text: "Comment on this section", description: "A `comment` box's placeholder." },
    { key: "other", text: "Other:  your own answer", description: "An `other` box's placeholder." },
    {
      key: "feedback",
      text: "Feedback for Claude:  anything the boxes don't say",
      description: "A `feedback` box's placeholder."
    }
  ],
  children: []
} as const satisfies EpicVocabulary
