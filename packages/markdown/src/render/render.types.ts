import type { Block } from "$/markdown"

// ## Markup

/**
 * What markdown draws as:  a framework-free description of HTML, built by `MD.h()`.
 * - Strings and numbers are text;  `null`, `undefined` and booleans draw nothing (as in JSX), so `!!x && "y"`
 *   works;  arrays are fragments, nested freely.
 * - `MD.markupToHTML()` writes it as an HTML string;  `MD.toText()` reads its text.
 * - Plain data, not DOM:  markdown renders under node too, and `ui` runs it from a pre-built bundle.
 */
export type Markup = MarkupElement | string | number | boolean | null | undefined | Markup[]

/** One element of `Markup`, e.g. `<a href="x">link</a>`:  make with `MD.h()`. */
export type MarkupElement = {
  /** Tag name, e.g. `a`. */
  tag: string
  /** Attributes in the order they're set;  `undefined` ones are skipped. */
  attrs: Record<string, string | number | undefined>
  /** Contents. */
  children: Markup[]
}

/** Element `<tag>` with `attrs` around `children`:  the hyperscript every drawing here is built from. */
export function h(tag: string, attrs: MarkupElement["attrs"], ...children: Markup[]): MarkupElement {
  return { tag, attrs, children }
}

/** Text `markup` draws, nested any depth:  `null`, `undefined` and booleans draw nothing.  No DOM. */
export function toText(markup: Markup): string {
  if (markup == null || typeof markup === "boolean") return ""
  if (Array.isArray(markup)) return markup.map(toText).join("")
  if (typeof markup === "object") return markup.children.map(toText).join("")
  return String(markup)
}

/**
 * A raw-HTML node in `MD.Markup`:  `MD.markupToHTML()` writes its text as is, unescaped (HTML blocks, inline HTML).
 * - `MD.Markup` has no raw node of its own:  this tag name can't be a real element's.
 */
export const RAW_TAG = "#raw"

/** Raw HTML `html`, as a `MD.Markup` element. */
export function raw(html: string): MarkupElement {
  return { tag: RAW_TAG, attrs: {}, children: [html] }
}

/** Elements written `<br />`, never with a closing tag. */
export const VOID_TAGS = new Set(["br", "hr", "img", "input"])

// ## Headings

/** One heading of a rendered document:  the outline `<ui-markdown>` offers as `headings`. */
export type MarkdownHeading = {
  /** 1-6, after any `headingOffset`. */
  level: number
  /** Plain text. */
  text: string
  /** Its id (GitHub's slug), or `""` without `headingIds`. */
  id: string
}

/** GitHub's heading slug:  `Getting started!` => `getting-started` (lowercase, punctuation dropped, spaces to `-`). */
export function slug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, "")
    .replace(/\s/g, "-")
}

/** `base`, numbered if `seen` has it already (`setup`, `setup-1` ...).  SIDE EFFECT:  records it in `seen`. */
export function uniqueSlug(base: string, seen: Map<string, number>) {
  const count = seen.get(base) ?? 0
  seen.set(base, count + 1)
  return count ? `${base}-${count}` : base
}

// ## GitHub extras

/** GitHub alert kinds (`> [!NOTE]`), and their titles. */
const ALERT_TITLES: Record<string, string> = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution"
}

/** How each alert kind draws as a `ui-message`. */
export const ALERT_LOOKS: Record<string, { state?: string; color?: string; icon: string }> = {
  note: { state: "info", icon: "info circle" },
  tip: { state: "positive", icon: "lightbulb" },
  important: { color: "purple", icon: "exclamation circle" },
  warning: { state: "warning", icon: "exclamation triangle" },
  caution: { state: "negative", icon: "ban" }
}

/**
 * Is `quote` a GitHub alert -- its first line `[!NOTE]` (or TIP, IMPORTANT, WARNING, CAUTION, any case) alone?
 * - Returns its kind, title, and its children with that line taken out (a NEW first paragraph:  `quote` is
 *   untouched, so a document can be drawn again).
 */
export function alertOf(quote: Block): { kind: string; title: string; children: Block[] } | undefined {
  const [first, ...rest] = quote.children
  if (first?.kind !== "paragraph") return undefined
  const marker = /^\[!(note|tip|important|warning|caution)\][ \t]*$/i.exec(first.lines[0]?.trim() ?? "")
  if (!marker) return undefined
  const kind = marker[1]!.toLowerCase()
  const lines = first.lines.slice(1)
  return { kind, title: ALERT_TITLES[kind]!, children: lines.length ? [{ ...first, lines }, ...rest] : rest }
}

/**
 * Is `item` a task item -- its first paragraph starting `[ ]` or `[x]` and a space?
 * - Returns whether it's checked, and its children with the box taken out (a NEW first paragraph, as `alertOf()`).
 */
export function taskOf(item: Block): { checked: boolean; children: Block[] } | undefined {
  const [first, ...rest] = item.children
  if (first?.kind !== "paragraph") return undefined
  const box = /^\[([ xX])\](?:[ \t]+|$)/.exec(first.lines[0] ?? "")
  if (!box) return undefined
  const lines = [first.lines[0]!.slice(box[0].length), ...first.lines.slice(1)]
  return { checked: box[1] !== " ", children: [{ ...first, lines }, ...rest] }
}

// ## Text

/** `text` with `&`, `<`, `>`, `"` escaped, for HTML text and attribute values. */
export function escapeHTML(text: string) {
  return text.replace(/[&<>"]/g, (char) => ESCAPES[char]!)
}

/** What `escapeHTML()` writes for each special character. */
const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }
