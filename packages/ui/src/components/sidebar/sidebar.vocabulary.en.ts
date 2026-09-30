/**
 * Every name `<ui-sidebar>`, `<ui-pushable>` and `<ui-pusher>` use:  tags, attributes (kind + allowed values),
 * events, slots, parts, states, texts.  Schema:  `ComponentVocabulary` (`$/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-sidebar position="right" width="thin" transition="scale down" visible>` =>
 *   `ui right thin scale down visible sidebar`.  Without `transition`, the element adds Fomantic's default for
 *   its side (`uncover` left / right, `overlay` top / bottom).
 * - `position`, `width` and `transition` are `kind: "valueOnly"`:  each emits its value alone.
 * - `width` takes Fomantic's sidebar words (`very thin` ... `very wide`), never columns.
 * - `pushable` / `pusher` have no `ui` (Fomantic's `.pushable`, `.pusher`).
 */

import type { ComponentVocabulary } from "$/vocabulary"

/****************
 * ### `<ui-sidebar>`
 * A panel along one edge of a `<ui-pushable>`:  a `<dialog class="ui ... sidebar" part="sidebar">` (modal, the
 * default) or an `<aside>` (`persistent`).
 ****************/
export const sidebarVocabulary = {
  tag: "ui-sidebar",
  noun: "sidebar",
  description: "A sidebar hides additional content beside a page.",
  attributes: [
    {
      name: "position",
      kind: "valueOnly",
      values: ["left", "right", "top", "bottom"],
      default: "left",
      description: "Edge it sits on:  `left` (default), `right`, `top`, `bottom`."
    },
    {
      name: "width",
      kind: "valueOnly",
      values: ["very thin", "thin", "wide", "very wide"],
      description:
        "Width of a `left` / `right` sidebar:  `very thin` (60px), `thin` (150px), 260px by default, `wide` " +
        "(350px), `very wide` (475px)."
    },
    {
      name: "transition",
      kind: "valueOnly",
      values: ["overlay", "push", "scale down", "uncover", "slide along", "slide out"],
      description:
        "How it appears (Fomantic's animations):  over the page, pushing it, shrinking it, from under it ...  " +
        "Default:  `uncover` on the left / right, `overlay` at the top / bottom."
    },
    { name: "inverted", kind: "keyOnly", description: "A dark panel (put an `inverted` menu in it)." },
    { name: "blurring", kind: "keyOnly", description: "Blurs the dimmed page beside it." },
    {
      name: "visible",
      kind: "keyOnly",
      description: "Shown.  Controlled:  set it to show / hide;  `ui-open` / `ui-close` can veto the user's changes."
    },
    {
      name: "persistent",
      kind: "boolean",
      description:
        "Part of the page, not a modal:  an `<aside>` landmark;  the page beside it is neither dimmed nor inert, " +
        "focus doesn't move, and nothing but `visible` hides it."
    },
    {
      name: "closedby",
      kind: "enum",
      values: ["any", "closerequest", "none"],
      default: "any",
      property: "closedBy",
      description:
        "What hides a modal sidebar, as `<dialog closedby>`:  `any` -- Escape or a click on the page beside it " +
        "(default);  `closerequest` -- Escape only;  `none` -- only `visible`.  Read when it shows."
    }
  ],
  events: [
    {
      name: "ui-open",
      detail: "{ visible: true, originalEvent?: Event }",
      cancelable: true,
      description: "About to show for a user action (an invoker command);  `preventDefault()` keeps it hidden."
    },
    {
      name: "ui-show",
      detail: "{ visible: true }",
      description: "Shown, its transition finished (Fomantic's `onVisible`)."
    },
    {
      name: "ui-close",
      detail: "{ visible: false, reason: SidebarCloseReason, originalEvent?: Event }",
      cancelable: true,
      description: "About to hide:  Escape, a click beside it, a command.  `preventDefault()` keeps it shown."
    },
    {
      name: "ui-hide",
      detail: "{ visible: false }",
      description: "Hidden, its transition finished (Fomantic's `onHidden`)."
    }
  ],
  slots: [{ name: "", description: "The content:  usually a `<ui-menu vertical fluid>`." }],
  parts: [{ name: "sidebar", description: "The panel:  a `<dialog>`, or an `<aside>` when `persistent`." }],
  states: [
    { name: "sidebar", description: "Always:  its `<ui-pushable>` finds it by this." },
    { name: "visible", description: "Shown." }
  ],
  texts: [{ key: "sidebar", text: "Sidebar", description: "Accessible name of an unnamed sidebar." }]
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-pushable>`
 * The box a sidebar slides in:  `<div class="pushable" part="pushable"><slot>`, holding `<ui-sidebar>`s and a
 * `<ui-pusher>`.
 ****************/
export const pushableVocabulary = {
  tag: "ui-pushable",
  noun: "pushable",
  ui: false,
  description: "The context a sidebar appears in:  it clips them and moves its pusher.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "`<ui-sidebar>`s and one `<ui-pusher>`." }],
  parts: [{ name: "pushable", description: "The clipping box." }],
  states: [{ name: "pushable", description: "Always:  its sidebars find it by this." }],
  texts: []
} as const satisfies ComponentVocabulary

/****************
 * ### `<ui-pusher>`
 * The page content beside a sidebar:  `<div class="pusher" part="pusher"><slot>`, moved, dimmed and made `inert`
 * by its `<ui-pushable>`.
 ****************/
export const pusherVocabulary = {
  tag: "ui-pusher",
  noun: "pusher",
  ui: false,
  description: "The content a sidebar pushes (and dims) when it appears.",
  attributes: [],
  events: [],
  slots: [{ name: "", description: "The page content." }],
  parts: [{ name: "pusher", description: "The content box;  its `::after` is the dimmer." }],
  states: [{ name: "pusher", description: "Always:  its `<ui-pushable>` finds it by this." }],
  texts: []
} as const satisfies ComponentVocabulary
