/**
 * Every name `<ui-components>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - No Fomantic counterpart and nothing to draw:  one attribute, `source`, which the `<ui-root>` around it reads.
 *   Its load and failures are the root's (`ui-ready`'s `failed`, `ui-error`), so it has no events of its own.
 * - No skeleton:  it draws nothing.
 */

import type { E } from "$/ui/core"

import { SOURCE } from "./UIComponents.types"

/****************
 * ### `<ui-components>`
 * Names a COMPONENT PACK for the `<ui-root>` around it:  another package's elements (`<epic-page>` ...), loaded on
 * demand like Spell UI's own.  Draws nothing.
 ****************/
export const componentsVocabulary = {
  tag: "ui-components",
  topics: ["loading", "modules"],
  aka: ["component pack", "plugin", "extension", "custom elements", "web components", "element library"],
  noun: "components",
  description:
    "Components name a pack of another package's elements, which the root around them loads on demand, once per page.",
  attributes: [
    {
      name: SOURCE,
      kind: "string",
      description:
        "URL of the pack's script (`epics.pack.js`), relative to the page.  The root loads it once per page as a " +
        "classic script (so it works from `file://`) and waits for it before showing its content."
    }
  ],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
