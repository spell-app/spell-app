/**
 * The English vocabulary of `<ui-include>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), events, slots, parts, states and texts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The source pieces (`source`, `load`, `ui-load` ... `ui-error`, the loader and error parts, the states and texts)
 *   are shared with `<ui-code>` and `<ui-markdown>`:  `UIT.Source*`, which `LoadableComponent` reads.
 */

import type { E } from "$/ui/core"
import * as UIT from "$/ui/components/components.types"

/****************
 * ### `includeVocabulary`
 * The names of `<ui-include>`, another page of this site shown here:
 * `source`'s `<body>` (or its `select` match), in a shadow root, or in the light DOM with `page-styles`.
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
    ...UIT.SourceAttributes,
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
    ...UIT.SourceEvents,
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
  parts: [...UIT.SourceParts, { name: "content", description: "The box around the included markup (shadow root)." }],
  states: [...UIT.SourceStates],
  texts: [...UIT.SourceTexts]
} as const satisfies E.ComponentVocabulary
