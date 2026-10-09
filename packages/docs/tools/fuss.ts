/**
 * `spell dev docs fuss <paths...> | --branch [--json]`:  lists the writing misses a tool can find,
 * by file and line (WWOD §6, epic `skillz` P7).
 * The `/fussbudget` skill starts from its list;  every epic's Doc Review runs it last.
 *
 *     spell dev docs fuss packages/server/src
 *     packages/server/src/Router.ts:12  phrase-split  the route's handler, if any;  else the
 *     1 miss in 1 of 40 files:  1 phrase-split
 *
 * - What it flags, by kind:
 *   - `phrase-split`:  a line ending in the first 1-4 words of a new phrase,
 *     the phrase going on to the next line (a phrase starts after `:`, `;`, `.` or `--`);
 *     also a line whose next line is short, when the whole phrase fits there
 *   - `dense`:  a paragraph, or one bullet, of 3 or more sentences
 *   - `jargon`:  a word its package bans (`Fuss.JARGON`;  `packages/ui` bans "the fork")
 * - What it reads:
 *   - comments and docstrings in `.ts`, `.tsx`, `.js`, `.mjs`
 *   - Markdown prose
 *   - `.html` pages:  `dense` and `jargon` only, since the formatter wraps their lines
 * - What it skips:
 *   - code spans, code blocks and URLs
 *   - `@param`-style tags, license headers, lint directives, commented-out code
 *   - in folders:  `node_modules`, build output, dot folders, generated files
 *     (the root `.gitattributes`' `linguist-generated` ones)
 * - `<paths>`:  files and folders, from the current folder
 * - `--branch`:  the files this branch changed since `main`, committed or not
 * - `--json`:  `{ files, misses, counts }`, for the skill
 * - Exits 1 when it finds a miss, 0 when clean, 2 on a usage error.
 */
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs"
import { extname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * The checker:  finds the misses in a file's text, and the files to check.
 * - All `static`:  it keeps no state, so a test checks a plain string with `Fuss.check()`.
 */
export class Fuss {
  /**
   * The misses in `text`, the contents of `file`, in line order.
   * - `file`:  says how to read `text` (by its extension), and which words its package bans
   * - a file it doesn't read (`.css`, `.json` ...):  none
   */
  static check(file: string, text: string): FussMiss[] {
    const format = formatOf(file)
    if (!format) return []
    const units = format === "html" ? htmlUnits(text) : format === "md" ? markdownUnits(text) : codeUnits(text)
    const banned = Fuss.bannedIn(file)
    const wraps = format !== "html"
    return units.flatMap((unit) => unitMisses(unit, { file, banned, wraps })).sort((a, b) => a.line - b.line)
  }

  /**
   * The files to check under `paths`, each a file or a folder, from `cwd`.
   * - a file named here:  read whatever it is, if its format is one `check()` reads
   * - a folder:  walked, skipping dot folders, `SKIPPED_FOLDERS` and generated files
   * - throws `FussError` for a path that doesn't exist
   */
  static filesUnder(paths: string[], { cwd = process.cwd() } = {}): string[] {
    const named: string[] = []
    const walked: string[] = []
    const seen = new Set<string>()
    for (const path of paths) {
      const full = resolve(cwd, path)
      if (!existsSync(full)) throw new FussError(`no such file or folder:  ${path}`)
      if (statSync(full).isDirectory()) walk(full)
      else if (formatOf(full)) named.push(full)
    }
    const generated = generatedAmong(walked, cwd)
    return unique([...named, ...walked.filter((file) => !generated.has(file))])

    /** Add `folder`'s files to `walked`, once each, following links (the shared folders are links). */
    function walk(folder: string) {
      const real = realpathSync(folder)
      if (seen.has(real)) return
      seen.add(real)
      const entries = readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))
      for (const entry of entries) {
        if (entry.name.startsWith(".") || SKIPPED_FOLDERS.has(entry.name)) continue
        const full = join(folder, entry.name)
        const isFolder =
          entry.isDirectory() || (entry.isSymbolicLink() && statSync(full, { throwIfNoEntry: false })?.isDirectory())
        if (isFolder) walk(full)
        else if (formatOf(entry.name)) walked.push(full)
      }
    }
  }

  /**
   * The files this branch changed since `main`, as `--branch` checks them.
   * - committed (`git diff main...HEAD`) and not (`git status`:  staged, unstaged, untracked)
   * - only those still there, in a format `check()` reads, and not generated
   * - throws `FussError` outside a git checkout, or with no `main` branch
   */
  static branchFiles({ cwd = process.cwd() } = {}): string[] {
    const root = gitRoot(cwd)
    if (!root) throw new FussError("--branch:  not in a git checkout")
    const committed = git(root, ["diff", "--name-only", "-z", "main...HEAD"])
    if (committed === undefined) throw new FussError("--branch:  can't compare with `main` (`git diff main...HEAD`)")
    const changed = statusPaths(git(root, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]) ?? "")
    const files = unique([...committed.split("\0"), ...changed])
      .filter(Boolean)
      .map((path) => join(root, path))
      .filter((file) => formatOf(file) && statSync(file, { throwIfNoEntry: false })?.isFile())
    const generated = generatedAmong(files, root)
    return files.filter((file) => !generated.has(file))
  }

  /** The words `file`'s package bans (`JARGON`), by its path. */
  static bannedIn(file: string): string[] {
    const path = `/${resolve(file)}`
    return Object.entries(Fuss.JARGON).flatMap(([folder, words]) => (path.includes(`/${folder}/`) ? words : []))
  }

  /**
   * The words each package bans from its comments and docs, by folder from the repo's root.
   * - Implementation words a newcomer can't follow:  name the thing by what it is instead.
   *   In `packages/ui`, never "the fork":  say what the code is ("the element layer", `DOMElement`).
   * - Matched whole, in any case;  never inside a code span.
   * - `static`, so a reader finds the table on the class it configures.
   */
  static JARGON: Record<string, string[]> = {
    "packages/ui": ["the fork", "fork's"]
  }
}

