/**
 * Every name `<ui-flyout>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary`.
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-flyout position="right" inverted width="4" open>` => `ui right inverted visible four wide flyout`;  a
 *   word width (`thin`, `very wide`) is added after the noun by the element (`ui left flyout very wide`).
 * - `open` emits `visible`, Fomantic's shown-flyout class.
 * - The SAME dialog vocabulary as `<ui-modal>` (`open`, `closable`, `closedby`, `header`, `content`, the six events,
 *   the `close` text):  both run on `DialogElement`.
 * - A flyout OWNS the `header`, `content`, `description` and `actions` parts:  slotted ones get
 *   `:state(in-flyout)` and style themselves from `ui-parts.css`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-flyout>`
 * A side modal:  `<dialog class="ui [position] ... flyout" part="flyout">`, shown with `showModal()`, sliding in from
 * an edge of the viewport.
 ****************/
export const flyoutVocabulary = {
  tag: "ui-flyout",
  topics: ["overlays", "dialogs", "containers", "modules"],
  aka: ["drawer", "sheet", "side panel", "off canvas", "slide over"],
  noun: "flyout",
  description: "A flyout is a modal that slides in from a side of the page.",
  attributes: [
    {
      name: "position",
      kind: "valueOnly",
      values: ["left", "right", "top", "bottom"],
      default: "left",
      description: "Edge it slides in from:  `left` (default), `right`, `top`, `bottom`."
    },
    { name: "fullscreen", kind: "keyOnly", description: "The whole viewport wide." },
    { name: "inverted", kind: "keyOnly", description: "The dark scheme." },
    { name: "blurring", kind: "keyOnly", description: "Blurs and greys the page behind its dimmer." },
    {
      name: "open",
      kind: "keyOnly",
      key: "visible",
      description: "Shown.  Controlled:  set it to show / hide;  `ui-open` / `ui-close` can veto a person's changes."
    },
    {
      name: "width",
      kind: "width",
      description:
        "Width of a `left` / `right` flyout:  Fomantic's words (`very thin`, `thin`, `wide`, `very wide`) or " +
        "columns of the viewport (`4`, `1/4`, `25%` => `four wide`)."
    },
    {
      name: "closable",
      kind: "boolean",
      description:
        "Shows a close icon (Fomantic's `closeIcon` setting).  `closable=\"false\"` is also Fomantic's `closable: " +
        'false` setting:  no icon AND `closedby="none"`, unless `closedby` is set, which wins for dismissal.'
    },
    {
      name: "closedby",
      kind: "enum",
      values: ["any", "closerequest", "none"],
      default: "any",
      property: "closedBy",
      description:
        "What dismisses it, as `<dialog closedby>`:  `any` -- Escape or a click on the dimmer (default);  " +
        "`closerequest` -- Escape only;  `none` -- only its own buttons.  Read when it opens."
    },
    {
      name: "header",
      kind: "string",
      description: "Shorthand for a header;  a slotted `<ui-header>` is the rich version (and names the dialog)."
    },
    {
      name: "content",
      kind: "string",
      description: "Shorthand for a content block of text;  a slotted `<ui-content>` is the rich version."
    }
  ],
  events: [
    {
      name: "ui-open",
      detail: "{ open: true, originalEvent?: Event }",
      cancelable: true,
      description: "About to show (a person's action, not an `open` write);  `preventDefault()` keeps it hidden."
    },
    {
      name: "ui-show",
      detail: "{ open: true }",
      description: "Shown, its entry transition finished (Fomantic's `onVisible`)."
    },
    {
      name: "ui-close",
      detail: "{ open: false, reason: ModalCloseReason, originalEvent?: Event }",
      cancelable: true,
      description:
        "About to hide:  Escape, the dimmer, the close icon, approve or deny.  `preventDefault()` keeps it open."
    },
    {
      name: "ui-hide",
      detail: "{ open: false }",
      description: "Hidden, its exit transition finished (Fomantic's `onHidden`)."
    },
    {
      name: "ui-approve",
      detail: "{ action: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "An approve button (`.approve` / `.ok` / `.positive`, `<ui-button positive>`) was activated;  " +
        "`preventDefault()` keeps it open (Fomantic's `onApprove` returning `false`)."
    },
    {
      name: "ui-deny",
      detail: "{ action: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "A deny button (`.deny` / `.cancel` / `.negative`, `<ui-button negative>`) was activated;  " +
        "`preventDefault()` keeps it open."
    }
  ],
  slots: [{ name: "", description: "Content parts:  `<ui-header>`, `<ui-content>`, `<ui-actions>` with buttons." }],
  parts: [
    { name: "flyout", description: "The `<dialog>` panel;  its `::backdrop` is the dimmer." },
    { name: "header", description: "The `header` shorthand." },
    { name: "content", description: "The `content` shorthand." },
    { name: "close", description: "The close icon of a `closable` flyout." }
  ],
  states: [{ name: "open", description: "Shown." }],
  texts: [{ key: "close", text: "Close", description: "Accessible name of the close icon." }],
  ownsParts: ["header", "content", "description", "actions"]
} as const satisfies E.ComponentVocabulary
