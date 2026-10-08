/**
 * Every name `<ui-brand-composer>` uses:  tag, attributes, events, slots, parts, states, texts.  Schema:
 * `ComponentVocabulary`.
 * - Pure data:  `import type` only.
 * - Class words:  `casting` and `disabled` emit their names.  The element adds `brand` after the noun,
 *   and `large` for `size="large"` (`composer brand large`).
 * - `value` does NOT reflect, as `<ui-textarea>`'s:  the ATTRIBUTE is the starting (and reset) value,
 *   the PROPERTY the live one.
 */

import type { ComponentVocabulary } from "$/ui/core"

/****************
 * ### `<ui-brand-composer>`
 * The brand's "describe your app" box:  a card holding a serif text box where you write a spell, then a row of
 * tools (chips), a keyboard hint and a round Cast button.  Cast is the button or Cmd / Ctrl+Enter;
 * plain Enter starts a new line.
 ****************/
export const brandComposerVocabulary = {
  tag: "ui-brand-composer",
  topics: ["forms", "inputs", "text"],
  aka: ["composer", "prompt box", "prompt input", "chat input", "message box", "spell box", "command box"],
  skeleton: "8.5 tall",
  noun: "composer",
  ui: false,
  description:
    "A brand composer is the box where you describe an app in plain words and cast it:  a serif text box, tool " +
    "chips, a keyboard hint and a round Cast button.",
  attributes: [
    {
      name: "value",
      kind: "string",
      reflect: false,
      description:
        "The text.  Attribute:  the starting (and reset) value;  property:  the live value, as `<ui-textarea>`'s."
    },
    { name: "name", kind: "string", description: "Form field name:  the form gets `value`." },
    {
      name: "placeholder",
      kind: "string",
      description: 'Hint shown while empty;  default `Describe what you want to build…`, `placeholder=""` none.'
    },
    { name: "rows", kind: "number", default: 3, description: "Lines tall when empty;  the box grows as you write." },
    {
      name: "label",
      kind: "string",
      description:
        "Name of the text box for screen readers;  default:  what names the host (`aria-label`, `<label for>`), " +
        "else `eyebrow`, else `Your spell`."
    },
    {
      name: "eyebrow",
      kind: "string",
      description: 'Small mono caps line above the text box (`Try a spell`);  or `slot="eyebrow"`.'
    },
    {
      name: "hint",
      kind: "string",
      description:
        'Keyboard hint beside the tools;  default `⌘↵ to cast` (`Ctrl+↵ to cast` off Apple devices), `hint=""` none.'
    },
    {
      name: "size",
      kind: "enum",
      values: ["medium", "large"],
      default: "medium",
      description:
        "`medium` (the app's Build box:  17px text, small shadow) or `large` (the marketing hero's:  19px text, " +
        "larger shadow and radius)."
    },
    {
      name: "casting",
      kind: "keyOnly",
      description:
        "Busy:  the Cast button spins and casting is paused (the text stays editable).  The page sets it while it " +
        "builds, and clears it."
    },
    { name: "disabled", kind: "keyOnly", description: "Faded;  can't be typed in or cast, left out of the form." }
  ],
  events: [
    {
      name: "ui-input",
      detail: "{ value: string, originalEvent?: Event }",
      description: "The text changed (every keystroke).  A handler that re-sets `value` wins."
    },
    {
      name: "ui-change",
      detail: "{ value: string, originalEvent?: Event }",
      description: "The user committed an edit (left the text box changed)."
    },
    {
      name: "ui-cast",
      detail: "{ value: string, originalEvent?: Event }",
      cancelable: true,
      description:
        "Cast:  the button, Cmd / Ctrl+Enter, or `cast()` -- never with empty (or only blank) text, while " +
        "`casting`, or `disabled`.  In a `<form>`, the form is then submitted;  `preventDefault()` stops that."
    }
  ],
  slots: [
    { name: "eyebrow", description: "Rich version of `eyebrow`, above the text box." },
    {
      name: "tools",
      description:
        'Chips in the row under the text box, before the hint (`<ui-label icon="language">English</ui-label>`, idea ' +
        "buttons);  they wrap."
    }
  ],
  parts: [
    { name: "composer", description: "The card." },
    { name: "eyebrow", description: "The line above the text box." },
    { name: "textarea", description: "The native `<textarea>`." },
    { name: "bar", description: "The row under the text box:  tools, hint, Cast button." },
    { name: "tools", description: "The box around the `tools` slot." },
    { name: "hint", description: "The keyboard hint." },
    { name: "cast", description: "The round Cast button." }
  ],
  states: [
    { name: "empty", description: "Nothing (or only blank) written:  the Cast button is dimmed." },
    { name: "casting", description: "Busy:  `casting` is set." },
    { name: "disabled", description: "Can't be used." }
  ],
  texts: [
    { key: "label", text: "Your spell", description: "The text box's name, when nothing else names it." },
    { key: "placeholder", text: "Describe what you want to build…", description: "Default placeholder." },
    { key: "hintApple", text: "⌘↵ to cast", description: "Default hint on Apple devices." },
    { key: "hintOther", text: "Ctrl+↵ to cast", description: "Default hint elsewhere." },
    { key: "cast", text: "Cast spell", description: "The Cast button's name." },
    { key: "casting", text: "Casting your spell…", description: "Announced when `casting` turns on." }
  ]
} as const satisfies ComponentVocabulary
