/**
 * The English vocabulary of `<ui-step>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), slots, parts, states and texts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-steps ordered vertical="right" widths="3">` => `ui ordered right vertical three steps`;
 *   `<ui-step selected completed>` => `completed active step` (a step has no `ui`, as Fomantic's `.ui.steps > .step`).
 *   `UIStep.css` keys on those words.
 * - Chosen state:  `selected` is canonical (`AGENTS.md`), its class word Fomantic's `active`;
 *   an `active` ATTRIBUTE is accepted as an alias (the element reads it raw, through `attributes`).
 *   The selected step is the CURRENT one:  `aria-current="step"`.
 * - Content is the generic parts, owned by the step (`ownsParts`):  `<ui-content>`, `<ui-title>`,
 *   `<ui-description>`;  or the shorthands `header` (the title -- NOT `title`, the global tooltip attribute and an
 *   `HTMLElement` property, as the popup's `header`) and `description`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `stepVocabulary`
 * The names of `<ui-step>`, one step:  `<div class="[keyOnly ...] step" part="step">` (`<a>` with `href`,
 * `<button>` with `link`) holding the icon box, the shorthand content and the slot.
 ****************/
export const stepVocabulary = {
  tag: "ui-step",
  topics: ["navigation", "progress", "content parts", "elements"],
  aka: ["wizard step", "stage"],
  noun: "step",
  ui: false,
  description: "One step of a set of steps.",
  attributes: [
    {
      name: "color",
      kind: "color",
      description: "Circular steps:  hue of this step's ring and line, whatever its state."
    },
    {
      name: "selected",
      kind: "keyOnly",
      key: "active",
      description:
        'The CURRENT step (`aria-current="step"`).  Alias:  `active`.  NOTE: Fomantic\'s word for it is `active`.'
    },
    { name: "completed", kind: "keyOnly", description: "Done:  its icon (or number) becomes a check." },
    { name: "disabled", kind: "keyOnly", description: "Not available yet:  dimmed, and a link step isn't followed." },
    {
      name: "link",
      kind: "keyOnly",
      description: "Clickable without `href`:  renders a `<button>`, with the link hover.  The page handles `click`."
    },
    { name: "href", kind: "string", description: "Renders a link (`<a>`) styled as a step." },
    { name: "target", kind: "string", description: "Link target, with `href`." },
    { name: "icon", kind: "icon", description: "Icon name, before the content." },
    { name: "header", kind: "string", description: "Shorthand for the title (Fomantic's `.title`)." },
    { name: "description", kind: "string", description: "Shorthand for the description under the title." }
  ],
  events: [],
  slots: [
    { name: "", description: "Content:  `<ui-content>` with `<ui-title>` / `<ui-description>`, or those parts alone." },
    { name: "icon", description: "Icon, instead of the `icon` attribute (a check replaces it once `completed`)." }
  ],
  parts: [
    { name: "step", description: "The step box (`<div>`, `<a>` or `<button>`)." },
    { name: "icon", description: "The icon box." },
    { name: "content", description: "The shorthand content block." },
    { name: "title", description: "The `header` shorthand." },
    { name: "description", description: "The `description` shorthand." }
  ],
  states: [
    { name: "selected", description: "The current step (`selected` or `active`)." },
    { name: "completed", description: "Done." },
    { name: "disabled", description: "Not available." },
    {
      name: "content",
      description: "Has content (shorthand or slotted):  a last circular step then takes the rest of the row."
    }
  ],
  texts: [
    {
      key: "stepCompleted",
      text: "Completed",
      description: "Visually hidden after a completed step's content:  the check alone says nothing to a screen reader."
    }
  ],
  ownsParts: ["content", "title", "description"]
} as const satisfies E.ComponentVocabulary
