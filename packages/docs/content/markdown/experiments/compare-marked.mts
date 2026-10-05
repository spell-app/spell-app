/**
 * `MD.toHTML()` vs marked (the engine `<ui-markdown>` uses today) on every `.md` file in the repo:  where they
 * differ, and how fast each is.
 * - Run from `packages/docs`:  `yarn tsx markdown/experiments/compare-marked.mts [--diffs N]`
 * - marked is `packages/ui`'s copy (18), GFM on, as `MarkdownEngine` sets it.
 * - Compares normalized HTML:  whitespace next to block tags, void-tag style (`<br>` / `<br />`) and the
 *   entities marked writes for quotes don't count.  What's left is a real difference in output.
 * - Speed:  each engine over all the files, median of 7 runs, after a warm-up.
 */
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

import { MD } from "$/markdown"

import { comparableHTML } from "$/markdown/spec/spec.types"

const ROOT = resolve(import.meta.dirname, "../../../..")
const uiRequire = createRequire(resolve(ROOT, "packages/ui/package.json"))
const { Marked } = (await import(pathToFileURL(uiRequire.resolve("marked")).href)) as typeof import("marked")
const marked = new Marked({ gfm: true })
const markedVersion = JSON.parse(
  readFileSync(resolve(uiRequire.resolve("marked"), "../../package.json"), "utf8")
).version

const showDiffs = Number(process.argv[process.argv.indexOf("--diffs") + 1] || 0)
const files = execFileSync("git", ["ls-files", "*.md"], { cwd: ROOT, encoding: "utf8" }).trim().split("\n")
const texts = files.map((file) => readFileSync(resolve(ROOT, file), "utf8"))

let same = 0
const differing: { file: string; ours: string; theirs: string }[] = []
texts.forEach((text, i) => {
  const ours = normalize(MD.toHTML(text))
  const theirs = normalize(marked.parse(text, { async: false }) as string)
  if (ours === theirs) same++
  else differing.push({ file: files[i]!, ours, theirs })
})

console.log(`marked ${markedVersion} vs MD, ${files.length} files:  ${same} the same, ${differing.length} differ`)
for (const { file, ours, theirs } of differing.slice(0, showDiffs)) {
  const at = firstDifference(ours, theirs)
  console.log(`\n${file} @${at}`)
  console.log(`  MD:     ${JSON.stringify(ours.slice(Math.max(0, at - 60), at + 100))}`)
  console.log(`  marked: ${JSON.stringify(theirs.slice(Math.max(0, at - 60), at + 100))}`)
}

const all = texts.join("\n\n")
console.log(`\nspeed over all ${files.length} files (${Math.round(all.length / 1024)} kB), median of 7:`)
console.log(`  MD:      ${time(() => MD.toHTML(all)).toFixed(1)} ms`)
console.log(`  marked:  ${time(() => marked.parse(all, { async: false })).toFixed(1)} ms`)

/** `html` as compared:  `comparableHTML()`, plus marked's own spellings made the same as ours. */
function normalize(html: string) {
  return comparableHTML(
    html
      .replace(/<(br|hr|img|input)\b([^>]*?)\s*\/?>/g, "<$1$2 />")
      // GitHub's task-item class, which MD writes and marked doesn't
      .replace(/ class="task-list-item"/g, "")
      .replace(/<input type="checkbox" disabled="" checked="" \/>/g, '<input checked="" disabled="" type="checkbox" />')
      .replace(/<input type="checkbox" disabled="" \/>/g, '<input disabled="" type="checkbox" />')
      // entities either engine leaves (`&copy;`) or writes (`&#39;`), outside the HTML-special ones
      .replace(/&(?!(?:amp|lt|gt);)[#a-zA-Z0-9]+;/g, (entity) => MD.decodeEntity(entity))
      // indent at a line start inside a paragraph:  CommonMark drops it, marked keeps it;  both draw the same
      .replace(/\n[ \t]+(?=[^\n])/g, (indent, offset, all: string) => (insidePre(all, offset) ? indent : "\n"))
  )
}

/** Is `offset` inside a `<pre>` in `html`? */
function insidePre(html: string, offset: number) {
  const before = html.slice(0, offset)
  return before.lastIndexOf("<pre") > before.lastIndexOf("</pre>")
}

/** Index of the first character where `a` and `b` differ. */
function firstDifference(a: string, b: string) {
  let i = 0
  while (i < a.length && a[i] === b[i]) i++
  return i
}

/** Median milliseconds of `run()`, over 7 runs after one warm-up. */
function time(run: () => unknown) {
  run()
  const times: number[] = []
  for (let i = 0; i < 7; i++) {
    const start = performance.now()
    run()
    times.push(performance.now() - start)
  }
  return times.sort((a, b) => a - b)[3]!
}
