/**
 * Every name `<ui-statistic>` and `<ui-statistics>` use:  tags, attributes (kind + allowed values), slots, parts,
 * states.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:  `<ui-statistic size="large" color="red"
 *   horizontal>` => `ui large red horizontal statistic`;  `<ui-statistics widths="3" stackable>` => `ui stackable
 *   three statistics`.  `statistic.css` keys on those words.
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
 * ### `<ui-statistic>`
 * A statistic:  `<div class="ui ... statistic" part="statistic">` holding the `value` shorthand, the slot and the
 * `label` shorthand.
 ****************/
export const statisticVocabulary = {
  tag: "ui-statistic",
  noun: "statistic",
  plural: "statistics",
  description: "A statistic emphasizes the current value of an attribute.",
  attributes: [
    { name: "size", kind: "size", description: "Size of the value, `mini` ... `massive`;  `medium` is the default." },
    { name: "color", kind: "color", description: "Hue of the value." },
    { name: "horizontal", kind: "keyOnly", description: "Value and label on one line." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme, a white value." },
    { name: "fluid", kind: "keyOnly", description: "Takes the full width of its container." },
    {
      name: "floated",
      kind: "valueAndKey",
      values: "floats",
      description: "Floats to the `left` / `right` of the content after it."
    },
    { name: "value", kind: "string", description: "Shorthand for a `<ui-value>`:  the number (or word) shown." },
    {
      name: "text",
      kind: "boolean",
      description: "The `value` shorthand is a WORD (`text value`):  smaller, bold, at least two lines tall."
    },
    { name: "label", kind: "string", description: "Shorthand for the label below the value." }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-value>` and `<ui-label>` parts, in display order." }],
  parts: [
    { name: "statistic", description: "The statistic box." },
    { name: "value", description: "The `value` shorthand." },
    { name: "label", description: "The `label` shorthand." }
  ],
  states: [
    {
      name: "statistic",
      description:
        "ALWAYS set:  `statistic.css` spaces a statistic after another by it (a shadow root can't see its host's sibling)."
    },
    { name: "inverted", description: "For dark backgrounds." }
  ],
  texts: [],
  ownsParts: ["value", "label"]
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-statistics>`
 * A group of statistics sharing one look:  `<div class="ui ... statistics" part="group">`.
 ****************/
export const statisticsVocabulary = {
  tag: "ui-statistics",
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