/** Thrown for a usage error:  a missing path, `--branch` outside a checkout. */
export class FussError extends Error {}
FussError.prototype.name = "FussError"

////////////////
// ## The command
////////////////

/** Run `spell dev docs fuss` with `args`:  prints the misses, and returns the exit code. */
export function run(args: string[], { cwd = process.cwd() } = {}): number {
  const paths = args.filter((arg) => !arg.startsWith("--"))
  const flags = new Set(args.filter((arg) => arg.startsWith("--")))
  const unknown = [...flags].find((flag) => !FLAGS.includes(flag))
  if (unknown || flags.has("--branch") === paths.length > 0) return usage(unknown && `unknown flag ${unknown}`)
  let files: string[]
  try {
    files = flags.has("--branch") ? Fuss.branchFiles({ cwd }) : Fuss.filesUnder(paths, { cwd })
  } catch (error) {
    if (!(error instanceof FussError)) throw error
    return usage(error.message)
  }
  const misses = files.flatMap((file) =>
    Fuss.check(file, readFileSync(file, "utf8")).map((miss) => ({ ...miss, file: relative(cwd, file) }))
  )
  const counts = Object.fromEntries(FUSS_KINDS.map((kind) => [kind, misses.filter((it) => it.kind === kind).length]))
  if (flags.has("--json")) console.log(JSON.stringify({ files: files.length, misses, counts }, null, 2))
  else {
    for (const miss of misses) console.log(`${miss.file}:${miss.line}  ${miss.kind}  ${miss.text.trim()}`)
    console.log(summary(misses, files.length, counts))
  }
  return misses.length ? 1 : 0
}

/** The flags `run()` takes. */
const FLAGS = ["--branch", "--json"]

