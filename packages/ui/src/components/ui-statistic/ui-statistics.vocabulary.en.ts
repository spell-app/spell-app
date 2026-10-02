/**
 * Every name `<ui-statistic>` and `<ui-statistics>` use:  tags, attributes (kind + allowed values), slots, parts,
 * states.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:  `<ui-statistic size="large" color="red"
 *   horizontal>` => `ui large red horizontal statistic`;  `<ui-statistics widths="3" stackable>` => `ui stackable
 *   three statistics`.  `ui-statistic.css` keys on those words.
 * - Content is the GENERIC parts, owned by the statistic (`ownsParts`):  `<ui-value>` (Fomantic's `.value`) and
 *   `<ui-label>` (Fomantic's `.label`).  There is NO separate label part tag:  a `<ui-label>` inside a statistic
 *   already renders as that statistic's `.label` part (`UILabel`, `:state(in-statistic)`), so the one word "label"
 *   keeps meaning one element, and a `<ui-label-part>` / `<ui-caption>` would only be a second spelling of it.
 * - Shorthand:  `value` / `label` render the same two parts inside the statistic's own shadow root, the value
 *   BEFORE the slot and the label AFTER it, so either pairs with a slotted part;  slotted parts keep their order, so
 *   a `<ui-label>` before a `<ui-value>` is Fomantic's top label.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-statistics>`
 * A group of statistics sharing one look:  `<div class="ui ... statistics" part="group">`.
 ****************/
export const statisticsVocabulary = {
  tag: "ui-statistics",
  topics: ["data display", "layout", "views"],
  aka: ["stats", "kpis", "metrics", "dashboard numbers"],
  skeleton: null,
  noun: "statistics",
  description: "A group of statistics.",
  attributes: [
    { name: "size", kind: "size", description: "Size of every statistic in the group." },
    { name: "color", kind: "color", description: "Hue of every value in the group." },
    { name: "horizontal", kind: "keyOnly", description: "Statistics stacked, each with its label beside its value." },
    { name: "inverted", kind: "keyOnly", description: "Every statistic for dark backgrounds." },
    {
      name: "stackable",
      kind: "keyOnly",
      description: "Below 768px of the GROUP's width (a container query), one statistic per row, full width."
    },
    {
      name: "widths",
      kind: "width",
      widthClass: "",
      values: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      description: 'Divides each row evenly between N statistics:  `widths="3"` => `three statistics`.'
    }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-statistic>`s." }],
  parts: [{ name: "group", description: "The group box." }],
  states: [
    { name: "statistics", description: "ALWAYS set:  the group's host is a block and the `ui-statistics` container." }
  ],
  texts: []
} as const satisfies ComponentVocabulary
