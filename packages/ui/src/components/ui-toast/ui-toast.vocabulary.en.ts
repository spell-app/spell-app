/**
 * Every name `<ui-toast>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-toast type="success" inverted>` => `ui success inverted toast`.  The element adds the layout words after
 *   the noun (`vertical`, `actions`, `attached top`, `compact`), as Fomantic's JS did.
 * - `type` and `color` are both remaps (`colors.css`);  `type` is `kind: "valueOnly"` because it emits its value alone
 *   (`ui success toast`), as message's `state` does.  `neutral` (the default look) has no remap:  `ui-toast.css` owns it.
 * - `UI.toast({...})` (`ToastStack`) builds one of these per call, in a container per position;  a `<ui-toast>`
 *   written in the page shows where it is.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-toast>`
 * A toast:  `<div class="floating toast-box" part="box">` around `<div class="ui ... toast" part="toast">`, an
 * optional progress bar and attached actions.
 ****************/
export const toastVocabulary = {
  tag: "ui-toast",
  topics: ["notifications", "messages", "feedback", "overlays", "modules"],
  aka: ["snackbar", "notification", "growl", "flash message", "toaster"],
  skeleton: false,
  noun: "toast",
  description: "A toast gives people a short, non-blocking notification.",
  attributes: [
    {
      name: "type",
      kind: "valueOnly",
      values: ["info", "success", "warning", "error", "neutral"],
      description: "Consequence (Fomantic's `class`), tinting it like a colour;  `error` also announces it as an alert."
    },
    { name: "color", kind: "color", description: "Hue:  a filled toast in that colour." },
    { name: "inverted", kind: "keyOnly", description: "The dark scheme;  a coloured one takes its light variant." },
    { name: "header", kind: "string", description: "Bold first line (Fomantic's `title`)." },
    { name: "message", kind: "string", description: "Body text;  slotted content follows it." },
    {
      name: "icon",
      kind: "icon",
      description:
        'Icon name beside the content;  bare `icon` (or `"true"`, as frameworks write it) uses the type\'s own ' +
        "(info, check, warning, cross)."
    },
    { name: "closable", kind: "boolean", description: "Shows a close icon (Fomantic's `closeIcon`)." },
    {
      name: "close-on-click",
      kind: "boolean",
      default: true,
      description:
        "A click anywhere on it closes it (Fomantic's `closeOnClick`);  off anyway with `closable`, actions or " +
        "form controls inside."
    },
    {
      name: "display-time",
      kind: "string",
      description:
        "Milliseconds before it closes itself;  absent or `0` keeps it until closed;  `auto` ~== reading time " +
        "(120 words a minute, at least a second).  `UI.toast()` defaults to `3000`."
    },
    {
      name: "progress",
      kind: "enum",
      values: ["top", "bottom"],
      description: "Shows a bar counting the display time down, at the `top` or `bottom` (Fomantic's `showProgress`)."
    },
    { name: "progress-up", kind: "boolean", description: "The bar fills up instead of emptying." },
    {
      name: "pause-on-hover",
      kind: "boolean",
      default: true,
      description: "Pauses the countdown while the pointer is over it.  Focus inside ALWAYS pauses it."
    },
    {
      name: "compact",
      kind: "boolean",
      default: true,
      description: 'A fixed width (350px);  `compact="false"` sizes it to its content.'
    },
    {
      name: "actions",
      kind: "string",
      values: ["basic", "left", "attached", "vertical", "top", "bottom"],
      description:
        "Layout words of the `actions` slot (Fomantic's `classActions`):  `basic` (no bar), `left` (aligned left), " +
        "`attached` (joined below, or `attached top` above), `vertical` (a column beside the content)."
    }
  ],
  events: [
    {
      name: "ui-show",
      detail: "{ displayTime: number }",
      description: "Shown, its entry animation finished (Fomantic's `onVisible`);  the countdown has started."
    },
    {
      name: "ui-close",
      detail: "{ reason: ToastCloseReason, originalEvent?: Event }",
      cancelable: true,
      description:
        "About to close:  the countdown ran out, the close icon, a click, Escape inside it, an action, a `--close` invoker command.  " +
        "`preventDefault()` keeps it (Fomantic's `onHide` returning `false`)."
    },
    {
      name: "ui-hide",
      detail: "{ reason: ToastCloseReason }",
      description:
        "Closed, its exit animation finished (Fomantic's `onHidden`);  the host is `hidden` now.  " +
        "`UI.toast()` removes its toasts here."
    },
    {
      name: "ui-approve",
      detail: "{ action: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "An approve action (`.approve` / `.ok` / `.positive`, `<ui-button positive>`) was activated;  " +
        "`preventDefault()` keeps the toast open."
    },
    {
      name: "ui-deny",
      detail: "{ action: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "A deny action (`.deny` / `.cancel` / `.negative`, `<ui-button negative>`) was activated;  " +
        "`preventDefault()` keeps the toast open."
    }
  ],
  slots: [
    { name: "", description: "Rich content, after the `message`." },
    {
      name: "actions",
      description:
        "Buttons:  `<ui-button>`s, or a `<ui-buttons>` group for `attached` actions.  Any activated one closes " +
        "the toast unless its click was `preventDefault()`ed."
    }
  ],
  parts: [
    { name: "box", description: "The toast box around the toast, its progress bar and attached actions." },
    { name: "toast", description: "The toast itself (`role=status`, `alert` for errors)." },
    { name: "icon", description: "The icon box." },
    { name: "content", description: "The content block:  header, message, slot." },
    { name: "header", description: "The `header` shorthand." },
    { name: "message", description: "The `message` shorthand." },
    { name: "close", description: "The close icon of a `closable` toast." },
    { name: "actions", description: "The box around the `actions` slot." },
    { name: "progress", description: "The progress bar's track." },
    { name: "bar", description: "The progress bar." }
  ],
  states: [
    { name: "paused", description: "Countdown paused:  pointer over it, or focus inside." },
    { name: "closing", description: "Closing:  its exit animation is running." }
  ],
  texts: [
    { key: "close", text: "Close", description: "Accessible name of the close icon." },
    {
      key: "notifications",
      text: "Notifications",
      description: "Accessible name of each `UI.toast()` container (a `region` landmark)."
    }
  ]
} as const satisfies E.ComponentVocabulary
