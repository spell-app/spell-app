import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs"
import { relative, resolve, sep } from "node:path"

import JSON5 from "json5"

// By file name and relative path, `.ts` and all:  plain `node` loads this file (the docs tools' `details.js` ...),
// and resolves nothing else.  The assembler's JSON5 editor (`$/assembler/json5`), the one every JSON5 edit goes
// through (epic `people-and-orgs` P8;  the assembler's since `epic-workflow` P20)
import { json5Edited } from "../../../assembler/src/json5.ts"

/****************
 * ### `DataFile`
 * A DATA FILE the epic tooling keeps in the shared folders, as JSON5 (epic `epic-workflow` P21):
 * a review inbox, a details page's answer and draft, a choice page's rows, an epic's running agents,
 * the docs home's tooling home and favourites, the sagas' list, the commands page's data.
 *
 * ```ts
 * DataFile.besidePage("epics/seo/details/names.html", "answer") // => "epics/seo/details/names.answer.json5"
 * DataFile.read<Answer>(file)                                    // the .json5, else the old .json;  undefined
 * DataFile.write(file, answer)                                   // a hand-added comment in it stays
 * ```
 *
 * - Named `<name>.json5`.  Its old name, `<name>.json` (`oldName()`), is still READ while there's no `.json5`:
 *   a checkout on older code wrote it, and `epic migrate` renames the ones already there.
 * - WRITTEN only as `.json5`, keeping every comment Owen added by hand (the assembler's `json5Edited()`, on
 *   json5-writer), and the old `.json` beside it removed:  one file, one name.
 *   - json5-writer throws on a `null` (it takes one for an object):  each goes in as a placeholder string, turned
 *     back into `null` in the text (`NULL`)
 * - Laid out as `JSON.stringify(value, null, 2)` would, comments where they were (`layout()`), so json5-writer's own
 *   layout (an object hugging its array's bracket, a blank line before each new key) never piles up save after save.
 *   A file with no comments is written exactly as `JSON.stringify()` wrote it before.
 * - The JSON-compatible part of JSON5:  keys and text in double quotes, no trailing commas.
 *   So a plain JSON reader still parses one that has no comments.
 * - Writes are atomic (a temp file renamed over it), and take no lock:  a caller that shares the file holds its own
 *   (`SRV.FileLock`, on the `.json5` name), as `ReviewInbox.update()` does.
 * - Node only (`node:fs`):  NOT in the `$/epics` barrel, imported by path.
 * - Its position:  imports only node's own modules, `json5`, and the assembler's JSON5 editor by its relative path, so
 *   plain `node` loads it;  NEVER an alias, an `enum` or a parameter property.
 ****************/
export class DataFile {
  /** what a data file's name ends in */
  static readonly SUFFIX = ".json5"

  /** what it ended in before (epic `epic-workflow` P21):  still read while there's no `.json5` */
  static readonly OLD_SUFFIX = ".json"

  /** Page `<slug>.html`'s data file of kind `kind`, beside it:  `<slug>.<kind>.json5` (`answer`, `draft`, `rows`). */
  static besidePage(page: string, kind: string): string {
    return page.replace(/\.html$/, `.${kind}${DataFile.SUFFIX}`)
  }

  /** Data file `file`'s old name:  `<name>.json5` => `<name>.json`. */
  static oldName(file: string): string {
    return file.replace(/\.json5$/, DataFile.OLD_SUFFIX)
  }

  /** The file holding `file`'s data:  `file` if it's there, else its old name if that is;  else `undefined`. */
  static found(file: string): string | undefined {
    if (existsSync(file)) return file
    const old = DataFile.oldName(file)
    return old !== file && existsSync(old) ? old : undefined
  }

  /** Whether `file`, or its old name, is there. */
  static exists(file: string): boolean {
    return DataFile.found(file) !== undefined
  }

