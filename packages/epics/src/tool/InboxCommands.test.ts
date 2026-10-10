/**
 * Tests of `InboxCommands` (`spell dev plan-doc inbox ...`) on a scratch checkout:
 * a plan doc in `<epic-*>` markup and its inbox file.
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
    // as written to disk, formatted:  whitespace squeezed
    j1.querySelector("epic-status")!.textContent!.replace(/\s+/g, " ").trim()
  ]).toEqual(["done", "approve", `Chose C · Option C: recorded, the call accepted; ${after.nextStepWords()}`])
  expect(after.findItem("q1")!.querySelector("epic-choices")!.getAttribute("chosen")).toBe("B")
  expect(printed.join("\n")).toContain("J1  picked C:  Option C (a reply's options);  approved:  closed (accepted)")
  expect(ReviewInbox.read(inboxFile).isEmpty).toBe(true)
})

test("print:  the urgency waiting, by item, sent or not", async () => {
  ReviewInbox.update(inboxFile, (inbox) => inbox.setUrgency("j2", false, T1))
  await commands().inbox.run("x", file, [], {})
  expect(printed.join("\n")).toMatch(/urgency, from the id chips \(1\):\n {2}- J2 {2}follows WWOD {2}· urgent · unsent/)
})

test("apply:  a sent todo gets a status card born NOTED, saying what was recorded (Q19);  an approval none", async () => {
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setMark("j1", { action: "todo" }, T1)
    inbox.setMark("j2", { action: "approve" }, T1)
    inbox.markSent(T2)
  })
  await commands().inbox.run("x", file, ["apply"], {})
  const plan = PlanDoc.parse(readFileSync(file, "utf8"))
  const card = plan.findItem("j1")!.querySelector(':scope > epic-status[slot="status"]')!
  expect([card.getAttribute("state"), card.innerHTML]).toEqual([
    "noted",
    '<p>Made todo <a href="#t1">T1</a> to follow this up.</p>'
  ])
  expect(plan.findItem("j2")!.querySelector("epic-status")).toBeNull()
})

test("apply:  a todo's plane queues it into the first phase still to do, with a Noted card;  its x cancels it", async () => {
  const plan = PlanDoc.parse(readFileSync(file, "utf8"))
  plan.addPhase("Bring It In")
  plan.addPhase("Fold Into Elements")
  plan.setPhase(1, "active")
  plan.addItem("todo", "tidy the routes")
  plan.addItem("todo", "an old idea")
  plan.updateStates()
  writeFileSync(file, plan.toString())
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setMark("t1", { action: "next", note: "after the merge" }, T1)
    inbox.setMark("t2", { action: "drop" }, T1)
    inbox.markSent(T2)
  })
  await commands().inbox.run("x", file, ["apply"], {})
  const after = PlanDoc.parse(readFileSync(file, "utf8"))
  const t1 = after.findItem("t1")!
  expect([t1.getAttribute("queued"), t1.getAttribute("work"), t1.getAttribute("review-as")]).toEqual([
    after.today,
    "P2 · Fold Into Elements",
    "next"
  ])
  const card = t1.querySelector(':scope > epic-status[slot="status"]')!
  expect([card.getAttribute("state"), card.textContent]).toEqual(["noted", "Queued for P2 · Fold Into Elements"])
  // Owen's note kept, as his reply
  expect(t1.querySelector('epic-reply[from="Owen"]')?.textContent).toBe("after the merge")
  const t2 = after.findItem("t2")!
  expect([t2.getAttribute("status"), t2.getAttribute("state"), t2.getAttribute("review-as")]).toEqual([
    "canceled",
    "old",
    "drop"
  ])
  const out = printed.join("\n")
  expect(out).toContain("T1  queued for P2 · Fold Into Elements")
  expect(out).toContain("T2  canceled:  dropped by Owen in review")
  expect(after.toString()).toMatch(/T2 canceled:\s+dropped by Owen in review/)
  expect(ReviewInbox.read(inboxFile).isEmpty).toBe(true)
})

test("apply:  a todo's plane with no phase still to do:  queued for the next phase, and it says so", async () => {
  const plan = PlanDoc.parse(readFileSync(file, "utf8"))
  plan.addItem("todo", "later")
  writeFileSync(file, plan.toString())
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setMark("t1", { action: "next" }, T1)
    inbox.markSent(T2)
  })
  await commands().inbox.run("x", file, ["apply"], {})
  const t1 = PlanDoc.parse(readFileSync(file, "utf8")).findItem("t1")!
  expect(t1.getAttribute("work")).toBe("the next phase")
  expect(t1.querySelector("epic-status")!.textContent).toMatch(
    /^Queued for the next phase:\s+there's no phase to do yet$/
  )
  expect(printed.join("\n")).toContain("T1  queued for the next phase (no phase to do yet)")
})

test("apply:  the note box's x (`skip`):  reviewed, nothing else, a note kept;  a todo dropped;  a phase noted", async () => {
  const plan = PlanDoc.parse(readFileSync(file, "utf8"))
  plan.addPhase("Bring It In")
  plan.addItem("question", "which way?")
  plan.addItem("todo", "an old idea")
  plan.updateStates()
  writeFileSync(file, plan.toString())
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setMark("j1", { action: "skip", note: "covered by P3" }, T1)
    inbox.setMark("q1", { action: "skip" }, T1)
    inbox.setMark("t1", { action: "skip" }, T1)
    inbox.setMark("p1", { action: "skip", note: "fine as planned" }, T1)
    inbox.markSent(T2)
  })
  await commands().inbox.run("x", file, ["apply"], {})
  const after = PlanDoc.parse(readFileSync(file, "utf8"))
  const facts = (id: string) => {
    const item = after.findItem(id)!
    return [item.getAttribute("status"), item.getAttribute("reviewed"), item.getAttribute("review-as")]
  }
  // still open (a skip settles nothing), reviewed, no status card
  expect(facts("j1")).toEqual(["open", after.today, "skip"])
  expect(facts("q1")).toEqual(["open", after.today, "skip"])
  expect(after.findItem("j1")!.querySelector("epic-status")).toBeNull()
  expect(after.findItem("j1")!.getAttribute("state")).not.toBe("attention")
  expect(after.findItem("j1")!.querySelector('epic-reply[from="Owen"][re="skip"]')?.textContent).toBe("covered by P3")
  // a todo:  skipping it IS dropping it
  expect(facts("t1")).toEqual(["canceled", after.today, "drop"])
  expect(after.document.getElementById("p1")!.querySelector('epic-reply[from="Owen"]')?.textContent).toBe(
    "fine as planned"
  )
  const out = printed.join("\n")
  expect(out).toContain("J1  skipped:  nothing to do, reviewed (his note kept)")
  expect(out).toContain("Q1  skipped:  nothing to do, reviewed")
  expect(out).toContain("T1  canceled:  dropped by Owen in review")
  expect(out).toContain("P1  skipped:  nothing to do (his note kept)")
  expect(ReviewInbox.read(inboxFile).isEmpty).toBe(true)
})

test("apply --all:  marks never sent are applied too, as if sent (`/airplane land`)", async () => {
  ReviewInbox.update(inboxFile, (inbox) => inbox.setMark("j1", { action: "todo" }, T1))
  await commands().inbox.run("x", file, ["apply"], {})
  expect(ReviewInbox.read(inboxFile).marks.j1).toBeDefined()
  await commands().inbox.run("x", file, ["apply"], { all: true })
  expect(ReviewInbox.read(inboxFile).marks.j1).toBeUndefined()
  expect(PlanDoc.parse(readFileSync(file, "utf8")).findItem("j1")!.querySelector("epic-status")).not.toBeNull()
})

test("done:  a Do Now request done is `review-as=now`;  a revisit talked over, `revisit`:  neither settles it (J10)", async () => {
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
  // answered, not settled:  neither turns green (only an approval or a todo does)
  expect(["j1", "j2"].map((id) => plan.findItem(id)!.getAttribute("state"))).not.toContain("recent")
})

test("done cm1 --file:  the answer goes on the comment's thread;  Owen's reply lists it as waiting again", async () => {
  const id = "cm1"
  ReviewInbox.update(inboxFile, (inbox) => void inbox.commentList.add({ anchor: "j1", kind: "item" }, "Why?"))
  const answer = join(root, "answer.html")
  writeFileSync(answer, "<p>Because.</p>\n")
  await commands().inbox.run("x", file, ["done", id], { file: answer, commit: "8c7e1d3" })
  expect(ReviewInbox.read(inboxFile).comments[id].replies).toEqual([
    { by: "Claude", at: expect.any(String), html: "<p>Because.</p>", commit: "8c7e1d3" }
  ])
  ReviewInbox.update(inboxFile, (inbox) => inbox.commentList.reply(id, "Say more"))
  await commands().inbox.run("x", file, [], {})
  expect(printed.join("\n")).toMatch(/CM1 {2}on j1 \(item\)[^\n]*\n {4}Owen replied:  "Say more"/)
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
  // `done --filed`, the older spelling:  a record, so NOTED (Owen, 2026-10-10)
  expect(await owner.run(["status", "x", "j2", "done", "--filed", "Chose B · Keep one file per template"])).toBe(0)
  const filed = PlanDoc.parse(readFileSync(file, "utf8")).findItem("j2")!.querySelector("epic-status")!
  expect([filed.getAttribute("state"), filed.hasAttribute("done-at"), filed.innerHTML]).toEqual([
    "noted",
    false,
    "<p>Chose B · Keep one file per template</p>"
  ])
  expect(printed).toEqual(["J1 underway:  a real choice", "J1 done:  a real choice", "J2 noted:  follows WWOD"])
  expect(await owner.run(["status", "x", "j1", "maybe"])).toBe(1)
})

test("status noted:  Claude only RECORDED Owen's choice -- an underway card turns noted, the spinner off", async () => {
  const owner = commands()
  vi.spyOn(owner, "warn").mockImplementation(() => undefined)
  expect(await owner.run(["status", "x", "j1", "underway", "Take the pick."])).toBe(0)
  expect(await owner.run(["status", "x", "j1", "noted", "Chose B:  waiting for the next phase"])).toBe(0)
  const card = PlanDoc.parse(readFileSync(file, "utf8")).findItem("j1")!.querySelector("epic-status")!
  expect([card.getAttribute("state"), card.hasAttribute("done-at"), card.innerHTML.replace(/\s+/g, " ")]).toEqual([
    "noted",
    true,
    '<p>Take the pick.</p> <p slot="summary">Chose B: waiting for the next phase</p>'
  ])
  expect(ReviewInbox.read(inboxFile).working).toEqual({})
  expect(await owner.run(["status", "x", "j2", "noted"])).toBe(1)
  expect(printed).toEqual(["J1 underway:  a real choice", "J1 noted:  a real choice"])
})

test("clear / done:  a pick riding on the mark (pick B, but ...) stays CHOSEN, with a Noted card;  logged", async () => {
  const plan = PlanDoc.parse(readFileSync(file, "utf8"))
  const options = `<epic-choices><epic-option letter="A" title="Option A"></epic-option><epic-option letter="B" title="Option B"></epic-option></epic-choices>`
  plan.setDetails("j1", `<p>weighed</p>${options}`)
  writeFileSync(file, plan.toString())
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setMark("j1", { action: "revisit", when: "soon", note: "B, but cheaper?", pick: "B" }, T1)
    inbox.markSent(T2)
  })
  await commands().inbox.run("x", file, ["clear", "j1"], {})
  const after = PlanDoc.parse(readFileSync(file, "utf8"))
  const j1 = after.findItem("j1")!
  expect(j1.querySelector("epic-choices")!.getAttribute("chosen")).toBe("B")
  expect(j1.querySelector('epic-status[state="noted"]')!.textContent).toMatch(/^Chose B · Option B:\s+recorded after/)
  expect(after.toString()).toMatch(/J1 picked B:\s+Option B \(kept from the revisit\)/)
  expect(ReviewInbox.read(inboxFile).isEmpty).toBe(true)
})

// epic `airplane` P2:  notes on the phases and the summary, and new items from the page

/** The scratch doc, with a phase:  `P1 · Offline Pages`. */
function withPhase() {
  const plan = PlanDoc.parse(readFileSync(file, "utf8"))
  plan.addPhase("Offline Pages")
  writeFileSync(file, plan.toString())
}

