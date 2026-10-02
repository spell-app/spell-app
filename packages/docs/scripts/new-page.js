/**
 * `yarn docs:new <template> <page> [--title "Title"] [--description "One sentence."]`:  start a page from a template.
 * - `<template>`:  `durable` or `cheatsheet` (or a path under `templates/`);  plans come from `yarn plan-doc new`
 * - `<page>`:  where it goes, relative to `packages/docs`, e.g. `parser/parser.html` or `glossary.html`
 * - Fixes the `_assets` and `index.html` paths for the page's depth:  templates assume one folder deep, a top-level
 *   page is zero.  Likewise the site header's `root` (the path up to the repo root:  `packages/docs` is two more).
 * - Sets `<title>`, the `h1`, the breadcrumb's last section and the description;  drops the template's how-to
 *   comment;  refuses to overwrite.
 * - Then tidies the page and updates the docs index, so it's listed at once.
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"

import { parseHTML } from "linkedom"

import { DOCS, serialize, tidy } from "./pages.js"

const { positional, flags } = parseArgs(process.argv.slice(2))
const [templateArg, page] = positional
if (!templateArg || !page?.endsWith(".html")) {
  fail(`usage:  yarn docs:new durable|cheatsheet <topic>/<topic>.html [--title "Title"] [--description "..."]`)
}
if (/^templates\/plans\/|^plan$/.test(templateArg)) fail("plan docs:  `yarn plan-doc new <name>`")
const template = templateArg.includes("/") ? templateArg : `templates/${templateArg}.html`
if (!existsSync(join(DOCS, template))) fail(`no template ${template}`)
const file = join(DOCS, page)
if (existsSync(file)) fail(`${page} already exists`)

const depth = page.split("/").length - 1
const up = "../".repeat(depth)
const title = flags.title ?? "Short Title"
const html = readFileSync(join(DOCS, template), "utf8")
  .replace(/((?:href|src)=")(?:\.\.\/)*(_assets\/|index\.html)/g, `$1${up}$2`)
  .replace(/(<spell-site-header\b[^>]*?\broot=")[^"]*"/, `$1${up}../.."`)
  .replace(/\n\s*<!--\s*TEMPLATE:[\s\S]*?-->/, "")
const { document } = parseHTML(html)
document.querySelector("title").textContent = title
document.querySelector("h1").textContent = title
const crumb = document.querySelector("ui-breadcrumb-section[active]")
if (crumb) crumb.textContent = title
document.querySelector('meta[name="description"]').setAttribute("content", flags.description ?? "One sentence.")
mkdirSync(dirname(file), { recursive: true })
writeFileSync(file, serialize(document))
if (!tidy([page])) process.exit(1)
const run = spawnSync("node", ["scripts/index.js"], { cwd: DOCS, encoding: "utf8" })
if (run.status !== 0) process.stderr.write(run.stderr)
console.log(relative(process.cwd(), file))

/** `--key value` flags, plus everything else in order. */
function parseArgs(argv) {
  const positional = []
  const flags = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--") && i + 1 < argv.length) flags[argv[i].slice(2)] = argv[++i]
    else positional.push(argv[i])
  }
  return { positional, flags }
}

/** Print `message` and exit 1. */
function fail(message) {
  console.error(`docs:new:  ${message}`)
  process.exit(1)
}
