#!/usr/bin/env node
/**
 * `yarn serve`:  start every web server of THIS checkout that isn't running, wait until each answers, and print
 * where they are.  What `/spell-serve` runs, and `/spell-docs` before it shows a page.
 * - The PAGE SERVER (`yarn server ensure`):  docs, epics, goals, the app's `/api`.  Started in the background if it
 *   isn't running;  `yarn server stop` stops it, and with it the rest.
 * - The EDITOR (vite, the spell app):  the page server's child (`packages/app/src/server/EditorServer.ts`), started
 *   once the page server listens;  this waits for its record, `.spell-server.editor.json`, to answer.
 * - SPELL UI's docs:  static pages the page server itself serves at `/ui/` (`packages/ui/site/`, no dev server);
 *   this checks its bundle answers (`/ui/_assets/site.js`, built by `yarn site:build` in `packages/ui`).
 * - Prints one row per server:  name, port, URL, state.  Exit code 1 if any didn't come up.
 * - `node`, so it runs before `yarn install` too;  the page server itself needs this checkout's `node_modules`.
 */
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

/** This checkout. */
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")

/** Where the page server records its editor. */
const EDITOR_FILE = join(ROOT, ".spell-server.editor.json")

/** How long the editor may take:  vite may be building its dependency cache. */
const EDITOR_TIMEOUT_MS = 90_000

/** How long the Spell UI check may take:  a static file from the page server. */
const UI_TIMEOUT_MS = 10_000

const rows = []
const page = ensurePageServer()
rows.push({
  name: "page server",
  url: `${page.base}/`,
  what: "docs, epics, goals, /api",
  state: page.launched ? "started" : "running"
})
rows.push(await editorRow())
rows.push(await spellUIRow(page.base))
print(rows)
process.exitCode = rows.some((row) => row.failed) ? 1 : 0

/** `yarn server ensure` for this checkout:  its `{ base, launched, ... }`. */
function ensurePageServer() {
  const output = execFileSync("yarn", ["server", "ensure"], {
    cwd: ROOT,
    encoding: "utf8",
    env: { ...process.env, INIT_CWD: ROOT }
  })
  return JSON.parse(output.slice(output.indexOf("{")))
}

/** The editor's row, once its record answers -- or why not. */
async function editorRow() {
  const row = { name: "editor", what: "the spell app (vite)" }
  const started = Date.now()
  while (Date.now() - started < EDITOR_TIMEOUT_MS) {
    try {
      const { url } = JSON.parse(readFileSync(EDITOR_FILE, "utf8"))
      await fetch(url, { signal: AbortSignal.timeout(2000) })
      return { ...row, url, state: "running" }
    } catch {
      await new Promise((done) => setTimeout(done, 250))
    }
  }
  return { ...row, url: "-", state: "didn't answer:  see .spell-server.editor.log", failed: true }
}

/** Spell UI docs' row, once its bundle answers -- or why not. */
async function spellUIRow(base) {
  const row = { name: "Spell UI docs", url: `${base}/ui/`, what: "static pages, served by the page server" }
  try {
    const response = await fetch(`${base}/ui/_assets/site.js`, { signal: AbortSignal.timeout(UI_TIMEOUT_MS) })
    if (response.ok) return { ...row, state: "running" }
    return {
      ...row,
      state: `its bundle answered ${response.status}:  run \`yarn site:build\` in packages/ui`,
      failed: true
    }
  } catch (error) {
    return { ...row, state: `didn't answer (${error.message}):  see .spell-server.log`, failed: true }
  }
}

/** One aligned line per row:  name, port, URL, what it serves, state. */
function print(rows) {
  const width = (key) => Math.max(...rows.map((row) => String(row[key]).length))
  const port = (url) => (url === "-" ? "-" : new URL(url).port)
  console.log(`Spell servers of ${ROOT}:`)
  for (const row of rows) {
    console.log(
      `  ${row.name.padEnd(width("name"))}  ${port(row.url).padStart(5)}  ${row.url.padEnd(width("url"))}  ` +
        `${row.what.padEnd(width("what"))}  ${row.state}`
    )
  }
}
