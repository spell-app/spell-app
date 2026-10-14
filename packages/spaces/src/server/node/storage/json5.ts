/**
 * Reading and writing JSON5 so its COMMENTS stay:  the one helper every JSON5 edit goes through (epic
 * `people-and-orgs` P8, decisions Q4 and J41).
 *
 * ```ts
 * json5Edited('{\n  // who\n  "name": "Owen"\n}', { name: "O" })
 * // => '{\n  // who\n  "name": "O"\n}'
 * ```
 *
 * - On json5-writer, Owen's pick:  it writes a WHOLE value at a time and removes any key the value leaves out, so an
 *   edit reads the file, changes the object, and writes all of it back (`editJSON5()`).
 * - Spell writes the JSON-compatible part of JSON5:  keys and text in double quotes, no trailing commas;
 *   a person's comments, wherever they are, stay.
 * - Behind this one file, so the library can be swapped later.
 * - NODE ONLY:  json5-writer is on jscodeshift, which is node's.
 */
import JSON5 from "json5"
import json5Writer from "json5-writer"

import type { SpaceStorage } from "$/spaces/models/SpaceStorage"

/** How spell writes JSON5:  keys and text in double quotes, no trailing commas, as JSON would. */
const SPELL_STYLE = { quote: "double", quoteKeys: true, trailingComma: false } as const

/**
 * `source` (a JSON5 file's text) with its value replaced by `value`:  every comment, and every key `value` keeps,
 * where it was;  a key `value` leaves out, gone;  a new one added at the end.
 * - An empty `source`:  `value` alone, two-space indented.
 */
export function json5Edited(source: string, value: object): string {
  if (!source.trim()) return `${JSON.stringify(value, null, 2)}\n`
  const writer = json5Writer.load(source)
  writer.write(value)
  const text = writer.toSource(SPELL_STYLE)
  return text.endsWith("\n") ? text : `${text}\n`
}

/** File `path`'s JSON5, read;  `undefined` if there's none.  Throws `SyntaxError` on JSON5 that won't read. */
export async function readJSON5<T = unknown>(storage: SpaceStorage, path: string): Promise<T | undefined> {
  const text = await storage.read(path)
  return text === undefined ? undefined : (JSON5.parse(text) as T)
}

/**
 * Write `value` into JSON5 file `path`, keeping the comments already there (`json5Edited()`);  a new file if there's
 * none.  Returns the text written.
 */
export async function writeJSON5(storage: SpaceStorage, path: string, value: object): Promise<string> {
  const text = json5Edited((await storage.read(path)) ?? "", value)
  await storage.write(path, text)
  return text
}

/**
 * Read JSON5 file `path`, `change` its value, and write it back WHOLE, its comments kept;  returns the new value.
 * - `change` gets the value read (`undefined` for no file), and returns the new one.
 */
export async function editJSON5<T extends object>(
  storage: SpaceStorage,
  path: string,
  change: (value: T | undefined) => T
): Promise<T> {
  const value = change(await readJSON5<T>(storage, path))
  await writeJSON5(storage, path, value)
  return value
}
