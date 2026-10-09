/**
 * `spell dev airplane <verb>`:  airplane mode (epic `airplane`) -- Owen works on the docs with no Claude, on a
 * plane;  every mark, note and request he leaves waits for `/airplane land`.  The `/airplane` skill
 * (`.claude/skills/airplane/SKILL.md`) runs these.
 *
 *     spell dev airplane check --fix
 *     ok    page server     http://127.0.0.1:4747 (main)
 *     fixed offline pages   highlight.js pointed at the repo's copy in 138 pages
 *     ok    extension       Review:  Open Epic... installed
 *     note  waiting         3 marks in 2 epics, already waiting from before
 *
 * - `on` / `off`:  the switch (`AirplaneMode`, `~/.spell/airplane.json`);  the page server tells pages as it serves
 *   them, so a page reloaded after `on` says "queued for when you land"
 * - `status [--json]` (default):  on or off, since when
 * - `check [--fix] [--json]`:  is this laptop ready to fly?  Exits 1 while anything isn't (`fixed` counts as ready)
 *   - `checkout`:  run from the MAIN checkout:  its page server is the one the side bar uses on the plane
 *   - `page server`:  running;  `--fix` starts it (`spell dev server ensure`)
 *   - `offline pages`:  no docs page loads anything from the internet (`offline.ts`);  `--fix` points the
 *     highlight.js tag at the repo's copy
 *   - `extension`:  the installed VS Code extension has "Review:  Open Epic..." (built from a `main` with this
 *     epic);  else run `spell dev vscode` from `main`
 *   - `waiting`:  marks already waiting in the epics' inboxes, from before the flight:  a note, never a failure
 * - Which checkout:  the one this file is in, which `spell dev` picks from the current folder (`runTool()`)
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { SRV } from "$/server"
import { AirplaneMode } from "$/server/page/AirplaneMode"
import { PageServer } from "$/server/page/PageServer"

import { DOCS_FOLDERS, HIGHLIGHT, Offline } from "./offline.ts"
import { ROOT, parseArgs } from "./pages.js"

/** One line of `check`:  what was checked, how it stands, and what to do about it. */
export type FlightCheck = { name: string; status: "ok" | "fixed" | "fail" | "note"; detail: string }

/**
 * The pre-flight checks, for checkout `root`;  `fix`:  fix what can be fixed on the spot.
 * - NEVER throws:  a check that can't run fails, saying why
 */
export async function preFlight(root: string, { fix = false } = {}): Promise<FlightCheck[]> {
  const checks = [checkoutCheck(root), await serverCheck(root, fix), offlineCheck(root, fix), extensionCheck()]
  const waiting = waitingCheck(root)
  return waiting ? [...checks, waiting] : checks
}

/** The main checkout, not a worktree:  its page server is the one the side bar shows on the plane. */
function checkoutCheck(root: string): FlightCheck {
  const worktree = /[/\\]\.claude[/\\]worktrees[/\\]/.test(root)
  return worktree
    ? { name: "checkout", status: "fail", detail: `${root} is a worktree:  run it from the main checkout` }
    : { name: "checkout", status: "ok", detail: root }
}

/**
 * The checkout's page server, running;  `fix`:  `PageServer.ensure()`, which also restarts one older than its code
 * (after the merge that brought this epic in, so pages get airplane mode).
 */
async function serverCheck(root: string, fix: boolean): Promise<FlightCheck> {
  const name = "page server"
  try {
    if (!fix) {
      const running = await new SRV.PidFile(root).status()
      if (running) return { name, status: "ok", detail: running.base }
      return { name, status: "fail", detail: "not running:  `spell dev server ensure`" }
    }
    const server = await PageServer.ensure(root)
    return server.launched
      ? { name, status: "fixed", detail: `started:  ${server.base}` }
      : { name, status: "ok", detail: server.base }
  } catch (error) {
    return { name, status: "fail", detail: `can't check:  ${(error as Error).message}` }
  }
}

