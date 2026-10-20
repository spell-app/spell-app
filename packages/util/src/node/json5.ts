/**
 * Reading and writing JSON5 so its COMMENTS stay:  the one helper every JSON5 edit goes through.
 * - In util so every tool that writes JSON5 may import it, from the bottom of the stack:
 *   spaces' people and projects, the component sets' site data (whose writers are in ui), the app's, brand's and
 *   spell-epic's site data, and the assembler's `DataFile`.
 *   - Born in spaces (epic `people-and-orgs` P8, decisions Q4 and J41);  in the assembler from epic `epic-workflow`
 *     P20;  here since epic `repo-split` P1, so its users need util, not the assembler.
 * - `$/util/node/json5`, never the `$/util` barrel:  `src/node/` is util's node-only corner, which ui never imports.
 *
 * ```ts
 * json5Edited('{\n  // who\n  "name": "Owen"\n}', { name: "O" })
 * // => '{\n  // who\n  "name": "O"\n}'
 * ```
 *
 * - On json5-writer, Owen's pick:  it writes a WHOLE value at a time, and removes any key the value leaves out.
 *   So an edit reads the file, changes the object, and writes all of it back.
 *   - An array is matched item by item, by position:
 *     a comment inside an item stays with that POSITION when an item before it comes or goes.
 * - Spell writes the JSON-compatible part of JSON5:  keys and text in double quotes, no trailing commas;
 *   a person's comments, wherever they are, stay.
 * - Behind this one file, so the library can be swapped later.
 * - NODE ONLY:  json5-writer is on jscodeshift, which is node's.
 */
import { existsSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"

import JSON5 from "json5"

/**
 * json5-writer, which ships no types (decision J41):  loaded with node's `require()`, as the CommonJS it is,
 * and typed below, so no program that compiles this file needs an ambient declaration of it.
 * - loaded on first use, not as this file loads (epic `epic-eject` P7)
 *   - so a bundle that only READS JSON5 through this file's importers loads it fine
 *   - e.g. spell-epic's VS Code extension:  a CommonJS bundle with no `import.meta.url` and no `node_modules`
 */
function json5Writer(): Json5Writer {
  return (loadedWriter ??= createRequire(import.meta.url)("json5-writer") as Json5Writer)
}

/** json5-writer, once `json5Writer()` has loaded it. */
let loadedWriter: Json5Writer | undefined

/** How spell writes JSON5:  keys and text in double quotes, no trailing commas, as JSON would. */
const SPELL_STYLE = { quote: "double", quoteKeys: true, trailingComma: false } as const

/**
 * `source` (a JSON5 file's text) with its value replaced by `value`:
 * - every comment, and every key `value` keeps, where it was
 * - a key `value` leaves out, gone;  a new one added at the end
 * - An empty `source`:  `value` alone, two-space indented.
 * - A `null` anywhere in `value` is written as `null`:  json5-writer throws on one (it takes one for an object), so
 *   each goes in as a placeholder string, turned back in the text (`NULL`;  epic `epic-workflow` I22)
 */
export function json5Edited(source: string, value: object): string {
  if (!source.trim()) return `${JSON.stringify(value, null, 2)}\n`
  const writer = json5Writer().load(source)
  writer.write(withoutNulls(value))
  const text = writer.toSource(SPELL_STYLE).replaceAll(`"${NULL}"`, "null")
  return text.endsWith("\n") ? text : `${text}\n`
}

/** What json5-writer is given for a `null`, which it can't write (`withoutNulls()`), then replaced in the text. */
const NULL = "__json5-writer:null__"

/** `value` with every `null` in it, at any depth, the placeholder `NULL`:  a copy. */
function withoutNulls(value: unknown): unknown {
  if (value === null) return NULL
  if (Array.isArray(value)) return value.map(withoutNulls)
  if (typeof value !== "object") return value
  return Object.fromEntries(Object.entries(value).map(([key, each]) => [key, withoutNulls(each)]))
}

/**
 * JSON5 file `file`, read.
 * - Throws `SyntaxError` naming the file when it won't read as JSON5;  node's own error when it isn't there.
 */
export function readJSON5File<T = unknown>(file: string): T {
  const text = readFileSync(file, "utf8")
  try {
    return JSON5.parse(text) as T
  } catch (error) {
    throw new SyntaxError(`${file}:  ${error instanceof Error ? error.message : String(error)}`, { cause: error })
  }
}

/**
 * What a GENERATOR writes over a JSON5 file that held `before`, its own output being `text` (plain JSON):
 * - `text` itself, in the generator's own layout, while `before` is plain JSON too (or empty):
 *   nobody has written a comment into it.
 * - Once somebody has (`before` reads only as JSON5):  `before` edited to `text`'s value (`json5Edited()`),
 *   so their comments stay.
 * - Unchanged values leave `before` as it was, comments and all:  a generator's `--check` stays quiet.
 *
 * ```ts
 * keepingComments('{\n  // why\n  "a": 1\n}\n', '{\n  "a": 2\n}\n')
 * // => '{\n  // why\n  "a": 2\n}\n'
 * ```
 */
export function keepingComments(before: string, text: string): string {
  if (!before.trim() || isPlainJSON(before)) return text
  return json5Edited(before, JSON5.parse(text) as object)
}

/**
 * `keepingComments()` over file `file` as it is now (none yet:  `text`).
 * - A file that isn't `.json5`:  `text` as it is, so a generator may pass every file it writes through this.
 * - Throws `SyntaxError` naming the file when it holds JSON5 that won't read.
 */
export function keepingCommentsIn(file: string, text: string): string {
  if (!file.endsWith(".json5")) return text
  const before = existsSync(file) ? readFileSync(file, "utf8") : ""
  try {
    return keepingComments(before, text)
  } catch (error) {
    throw new SyntaxError(`${file}:  ${error instanceof Error ? error.message : String(error)}`, { cause: error })
  }
}

/** Whether `text` reads as plain JSON:  no comments, no JSON5-only syntax. */
function isPlainJSON(text: string): boolean {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}

/** What this file uses of json5-writer:  `load(source)`, a writer on JSON5 text. */
type Json5Writer = { load(source?: string): Json5WriterText }

/** json5-writer's writer on one JSON5 text. */
type Json5WriterText = {
  /** Replace the value, keeping comments:  a key `value` leaves out is removed;  `undefined` keeps a key as it is. */
  write(value: unknown): void
  /** The JSON5 text, as `options` say:  quotes, key quotes, trailing commas. */
  toSource(options?: { quote?: "single" | "double"; quoteKeys?: boolean; trailingComma?: boolean }): string
}