  /** The text of `file`, or of its old name;  `undefined` when neither is there. */
  static text(file: string): string | undefined {
    const found = DataFile.found(file)
    return found === undefined ? undefined : readFileSync(found, "utf8")
  }

  /**
   * The data in `file`, or in its old name;  `undefined` when neither is there.
   * - throws `SyntaxError` on a file that won't read as JSON5
   */
  static read<T>(file: string): T | undefined {
    const text = DataFile.text(file)
    return text === undefined ? undefined : (JSON5.parse(text) as T)
  }

  /** `text` (a data file's) as data:  JSON5, so comments and trailing commas read.  Throws `SyntaxError`. */
  static parse<T>(text: string): T {
    return JSON5.parse(text) as T
  }

  /**
   * The text to write for `value` over a file whose text was `source`:  every comment in `source` kept, laid out as
   * `JSON.stringify(value, null, 2)` (`layout()`), ending in a newline.
   * - `source` with no comment (or empty):  exactly `JSON.stringify(value, null, 2)`
   * - `value` as `JSON.stringify()` sees it:  a key holding `undefined` goes (json5-writer would keep the old one),
   *   a class instance is its own fields, `toJSON()` is called
   */
  static textFor(source: string, value: unknown): string {
    const json = JSON.stringify(value, null, 2)
    if (!hasComment(source)) return `${json}\n`
    const edited = json5Edited(source, withoutNulls(JSON.parse(json)) as object).replaceAll(`"${NULL}"`, "null")
    return `${layout(edited, source)}\n`
  }

  /**
   * Write `value` into `file` (a `.json5` name), keeping its comments (`textFor()`), and remove its old `.json`;
   * returns the text written.
   * - the comments come from the file there:  the `.json5`, else the old `.json`
   * - atomic:  a temp file beside it (`<file>.<pid>.tmp`), renamed over it
   * - SIDE EFFECT:  writes `file`, removes its old name
   */
  static write(file: string, value: unknown): string {
    const text = DataFile.textFor(DataFile.text(file) ?? "", value)
    const temp = `${file}.${process.pid}.tmp`
    writeFileSync(temp, text)
    renameSync(temp, file)
    DataFile.removeOld(file)
    return text
  }

  /**
   * Read `file`'s data, `change` it, and write it back whole (`write()`);  returns the new data.
   * - `change` gets the data read (`undefined` for no file), and returns the new data
   * - takes no lock:  hold the file's own lock around it when others write it too
   */
  static edit<T>(file: string, change: (value: T | undefined) => T): T {
    const value = change(DataFile.read<T>(file))
    DataFile.write(file, value)
    return value
  }

  /**
   * For a save that hands over the file's current text (`SRV.FileOperations.save(file, (current) => ...)`, which
   * holds the lock):  the text to write, `change` given the data in `current`, else in the old `.json`.
   * - call `removeOld()` once it's saved
   * - throws `SyntaxError` on data that won't read
   */
  static edited<T>(file: string, current: string, change: (value: T | undefined) => unknown): string {
    const source = current || DataFile.text(file) || ""
    const value = change(source.trim() ? DataFile.parse<T>(source) : undefined)
    return DataFile.textFor(source, value)
  }

  /** Remove `file` and its old name.  SIDE EFFECT. */
  static remove(file: string): void {
    rmSync(file, { force: true })
    DataFile.removeOld(file)
  }

  /** Remove `file`'s old name, once `file` holds its data.  SIDE EFFECT. */
  static removeOld(file: string): void {
    const old = DataFile.oldName(file)
    if (old !== file) rmSync(old, { force: true })
  }

  ////////////////
  // ## Renaming the old files (`epic migrate`)
  ////////////////

  /**
   * The rename that gives old data file `old` (`<name>.json`) its new name, `<name>.json5`.
   * - `clash`:  the new name is there too (a checkout on older code wrote the old one since):  the rename is left,
   *   for a person to merge
   */
  static moveOf(old: string): DataFileMove {
    const to = old.replace(/\.json$/, DataFile.SUFFIX)
    return { from: old, to, clash: existsSync(to) }
  }

  /**
   * Rename `move.from` to `move.to`;  did it?  Not for a clash, nor once `from` is gone (a writer converted it since).
   * - SIDE EFFECT:  renames the file
   */
  static rename(move: DataFileMove): boolean {
    if (move.clash || existsSync(move.to) || !existsSync(move.from)) return false
    renameSync(move.from, move.to)
    return true
  }

  /**
   * A page's link `href` to a data file by its old name, given its new one:  `../../home.json` => `../../home.json5`;
   * `undefined` for any other link.
   * - `folder`:  the folder the link is relative to (an epic page's, for its assembled parts too);  `root`:  the
   *   checkout's root
   * - a data file is one of the tooling's by where it is (`OLD_DATA_PATH`), there or not:  `epic migrate` renames them
   *   all, and a link to one that's gone stays as broken as it was
   */
  static linkFor(href: string, folder: string, root: string): string | undefined {
    if (/^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(href)) return undefined
    const end = href.search(/[?#]/)
    const path = end === -1 ? href : href.slice(0, end)
    if (!path.endsWith(DataFile.OLD_SUFFIX)) return undefined
    let file: string
    try {
      file = resolve(folder, decodeURI(path))
    } catch {
      return undefined
    }
    const from = relative(root, file).split(sep).join("/")
    if (from.startsWith("../") || !OLD_DATA_PATH.test(from)) return undefined
    return `${path}5${end === -1 ? "" : href.slice(end)}`
  }
}

/**
 * Where the tooling's data files are, by their old names, from the checkout's root:  a page's inbox anywhere, an
 * epic's running agents, a details page's answer, draft or rows, the docs home's lists, the sagas' list, the commands
 * pages' data and the choice page template's rows.
 */
const OLD_DATA_PATH =
  /(\.inbox\.json$)|(^epics\/[^/]+\/agents\.json$)|((^|\/)details\/[^/]+\.(answer|draft|rows)\.json$)|(^epics\/(home|favorites)\.json$)|(^sagas\/sagas\.json$)|(^(guides|templates)\/(.+\/)?commands\.json$)|(^templates\/syntax-choices\.rows\.json$)/

/** Renaming an old data file (`DataFile.moveOf()`):  from its old name to its new one;  `clash` when both are there. */
export type DataFileMove = { from: string; to: string; clash: boolean }

////////////////
// ## Layout
////////////////

/** What json5-writer is given for a `null`, which it can't write (`withoutNulls()`), then replaced in the text. */
const NULL = "__json5-writer:null__"

/** `value` (JSON's) with every `null` in it, at any depth, the placeholder `NULL`:  a copy. */
function withoutNulls(value: unknown): unknown {
  if (value === null) return NULL
  if (Array.isArray(value)) return value.map(withoutNulls)
  if (typeof value !== "object") return value
  return Object.fromEntries(Object.entries(value).map(([key, each]) => [key, withoutNulls(each)]))
}

/** One piece of a JSON5 text:  a bracket or punctuation, a value (string, number, word), or a comment. */
type Token = { kind: "open" | "close" | "comma" | "colon" | "value" | "comment"; text: string; newlineBefore: boolean }

/** Whether JSON5 text `text` holds a comment (outside its strings). */
function hasComment(text: string): boolean {
  return tokensOf(text).some((token) => token.kind === "comment")
}

/**
 * JSON5 text `text` laid out as `JSON.stringify(value, null, 2)` lays out its value, comments kept:
 * - a comment on a line of its own stays on a line of its own, before what followed it;
 *   one after something on the same line stays at that line's end
 *   - as it was in `source`, the text before the save:  json5-writer moves an array's first comment up onto its
 *     bracket's line
 * - an empty object or array stays `{}` / `[]`;  blank lines go
 */
function layout(text: string, source: string): string {
  // each comment's place in `source`, by its text, in order:  on a line of its own or not
  const ownLines = new Map<string, boolean[]>()
  for (const token of tokensOf(source).filter((each) => each.kind === "comment"))
    ownLines.set(token.text, [...(ownLines.get(token.text) ?? []), token.newlineBefore])
  const lines: string[] = []
  let line = ""
  let depth = 0
  let fresh = true // nothing written on `line` yet
  const newline = () => {
    if (!fresh) lines.push(line)
    line = "  ".repeat(depth)
    fresh = true
  }
  const put = (piece: string) => {
    line += piece
    fresh = false
  }
  const tokens = tokensOf(text)
  tokens.forEach((token, at) => {
    const next = tokens[at + 1]
    if (token.kind === "comment") {
      if ((ownLines.get(token.text)?.shift() ?? token.newlineBefore) || at === 0) {
        newline()
        put(token.text)
      } else if (fresh && lines.length) {
        // after a comma or an opening bracket, which ended the line:  back on that line, at its end
        line = `${lines.pop()} ${token.text}`
        fresh = false
      } else put(` ${token.text}`)
      newline()
      return
    }
    if (fresh && line.trim() === "" && token.kind !== "close") line = "  ".repeat(depth)
    if (token.kind === "open") {
      put(token.text)
      if (next?.kind === "close") return
      depth++
      newline()
    } else if (token.kind === "close") {
      const previous = tokens[at - 1]
      if (previous?.kind !== "open") {
        depth--
        if (!fresh) newline()
        line = "  ".repeat(depth)
      }
      put(token.text)
    } else if (token.kind === "comma") {
      put(",")
      newline()
    } else if (token.kind === "colon") put(": ")
    else put(token.text)
  })
  if (!fresh) lines.push(line)
  return lines.join("\n")
}

/** JSON5 text `text`, in tokens:  strings (either quote) and comments whole, each saying if a newline came before. */
function tokensOf(text: string): Token[] {
  const tokens: Token[] = []
  let newlineBefore = false
  let at = 0
  const add = (kind: Token["kind"], end: number) => {
    tokens.push({ kind, text: text.slice(at, end), newlineBefore })
    newlineBefore = false
    at = end
  }
  while (at < text.length) {
    const char = text[at]
    if (char === "\n") {
      newlineBefore = true
      at++
    } else if (/\s/.test(char)) at++
    else if (text.startsWith("//", at)) add("comment", endOf(text.indexOf("\n", at), text))
    else if (text.startsWith("/*", at)) add("comment", endOf(text.indexOf("*/", at + 2), text, 2))
    else if (char === '"' || char === "'") add("value", stringEnd(text, at))
    else if (char === "{" || char === "[") add("open", at + 1)
    else if (char === "}" || char === "]") add("close", at + 1)
    else if (char === ",") add("comma", at + 1)
    else if (char === ":") add("colon", at + 1)
    else add("value", wordEnd(text, at))
  }
  return tokens
}

/** Where a comment ends:  `found` plus `extra` (the closing `*\/`), or the text's end when it was never closed. */
function endOf(found: number, text: string, extra = 0): number {
  return found === -1 ? text.length : found + extra
}

/** Where the string starting at `start` ends, its closing quote included. */
function stringEnd(text: string, start: number): number {
  const quote = text[start]
  let at = start + 1
  while (at < text.length && text[at] !== quote) at += text[at] === "\\" ? 2 : 1
  return Math.min(at + 1, text.length)
}

/** Where the bare value (a number, `true`, an unquoted key) starting at `start` ends. */
function wordEnd(text: string, start: number): number {
  let at = start
  while (at < text.length && !/[\s,:{}[\]"'/]/.test(text[at])) at++
  return Math.max(at, start + 1)
}
