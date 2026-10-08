import { MD } from "$/markdown"

/**
 * `MD.Markup` => an HTML string.
 * - Text is escaped;  `MD.raw()` nodes are written as they are;  void tags (`br`, `hr` ...) as `<hr />`.
 * - Attributes in their order, `undefined` ones skipped, values escaped.
 */
export function markupToHTML(markup: MD.Markup): string {
  if (markup === null || markup === undefined || typeof markup === "boolean") return ""
  if (typeof markup === "string") return MD.escapeHTML(markup)
  if (typeof markup === "number") return String(markup)
  if (Array.isArray(markup)) return markup.map(markupToHTML).join("")
  if (markup.tag === MD.RAW_TAG) return markup.children.map(String).join("")
  let attrs = ""
  for (const [name, value] of Object.entries(markup.attrs)) {
    if (value !== undefined) attrs += ` ${name}="${MD.escapeHTML(String(value))}"`
  }
  if (MD.VOID_TAGS.has(markup.tag)) return `<${markup.tag}${attrs} />`
  return `<${markup.tag}${attrs}>${markup.children.map(markupToHTML).join("")}</${markup.tag}>`
}
