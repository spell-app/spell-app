/**
 * Every name `<ui-include>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The source pieces (`source`, `load`, `ui-load` ... `ui-error`, the loader / error parts, the states and texts)
 *   are shared with `<ui-code>` and `<ui-markdown>`:  `UIT.SOURCE_*`, which `SourceElement` reads.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"

/****************
 * ### `<ui-include>`
 * Another page of this site, shown here:  `source`'s `<body>` (or its `select` match), in a shadow root, or in the
 * light DOM with `page-styles`.
 ****************/
export const includeVocabulary = {
  tag: "ui-include",
  topics: ["containers", "layout", "modules"],
  aka: ["island", "partial", "fragment", "server-side include", "html import", "transclusion", "embed"],
  skeleton: "4 line paragraph",
  noun: "include",
  description:
    "An include shows part of another page from this site in this one, loaded at once, when idle or when scrolled into view.",
  attributes: [
    ...UIT.SOURCE_ATTRIBUTES,
    {
      name: "select",
      kind: "string",
      description:
        "CSS selector:  include only the first element of `source` it matches (default:  everything in its `<body>`).  " +
        "With it, `save()` saves just that element, by its `id`."
    },
    {
      name: "page-styles",
      kind: "boolean",
      property: "pageStyles",
      description:
        "Put the included markup in the element's LIGHT DOM, so the page's stylesheets style it.  Default:  a shadow " +
        "root, where only inherited values (fonts, colours, `--ui-*` tokens) reach it."
    }
  ],
  events: [
    ...UIT.SOURCE_EVENTS,
    {
      name: "ui-insert",
      detail: "{ fragment: DocumentFragment, source?: string }",
      description:
        "The markup is about to go in:  `fragment` holds it, parsed and URL-rewritten, not yet in the page.  A " +
        "listener may read or change it first (a docs page keeps its examples' markup before they upgrade)."
    }
  ],
  slots: [
    {
      name: "",
      description: "Placeholder shown until the include loads (e.g. a server-rendered copy), then replaced."
    }
  ],
  parts: [...UIT.SOURCE_PARTS, { name: "content", description: "The box around the included markup (shadow root)." }],
  states: [...UIT.SOURCE_STATES],
  texts: [...UIT.SOURCE_TEXTS]
} as const satisfies E.ComponentVocabulary
