/**
 * Tests of `PlanDocCommands` (`spell dev plan-doc ...`) on a scratch checkout:  the command line itself, its flags,
 * output and log lines, on a doc written as a real one is (linked, formatted, split).
 */
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { afterAll, afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import { PlanDoc } from "./PlanDoc"
import { PlanDocCommands, movedDown } from "./PlanDocCommands"
import { PlanDocFiles } from "./PlanDocFiles"

/** The tool's test fixtures:  `epic-plan.html`, a fresh doc in `<epic-*>` markup. */
const FIXTURES = fileURLToPath(new URL("fixtures", import.meta.url))

const root = mkdtempSync(join(tmpdir(), "plan-doc-commands-"))
const file = join(root, "epics", "x", "x.plan.html")
const parts = join(root, "epics", "x", "parts")
const FILES = new PlanDocFiles({ root })

/** What the commands printed, on stdout and stderr. */
let printed: string[]
let warned: string[]

/** The commands, on the scratch checkout, their output caught in `printed` / `warned`. */
function commands() {
  const owner = new PlanDocCommands({ files: FILES })
  vi.spyOn(owner, "print").mockImplementation((text) => void printed.push(text))
  vi.spyOn(owner, "warn").mockImplementation((text) => void warned.push(text))
  return owner
}

beforeEach(async () => {
  printed = []
  warned = []
  rmSync(join(root, "epics"), { recursive: true, force: true })
  mkdirSync(join(root, "epics", "x"), { recursive: true })
  const plan = PlanDoc.parse(readFileSync(join(FIXTURES, "epic-plan.html"), "utf8"))
  for (const name of ["One", "Two", "Three"]) plan.addPhase(name, { goal: `<ul><li>${name}'s goal</li></ul>` })
  plan.setPhase(1, "done")
  await FILES.writeDoc(file, plan, true)
})

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe("PlanDocCommands add-phase --before", () => {
  test("inserts the phase, logs what moved, and each moved phase's part file follows its new id", async () => {
    expect(await commands().run(["add-phase", "x", "Inserted", "--before", "2"])).toBe(0)
    expect(printed).toEqual(["P2"])
    const plan = FILES.read(file)
    expect(plan.phases.map((phase) => `${phase.n} ${phase.name}`)).toEqual(["1 One", "2 Inserted", "3 Two", "4 Three"])
    const last = Array.from(plan.document.querySelectorAll("#log > epic-event")).at(-1)!
    // whitespace squeezed:  the written page's formatter folds the double spaces
    expect(last.textContent!.replace(/\s+/g, " ")).toBe("P2 added: Inserted; P2-P3 moved down to P3-P4")
    expect(movedDown(plan.phases, 3)).toBe("P3 · Three moved down to P4")
    // every old name taken by the phase that moved onto it:  nothing stale
    expect(
      readdirSync(parts)
        .filter((name) => /^p\d/.test(name))
        .sort()
    ).toEqual(["p1.html", "p2.html", "p3.html", "p4.html"])
    expect(readFileSync(join(parts, "p4.html"), "utf8")).toMatch(/#p4's body[\s\S]*Three's goal/)
    expect(readFileSync(join(parts, "p3.html"), "utf8")).toContain("Two's goal")
    expect(readFileSync(join(parts, "p2.html"), "utf8")).toContain("TBD")
    expect(readFileSync(file, "utf8")).toMatch(/<epic-phase\s+id="p4"\s+title="Three"[^>]*source="parts\/p4.html"/)
  })

  test("refuses a bare --before, one that isn't a number, or a started phase, writing nothing", async () => {
    const skeleton = readFileSync(file, "utf8")
    const owner = commands()
    expect(await owner.run(["add-phase", "x", "Y", "--before"])).toBe(1)
    expect(await owner.run(["add-phase", "x", "Y", "--before", "two"])).toBe(1)
    expect(await owner.run(["add-phase", "x", "Y", "--before", "1"])).toBe(1)
    expect(warned).toEqual([
      "plan-doc:  --before needs a phase number",
      'plan-doc:  --before needs a phase number, not "two"',
      "plan-doc:  --before 1:  P1 has started;  only to-do phases move down"
    ])
    expect(readFileSync(file, "utf8")).toBe(skeleton)
  })
})
