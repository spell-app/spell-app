/**
 * Loose constants and types of the `ui-docs-example` family:  what the element, its source capture (`ExampleSource`),
 * the markup formatter (`HtmlFormatter`) and the native fallback share.
 * - Data only:  nothing here runs.
 */

import type { docsExampleVocabulary } from "./ui-docs-example.vocabulary.en"

/** `docsExampleVocabulary`'s type. */
export type DocsExampleVocabulary = typeof docsExampleVocabulary

////////////////
// ## Element
////////////////

/** The tag whose markup `ExampleSource.snapshot()` keeps:  `docsExampleVocabulary.tag`, as a value. */
export const EXAMPLE_TAG = "ui-docs-example"

/** The icon of the code button:  Fomantic's `code` icon. */
export const CODE_ICON = "code"

/** Id of the code pane inside the shadow root, for the button's `aria-controls`. */
export const CODE_PANE_ID = "code"

/** `level` bounds:  a heading level. */
export const MIN_LEVEL = 1
export const MAX_LEVEL = 6

/** `level` when unset:  Fomantic's examples are `h4`. */
export const DEFAULT_LEVEL = 4

/** `language` when unset. */
export const DEFAULT_LANGUAGE = "html"

/** A backticked span in a `description`, shown as `<code>`. */
export const CODE_SPAN = /`([^`]+)`/g

////////////////
// ## Source capture
////////////////

/**
 * `globalThis` key of the page's markup snapshots (`ExampleSource.snapshot()`):  host => its `innerHTML` before any
 * family upgraded it.
 * - A registered symbol, so the site entry's copy of `ExampleSource` and the lazily loaded family's agree even if a
 *   bundler gave each its own copy of the module.
 */
export const SNAPSHOTS_KEY = Symbol.for("@spell-app/ui-docs:example-sources")

/** `globalThis` with the snapshots. */
export type SnapshotGlobal = typeof globalThis & { [SNAPSHOTS_KEY]?: WeakMap<Element, string> }

/**
 * Named slots of the example ITSELF:  their children are its chrome, not part of the example's markup.
 * - The default slot is the example.
 */
export const OWN_SLOTS: readonly string[] = ["description"]

/**
 * Attributes the RUNTIME puts on light-DOM elements, never written by an author:  stripped from the shown markup
 * when it's read from a live (already upgraded) tree.
 * - `RovingTabindex`'s `tabindex` is NOT here:  authors write `tabindex` too.  A snapshot or a `<template>` avoids
 *   the problem (see `ExampleSource`).
 */
export const RUNTIME_ATTRIBUTES: readonly string[] = ["data-ui-animation", "data-ui-hidden-by-animation"]

////////////////
// ## Formatter
////////////////

/** Options for `new HtmlFormatter()`. */
export type HtmlFormatterOptions = {
  /** max line length before expanding an element, default `100` */
  width?: number
  /** one indentation level, default two spaces */
  indent?: string
}

/** A parsed node. */
export type HtmlNode = HtmlElement | { kind: "text"; text: string } | { kind: "comment"; text: string }

/** A parsed element. */
export type HtmlElement = {
  kind: "element"
  /** lower-case tag name, `#root` for the synthetic root */
  tag: string
  /** the opening tag as written, whitespace collapsed, minus rendering artefacts (`cleanOpenTag()`) */
  open: string
  /** child nodes, empty for void and raw-text elements */
  children: HtmlNode[]
  /** verbatim content of a raw-text element (`<pre>`, `<script>` ...) */
  raw?: string
}

/** Attributes whose `"true"` is an enumerated VALUE, not a boolean presence. */
export const ENUMERATED_TRUE = new Set(["contenteditable", "draggable", "spellcheck", "translate", "autocapitalize"])

/**
 * One token:  a comment (group 1), or a tag with an optional `/` (group 2) and its name (group 3).
 * - Attribute values may contain `>`, so quoted values are matched explicitly.
 */
export const TOKEN =
  /(<!--[\s\S]*?-->)|<(\/?)([a-zA-Z][\w:-]*)(?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*\s*\/?>/g

/** Elements with no content or closing tag. */
export const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr"
])

/** Elements whose content is not parsed:  kept as text. */
export const RAW = new Set(["pre", "textarea", "script", "style", "ui-code", "ui-markdown"])

/** Raw elements whose content is printed exactly as found, never re-indented. */
export const VERBATIM = new Set(["pre", "textarea", "ui-code", "ui-markdown"])

/** Text-level elements that stay on the same line as surrounding text. */
export const INLINE = new Set([
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr"
])
