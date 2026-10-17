//
//  ## Python's punctuation, for `PyWriter` (epic `python-target` P8).
//  - Python marks a block by its indent, 4 spaces (PEP 8), and a `:` on the line before it.
//  - An empty block holds `pass`.
//

/** One level of indent:  4 spaces, PEP 8's. */
export const INDENT = "    "

/** Between statements. */
export const NEWLINE = "\n"

/** Two blank lines around a top-level `def` or `class` (PEP 8). */
export const TOP_LEVEL_GAP = "\n\n\n"

/** `text`, each line indented one level;  blank lines left blank. */
export function indented(text: string): string {
  return text
    .split(NEWLINE)
    .map((line) => (line ? `${INDENT}${line}` : line))
    .join(NEWLINE)
}

/**
 * `header:` and `body` indented under it, e.g. `if x:` and its statements.
 * - An empty body:  `pass`, as Python needs a statement there.
 */
export function block(header: string, body: string): string {
  return `${header}:${NEWLINE}${indented(body.trim() ? body : "pass")}`
}

/**
 * `text` in double quotes, escaped as Python reads it:  `"say \"hi\""`.
 * - A backslash, a quote and a newline escaped;  everything else as is (Python 3 text is unicode).
 */
export function inQuotes(text: string): string {
  const escaped = text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\t/g, "\\t")
  return `"${escaped}"`
}

/** `text` as a Python docstring:  `"""text"""` on one line, else its lines between the quotes. */
export function docstring(lines: string[]): string {
  const text = lines.map((line) => line.replace(/\\/g, "\\\\").replace(/"""/g, '\\"\\"\\"'))
  // a `"` against the closing quotes would end them early:  escaped
  const one = text.length === 1 ? text[0]!.replace(/^"/, '\\"').replace(/"$/, '\\"') : undefined
  if (one !== undefined) return `"""${one}"""`
  return ['"""', ...text, '"""'].join(NEWLINE)
}

/** Longest call written on one line, as Black (Python's usual formatter) writes them:  88 characters. */
export const LINE = 88

/**
 * `head(items)` -- or `head{items}`, `head[items]` -- on one line when it fits in `LINE`, else as Black breaks it:
 * one item a line, indented, a comma after each.
 *
 * ```python
 * h(
 *     "div",
 *     {"class": "board"},
 * )
 * ```
 */
export function call(head: string, items: string[], [open, close] = ["(", ")"]): string {
  const inline = `${head}${open}${items.join(", ")}${close}`
  if (inline.length <= LINE && !inline.includes(NEWLINE)) return inline
  if (!items.length) return inline
  return `${head}${open}${NEWLINE}${indented(items.map((item) => `${item},`).join(NEWLINE))}${NEWLINE}${close}`
}

/** `text` as `#` comment lines. */
export function comment(text: string): string {
  return text
    .split(NEWLINE)
    .map((line) => (line ? `# ${line}` : "#"))
    .join(NEWLINE)
}
