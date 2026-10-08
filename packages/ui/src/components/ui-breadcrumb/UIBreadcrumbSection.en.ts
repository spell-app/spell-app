/**
 * The English vocabulary of `<ui-breadcrumb-section>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), events, slots, parts, states and texts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - How the family's attributes become class words:  `UIBreadcrumb.en.ts`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `breadcrumbSectionVocabulary`
 * The names of `<ui-breadcrumb-section>`, one step of the trail:  its own divider,
 * then `<a class="section">` or the active `<span class="active section">`.
 ****************/
export const breadcrumbSectionVocabulary = {
  tag: "ui-breadcrumb-section",
  topics: ["navigation", "collections"],
  aka: ["crumb", "breadcrumb item"],
  noun: "section",
  ui: false,
  description: "A section of a breadcrumb:  a link to a level of the hierarchy, or the current page.",
  attributes: [
    {
      name: "active",
      kind: "keyOnly",
      description: 'The current page:  bold, not a link, `aria-current="page"`.'
    },
    { name: "href", kind: "string", description: "Renders a link (`<a>`) to this level." },
    { name: "target", kind: "string", description: "Link target, with `href`." }
  ],
  events: [],
  slots: [{ name: "", description: "The section's text (and an optional `<ui-icon>`)." }],
  parts: [
    { name: "section", description: "The section (`<a>`, or `<span>` when active or without `href`)." },
    { name: "divider", description: "The divider before it, drawn from the breadcrumb's tokens;  hidden on the first." }
  ],
  states: [{ name: "active", description: "The current page." }],
  texts: []
} as const satisfies E.ComponentVocabulary
