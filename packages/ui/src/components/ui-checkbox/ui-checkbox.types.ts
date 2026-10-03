/**
 * Loose constants of the checkbox family:  the vocabulary pieces `<ui-checkbox>` and `<ui-radio>` share.
 * - Data only:  no imports, so the vocabulary files and the element classes can both read it.
 */

import type { checkboxVocabulary } from "./ui-checkbox.vocabulary.en"
import { radioVocabulary } from "./ui-radio.vocabulary.en"
import type { AttributeName, ValidationRule } from "$/ui/core"

/** Attributes both elements start with:  `type` comes after them, so its word follows the colour. */
export const LEADING_ATTRIBUTES = [
  { name: "size", kind: "size", description: "Size, `mini` ... `massive`;  `medium` is the default." },
  {
    name: "color",
    kind: "color",
    description: "Hue of the chosen state:  the filled box, the radio bullet, the toggle lane, the slider line."
  }
] as const

/** Attributes both elements share, after their own `type`. */
export const SHARED_ATTRIBUTES = [
  { name: "fitted", kind: "keyOnly", description: "No room for a label:  just the box." },
  {
    name: "invisible",
    kind: "keyOnly",
    description: "No box:  the LABEL is the control, bordered while unchosen and tinted when chosen."
  },
  {
    name: "right-aligned",
    kind: "keyOnly",
    key: "right aligned",
    description: "Box after the label, at the end of the line."
  },
  { name: "disabled", kind: "keyOnly", description: "Can't be used;  dimmed, left out of the form." },
  {
    name: "readonly",
    kind: "keyOnly",
    key: "read-only",
    description: "Shows its state but can't be changed;  still submitted."
  },
  { name: "inverted", kind: "keyOnly", description: "For dark backgrounds." },
  {
    name: "selected",
    kind: "boolean",
    description: "Chosen.  Controlled:  set it to choose;  a click dispatches `ui-change` first.  Alias:  `checked`."
  },
  {
    name: "value",
    kind: "string",
    description: "Value submitted while chosen;  default `on`, as a native checkbox."
  },
  { name: "name", kind: "string", description: "Form field name." },
  { name: "required", kind: "boolean", description: "Form validation:  must be chosen (a radio:  one of its group)." },
  { name: "label", kind: "string", description: "Label text;  slotted content is the rich version." }
] as const

/** Events both elements share. */
export const SHARED_EVENTS = [
  {
    name: "ui-change",
    detail: "{ selected: boolean, value: string, originalEvent?: Event }",
    description: "The user chose or unchose it (a radio:  only the newly chosen one fires)."
  }
] as const

/** Parts both elements share. */
export const SHARED_PARTS = [
  { name: "checkbox", description: "The root box." },
  { name: "control", description: "The native `<input>` (invisible, over the box)." },
  { name: "label", description: "The `<label>` drawing the box, the mark and the text." }
] as const

/** Converted attributes both elements have (`checkbox` and `radio`), see `CheckControl.common`. */
export type CommonAttributes = {
  readonly type: string | undefined
  readonly selected: boolean
  readonly value: string | undefined
  readonly name: string | undefined
  readonly label: string | undefined
  readonly required: boolean
  readonly disabled: boolean
  readonly readonly: boolean
}

/** Either element's vocabulary. */
export type CheckVocabulary = typeof checkboxVocabulary | typeof radioVocabulary

/** Host attribute aliasing `selected`. */
export const CHECKED = "checked"

/** Native default value of a checkbox. */
export const DEFAULT_VALUE = "on"

/** Input type that may be read-only. */
export const CHECKBOX = "checkbox"

/** `UI.ids` prefix. */
export const ID_PREFIX = "ui-checkbox"

/**
 * Marks the NATIVE control in a static server render (`$/ui/server`), for the flattener:  the host's `id` and ARIA
 * names belong there, so a `<label for>` the host's id labels the control.
 * - TODO: one shared constant (`UIT`) once `StaticFlattener` reads it (seo plan, P3).
 */
export const STATIC_CONTROL = "data-ui-control"

/** `Node.DOCUMENT_POSITION_FOLLOWING`, without the `Node` global:  node has none (static server render). */
export const DOCUMENT_POSITION_FOLLOWING = 4

/** What a group needs from each member (`UIRadio`);  structural, so this file never imports the element. */
export type RadioMember = {
  /** The member's host element, for document order and focus. */
  readonly host: HTMLElement
  /** Chosen now?  Tracked. */
  isSelected(): boolean
  /** Can't be used now?  Tracked. */
  isDisabled(): boolean
  /** Makes the group required?  Tracked. */
  isRequired(): boolean
  /** Its value;  tracked. */
  choiceValue(): string
  /** Choose / unchoose it without an event. */
  setSelected(selected: boolean): void
}

/** Role of toggles and sliders. */
export const SWITCH = "switch"

/** `required` => Fomantic's `checked`. */
export const CHECKED_RULE: ValidationRule = "checked"

/** The `name` prop's key, as the fork's change callback reports it. */
export const NAME: AttributeName<typeof radioVocabulary> = "name"

/** Input type, and what a form reads it as. */
export const RADIO = "radio" as const

/** Keys that move to the next / previous radio. */
export const NEXT = new Set(["ArrowDown", "ArrowRight"])
export const PREVIOUS = new Set(["ArrowUp", "ArrowLeft"])

/** The part of a checkbox / radio host the fallback touches;  optional, the element may not have upgraded. */
export type NativeCheckHost = HTMLElement & { selected?: boolean }
