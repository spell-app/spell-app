/**
 * Types of `$/epics/markup`:  reading, writing and checking a plan doc's `<epic-*>` markup.
 * - Bottom of the folder's import graph:  `import type` only.  `markup.types` <- `MarkupCheck` <- `Markup`.
 */

import type { EpicTag } from "$/epics/definitions"

////////////////
// ## Writing
////////////////

/**
 * What `Markup.element()` puts inside a new element:  nodes, and strings of MARKUP (parsed, never escaped:  a
 * paragraph is `"<p>...</p>"`;  escape plain text yourself, or pass a text node).
 */
export type MarkupContent = string | Node | readonly (string | Node)[]

////////////////
// ## Checking
////////////////

/**
 * What `Markup.validate()` checks, by kind.
 * - `unknown tag` -- an `<epic-*>` no definition describes
 * - `unknown attribute` -- an attribute its vocabulary doesn't list (and not a global one:  `GLOBAL_ATTRIBUTES`)
 * - `bad value` -- not one of its `values`, not its `format`, not a number / boolean;  a `chosen` no option has
 * - `missing attribute` -- a `required` one
 * - `not allowed here` -- a child its parent's content model doesn't list, or an `<epic-*>` inside prose
 * - `out of order` -- a child before one its parent lists ahead of it (`childOrder: "listed"`)
 * - `too many` / `too few` -- a child spec's `max` / `min`
 * - `wrong id` -- a section's fixed id, or an item's letter in the wrong section
 * - `duplicate id` -- two elements with one id
 */
export const ProblemKinds = [
  "unknown tag",
  "unknown attribute",
  "bad value",
  "missing attribute",
  "not allowed here",
  "out of order",
  "too many",
  "too few",
  "wrong id",
  "duplicate id"
] as const

/** One of `ProblemKinds`. */
export type ProblemKind = (typeof ProblemKinds)[number]

/** One thing `Markup.validate()` found wrong. */
export type MarkupProblem = {
  /** What's wrong, by kind. */
  kind: ProblemKind
  /** The element it's about:  the child that's out of place, or the parent missing one. */
  element: Element
  /** That element in a few words, for a reader:  `<epic-item id="q3">`. */
  where: string
  /** What's wrong, and the fix, in a sentence. */
  message: string
}

/** `Markup.validate()`'s options. */
export type ValidateOptions = {
  /**
   * Check the root's CHILDREN as this element's:  a part file's body, read into a fragment, checked as its host's
   * content.  The host element itself (from the skeleton) also tells sections' kinds and items' letters apart;  a
   * bare tag checks every kind's children.
   */
  as?: EpicTag | Element
}

////////////////
// ## The DOM, without its globals
////////////////

/**
 * Attributes any `<epic-*>` element may carry beyond its vocabulary's:  HTML's own, the page's (`slot`), and
 * `aria-*`.
 * - NOT `data-*`:  an element's data is its vocabulary's attributes, so a leftover `data-status` is reported.
 */
export const GLOBAL_ATTRIBUTES = ["id", "class", "slot", "style", "hidden", "lang", "dir", "title", "role", "tabindex"]

/** Prefixes of attributes any element may carry. */
export const GLOBAL_ATTRIBUTE_PREFIXES = ["aria-"]

/** `Node.ELEMENT_NODE`:  linkedom documents have no `Node` global, so shared code compares `nodeType`. */
export const ELEMENT_NODE = 1

/** `Node.TEXT_NODE`. */
export const TEXT_NODE = 3

/** Every `<epic-*>` tag starts with this:  the pack's prefix. */
export const EPIC_PREFIX = "epic-"
