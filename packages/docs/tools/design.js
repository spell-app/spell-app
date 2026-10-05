/**
 * `spell dev design pull | changed | pushed | state` (epic `claude-design`, P9):  the local half of Spell's claude.ai
 * design system.  Claude's `/design` skill (`.claude/skills/design/`) does the claude.ai half with its Artifact tool.
 * - `pull <board.dc.html> <page.html> [--title "..."] [--from <design link>]` -- a Claude Design artboard (read from
 *   a Design with the Artifact tool) as a spell-app-dev page:  its `<ui-*>` markup kept, Claude Design's runtime
 *   dropped, the one-file bundle and the site header added for the page's depth.  Prints what it couldn't carry.
 * - `changed [--json]` -- which files of the built system (`packages/ui/build/design-system/project/`, from
 *   `spell dev design build` + `yarn design:bundle`) differ from what was last pushed, and which were removed
 * - `pushed [--url <system link>]` -- record the built files as pushed (after the skill's publish)
 * - `state [--json]` -- the record:  the system's link, when it was pushed, how many files
 * - The record is SHARED content, `brand/design-system.json` in `../spell-app-dev`, so every checkout knows what
 *   claude.ai holds:  `{ url, pushedAt, by, files: { "project/<path>": "<sha256>" } }`.
 */
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs"
import { basename, dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { parseHTML } from "linkedom"

import { ROOT } from "./pages.js"

/** The built design system:  `spell dev design build` writes it, `yarn design:bundle` adds the bundle. */
export const BUILT = join(ROOT, "packages/ui/build/design-system")

/**
 * Attributes Claude Design's runtime reads as event handlers:  `onClick="{{handler}}"`.
 * - case-blind:  the HTML parser lowercases attribute names (`onclick`)
 */
const EVENT_ATTRIBUTE = /^on[a-z]+$/i

/** A hole:  `{{ path }}`, a dotted lookup into the artboard's `renderVals()`. */
const HOLE = /\{\{\s*([\w.$]+)\s*\}\}/g

/** Run `spell dev design <verb> ...`;  the exit code. */
async function main(argv) {
  const [verb, ...rest] = argv
  const { positional, flags } = parseArgs(rest)
  if (verb === "pull") {
    const [board, page] = positional
    if (!board || !page) return usage("pull <board.dc.html> <page.html> [--title ...] [--from <design link>]")
    const result = pullBoard(readFileSync(board, "utf8"), resolve(page), {
      title: flags.title,
      from: flags.from,
      board: basename(board)
    })
    mkdirSync(dirname(resolve(page)), { recursive: true })
    writeFileSync(resolve(page), result.html)
    console.log(`wrote ${resolve(page)}`)
    for (const note of result.notes) console.log(`  - ${note}`)
    return 0
  }
  if (verb === "changed") {
    const diff = changedFiles(BUILT, readState())
    if (flags.json) console.log(JSON.stringify({ root: BUILT, url: readState().url ?? null, ...diff }, null, 2))
    else {
      console.log(`${diff.changed.length} changed, ${diff.removed.length} removed (in ${BUILT})`)
      for (const path of diff.changed) console.log(`  ~ ${path}`)
      for (const path of diff.removed) console.log(`  - ${path}`)
    }
    return 0
  }
  if (verb === "pushed") {
    const state = { ...readState(), url: flags.url ?? readState().url, pushedAt: new Date().toISOString() }
    state.files = hashTree(BUILT)
    writeState(state)
    console.log(`recorded ${Object.keys(state.files).length} files as pushed to ${state.url ?? "(no link yet)"}`)
    return 0
  }
  if (verb === "state") {
    const state = readState()
    if (flags.json) console.log(JSON.stringify(state, null, 2))
    else
      console.log(
        state.url
          ? `${state.url}  pushed ${state.pushedAt ?? "never"}, ${Object.keys(state.files ?? {}).length} files`
          : "no design system recorded yet"
      )
    return 0
  }
  return usage("pull | changed | pushed | state")
}

////////////////
// ## Pull
////////////////

/**
 * Artboard `source` (a `.dc.html`) as a page at `file`:  `{ html, notes }`.
 * - kept:  the markup inside `<x-dc>`, `<ui-*>` elements and their attributes, inline styles
 * - `<helmet>`:  its `<style>`s move into the page's `<head>` (minus `body{margin:0}`);  its font `<link>`s too
 * - holes:  filled from the artboard's `data-props` defaults where it has one;  else left as written, and noted
 * - `onX="{{handler}}"`:  dropped (the page has no `renderVals()`), noted
 * - `<sc-if>` / `<sc-for>`:  unwrapped, their content kept once;  `<dc-import>`:  a comment naming the board
 * - the page:  the one-file bundle and `<spell-site-header>` for its depth, `class="ui-typography"` on body
 */
export function pullBoard(source, file, { title, from, board } = {}) {
  const { document } = parseHTML(source)
  const notes = []
  const root = document.querySelector("x-dc")
  if (!root) throw new Error("no <x-dc> in the artboard:  is it a Claude Design .dc.html?")
  const defaults = propDefaults(document)
  const head = []
  for (const helmet of root.querySelectorAll("helmet")) {
    for (const style of helmet.querySelectorAll("style")) {
      const css = style.textContent.replace(/body\s*\{\s*margin\s*:\s*0;?\s*\}/g, "").trim()
      if (css) head.push(`<style>\n${css}\n</style>`)
    }
    for (const link of helmet.querySelectorAll("link[href]")) head.push(link.outerHTML)
    helmet.remove()
  }
  for (const el of [...root.querySelectorAll("*")]) {
    for (const attr of [...el.attributes]) {
      if (EVENT_ATTRIBUTE.test(attr.name) && attr.value.includes("{{")) {
        el.removeAttribute(attr.name)
        notes.push(`dropped ${attr.name}="${attr.value}" on <${el.localName}>:  a page has no renderVals()`)
      } else if (attr.name.startsWith("hint-")) el.removeAttribute(attr.name)
      else if (attr.value.includes("{{")) el.setAttribute(attr.name, fillHoles(attr.value, defaults, notes))
    }
  }
  for (const tag of ["sc-if", "sc-for"]) {
    for (const el of [...root.querySelectorAll(tag)]) {
      notes.push(`unwrapped <${tag}>:  its content shows once, as drawn`)
      el.replaceWith(...el.childNodes)
    }
  }
  for (const el of [...root.querySelectorAll("dc-import")]) {
    notes.push(`<dc-import name="${el.getAttribute("name")}">:  pull that board too, and paste it in`)
    el.replaceWith(document.createComment(` dc-import ${el.getAttribute("name")}:  pull that board too `))
  }
  let body = root.innerHTML.trim()
  body = fillHoles(body, defaults, notes)
  const up = relative(dirname(file), ROOT) || "."
  const name = title ?? document.querySelector("title")?.textContent.trim() ?? basename(file, ".html")
  const stamp = new Date().toISOString().slice(0, 10)
  const origin = `pulled from Claude Design${from ? `, ${from}` : ""}${board ? `, board ${board}` : ""}, ${stamp}`
  const html = [
    "<!doctype html>",
    '<html lang="en">',
    "  <head>",
    '    <meta charset="utf-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
    `    <title>${escapeText(name)}</title>`,
    `    <script src="${up}/packages/docs/tools/_assets/spell-ui.js"></script>`,
    ...head.map((line) => `    ${line}`),
    "  </head>",
    '  <body class="ui-typography">',
    `    <spell-site-header root="${up}"></spell-site-header>`,
    `    <!-- ${origin} -->`,
    body,
    "  </body>",
    "</html>",
    ""
  ].join("\n")
  return { html, notes: [...new Set(notes)] }
}

/** The artboard's `data-props` defaults:  `{ name: value }` for every prop with a plain `default`. */
function propDefaults(document) {
  const script = document.querySelector("script[data-dc-script]")
  const raw = script?.getAttribute("data-props")
  if (!raw) return {}
  try {
    const props = JSON.parse(raw)
    return Object.fromEntries(
      Object.entries(props)
        .filter(
          ([, spec]) =>
            spec && typeof spec === "object" && ["string", "number", "boolean"].includes(typeof spec.default)
        )
        .map(([name, spec]) => [name, String(spec.default)])
    )
  } catch {
    return {}
  }
}

/** `text` with each hole replaced by its default;  a hole with none stays, noted. */
function fillHoles(text, defaults, notes) {
  return text.replace(HOLE, (hole, path) => {
    if (path in defaults) return defaults[path]
    notes.push(`left ${hole} as written:  it comes from renderVals(), which a page doesn't run`)
    return hole
  })
}

/** `text` safe inside an element. */
function escapeText(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;")
}

////////////////
// ## Push record
////////////////

/** The shared content repo (`../spell-app-dev`), found through this checkout's `agents` link. */
export function sharedDir() {
  return dirname(realpathSync(join(ROOT, "agents")))
}

/** `brand/design-system.json` in the shared repo:  what was pushed to claude.ai. */
export function stateFile() {
  return join(sharedDir(), "brand/design-system.json")
}

/** The push record;  `{}` before the first push. */
export function readState(file = stateFile()) {
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {}
}

/** Write the push record, 2-space JSON. */
function writeState(state, file = stateFile()) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, `${JSON.stringify({ by: "Owen Williams", ...state }, null, 2)}\n`)
}