/** Say how to call it, after `problem` if any;  returns the usage error's exit code, 2. */
function usage(problem?: string): number {
  if (problem) console.error(problem)
  console.error("usage:  spell dev docs fuss <paths...> | --branch [--json]")
  return 2
}

/** The last line:  how many misses, in how many files, of each kind. */
function summary(misses: FussMiss[], fileCount: number, counts: Record<string, number>): string {
  if (!misses.length) return `no misses in ${fileCount} files`
  const missed = new Set(misses.map((miss) => miss.file)).size
  const kinds = Object.entries(counts)
    .filter(([, count]) => count)
    .map(([kind, count]) => `${count} ${kind}`)
  return `${plural(misses.length, "miss", "misses")} in ${missed} of ${fileCount} files:  ${kinds.join(", ")}`
}

/** `count` and the noun for it:  `1 miss`, `2 misses`. */
function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

////////////////
// ## Types
////////////////

/** Each kind of miss, in the order the summary counts them. */
export const FUSS_KINDS = ["phrase-split", "dense", "jargon"] as const

/** One kind of miss (see this file's header). */
export type FussKind = (typeof FUSS_KINDS)[number]

/** One miss, as `--json` lists it. */
export type FussMiss = {
  /** the file, from the current folder */
  file: string
  /** 1-based;  for `dense`, the paragraph's or bullet's first line */
  line: number
  kind: FussKind
  /** the line's text, its comment markers gone */
  text: string
  /** what's wrong, and the fix, in a few words */
  why: string
}

/** How `Fuss.check()` reads a file, by its extension. */
type Format = "code" | "md" | "html"

/** One line of prose:  a comment's line with its markers gone, or a page's text. */
type ProseLine = {
  /** 1-based */
  line: number
  text: string
  /** the 0-based column where `text` starts in its source line, for the fit of a moved phrase */
  column: number
}

/** A paragraph, or one bullet with its continuation lines:  what `dense` counts sentences in. */
type ProseUnit = {
  lines: ProseLine[]
  /** a heading (`## Group`):  checked for jargon only */
  isHeading?: true
}

////////////////
// ## Checks
////////////////

/** The longest line, as the formatter wraps code:  a phrase moved down must still fit. */
const MAX_WIDTH = 120

/** The misses in one unit:  jargon on any line, phrase splits between its lines (`wraps`), `dense` on the whole. */
function unitMisses(
  unit: ProseUnit,
  { file, banned, wraps }: { file: string; banned: string[]; wraps: boolean }
): FussMiss[] {
  const misses: FussMiss[] = []
  const masked = maskLines(unit.lines.map((it) => it.text))
  unit.lines.forEach(({ line, text }, index) => {
    const found = banned.filter((word) => wordPattern(word).test(masked[index]))
    if (found.length) misses.push({ file, line, kind: "jargon", text, why: `says ${found.map(quoted).join(", ")}` })
  })
  if (unit.isHeading) return misses
  if (wraps) {
    for (let index = 0; index < unit.lines.length - 1; index++) {
      const why = phraseSplit(unit.lines, masked, index)
      if (why)
        misses.push({ file, line: unit.lines[index].line, kind: "phrase-split", text: unit.lines[index].text, why })
    }
  }
  const sentences = sentenceCount(masked.join(" "))
  if (sentences >= 3) {
    const { line, text } = unit.lines[0]
    misses.push({ file, line, kind: "dense", text, why: `${sentences} sentences:  one or two, or bullets` })
  }
  return misses
}

/**
 * Why line `index` of `lines` splits a phrase, if it does.
 * - it ends in the first 1-4 words of a phrase begun on it:  start the phrase on the next line
 * - or the next line, the unit's last, is short (1-3 words) and the whole phrase fits there:  move it down
 * - `masked`:  the lines through `maskLine()`, the same length as the text
 */
