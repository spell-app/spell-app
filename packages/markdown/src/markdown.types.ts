// ## Text

/**
 * Markdown text as the parser wants it:  `\r\n` / `\r` line ends become `\n`, and a trailing newline is added if
 * missing (CommonMark treats the end of input as the end of a line).
 */
export function normalize(text: string) {
  const unix = text.replace(/\r\n?/g, "\n")
  return unix.endsWith("\n") ? unix : `${unix}\n`
}

// ## Options

/**
 * GFM extensions that change what CORE markdown means, so each can be turned off -- on by default, as on GitHub.
 * - The spec test turns each on only for its own examples (cmark-gfm's spec runner does the same).
 */
export type MarkdownOptions = {
  /** Bare `www.x.com`, `https://...`, `a@b.c` become links (GFM 6.9). */
  autolinks?: boolean
  /** Raw `<script>`, `<style>`, `<iframe>` ... are written escaped (GFM 6.11). */
  tagfilter?: boolean
}

/** `MD.render()`'s options:  the GFM extensions, plus how it draws -- `<ui-markdown>`'s attributes map onto these. */
export type RenderOptions = MarkdownOptions & {
  /** `ui-*` elements (default) or plain HTML tags. */
  ui?: boolean
  /** GitHub slug ids on headings (default on), so `[see](#setup)` links work. */
  headingIds?: boolean
  /** Shift every heading's level by this much, clamped to 1-6. */
  headingOffset?: number
  /** A line end inside a paragraph is a `<br>` (GitHub comments), not a space. */
  breaks?: boolean
}

// ## Spec

/** One GFM spec example, as `src/spec/gfm-spec.json` holds it. */
export type SpecExample = {
  /** 1-based number, as the spec counts them. */
  example: number
  /** Heading the example sits under, e.g. `Tabs`, `Tables (extension)`. */
  section: string
  /** The GFM extension it tests:  `table`, `strikethrough`, `autolink`, `tagfilter`, or `disabled`. */
  extension?: string
  /** Input. */
  markdown: string
  /** Expected plain HTML. */
  html: string
}
