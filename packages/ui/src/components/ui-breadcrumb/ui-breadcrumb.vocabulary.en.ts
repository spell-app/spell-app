/**
 * Every name `<ui-breadcrumb>` and `<ui-breadcrumb-section>` use:  tags, attributes (kind + allowed values),
 * slots, parts, states, texts.  Schema:  `E.ComponentVocabulary`.
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-breadcrumb size="large" inverted>` => `ui large inverted breadcrumb`;
 *   `<ui-breadcrumb-section active>` => `active section` (no `ui`:  Fomantic styles sections by context).
 * - Dividers are drawn by each section from tokens the breadcrumb publishes (`--ui-breadcrumb-divider*`,
 *   `BREADCRUMB_DIVIDER_TOKENS`), see `ui-breadcrumb.css`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-breadcrumb>`
 * A breadcrumb trail:  `<nav class="ui ... breadcrumb" aria-label>` around an `<ol>` of sections.
 ****************/
export const breadcrumbVocabulary = {
  tag: "ui-breadcrumb",
  topics: ["navigation", "basic", "collections"],
  aka: ["crumbs", "path", "trail", "location"],
  skeleton: { parts: [{ shape: "line", length: "medium" }] },
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
} as const satisfies E.ComponentVocabulary
