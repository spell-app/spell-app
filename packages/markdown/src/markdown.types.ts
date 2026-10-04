// ## Text

/**
 * Markdown text as the parser wants it:  `\r\n` / `\r` line ends become `\n`, and a trailing newline is added if
 * missing (CommonMark treats the end of input as the end of a line).
 */
export function normalize(text: string) {
  const unix = text.replace(/\r\n?/g, "\n")
  return unix.endsWith("\n") ? unix : `${unix}\n`
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
