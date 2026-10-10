/**
 * Every name `<ui-dimmer>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-dimmer shade="light" inverted vertical-align="top" visible>` => `ui light inverted top aligned active dimmer`.
 * - `active` is Fomantic's word for a shown dimmer (its class, and `.dimmer('show')`):
 *   no attribute here, but the class the box has while the element shows (the shared `visible` / `hidden`).
 * - `page` makes it a PAGE dimmer:  a modal `<dialog>` over the whole viewport;  else it dims its parent element.
 * - `closedby` mirrors `<dialog closedby>`, as on `<ui-modal>`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-dimmer>`
 * Dims its parent (`<div class="ui ... dimmer" part="dimmer">`) or, with `page`,
 * the whole page (`<dialog class="ui page ... dimmer" part="dimmer">`, shown with `showModal()`);
 * its content is centred.
 ****************/
export const dimmerVocabulary = {
  tag: "ui-dimmer",
  topics: ["overlays", "loading", "feedback", "modules"],
  aka: ["overlay", "backdrop", "scrim", "mask", "blocker"],
  noun: "dimmer",
  description: "A dimmer hides distractions to focus attention on particular content.",
  attributes: [
    {
      name: "shade",
      kind: "valueOnly",
      values: ["medium", "light", "very light"],
      description: "Lighter than the default (Fomantic's shades):  `medium`, `light`, `very light`."
    },
    { name: "page", kind: "keyOnly", description: "Dims the whole page:  a modal dialog over the viewport." },
    { name: "inverted", kind: "keyOnly", description: "A light dimmer (dark text), where the default is dark." },
    { name: "blurring", kind: "keyOnly", description: "Blurs and greys what's behind it (`backdrop-filter`)." },
    { name: "simple", kind: "keyOnly", description: "Fomantic's CSS-only dimmer;  the element's look is the same." },
    { name: "disabled", kind: "keyOnly", description: "Never shows." },
    {
      name: "vertical-align",
      kind: "verticalAlign",
      values: ["top", "bottom"],
      description: "Its content at the `top` or `bottom` instead of the middle (`top aligned`)."
    },
    {
      name: "show-on",
      kind: "enum",
      values: ["hover", "click"],
      description:
        "Shows by itself:  `hover` while the pointer is over its parent (or focus is inside), `click` when the " +
        "parent is clicked.  Default:  only `visible` shows it."
    },
    {
      name: "closedby",
      kind: "enum",
      values: ["any", "closerequest", "none"],
      default: "any",
      property: "closedBy",
      description:
        "What hides it, as `<dialog closedby>`:  `any` -- a click on the dimmer (not its content) or Escape (a " +
        "page dimmer) -- the default;  `closerequest` -- Escape only;  `none` -- only `visible`.  A `hover` " +
        "dimmer ignores clicks.  Read when it shows."
    }
  ],
  events: [
    {
      name: "ui-open",
      detail: "{ visible: true, originalEvent?: Event }",
      cancelable: true,
      description:
        "About to show for a person's action (`show-on`, an invoker command);  `preventDefault()` keeps it hidden."
    },
    {
      name: "ui-show",
      detail: "{ visible: true }",
      description: "Shown, its transition finished (Fomantic's `onVisible`)."
    },
    {
      name: "ui-close",
      detail: "{ visible: false, reason: DimmerCloseReason, originalEvent?: Event }",
      cancelable: true,
      description: "About to hide:  a click on it, Escape, the pointer leaving.  `preventDefault()` keeps it shown."
    },
    {
      name: "ui-hide",
      detail: "{ visible: false }",
      description: "Hidden, its transition finished (Fomantic's `onHidden`)."
    }
  ],
  slots: [{ name: "", description: "The content, centred:  a header, a loader, buttons ..." }],
  parts: [
    { name: "dimmer", description: "The dimmer:  a `<div>` over its parent, or a `<dialog>` over the page." },
    { name: "content", description: "The centred box around the slot." }
  ],
  states: [
    { name: "dimmer", description: "Always:  the page sheet positions the parent of an element dimmer by it." },
    { name: "page", description: "A page dimmer." },
    { name: "on-hover", description: '`show-on="hover"`:  laid out (transparent) while hidden, so Tab can reach it.' }
  ],
  texts: [{ key: "dimmedPage", text: "Dimmed page", description: "Accessible name of an unnamed page dimmer." }]
} as const satisfies E.ComponentVocabulary
