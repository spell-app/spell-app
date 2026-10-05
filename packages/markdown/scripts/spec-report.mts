/**
 * The GFM spec, section by section:  passes / total, and the failing example numbers.
 * - Run from `packages/markdown`:  `yarn tsx scripts/spec-report.mts [section...]`
 * - With section names (or substrings), also prints each failing example:  input, expected, got.
 */
import { MD, type SpecExample } from "$/markdown"

import { comparableHTML, specOptions } from "$/markdown/spec/spec.types"

import spec from "../src/spec/gfm-spec.json" with { type: "json" }

const wanted = process.argv.slice(2)
const examples = (spec.examples as SpecExample[]).filter((example) => example.extension !== "disabled")
const bySection = new Map<string, { passed: number; failed: number[] }>()
let passed = 0
for (const example of examples) {
  const entry = bySection.get(example.section) ?? { passed: 0, failed: [] }
  let got = ""
  try {
    got = MD.toHTML(example.markdown, specOptions(example))
  } catch (error) {
    got = `THROWS ${(error as Error).message}`
  }
  if (comparableHTML(got) === comparableHTML(example.html)) {
    entry.passed++
    passed++
  } else {
    entry.failed.push(example.example)
    if (wanted.some((name) => example.section.toLowerCase().includes(name.toLowerCase()))) {
      console.log(`\n--- #${example.example} (${example.section})`)
      console.log(`in:   ${JSON.stringify(example.markdown)}`)
      console.log(`want: ${JSON.stringify(example.html)}`)
      console.log(`got:  ${JSON.stringify(got)}`)
    }
  }
  bySection.set(example.section, entry)
}
console.log(`\n${passed}/${examples.length}`)
for (const [section, { passed, failed }] of bySection) {
  console.log(
    `${`${passed}/${passed + failed.length}`.padStart(7)}  ${section}${failed.length ? `   fails: ${failed.join(" ")}` : ""}`
  )
}