/** Every file under `<root>/project/`, by its `project/...` path:  its sha256. */
export function hashTree(root) {
  const files = {}
  for (const file of walk(join(root, "project"))) {
    files[relative(root, file)] = createHash("sha256").update(readFileSync(file)).digest("hex")
  }
  return files
}

/**
 * The built files that differ from `state.files`:  `{ changed, removed }`, `project/...` paths, sorted.
 * - `changed`:  new or different;  `project/design-system.json` (the index) last, since a publish sends it last
 * - `removed`:  pushed before, gone from the build now
 */
export function changedFiles(root, state) {
  const now = hashTree(root)
  const before = state.files ?? {}
  const changed = Object.keys(now)
    .filter((path) => before[path] !== now[path])
    .sort(
      (a, b) =>
        Number(a.endsWith("design-system.json")) - Number(b.endsWith("design-system.json")) || a.localeCompare(b)
    )
  const removed = Object.keys(before)
    .filter((path) => !(path in now))
    .sort()
  return { changed, removed }
}

/** Every file under `dir`, depth first;  none when it doesn't exist. */
function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

////////////////
// ## Arguments
////////////////

/** `argv` as `{ positional, flags }`:  `--name value`, `--flag` (true). */
function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith("--")) positional.push(arg)
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) flags[arg.slice(2)] = argv[++i]
    else flags[arg.slice(2)] = true
  }
  return { positional, flags }
}

/** Print how to call a verb;  exit code 1. */
function usage(text) {
  console.error(`usage:  spell dev design ${text}`)
  return 1
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exitCode = await main(process.argv.slice(2))
}
