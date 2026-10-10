/**
 * Every name `<ui-flyout>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary`.
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-flyout position="right" inverted width="4" visible>` => `ui right inverted four wide visible flyout`;
 *   a word width (`thin`, `very wide`) is added before the noun by the element (`ui left very wide flyout`).
 * - `visible`, Fomantic's shown-flyout class, is the element's own while it shows (the shared `visible` / `hidden`).
 * - The SAME dialog vocabulary as `<ui-modal>`, since both run on `DialogComponent`:
 *   `closable`, `closedby`, `header`, `content`, the six events, the `close` text.
 * - A flyout OWNS the `header`, `content`, `description` and `actions` parts:
 *   slotted ones get `:state(in-flyout)` and style themselves from `UIParts.css`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-flyout>`
 * A side modal, sliding in from an edge of the viewport:
 * `<dialog class="ui [position] ... flyout" part="flyout">`, shown with `showModal()`.
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
      detail: "{ visible: true, originalEvent?: Event }",
      cancelable: true,
      description: "About to show (a person's action, not a `visible` write);  `preventDefault()` keeps it hidden."
    },
    {
      name: "ui-show",
      detail: "{ visible: true }",
      description: "Shown, its entry transition finished (Fomantic's `onVisible`)."
    },
    {
      name: "ui-close",
      detail: "{ visible: false, reason: ModalCloseReason, originalEvent?: Event }",
      cancelable: true,
      description:
        "About to hide:  Escape, the dimmer, the close icon, approve or deny.  `preventDefault()` keeps it shown."
    },
    {
      name: "ui-hide",
      detail: "{ visible: false }",
      description: "Hidden, its exit transition finished (Fomantic's `onHidden`)."
    },
    {
      name: "ui-approve",
      detail: "{ action: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "An approve button (`.approve` / `.ok` / `.positive`, `<ui-button positive>`) was activated;  " +
        "`preventDefault()` keeps it shown (Fomantic's `onApprove` returning `false`)."
    },
    {
      name: "ui-deny",
      detail: "{ action: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "A deny button (`.deny` / `.cancel` / `.negative`, `<ui-button negative>`) was activated;  " +
        "`preventDefault()` keeps it shown."
    }
  ],
  slots: [{ name: "", description: "Content parts:  `<ui-header>`, `<ui-content>`, `<ui-actions>` with buttons." }],
  parts: [
    { name: "flyout", description: "The `<dialog>` panel;  its `::backdrop` is the dimmer." },
    { name: "header", description: "The `header` shorthand." },
    { name: "content", description: "The `content` shorthand." },
    { name: "close", description: "The close icon of a `closable` flyout." }
  ],
  states: [],
  texts: [{ key: "close", text: "Close", description: "Accessible name of the close icon." }],
  ownsParts: ["header", "content", "description", "actions"]
} as const satisfies E.ComponentVocabulary