test("apply:  sent new items are made, a phase's and the summary's todos filed;  all leave the inbox;  unsent waits", async () => {
  withPhase()
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setNew(undefined, { kind: "question", title: "window or aisle?", note: "long flight", near: "p1" }, T1)
    inbox.setMark("p1", { action: "todo", note: "after the flight" }, T1)
    inbox.setMark("summary", { action: "todo" }, T1)
    inbox.markSent(T2)
    inbox.setNew(undefined, { kind: "todo", title: "not sent yet" }, T3)
  })
  await commands().inbox.run("x", file, ["apply"], {})
  expect(printed.join("\n")).toBe(
    ["NEW1  made question Q1:  window or aisle?", "P1  to todo T1", "SUMMARY  to todo T2"].join("\n")
  )
  const after = PlanDoc.parse(readFileSync(file, "utf8"))
  expect(after.findItem("q1")!.querySelector('a[href="#p1"]')).not.toBeNull()
  expect(after.findItem("q1")!.querySelector('epic-status[state="noted"]')).not.toBeNull()
  expect(after.findItem("t1")!.getAttribute("title")).toBe("Follow up:  P1 · Offline Pages")
  expect(after.findItem("t2")!.getAttribute("title")).toBe("Follow up:  the summary")
  expect(Object.keys(ReviewInbox.read(inboxFile).marks)).toEqual(["new2"])
})

