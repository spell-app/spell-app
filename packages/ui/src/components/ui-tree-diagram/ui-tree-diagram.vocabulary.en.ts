/**
 * Every name `<ui-tree-diagram>` uses:  tag, attributes (kind + allowed values), parts, texts.  Schema:
 * `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Ours, not Fomantic's (2026-10-05, epic `output-targets` P4):  first drawn for spell's parse trees, but GENERIC.
 * - One rich property, `tree` (a `TreeDiagramNode`, `ui-tree-diagram.types.ts`);  a static page gives it as a
 *   `<script type="application/json">` child instead.  No class words:  the class grammar is `ui tree diagram`, plus
 *   `empty` with nothing to draw.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-tree-diagram>`
 * A tree, drawn top-down as an SVG:  `<svg class="ui tree diagram" part="diagram" role="img" aria-label>`.
 ****************/
export const treeDiagramVocabulary = {
  tag: "ui-tree-diagram",
  topics: ["data display", "images", "views"],
  aka: [
    "tree",
    "tree chart",
    "hierarchy",
    "hierarchy diagram",
    "org chart",
    "parse tree",
    "syntax tree",
    "AST",
    "dendrogram"
  ],
  skeleton: { height: "12em" },
  noun: "tree diagram",
  description: "A tree diagram draws a tree top-down:  a box for each node, a line to each of its children.",
  attributes: [
    {
      name: "tree",
      kind: "json",
      reflect: false,
      description:
        "The tree to draw, a `TreeDiagramNode`:  `label`, and optional `detail`, `slot`, `title` and `children`.  A " +
        'JS property (JSON in the attribute);  wins over a `<script type="application/json">` child.  Set a NEW ' +
        "tree to redraw."
    }
  ],
  events: [],
  slots: [],
  parts: [
    { name: "diagram", description: "The `<svg>`." },
    { name: "node", description: "Each node's `<g>`:  its box, label and detail." },
    { name: "root-node", description: "The root's `<g>`, also part `node`." },
    { name: "edge", description: "Each line from a parent to a child." },
    { name: "slot-label", description: "Each slot label, on its line." }
  ],
  states: [],
  texts: [
    {
      key: "summary",
      text: "Tree:  {label}, with {count} children",
      description: "Name of a tree whose root has children."
    },
    {
      key: "summaryOne",
      text: "Tree:  {label}, with 1 child",
      description: "Name of a tree whose root has one child."
    },
    { key: "summaryLeaf", text: "Tree:  {label}", description: "Name of a tree of one node." }
  ]
} as const satisfies ComponentVocabulary
