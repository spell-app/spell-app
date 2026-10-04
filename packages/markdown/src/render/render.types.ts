import type { P } from "$/parser"

// ## Markup

/**
 * A raw-HTML node in `P.Markup`:  `MD.markupToHTML()` writes its text as is, unescaped (HTML blocks, inline HTML).
 * - `P.Markup` has no raw node of its own:  this tag name can't be a real element's.
 */
export const RAW_TAG = "#raw"

/** Raw HTML `html`, as a `P.Markup` element. */
export function raw(html: string): P.MarkupElement {
  return { tag: RAW_TAG, attrs: {}, children: [html] }
}

/** Elements written `<br />`, never with a closing tag. */
export const VOID_TAGS = new Set(["br", "hr", "img", "input"])

// ## Text

/** `text` with `&`, `<`, `>`, `"` escaped, for HTML text and attribute values. */
export function escapeHTML(text: string) {
  return text.replace(/[&<>"]/g, (char) => ESCAPES[char]!)
}

/** What `escapeHTML()` writes for each special character. */
const ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }
