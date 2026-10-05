/**
 * Every name `<ui-button>`, `<ui-buttons>` and `<ui-or>` use:  tags, attributes (kind + allowed values),
 * events, slots, parts, states, texts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:  `<ui-button size="small" primary basic>`
 *   => `ui small basic primary button`.  `ui-button.css` keys on those words.
 * - Group context needs NO element help:  `<ui-buttons basic>` renders `ui basic buttons`, and `ui-button.css`
 *   hands the look to its children through inherited tokens.
 * - `primary` / `secondary` / `positive` / `negative` are words, not colours, as in Fomantic;  they and `color`
 *   all remap `--ui-color` (`colors.css`), so the last one in the class string wins.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-button>`
 * A button:  a semantic `<button>` (or `<a>` with `href`) in the shadow root.
 ****************/
export const buttonVocabulary = {
  tag: "ui-button",
  topics: ["buttons", "basic", "controls", "forms", "elements"],
  aka: ["btn", "action", "submit", "link button"],
  skeleton: { display: "inline", width: "6em", height: "2.5em" },
  noun: "button",
  plural: "buttons",
  description: "A button indicates a possible user action.",
  attributes: [
    { name: "size", kind: "size", description: "Size, `mini` ... `massive`;  `medium` is the default." },
    { name: "color", kind: "color", description: "Hue;  fills the button (or its ring and text when `basic`)." },
    { name: "primary", kind: "keyOnly", description: "Primary emphasis:  the `primary` brand colour." },
    { name: "secondary", kind: "keyOnly", description: "Secondary emphasis:  the `secondary` brand colour." },
    { name: "positive", kind: "keyOnly", description: "Positive consequence:  the `positive` colour." },
    { name: "negative", kind: "keyOnly", description: "Negative consequence:  the `negative` colour." },
    { name: "basic", kind: "keyOnly", description: "Less pronounced:  transparent with a hairline ring." },
    { name: "tertiary", kind: "keyOnly", description: "Least pronounced:  text only, underlined on hover." },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  an outline that fills on hover." },
    {
      name: "toggle",
      kind: "keyOnly",
      description: "Toggles `active` on click, with `aria-pressed`;  dispatches `ui-toggle`."
    },
    { name: "active", kind: "keyOnly", description: "Pressed / on;  with `toggle`, in the positive colour." },
    {
      name: "active-text",
      kind: "string",
      description:
        "Fomantic's `state` behaviour:  the text while `active` (`Following`), instead of the content.  With " +
        "either state text the label carries the state, so a `toggle` drops `aria-pressed` (WAI-ARIA APG)."
    },
    {
      name: "inactive-text",
      kind: "string",
      description: "Fomantic's `state` behaviour:  the text while NOT `active` (`Follow`), instead of the content."
    },
    { name: "disabled", kind: "keyOnly", description: "Can't be used;  dimmed and inert." },
    { name: "loading", kind: "keyOnly", description: "Shows a spinner in place of the content;  `aria-busy`." },
    { name: "fluid", kind: "keyOnly", description: "Takes the full width of its container." },
    { name: "circular", kind: "keyOnly", description: "Pill shaped;  round when it holds only an icon." },
    { name: "compact", kind: "keyOnly", description: "Reduced padding." },
    {
      name: "labeled",
      kind: "keyOrValueAndKey",
      values: ["left", "right"],
      description:
        'With `icon`:  the icon in its own block, `labeled` (start) or `labeled="right"`.  ' +
        'With `label`:  which side the label goes, `labeled` (end) or `labeled="left"`.'
    },
    {
      name: "animated",
      kind: "keyOrValueAndKey",
      values: ["fade", "vertical"],
      description: "Slides the `icon` slot in over the content on hover:  sideways, `fade` or `vertical`."
    },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom", "left", "right"],
      description: "Joined to the edge of a segment or another element:  `top`, `bottom`, `left` or `right`."
    },
    { name: "floated", kind: "valueAndKey", values: "floats", description: "Floats `left` or `right`." },
    {
      name: "icon",
      kind: "icon",
      description:
        "Icon name (Font Awesome, Fomantic aliases allowed).  With no text content the button gets the " +
        "`icon` class (square padding);  with `labeled` it becomes a `labeled icon` button."
    },
    {
      name: "icon-position",
      kind: "enum",
      values: ["left", "right"],
      description:
        "Which side of the text the icon goes:  `left` (default) or `right` (Fomantic's `right` icon, e.g. " +
        "`Next →`), spaced by `--ui-button-icon-spacing`.  A `labeled` icon block takes its side from `labeled`."
    },
    {
      name: "content",
      kind: "string",
      description: "Shorthand for the button's text, instead of the default slot;  slotted children win."
    },
    {
      name: "label",
      kind: "string",
      description: "Shorthand for a joined label, e.g. a count;  renders `ui labeled button` around the button."
    },
    {
      name: "type",
      kind: "enum",
      values: ["button", "submit", "reset"],
      default: "button",
      description: "Form behaviour, as the native `<button type>`;  `submit` calls `form.requestSubmit()`."
    },
    {
      name: "commandfor",
      kind: "string",
      description:
        "Invoker commands, as the native `<button commandfor>`:  the id of the element `command` acts on, looked up " +
        "in the button's own tree (the inner `<button>` gets it as `commandForElement`, since a shadow button can't " +
        "see a light-DOM id).  Without browser support (`UI.browser.supports.invokers`) a click runs the built-in " +
        "commands itself."
    },
    {
      name: "command",
      kind: "string",
      description:
        "Invoker commands, as the native `<button command>`:  `show-modal` / `close` / `request-close` on a " +
        "`<dialog>`, `show-popover` / `hide-popover` / `toggle-popover` on a popover, or a custom `--name` that " +
        "the target hears as a `command` event (`<ui-modal>` answers `--show`, `--close`, `--toggle`)."
    },
    { name: "href", kind: "string", description: "Renders a link (`<a>`) styled as a button." },
    { name: "target", kind: "string", description: "Link target, with `href`." },
    {
      name: "download",
      kind: "string",
      description:
        "With `href`:  downloads the file instead of opening it, as the native `<a download>`;  a value names the " +
        "saved file."
    },
    { name: "name", kind: "string", description: "Form field name submitted with the button's `value`." },
    { name: "value", kind: "string", description: "Form value submitted when this button submits the form." }
  ],
  events: [
    {
      name: "ui-toggle",
      detail: "{ active: boolean, originalEvent?: Event }",
      description: "A `toggle` button flipped its `active` state.  NOTE: plain clicks are the native `click`."
    }
  ],
  slots: [
    { name: "", description: "Content, usually text;  instead of the `content` attribute." },
    { name: "icon", description: "Icon, instead of the `icon` attribute;  the hidden content of `animated`." },
    { name: "label", description: "Label content, instead of the `label` attribute." }
  ],
  parts: [
    { name: "button", description: "The inner `<button>` (or `<a>`)." },
    { name: "icon", description: "The icon box." },
    { name: "label", description: "The joined label of a `label` button." }
  ],
  states: [
    { name: "active", description: "Pressed / on." },
    { name: "disabled", description: "Can't be used." },
    { name: "loading", description: "Busy." },
    { name: "fluid", description: "The host is block-level:  `fluid`, or attached `top` / `bottom` / bare." },
    { name: "left-floated", description: 'The host floats left (`floated="left"`).' },
    { name: "right-floated", description: 'The host floats right (`floated="right"`).' }
  ],
  texts: [{ key: "loading", text: "Loading…", description: "Announced while `loading`." }]
} as const satisfies ComponentVocabulary
