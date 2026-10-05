/**
 * `spell dev docs new <template> <page> [--title "Title"] [--description "One sentence."]`:  start a page from a template.
 * - `<template>`:  `durable`, `cheatsheet` or `commands` (or a path under `templates/`);  plan docs come from
 *   `spell dev plan-doc new`
 * - SIDE EFFECT:  a template with a JSON beside it (`commands.json`) copies that too, as `<page>.json`
 * - `<page>`:  where it goes, a guide by default:  `parser/parser.html` is `guides/parser/parser.html`;  a path starting
 *   with an area (`guides/`, `pages/`) is from the checkout's root
 * - Fixes the `_assets` and `index.html` paths, and the site header's `root`, for the page's depth (`atDepth()`).
 * - Sets `<title>`, the `h1`, the breadcrumb's last section and the description;  drops the template's how-to
 *   comment;  refuses to overwrite.
 * - Then tidies the page and updates the docs index, so it's listed at once.
 */
import { spawnSync } from "node:child_process"
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { basename, dirname, join, relative } from "node:path"

import { parseHTML } from "linkedom"

import { GUIDES, PACKAGE, ROOT, TOOLS, atDepth, serialize, tidy } from "./pages.js"

const { positional, flags } = parseArgs(process.argv.slice(2))
const [templateArg, page] = positional
if (!templateArg || !page?.endsWith(".html")) {
  fail(
    `usage:  spell dev docs new durable|cheatsheet|commands <topic>/<topic>.html [--title "Title"] [--description "..."]`
  )
}
if (/^templates\/epics\/|^plan$/.test(templateArg)) fail("plan docs:  `spell dev plan-doc new <name>`")
const template = templateArg.includes("/") ? templateArg : `templates/${templateArg}.html`
if (!existsSync(join(ROOT, template))) fail(`no template ${template}`)
const file = /^(guides|pages)\//.test(page) ? join(ROOT, page) : join(GUIDES, page)
if (existsSync(file)) fail(`${relative(ROOT, file)} already exists`)

const title = flags.title ?? "Short Title"
const html = atDepth(readFileSync(join(ROOT, template), "utf8"), relative(ROOT, file).split("/").length - 1)
const { document } = parseHTML(html)
document.querySelector("title").textContent = title
document.querySelector("h1").textContent = title
const crumb = document.querySelector("ui-breadcrumb-section[active]")
if (crumb) crumb.textContent = title
document.querySelector('meta[name="description"]').setAttribute("content", flags.description ?? "One sentence.")
// a data-driven template (`commands`) has its JSON beside it:  the page gets a copy, named after the page
const data = join(ROOT, template.replace(/\.html$/, ".json"))
const pageData = file.replace(/\.html$/, ".json")
for (const code of document.querySelectorAll("ui-list.spell-meta code")) {
  if (code.textContent === "short-title.json") code.textContent = basename(pageData)
}
mkdirSync(dirname(file), { recursive: true })
writeFileSync(file, serialize(document))
if (existsSync(data)) copyFileSync(data, pageData)
if (!tidy([file])) process.exit(1)
const run = spawnSync("node", [join(TOOLS, "index.js")], { cwd: PACKAGE, encoding: "utf8" })
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
