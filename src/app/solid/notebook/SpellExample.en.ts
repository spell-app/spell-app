/**
 * Every name `<spell-example>` adds to `<ui-docs-example>`'s:  its tag, and its `name`.
 * Schema:  `E.ComponentVocabulary` (`spell-ui/core`).
 * - `<spell-example>` is a `<ui-docs-example>` (`SpellExample extends UIDocsExample`):
 *   its whole vocabulary is the docs example's names, with these added (`SpellExample.vocabulary`, `SpellExample.tsx`).
 * - Pure data:  `import type` only.
 */

import type { E } from "spell-ui/core"

/****************
 * ### `<spell-example>`
 * A notebook's example (epic `elemental-spell` P16):  a component page's example, its name its header,
 * its live result in a frame, and its code under it behind the `</>` button.
 ****************/
export const spellExampleVocabulary = {
  tag: "spell-example",
  topics: ["documentation", "containers"],
  aka: ["notebook example", "live example"],
  noun: "example",
  description:
    "A notebook's example:  its name over its live result, and its code a `</>` button shows and hides, as a " +
    "component page's examples are.  A notebook's `<example \"...\">` compiles to it;  the notebook's page puts each " +
    "one's code in its `source` slot, and the text before it in its `description` slot.",
  attributes: [{ name: "name", kind: "string", description: "Its name, shown as its header:  `one counter`." }],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
