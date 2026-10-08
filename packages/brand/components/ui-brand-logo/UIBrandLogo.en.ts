/**
 * The English vocabulary of `<ui-brand-logo>`:  every name the tag uses.
 * - The shape is `ComponentVocabulary`.
 * - Pure data:  `import type` only.
 * - `variant` and `tone` are not class words:  the component draws the outline and sets its colour.
 */

import type { ComponentVocabulary } from "$/ui/core"

/****************
 * ### `brandLogoVocabulary`
 * The names of `<ui-brand-logo>`, the Spell logo, outlined (no font needed):
 * the hat mark, or a lockup (mark + wordmark), in one colour.
 ****************/
export const brandLogoVocabulary = {
  tag: "ui-brand-logo",
  topics: ["images", "icons"],
  aka: ["logo", "lockup", "wordmark", "brand mark", "hat mark"],
  skeleton: "2 tall",
  noun: "logo",
  ui: false,
  description: "The Spell logo:  the hat mark, or the mark with the wordmark (and tagline), outlined, in one colour.",
  attributes: [
    {
      name: "variant",
      kind: "enum",
      values: ["mark", "lockup", "tagline", "app"],
      default: "mark",
      description:
        "Which:  `mark` (the hat), `lockup` (hat + Spell), `tagline` (+ All magic, no fuss.), `app` (hat + Spell App)."
    },
    {
      name: "tone",
      kind: "enum",
      values: ["ink", "purple", "lilac", "aubergine", "white", "current"],
      default: "ink",
      description:
        "Colour:  `ink` (the theme's strongest text), `purple`, `lilac`, `aubergine`, `white`, `current` (`currentColor`)."
    },
    {
      name: "label",
      kind: "string",
      description: 'Accessible name;  default `Spell` (`Spell App`).  `""`:  decorative, hidden from screen readers.'
    }
  ],
  events: [],
  slots: [],
  parts: [{ name: "logo", description: "The `<svg>`." }],
  states: [],
  texts: [
    { key: "spell", text: "Spell", description: "Default name of the mark and the lockups." },
    { key: "spellApp", text: "Spell App", description: "Default name of the `app` lockup." }
  ]
} as const satisfies ComponentVocabulary
