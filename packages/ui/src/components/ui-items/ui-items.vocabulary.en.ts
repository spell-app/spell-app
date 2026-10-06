/**
 * Every name `<ui-items>` uses:  tag, attributes (kind + allowed values), slots, parts, states.
 * Schema:  `E.ComponentVocabulary`.
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-items divided relaxed="very" link>` => `ui divided link very relaxed items`.  `ui-items.css` keys on those.
 * - Fomantic's Items VIEW, with the SAME generic `<ui-item>` as dropdown, list and menu (`ownsParts:  item`) --
 *   never a second item tag (decided 2026-09-29, `docs/grammar.md` "Items").  Here the item owns its content parts
 *   (`ItemContext.ownsParts`), so they style themselves `:state(in-item)`.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"

/****************
 * ### `<ui-items>`
 * The Items view:  `<div class="ui ... items" role="list">` of `<ui-item>`s, each an image beside its content.
 ****************/
export const itemsVocabulary = {
  tag: "ui-items",
  topics: ["lists", "data display", "views"],
  aka: ["item list", "media list", "product list", "results"],
  skeleton: "header with image, 3 line paragraph",
  noun: "items",
  description: "A group of items:  site content, each an image beside its header, meta, description and extra.",
  attributes: [
    {
      name: "size",
      kind: "size",
      description: "Text size of every item, `mini` ... `massive`;  `medium` is the default."
    },
    { name: "divided", kind: "keyOnly", description: "A rule between items." },
    {
      name: "relaxed",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: 'More space between items;  `relaxed="very"` even more.'
    },
    {
      name: "link",
      kind: "keyOnly",
      description: "Items react to hover (a pointer, the header in the link colour).  A LOOK:  links need `href`."
    },
    {
      name: "unstackable",
      kind: "keyOnly",
      description: "Keeps the image beside the content in a narrow group (mobile widths), where items otherwise stack."
    },
    {
      name: "stack-with",
      kind: "enum",
      values: UIT.StackWithValues,
      description:
        "What stacking and the tablet image width measure:  `container` (the default) -- the group's own " +
        "width;  `page` -- the screen's, as in Fomantic.  Unset:  the page-wide `--ui-stack-with` token " +
        "decides (`<ui-root stack-with>`)."
    },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme." },
    { name: "disabled", kind: "keyOnly", description: "Faded and inert." }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-item>`s." }],
  parts: [{ name: "items", description: "The group box." }],
  states: [
    {
      name: "items",
      description: "Always set:  the host is a block and the size container (`ui-items`) its items answer to."
    }
  ],
  texts: [],
  ownsParts: ["item"]
} as const satisfies E.ComponentVocabulary
