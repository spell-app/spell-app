/**
 * Every name `<ui-shape>` and `<ui-side>` use:  tags, attributes (kind + allowed values), events, slots, parts,
 * states, texts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:  `<ui-shape cube>` => `ui cube shape`;  the
 *   element adds `animating` after the noun while it flips.
 * - A side has no `ui` (Fomantic's `.side`);  which one shows is the shape's `active-index`, not an attribute of the
 *   side.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-shape>`
 * A 3D shape showing one side at a time:  `<div class="ui ... shape" part="shape"><div class="sides"
 * part="sides"><slot>`, its `<ui-side>`s slotted.
 ****************/
export const shapeVocabulary = {
  tag: "ui-shape",
  topics: ["animation", "media", "modules"],
  aka: ["3d flip", "cube", "flip card", "carousel"],
  skeleton: false,
  noun: "shape",
  description: "A shape is a three dimensional object displayed on a two dimensional plane.",
  attributes: [
    { name: "cube", kind: "keyOnly", description: "Square grey faces, as the sides of a cube." },
    { name: "text", kind: "keyOnly", description: "Sides of text, inline:  a word that flips to another." },
    {
      name: "active-index",
      kind: "number",
      default: 0,
      description:
        "Index of the side shown (from 0).  Controlled:  changing it flips (`direction` says which way) to that side."
    },
    {
      name: "direction",
      kind: "enum",
      values: ["up", "down", "left", "right", "over", "back"],
      default: "left",
      description:
        "Which way it turns (Fomantic's `flip up` ...) when `active-index` changes, `next()` / `previous()` run or " +
        "`flip()` gets no direction."
    },
    {
      name: "duration",
      kind: "string",
      description: "Length of a flip:  ms (`600`) or a CSS time (`0.6s`);  default Fomantic's 0.6s."
    }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ activeIndex: number, side: Element, flip: ShapeFlip }",
      description: "Another side is shown, its flip finished (Fomantic's `onChange`)."
    }
  ],
  slots: [{ name: "", description: "The sides:  `<ui-side>` elements, in order." }],
  parts: [
    { name: "shape", description: "The stage, with the 3D perspective." },
    { name: "sides", description: "The box that turns;  a polite live region, so a flip is announced." }
  ],
  states: [{ name: "animating", description: "Flipping." }],
  texts: []
} as const satisfies ComponentVocabulary
