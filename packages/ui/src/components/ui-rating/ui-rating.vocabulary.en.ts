/**
 * Every name `<ui-rating>` uses:  tag, attributes (kind + allowed values), events, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-rating size="large" color="yellow" readonly>` => `ui large yellow read-only rating`.
 * - `icon` is an icon NAME (`star`, `heart`, any `<ui-icon>` name), not a class:  Fomantic 2.9 reads it from
 *   `data-icon` too.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-rating>`
 * A rating:  a radio group of `max-rating` icons, the first `value` of them filled.
 ****************/
export const ratingVocabulary = {
  tag: "ui-rating",
  topics: ["inputs", "controls", "forms", "feedback", "modules"],
  aka: ["stars", "star rating", "score", "review stars", "hearts"],
  skeleton: { display: "inline", width: "5.5em", height: "1.1em" },
  noun: "rating",
  description: "A rating indicates user interest in content.",
  attributes: [
    { name: "size", kind: "size", description: "Icon size, `mini` ... `massive`;  `medium` is the default." },
    { name: "color", kind: "color", description: "Hue of the filled icons." },
    {
      name: "disabled",
      kind: "keyOnly",
      description: "Can't be used:  left out of the form, not focusable.  Shows its value."
    },
    {
      name: "readonly",
      kind: "keyOnly",
      key: "read-only",
      description: "Shows its value but can't be changed;  still focusable and submitted."
    },
    { name: "icon", kind: "icon", default: "star", description: "Icon name, e.g. `star` (default), `heart`." },
    { name: "max-rating", kind: "number", default: 4, description: "How many icons (Fomantic's default:  4)." },
    {
      name: "value",
      kind: "number",
      reflect: false,
      description:
        "Rating, `0` (none) ... `max-rating`;  a fraction shows a partly filled icon.  Attribute:  the starting " +
        "(and reset) value;  property:  the live value."
    },
    {
      name: "clearable",
      kind: "boolean",
      description: "Choosing the current rating again clears it (as do Backspace / Delete);  always, with one icon."
    },
    { name: "name", kind: "string", description: "Form field name." },
    { name: "required", kind: "boolean", description: "Form validation:  a rating must be given." }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ value: number, originalEvent?: Event }",
      description: "The user rated (`0` when cleared).  A handler that re-sets `value` wins."
    }
  ],
  slots: [],
  parts: [
    { name: "rating", description: "The radio group (`<fieldset role=radiogroup>`)." },
    { name: "icon", description: "One icon:  a `<label>` around its radio and glyph." },
    { name: "control", description: "One native radio (invisible, over its icon)." }
  ],
  states: [
    { name: "disabled", description: "Can't be used." },
    { name: "invalid", description: "Fails validation, once the user has interacted (`:user-invalid` semantics)." }
  ],
  texts: [
    { key: "ratingItem", text: "{value} of {max}", description: "Accessible name of each icon's radio." },
    { key: "ratingValue", text: "Rated {value} of {max}", description: "Description of a fractional rating." }
  ]
} as const satisfies ComponentVocabulary
