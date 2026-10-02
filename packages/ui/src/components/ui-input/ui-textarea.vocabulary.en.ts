/**
 * Every name `<ui-input>` and `<ui-textarea>` use:  tags, attributes (kind + allowed values), events, slots, parts,
 * states, texts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-input icon="search" icon-position="left" labeled="right" size="small">` =>
 *   `ui small left icon right labeled input`.  The element adds `icon` (no position), `labeled` / `action` (a
 *   slotted label or action without the attribute) and `file` (`type="file"`) itself.
 * - `state` is `kind: "valueOnly"`:  it emits its value alone (`ui error input`), a remap in `colors.css`.
 * - `value` does NOT reflect:  like a native `<input>`, the ATTRIBUTE is the starting (and reset) value and the
 *   PROPERTY the live one -- a password never lands in the DOM.
 * - Constraint attributes (`required`, `pattern`, `min` ...) go to the inner native control, whose validity
 *   merges with the Fomantic `rules` property's.
 */

// pure data (vocabularies / types) never import `$/ui/core` by value:  it loads the element layer, which the
// docs site evaluates on the server (`astro dev`), where Solid's client APIs throw
import * as UIT from "$/ui/components/components.types"
import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-textarea>`
 * A multi-line field:  `<div class="ui … input" part="input">` around a native `<textarea part="control">`.
 * - Shares `ui-input.css` (Fomantic styles `textarea` inside `.ui.input` and `.ui.form`), hence the `input` noun.
 ****************/
export const textareaVocabulary = {
  tag: "ui-textarea",
  topics: ["forms", "inputs", "text", "elements"],
  aka: ["multiline", "text area", "memo", "comment box"],
  skeleton: { width: "20em", height: "6em" },
  noun: "input",
  description: "A textarea is a multi-line field used to elicit a longer response.",
  attributes: [
    { name: "size", kind: "size", description: "Size, `mini` ... `massive`;  `medium` is the default." },
    {
      name: "state",
      kind: "valueOnly",
      values: UIT.FORM_STATES,
      description: "Form state, tinting the box, text and placeholder."
    },
    { name: "transparent", kind: "keyOnly", description: "No box:  text only." },
    { name: "fluid", kind: "keyOnly", description: "Takes the full width of its container." },
    { name: "disabled", kind: "keyOnly", description: "Can't be used;  dimmed, left out of the form." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds." },
    { name: "readonly", kind: "boolean", description: "Shows its value but can't be edited;  still submitted." },
    {
      name: "value",
      kind: "string",
      reflect: false,
      description: "Value.  Attribute:  the starting (and reset) value;  property:  the live value."
    },
    { name: "name", kind: "string", description: "Form field name." },
    { name: "placeholder", kind: "string", description: "Hint shown while empty." },
    { name: "required", kind: "boolean", description: "Constraint:  must not be empty (`valueMissing`)." },
    {
      name: "minlength",
      kind: "number",
      description: "Constraint:  fewest characters (checked after the user edits)."
    },
    { name: "maxlength", kind: "number", description: "Constraint:  most characters." },
    {
      name: "rows",
      kind: "number",
      description: "Visible lines;  without it the field is Fomantic's form height (12em, 8em ... 24em)."
    },
    { name: "autocomplete", kind: "string", description: "Autofill hint, forwarded to the native textarea." },
    {
      name: "rules",
      kind: "json",
      reflect: false,
      description: "Fomantic validation rules checked with the native constraints (`ValidationRule`s)."
    }
  ],
  events: [
    {
      name: "ui-input",
      detail: "{ value: string, originalEvent?: Event }",
      description: "The user changed the value (every keystroke)."
    },
    {
      name: "ui-change",
      detail: "{ value: string, originalEvent?: Event }",
      description: "The user committed a change (blur)."
    }
  ],
  slots: [],
  parts: [
    { name: "input", description: "The root box." },
    { name: "control", description: "The native `<textarea>`." }
  ],
  states: [
    { name: "invalid", description: "Fails validation, once the user has interacted (`:user-invalid` semantics)." },
    { name: "disabled", description: "Can't be used." },
    { name: "fluid", description: "The host is block-level (`fluid`, or inside a `<ui-field>`)." }
  ],
  texts: []
} as const satisfies ComponentVocabulary
