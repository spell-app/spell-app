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

// pure data (vocabularies / types) never import `$/ui/core` by value:  it loads the element layer, which node
// can't (`yarn site:data` / `yarn gen:root` import every vocabulary through tsx:  no `?inline` css, no JSX)
import * as UIT from "$/ui/components/components.types"
import type { ComponentVocabulary } from "$/ui/vocabulary"

/** Input types passed through to the inner `<input>`. */
const INPUT_TYPES = [
  "text",
  "password",
  "email",
  "number",
  "search",
  "url",
  "tel",
  "date",
  "datetime-local",
  "time",
  "month",
  "week",
  "color",
  "file"
] as const

/****************
 * ### `<ui-input>`
 * A text field:  `<div class="ui … input" part="input">` around a native `<input part="control">`, with an optional
 * icon, label and action buttons.
 ****************/
export const inputVocabulary = {
  tag: "ui-input",
  topics: ["forms", "inputs", "controls", "text", "basic", "elements"],
  aka: ["text field", "text box", "textbox", "input field", "search box"],
  skeleton: "inline 14 x 2.5",
  noun: "input",
  description: "An input is a field used to elicit a response from a person.",
  attributes: [
    { name: "size", kind: "size", description: "Size, `mini` ... `massive`;  `medium` is the default." },
    {
      name: "color",
      kind: "color",
      description: "Hue of a `file` input's choose-file button (Fomantic colours only file inputs)."
    },
    {
      name: "state",
      kind: "valueOnly",
      values: UIT.FormStates,
      description: "Form state, tinting the box, text and placeholder."
    },
    { name: "transparent", kind: "keyOnly", description: "No box:  text only, e.g. inside a menu or header." },
    { name: "fluid", kind: "keyOnly", description: "Takes the full width of its container." },
    { name: "loading", kind: "keyOnly", description: "Busy:  the icon becomes a spinner (with or without `icon`)." },
    { name: "disabled", kind: "keyOnly", description: "Can't be used;  dimmed, left out of the form." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds." },
    {
      name: "readonly",
      kind: "boolean",
      property: "readOnly",
      description: "Shows its value but can't be edited;  submitted with the form (unlike `disabled`)."
    },
    {
      name: "icon-position",
      kind: "valueAndKey",
      key: "icon",
      values: ["left"],
      description: "`left` puts the icon at the start (`left icon`);  default the end."
    },
    {
      name: "labeled",
      kind: "keyOrValueAndKey",
      values: ["right", "corner", "left corner"],
      description:
        "Where the label sits:  bare => before the field, `right` => after it, `corner` / `left corner` => folded " +
        "over a corner.  Implied (bare) by a `label` shorthand or slot."
    },
    {
      name: "action",
      kind: "keyOrValueAndKey",
      values: ["left"],
      description:
        "Joined buttons (slot `action`):  bare => after the field, `left` => before it.  Implied by the slot."
    },
    { name: "icon", kind: "icon", description: "Icon name, drawn inside the field;  the root gets `icon`." },
    {
      name: "label",
      kind: "string",
      description:
        'Label text, joined to the field;  an ICON name with `labeled="corner"` / `"left corner"`;  the `label` slot is the rich version.'
    },
    {
      name: "type",
      kind: "enum",
      values: INPUT_TYPES,
      default: "text",
      description: "Native input type;  `file` also adds the `file` class."
    },
    {
      name: "value",
      kind: "string",
      reflect: false,
      description:
        "Value.  Attribute:  the starting (and reset) value;  property:  the live value, like a native input."
    },
    { name: "name", kind: "string", description: "Form field name." },
    { name: "placeholder", kind: "string", description: "Hint shown while empty." },
    { name: "required", kind: "boolean", description: "Constraint:  must not be empty (`valueMissing`)." },
    { name: "pattern", kind: "string", description: "Constraint:  a regular expression the whole value must match." },
    { name: "min", kind: "string", description: "Constraint:  lowest number / date." },
    { name: "max", kind: "string", description: "Constraint:  highest number / date." },
    { name: "step", kind: "string", description: "Constraint:  granularity of a number / date." },
    {
      name: "minlength",
      kind: "number",
      property: "minLength",
      description: "Constraint:  fewest characters (checked once someone has edited it)."
    },
    { name: "maxlength", kind: "number", property: "maxLength", description: "Constraint:  most characters." },
    { name: "multiple", kind: "boolean", description: "`email` / `file`:  accepts several values." },
    { name: "accept", kind: "string", description: "`file`:  accepted file types." },
    { name: "autocomplete", kind: "string", description: "Autofill hint, forwarded to the native input." },
    {
      name: "inputmode",
      kind: "enum",
      // Shadows `HTMLElement.inputMode` on purpose:  same attribute, same meaning, forwarded to the native input
      // (unlike `<ui-divider hidden>`, which means something else:  `dividerHidden`)
      property: "inputMode",
      values: ["none", "text", "decimal", "numeric", "tel", "search", "email", "url"],
      description:
        "Virtual keyboard hint, forwarded to the native input.  `decimal` / `numeric` also give the number look " +
        '(right-aligned, tabular figures), as `type="number"` does.'
    },
    {
      name: "rules",
      kind: "json",
      reflect: false,
      description:
        'Fomantic validation rules checked with the native constraints:  `"email"`, `["notEmpty", "minLength[6]"]` ' +
        "or rule objects (`ValidationRule`)."
    }
  ],
  events: [
    {
      name: "ui-input",
      detail: "{ value: string, originalEvent?: Event }",
      description: "The value changed as someone typed (every keystroke)."
    },
    {
      name: "ui-change",
      detail: "{ value: string, originalEvent?: Event }",
      description: "Someone committed a change (blur, Enter, picking a file)."
    }
  ],
  slots: [
    { name: "label", description: "Label content (text, an icon, a `<ui-dropdown>`), inside the joined label box." },
    { name: "action", description: "`<ui-button>`s (or a `<ui-dropdown button>`) joined to the field." },
    { name: "icon", description: "Icon, instead of the `icon` attribute." }
  ],
  parts: [
    { name: "input", description: "The root box." },
    { name: "control", description: "The native `<input>`." },
    { name: "label", description: "The joined label box." },
    { name: "icon", description: "The icon box (the spinner while `loading`)." }
  ],
  states: [
    { name: "invalid", description: "Fails validation, once someone has interacted (`:user-invalid` semantics)." },
    { name: "disabled", description: "Can't be used." },
    { name: "loading", description: "Busy." },
    { name: "fluid", description: "The host is block-level (`fluid`, or inside a `<ui-field>`)." }
  ],
  texts: []
} as const satisfies ComponentVocabulary
