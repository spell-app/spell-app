/**
 * Every name `<ui-components>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - No Fomantic counterpart, so no class grammar:  `source` is a property.
 * - In `<ui-root>`'s family (`ui-root/`):  it only means something to roots, and is defined with them.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-components>`
 * A component pack for the page:  every `<ui-root>` on it then knows the pack's tags (where each one's code is, when
 * to load it, its skeleton).  Draws nothing.
 ****************/
export const componentsVocabulary = {
  tag: "ui-components",
  topics: ["loading", "modules"],
  aka: ["component pack", "component manifest", "component registry", "import map", "plugin", "lazy loading"],
  noun: "components",
  description:
    "Components loads a component pack, so every root on the page can load the custom elements it lists on demand.",
  attributes: [
    {
      name: "source",
      kind: "string",
      description:
        'The pack:  a JSON array of `{ "tag", "source", "load"?, "skeleton"? }`, same origin.  Each `source` (the ' +
        "module that defines the tag) is relative to the pack;  `load` is `on-demand` (default:  when a root meets the " +
        "tag) or `eager` (as soon as the pack is read);  `skeleton` is skeleton text (`inline 6 x 2.5`, `2 tall`, " +
        "`18 wide: header, 3 line paragraph`;  left out:  none).  Any tag, not only `ui-*`."
    }
  ],
  events: [
    {
      name: "ui-load",
      detail: "{ source: string, tags: string[] }",
      description: "The pack is read:  every root on the page knows `tags` now."
    },
    {
      name: "ui-error",
      detail: "{ kind: 'load' | 'cross-origin' | 'file-protocol' | 'render', source: string, error: unknown }",
      cancelable: true,
      description:
        "The pack didn't load (`load`, `cross-origin`, `file-protocol`), or isn't a pack (`render`).  Roots then " +
        "call its tags unknown.  Cancel it to skip the console warning."
    }
  ],
  slots: [],
  parts: [],
  states: [
    { name: "loading", description: "Fetching the pack." },
    { name: "loaded", description: "The pack is read;  its tags are known." },
    { name: "error", description: "The pack didn't load, or isn't a pack." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
