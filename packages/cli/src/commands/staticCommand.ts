import chalk from "chalk"
import { spawn } from "child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "fs"
import { dirname, relative, resolve, sep } from "path"
import { fileURLToPath } from "url"

import { CLI } from "$/cli"

/** Our own `src/` folder. */
const CLI_SRC_DIR = resolve(fileURLToPath(import.meta.url), "..", "..")
/** The child process that renders -- see its header. */
const RUNNER = resolve(CLI_SRC_DIR, "runner", "renderStatic.ts")

/**
 * `spell static <pages...>`:  each `ui-*` page as plain HTML for crawlers and no-JS readers -- no shadow DOM, no
 * scripts that load the elements -- and the stylesheet that styles it.  `@spell-app/ui`'s static render
 * (`$/ui/static`), through `ui/tools/StaticDocument.ts`.
 * - A page:  an `.html` file;  a folder:  every `.html` in it, at any depth, except `*.static.html` (what this
 *   writes), `node_modules` and dot folders.
 * - Writes, for `page.html`:
 *   - `page.static.html` beside it -- or `-o <file>` for one page, `-o <folder>` for several (each keeps its name,
 *     under the folder, as under the folder named)
 *   - `ui.static.css` in THAT folder (`FOLDER_SHEET`):  ONE stylesheet every page there links (first in its `<head>`,
 *     so its layer order comes before the page's own CSS), cached by the browser across them
 *   - `--css <file>`:  ONE stylesheet for every page, there, instead
 *   - `--inline-css`:  each page's own stylesheet in a `<style>`, no file
 * - A shared stylesheet holds the families its pages use, PLUS whatever it held before:  its first line records what
 *   it covers (`CLI.StaticSheetJob`'s `coverage`), so re-rendering one page never drops another page's styles.
 *   Minified (Lightning CSS);  `--no-minify` to read it.
 * - Removes each `<script>` that loads the elements (`StaticDocument.ELEMENT_SCRIPT`):  an upgrade would show the
 *   content twice.  Other scripts stay.
 * - Renders in a child process, through Vite -- see `runner/renderStatic.ts`.
 * - Lists each page it wrote on stdout;  sizes, removed scripts and tags it left as they were on stderr.
 * - Returns the exit code:  `EXIT.ERRORS` if a page failed.
 */
