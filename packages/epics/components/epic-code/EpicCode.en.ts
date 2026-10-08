/**
 * Every name `<epic-code>` uses.  Schema:  `EpicVocabulary` (Spell UI's `ComponentVocabulary` plus its children).
 * - Pure data:  `import type`, plus the panel's parts and states from `epic-aside`'s types file, which is data too.
 * - Change it, then `spell dev pack build epics`:  the pack's catalog is read from here.
 */

import type { EpicVocabulary } from "$/epics/definitions"

// the folded panel's parts and states, shared with `<epic-aside>`
import { PANEL_PARTS, PANEL_STATES } from "$/epics/components/epic-aside/EpicPanel.types"

/****************
 * ### `<epic-code>`
 * A folded, highlighted code block in a plan doc's prose.
 ****************/
export const epicCodeVocabulary = {
  tag: "epic-code",
  topics: ["documentation", "containers", "text"],
  aka: ["code", "code block", "snippet", "listing", "source", "pre"],
  noun: "code",
  ui: false,
  description:
    "A folded code block in prose:  a code-well panel headed by its `title` (mono), the code highlighted inside " +
    "(Spell UI's `<ui-code>`, with a copy button).  The code is the element's own text, in ONE `<pre>` child:  " +
    '`<epic-code title="design.ts · 12 lines" language="ts"><pre>...</pre></epic-code>`.  Folded to start ' +
    "with, unless `open`.  Replaces the old `ui-accordion.spell-code` and its four wrappers.",
  attributes: [
    {
      name: "title",
      property: "epicTitle",
      kind: "string",
      description: "Its heading:  what the code is (`design.ts · 12 lines`).  None:  `Code`."
    },
    {
      name: "language",
      kind: "string",
      description:
        "The code's language, as `<ui-code language>` takes it (`ts`, `html`, `css`, `json`, `spell`, `text` for " +
        "none).  None:  guessed."
    },
    {
      name: "open",
      kind: "boolean",
      description: 'Open to start with (the old accordion\'s `open="0"`);  a click still folds it.  Page state after.'
    }
  ],
  events: [],
  slots: [{ name: "", description: "The code:  ONE `<pre>`, its text the code (never drawn itself)." }],
  parts: [
    ...PANEL_PARTS,
    { name: "code", description: "The `<ui-code>` that draws the code, highlighted, with its copy button." }
  ],
  states: [...PANEL_STATES],
  texts: [{ key: "code", text: "Code", description: "The heading, without a title." }],
  children: [
    {
      tag: "flow",
      description:
        "The code:  ONE `<pre>` holding it as text (`&lt;` for a `<`).  A `<pre>`, so a formatter keeps its " +
        "white space and the page reads it before the pack loads."
    }
  ],
  flow: true
} as const satisfies EpicVocabulary
