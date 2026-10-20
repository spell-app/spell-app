/**
 * Every name `<spell-markdown>` adds to `<ui-markdown>`'s:  its tag, and what it is.
 * Schema:  `E.ComponentVocabulary` (`$/ui/core`).
 * - `<spell-markdown>` is a `<ui-markdown>` (`SpellMarkdown extends UIMarkdown`):
 *   its whole vocabulary is `<ui-markdown>`'s names, with these in place (`SpellMarkdown.vocabulary`).
 * - Pure data:  `import type` only, so node can read it (the component pack's catalog, `vite.element.config.ts`).
 */

import type { E } from "@spell-app/ui/core"

/****************
 * ### `<spell-markdown>`
 * Markdown drawn by spell's own engine, in `ui-*` elements:  `<ui-markdown>`, plain or `editable`.
 ****************/
export const spellMarkdownVocabulary = {
  tag: "spell-markdown",
  topics: ["text", "typography", "data display"],
  aka: ["spell markdown", "markdown editor", "gfm", "readme", "rich text"],
  skeleton: "header, 4 line paragraph",
  noun: "markdown",
  description:
    "Spell markdown draws GitHub-flavoured markdown with spell's own engine, in `ui-*` elements -- headers, lists, " +
    "tables, alerts as messages, tasks as checkboxes -- plain or `editable`.  Its spell blocks are coloured by " +
    "spell's parser.",
  attributes: [
    {
      name: "editable",
      kind: "boolean",
      description:
        "Write / Preview tabs:  a text box for the markdown, and its preview, drawn by spell's engine in `ui-*` " +
        "elements.  Each edit is a `ui-change`;  `save()` writes it."
    }
  ],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
