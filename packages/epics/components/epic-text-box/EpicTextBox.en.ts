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
    "section or an option, a question's Other, a choice page's feedback.  The page's notes box also " +
    "shows what the page KEPT (P18):  text typed for a question, option or section an agent's rewrite took off " +
    "the page, under its old title, sent with the rest until Owen drops it.",
  attributes: [
    {
      name: "type",
      kind: "enum",
      values: ["notes", "comment", "other", "feedback"],
      default: "comment",
      description:
        "What it holds:  `notes` (the page's notes for Claude, once a page), `comment` (on the section `for` " +
        "names, or an option, `q1-B`), `other` (question `for`'s Other, drawn by `<epic-ask>`), `feedback` " +
        "(a choice page's, drawn by `<epic-choices-bar>`)."
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
    },
    {
      name: "kept",
      description:
        "A notes box's KEPT text, above its field, while there is any:  an orange-edged box, \"Kept from before " +
        'the page changed", then each text.'
    },
    {
      name: "kept-item",
      description: "One kept text:  its old title (the id it was under on hover), what was typed, and a × to drop it."
    }
  ],
  states: [{ name: "filled", description: "Something is typed in it." }],
  texts: [
    { key: "notes", text: "Notes for Claude:  anything, any time", description: "A `notes` box's placeholder." },
    { key: "notesTitle", text: "Notes", description: "The notes' title, where a draft keeps them." },
    {
      key: "keptTitle",
      text: "Kept from before the page changed",
      description: "The title of a notes box's kept text."
    },
    {
      key: "keptWhy",
      text:
        "The page was rewritten since you typed these, and what they were for is gone from it.  They're sent " +
        "with the rest:  drop one once it's said elsewhere.",
      description: "Under the kept text's title:  what it is."
    },
    { key: "keptIdTip", text: "It was under {id}", description: "A kept text's title's tooltip:  its old id." },
    { key: "keptDrop", text: "Drop {label}", description: "A kept text's ×, for a screen reader." },
    {
      key: "keptDropTip",
      text: "Drop this:  it's no longer sent",
      description: "A kept text's ×'s tooltip."
    },
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
