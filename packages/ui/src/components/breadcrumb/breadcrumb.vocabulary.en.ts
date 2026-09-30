/**
 * Every name `<ui-breadcrumb>` and `<ui-breadcrumb-section>` use:  tags, attributes (kind + allowed values),
 * slots, parts, states, texts.  Schema:  `ComponentVocabulary` (`$/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-breadcrumb size="large" inverted>` => `ui large inverted breadcrumb`;
 *   `<ui-breadcrumb-section active>` => `active section` (no `ui`:  Fomantic styles sections by context).
 * - Dividers are drawn by each section from tokens the breadcrumb publishes (`--ui-breadcrumb-divider*`,
 *   `BREADCRUMB_DIVIDER_TOKENS`), see `breadcrumb.css`.
 */

import type { ComponentVocabulary } from "$/vocabulary"

/****************
 * ### `<ui-breadcrumb>`
 * A breadcrumb trail:  `<nav class="ui ... breadcrumb" aria-label>` around an `<ol>` of sections.
 ****************/
export const breadcrumbVocabulary = {
  tag: "ui-breadcrumb",
  noun: "breadcrumb",
  description: "A breadcrumb is used to show hierarchy between content.",
  attributes: [
    { name: "size", kind: "size", description: "Text size, `mini` ... `massive`;  `medium` is the default." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme." },
    {
      name: "divider",
      kind: "string",
      description: "Text drawn between sections, e.g. `›` (`/` when unset);  published as `--ui-breadcrumb-divider`."
    },
    {
      name: "divider-icon",
      kind: "string",
      description:
        "Icon name drawn between sections instead of `divider`, e.g. `chevron right`;  published as " +
        "`--ui-breadcrumb-divider-icon`."
    }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-breadcrumb-section>`s, in order." }],
  parts: [
    { name: "breadcrumb", description: "The `<nav>` box." },
    { name: "list", description: "The `<ol>` the sections are items of." }
  ],
  states: [],
  texts: [{ key: "label", text: "Breadcrumb", description: "Accessible name of the `<nav>` landmark." }]
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-breadcrumb-section>`
 * One step of the trail:  its own divider, then `<a class="section">` or the active `<span class="active section">`.
 ****************/
export const breadcrumbSectionVocabulary = {
  tag: "ui-breadcrumb-section",
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
} as const satisfies ComponentVocabulary
