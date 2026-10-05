/**
 * Convert the GFM spec (cmark-gfm's `test/spec.txt`) into `src/spec/gfm-spec.json`:  the examples the spec test runs.
 * - Run from `packages/markdown`:  `node scripts/gfm-spec.mjs <path to spec.txt>`
 * - Get spec.txt from https://raw.githubusercontent.com/github/cmark-gfm/master/test/spec.txt (GFM 0.29, CC-BY-SA 4.0).
 * - Each example:  `{ example, section, extension?, markdown, html }`.  `→` in the spec stands for a tab.
 * - `extension`:  the GFM extension an example tests (`table`, `strikethrough`, `autolink`, `tagfilter`), or
 *   `disabled` for ones cmark-gfm doesn't run.
 */
import { readFileSync, writeFileSync } from "node:fs"

const [specPath] = process.argv.slice(2)
if (!specPath) {
  console.error("usage:  node scripts/gfm-spec.mjs <spec.txt>")
  process.exit(2)
}

const FENCE = "`".repeat(32)
const lines = readFileSync(specPath, "utf8").split("\n")
const version = /^version:\s*(.+)$/m.exec(lines.slice(0, 10).join("\n"))?.[1]

const examples = []
let section = ""
for (let i = 0; i < lines.length; i++) {
  const line = lines[i]
  const heading = /^#{1,6} (.+)$/.exec(line)
  if (heading) {
    section = heading[1].trim()
    continue
  }
  if (!line.startsWith(`${FENCE} example`)) continue
  const extension = line.slice(`${FENCE} example`.length).trim() || undefined
  const markdown = []
  const html = []
  let target = markdown
  for (i++; i < lines.length && lines[i] !== FENCE; i++) {
    if (lines[i] === "." && target === markdown) target = html
    else target.push(lines[i])
  }
  examples.push({
    example: examples.length + 1,
    section,
    ...(extension && { extension }),
    markdown: tabs(markdown.join("\n") + (markdown.length ? "\n" : "")),
    html: tabs(html.join("\n") + (html.length ? "\n" : ""))
  })
}

const out = new URL("../src/spec/gfm-spec.json", import.meta.url)
const json = {
  source: "https://github.com/github/cmark-gfm/blob/master/test/spec.txt",
  version,
  license: "CC-BY-SA 4.0",
  examples
}
writeFileSync(out, `${JSON.stringify(json, null, 2)}\n`)
console.log(`${examples.length} examples, version ${version}`)

/** The spec's `→` stand-in, back to a real tab. */
function tabs(text) {
  return text.replaceAll("→", "\t")
}
