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

test("apply:  a sent pick on a judgement call's reply cards (I8) approves it with that option;  an old question pick too", async () => {
  const options = (letters: string[]) =>
    `<epic-choices>${letters.map((letter) => `<epic-option letter="${letter}" title="Option ${letter}"></epic-option>`).join("")}</epic-choices>`
  const plan = PlanDoc.parse(readFileSync(file, "utf8"))
  plan.setDetails("j1", `<p>weighed</p>${options(["A", "B"])}`)
  plan.setDetails("j1", `<epic-reply from="Claude" at="2026-10-07 09:00">${options(["A", "B", "C"])}</epic-reply>`, {
    append: true
  })
  plan.addItem("question", "which?", { details: `<p>why</p>${options(["A", "B"])}` })
  writeFileSync(file, plan.toString())
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setMark("j1", { action: "pick", pick: "C", choices: 1 }, T1)
    // a mark from before I8:  no card set, the question's own
    inbox.setMark("q1", { action: "pick", pick: "B" }, T1)
    inbox.markSent(T2)
  })
  await commands().inbox.run("x", file, ["apply"], {})
  const after = PlanDoc.parse(readFileSync(file, "utf8"))
  const j1 = after.findItem("j1")!
  expect(Array.from(j1.querySelectorAll("epic-choices"), (set) => set.getAttribute("chosen"))).toEqual([null, "C"])
  expect([
    j1.getAttribute("status"),
    j1.getAttribute("review-as"),
    j1.querySelector("epic-status")!.textContent
  ]).toEqual(["done", "approve", "Chose C · Option C"])
  expect(after.findItem("q1")!.querySelector("epic-choices")!.getAttribute("chosen")).toBe("B")
  expect(printed.join("\n")).toContain("J1  picked C:  Option C (a reply's options);  approved:  closed (accepted)")
  expect(ReviewInbox.read(inboxFile).isEmpty).toBe(true)
})

test("print:  the urgency waiting, by item, sent or not", async () => {
  ReviewInbox.update(inboxFile, (inbox) => inbox.setUrgency("j2", false, T1))
  await commands().inbox.run("x", file, [], {})
  expect(printed.join("\n")).toMatch(/urgency, from the id chips \(1\):\n {2}- J2 {2}follows WWOD {2}· urgent · unsent/)
})

test("apply:  a sent todo gets a status card born done, saying what was filed (Q19);  an approval none", async () => {
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setMark("j1", { action: "todo" }, T1)
    inbox.setMark("j2", { action: "approve" }, T1)
    inbox.markSent(T2)
  })
  await commands().inbox.run("x", file, ["apply"], {})
  const plan = PlanDoc.parse(readFileSync(file, "utf8"))
  const card = plan.findItem("j1")!.querySelector(':scope > epic-status[slot="status"]')!
  expect([card.getAttribute("state"), card.innerHTML]).toEqual([
    "done",
    '<p>Made todo <a href="#t1">T1</a> to follow this up.</p>'
  ])
  expect(plan.findItem("j2")!.querySelector("epic-status")).toBeNull()
})

test("done:  a Do Now request done is `review-as=now` (its button solid);  a revisit talked over, `revisit`", async () => {
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.requestNow("j1", "details", "", T1)
    inbox.setMark("j2", { action: "revisit", when: "soon", note: "why?" }, T1)
  })
  await commands().inbox.run("x", file, ["done", "j1"], {})
  await commands().inbox.run("x", file, ["clear", "j2"], {})
  const plan = PlanDoc.parse(readFileSync(file, "utf8"))
  expect([plan.findItem("j1")!.getAttribute("review-as"), plan.findItem("j2")!.getAttribute("review-as")]).toEqual([
    "now",
    "revisit"
  ])
})

test("status:  underway writes the card AND turns the page's spinner on;  done turns both;  done again is refused", async () => {
  const owner = commands()
  vi.spyOn(owner, "warn").mockImplementation(() => undefined)
  expect(await owner.run(["status", "x", "j1", "underway", "Weigh it, and answer here."])).toBe(0)
  expect(Object.keys(ReviewInbox.read(inboxFile).working)).toEqual(["j1"])
  // Claude is on it:  the item is `progress` (blue) until the card is done (Q20)
  const state = () => PlanDoc.parse(readFileSync(file, "utf8")).findItem("j1")!.getAttribute("state")
  expect(state()).toBe("progress")
  expect(await owner.run(["status", "x", "j1", "done", "Answered:  keep it."])).toBe(0)
  expect(state()).toBe("attention")
  const card = PlanDoc.parse(readFileSync(file, "utf8")).findItem("j1")!.querySelector("epic-status")!
  // as written to disk, formatted:  whitespace aside
  expect([card.getAttribute("state"), card.hasAttribute("done-at"), card.innerHTML.replace(/\s+/g, " ")]).toEqual([
    "done",
    true,
    '<p>Weigh it, and answer here.</p> <p slot="summary">Answered: keep it.</p>'
  ])
  expect(ReviewInbox.read(inboxFile).working).toEqual({})
  expect(await owner.run(["status", "x", "j1", "done"])).toBe(1)
  expect(await owner.run(["status", "x", "j2", "done", "--filed", "Chose B · Keep one file per template"])).toBe(0)
  const filed = PlanDoc.parse(readFileSync(file, "utf8")).findItem("j2")!.querySelector("epic-status")!
  expect([filed.getAttribute("state"), filed.hasAttribute("done-at"), filed.innerHTML]).toEqual([
    "done",
    false,
    "<p>Chose B · Keep one file per template</p>"
  ])
  expect(printed).toEqual(["J1 underway:  a real choice", "J1 done:  a real choice", "J2 done:  follows WWOD"])
  expect(await owner.run(["status", "x", "j1", "maybe"])).toBe(1)
})
