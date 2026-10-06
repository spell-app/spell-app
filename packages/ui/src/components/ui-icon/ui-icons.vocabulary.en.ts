/**
 * Every name `<ui-icon>` and `<ui-icons>` use:  tags, attributes (kind + allowed values), slots, parts, states.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-icon name="heart" size="large" color="red" circular>` => `ui large red circular icon`.  `ui-icon.css` keys
 *   on those words;  `name` / `outline` / `label` are property-only and pick the SVG (`UI.icons`).
 * - `iconsVocabulary.ownsParts` lists `icon`:  a `<ui-icon>` directly inside a `<ui-icons>` finds it through
 *   `OwnerContext` and sets `:state(in-icons)`, which `ui-icon.css` stacks and positions it by.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-icons>`
 * Several icons stacked into one glyph:  `<span class="ui ... icons" part="icons"><slot>`.
 ****************/
export const iconsVocabulary = {
  tag: "ui-icons",
  topics: ["icons", "elements"],
  aka: ["icon group", "stacked icons", "icon stack"],
  skeleton: "inline 1 x 1",
  noun: "icons",
  description: "Several icons can be used together as a group.",
  attributes: [
    { name: "size", kind: "size", description: "Size of the whole group, relative to the surrounding text." },
    {
      name: "label",
      kind: "string",
      description: "Accessible name for the combined glyph (`role=img`);  without it the group is decorative."
    },
    { name: "disabled", kind: "keyOnly", description: "Dimmed and inert." },
    { name: "loading", kind: "keyOnly", description: "The whole group spins." },
    { name: "fitted", kind: "keyOnly", description: "No gap after the group." },
    { name: "circular", kind: "keyOnly", description: "Inside a circular ring, the first icon centred." },
    { name: "bordered", kind: "keyOnly", description: "Inside a square ring, the first icon centred." },
    { name: "inverted", kind: "keyOnly", description: "A filled `circular` / `bordered` ring, for dark backgrounds." }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-icon>`s:  the first is the base glyph, the rest stack on it (`corner`)." }],
  parts: [{ name: "icons", description: "The group box." }],
  states: [],
  texts: [],
  ownsParts: ["icon"]
} as const satisfies E.ComponentVocabulary
