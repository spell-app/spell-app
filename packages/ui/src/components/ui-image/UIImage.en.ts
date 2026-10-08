/**
 * The English vocabulary of `<ui-image>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots, parts and states.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The attributes become Fomantic's class words, in Fomantic's order (`ClassBuilder`):
 *   `<ui-image size="small" rounded floated="right" vertical-align="top">` =>
 *   `ui small rounded right floated top aligned image`.
 * - `size` is a WIDTH here (Fomantic's 35px … 960px ladder), not a text scale.
 *   `medium` stays the no-op default (the natural size), so the component never writes Fomantic's 300px `.medium`.
 *   See `UIImage.css`.
 * - `src`, `alt`, `width`, `height`, `loading` pass straight through to the shadow `<img>`.
 * - NOT the generic content part `<ui-image>` of cards / items (`plan.md`):  those land with their owners.
 */

import type { E } from "$/ui/core"

/****************
 * ### `imageVocabulary`
 * The names of `<ui-image>`, an image:  `<img class="ui … image" part="image">`,
 * or `<a class="ui … image" part="image">` around `<img part="img">` with `href`.
 ****************/
export const imageVocabulary = {
  tag: "ui-image",
  topics: ["images", "media", "basic", "elements"],
  aka: ["picture", "img", "photo", "avatar", "thumbnail"],
  skeleton: "10 wide: square image",
  noun: "image",
  plural: "images",
  description: "An image is a graphic representation of something.",
  attributes: [
    {
      name: "size",
      kind: "size",
      description: "Width, `mini` (35px) ... `massive` (960px) at 16px;  `medium` is the natural size."
    },
    { name: "avatar", kind: "keyOnly", description: "A small circle sitting in a line of text." },
    { name: "bordered", kind: "keyOnly", description: "A hairline border, for images with white edges." },
    { name: "centered", kind: "keyOnly", description: "A block centred in its container." },
    { name: "circular", kind: "keyOnly", description: "Cropped to a circle (a pill when not square)." },
    { name: "disabled", kind: "keyOnly", description: "Faded:  shown as unavailable." },
    { name: "fluid", kind: "keyOnly", description: "Fills its container's width." },
    { name: "inline", kind: "keyOnly", description: "Sits inline in running text instead of as a block." },
    { name: "rounded", kind: "keyOnly", description: "Softly rounded corners." },
    { name: "floated", kind: "valueAndKey", values: "floats", description: "Floats `left` or `right` of the text." },
    {
      name: "spaced",
      kind: "keyOrValueAndKey",
      values: ["left", "right"],
      description: 'Room from the text around it:  both sides, or `spaced="left"` / `"right"` only.'
    },
    {
      name: "vertical-align",
      kind: "verticalAlign",
      values: "verticalAlignments",
      description: "Aligns `top`, `middle` or `bottom` against the text (or, in a group, the row)."
    },
    { name: "src", kind: "string", description: "Image URL, as the native `<img src>`." },
    {
      name: "alt",
      kind: "string",
      description: 'Text alternative, as the native `<img alt>`;  `alt=""` marks the image decorative.'
    },
    {
      name: "width",
      kind: "number",
      description:
        "Intrinsic width in px, as the native `<img width>`:  reserves space before load.  NOT the column " +
        "`width` grammar;  size variations still set the rendered width."
    },
    {
      name: "height",
      kind: "number",
      description: "Intrinsic height in px, as the native `<img height>`:  reserves space before load."
    },
    {
      name: "loading",
      kind: "enum",
      values: ["eager", "lazy"],
      description: "When to load, as the native `<img loading>`."
    },
    { name: "href", kind: "string", description: "Renders a link (`<a>`) around the image." }
  ],
  events: [],
  slots: [],
  parts: [
    { name: "image", description: "The image box:  the `<img>`, or the `<a>` with `href`." },
    { name: "img", description: "With `href`:  the `<img>` inside the link." }
  ],
  states: [{ name: "disabled", description: "Faded:  shown as unavailable." }],
  texts: []
} as const satisfies E.ComponentVocabulary
