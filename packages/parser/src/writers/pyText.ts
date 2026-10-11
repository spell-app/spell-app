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
  if (text.length === 1) return `"""${text[0]}"""`
  return ['"""', ...text, '"""'].join(NEWLINE)
}

/** `text` as `#` comment lines. */
export function comment(text: string): string {
  return text
    .split(NEWLINE)
    .map((line) => (line ? `# ${line}` : "#"))
    .join(NEWLINE)
}
