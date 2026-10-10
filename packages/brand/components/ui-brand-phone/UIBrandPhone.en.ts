/**
 * The English vocabulary of `<ui-brand-phone>`:  every name the tag uses.
 * - The shape is `E.ComponentVocabulary`.
 * - Pure data:  `import type` only.
 * - Class words:  `dimmed` writes its name;  `time` and `label` write none.
 */

import type { E } from "$/ui/core"

/****************
 * ### `brandPhoneVocabulary`
 * The names of `<ui-brand-phone>`, a phone frame around live app content:  a rounded ivory device with a status bar
 * (time, signal, wifi, battery) on top, the app below.  The Spell App's Build screen preview.
 ****************/
export const brandPhoneVocabulary = {
  tag: "ui-brand-phone",
  topics: ["containers", "media"],
  aka: ["phone frame", "device frame", "phone mockup", "device mockup", "app preview", "mobile preview"],
  skeleton: "18.75 x 32",
  noun: "phone",
  ui: false,
  description: "A brand phone frames live app content as a phone:  a status bar on top, the app below.",
  attributes: [
    {
      name: "time",
      kind: "string",
      default: "9:41",
      description: "The status bar's clock:  any text, default `9:41`."
    },
    {
      name: "dimmed",
      kind: "keyOnly",
      description: "Fades the phone (to 45%) while its app is being built, and marks it busy (`aria-busy`)."
    },
    {
      name: "label",
      kind: "string",
      description:
        'Accessible name of the region around the app;  default `App preview`.  `""`:  no region, just a frame.'
    }
  ],
  events: [],
  slots: [{ name: "", description: "The app:  its title, cards, controls.  Each child is spaced 12px apart." }],
  parts: [
    { name: "phone", description: "The frame:  a `<section>`, the region named `label`." },
    { name: "status", description: "The status bar (hidden from screen readers)." },
    { name: "time", description: "The status bar's clock." },
    { name: "icons", description: "The status bar's signal, wifi and battery icons." }
  ],
  states: [],
  texts: [{ key: "appPreview", text: "App preview", description: "Default name of the region around the app." }]
} as const satisfies E.ComponentVocabulary
