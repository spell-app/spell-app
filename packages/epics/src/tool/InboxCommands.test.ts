/**
 * Tests of `InboxCommands` (`spell dev plan-doc inbox ...`) on a scratch checkout:  a plan doc in `<epic-*>` markup
 * and its inbox file.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { afterAll, afterEach, beforeEach, expect, test, vi } from "vite-plus/test"

import { PlanDoc } from "./PlanDoc"
import { PlanDocCommands } from "./PlanDocCommands"
import { PlanDocFiles } from "./PlanDocFiles"
import { ReviewInbox } from "./ReviewInbox"

/** The tool's test fixtures:  `epic-plan.html`, a fresh doc in `<epic-*>` markup. */
const FIXTURES = fileURLToPath(new URL("fixtures", import.meta.url))

const T1 = "2026-10-07T10:00:00.000-04:00"
const T2 = "2026-10-07T10:01:00.000-04:00"
const T3 = "2026-10-07T10:02:00.000-04:00"

const root = mkdtempSync(join(tmpdir(), "inbox-commands-"))
const file = join(root, "epics", "x", "x.plan.html")
const inboxFile = ReviewInbox.pathFor(file)

/** What the commands printed. */
let printed: string[]

/** The commands, on the scratch checkout, their output caught in `printed`. */
function commands() {
  const owner = new PlanDocCommands({ files: new PlanDocFiles({ root }) })
  vi.spyOn(owner, "print").mockImplementation((text) => void printed.push(text))
  return owner
}

beforeEach(() => {
  printed = []
  mkdirSync(join(root, "epics", "x"), { recursive: true })
  const plan = PlanDoc.parse(readFileSync(join(FIXTURES, "epic-plan.html"), "utf8"))
  plan.addItem("judgement", "a real choice")
  plan.addItem("judgement", "follows WWOD", { calm: true })
  plan.updateStates()
  writeFileSync(file, plan.toString())
  rmSync(inboxFile, { force: true })
})

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

test("apply:  the SENT urgency from the id chips goes into the doc, logged, and leaves the inbox;  unsent waits", async () => {
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setUrgency("j1", true, T1)
    inbox.setUrgency("j2", false, T1)
    inbox.markSent(T2)
    inbox.setUrgency("j1", false, T3)
  })
  // j1 changed after the send:  not applied, kept
  await commands().inbox.run("x", file, ["apply"], {})
  const plan = PlanDoc.parse(readFileSync(file, "utf8"))
  expect([plan.findItem("j1")!.hasAttribute("calm"), plan.findItem("j2")!.hasAttribute("calm")]).toEqual([false, false])
  expect([plan.findItem("j1")!.getAttribute("state"), plan.findItem("j2")!.getAttribute("state")]).toEqual([
    "attention",
    "attention"
  ])
  expect(printed.join("\n")).toContain("J2  marked urgent")
  expect(Object.keys(ReviewInbox.read(inboxFile).urgency)).toEqual(["j1"])
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setUrgency("j1", true, T3)
    inbox.markSent(T3)
  })
  await commands().inbox.run("x", file, ["apply"], {})
  expect(PlanDoc.parse(readFileSync(file, "utf8")).findItem("j1")!.getAttribute("state")).toBe("open")
  expect(ReviewInbox.read(inboxFile).isEmpty).toBe(true)
})

test("print:  the urgency waiting, by item, sent or not", async () => {
  ReviewInbox.update(inboxFile, (inbox) => inbox.setUrgency("j2", false, T1))
  await commands().inbox.run("x", file, [], {})
  expect(printed.join("\n")).toMatch(/urgency, from the id chips \(1\):\n {2}- J2 {2}follows WWOD {2}· urgent · unsent/)
})
