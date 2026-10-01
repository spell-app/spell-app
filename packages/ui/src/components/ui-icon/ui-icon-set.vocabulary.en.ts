/**
 * Every name `<ui-icon>` and `<ui-icons>` use:  tags, attributes (kind + allowed values), slots, parts, states.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-icon name="heart" size="large" color="red" circular>` => `ui large red circular icon`.  `ui-icon.css` keys
 *   on those words;  `name` / `outline` / `label` are property-only and pick the SVG (`UI.icons`).
 * - `iconsVocabulary.ownsParts` lists `icon`:  a `<ui-icon>` directly inside a `<ui-icons>` finds it through
 *   `OwnerContext` and sets `:state(in-icons)`, which `ui-icon.css` stacks and positions it by.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-icon-set>`
 * Adds an icon pack to the page, from HTML.  Renders nothing.
 * - The runtime (`UI.icons`) reads these itself, so they work on pages that never define the element.
 ****************/
export const iconSetVocabulary = {
  tag: "ui-icon-set",
  noun: "icon set",
  description: "An icon set adds a pack of icons to the page:  a folder of SVGs and its `pack.js` index.",
  attributes: [
    {
      name: "src",
      kind: "string",
      description:
        "URL of the pack's `pack.js`, or a built-in pack:  `fa7-free` (the default), `fa7-brands`, `fomantic`."
    },
    {
      name: "prefix",
      // NOTE:  `Element.prototype.prefix` (the namespace prefix) is taken
      property: "packPrefix",
      kind: "string",
      description: "Extra prefix for `prefix:name`;  the pack's own id works too."
    },
    {
      name: "base",
      kind: "string",
      description: "Folder the pack's SVGs load from instead of its own, e.g. a CDN copy.  Relative to the page."
    },
    {
      name: "only",
      kind: "boolean",
      description: "Drop every pack added before this one, including the default `fa7-free`."
    }
  ],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary
