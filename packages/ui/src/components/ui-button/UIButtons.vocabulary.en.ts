/**
 * Every name `<ui-buttons>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states,
 * texts.  Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The family's grammar notes are in `UIButton.vocabulary.en.ts`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-buttons>`
 * A group of buttons (and `<ui-or>`s) sharing one look:  `<div class="ui ... buttons" role="group">`.
 ****************/
export const buttonsVocabulary = {
  tag: "ui-buttons",
  topics: ["buttons", "controls", "layout", "elements"],
  aka: ["button group", "segmented control", "toolbar"],
  noun: "buttons",
  description: "Buttons can exist together as a group.",
  attributes: [
    { name: "size", kind: "size", description: "Size of every button in the group." },
    { name: "color", kind: "color", description: "Hue of every button in the group." },
    { name: "primary", kind: "keyOnly", description: "Every button in the primary colour." },
    { name: "secondary", kind: "keyOnly", description: "Every button in the secondary colour." },
    { name: "positive", kind: "keyOnly", description: "Every button in the positive colour." },
    { name: "negative", kind: "keyOnly", description: "Every button in the negative colour." },
    { name: "basic", kind: "keyOnly", description: "Basic buttons inside one outer border." },
    { name: "tertiary", kind: "keyOnly", description: "Tertiary (text only) buttons." },
    { name: "inverted", kind: "keyOnly", description: "Inverted buttons, for dark backgrounds." },
    { name: "icon", kind: "keyOnly", description: "Icon-only buttons:  square padding." },
    {
      name: "labeled",
      kind: "keyOrValueAndKey",
      values: ["left", "right"],
      description: 'With `icon`:  `labeled icon` buttons;  `labeled="right"` puts the icons at the end.'
    },
    { name: "compact", kind: "keyOnly", description: "Reduced padding." },
    { name: "circular", kind: "keyOnly", description: "Separate pill-shaped buttons." },
    { name: "toggle", kind: "keyOnly", description: "`active` buttons show in the positive colour." },
    { name: "vertical", kind: "keyOnly", description: "Stacks the buttons vertically." },
    { name: "fluid", kind: "keyOnly", description: "Takes the full width of its container." },
    {
      name: "equal",
      kind: "keyOnly",
      description:
        "Every button the same width, from the buttons themselves (no count):  each as wide as the widest;  with " +
        "`fluid`, an equal share of the row each."
    },
    { name: "wrapping", kind: "keyOnly", description: "Buttons wrap onto more rows." },
    { name: "spaced", kind: "keyOnly", description: "Separate buttons with gaps between them." },
    { name: "stackable", kind: "keyOnly", description: "Stacks vertically on mobile." },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom", "left", "right"],
      description: "Joined to the edge of a segment:  `top`, `bottom`, `left` or `right`."
    },
    { name: "floated", kind: "valueAndKey", values: "floats", description: "Floats `left` or `right`." },
    {
      name: "width",
      kind: "width",
      widthClass: "",
      canEqual: true,
      values: "widths",
      description:
        'Older, count-based alias of `equal fluid`:  equal-width buttons filling the row, a count (`width="3"` => ' +
        '`three`) or `"equal"` (`equal width`).'
    }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-button>`s and `<ui-or>`s." }],
  parts: [{ name: "group", description: "The group box." }],
  states: [
    { name: "fluid", description: "The host is block-level:  `fluid`, `width`, or attached `top` / `bottom`." },
    { name: "left-floated", description: "The host floats left." },
    { name: "right-floated", description: "The host floats right." }
  ],
  texts: []
} as const satisfies E.ComponentVocabulary
