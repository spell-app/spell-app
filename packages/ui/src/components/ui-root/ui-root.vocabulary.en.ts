/**
 * Every name `<ui-root>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - No Fomantic counterpart, so no class grammar:  every attribute is a property (`enum`, `string`, `boolean`), plus
 *   `size` (kind `size`, for the shared value set), which the root applies to its subtree, not to a class.
 * - Design:  `packages/docs/epics/ui-component-creation/ui-component-creation.html`, Overview 3.5 and D51-D68.
 */

import * as UIT from "$/ui/components/components.types"
import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-root>`
 * The top of a page or app:  loads the families its subtree uses on demand, sets icon packs, emoji names, theme and
 * size for what's inside, and hides it until every component in it is ready.
 ****************/
export const rootVocabulary = {
  tag: "ui-root",
  topics: ["layout", "containers", "loading", "basic"],
  aka: ["app shell", "app root", "provider", "loader", "lazy loading", "theme provider"],
  skeleton: null,
  noun: "root",
  description:
    "A root loads the components inside it on demand, sets their theme and size, and shows them once they're ready.",
  attributes: [
    {
      name: "display",
      kind: "enum",
      values: ["skeleton", "when-ready", "immediately"],
      default: "skeleton",
      description:
        "While components load:  `skeleton` -- a placeholder per component that describes one (else nothing), then " +
        "the content;  `when-ready` -- nothing (space kept) " +
        "until everything is ready;  `immediately` -- draw as things arrive."
    },
    {
      name: "loading",
      kind: "string",
      description:
        "A loader with this message while components load (bare `loading`:  the default text).  Not with `immediately`."
    },
    {
      name: "timeout",
      kind: "string",
      default: "5s",
      description:
        "Longest wait before showing the content anyway:  `5s`, `500ms`, or milliseconds.  A component that didn't " +
        "load fires `ui-error` and shows its native fallback."
    },
    { name: "theme", kind: "enum", values: ["light", "dark"], description: "Colour scheme of everything inside." },
    { name: "size", kind: "size", description: "Size of everything inside, `mini` ... `massive`." },
    {
      name: "stack-with",
      kind: "enum",
      values: UIT.STACK_WITH_VALUES,
      description:
        "What stacking layouts inside measure (`stackable`, `doubling` ... on grids, cards, steps, forms, items, " +
        "statistics;  tables' `stack-by`):  `container` -- each element's own width (their default);  `page` -- the " +
        "screen's, as in Fomantic.  Sets the `--ui-stack-with` token;  an element's own `stack-with` wins."
    },
    {
      name: "width",
      kind: "string",
      description:
        "Width as a CSS length (`600px`, `40em`, `50%`) or `window` (the viewport's).  With a width or height the root " +
        "is a box that scrolls its own content, in a region named by the host's `aria-label` (name each one when a " +
        "page has several)."
    },
    {
      name: "height",
      kind: "string",
      description: "Height as a CSS length or `window` (the viewport's, following a phone's address bar)."
    },
    {
      name: "icons",
      kind: "string",
      description:
        "Icon packs for everything inside, comma-separated:  built-in ids (`fa7-free`, `fa7-brands`, `fomantic`) or " +
        "`pack.js` URLs, later wins.  Added over the outer root's packs (or the page's)."
    },
    {
      name: "emoji",
      kind: "enum",
      values: ["cldr", "fomantic"],
      description: "Emoji names for everything inside:  `cldr` (the default) or `fomantic`."
    },
    {
      name: "assets",
      kind: "string",
      description:
        "Folder the built-in icon packs load from (`<assets>icon-packs/<id>/pack.js`), relative to the page;  " +
        "default:  beside the library."
    },
    {
      name: "fixed",
      kind: "boolean",
      description:
        "Fills the viewport and stays there (`position: fixed`):  the page never scrolls, the root does.  A " +
        "full-page app shell.  On iOS the keyboard can cover fields near the bottom."
    }
  ],
  events: [
    {
      name: "ui-ready",
      detail: "{ failed: { tag: string, reason: 'unknown' | 'failed' | 'timeout', error?: unknown }[] }",
      description:
        "Everything inside is ready (or the timeout passed):  the content shows.  `failed` lists what didn't load."
    },
    {
      name: "ui-error",
      detail: "{ tag: string, reason: 'unknown' | 'failed' | 'timeout', error?: unknown }",
      cancelable: true,
      description:
        "A tag inside couldn't load:  no such component (`unknown`), its family didn't load (`failed`), or it " +
        "wasn't ready in time (`timeout`).  Cancel it to skip the console warning."
    }
  ],
  slots: [{ name: "", description: "The page or app:  any markup, with `ui-*` elements anywhere inside." }],
  parts: [
    { name: "loading", description: "The `<ui-loader>` shown with `loading`." },
    { name: "skeleton", description: 'The box of `<ui-placeholder>`s shown with `display="skeleton"`.' },
    {
      name: "scroller",
      description:
        "With `width` / `height` / `fixed`:  the region around the content that scrolls (a tab stop, named by the host's " +
        '`aria-label`, else "Content").'
    }
  ],
  states: [
    { name: "loading", description: "Components inside are still loading." },
    { name: "ready", description: "Everything inside is ready (or the timeout passed)." },
    { name: "light", description: '`theme="light"`.' },
    { name: "dark", description: '`theme="dark"`.' },
    { name: "box", description: "A `width` or `height` is set:  a block box that scrolls its content." },
    { name: "fixed", description: "Pinned to the viewport." }
  ],
  texts: [
    { key: "loading", text: "Loading…", description: "The loader's message for a bare `loading`." },
    {
      key: "label",
      text: "Content",
      description: "Name of the scrolling region of a root with a box, when the host has no `aria-label`."
    }
  ]
} as const satisfies ComponentVocabulary