test("print:  a new item by its kind and title, with its note and what it's about;  a phase's mark by its title", async () => {
  withPhase()
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setNew(undefined, { kind: "todo", title: "pack", note: "chargers", near: "j1" }, T1)
    inbox.setMark("p1", { action: "revisit", note: "too big?" }, T1)
  })
  await commands().inbox.run("x", file, [], {})
  const text = printed.join("\n")
  expect(text).toContain('new (1):\n  - NEW1  todo:  pack  · "chargers" · about J1 · unsent')
  expect(text).toContain('revisit (1):\n  - P1  Offline Pages  · soon · "too big?" · unsent')
})

test("clear:  a phase's note is kept as Owen's reply in the phase;  a new item's note is never a reply", async () => {
  withPhase()
  ReviewInbox.update(inboxFile, (inbox) => {
    inbox.setMark("p1", { action: "revisit", note: "too big?" }, T1)
    inbox.setNew(undefined, { kind: "todo", title: "pack", note: "chargers" }, T1)
  })
  await commands().inbox.run("x", file, ["clear", "p1", "new1"], {})
  const after = PlanDoc.parse(readFileSync(file, "utf8"))
  const replies = after.document.querySelectorAll("epic-reply")
  expect(Array.from(replies, (reply) => [reply.parentElement!.id, reply.textContent])).toEqual([["p1", "too big?"]])
  expect(ReviewInbox.read(inboxFile).isEmpty).toBe(true)
})
