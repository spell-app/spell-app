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
    expect(readdirSync(join(out, "split", "parts")).sort()).toEqual(
      ["j1", "log", "o1", "o2", "p1", "p2", "q1", "q2", "q4"].map((id) => `${id}.htm`)
    )
    expect(readFileSync(join(out, "split", "split.plan.html"), "utf8")).toContain("<epic-page")
    // the docs themselves are untouched
    expect(readFileSync(join(root, "epics", "split", "split.plan.html"), "utf8")).toBe(
      readFileSync(join(FIXTURES, "split", "split.plan.html"), "utf8")
    )
  })

  test("a second run writes nothing new, and removes a part the doc no longer has", async () => {
    const root = checkout()
    const run = new ConvertRun({ root })
    const out = join(root, "preview")
    await run.run({ names: ["split"], out })
    writeFileSync(join(out, "split", "parts", "gone.htm"), "stale")
    const [again] = await run.run({ names: ["split"], out })
    expect(again!.written).toEqual([])
    expect(existsSync(join(out, "split", "parts", "gone.htm"))).toBe(false)
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

  test("an unknown doc is refused", async () => {
    await expect(new ConvertRun({ root: checkout() }).run({ names: ["nope"] })).rejects.toThrow(/no plan doc `nope`/)
  })
})

/** This checkout's real `windows-and-review` doc (the newest layout), when its `epics/` has it. */
const REAL = new ConvertRun()

describe.skipIf(!REAL.names.includes("windows-and-review"))("ConvertRun:  the real windows-and-review doc", () => {
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
