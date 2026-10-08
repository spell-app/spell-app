/**
 * The English vocabulary of `<ui-cards>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), events, slots, parts, states and texts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The family's grammar notes are in `UICard.en.ts`.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"

/****************
 * ### `cardsVocabulary`
 * The names of `<ui-cards>`, a group of cards:  `<div class="ui ... cards" role="list">`, a wrapping row.
 ****************/
export const cardsVocabulary = {
  tag: "ui-cards",
  topics: ["cards", "layout", "lists", "views"],
  aka: ["card grid", "card group", "gallery"],
  noun: "cards",
  description: "A group of cards, laid out in a wrapping row.",
  attributes: [
    { name: "size", kind: "size", description: "Text size of every card in the group." },
    { name: "color", kind: "color", description: "Colour of every card in the group." },
    {
      name: "columns",
      kind: "width",
      widthClass: "",
      values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      description: 'Cards per row, `1` ... `10` (`columns="3"` => `three cards`);  default a fixed card width.'
    },
    {
      name: "doubling",
      kind: "keyOnly",
      description: "With `columns`:  fewer cards per row in a narrow group (tablet, mobile widths)."
    },
    { name: "stackable", kind: "keyOnly", description: "One card per row in a narrow group (mobile widths)." },
    {
      name: "stack-with",
      kind: "enum",
      values: UIT.StackWithValues,
      description:
        "What `stackable` and `doubling` measure:  `container` (the default) -- the group's own width;  " +
        "`page` -- the screen's, as in Fomantic.  Unset:  the page-wide `--ui-stack-with` token decides " +
        "(`<ui-root stack-with>`)."
    },
    { name: "centered", kind: "keyOnly", description: "Centres each row of cards." },
    { name: "horizontal", kind: "keyOnly", description: "Every card horizontal." },
    { name: "raised", kind: "keyOnly", description: "Every card raised." },
    { name: "link", kind: "keyOnly", description: "Every card rises on hover (a look;  links need `href`)." },
    { name: "basic", kind: "keyOnly", description: "Every card without border or shadow." },
    { name: "inverted", kind: "keyOnly", description: "Every card in the dark scheme." }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-card>`s." }],
  parts: [{ name: "group", description: "The group box." }],
  states: [
    {
      name: "cards",
      description: "Always set:  the host is a block and the size container (`ui-cards`) its cards answer to."
    }
  ],
  texts: [],
  ownsParts: ["card"]
} as const satisfies E.ComponentVocabulary
