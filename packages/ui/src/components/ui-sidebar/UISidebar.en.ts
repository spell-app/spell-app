/**
 * Every name `<ui-sidebar>`, `<ui-pushable>` and `<ui-pusher>` use:
 * tags, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-sidebar position="right" width="thin" transition="scale down" visible>` =>
 *   `ui right thin scale down visible sidebar`.
 *   Without `transition`, the element adds Fomantic's default for its side
 *   (`uncover` left / right, `overlay` top / bottom).
 * - `visible` / `hidden` are every element's (`SharedVocabulary`):  a sidebar starts hidden (`elementSetup.visible`);
 *   the element adds the `visible` class word while it shows.  `ui-open` / `ui-close` can veto a person's changes.
 * - `position` and `transition` are `kind: "valueOnly"`:  each emits its value alone.
 * - `width` (`kind: "width"`, as `<ui-flyout>`'s) takes Fomantic's sidebar words (`very thin` ... `very wide`),
 *   which the element adds before the noun (`ui left thin sidebar`),
 *   AND columns of the viewport (`4`, `1/4`, `25%` => `four wide`).
 * - `pushable` / `pusher` have no `ui` (Fomantic's `.pushable`, `.pusher`).
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-sidebar>`
 * A panel along one edge of a `<ui-pushable>`:
 * a `<dialog class="ui ... sidebar" part="sidebar">` (modal, the default) or an `<aside>` (`persistent`).
 ****************/
export const sidebarVocabulary = {
  tag: "ui-sidebar",
  topics: ["navigation", "overlays", "layout", "menus", "modules"],
  aka: ["drawer", "off canvas", "side menu", "nav drawer", "hamburger menu"],
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
      kind: "width",
      description:
        "Width of a `left` / `right` sidebar:  Fomantic's words -- `very thin` (60px), `thin` (150px), 260px by " +
        "default, `wide` (350px), `very wide` (475px) -- or columns of the viewport (`4`, `1/4`, `25%` => " +
        "`four wide`)."
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
      description: "About to show for a person's action (an invoker command);  `preventDefault()` keeps it hidden."
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
  states: [{ name: "sidebar", description: "Always:  its `<ui-pushable>` finds it by this." }],
  texts: [{ key: "sidebar", text: "Sidebar", description: "Accessible name of an unnamed sidebar." }]
} as const satisfies E.ComponentVocabulary
