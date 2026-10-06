/**
 * Every name `<ui-modal>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-modal size="tiny" basic vertical-align="top" open>` => `ui tiny active basic top aligned modal`.
 * - Sizes are WIDTHS here (Fomantic's modal ratios), not text sizes:  `ui-modal.css` reads the size class, never
 *   `--ui-scale`.
 * - A modal OWNS the `header`, `content`, `description` and `actions` parts:  slotted ones get `:state(in-modal)`
 *   and style themselves from `ui-parts.css`, reading `--_ui-modal-basic` / `--_ui-modal-header-size` (`ui-modal.css`).
 * - `closedby` mirrors `<dialog closedby>`:  `any` (Fomantic's `closable: true`), `closerequest` (Escape only),
 *   `none`.  `closable` is the close ICON (Fomantic's `closeIcon`), and `closable="false"` also brings back
 *   Fomantic's `closable: false` (dismissal `none`) unless `closedby` is set.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-modal>`
 * A modal dialog:  `<dialog class="ui ... modal" part="modal">`, shown with `showModal()`.
 ****************/
export const modalVocabulary = {
  tag: "ui-modal",
  topics: ["dialogs", "overlays", "popups", "modules"],
  aka: ["dialog", "popup window", "lightbox", "confirm", "alert dialog"],
  skeleton: false,
  noun: "modal",
  description: "A modal displays content that temporarily blocks interactions with the main view of a site.",
  attributes: [
    {
      name: "size",
      kind: "size",
      description: "Width, `mini` ... `massive` (Fomantic's ratios of the default width);  `medium` is the default."
    },
    { name: "basic", kind: "keyOnly", description: "No box:  light text straight on the dimmer." },
    { name: "inverted", kind: "keyOnly", description: "The dark scheme." },
    { name: "fullscreen", kind: "keyOnly", description: "Nearly the whole viewport wide." },
    {
      name: "overlay",
      kind: "keyOnly",
      description: "With `fullscreen`:  covers the whole viewport, edge to edge (`overlay fullscreen`)."
    },
    { name: "scrolling", kind: "keyOnly", description: "Scrolls inside itself when taller than the viewport." },
    {
      name: "vertical-align",
      kind: "verticalAlign",
      values: ["top", "bottom"],
      description: "Pinned near the `top` or `bottom` of the viewport instead of centred (`top aligned`)."
    },
    {
      name: "open",
      kind: "keyOnly",
      key: "active",
      description: "Shown.  Controlled:  set it to show / hide;  `ui-open` / `ui-close` can veto a person's changes."
    },
    {
      name: "closable",
      kind: "boolean",
      description:
        "Shows a close icon (Fomantic's `closeIcon` setting).  `closable=\"false\"` is also Fomantic's `closable: " +
        'false` setting:  no icon AND `closedby="none"` (Escape and the dimmer do nothing), unless `closedby` is ' +
        "set, which wins for dismissal.  Absent:  no icon, dismissed by `closedby` (default `any`)."
    },
    {
      name: "closedby",
      kind: "enum",
      values: ["any", "closerequest", "none"],
      default: "any",
      property: "closedBy",
      description:
        "What dismisses it, as `<dialog closedby>` (Fomantic's `closable` setting, in three steps):  `any` -- " +
        "Escape or a click on the dimmer (default);  `closerequest` -- Escape only;  `none` -- only its own " +
        'buttons.  Read when it opens;  when set, it wins over `closable="false"`.'
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
        "`preventDefault()` keeps the modal open (Fomantic's `onApprove` returning `false`)."
    },
    {
      name: "ui-deny",
      detail: "{ action: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "A deny button (`.deny` / `.cancel` / `.negative`, `<ui-button negative>`) was activated;  " +
        "`preventDefault()` keeps the modal open."
    }
  ],
  slots: [
    {
      name: "",
      description: "Content parts:  `<ui-header>`, `<ui-content>` (`image`, `scrolling`), `<ui-actions>` with buttons."
    }
  ],
  parts: [
    { name: "modal", description: "The `<dialog>` box;  its `::backdrop` is the dimmer." },
    { name: "header", description: "The `header` shorthand." },
    { name: "content", description: "The `content` shorthand." },
    { name: "close", description: "The close icon of a `closable` modal." }
  ],
  states: [{ name: "open", description: "Shown." }],
  texts: [
    { key: "close", text: "Close", description: "Accessible name of the close icon." },
    { key: "ok", text: "OK", description: "Approve button of `UI.modals.confirm()` / `alert()` / `prompt()`." },
    { key: "cancel", text: "Cancel", description: "Deny button of `UI.modals.confirm()` / `prompt()`." }
  ],
  ownsParts: ["header", "content", "description", "actions"]
} as const satisfies E.ComponentVocabulary
