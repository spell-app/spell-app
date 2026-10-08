/**
 * Tests of `ConvertRun`:  converting a checkout's plan docs, writing ONLY under the output folder, the report;  and
 * one round of the real `windows-and-review` doc, read from this checkout when it's there.
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, describe, expect, test } from "vite-plus/test"

import { ConvertRun } from "./ConvertRun"

/** The fixtures folder. */
const FIXTURES = fileURLToPath(new URL("fixtures/", import.meta.url))

/** Temp folders made by a test, removed after it. */
const temps: string[] = []

afterEach(() => {
  for (const temp of temps.splice(0)) rmSync(temp, { recursive: true, force: true })
})

/** A temp checkout whose `epics/` holds the split fixture and the one-file one (as `split`, `one-file`). */
function checkout(): string {
  const root = mkdtempSync(join(tmpdir(), "convert-run-"))
  temps.push(root)
  cpSync(join(FIXTURES, "split"), join(root, "epics", "split"), { recursive: true })
  mkdirSync(join(root, "epics", "one-file"), { recursive: true })
  cpSync(join(FIXTURES, "one-file.plan.html"), join(root, "epics", "one-file", "one-file.plan.html"))
  return root
}

describe("ConvertRun", () => {
  test("finds the docs, converts each, writes skeleton and parts ONLY under `out`", async () => {
    const root = checkout()
    const run = new ConvertRun({ root })
    expect(run.names).toEqual(["one-file", "split"])
    const out = join(root, "preview")
    const results = await run.run({ names: run.names, out })
    expect(results.map(({ name, conversion }) => [name, conversion?.proof.clean])).toEqual([
      ["one-file", true],
      ["split", true]
    ])
    // the fixture's `q2` is still `parts/q2.htm` (as every doc split before Q12):  read, and written `.html`
    expect(readdirSync(join(out, "split", "parts")).sort()).toEqual(
      ["j1", "log", "o1", "o2", "p1", "p2", "q1", "q2", "q4"].map((id) => `${id}.html`)
    )
    expect(readFileSync(join(out, "split", "split.plan.html"), "utf8")).toContain("<epic-page")
    // the docs themselves are untouched
    expect(readFileSync(join(root, "epics", "split", "split.plan.html"), "utf8")).toBe(
      readFileSync(join(FIXTURES, "split", "split.plan.html"), "utf8")
    )
  })

  test("a second run writes nothing new, and removes a part the doc no longer has, or an old `.htm` one", async () => {
    const root = checkout()
    const run = new ConvertRun({ root })
    const out = join(root, "preview")
    await run.run({ names: ["split"], out })
    const parts = join(out, "split", "parts")
    for (const stale of ["gone.html", "p1.htm"]) writeFileSync(join(parts, stale), "stale")
    const [again] = await run.run({ names: ["split"], out })
    expect(again!.written).toEqual([])
    expect(existsSync(join(parts, "gone.html"))).toBe(false)
    expect(existsSync(join(parts, "p1.htm"))).toBe(false)
    expect(existsSync(join(parts, "p1.html"))).toBe(true)
  })

  test("refuses an output folder inside `epics/`, or through a link to it", async () => {
    const root = checkout()
    const run = new ConvertRun({ root })
    await expect(run.run({ names: ["split"], out: join(root, "epics", "x") })).rejects.toThrow(
      /the real docs change only/
    )
    symlinkSync(join(root, "epics"), join(root, "linked"))
    await expect(run.run({ names: ["split"], out: join(root, "linked", "x") })).rejects.toThrow(TypeError)
  })

  test("no `out`:  a dry run, nothing written;  the report has a line per doc", async () => {
    const root = checkout()
    const results = await new ConvertRun({ root }).run({ names: ["split"] })
    expect(results[0]!.written).toEqual([])
    const [line] = ConvertRun.report(results)
    expect(line).toMatch(/^ok {4}split:  ids \d+, links \d+, words \d+;  split -> 9 parts/)
  })

  test("a converted doc takes the second pass;  once through it, it's skipped:  nothing written, a `skip` line", async () => {
    const root = checkout()
    cpSync(join(FIXTURES, "converted"), join(root, "epics", "converted"), { recursive: true })
    const run = new ConvertRun({ root })
    const out = join(root, "preview")
    const [upgraded] = await run.run({ names: ["converted"], out })
    expect(upgraded!.conversion).toMatchObject({ pass: 2, problems: [], proof: { clean: true } })
    expect(upgraded!.written.length).toBe(11)
    expect(ConvertRun.report([upgraded!])).toEqual([
      expect.stringMatching(
        /^ok {4}converted \(second pass\):  ids \d+, links \d+, words \d+;  split -> 10 parts;  \d+ notes;  wrote 11$/
      ),
      expect.stringMatching(/^ {6}5 net effect, 3 question, .*;  kept:  2 net effect in other words, /),
      "",
      "Second pass, in all:",
      ...Object.entries(ConvertRun.totals([upgraded!])).map(([key, count]) => `  ${String(count).padStart(5)}  ${key}`)
    ])
    rmSync(join(root, "epics", "converted"), { recursive: true })
    cpSync(join(out, "converted"), join(root, "epics", "converted"), { recursive: true })
    const results = await run.run({ names: ["converted"], out: join(root, "again") })
    expect(results).toMatchObject([{ name: "converted", skipped: true, written: [] }])
    expect(existsSync(join(root, "again", "converted"))).toBe(false)
    expect(ConvertRun.report(results)[0]).toMatch(
      /^skip {2}converted: {2}already in P14's <epic-\*> markup; {2}kept: {2}2 net effect in other words, 1 code in another shape, 1 note in other words, 1 hand-written card where its element can't go/
    )
  })

  test("an unknown doc is refused", async () => {
    await expect(new ConvertRun({ root: checkout() }).run({ names: ["nope"] })).rejects.toThrow(/no plan doc `nope`/)
  })
})

/**
 * This checkout's real `windows-and-review` doc (the newest old layout), when its `epics/` has it still in the old
 * markup:  since the switch (P12) it's converted, and this round is skipped.
 */
const REAL = new ConvertRun()

/** The real doc is there, unconverted. */
const REAL_OLD = REAL.names.includes("windows-and-review") && !REAL.isConverted("windows-and-review")

describe.skipIf(!REAL_OLD)("ConvertRun:  the real windows-and-review doc", () => {
  test("converts cleanly:  valid, the same ids, links and words", async () => {
    const [result] = await REAL.run({ names: ["windows-and-review"] })
    const { conversion } = result!
    expect(conversion!.problems).toEqual([])
    expect(conversion!.proof.ids.missing).toEqual([])
    expect(conversion!.proof.links).toMatchObject({ missing: [], added: [] })
    expect(conversion!.proof.text.units).toEqual([])
    expect(conversion!.proof.text.words).toBeGreaterThan(5000)
  })
})
