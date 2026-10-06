/**
 * Every name `<ui-loader>` uses:  tag, attributes (kind + allowed values), slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Pure data:  node imports it (`yarn site:data`, `yarn gen:root`), so `$/ui/core` for types only.
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-loader size="large" color="red" speed="slow" active inline>` => `ui large red slow active inline loader`.
 * - `speed` is `kind: "valueOnly"` because it emits its value alone (`slow` / `fast`), like dropdown's `state`.
 * - Accessibility:  the host is `role="status"` + `aria-live="polite"` (internals);  with no slotted text its
 *   accessible name is the `loading` text.  The spinner is decorative.  See `ui-loader.css`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-loader>`
 * A loader:  `<div class="ui ... loader" part="loader">` around a slot for its text.
 ****************/
export const loaderVocabulary = {
  tag: "ui-loader",
  topics: ["loading", "feedback", "progress", "elements"],
  aka: ["spinner", "loading indicator", "busy", "throbber", "activity indicator"],
  skeleton: "none",
  noun: "loader",
  description: "A loader tells people to wait for an activity to complete.",
  attributes: [
    {
      name: "size",
      kind: "size",
      description: "Spinner and text size, `mini` ... `massive`;  `medium` is the default."
    },
    { name: "color", kind: "color", description: "Hue of the turning arc." },
    {
      name: "speed",
      kind: "valueOnly",
      values: ["slow", "fast"],
      description: "Spin `slow` or `fast`;  absent is normal."
    },
    {
      name: "active",
      kind: "keyOnly",
      description: "Shown.  A loader is hidden unless `active` (Fomantic's rule), or inside an active dimmer."
    },
    { name: "disabled", kind: "keyOnly", description: "Hidden, even when `active`." },
    { name: "text", kind: "keyOnly", description: "Shows the slotted text below the spinner." },
    {
      name: "inline",
      kind: "keyOnly",
      description: "Sits in the text flow instead of centred over its positioned container."
    },
    { name: "centered", kind: "keyOnly", description: "With `inline`:  a block of its own, centred." },
    { name: "indeterminate", kind: "keyOnly", description: "Unsure how long it'll take:  turns backwards, slower." },
    { name: "double", kind: "keyOnly", description: "Two opposite arcs." },
    { name: "elastic", kind: "keyOnly", description: "Two arcs that stretch and chase each other." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  a white arc on a faint track." }
  ],
  events: [],
  slots: [{ name: "", description: "Text shown below the spinner, with `text`;  also the accessible name." }],
  parts: [{ name: "loader", description: "The loader box;  its `::before` is the track, `::after` the arc." }],
  states: [
    { name: "active", description: "Shown." },
    { name: "disabled", description: "Hidden." }
  ],
  texts: [
    { key: "loading", text: "Loading…", description: "Accessible name of the `status` host when nothing is slotted." }
  ]
} as const satisfies E.ComponentVocabulary
