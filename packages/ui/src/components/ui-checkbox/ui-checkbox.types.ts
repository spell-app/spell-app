/**
 * Loose constants and types of the checkbox family:  the vocabulary pieces `<ui-checkbox>` and `<ui-radio>` share,
 * and the words and shapes their classes and native fallback share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only (its vocabularies too:  they value-import
 *   this file), so node can load it (`yarn site:data`).
 * - A word only ONE class uses sits below that class instead (epic `wwod-spell-ui`, Q18).
 */

import type { checkboxVocabulary } from "./ui-checkbox.vocabulary.en"
import type { radioVocabulary } from "./ui-radio.vocabulary.en"

////////////////
// ## Vocabulary pieces
////////////////

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
    property: "readOnly",
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
    description:
      "Value submitted while chosen;  default `on`, as a native checkbox (or its class's `defaultChosenValue`)."
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
    description:
      "Someone chose or unchose it (a radio:  only the newly chosen one fires);  `value`:  what it stands for after the change, a checkbox's `off-value` once unchosen."
  }
] as const

/** Parts both elements share. */
export const SHARED_PARTS = [
  { name: "checkbox", description: "The root box." },
  { name: "control", description: "The native `<input>` (invisible, over the box)." },
  { name: "label", description: "The `<label>` drawing the box, the mark and the text." }
] as const

/** One of `SHARED_PARTS`' names, e.g. `"label"`. */
export type CheckPartName = (typeof SHARED_PARTS)[number]["name"]

////////////////
// ## Element shapes
////////////////

/** Either element's vocabulary. */
export type CheckVocabulary = typeof checkboxVocabulary | typeof radioVocabulary

/** Converted attributes both elements have (`checkbox` and `radio`):  their vocabulary getters on `CheckControl`. */
export type CommonAttributes = {
  /** chosen now */
  selected: boolean
  /** submitted while chosen;  none ~== `on` */
  value: string | undefined
  /** form field name */
  name: string | undefined
  /** label text (the `label` shorthand) */
  label: string | undefined
  /** must be chosen to submit */
  required: boolean
  /** can't be used */
  disabled: boolean
  /** shows its state, can't be changed */
  readonly: boolean
}

/** What a group needs from each member (`UIRadio`);  structural, so this file never imports the element. */
export type RadioMember = {
  /** The member's host element, for document order and focus. */
  readonly host: HTMLElement
  /** Chosen now?  Tracked.  A write chooses / unchooses it without an event. */
  isSelected: boolean
  /** Can't be used now?  Tracked. */
  readonly isDisabled: boolean
  /** Makes the group required?  Tracked. */
  readonly required: boolean
  /** Its value;  tracked. */
  readonly chosenValue: string
}

/** What `CheckHost` asks its controller for:  the values it submits (`CheckControl`). */
export type CheckValues = {
  /** Submitted while chosen;  tracked. */
  readonly chosenValue: string
  /** Submitted while unchosen;  none ~== nothing.  Tracked. */
  readonly unchosenValue: string | undefined
}

/** The part of a checkbox / radio host the fallback touches;  optional, the element may not have upgraded. */
export type NativeCheckHost = HTMLElement & {
  /** chosen now */
  selected?: boolean
  /** submitted while chosen (`CheckHost`) */
  chosenValue?: string
  /** submitted while unchosen (`CheckHost`) */
  unchosenValue?: string
}

////////////////
// ## Words
////////////////

/** Host attribute aliasing `selected`. */
export const CHECKED = "checked"

/** Input type of `<ui-checkbox>`, and what a form reads it as;  the only type that may be read-only. */
export const CHECKBOX = "checkbox"

/** Input type of `<ui-radio>`, and what a form reads it as. */
export const RADIO = "radio"

/** Role of toggles and sliders:  on / off, not "checked". */
export const SWITCH = "switch"
