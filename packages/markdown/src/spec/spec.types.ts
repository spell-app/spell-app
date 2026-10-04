import type { MarkdownOptions, SpecExample } from "$/markdown"

// ## Options

/**
 * The options a spec example runs with:  GFM's autolinks and tagfilter extensions only for their own examples,
 * since core examples say bare URLs AREN'T links and `<script>` IS raw HTML.  (cmark-gfm's spec runner does the
 * same;  tables and strikethrough change nothing core, so they stay on.)
 */
export function specOptions(example: SpecExample): MarkdownOptions {
  return { autolinks: example.extension === "autolink", tagfilter: example.extension === "tagfilter" }
}

// ## Comparing

/** Block-level tags:  whitespace next to them doesn't change what a page shows. */
const BLOCK_TAG = /\s*(<\/?(?:ul|ol|li|p|blockquote|pre|h[1-6]|hr|table|thead|tbody|tr|th|td)\b[^>]*>)\s*/g

/**
 * `html` as the spec test compares it:  line ends unified, whitespace between tags and next to block-level tags
 * dropped.  So `<li>foo\n<ul>` and `<li>foo<ul>` compare equal, as they draw the same.
 */
export function comparableHTML(html: string) {
  return html.replace(/\r\n?/g, "\n").replace(BLOCK_TAG, "$1").replace(/>\s+</g, "><").trim()
}
