/**
 * Every name `<spell-code>` adds to `<ui-code>`'s:  its tag, and `language`'s default.
 * Schema:  `E.ComponentVocabulary` (`$/ui/core`).
 * - `<spell-code>` is a `<ui-code>` (`SpellCode extends UICode`):
 *   its whole vocabulary is `<ui-code>`'s names, with these in place (`SpellCode.vocabulary`, `SpellCode.tsx`).
 * - Pure data:  `import type` only, so node can read it (the component pack's catalog, `vite.element.config.ts`).
 */

import type { E } from "$/ui/core"

/****************
 * ### `<spell-code>`
 * A block of spell, coloured by spell's own parser:  `<ui-code>` with `language="spell"` by default.
 ****************/
export const spellCodeVocabulary = {
  tag: "spell-code",
  topics: ["text", "data display"],
  aka: ["spell snippet", "spell source", "spell highlighter"],
  skeleton: "5 line paragraph",
  noun: "code",
  description:
    "Spell code shows a block of spell coloured by spell's own parser:  `<ui-code>`, its language `spell` unless " +
    'it says otherwise.  Loading it registers spell with the page\'s `UI.code`, so every `<ui-code language="spell">` ' +
    "on the page, and every spell block of a markdown, is coloured too.",
  attributes: [
    {
      name: "language",
      kind: "string",
      default: "spell",
      description:
        "Language to colour it as:  `spell` (~== `spell/en`, the default), `spell/<lang>` for a translation, or any " +
        "language `<ui-code>` knows."
    }
  ],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