function phraseSplit(lines: ProseLine[], masked: string[], index: number): string | undefined {
  const start = lastPhraseStart(masked[index])
  if (start === undefined) return
  const tail = masked[index].slice(start).trim()
  if (!tail) return
  const count = wordCount(tail)
  if (count <= 4) return `ends in ${plural(count, "word", "words")} of a new phrase:  start it on the next line`
  const next = lines[index + 1]
  if (index + 1 !== lines.length - 1 || wordCount(masked[index + 1]) > 3) return
  const moved = lines[index].text.slice(start).trim().length + 1 + next.text.trim().length
  if (next.column + moved <= MAX_WIDTH) return "the next line is short:  move the whole phrase down"
}

/** Where the last phrase on `masked` starts:  just past its last `:`, `;`, `.`, `?`, `!` or ` --`. */
function lastPhraseStart(masked: string): number | undefined {
  let start: number | undefined
  for (const match of masked.matchAll(PHRASE_END)) start = match.index + match[0].length
  return start
}

/** A phrase's end:  punctuation (and any closing quote or bracket), or ` --`, before a space or the line's end. */
const PHRASE_END = /(?:[:;.?!]["'”)\]]*|\s--)(?=\s|$)/g

/** How many sentences `masked` holds:  2+ are split by `.`, `?` or `!` and spaces, the next starting in capitals. */
function sentenceCount(masked: string): number {
  return masked.split(SENTENCE_END).filter((it) => /[a-z]/i.test(it)).length
}

/** A sentence's end, followed by the next's start (a capital, a digit, a quote or a bracket). */
const SENTENCE_END = /[.?!]["'”)\]]*\s+(?=[A-Z0-9"“'([*_])/

/** How many words `text` has, split at spaces. */
function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

/**
 * `text`, with what never splits a phrase covered up, at the same length:
 * - code spans and URLs:  `X`s, one word each
 * - abbreviations (`e.g.`, `etc.` ...) and ellipses:  their dots `_`
 * - a bullet's marker (`-`, `1.`):  spaces
 * - a number's dot (`§6. Comments`, a section's number):  `_`
 */
function maskLine(text: string): string {
  return text
    .replace(/’/g, "'")
    .replace(/`[^`]*`|`.*$/g, (code) => "X".repeat(code.length))
    .replace(/\b[a-z][\w+.-]*:\/\/\S+/gi, (url) => "X".repeat(url.length))
    .replace(/\b(?:e\.g|i\.e|etc|vs|cf)\./gi, (abbreviation) => abbreviation.replace(/\./g, "_"))
    .replace(/\.{2,}|…/g, (dots) => "_".repeat(dots.length))
    .replace(BULLET, (marker) => " ".repeat(marker.length))
    .replace(/(?<![\w.])\d+\.(?=\s)/g, (number) => number.replace(".", "_"))
}

/** `lines` through `maskLine()`, a code span left open at a line's end going on into the next line. */
function maskLines(lines: string[]): string[] {
  let isInCode = false
  return lines.map((text) => {
    const masked = isInCode ? maskLine(`\`${text}`).slice(1) : maskLine(text)
    if ((text.match(/`/g)?.length ?? 0) % 2) isInCode = !isInCode
    return masked
  })
}

/** A banned word as a pattern:  whole, any case. */
function wordPattern(word: string): RegExp {
  return new RegExp(`(?<![\\w-])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`, "i")
}

/** `word` in quotes, for a `why`. */
function quoted(word: string): string {
  return `"${word}"`
}

////////////////
// ## Reading code:  comments into units
////////////////

/** The prose units of `source`'s comments:  runs of `//` lines, and block comments (docstrings too). */
function codeUnits(source: string): ProseUnit[] {
  const lineStarts = [0, ...[...source.matchAll(/\n/g)].map((match) => match.index + 1)]
  const blocks: ProseLine[][] = []
  let lastRun: { line: number; column: number; lines: ProseLine[] } | undefined
  for (const comment of commentsIn(source)) {
    const line = lineAt(comment.start)
    const lineStart = lineStarts[line - 1]
    const column = comment.start - lineStart
    const isOwnLine = !source.slice(lineStart, comment.start).trim()
    if (comment.isBlock) {
      if (!LICENSE.test(comment.text)) blocks.push(blockLines(comment.text, line, column))
      lastRun = undefined
      continue
    }
    const text = comment.text.replace(/^\/\/+ ?/, "")
    const proseLine = { line, text, column: column + comment.text.length - text.length }
    if (isOwnLine && lastRun && lastRun.line === line - 1 && lastRun.column === column) {
      lastRun.lines.push(proseLine)
      lastRun.line = line
    } else {
      blocks.push([proseLine])
      lastRun = isOwnLine ? { line, column, lines: blocks.at(-1)! } : undefined
    }
  }
  return blocks.flatMap((lines) => proseUnits(lines, { isCode: true }))

  /** The 1-based line of `offset`. */
  function lineAt(offset: number): number {
    let low = 0
    let high = lineStarts.length - 1
    while (low < high) {
      const middle = Math.ceil((low + high) / 2)
      if (lineStarts[middle] <= offset) low = middle
      else high = middle - 1
    }
    return low + 1
  }
}

/** A comment with a license in it:  skipped whole. */
const LICENSE = /@license|copyright|SPDX-License-Identifier/i

/** A block comment's lines from line `line`, column `column`:  its opening and closing marks gone, and each line's leading `*`. */
function blockLines(text: string, line: number, column: number): ProseLine[] {
  return text.split("\n").map((raw, index) => {
    let start = 0
    if (index === 0) start = raw.match(/^\/\*+!? ?/)![0].length
    else if (/^\s*\*(?!\/)/.test(raw)) start = raw.match(/^\s*\* ?/)![0].length
    else start = Math.min(column, raw.search(/\S|$/))
    const text = raw.slice(start).replace(/\s*\*+\/$/, "")
    return { line: line + index, text, column: (index === 0 ? column : 0) + start }
  })
}

/**
 * The comments in JS / TS `source`, in order, each with its offset and text (markers included).
 * - Skips strings, template literals (their `${}` code read too) and regex literals, so a `//` in them isn't a comment.
 * - A light lexer, not a parser:  JSX text with a `//` in it reads as a comment.
 */
function commentsIn(source: string): { start: number; text: string; isBlock: boolean }[] {
  const comments: { start: number; text: string; isBlock: boolean }[] = []
  readCode(0, false)
  return comments

  /** Read code from `from`;  in a `${}` (`isInterpolation`), stop past its closing `}`.  Returns where it stopped. */
  function readCode(from: number, isInterpolation: boolean): number {
    let depth = 0
    let previous = ""
    let index = from
    while (index < source.length) {
      const char = source[index]
      const next = source[index + 1]
      if (char === "/" && (next === "/" || next === "*")) {
        const isBlock = next === "*"
        const found = isBlock ? source.indexOf("*/", index + 2) : source.indexOf("\n", index)
        const end = found < 0 ? source.length : isBlock ? found + 2 : found
        comments.push({ start: index, text: source.slice(index, end), isBlock })
        index = end
        continue
      }
      if (char === '"' || char === "'") index = skipString(index)
      else if (char === "`") index = skipTemplate(index + 1)
      else if (char === "/" && startsRegex(previous)) index = skipRegex(index)
      else if (isInterpolation && char === "}" && depth === 0) return index + 1
      else {
        const word = /^[\w$]+/.exec(source.slice(index, index + 64))?.[0]
        if (char === "{") depth++
        else if (char === "}") depth--
        if (word) previous = word
        else if (!/\s/.test(char)) previous = char
        index += word?.length ?? 1
        continue
      }
      previous = "value"
    }
    return index
  }

  /** Past the string starting at `start`;  an unclosed one ends at its line's end. */
  function skipString(start: number): number {
    const quote = source[start]
    for (let index = start + 1; index < source.length; index++) {
      if (source[index] === "\\") index++
      else if (source[index] === quote) return index + 1
      else if (source[index] === "\n") return index
    }
    return source.length
  }

  /** Past the template literal whose text starts at `from`, reading the code in its `${}`s. */
  function skipTemplate(from: number): number {
    let index = from
    while (index < source.length) {
      if (source[index] === "\\") index += 2
      else if (source[index] === "`") return index + 1
      else if (source.startsWith("${", index)) index = readCode(index + 2, true)
      else index++
    }
    return index
  }

  /** Past the regex literal at `start`, and its flags;  none closing on its line:  just past the `/`, a division. */
  function skipRegex(start: number): number {
    let inClass = false
    for (let index = start + 1; index < source.length; index++) {
      const char = source[index]
      if (char === "\\") index++
      else if (char === "\n") return start + 1
      else if (char === "[") inClass = true
      else if (char === "]") inClass = false
      else if (char === "/" && !inClass) return index + 1 + (/^[a-z]*/.exec(source.slice(index + 1))?.[0].length ?? 0)
    }
    return start + 1
  }
}

/** Whether a `/` after `previous` (the last word or symbol of code) starts a regex, not a division. */
function startsRegex(previous: string): boolean {
  return !previous || /^[(,=:[!&|?{};+\-*%<>~^]$/.test(previous) || REGEX_KEYWORDS.has(previous)
}

/** Keywords a regex literal can follow. */
const REGEX_KEYWORDS = new Set([
  "return",
  "typeof",
  "case",
  "do",
  "else",
  "in",
  "of",
  "new",
  "delete",
  "void",
  "throw",
  "yield",
  "await"
])

////////////////
// ## Reading Markdown and HTML
////////////////

/** The prose units of Markdown `source`:  front matter, HTML comments and `>` markers gone. */
function markdownUnits(source: string): ProseUnit[] {
  const lines: ProseLine[] = []
  let skipping = /^---\s*$/.test(source.split("\n")[0]) ? "front matter" : ""
  source.split("\n").forEach((raw, index) => {
    if (skipping === "front matter") {
      if (index > 0 && /^---\s*$/.test(raw)) skipping = ""
      lines.push({ line: index + 1, text: "", column: 0 })
      return
    }
    if (skipping || /^\s*<!--/.test(raw)) {
      skipping = raw.includes("-->") ? "" : "comment"
      lines.push({ line: index + 1, text: "", column: 0 })
      return
    }
    const text = raw.replace(/^\s*>\s?/, "")
    lines.push({ line: index + 1, text, column: raw.length - text.length })
  })
  return proseUnits(lines, { isCode: false })
}

/**
 * The prose units of HTML `source`:  the text of each block element (`<p>`, `<li>`, any custom element ...).
 * - Scripts, styles, `<pre>`, `<head>` and comments are skipped.
 * - So is quoted text:  `<blockquote>`, and a plan doc's `<epic-original>` / `<epic-answer>`.
 *   Those are Owen's own words, kept as he wrote them.
 * - `<code>` becomes a Markdown code span, one word to the checks.
 */
function htmlUnits(source: string): ProseUnit[] {
  const text = source
    .replace(
      /<!--[\s\S]*?-->|<(script|style|pre|textarea|svg|head|blockquote|epic-original|epic-answer)\b[\s\S]*?<\/\1>/gi,
      blank
    )
    .replace(/<code\b[\s\S]*?<\/code>/gi, codeSpan)
  const units: ProseUnit[] = []
  let current: ProseLine[] = []
  let line = 1
  let at = 0
  for (const tag of text.matchAll(/<\/?([a-z][\w-]*)[^>]*>/gi)) {
    addText(text.slice(at, tag.index))
    line += countLines(tag[0])
    at = tag.index + tag[0].length
    if (!INLINE_TAGS.has(tag[1].toLowerCase())) flush()
  }
  addText(text.slice(at))
  flush()
  return units

  /** Add `chunk`, the text between two tags, to the unit being read, one `ProseLine` per source line. */
  function addText(chunk: string) {
    chunk.split("\n").forEach((part, index) => {
      if (index > 0) line++
      const words = decodeEntities(part).trim()
      if (!words) return
      const last = current.at(-1)
      if (last?.line === line) last.text += ` ${words}`
      else current.push({ line, text: words, column: 0 })
    })
  }

  /** End the unit being read. */
  function flush() {
    if (current.length) units.push({ lines: current })
    current = []
  }
}

/** Tags inside a sentence:  they don't end a unit. */
const INLINE_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "code",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "s",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "u",
  "var"
])

/** A `<code>` element as a code span on one line, its newlines after it:  so the lines after keep their numbers. */
function codeSpan(code: string): string {
  const inner = code
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .replace(/`/g, "'")
  return `\`${inner}\`${"\n".repeat(countLines(code))}`
}

/** `match`, as spaces, its newlines kept:  so the lines after it keep their numbers. */
function blank(match: string): string {
  return match.replace(/[^\n]/g, " ")
}

/** How many newlines `text` has. */
function countLines(text: string): number {
  return text.split("\n").length - 1
}

/** `text` with the entities a page's prose uses decoded. */
function decodeEntities(text: string): string {
  return text.replace(/&(\w+|#\d+);/g, (entity, name: string) =>
    name.startsWith("#") ? String.fromCodePoint(Number(name.slice(1))) : (ENTITIES[name] ?? entity)
  )
}

/** The named entities `decodeEntities()` knows. */
const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  mdash: "--",
  ndash: "-",
  hellip: "..."
}

////////////////
// ## Units:  paragraphs and bullets
////////////////

/**
 * `lines` split into paragraphs and bullets, what isn't prose left out:
 * - code fences and the lines in them;  an indented block after a blank line (a code example)
 * - `@param`-style tags and their lines;  lint directives;  banner lines (`////`, `****`)
 * - Markdown tables, HTML lines and link definitions;  in code (`isCode`), lines that look like code
 * - A heading (`## Name`) is a unit of its own.
 * - A line that isn't a bullet goes on the unit before it, whatever its indent, as Markdown reads it.
 */
function proseUnits(lines: ProseLine[], { isCode }: { isCode: boolean }): ProseUnit[] {
  const units: ProseUnit[] = []
  let current: ProseLine[] | undefined
  let skipping: "fence" | "code" | "tag" | undefined
  let isAfterBlank = true
  for (const proseLine of lines) {
    const { text } = proseLine
    if (FENCE.test(text)) {
      flush()
      skipping = skipping === "fence" ? undefined : "fence"
      continue
    }
    if (skipping === "fence") continue
    if (!/[\w`]/.test(text) || DIRECTIVE.test(text)) {
      flush()
      if (skipping !== "tag" || !text.trim()) skipping = undefined
      isAfterBlank = !text.trim() || isAfterBlank
      continue
    }
    const startsCode = isAfterBlank && /^\s{4}/.test(text) && !BULLET.test(text)
    isAfterBlank = false
    if (skipping === "code" || startsCode) {
      skipping = "code"
      continue
    }
    if (/^\s*@\w/.test(text)) {
      flush()
      skipping = "tag"
      continue
    }
    if (skipping === "tag" && !BULLET.test(text)) continue
    skipping = undefined
    if (/^\s*#{1,6}\s/.test(text)) {
      flush()
      units.push({ lines: [proseLine], isHeading: true })
      continue
    }
    if (isCode ? CODE_LINE.test(text) : MARKDOWN_SKIPPED.test(text)) {
      flush()
      continue
    }
    if (BULLET.test(text) || !current) {
      flush()
      current = [proseLine]
    } else current.push(proseLine)
  }
  flush()
  return units

  /** End the unit being read. */
  function flush() {
    if (current) units.push({ lines: current })
    current = undefined
  }
}

/** A bullet's marker:  `-`, `*`, `+`, or a number (`1.`, `1)`), then a space. */
const BULLET = /^\s*(?:[-*+]|\d+[.)])(?=\s)/

/** A code fence. */
const FENCE = /^\s*(?:```|~~~)/

/** A tool's directive in a comment:  lint, format, TypeScript, coverage, `#region`, a `///` reference. */
const DIRECTIVE =
  /^\s*(?:eslint|oxlint|oxfmt|prettier|biome|tslint|@ts-|istanbul|c8 |v8 |global |#region|#endregion|#__|\/ ?<reference)/

/** A comment line that looks like code, not prose:  commented-out code, a signature. */
const CODE_LINE =
  /^\s*(?:(?:import|export|const|let|var|return|await|function|class|if \(|for \(|while \()\s|[}\])](?:\s|$)|\w[\w.$]*\(.*\);?$)|[{;]\s*$/

/** Markdown lines that aren't prose:  table rows, HTML, link definitions. */
const MARKDOWN_SKIPPED = /^\s*(?:\||<|\[[^\]]+\]:\s)/

////////////////
// ## Files
////////////////

/** Folders a walk skips besides dot folders:  dependencies and build output. */
const SKIPPED_FOLDERS = new Set(["node_modules", "dist", "build", "coverage"])

/** How `Fuss.check()` reads `file`, by its extension;  `undefined` when it doesn't. */
function formatOf(file: string): Format | undefined {
  const extension = extname(file)
  if (CODE_EXTENSIONS.has(extension)) return "code"
  if (extension === ".md") return "md"
  if (extension === ".html") return "html"
}

/** The extensions `Fuss.check()` reads the comments of. */
const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".cjs", ".jsx", ".mts", ".cts"])

/**
 * Which of `files` are generated, by the git checkout around `cwd`:  `linguist-generated` in its `.gitattributes`.
 * - outside a checkout, or a file outside it:  not generated
 */
function generatedAmong(files: string[], cwd: string): Set<string> {
  const root = files.length ? gitRoot(cwd) : undefined
  if (!root) return new Set()
  const inside = files.filter((file) => !relative(root, file).startsWith(".."))
  const answer = git(
    root,
    ["check-attr", "-z", "--stdin", "linguist-generated"],
    inside.map((file) => relative(root, file)).join("\0")
  )
  const fields = answer?.split("\0") ?? []
  const generated = new Set<string>()
  for (let index = 0; index + 2 < fields.length; index += 3) {
    if (fields[index + 2] !== "unspecified" && fields[index + 2] !== "unset") generated.add(join(root, fields[index]))
  }
  return generated
}

/** The root of the git checkout around `cwd`;  `undefined` outside one. */
function gitRoot(cwd: string): string | undefined {
  return git(cwd, ["rev-parse", "--show-toplevel"])?.trim()
}

/** `git <args>`'s output in `cwd`, `input` on its stdin;  `undefined` when it fails. */
function git(cwd: string, args: string[], input?: string): string | undefined {
  const result = spawnSync("git", args, { cwd, input, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
  return result.status === 0 ? result.stdout : undefined
}

/** The paths in `git status --porcelain=v1 -z` output:  each entry's, a rename's new name (its old one follows). */
function statusPaths(output: string): string[] {
  const entries = output.split("\0")
  const paths: string[] = []
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index]
    if (entry.length < 4) continue
    paths.push(entry.slice(3))
    if (/^[RC]/.test(entry)) index++
  }
  return paths
}

/** `list` without repeats, in order. */
function unique(list: string[]): string[] {
  return [...new Set(list)]
}

// run as a script (`spell dev docs fuss`), not when a test imports it;  last, so every `const` above is set
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = run(process.argv.slice(2))
}
