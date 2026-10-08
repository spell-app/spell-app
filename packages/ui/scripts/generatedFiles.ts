/**
 * What the generators share:  write only the files whose text changed (or, under `--check`, fail on them), format
 * what they wrote as `yarn format` would, splice a generated block into a hand-kept page, and escape the text they
 * write into markup.
 * - Used by `site:data`, `site:index`, `site:kitchen`, `site:sections`, `site:new`, `gen:root`, `gen:styles`,
 *   `tokens:alias`.
 * - Node only:  imported by `scripts/`, never by `src/`.
 */
import { execFileSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { Terminal } from "../tools/Terminal.ts"

////////////////
// ## Files
////////////////

/**
 * Format `files` as `yarn format` does (`vp fmt`, with the repo's `vite.lint.ts` settings), so it changes nothing in
 * them afterwards.
 * - NOT the bare `oxfmt` binary:  it doesn't read `vite.lint.ts`, so it writes oxfmt's defaults (semicolons,
 *   trailing commas).
 * - SIDE EFFECT:  rewrites `files`
 */
export function formatFiles(files: string[]): void {
  execFileSync("yarn", ["vp", "fmt", ...files], { cwd: PACKAGE_ROOT, stdio: "ignore" })
}

/**
 * Write each of `outputs` whose file is missing or holds other text;  returns those files, relative to the cwd.
 * - `isCheck`:  write nothing;  print each stale file to stderr, naming `yarn <command>`, and set exit code 1 if any
 *   (0 if none)
 * - SIDE EFFECT:  writes files (making their folders), or sets `process.exitCode`
 */
export function writeOrCheck(outputs: GeneratedOutput[], { command, isCheck }: WriteOrCheckOptions): string[] {
  const stale = outputs.filter(([file, text]) => !existsSync(file) || readFileSync(file, "utf8") !== text)
  const names = stale.map(([file]) => path.relative(process.cwd(), file))
  if (isCheck) {
    for (const name of names) Terminal.err(`stale:  ${name} (run \`yarn ${command}\`)`)
    process.exitCode = stale.length ? 1 : 0
    return names
  }
  for (const [file, text] of stale) {
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(file, text)
  }
  return names
}

/**
 * `page` with what's between its `start` and `end` markers replaced by `block(indent)`, `indent` being the start
 * marker's.
 * - Each marker on its own line;  the rest of the page is hand-kept, and keeps its bytes.
 * - throws if a marker is missing, or they're out of order
 */
export function spliceGenerated(page: string, { file, start, end, block }: SpliceParams): string {
  const from = page.indexOf(start)
  const to = page.indexOf(end)
  if (from < 0 || to < from) {
    throw new Error(`spliceGenerated():  ${file} has no ${start} ... ${end} markers;  put them back around its block`)
  }
  const indent = page.slice(page.lastIndexOf("\n", from) + 1, from)
  return page.slice(0, from + start.length) + "\n" + block(indent) + indent + page.slice(to)
}

/** `packages/ui/`:  where `vp fmt` runs. */
const PACKAGE_ROOT = fileURLToPath(new URL("../", import.meta.url))

////////////////
// ## Markup
////////////////

/** A family's `status` (`site/_data/pages.json`) as its label's words;  `done` shows none. */
export const STATUS_TEXT: Readonly<Record<string, string>> = { planned: "Planned", "in-progress": "In progress" }

/** `text` safe inside an attribute or element. */
export function escapeHtml(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

/** `text` without markdown code ticks:  a card or a summary line shows plain text. */
export function withoutTicks(text: string): string {
  return text.replaceAll("`", "")
}

////////////////
// ## Types
////////////////

/** One generated file and the text it should hold. */
export type GeneratedOutput = [file: string, text: string]

/** `writeOrCheck()`'s options. */
export type WriteOrCheckOptions = {
  /** the yarn script that writes these files, e.g. `site:index`:  what a stale file says to run */
  command: string
  /** `--check`:  write nothing, fail if stale */
  isCheck: boolean
}

/** `spliceGenerated()`'s params. */
export type SpliceParams = {
  /** the page's file, for the error */
  file: string
  /** the start marker, e.g. `<!-- components:start -->` */
  start: string
  /** the end marker, e.g. `<!-- components:end -->` */
  end: string
  /** the generated lines, each at `indent`, ending in a newline */
  block: (indent: string) => string
}
