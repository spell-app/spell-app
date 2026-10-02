/**
 * Every name `<ui-popup>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-popup size="small" inverted wide="very">` => `ui small inverted very wide popup`;  the element adds the
 *   `position` words after the noun (`ui inverted popup bottom left`), as Fomantic's script added them.
 * - `open` emits `visible`, Fomantic's shown-popup class, so static markup and the element share one sheet.
 * - A popup OWNS the `header` and `content` parts:  slotted `<ui-header>` / `<ui-content>` get `:state(in-popup)`
 *   and style themselves from `ui-parts.css`.
 * - `target` is a PROPERTY (an element);  first paint never needs it -- `for` or the previous sibling carry
 *   what markup must say.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-popup>`
 * A popup:  a popover HOST anchored to its target, holding `<div class="ui ... popup" part="popup">`.
 ****************/
export const popupVocabulary = {
  tag: "ui-popup",
  topics: ["popups", "overlays", "feedback", "modules"],
  aka: ["tooltip", "popover", "hint", "hover card", "info bubble"],
  skeleton: null,
  noun: "popup",
  description: "A popup displays additional information on top of a page.",
  attributes: [
    { name: "size", kind: "size", description: "Text size, `mini` ... `massive`;  `medium` is the default." },
    {
      name: "color",
      kind: "color",
      description: "Hue:  fills the popup (and its arrow), with a readable text colour."
    },
    { name: "basic", kind: "keyOnly", description: "No pointing arrow." },
    { name: "fixed", kind: "keyOnly", description: "Always its maximum width (`wide` / `very wide` widen it)." },
    { name: "flowing", kind: "keyOnly", description: "No maximum width:  as wide as its content, e.g. a grid." },
    { name: "fluid", kind: "keyOnly", description: "As wide as its target." },
    { name: "inverted", kind: "keyOnly", description: "The opposite scheme:  dark on a light page." },
    { name: "loading", kind: "keyOnly", description: "Busy:  a spinner over faded content." },
    {
      name: "open",
      kind: "keyOnly",
      key: "visible",
      description: "Shown.  Controlled:  set it to show / hide;  `ui-open` / `ui-close` can veto the user's changes."
    },
    {
      name: "wide",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: 'A wider maximum width;  `wide="very"` wider still (`very wide`).'
    },
    {
      name: "position",
      kind: "enum",
      values: "positions",
      default: "top left",
      description:
        "Where it sits against its target:  `top left` (default) ... `right center`, `left top` ... `right bottom` " +
        "(beside, lined up with its top / bottom edge).  It flips to the other " +
        "side when there's no room."
    },
    {
      name: "on",
      kind: "enum",
      values: ["hover", "focus", "click", "manual"],
      default: "hover",
      description:
        "What opens it:  `hover` (also keyboard focus), `focus`, `click` (toggles;  a non-modal dialog), or " +
        "`manual` (only `open`)."
    },
    {
      name: "for",
      kind: "string",
      property: "htmlFor",
      description: "Id of the target, in the popup's own tree;  without it, the previous element sibling."
    },
    {
      name: "header",
      kind: "string",
      description: "Shorthand for a header line (Fomantic's `title`);  a slotted `<ui-header>` is the rich version."
    },
    {
      name: "content",
      kind: "string",
      description: "Shorthand for the text (Fomantic's `content`);  slotted content is the rich version."
    },
    {
      name: "hoverable",
      kind: "boolean",
      default: true,
      description:
        "`hover`:  the popup stays open while the pointer is over it, so it can be reached and its text read or " +
        "selected -- on by default, as WCAG 1.4.13 (Content on Hover or Focus) asks for.  " +
        '`hoverable="false"` is Fomantic\'s `hoverable: false` (its default):  it closes as the pointer leaves ' +
        "the target, after `hide-delay`."
    },
    { name: "show-delay", kind: "number", default: 50, description: "`hover`:  ms before it shows." },
    { name: "hide-delay", kind: "number", default: 70, description: "`hover`:  ms before it hides." },
    {
      name: "target",
      kind: "json",
      reflect: false,
      description: "The target as a PROPERTY (an `Element`);  wins over `for`."
    }
  ],
  events: [
    {
      name: "ui-open",
      detail: "{ open: true, originalEvent?: Event }",
      cancelable: true,
      description:
        "About to show for a user action (the trigger, an invoker command);  `preventDefault()` keeps it hidden."
    },
    {
      name: "ui-close",
      detail: "{ open: false, originalEvent?: Event }",
      cancelable: true,
      description:
        "About to hide;  `preventDefault()` keeps it open.  NOT cancelable in effect when the browser already " +
        "dismissed a `hint` popover (Escape, a click elsewhere)."
    }
  ],
  slots: [{ name: "", description: "Content:  text, `<ui-header>` / `<ui-content>` parts, a grid, controls." }],
  parts: [
    { name: "popup", description: "The popup box (its arrow is `::before`)." },
    { name: "header", description: "The `header` shorthand." },
    { name: "content", description: "The `content` shorthand." }
  ],
  states: [
    { name: "open", description: "Shown." },
    { name: "fluid", description: "As wide as its target (`fluid`)." }
  ],
  texts: [],
  ownsParts: ["header", "content"]
} as const satisfies ComponentVocabulary
