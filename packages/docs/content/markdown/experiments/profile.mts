/**
 * Where `MD.toHTML()` spends its time, phase by phase, over every `.md` file in the repo.
 * - Run from `packages/docs`:  `yarn tsx markdown/experiments/profile.mts`
 * - Medians of 7 runs after a warm-up.
 */
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { MD } from "$/markdown"

const ROOT = resolve(import.meta.dirname, "../../../..")
const files = execFileSync("git", ["ls-files", "*.md"], { cwd: ROOT, encoding: "utf8" }).trim().split("\n")
const all = files.map((file) => readFileSync(resolve(ROOT, file), "utf8")).join("\n\n")

const doc = MD.BlockScanner.parse(all)
const refmap = MD.extractReferences(doc)
console.log(`blocks:          ${time(() => MD.BlockScanner.parse(all)).toFixed(1)} ms`)
console.log(`blocks + inline: ${time(() => MD.toHTML(all)).toFixed(1)} ms`)
console.log(
  `inline only:     ${time(() => MD.renderBlocks(doc, (text) => MD.renderInlines(MD.InlineParser.parse(text, refmap)))).toFixed(1)} ms`
)

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