export async function staticCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.StaticOptions
): Promise<number> {
  if (options.inlineCss && options.css) throw new CLI.CliError("--inline-css and --css:  pick one")
  const pages = staticPages(args, options)
  const minify = options.minify !== false
  // each page's shared sheet:  `--css`, else its folder's;  none with `--inline-css`
  const sheetOf = (output: string) =>
    options.inlineCss ? undefined : options.css ? resolve(options.css) : resolve(dirname(output), FOLDER_SHEET)
  const sheets = new Map<string, CLI.StaticSheetJob>()
  for (const [index, page] of pages.entries()) {
    const path = sheetOf(page.output)
    if (!path) continue
    let sheet = sheets.get(path)
    if (!sheet) sheets.set(path, (sheet = { path, pages: [], coverage: readCoverage(path) }))
    sheet.pages.push(index)
  }
  const job: CLI.StaticMessage = {
    kind: "job",
    sheets: [...sheets.values()],
    minify,
    pages: pages.map((page) => {
      const sheet = sheetOf(page.output)
      return {
        html: readFileSync(page.input, "utf8"),
        options: {
          href: sheet ? href(page.output, sheet) : undefined,
          shared: !!sheet,
          minify,
          input: page.input,
          output: page.output
        }
      }
    })
  }

  session.err(chalk.dim(`Rendering ${pages.length} page${pages.length === 1 ? "" : "s"}...`))
  const { replies, stderr } = await renderInChild(job, !!options.verbose)
  const failed = replies.find((reply) => reply.kind === "failed")
  if (failed?.kind === "failed") {
    session.err(chalk.red(`Static render failed:\n${failed.error}`))
    return CLI.EXIT.ERRORS
  }
  if (!replies.some((reply) => reply.kind === "done")) {
    session.err(chalk.red(`Static render stopped early${stderr.trim() ? `:\n${stderr.trim()}` : ""}`))
    return CLI.EXIT.ERRORS
  }

  let errors = 0
  for (const reply of replies) {
    if (reply.kind !== "page") continue
    const page = pages[reply.index]!
    if (!reply.result) {
      errors++
      session.err(chalk.red(`${session.relative(page.input)}:  ${reply.error}`))
      continue
    }
    const { html, css, unrendered, dropped } = reply.result
    write(page.output, html)
    const notes = [size(html)]
    if (css) notes.push(`inline css ${size(css.text)}${minify ? ` from ${kB(css.fullSize)}` : ""}`)
    session.out(session.relative(page.output))
    session.err(`${session.relative(page.input)} -> ${session.relative(page.output)}  ${chalk.dim(notes.join(", "))}`)
    if (dropped.length) session.err(chalk.dim(`  removed scripts:  ${dropped.join(", ")}`))
    const left = Object.entries(unrendered).map(([tag, count]) => (count > 1 ? `${tag} ×${count}` : tag))
    if (left.length) session.err(chalk.yellow(`  left as they were (no static render):  ${left.join(", ")}`))
    if (css?.minifyFallback) session.err(chalk.yellow(`  css not minified, only stripped:  ${css.minifyFallback}`))
  }
  for (const reply of replies) {
    if (reply.kind !== "stylesheet") continue
    const { path, result } = reply
    write(path, `${coverageLine(result.coverage)}\n${result.text}`)
    const from = minify ? ` from ${kB(result.fullSize)}` : ""
    const count = sheets.get(path)?.pages.length ?? 0
    const pagesNote = `${count} page${count === 1 ? "" : "s"} this run, ${result.coverage.tags.length} tags in all`
    session.out(session.relative(path))
    session.err(`${session.relative(path)}  ${chalk.dim(`${size(result.text)}${from}, ${pagesNote}`)}`)
    if (result.minifyFallback) {
      session.err(chalk.yellow(`  some sheets not minified, only stripped:  ${result.minifyFallback}`))
    }
  }
  return errors ? CLI.EXIT.ERRORS : CLI.EXIT.OK
}

////////////////
// ## Pages
////////////////

/**
 * One page to render.
 * - `input`:  absolute path of the page
 * - `output`:  where its static twin goes
 */
type StaticPage = {
  input: string
  output: string
}

/**
 * The pages `args` name, and where each goes -- see `staticCommand()`.
 * - Throws `CLI.CliError` for a missing page, no pages at all, or an output that would overwrite its input.
 */
export function staticPages(args: string[], options: Pick<CLI.StaticOptions, "output">): StaticPage[] {
  if (!args.length) throw new CLI.CliError("Name a page, e.g. spell static page.html -- or a folder of them")
  // each page, with the folder its name under `-o <folder>` is relative to
  const found: { input: string; base: string }[] = []
  for (const arg of args) {
    const path = resolve(arg)
    if (!existsSync(path)) throw new CLI.CliError(`No such page or folder:  ${arg}`)
    if (statSync(path).isDirectory()) {
      const files = htmlFiles(path)
      if (!files.length) throw new CLI.CliError(`No .html pages in ${arg}`)
      found.push(...files.map((input) => ({ input, base: path })))
    } else {
      found.push({ input: path, base: dirname(path) })
    }
  }
  const output = options.output && resolve(options.output)
  const intoFolder =
    !!output &&
    (found.length > 1 || /[/\\]$/.test(options.output!) || (existsSync(output) && statSync(output).isDirectory()))
  return found.map(({ input, base }) => {
    let path = input.replace(/(\.html?)?$/i, ".static.html")
    if (output) path = intoFolder ? resolve(output, relative(base, input)) : output
    if (path === input) throw new CLI.CliError(`Won't overwrite the page itself:  ${input}`)
    return { input, output: path }
  })
}

