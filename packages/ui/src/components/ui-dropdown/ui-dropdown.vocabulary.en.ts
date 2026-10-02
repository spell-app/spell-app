/**
 * Every name `<ui-dropdown>` uses:  tag, attributes (kind + allowed values), events, slots,
 * parts, states, texts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-dropdown search selection pointing="top left">` => `ui search selection top left pointing dropdown`.
 *   `ui-dropdown.css` keys on those words.
 * - Rich data is a PROPERTY (`options`, `kind: "json"`);  first paint never needs it -- slotted `<ui-item>`s
 *   or the `value` / `text` attributes carry what SSR must show.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-dropdown>`
 * A combobox + listbox:  a `<button>` or `<input>` trigger and an anchor-positioned popover menu.
 ****************/
export const dropdownVocabulary = {
  tag: "ui-dropdown",
  topics: ["forms", "inputs", "selection", "menus", "controls", "basic", "modules"],
  aka: ["select", "combobox", "picker", "autocomplete", "menu button", "multi select"],
  skeleton: { display: "inline", width: "14em", height: "2.5em" },
  noun: "dropdown",
  description: "A dropdown allows a user to select a value from a series of options.",
  attributes: [
    { name: "size", kind: "size", description: "Size, `mini` ... `massive`;  `medium` is the default." },
    {
      name: "color",
      kind: "color",
      description: "Hue:  fills a `button` dropdown;  accents a selection's focus border and labels."
    },
    {
      name: "state",
      kind: "valueOnly",
      values: ["error", "info", "success", "warning"],
      description: "Form state, tinting the box, text and menu."
    },
    { name: "selection", kind: "keyOnly", description: "Looks like a form `<select>`." },
    { name: "search", kind: "keyOnly", description: "Filters the options by typing;  the trigger is an `<input>`." },
    { name: "multiple", kind: "keyOnly", description: "Chooses several values, shown as labels." },
    { name: "inline", kind: "keyOnly", description: "Sits inside running text." },
    { name: "floating", kind: "keyOnly", description: "The menu floats further away, with a stronger shadow." },
    { name: "button", kind: "keyOnly", description: "Looks like a button (`ui-button.css`)." },
    {
      name: "labeled",
      kind: "keyOnly",
      key: "labeled icon",
      description: "A labeled icon button:  the `icon` in its own block, no caret.  Use with `button`."
    },
    { name: "compact", kind: "keyOnly", description: "No minimum width;  the menu sizes to its items." },
    { name: "fluid", kind: "keyOnly", description: "Takes the full width of its container." },
    { name: "scrolling", kind: "keyOnly", description: "The menu scrolls after a fixed height." },
    { name: "upward", kind: "keyOnly", description: "Opens above (the menu still flips when there's no room)." },
    { name: "simple", kind: "keyOnly", description: "Opens on hover / focus, with no script and no popover." },
    { name: "clearable", kind: "keyOnly", description: "Shows a clear button while there's a value." },
    { name: "disabled", kind: "keyOnly", description: "Can't be used;  dimmed and inert." },
    { name: "loading", kind: "keyOnly", description: "Busy, e.g. fetching options;  the caret spins." },
    {
      name: "readonly",
      kind: "keyOnly",
      key: "read-only",
      description: "Shows its value but can't be changed;  submitted with the form (unlike `disabled`)."
    },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme's colours." },
    { name: "unlimited", kind: "keyOnly", description: "A selection menu that never scrolls." },
    { name: "resizable", kind: "keyOnly", description: "A `scrolling` menu the user can resize vertically." },
    { name: "short", kind: "keyOnly", description: "A shorter selection menu (3/4 height)." },
    { name: "very-short", kind: "keyOnly", description: "A much shorter selection menu (1/2 height)." },
    { name: "long", kind: "keyOnly", description: "A longer selection menu (2x height)." },
    { name: "very-long", kind: "keyOnly", description: "A much longer selection menu (3x height)." },
    {
      name: "open",
      kind: "keyOnly",
      key: "active",
      description: "The menu is open.  Controlled:  set it to open / close;  `ui-open` / `ui-close` can veto."
    },
    {
      name: "pointing",
      kind: "keyOrValueAndKey",
      values: ["top", "top left", "top right", "left", "right", "bottom", "bottom left", "bottom right"],
      description:
        "An arrow on the menu pointing at the dropdown;  the value says where the menu's arrow sits " +
        "(`top left` => below, arrow at its top left).  Pointing menus never flip."
    },
    {
      name: "columnar",
      kind: "width",
      widthClass: "column",
      values: ["2", "3", "4", "5"],
      description: 'Lays the menu items out in columns:  `columnar="3"` => `three column`.'
    },
    {
      name: "direction",
      kind: "enum",
      values: ["left", "right"],
      default: "right",
      description: "Which way the menu extends from the dropdown's edge;  `left` right-aligns it (`.left.menu`)."
    },
    { name: "icon", kind: "icon", description: "Icon name for a `labeled` dropdown's icon block." },
    { name: "placeholder", kind: "string", description: "Text shown while nothing is chosen." },
    {
      name: "value",
      kind: "string",
      description:
        "Chosen value.  Property:  `string`, or `string[]` with `multiple`;  attribute:  a comma / space list."
    },
    {
      name: "text",
      kind: "string",
      reflect: false,
      description: "Text shown for the current value, e.g. before `options` arrive.  Property only by default."
    },
    { name: "name", kind: "string", description: "Form field name;  `multiple` submits one entry per value." },
    { name: "required", kind: "boolean", description: "Form validation:  a value must be chosen." },
    { name: "allow-additions", kind: "boolean", description: "`search`:  offers the query as a new option." },
    {
      name: "min-characters",
      kind: "number",
      default: 0,
      description: "`search`:  characters to type before the menu filters."
    },
    { name: "max-selections", kind: "number", description: "`multiple`:  the most values that can be chosen." },
    {
      name: "no-results-text",
      kind: "string",
      description: "Message when nothing matches;  default the translated `noResults` text."
    },
    {
      name: "addition-text",
      kind: "string",
      description: "Label of the add item, with `{value}`;  default the translated `addItem` text."
    },
    {
      name: "options",
      kind: "json",
      reflect: false,
      description: "Options as a PROPERTY:  `MenuOption[]` (`$/ui/elements`);  added after slotted `<ui-item>`s."
    }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ value: string | string[], originalEvent?: Event }",
      description: "The user chose, added, removed or cleared a value."
    },
    {
      name: "ui-open",
      detail: "{ open: true, originalEvent?: Event }",
      cancelable: true,
      description:
        "The menu is about to open (a user action, an invoker command too);  `preventDefault()` keeps it closed."
    },
    {
      name: "ui-close",
      detail: "{ open: false, originalEvent?: Event }",
      cancelable: true,
      description: "The menu is about to close;  `preventDefault()` keeps it open."
    },
    {
      name: "ui-search",
      detail: "{ query: string, originalEvent?: Event }",
      description: "`search`:  the query changed."
    },
    {
      name: "ui-add",
      detail: "{ value: string, originalEvent?: Event }",
      description: "`multiple`:  a value was chosen, or `allow-additions` added a new one."
    },
    {
      name: "ui-remove",
      detail: "{ value: string, originalEvent?: Event }",
      description: "`multiple`:  a value was removed."
    }
  ],
  slots: [
    { name: "", description: "`<ui-item>`s:  the options, headers and dividers, in order." },
    { name: "trigger", description: "Custom trigger content, e.g. an icon and a word, instead of the text." },
    { name: "header", description: "Content at the top of the menu, e.g. a header or a search input." },
    { name: "icon", description: "Replaces the caret, or the `labeled` icon." }
  ],
  parts: [
    { name: "trigger", description: "The combobox `<button>` covering the dropdown (not `search`)." },
    { name: "text", description: "The current text, or the placeholder." },
    { name: "icon", description: "The caret." },
    { name: "menu", description: "The listbox popover." },
    { name: "item", description: "Each option." },
    { name: "label", description: "Each chosen value of a `multiple` dropdown." },
    { name: "search", description: "The search `<input>`." },
    { name: "clear", description: "The clear button of a `clearable` dropdown." }
  ],
  states: [
    { name: "open", description: "The menu is open." },
    { name: "disabled", description: "Can't be used." },
    { name: "loading", description: "Busy." },
    { name: "invalid", description: "Fails validation (`required` ...)." },
    { name: "fluid", description: "The host is block-level (`fluid`)." }
  ],
  texts: [
    { key: "noResults", text: "No results found.", description: "Message when nothing matches the search." },
    { key: "addItem", text: "Add {value}", description: "The add item of `allow-additions`." },
    { key: "clear", text: "Clear", description: "Accessible name of the clear button." },
    {
      key: "removeValue",
      text: "Remove {value}",
      description: "Accessible name of a `multiple` label's delete button."
    }
  ]
} as const satisfies ComponentVocabulary
