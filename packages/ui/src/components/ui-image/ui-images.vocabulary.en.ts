/**
 * Every name `<ui-images>` uses:  tag, attributes (kind + allowed values), slots, parts.
 * Schema:  `E.ComponentVocabulary`.
 * - The family's grammar notes are in `ui-image.vocabulary.en.ts`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-images>`
 * A group of images in one wrapping row:  `<div class="ui ... images" part="group">`.
 ****************/
export const imagesVocabulary = {
  tag: "ui-images",
  topics: ["images", "media", "layout", "elements"],
  aka: ["image group", "gallery", "avatars"],
  skeleton: "none",
  noun: "images",
  description: "A group of images can be formatted together.",
  attributes: [
    { name: "size", kind: "size", description: "Width of every image in the group, `mini` ... `massive`." },
    { name: "avatar", kind: "keyOnly", description: "Every image a small circle." },
    { name: "bordered", kind: "keyOnly", description: "Every image with a hairline border." },
    { name: "centered", kind: "keyOnly", description: "Rows centred in the container." },
    { name: "circular", kind: "keyOnly", description: "Every image cropped to a circle." },
    { name: "disabled", kind: "keyOnly", description: "The whole group faded." },
    { name: "fluid", kind: "keyOnly", description: "Every image fills the group's width, one per row." },
    { name: "rounded", kind: "keyOnly", description: "Every image with softly rounded corners." },
    { name: "floated", kind: "valueAndKey", values: "floats", description: "Floats the group `left` or `right`." },
    {
      name: "vertical-align",
      kind: "verticalAlign",
      values: ["top", "middle", "bottom"],
      description: "Aligns the images of a row `top`, `middle` (default) or `bottom`."
    }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-image>`s (or plain `<img>`s)." }],
  parts: [{ name: "group", description: "The group box." }],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