/**
 * Every `.html` page under `folder`, sorted:  not `*.static.html`, nor in `node_modules`, dot folders or `parts/`
 * (a split plan doc's bodies, `epics/<name>/parts/<id>.html`:  fragments its page loads, never pages).
 */
function htmlFiles(folder: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(folder, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue
    // a plan doc's parts:  fragments, never pages (Q12 of `epic-components`)
    if (entry.isDirectory() && entry.name === "parts") continue
    const path = resolve(folder, entry.name)
    if (entry.isDirectory()) files.push(...htmlFiles(path))
    else if (/\.html$/i.test(entry.name) && !/\.static\.html$/i.test(entry.name)) files.push(path)
  }
  return files.sort()
}

/** The shared stylesheet every static page in a folder links, unless `--css` / `--inline-css` say otherwise. */
export const FOLDER_SHEET = "ui.static.css"

/**
 * What the stylesheet at `path` already covers:  its first line (`coverageLine()`), else nothing (no file yet, or
 * one this command didn't write).
 */
export function readCoverage(path: string): CLI.StaticSheetJob["coverage"] {
  if (!existsSync(path)) return undefined
  const first = readFileSync(path, "utf8").split("\n", 1)[0]!
  const json = COVERAGE.exec(first)?.[1]
  if (!json) return undefined
  try {
    return JSON.parse(json) as CLI.StaticSheetJob["coverage"]
  } catch {
    return undefined
  }
}

/** A shared stylesheet's first line:  what it covers, as JSON in a comment minifiers keep (`/*!`). */
export function coverageLine(coverage: NonNullable<CLI.StaticSheetJob["coverage"]>): string {
  return `/*! spell-static ${JSON.stringify(coverage)} */`
}

/** `coverageLine()`'s shape:  the JSON inside. */
const COVERAGE = /^\/\*! spell-static (\{.*\}) \*\/$/

/** URL of `file` from page `output`, e.g. `ui.static.css`, `../site.css`. */
function href(output: string, file: string): string {
  return encodeURI(relative(dirname(output), file).split(sep).join("/"))
}

////////////////
// ## Rendering
////////////////

/**
 * Run `runner/renderStatic.ts` for `job`, and collect what it answers -- see `CLI.StaticMessage`.
 * - `tsx` compiles the runner, with OUR `tsconfig.json` for the `$/` aliases;  Vite compiles `ui`'s source.
 * - Its stderr (Vite's warnings) is collected, for when it stops early -- or, with `verbose`, shown as it comes.
 */
function renderInChild(job: CLI.StaticMessage, verbose: boolean) {
  const args = ["--import", import.meta.resolve("tsx/esm"), RUNNER]
  const env = { ...process.env, TSX_TSCONFIG_PATH: resolve(CLI_SRC_DIR, "..", "tsconfig.json") }
  return new Promise<{ replies: CLI.StaticMessage[]; stderr: string }>((done) => {
    const child = spawn(process.execPath, args, {
      stdio: ["ignore", verbose ? "inherit" : "ignore", verbose ? "inherit" : "pipe", "ipc"],
      env
    })
    const replies: CLI.StaticMessage[] = []
    let stderr = ""
    child.stderr?.on("data", (data) => (stderr += data))
    child.on("message", (message: CLI.StaticMessage) => {
      if (message.kind === "ready") child.send(job)
      else replies.push(message)
    })
    child.on("exit", () => done({ replies, stderr }))
    child.on("error", (error) => done({ replies, stderr: `${stderr}${error.message}` }))
  })
}

////////////////
// ## Output
////////////////

/** Write `text` to `path`, making its folder. */
function write(path: string, text: string) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, text)
}

/** `text`'s size, e.g. `12.3 kB`. */
function size(text: string): string {
  return kB(Buffer.byteLength(text))
}

/** `bytes` as kilobytes, e.g. `12.3 kB`. */
function kB(bytes: number): string {
  return `${(bytes / 1000).toFixed(1)} kB`
}
