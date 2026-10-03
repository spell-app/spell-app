/**
 * Every name `<ui-steps>` and `<ui-step>` use:  tags, attributes (kind + allowed values), slots, parts, states,
 * texts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:  `<ui-steps ordered vertical="right"
 *   widths="3">` => `ui ordered right vertical three steps`;  `<ui-step selected completed>` => `completed active
 *   step` (a step has no `ui`, as Fomantic's `.ui.steps > .step`).  `ui-step.css` keys on those words.
 * - Chosen state:  `selected` is canonical (`AGENTS.md`), its class word Fomantic's `active`;  an `active`
 *   ATTRIBUTE is accepted as an alias (the element reads it through `HostAttribute`).  The selected step is the
 *   CURRENT one:  `aria-current="step"`.
 * - Content is the generic parts, owned by the step (`ownsParts`):  `<ui-content>`, `<ui-title>`,
 *   `<ui-description>`;  or the shorthands `header` (the title -- NOT `title`, the global tooltip attribute and an
 *   `HTMLElement` property, as the popup's `header`) and `description`.
 */

import * as UIT from "$/ui/components/components.types"
import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-steps>`
 * A step group:  `<ol class="ui ... steps" part="steps" role="list">` around the slot.
 ****************/
export const stepsVocabulary = {
  tag: "ui-steps",
  topics: ["navigation", "progress", "status", "elements"],
  aka: ["stepper", "wizard", "progress steps", "checkout steps"],
  skeleton: { height: "5em" },
  noun: "steps",
  description: "A set of steps shows the progress of an activity in a series of steps.",
  attributes: [
    { name: "size", kind: "size", description: "Size of every step, `mini` ... `massive`;  `medium` is the default." },
    {
      name: "color",
      kind: "color",
      description: "Circular steps:  hue of the rings of the current and completed steps (default the positive colour)."
    },
    { name: "ordered", kind: "keyOnly", description: "Numbers each step;  a completed step shows a check instead." },
    {
      name: "vertical",
      kind: "keyOrValueAndKey",
      values: ["right"],
      description: 'Stacked top to bottom;  `vertical="right"` for a group on the right of its content (arrow at left).'
    },
    {
      name: "circular",
      kind: "keyOnly",
      description: "Fomantic's circular steps:  a ring per step on a connecting line, the content beside it."
    },
    { name: "fluid", kind: "keyOnly", description: "Takes the full width of its container." },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom"],
      description: 'Joined to a segment below (`attached`, `"top"`) or above (`"bottom"`), overlapping its border.'
    },
    {
      name: "unstackable",
      kind: "keyOnly",
      description:
        "Never stacks;  by default steps stack below 768px of the group's width (or the screen's:  `stack-with`)."
    },
    {
      name: "stackable",
      kind: "valueAndKey",
      values: ["tablet"],
      description:
        "`stackable=\"tablet\"`:  stacks below 992px (of the group's width, or the screen's), not just 768px."
    },
    {
      name: "stack-with",
      kind: "enum",
      values: UIT.STACK_WITH_VALUES,
      description:
        'What stacking (and `stackable="tablet"`) measures:  `container` (the default) -- the group\'s own ' +
        "width;  `page` -- the screen's, as in Fomantic.  Unset:  the page-wide `--ui-stack-with` token " +
        "decides (`<ui-root stack-with>`)."
    },
    {
      name: "widths",
      kind: "width",
      widthClass: "",
      values: ["1", "2", "3", "4", "5", "6", "7", "8"],
      description: 'Divides the group evenly between N steps:  `widths="3"` => `three steps`.'
    },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds." }
  ],
  events: [],
  slots: [{ name: "", description: "`<ui-step>`s." }],
  parts: [{ name: "steps", description: "The group box (an `<ol>`)." }],
  states: [
    { name: "steps", description: "ALWAYS set:  the host is a block and the size container `stackable` answers." }
  ],
  texts: []
} as const satisfies ComponentVocabulary