/** No docs page loads anything from the internet;  `fix`:  highlight.js pointed at the repo's copy first. */
function offlineCheck(root: string, fix: boolean): FlightCheck {
  const name = "offline pages"
  const folders = DOCS_FOLDERS.filter((folder) => existsSync(join(root, folder)))
  const files = Offline.filesUnder(folders, { cwd: root })
  let fixed = 0
  const loads = files.flatMap((file) => {
    const text = readFileSync(file, "utf8")
    if (!fix || !text.includes(HIGHLIGHT.cdn)) return Offline.loadsIn(file, text)
    fixed++
    const local = Offline.fixHighlight(file, text, root)
    writeFileSync(file, local)
    return Offline.loadsIn(file, local)
  })
  if (loads.length) {
    const first = loads[0]!
    const where = `${first.file.slice(root.length + 1)}:${first.line}`
    return {
      name,
      status: "fail",
      detail: `${loads.length} remote loads, the first ${where}:  \`spell dev docs offline\``
    }
  }
  return fixed
    ? { name, status: "fixed", detail: `highlight.js pointed at the repo's copy in ${fixed} pages` }
    : { name, status: "ok", detail: `${files.length} pages, nothing remote` }
}

/** The installed VS Code extension knows "Review:  Open Epic..." (`spell.reviewView.openEpic`). */
function extensionCheck(): FlightCheck {
  const name = "extension"
  const folder = join(homedir(), ".vscode", "extensions")
  const installed = existsSync(folder)
    ? readdirSync(folder).filter((entry) => entry.startsWith("spell-app.spell-language-"))
    : []
  const has = installed.some((entry) => {
    const manifest = join(folder, entry, "package.json")
    return existsSync(manifest) && readFileSync(manifest, "utf8").includes(OPEN_EPIC)
  })
  return has
    ? { name, status: "ok", detail: "Review:  Open Epic... installed" }
    : { name, status: "fail", detail: "too old for Review:  Open Epic...:  `spell dev vscode` from `main`" }
}

/** Marks already waiting in the epics' inboxes;  `undefined` when none. */
function waitingCheck(root: string): FlightCheck | undefined {
  const epics = join(root, "epics")
  if (!existsSync(epics)) return undefined
  const counts = readdirSync(epics).flatMap((name) => {
    const file = join(epics, name, `${name}.inbox.json`)
    if (!existsSync(file)) return []
    const inbox = JSON.parse(readFileSync(file, "utf8")) as { marks?: object; now?: unknown[] }
    const count = Object.keys(inbox.marks ?? {}).length + (inbox.now?.length ?? 0)
    return count ? [count] : []
  })
  if (!counts.length) return undefined
  const marks = counts.reduce((a, b) => a + b, 0)
  return { name: "waiting", status: "note", detail: `${marks} marks in ${counts.length} epics, already waiting` }
}

/** The extension command `check` looks for in the installed extension's `package.json`. */
const OPEN_EPIC = "spell.reviewView.openEpic"

////////////////
// ## The command
////////////////

/** Run verb `verb` with `flags`;  returns the exit code. */
export async function run([verb = "status"]: string[], flags: Record<string, string | true>): Promise<number> {
  const json = !!flags.json
  switch (verb) {
    case "on":
    case "off": {
      AirplaneMode.turn(verb === "on")
      return run(["status"], flags)
    }
    case "status": {
      const state = AirplaneMode.read()
      if (json) console.log(JSON.stringify(state ?? { on: false }, null, 2))
      else console.log(state ? `airplane mode on, since ${state.since}` : "airplane mode off")
      return 0
    }
    case "check": {
      const checks = await preFlight(ROOT, { fix: !!flags.fix })
      if (json) console.log(JSON.stringify(checks, null, 2))
      else for (const check of checks) console.log(`${check.status.padEnd(6)}${check.name.padEnd(16)}${check.detail}`)
      return checks.some((check) => check.status === "fail") ? 1 : 0
    }
    default:
      console.error("usage:  spell dev airplane on | off | status [--json] | check [--fix] [--json]")
      return 2
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { positional, flags } = parseArgs(process.argv.slice(2))
  process.exitCode = await run(positional, flags)
}
