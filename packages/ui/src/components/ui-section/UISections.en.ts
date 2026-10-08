/**
 * The English vocabulary of `<ui-sections>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots, parts and states.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - The attributes become Fomantic's class words (`ClassBuilder`):
 *   `<ui-sections collapsing>` => `ui collapsing sections`.
 * - `ownsParts: ["section"]`:  a `<ui-section>` finds its group the way it finds an enclosing section
 *   (`PartContext`), so its default `collapsible` follows the NEAREST group, at any depth (`UISection.group`).
 */

import type { E } from "$/ui/core"

/****************
 * ### `sectionsVocabulary`
 * The names of `<ui-sections>`, a run of sections:  `<div class="ui ... sections" part="group">` around a slot.
 ****************/
export const sectionsVocabulary = {
  tag: "ui-sections",
  topics: ["layout", "containers"],
  aka: ["accordion", "section group", "collapsible group", "outline"],
  noun: "sections",
  description:
    "A group of sections:  with `collapsing`, every section in it folds, and folded ones stack with no space between.",
  attributes: [
    {
      name: "collapsing",
      kind: "keyOnly",
      description:
        "Every section in the group, sub-sections included, folds by default (as if `collapsible`);  folded " +
        'ones stack with no space between.  A section opts out with `collapsible="false"`.'
    }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-section>`s, and anything between them." }],
  parts: [{ name: "group", description: "The group box." }],
  states: [
    { name: "in-section", description: "Inside a section." },
    { name: "in-sections", description: "Inside another `<ui-sections>`." }
  ],
  texts: [],
  ownsParts: ["section"]
} as const satisfies E.ComponentVocabulary
