/**
 * Every name `<ui-docs-example>` uses:  tag, attributes, events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - A DOC-ONLY element (`src/docs-components/`):  filed under the `documentation` topic, left out of the component
 *   list, loaded by `<ui-root>` like any family.
 * - Class words:  `bare`, `variation` (`ui bare example`);  the open state is `:state(open)`, not a class.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-docs-example>`
 * Fomantic's docs example block:  a header and description, its own children LIVE, and their source in a code pane
 * the code button shows and hides.
 ****************/
export const docsExampleVocabulary = {
  tag: "ui-docs-example",
  topics: ["documentation", "data display"],
  aka: ["example", "demo", "live example", "code sample", "playground", "show code"],
  skeleton: { parts: [{ shape: "header" }, { shape: "paragraph", lines: 2 }] },
  noun: "example",
  description:
    "An example shows its own markup live, under a header and description, with the same markup as code a button " +
    "shows and hides.",
  attributes: [
    { name: "header", kind: "string", description: "Its title, e.g. `Emphasis`:  Fomantic's `h4` above the example." },
    {
      name: "description",
      kind: "string",
      description:
        "One sentence under the header;  `` `x` `` becomes code.  Slot `description` for richer text (links, " +
        "several paragraphs)."
    },
    {
      name: "level",
      kind: "number",
      default: 4,
      description: "Heading level of the header, `1` ... `6`:  Fomantic's examples are `h4`, under the section's `h2`."
    },
    {
      name: "code",
      kind: "boolean",
      description:
        "The code pane is open;  the code button toggles it, so it's the LIVE state too (reflected, `ui-toggle`).  " +
        "Set it in markup to open the code at start."
    },
    {
      name: "language",
      kind: "string",
      default: "html",
      description:
        "Language of the code pane (`<ui-code language>`).  The source is the markup, so `html` unless a " +
        "`code` child says otherwise."
    },
    {
      name: "bare",
      kind: "keyOnly",
      description: "No segment frame around the live example and code, even while the code is open."
    },
    {
      name: "variation",
      kind: "keyOnly",
      description:
        "Fomantic's smaller variation style:  a smaller header and less space around it, for a run of " +
        "small examples under one heading."
    }
  ],
  events: [
    {
      name: "ui-toggle",
      detail: "{ open: boolean, originalEvent?: Event }",
      description: "The code button opened or closed the code pane."
    }
  ],
  slots: [
    {
      name: "",
      description:
        "The example itself, shown live;  its markup is the code shown.  A `<template>` child instead:  stamped out " +
        "live, and its markup shown EXACTLY as written."
    },
    { name: "description", description: "Rich description, in place of the `description` attribute." }
  ],
  parts: [
    { name: "example", description: "The whole block (`<section>`)." },
    { name: "header", description: "The `<ui-header>` title." },
    { name: "toggle", description: 'The code button (`<ui-button circular basic icon="code">`).' },
    { name: "description", description: "The description under the header." },
    { name: "demo", description: "The `<ui-segment>` around the live example." },
    { name: "code", description: "The `<ui-segment>` around the code pane." },
    { name: "source", description: "The `<ui-code>` showing the markup." }
  ],
  states: [{ name: "open", description: "The code pane is open." }],
  texts: [
    { key: "showCode", text: "Show code", description: "The code button's label while the code is hidden." },
    { key: "hideCode", text: "Hide code", description: "The code button's label while the code shows." }
  ]
} as const satisfies ComponentVocabulary
