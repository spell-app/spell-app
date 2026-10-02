/**
 * Every name `<ui-image>` and `<ui-images>` use:  tags, attributes (kind + allowed values), slots, parts,
 * states.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-image size="small" rounded floated="right" vertical-align="top">` =>
 *   `ui small rounded right floated top aligned image`.
 * - `size` is a WIDTH here (Fomantic's 35px ... 960px ladder), not a text scale;  `medium` stays the no-op default
 *   (natural size), so the element never emits Fomantic's 300px `.medium`.  See `ui-image.css`.
 * - `src`, `alt`, `width`, `height`, `loading` pass straight through to the shadow `<img>`.
 * - NOT the generic content part `<ui-image>` of cards / items (`plan.md`):  those land with their owners.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-images>`
 * A group of images in one wrapping row:  `<div class="ui ... images" part="group">`.
 ****************/
export const imagesVocabulary = {
  tag: "ui-images",
  topics: ["images", "media", "layout", "elements"],
  aka: ["image group", "gallery", "avatars"],
  skeleton: null,
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
} as const satisfies ComponentVocabulary
