/**
 * Every name `<ui-docs-toc>` uses:  tag, attributes, events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - A DOC-ONLY element (`src/docs-components/`):  filed under the `documentation` topic, left out of the component
 *   list, loaded by `<ui-root>` like any family.
 * - Class words:  `size` (`ui small toc`);  what's current is the items' `selected`, not a class of its own.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-docs-toc>`
 * Fomantic's docs "On this page" rail menu:  the page's sections and their examples as links, following the scroll.
 ****************/
export const docsTocVocabulary = {
  tag: "ui-docs-toc",
  topics: ["documentation", "navigation"],
  aka: ["table of contents", "on this page", "page index", "scrollspy", "toc", "following menu"],
  skeleton: "short line, 6 line paragraph",
  noun: "toc",
  description:
    "A table of contents lists the page's sections and examples as links, opens the one in view and follows the " +
    "scroll.",
  attributes: [
    {
      name: "for",
      kind: "string",
      property: "htmlFor",
      description:
        "Id of the element whose headings to list.  A `<ui-tabs>`:  its SHOWN pane, followed as the tabs switch.  " +
        "Default:  the page's `<main>`, else `<body>`."
    },
    {
      name: "header",
      kind: "string",
      description: "Title above the links, e.g. the page's name (Fomantic's `Button`)."
    },
    { name: "size", kind: "size", default: "small", description: "Text size, `mini` ... `massive`." },
    {
      name: "expanded",
      kind: "keyOnly",
      description: "Show every section's entries, not only the current section's (Fomantic opens the one in view)."
    }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ value: string }",
      description: "The entry in view changed (scroll, a link, the tabs);  `value` is its target's id."
    },
    {
      name: "ui-render",
      detail: "{ ids: string[] }",
      description: "The list was built (again):  the ids of every entry, in page order."
    }
  ],
  slots: [],
  parts: [
    { name: "toc", description: 'The whole box (`<div class="ui toc">`).' },
    { name: "header", description: "The `<ui-header>` with `header`'s text." },
    { name: "menu", description: "The `<ui-menu vertical text>` of sections (a navigation landmark)." },
    { name: "section", description: "A section's link `<ui-item>` (a level 2 heading, a top-level `<ui-section>`)." },
    {
      name: "entries",
      description:
        "The `<ui-menu>` of a section's entries (examples, level 3 headings, nested `<ui-section>`s);  nested again " +
        "under an entry with its own."
    },
    { name: "entry", description: "One entry's link `<ui-item>`." }
  ],
  states: [{ name: "empty", description: "Nothing to list (the followed content has no headings)." }],
  texts: [{ key: "label", text: "On this page", description: "Accessible name of the links' landmark." }]
} as const satisfies E.ComponentVocabulary
