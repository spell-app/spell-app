/**
 * Every name `<spell-editor>` uses:  tag, attributes, events, texts.  Schema:  `E.ComponentVocabulary` (`$/ui/core`).
 * - Pure data:  `import type` only, so node can read it (the component pack's catalog, `vite.element.config.ts`).
 * - The pane's own words (tabs, status line) are `SpellEditorPane`'s.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<spell-editor>`
 * Edits a spell project in any page, in Monaco, and feeds `<spell-app>`s on the page what it compiles.
 ****************/
export const spellEditorVocabulary = {
  tag: "spell-editor",
  topics: ["inputs", "text"],
  aka: ["code editor", "source editor", "ide", "monaco"],
  noun: "editor",
  ui: false,
  description:
    "Edits a spell project in any page, in Monaco, saving back to the spell server;  compiles as it opens, after " +
    "typing stops and on Cmd+Enter, and feeds `<spell-app>`s what it compiled.",
  attributes: [
    {
      name: "project",
      kind: "string",
      description:
        "What to edit, from the spell server's `/api`, as `<spell-app project>`:  `@system:examples:Solitaire`, or " +
        "`@examples/Solitaire`.  Edits SAVE back to it:  every compile saves the files edited since, and Cmd+S saves."
    },
    {
      name: "file",
      kind: "string",
      description: "Which file to show first, e.g. `Card.spell`;  default, its first spell file.  Tabs show the others."
    },
    {
      name: "app",
      kind: "string",
      description:
        "A CSS selector for `<spell-app>`s to run what it compiles, e.g. `#game`.  Or an app can name the editor, " +
        "with its `editor` attribute:  either will do."
    },
    { name: "width", kind: "string", description: "A CSS length (`50%`, `30em`), set as its inline style." },
    { name: "height", kind: "string", description: "A CSS length (`420px`), set as its inline style." },
    {
      name: "assets",
      kind: "string",
      description: "Where `spell-editor.css` and Lato are;  default, beside its script.  Read as it joins the page."
    }
  ],
  events: [
    {
      name: "spell-compiled",
      detail: "SpellCompiled",
      description:
        "It compiled with no parse errors:  `detail` is what it made (its project, javascript, scope pack and " +
        "declarations), as its `compiled` property holds."
    }
  ],
  slots: [],
  parts: [],
  states: [],
  texts: [
    { key: "noProject", text: "Give <spell-editor> a project to edit.", description: "No `project`." },
    { key: "nothingCompiled", text: "Nothing compiled", description: "A compile with no errors, and no javascript." }
  ]
} as const satisfies E.ComponentVocabulary
