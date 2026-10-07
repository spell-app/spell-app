import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, test } from "vite-plus/test"

import { Markup } from "$/epics/markup"

import { PlanDocError } from "./planDoc.types"

import { ItemPicker } from "./ItemPicker"
import { OldPlanReader } from "./OldPlanReader"
import { PlanCommits } from "./PlanCommits"
import { PlanDoc } from "./PlanDoc"
import { PlanItem } from "./PlanItem"
import { PlanTime } from "./PlanTime"

/**
 * The plan docs these tests read, tracked beside them (`fixtures/`):  `epic-plan.html`, a new doc in `<epic-*>` markup
 * (the tool's template, filled in), and `plan.html`, a doc in the OLD markup for `OldPlanReader`.
 */
const FIXTURES = fileURLToPath(new URL("fixtures", import.meta.url))

/** When the tests' edits happen:  local 2026-10-01 09:05. */
const NOW = new Date(2026, 9, 1, 9, 5)

/** A fresh plan doc in `<epic-*>` markup. */
function freshPlan(now = NOW) {
  return PlanDoc.parse(readFileSync(join(FIXTURES, "epic-plan.html"), "utf8"), now)
}

/** Element `id` of `plan`. */
function el(plan: PlanDoc, id: string) {
  return plan.document.getElementById(id)!
}

/** The tags (or `field:name`) of `element`'s children, slotted ones left out. */
function kids(element: Element) {
  return Array.from(element.children)
    .filter((child) => !child.hasAttribute("slot"))
    .map((child) => (child.localName === "epic-field" ? `field:${child.getAttribute("name")}` : child.localName))
}

/** What `Markup.validate()` finds in `plan`, one line each:  none, after every edit. */
function problems(plan: PlanDoc) {
  return Markup.validate(plan.document).map((problem) => `${problem.where} ${problem.message}`)
}

////////////////
// ## The page
////////////////

describe("PlanDoc page", () => {
  test("reads the page's data:  title, phases, future, bedtime;  the template is valid markup", () => {
    const plan = freshPlan()
    expect([plan.markup, plan.title, plan.phases, plan.future, plan.bedtimeRun]).toEqual([
      "epic",
      "Demo Plan",
      [],
      false,
      null
    ])
    expect(Array.from(plan.page.children, (child) => child.getAttribute("kind") ?? child.localName)).toEqual([
      "epic-overview",
      "phases",
      "questions",
      "judgements",
      "caveats",
      "todos",
      "issues",
      "tests",
      "log"
    ])
    expect(problems(plan)).toEqual([])
    expect(plan.check()).toEqual([])
  })

  test("touch stamps updated;  the whole-doc pass writes recent-since:  a time sets it, null removes it", () => {
    const plan = PlanDoc.parse(freshPlan().toString(), NOW, { recentSince: "2026-10-03T21:14:02-04:00" })
    plan.touch()
    plan.updateStates()
    expect([plan.page.getAttribute("updated"), plan.page.getAttribute("recent-since")]).toEqual([
      "2026-10-01",
      "2026-10-03T21:14:02-04:00"
    ])
    const kept = PlanDoc.parse(plan.toString(), NOW)
    kept.updateStates()
    expect(kept.page.getAttribute("recent-since")).toBe("2026-10-03T21:14:02-04:00")
    const none = PlanDoc.parse(plan.toString(), NOW, { recentSince: null })
    none.updateStates()
    expect(none.page.hasAttribute("recent-since")).toBe(false)
  })

  test("writes bare booleans, a lowercase doctype, attributes in the vocabulary's order, & escaped (I2)", () => {
    const plan = freshPlan()
    plan.addItem("decision", "A &lt; B & C")
    const html = plan.toString()
    expect(html.startsWith("<!doctype html>")).toBe(true)
    expect(html).toContain('<epic-item id="q1" title="A &amp;lt; B &amp; C" status="decided"')
    expect(html).toMatch(/ answered[ >]/)
    expect(PlanDoc.parse(html).items("question")[0]!.title).toBe("A &lt; B & C")
    // the document itself is left as it was
    expect(el(plan, "q1").getAttribute("title")).toBe("A &lt; B & C")
  })
})

////////////////
// ## Phases
////////////////

describe("PlanDoc phases", () => {
  test("adds <epic-phase>s in order, todo, the title without its id;  the older shape:  Goal, Files, Verify", () => {
    const plan = freshPlan()
    expect(plan.addPhase("Docs Workspace")).toBe(1)
    expect(plan.addPhase("Runtime + Index", { goal: "sidebar from headings" })).toBe(2)
    expect(plan.phases).toEqual([
      { n: 1, name: "Docs Workspace", status: "todo", estimate: undefined },
      { n: 2, name: "Runtime + Index", status: "todo", estimate: undefined }
    ])
    expect(Markup.read(el(plan, "p2"))).toEqual({ id: "p2", title: "Runtime + Index", status: "todo" })
    expect(kids(el(plan, "p2"))).toEqual(["field:goal", "field:files", "field:verify"])
    expect(el(plan, "p1").querySelector('[name="goal"]')!.textContent).toBe("TBD")
    expect(problems(plan)).toEqual([])
  })

  test("framed:  Symptom, Changes, then the details;  the goal optional", () => {
    const plan = freshPlan()
    plan.addPhase("One", { symptom: "notes get lost", changes: "saved as typed" })
    expect(kids(el(plan, "p1"))).toEqual(["field:symptom", "field:changes", "field:files", "field:verify"])
    plan.addPhase("Two", { symptom: "x", goal: "<ul><li>g</li></ul>" })
    expect(kids(el(plan, "p2"))).toEqual([
      "field:symptom",
      "field:changes",
      "field:goal",
      "field:files",
      "field:verify"
    ])
    expect(el(plan, "p2").querySelector('[name="changes"]')!.textContent).toBe("TBD")
  })

  test("phase-body:  each field in its place, replaced, removed with ''", () => {
    const plan = freshPlan()
    plan.addPhase("One", { goal: "g" })
    expect(plan.setPhaseFields(1, { changes: "c", symptom: "s" })).toEqual(["Symptom", "Changes"])
    expect(kids(el(plan, "p1"))).toEqual([
      "field:symptom",
      "field:changes",
      "field:goal",
      "field:files",
      "field:verify"
    ])
    plan.setPhaseFields(1, { symptom: "s2", goal: "" })
    expect(kids(el(plan, "p1"))).toEqual(["field:symptom", "field:changes", "field:files", "field:verify"])
    expect(el(plan, "p1").querySelector('[name="symptom"]')!.innerHTML).toBe("s2")
    expect(problems(plan)).toEqual([])
  })

  test("status:  set, logged;  a bad one throws;  done writes Done after the Goal, replacing an earlier one", () => {
    const plan = freshPlan()
    plan.addPhase("One", { goal: "<ul><li>a goal</li></ul>" })
    plan.setPhase(1, "active")
    expect(plan.activePhase).toBe(1)
    expect(el(plan, "p1").getAttribute("status")).toBe("active")
    const last = Array.from(plan.document.querySelectorAll("#log > epic-event")).at(-1)!
    expect([last.getAttribute("at"), last.textContent]).toEqual([PlanTime.isoMinutes(NOW), "P1 active"])
    expect(last.getAttribute("at")).toMatch(/^2026-10-01T09:05[+-]\d\d:\d\d$/)
    expect(() => plan.setPhase(1, "finished")).toThrow(PlanDocError)
    plan.setPhase(1, "done", { done: "<ul><li>built it</li></ul>" })
    expect(kids(el(plan, "p1"))).toEqual(["field:goal", "field:done", "field:files", "field:verify"])
    plan.setDone(1, "<ul><li>built it again</li></ul>")
    expect(el(plan, "p1").querySelectorAll('[name="done"]').length).toBe(1)
    expect(el(plan, "p1").querySelector('[name="done"]')!.textContent).toBe("built it again")
  })

  test("estimates:  the phase's attribute, totalled in the Overview, what's left;  none without one", () => {
    const plan = freshPlan()
    const total = () => plan.overview.getAttribute("estimate")
    plan.addPhase("One", { estimate: "1h" })
    expect([plan.phases[0]!.estimate, total()]).toEqual(["1h", "1h in all, 1h left"])
    plan.addPhase("Two", { estimate: "30m-1h" })
    plan.addPhase("Three")
    expect(total()).toBe("1h 30m-2h in all, 1h 30m-2h left (P3 not estimated)")
    plan.setPhase(1, "done")
    expect(total()).toBe("1h 30m-2h in all, 30m-1h left (P3 not estimated)")
    plan.setEstimate(3, "15m")
    expect(total()).toBe("1h 45m-2h 15m in all, 45m-1h 15m left")
    expect(plan.summary().estimate).toBe("1h 45m-2h 15m in all, 45m-1h 15m left")
    expect(() => plan.setEstimate(9, "1h")).toThrow(PlanDocError)
    const bare = freshPlan()
    bare.addPhase("One")
    expect(bare.overview.hasAttribute("estimate")).toBe(false)
  })

  test("parses hours, minutes and ranges", () => {
    expect(PlanTime.parseDuration("30m")).toEqual({ min: 30, max: 30 })
    expect(PlanTime.parseDuration("45 min")).toEqual({ min: 45, max: 45 })
    expect(PlanTime.parseDuration("~1.5h")).toEqual({ min: 90, max: 90 })
    expect(PlanTime.parseDuration("1h30m")).toEqual({ min: 90, max: 90 })
    expect(PlanTime.parseDuration("1-2h")).toEqual({ min: 60, max: 120 })
    expect(PlanTime.parseDuration("30m-1h")).toEqual({ min: 30, max: 60 })
    for (const bad of [undefined, "", "TBD", "a day", "2 hours-ish", "1h-2h-3h"])
      expect(PlanTime.parseDuration(bad)).toBeUndefined()
  })

  test("updated:  dated <epic-updated> lines under Symptom / Changes, in order, kept when done", () => {
    const plan = freshPlan()
    plan.addPhase("One", { symptom: "s", changes: "c" })
    plan.addPhase("Two", { symptom: "s", changes: "c" })
    plan.setPhase(1, "active")
    plan.addPhaseUpdate(2, "<p>Make Todo dropped (Owen)</p>")
    plan.addPhaseUpdate(2, "split in two")
    expect(kids(el(plan, "p2"))).toEqual([
      "field:symptom",
      "field:changes",
      "epic-updated",
      "epic-updated",
      "field:files",
      "field:verify"
    ])
    const lines = Array.from(el(plan, "p2").querySelectorAll("epic-updated"), (line) => Markup.read(line))
    expect(lines).toEqual([
      { at: "2026-10-01 09:05", phase: 1 },
      { at: "2026-10-01 09:05", phase: 1 }
    ])
    plan.setPhase(2, "done")
    expect(el(plan, "p2").querySelectorAll("epic-updated").length).toBe(2)
    expect(problems(plan)).toEqual([])
  })

  test("UPDATE markers:  in an item's title while a phase is active;  done removes that phase's, the title back", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.addPhase("Two")
    plan.addItem("todo", "before")
    plan.setPhase(1, "active")
    plan.addItem("issue", "found in P1")
    expect(el(plan, "t1").querySelector("epic-update")).toBeNull()
    const slot = el(plan, "i1").querySelector(':scope > [slot="title"]')!
    expect(slot.innerHTML).toBe('found in P1 <epic-update phase="1"></epic-update>')
    expect([el(plan, "i1").hasAttribute("title"), PlanItem.titleOf(el(plan, "i1"))]).toEqual([false, "found in P1"])
    expect(plan.updateMarkers(1)).toHaveLength(1)
    plan.setPhase(1, "done")
    plan.setPhase(2, "active")
    plan.addItem("caveat", "found in P2")
    expect(plan.updateMarkers(1)).toHaveLength(0)
    expect(plan.updateMarkers(2)).toHaveLength(1)
    expect([el(plan, "i1").getAttribute("title"), el(plan, "i1").querySelector('[slot="title"]')]).toEqual([
      "found in P1",
      null
    ])
    expect(problems(plan)).toEqual([])
  })
})

////////////////
// ## Items
////////////////

describe("PlanDoc items", () => {
  test("numbers items per kind, each <epic-item> in its kind's section", () => {
    const plan = freshPlan()
    expect(plan.addItem("caveat", "first")).toBe("c1")
    expect(plan.addItem("caveat", "second", { details: "<p>why</p>" })).toBe("c2")
    expect(plan.addItem("issue", "an issue")).toBe("i1")
    expect(plan.addItem("test", "click it")).toBe("v1")
    expect(plan.addItem("judgement", "chose x")).toBe("j1")
    expect(Markup.read(el(plan, "c1"))).toEqual({
      id: "c1",
      title: "first",
      status: "open",
      changed: PlanTime.isoTime(NOW)
    })
    expect(el(plan, "c2").innerHTML).toBe("<p>why</p>")
    for (const [id, section] of [
      ["c1", "caveats"],
      ["i1", "issues"],
      ["v1", "tests"],
      ["j1", "judgements"]
    ])
      expect(el(plan, id).parentElement!.id).toBe(section)
    expect(() => plan.addItem("bug", "x")).toThrow(PlanDocError)
    expect(problems(plan)).toEqual([])
  })

  test("titles:  text in `title`, escaped once;  a title given as HTML with markup is a slot", () => {
    const plan = freshPlan()
    plan.addItem("todo", "use <ui-alert> & friends")
    expect(PlanItem.titleOf(el(plan, "t1"))).toBe("use <ui-alert> & friends")
    plan.addItem("todo", "the <code>x</code> API", { titleHTML: true })
    expect(el(plan, "t2").querySelector(':scope > span[slot="title"]')!.innerHTML).toBe("the <code>x</code> API")
    expect(plan.items("todo")[1]).toEqual({ id: "t2", title: "the x API", status: "open" })
    plan.addItem("todo", "a &amp; b", { titleHTML: true })
    expect(el(plan, "t3").getAttribute("title")).toBe("a & b")
  })

  test("closes and reopens, keeping the item;  a judgement call stays open until closed", () => {
    const plan = freshPlan()
    plan.addItem("issue", "flaky")
    expect(plan.setItem("I1", "done")).toBe("flaky")
    expect(plan.items("issue")).toEqual([{ id: "i1", title: "flaky", status: "done" }])
    plan.setItem("i1", "open")
    expect(plan.items("issue")[0]!.status).toBe("open")
    expect(() => plan.setItem("i9", "done")).toThrow(PlanDocError)
    expect(() => plan.setItem("i1", "gone")).toThrow(PlanDocError)
    plan.addItem("judgement", "nav starts on Topics")
    expect(plan.summary().open.judgement.map((open) => open.id)).toEqual(["j1"])
    plan.setItem("j1", "done")
    expect(plan.summary().open.judgement).toEqual([])
  })

  test("cancel:  canceled, closed;  reopen undoes it", () => {
    const plan = freshPlan()
    plan.addItem("todo", "moot")
    plan.setItem("t1", "canceled")
    expect(plan.items("todo")[0]!.status).toBe("canceled")
    expect(plan.summary().open.todo).toEqual([])
    plan.setItem("t1", "open")
    expect(plan.items("todo")[0]!.status).toBe("open")
  })
})

describe("PlanDoc questions and decisions", () => {
  /** `id:status` of every question, in order. */
  function order(plan: PlanDoc) {
    return Array.from(plan.findSection("questions")!.children, (item) => `${item.id}:${item.getAttribute("status")}`)
  }

  /** Option cards A and B (B recommended), as an agent writes them for the old markup. */
  const GRID =
    '<ui-grid class="spell-pros-cons" columns="2" stackable>' +
    '<ui-column><ui-segment><ui-label attached="top">A · Keep folds</ui-label><p>a</p></ui-segment></ui-column>' +
    '<ui-column><ui-segment><ui-label attached="top">B · Unfold <code>it</code> (recommended)</ui-label><p>b</p></ui-segment></ui-column>' +
    "</ui-grid>"

  test("one section (D13):  open questions on top, then the answered ones in id order;  a decision is born answered", () => {
    const plan = freshPlan()
    expect(plan.addItem("decision", "first")).toBe("q1")
    plan.addItem("question", "which?")
    plan.addItem("decision", "second")
    plan.addItem("question", "and?")
    expect(order(plan)).toEqual(["q2:open", "q4:open", "q1:decided", "q3:decided"])
    expect(el(plan, "q1").hasAttribute("answered")).toBe(true)
    expect(plan.summary().open.question.map((item) => item.id)).toEqual(["q2", "q4"])
  })

  test("decide:  an <epic-answer> INTO the question, after its text;  it keeps its title and moves", () => {
    const plan = freshPlan()
    plan.addItem("question", "which browser?", { details: "<p>the options</p>" })
    plan.addItem("question", "later?")
    plan.addItem("decision", "earlier")
    expect(plan.decide("Q1", "Chrome first", { details: "<p>most readers</p>" })).toBe("q1")
    expect(order(plan)).toEqual(["q2:open", "q1:decided", "q3:decided"])
    const question = el(plan, "q1")
    expect([question.getAttribute("title"), question.hasAttribute("answered")]).toEqual(["which browser?", true])
    expect(question.innerHTML).toBe(
      '<p>the options</p><epic-answer title="Chrome first"><p>most readers</p></epic-answer>'
    )
    plan.decide("q2", "not now")
    expect(el(plan, "q2").innerHTML).toBe('<epic-answer title="not now"></epic-answer>')
    // answering again replaces the answer;  the old one goes into the Original Discussion (I7), as prose
    plan.decide("q2", "maybe later")
    expect(kids(el(plan, "q2"))).toEqual(["epic-answer", "epic-original"])
    expect(el(plan, "q2").querySelector("epic-answer")!.getAttribute("title")).toBe("maybe later")
    expect(el(plan, "q2").querySelector("epic-version")!.textContent).toBe("Answer · not now")
    // the same answer again:  nothing more kept
    plan.decide("q2", "maybe later")
    expect(el(plan, "q2").querySelectorAll("epic-version").length).toBe(1)
    plan.addItem("caveat", "x")
    expect(() => plan.decide("c1", "nope")).toThrow(PlanDocError)
    expect(problems(plan)).toEqual([])
    expect(plan.check()).toEqual([])
  })

  test("an agent's old option grid comes in as <epic-choices>;  decide --option marks the chosen one", () => {
    const plan = freshPlan()
    plan.addItem("question", "which way?", { details: `<p>why</p>${GRID}` })
    expect(kids(el(plan, "q1"))).toEqual(["p", "epic-choices"])
    const options = Array.from(el(plan, "q1").querySelectorAll("epic-option"), (option) => Markup.read(option))
    expect(options).toEqual([
      { letter: "A", title: "Keep folds" },
      { letter: "B", recommended: true }
    ])
    expect(el(plan, "q1").querySelector('epic-option[letter="B"] > [slot="title"]')!.innerHTML).toBe(
      "Unfold <code>it</code>"
    )
    expect(plan.optionCards(plan.item("q1"))).toEqual([
      { letter: "A", title: "Keep folds", recommended: false },
      { letter: "B", title: "Unfold it", recommended: true }
    ])
    plan.decide("q1", "way B", { option: "b" })
    expect(el(plan, "q1").querySelector("epic-choices")!.getAttribute("chosen")).toBe("B")
    expect(kids(el(plan, "q1"))).toEqual(["p", "epic-choices", "epic-answer"])
    plan.decide("q1", "way A", { option: "A" })
    expect(el(plan, "q1").querySelector("epic-choices")!.getAttribute("chosen")).toBe("A")
    expect(() => plan.decide("q1", "way C", { option: "C" })).toThrow(PlanDocError)
    expect(problems(plan)).toEqual([])
  })

  test("closing an answered question supersedes it;  reopening puts it back in force;  an unanswered one reopens open", () => {
    const plan = freshPlan()
    plan.addItem("decision", "one")
    plan.addItem("question", "two?")
    plan.setItem("q1", "done")
    plan.setItem("q2", "done")
    expect(order(plan)).toEqual(["q1:done", "q2:done"])
    plan.setItem("q1", "open")
    plan.setItem("q2", "open")
    expect(order(plan)).toEqual(["q2:open", "q1:decided"])
  })

  test("an old decision's id on an answer (d7) finds its question, and stays on a new answer", () => {
    const plan = freshPlan()
    plan.addItem("question", "which?")
    plan.decide("q1", "this")
    Markup.set(el(plan, "q1").querySelector("epic-answer")!, { id: "d7" })
    expect(plan.item("D7").id).toBe("q1")
    plan.decide("q1", "that")
    expect(el(plan, "q1").querySelector(":scope > epic-answer")!.id).toBe("d7")
    expect(plan.document.querySelectorAll("#d7").length).toBe(1)
    expect(el(plan, "q1").querySelector("epic-version")!.textContent).toBe("D7 · this")
    plan.setItem("d7", "done")
    expect(el(plan, "q1").getAttribute("status")).toBe("done")
    expect(plan.check()).toEqual([])
  })
})

////////////////
// ## States and review
////////////////

describe("PlanDoc states", () => {
  /** `state` of each item id, after the whole-doc pass. */
  function stateOf(plan: PlanDoc, ...ids: string[]) {
    plan.updateStates()
    return ids.map((id) => el(plan, id).getAttribute("state"))
  }

  test("stamps every change:  changed (ISO local time);  bedtime during a /bedtime run, until reviewed", () => {
    const plan = freshPlan()
    const stamp = PlanTime.isoTime(NOW)
    expect(stamp).toMatch(/^2026-10-01T09:05:00[+-]\d\d:\d\d$/)
    plan.addItem("issue", "one")
    plan.addItem("question", "two?")
    const changed = (id: string) => el(plan, id).getAttribute("changed")
    for (const id of ["i1", "q1"]) el(plan, id).removeAttribute("changed")
    plan.setItem("i1", "done")
    plan.decide("q1", "yes")
    expect([changed("i1"), changed("q1")]).toEqual([stamp, stamp])
    plan.startBedtime("P1")
    plan.addItem("todo", "overnight")
    plan.defer("i1")
    const bedtime = (id: string) => el(plan, id).hasAttribute("bedtime")
    expect([bedtime("t1"), bedtime("i1"), bedtime("q1")]).toEqual([true, true, false])
    plan.review("t1")
    plan.queue("i1", "fix it")
    expect([bedtime("t1"), bedtime("i1")]).toEqual([false, false])
    // a backfilled review is stamped that day, not now
    plan.review("q1", { date: "2026-09-20" })
    expect(changed("q1")).toBe(PlanTime.isoTime(new Date(2026, 8, 20)))
  })

  test("colours items:  attention, progress, open, recent, old", () => {
    const plan = freshPlan()
    Markup.set(plan.page, { recentSince: PlanTime.isoTime(new Date(2026, 8, 30)) })
    plan.addItem("question", "open?")
    plan.addItem("judgement", "chose x")
    plan.addItem("judgement", "chose y")
    plan.addItem("issue", "bug")
    plan.addItem("issue", "fixed long ago")
    plan.addItem("caveat", "limit")
    plan.addItem("todo", "later")
    plan.addItem("test", "click it")
    plan.addItem("decision", "settled")
    plan.review("j2")
    plan.queue("i1", "fix it")
    plan.setItem("i2", "done")
    el(plan, "i2").setAttribute("changed", PlanTime.isoTime(new Date(2026, 8, 1)))
    Markup.set(el(plan, "t1"), { working: true })
    expect(stateOf(plan, "q1", "j1", "j2", "i1", "i2", "c1", "t1", "v1", "q2")).toEqual([
      "attention",
      "attention",
      "recent",
      "progress",
      "old",
      "open",
      "progress",
      "open",
      "recent"
    ])
    Markup.set(plan.page, { recentSince: PlanTime.isoTime(new Date(2026, 9, 2)) })
    expect(stateOf(plan, "j2", "q2")).toEqual(["open", "old"])
    // no git history:  only a /bedtime run makes green
    Markup.set(plan.page, { recentSince: undefined })
    Markup.set<"epic-item">(el(plan, "q2"), { bedtime: true })
    expect(stateOf(plan, "q2", "c1")).toEqual(["recent", "open"])
    expect(problems(plan)).toEqual([])
  })

  test("items added while a phase is active carry it;  each phase ends with what it raised that isn't reviewed", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.addPhase("Two")
    plan.addItem("todo", "before any phase")
    plan.setPhase(1, "active")
    plan.addItem("issue", "reviewed")
    plan.addItem("judgement", "a call")
    plan.addItem("caveat", "a limit")
    plan.addItem("todo", "closed")
    plan.addItem("question", "which?")
    plan.addItem("todo", "queued")
    plan.review("i1")
    plan.setItem("t2", "done")
    plan.queue("t3", "do it")
    expect(["t1", "i1", "q1"].map((id) => el(plan, id).getAttribute("phase"))).toEqual([null, "1", "1"])
    plan.updateStates()
    const line = el(plan, "p1").querySelector(':scope > epic-field[name="to-review"]')!
    expect(line.innerHTML).toBe('<a href="#q1">Q1</a>, <a href="#j1">J1</a>, <a href="#c1">C1</a>')
    expect(line.nextElementSibling).toBe(null)
    expect(el(plan, "p2").querySelector('[name="to-review"]')).toBe(null)
    for (const id of ["q1", "j1", "c1"]) plan.review(id)
    plan.updateStates()
    expect(el(plan, "p1").querySelector('[name="to-review"]')).toBe(null)
    expect(problems(plan)).toEqual([])
  })
})

describe("PlanDoc review", () => {
  /** States of `kind`'s section, by id, under `filter`. */
  function states(plan: PlanDoc, kind: string, filter?: string) {
    const section = plan.reviewSections({ filter }).find((s) => s.kind === kind)!
    return Object.fromEntries(section.items.map((item) => [item.id, item.state]))
  }

  test("marks reviewed, deferred and to do, as attributes (the element draws the label)", () => {
    const plan = freshPlan()
    for (const title of ["one", "two", "three", "four"]) plan.addItem("issue", title, { details: "<p>x</p>" })
    expect(plan.review("I1")).toBe("one")
    plan.defer("i2")
    plan.queue("i3", "fix it")
    expect(states(plan, "issue", "all")).toEqual({ I1: "reviewed", I2: "deferred", I3: "queued", I4: "outstanding" })
    expect(Markup.read(el(plan, "i3"))).toMatchObject({ queued: "2026-10-01", work: "fix it", reviewed: "2026-10-01" })
    plan.review("i2")
    expect(el(plan, "i2").hasAttribute("deferred")).toBe(false)
    plan.unqueue("i3")
    expect(states(plan, "issue", "all")).toMatchObject({ I3: "reviewed" })
    expect(el(plan, "i3").hasAttribute("work")).toBe(false)
  })

  test("counts closed, decided, and items a decision links to as reviewed;  not from its Original Discussion", () => {
    const plan = freshPlan()
    plan.addItem("caveat", "linked")
    plan.addItem("caveat", "struck")
    plan.addItem("caveat", "neither")
    plan.setItem("c2", "done")
    plan.addItem("decision", "accept it", { details: '<p>see <a href="#c1">C1</a></p>' })
    expect(states(plan, "caveat", "all")).toEqual({ C1: "reviewed", C2: "reviewed", C3: "outstanding" })
    plan.setDetails("q1", "<p>nothing linked now</p>")
    expect(states(plan, "caveat", "all")).toEqual({ C1: "outstanding", C2: "reviewed", C3: "outstanding" })
  })

  test("filters:  unreviewed (default), open, reviewed, queued;  counts what isn't reviewed", () => {
    const plan = freshPlan()
    for (const title of ["a", "b", "c", "d"]) plan.addItem("todo", title)
    plan.review("t1")
    plan.defer("t2")
    plan.queue("t3", "build it")
    plan.setItem("t1", "done")
    const ids = (filter?: string) => Object.keys(states(plan, "todo", filter))
    expect(ids()).toEqual(["T2", "T4"])
    expect(ids("open")).toEqual(["T2", "T3", "T4"])
    expect(ids("reviewed")).toEqual(["T1", "T3"])
    expect(ids("queued")).toEqual(["T3"])
    const todos = plan.reviewSections().find((s) => s.kind === "todo")!
    expect([todos.notReviewed, todos.total]).toEqual([2, 4])
    expect(() => plan.reviewSections({ filter: "nope" })).toThrow(PlanDocError)
  })

  test("sections in page order;  Questions holds the Q items, open and answered", () => {
    const plan = freshPlan()
    plan.addItem("question", "which?")
    plan.decide("q1", "this one")
    plan.addItem("question", "and?")
    const sections = plan.reviewSections({ filter: "all" })
    expect(sections.map((s) => s.label)).toEqual([
      "Questions",
      "Judgement calls",
      "Caveats",
      "Todos",
      "Issues",
      "To test"
    ])
    expect(sections[0]!.items.map((item) => [item.id, item.state])).toEqual([
      ["Q2", "outstanding"],
      ["Q1", "reviewed"]
    ])
  })

  test("the recommendation:  the recommended option, else a label, then a bold lead, never a table cell", () => {
    const plan = freshPlan()
    plan.addItem("question", "cards", {
      details:
        '<epic-choices><epic-option letter="A" title="Mark + links" recommended></epic-option>' +
        '<epic-option letter="B" title="Other"></epic-option></epic-choices>'
    })
    plan.addItem("question", "bold", {
      details:
        "<table><tr><td>yes (recommended)</td></tr></table><p><b>Skip short sections (recommended)</b>:  cheap</p>"
    })
    plan.addItem("question", "none", { details: "<p>no idea yet</p>" })
    plan.addItem("question", "bare")
    const items = plan.reviewSections().find((s) => s.kind === "question")!.items
    expect(items.map((item) => item.recommendation)).toEqual(["A · Mark + links", "Skip short sections", null, null])
  })

  test("status:  last review date and count, deferred, the to-do list", () => {
    const plan = freshPlan()
    expect(plan.reviewStatus()).toEqual({ last: null, reviewedThen: 0, deferred: 0, queued: [] })
    plan.addItem("issue", "one")
    plan.addItem("issue", "two")
    plan.addItem("issue", "three")
    plan.review("i1")
    plan.queue("i2", "fix it")
    plan.defer("i3")
    expect(plan.reviewStatus()).toEqual({
      last: "2026-10-01",
      reviewedThen: 2,
      deferred: 1,
      queued: [{ id: "I2", title: "two", work: "fix it", queued: "2026-10-01" }]
    })
  })

  test("picker spec:  a checkbox per open item, its whole text (cards as prose), its state a badge", () => {
    const plan = freshPlan()
    const details =
      '<p>why:  see <a href="#c1">C1</a> and <a href="../../scripts/x.js">x.js</a></p>' +
      '<epic-choices><epic-option letter="A" title="Keep" recommended><p>a</p></epic-option></epic-choices>'
    for (const title of ["one", "two", "three", "struck"]) plan.addItem("question", title, { details })
    plan.addItem("issue", "queued")
    plan.queue("i1", "fix")
    plan.review("q2")
    plan.defer("q3")
    plan.setItem("q4", "canceled")
    const section = plan.reviewSections({ filter: "open" }).find((s) => s.kind === "question")!
    const spec = ItemPicker.spec(
      plan,
      "/r/docs/epics/demo/demo.plan.html",
      section,
      plan.reviewStatus(),
      "/r/docs/details"
    )
    const [question] = spec.questions
    expect(question!.options.map((o) => [o.letter, o.checked, o.done, o.state.icon, o.state.color])).toEqual([
      ["Q1", true, false, "circle outline", "red"],
      ["Q2", false, true, "circle check", "red"],
      ["Q3", true, false, "circle pause", "red"]
    ])
    expect(question!.options[0]!.body).toBe(
      '<p>why:  see <a href="../epics/demo/demo.plan.html#c1">C1</a> and <a href="../scripts/x.js">x.js</a></p>' +
        "<div><p><b>Choices</b></p><div><p><b>A · Keep (recommended)</b></p><p>a</p></div></div>"
    )
    expect(spec.where.epic).toBe("Demo Plan (<code>demo</code>)")
    const issues = plan.reviewSections({ filter: "open" }).find((s) => s.kind === "issue")!
    const picker = ItemPicker.spec(plan, "/r/x.plan.html", issues, plan.reviewStatus(), "/r")
    expect(picker.questions[0]!.options.map((option) => option.state.color)).toEqual(["orange"])
  })
})

////////////////
// ## Commits
////////////////

describe("PlanDoc commits", () => {
  const SHA = "cd6a9d7600000000000000000000000000000001"
  const BASE = "https://github.com/spell-app/spell-app"

  test("reads phase and item commits from subjects", () => {
    const parse = (subject: string) => PlanCommits.parseCommitSubject(subject)!
    expect(parse("P1:  Side Bar And Chrome -- Spell Docs + Review tabs")).toEqual({
      phases: [1],
      items: [],
      sentence: "Spell Docs + Review tabs"
    })
    expect(parse("P1 follow-up:  ivory rail").sentence).toBe("ivory rail")
    expect(parse("P4 + P5:  both -- did both").phases).toEqual([4, 5])
    expect(parse("WIP P3:  half").phases).toEqual([3])
    expect(parse("review-review P3:  x").phases).toEqual([3])
    expect(parse("P6a:  first half").phases).toEqual([6])
    expect(parse("Fix I3:  the label").items).toEqual(["i3"])
    expect(parse("review-review J2:  y").items).toEqual(["j2"])
    expect(parse("P052 fonts:  x")).toBe(null)
    expect(parse("Merge branch 'main' into review-review")).toBe(null)
  })

  test("finds the GitHub page from the remote, https or ssh", () => {
    expect(PlanCommits.githubBase("https://github.com/spell-app/spell-app.git")).toBe(BASE)
    expect(PlanCommits.githubBase("git@github.com:spell-app/spell-app.git")).toBe(BASE)
    expect(PlanCommits.githubBase("ssh://git@github.com/spell-app/spell-app")).toBe(BASE)
    expect(PlanCommits.githubBase("https://gitlab.com/x/y.git")).toBe(null)
  })

  test("a phase's commits after Done (else Goal), before Files and To review;  replaced by sha;  the repo on the page", () => {
    const plan = freshPlan()
    plan.addPhase("One", { goal: "<ul><li>g</li></ul>" })
    plan.setPhase(1, "active")
    plan.addItem("caveat", "x")
    plan.updateStates()
    expect(plan.addCommit({ phase: 1 }, SHA, "built <it>", { base: BASE })).toBe("added")
    expect(kids(el(plan, "p1"))).toEqual([
      "field:goal",
      "epic-commit",
      "field:files",
      "field:verify",
      "field:to-review"
    ])
    expect(el(plan, "p1").querySelector("epic-commit")!.outerHTML).toBe(
      `<epic-commit sha="${SHA}">built &lt;it&gt;</epic-commit>`
    )
    expect(plan.page.getAttribute("repo")).toBe(BASE)
    plan.setPhase(1, "done", { done: "<ul><li>d</li></ul>" })
    expect(plan.addCommit({ phase: 1 }, SHA.slice(0, 7), "built it again")).toBe("replaced")
    expect(el(plan, "p1").querySelectorAll("epic-commit").length).toBe(1)
    expect(kids(el(plan, "p1")).slice(0, 3)).toEqual(["field:goal", "field:done", "epic-commit"])
    expect(plan.hasCommit({ phase: 1 }, SHA)).toBe(true)
    expect(problems(plan)).toEqual([])
  })

  test("an item's commits at the end, after its Original Discussion", () => {
    const plan = freshPlan()
    plan.addItem("issue", "plain")
    plan.addItem("issue", "detailed", { details: "<p>why</p>" })
    plan.addCommit({ item: "I1" }, SHA, "fixed it", { base: BASE })
    plan.addCommit({ item: "i2" }, SHA, "fixed it too")
    plan.setDetails("i2", "<p>rewritten</p>")
    expect(kids(el(plan, "i1"))).toEqual(["epic-commit"])
    expect(kids(el(plan, "i2"))).toEqual(["p", "epic-original", "epic-commit"])
    expect(problems(plan)).toEqual([])
  })

  test("backfills from the doc's history, oldest first, once", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.addPhase("Two")
    plan.addItem("issue", "bug")
    const log = [
      { sha: "c".repeat(40), subject: "Fix I1:  the bug" },
      { sha: "b".repeat(40), subject: "P1 follow-up:  more" },
      { sha: "a".repeat(40), subject: "P1:  One -- the first" },
      { sha: "d".repeat(40), subject: "P9:  no such phase" },
      { sha: "e".repeat(40), subject: "Merge branch 'main'" }
    ]
    const added = plan.backfillCommits(log, { base: BASE })
    expect(added.map((entry) => [entry.sha[0], entry.phase ?? entry.item])).toEqual([
      ["a", 1],
      ["b", 1],
      ["c", "i1"]
    ])
    expect(Array.from(el(plan, "p1").querySelectorAll("epic-commit"), (commit) => commit.textContent)).toEqual([
      "the first",
      "more"
    ])
    expect(plan.backfillCommits(log, { base: BASE })).toEqual([])
  })
})

////////////////
// ## Prompt, bedtime, future epics
////////////////

describe("PlanDoc prompt", () => {
  test("the Overview's prompt slot:  paragraphs, line breaks, escaped;  after the summary;  '' removes it", () => {
    const plan = freshPlan()
    plan.setPrompt("Update the template\n- make <h1> sticky\n\nAlso & more")
    const quote = () => plan.overview.querySelector(':scope > blockquote[slot="prompt"]')
    expect(quote()!.innerHTML).toBe("<p>Update the template<br>- make &lt;h1&gt; sticky</p><p>Also &amp; more</p>")
    expect(quote()!.previousElementSibling!.getAttribute("slot")).toBe("summary")
    plan.setPrompt("")
    expect(quote()).toBeNull()
    plan.setPrompt("again")
    expect(quote()!.textContent).toBe("again")
    expect(problems(plan)).toEqual([])
  })
})

describe("PlanDoc bedtime", () => {
  test("start:  <epic-page bedtime>;  summary says what it runs;  done:  off, and it survives a re-read", () => {
    const plan = freshPlan()
    expect([plan.bedtime, plan.bedtimeRun, plan.summary().bedtime]).toEqual([false, null, null])
    plan.startBedtime("P3-P6")
    expect([plan.bedtime, plan.page.getAttribute("bedtime"), plan.summary().bedtime]).toEqual([true, "P3-P6", "P3-P6"])
    const again = PlanDoc.parse(plan.toString(), NOW)
    expect(again.finishBedtime()).toBe(true)
    expect([again.bedtime, again.summary().bedtime]).toEqual([false, null])
    expect(again.finishBedtime()).toBe(false)
  })

  test("an older doc's Overnight section, kept outside the page:  removed once read", () => {
    const plan = freshPlan()
    plan.page.insertAdjacentHTML("beforebegin", '<ui-section id="overnight" header="Overnight"></ui-section>')
    expect(plan.removeOvernight()).toBe(true)
    expect(plan.removeOvernight()).toBe(false)
  })
})

describe("PlanDoc future epics (epic-future)", () => {
  test("makeFuture:  <epic-page future>, no branch or worktree;  promote plans it, a second time does nothing", () => {
    const plan = freshPlan()
    plan.makeFuture()
    expect(Markup.read(plan.page)).toMatchObject({ future: true })
    expect([plan.page.hasAttribute("branch"), plan.page.hasAttribute("worktree"), plan.summary().future]).toEqual([
      false,
      false,
      true
    ])
    plan.addItem("decision", "Main's code draws every doc")
    expect(plan.promote({ branch: "foo-bar", worktree: "/w/foo-bar" })).toBe(true)
    expect([plan.future, plan.page.getAttribute("branch"), plan.page.getAttribute("worktree")]).toEqual([
      false,
      "foo-bar",
      "/w/foo-bar"
    ])
    expect(el(plan, "q1")).not.toBeNull()
    expect(plan.promote({ branch: "x", worktree: "y" })).toBe(false)
  })

  test("its first phase plans it too", () => {
    const plan = freshPlan()
    plan.makeFuture()
    plan.addPhase("One", { symptom: "s", changes: "c" })
    expect(plan.future).toBe(false)
  })
})

////////////////
// ## Review inbox
////////////////

describe("PlanDoc review inbox", () => {
  /** Options A and B, B recommended. */
  const OPTIONS =
    '<epic-choices><epic-option letter="A" title="Keep folds"><p>a</p></epic-option>' +
    '<epic-option letter="B" title="Unfold it" recommended><p>b</p></epic-option></epic-choices>'

  /** A doc with one item of each kind, details where they matter. */
  function inboxPlan() {
    const plan = freshPlan()
    plan.addItem("question", "which?", { details: `<p>why</p>${OPTIONS}` })
    plan.addItem("question", "no recommendation?", { details: "<p>talk</p>" })
    plan.addItem("judgement", "chose X")
    plan.addItem("caveat", "slow")
    plan.addItem("test", "click it")
    return plan
  }

  /** Item `id`'s status. */
  function status(plan: PlanDoc, id: string) {
    return el(plan, id).getAttribute("status")
  }

  test("describeItem:  an item, an Overview sub-section (Q14), or null", () => {
    const plan = inboxPlan()
    expect(plan.describeItem("J1")).toEqual({ id: "J1", kind: "judgement", status: "open", title: "chose X" })
    expect(plan.describeItem("o1")).toEqual({ id: "O1", kind: "overview", status: "open", title: "Structure" })
    expect(plan.describeItem("z9")).toBeNull()
  })

  test("approve:  a question takes its recommended option;  none recommended:  left", () => {
    const plan = inboxPlan()
    expect(plan.applyMark({ id: "q1", action: "approve" })).toEqual({
      applied: true,
      did: "approved:  answered B · Unfold it (recommended)"
    })
    expect(Markup.read(el(plan, "q1"))).toMatchObject({
      status: "decided",
      answered: true,
      reviewed: "2026-10-01",
      reviewAs: "approve"
    })
    expect(el(plan, "q1").querySelector("epic-answer")!.getAttribute("title")).toBe("Unfold it")
    expect(el(plan, "q1").querySelector("epic-choices")!.getAttribute("chosen")).toBe("B")
    expect(plan.applyMark({ id: "q2", action: "approve" })).toMatchObject({ applied: false, left: /needs talk/ })
    expect(status(plan, "q2")).toBe("open")
  })

  test("approve:  a judgement call and a test close;  a caveat is reviewed;  a closed item reviewed;  logged", () => {
    const plan = inboxPlan()
    expect(plan.applyMark({ id: "j1", action: "approve" }).did).toBe("approved:  closed (accepted)")
    expect(plan.applyMark({ id: "v1", action: "approve" }).did).toBe("approved:  closed (passed)")
    expect(plan.applyMark({ id: "c1", action: "approve" }).did).toBe("approved:  reviewed")
    expect(plan.applyMark({ id: "j1", action: "approve" }).did).toBe("approved:  reviewed")
    expect([status(plan, "j1"), status(plan, "v1"), status(plan, "c1")]).toEqual(["done", "done", "open"])
    const log = Array.from(plan.document.querySelectorAll("#log > epic-event"), (line) => line.textContent)
    expect(log.at(-1)).toBe("J1 approved:  reviewed")
  })

  test("pick, todo (with Owen's note);  revisit and details left;  a gone item flagged", () => {
    const plan = inboxPlan()
    expect(plan.applyMark({ id: "q1", action: "pick", pick: "A" }).did).toBe("picked A:  Keep folds")
    expect(el(plan, "q1").querySelector("epic-answer")!.getAttribute("title")).toBe("Keep folds")
    expect(el(plan, "q1").getAttribute("review-as")).toBe("approve")
    expect(plan.applyMark({ id: "q1", action: "pick", pick: "C" })).toMatchObject({
      applied: false,
      left: "no option C"
    })
    expect(plan.applyMark({ id: "c1", action: "todo", note: "check perf" }).did).toBe("to todo T1")
    expect(PlanItem.titleOf(el(plan, "t1"))).toBe("Follow up:  slow")
    expect(el(plan, "t1").querySelector('a[href="#c1"]')!.textContent).toBe("C1")
    expect(el(plan, "t1").textContent).toContain("check perf")
    expect(el(plan, "c1").getAttribute("review-as")).toBe("todo")
    expect(plan.applyMark({ id: "q2", action: "revisit", when: "soon", note: "why?" })).toEqual({
      applied: false,
      left: 'to talk over:  "why?"'
    })
    expect(plan.applyMark({ id: "q2", action: "details" }).applied).toBe(false)
    expect(plan.applyMark({ id: "i9", action: "approve" })).toMatchObject({ applied: false, gone: true })
  })

  test("a revisit with a pick:  left to talk over, the question NOT answered", () => {
    const plan = inboxPlan()
    expect(plan.applyMark({ id: "q1", action: "revisit", when: "soon", note: "only plan docs?", pick: "A" })).toEqual({
      applied: false,
      left: 'to talk over:  picks A · Keep folds, asks:  "only plan docs?"'
    })
    expect([status(plan, "q1"), el(plan, "q1").querySelector("epic-choices")!.hasAttribute("chosen")]).toEqual([
      "open",
      false
    ])
    expect(plan.applyMark({ id: "q1", action: "revisit", when: "soon", note: "", pick: "C" }).left).toBe(
      "to talk over:  picks C (no such option card), no note"
    )
  })

  test("an Overview sub-section's marks (Q14):  approve noted, todo made;  the rest left", () => {
    const plan = inboxPlan()
    expect(plan.applyMark({ id: "o1", action: "approve" })).toEqual({ applied: true, did: "approved" })
    expect(plan.applyMark({ id: "O1", action: "todo", note: "more on parts" }).did).toBe("to todo T1")
    expect(el(plan, "t1").querySelector('a[href="#o1"]')!.textContent).toBe("O1")
    expect(plan.applyMark({ id: "o1", action: "revisit", when: "soon" })).toMatchObject({ applied: false })
    plan.keepNote("o1", { note: "and the log?", action: "revisit", when: "soon", at: "2026-10-01T09:10:00" })
    plan.keepNote("o1", { note: "and the log?", action: "revisit", when: "soon", at: "2026-10-01T09:10:00" })
    expect(el(plan, "o1").querySelectorAll(":scope > p").length).toBe(2)
    expect(el(plan, "o1").lastElementChild!.textContent).toBe("Owen · 2026-10-01 09:10 · revisit soon:  and the log?")
    expect(problems(plan)).toEqual([])
  })

  test("setDetails:  replace (old text and cards into the Original Discussion) or append;  stamped", () => {
    const plan = inboxPlan()
    plan.decide("q1", "B", { option: "B" })
    plan.addCommit({ item: "q1" }, "abc1234", "did it")
    plan.setDetails("q1", `<p>new</p>${OPTIONS}`)
    expect(kids(el(plan, "q1"))).toEqual(["p", "epic-choices", "epic-answer", "epic-original", "epic-commit"])
    // the chosen letter stays chosen when the new options have it
    expect(el(plan, "q1").querySelector(":scope > epic-choices")!.getAttribute("chosen")).toBe("B")
    expect(el(plan, "q1").querySelector("epic-version")!.textContent).toContain("B · Unfold it (recommended), chosen")
    // an agent's old reply markup comes in as <epic-reply>, after the answer;  prose goes with the text
    plan.setDetails(
      "q1",
      '<div class="plan-reply"><div class="plan-reply-title"><b>Claude</b> · <time>2026-10-01 09:20</time> · re:  "why?"</div><p>because</p></div>',
      { append: true }
    )
    plan.setDetails("q1", "<p>one more paragraph</p>", { append: true })
    expect(kids(el(plan, "q1"))).toEqual([
      "p",
      "p",
      "epic-choices",
      "epic-answer",
      "epic-reply",
      "epic-original",
      "epic-commit"
    ])
    expect(Markup.read(el(plan, "q1").querySelector("epic-reply")!)).toEqual({
      from: "Claude",
      at: "2026-10-01 09:20",
      re: '"why?"'
    })
    plan.setDetails("c1", "<p>more</p>")
    expect(el(plan, "c1").innerHTML).toBe("<p>more</p>")
    expect(el(plan, "c1").getAttribute("changed")).toMatch(/^2026-10-01T09:05/)
    expect(problems(plan)).toEqual([])
  })

  test("keepNote:  Owen's note as his reply, before Claude's answer to it;  once", () => {
    const plan = inboxPlan()
    plan.setDetails("c1", '<epic-reply from="Claude" at="2026-10-01 09:20"><p>a</p></epic-reply>', { append: true })
    const mark = { action: "revisit", when: "soon", note: "why not B?\nreally", at: "2026-10-01T09:10:00" }
    plan.keepNote("c1", mark)
    plan.keepNote("c1", mark)
    const replies = Array.from(el(plan, "c1").querySelectorAll("epic-reply"))
    expect(replies.map((reply) => Markup.read(reply))).toEqual([
      { from: "Owen", at: "2026-10-01 09:10", re: "revisit soon" },
      { from: "Claude", at: "2026-10-01 09:20" }
    ])
    expect(replies[0]!.querySelector("p")!.textContent).toBe("why not B?\nreally")
  })

  test("details --more:  an <epic-more> after the text and answer;  again replaces it, the old into the Original", () => {
    const plan = freshPlan()
    plan.addItem("issue", "it breaks", { details: "<p>what breaks</p>" })
    plan.keepNote("i1", { note: "why?", action: "revisit", when: "soon" })
    plan.addMore("i1", "<p>more about it</p>")
    expect(kids(el(plan, "i1"))).toEqual(["p", "epic-more", "epic-reply"])
    plan.addMore("i1", "<p>even more</p>")
    expect(kids(el(plan, "i1"))).toEqual(["p", "epic-more", "epic-reply", "epic-original"])
    expect(el(plan, "i1").querySelector("epic-more")!.textContent).toBe("even more")
    expect(el(plan, "i1").querySelector("epic-original")!.textContent).toContain("more about it")
    plan.addItem("question", "which?", { details: `<p>why</p>${OPTIONS}` })
    plan.addMore("q1", "<p>more</p>")
    plan.decide("q1", "Unfold", { option: "B" })
    expect(kids(el(plan, "q1"))).toEqual(["p", "epic-choices", "epic-answer", "epic-more"])
    expect(problems(plan)).toEqual([])
  })
})

describe("PlanDoc original discussion (I7)", () => {
  /** Options A and B, B recommended, after a paragraph with an id. */
  const CARDS =
    '<p id="why">why it matters</p>' +
    '<epic-choices><epic-option letter="A" title="Keep"><p>a</p></epic-option>' +
    '<epic-option letter="B" title="Drop" recommended><p>b</p></epic-option></epic-choices>'

  /** A doc with question Q1 (`CARDS`) and caveat C1 (no details). */
  function plan() {
    const doc = freshPlan()
    doc.addItem("question", "which?", { details: CARDS })
    doc.addItem("caveat", "slow")
    return doc
  }

  /** Item `id`'s versions:  `[asOf, text]` each. */
  function versions(doc: PlanDoc, id: string) {
    return Array.from(el(doc, id).querySelectorAll("epic-original > epic-version"), (v) => [
      v.getAttribute("as-of"),
      v.textContent
    ])
  }

  test("first replace:  the text and its cards into an <epic-original>, as prose;  ids renamed", () => {
    const doc = plan()
    doc.setDetails("q1", '<p id="why">rewritten</p>')
    expect(kids(el(doc, "q1"))).toEqual(["p", "epic-original"])
    expect(versions(doc, "q1")).toEqual([[null, "why it mattersChoicesA · KeepaB · Drop (recommended)b"]])
    expect(doc.document.querySelectorAll("#why").length).toBe(1)
    expect(el(doc, "q1").querySelector("epic-version [data-original-id='why']")!.textContent).toBe("why it matters")
    // its options are history:  never read, never chosen
    expect(doc.optionCards(doc.item("q1"))).toEqual([])
    expect(() => doc.chooseOption(doc.item("q1"), "B")).toThrow(PlanDocError)
    const [item] = doc.reviewSections({ filter: "all" })[0]!.items
    expect([item!.details, item!.recommendation]).toEqual(["rewritten", null])
    expect(item!.original).toBe("why it mattersChoicesA · KeepaB · Drop (recommended)b")
    expect(problems(doc)).toEqual([])
    expect(doc.check()).toEqual([])
  })

  test("second replace:  dated, in order;  the same text again is kept once", () => {
    const doc = plan()
    doc.setDetails("q1", "<p>second</p>")
    doc.now = new Date(2026, 9, 4, 20, 49)
    doc.setDetails("q1", "<p>third</p>")
    doc.setDetails("q1", "<p>third</p>")
    doc.setDetails("q1", "<p>third</p>")
    expect(versions(doc, "q1").map(([asOf]) => asOf)).toEqual([null, "2026-10-04 20:49", "2026-10-04 20:49"])
    expect(
      versions(doc, "q1")
        .map(([, text]) => text)
        .slice(1)
    ).toEqual(["second", "third"])
  })

  test("append moves nothing;  an empty item gets no Original Discussion;  a link inside it is history", () => {
    const doc = plan()
    doc.setDetails("q1", '<epic-reply from="Claude">re</epic-reply>', { append: true })
    expect(el(doc, "q1").querySelector("epic-original")).toBeNull()
    doc.setDetails("c1", '<p><a href="#gone">old link</a></p>')
    expect(el(doc, "c1").querySelector("epic-original")).toBeNull()
    doc.setDetails("c1", "<p>new</p>")
    expect(doc.check()).toEqual([])
  })

  test("restoreOriginal:  as first written, then dated in order;  old-markup history too;  commits and the answer left out", () => {
    const doc = plan()
    expect(doc.restoreOriginal("c1", "<p>as first asked</p>")).toBe("added")
    expect(doc.restoreOriginal("c1", "<p>later</p>", { asOf: "2026-10-03 10:00" })).toBe("added")
    expect(doc.restoreOriginal("c1", "<p>between</p>", { asOf: "2026-10-02 09:00" })).toBe("added")
    expect(doc.restoreOriginal("c1", "<p>later</p>", { asOf: "2026-10-04 11:00" })).toBe("unchanged")
    expect(doc.restoreOriginal("c1", "  ")).toBe("empty")
    expect(versions(doc, "c1")).toEqual([
      [null, "as first asked"],
      ["2026-10-02 09:00", "between"],
      ["2026-10-03 10:00", "later"]
    ])
    // not stamped
    expect(el(doc, "c1").getAttribute("changed")).toBe(PlanTime.isoTime(NOW))
    doc.decide("q1", "Drop it")
    doc.addCommit({ item: "q1" }, "abc1234", "did it")
    const old =
      '<p>older text</p><div class="plan-answer-block"><div class="plan-answer-title"><b>Answer</b> · Drop it</div></div>' +
      '<div class="plan-commits"><b>Commits:</b> x</div>' +
      '<ui-accordion class="spell-aside plan-original"><ui-title>Original Discussion</ui-title><ui-content>' +
      '<div class="plan-version" data-as-of="2026-09-01 10:00"><h5>As of 2026-09-01 10:00</h5><p>oldest</p></div>' +
      "</ui-content></ui-accordion>"
    expect(doc.restoreOriginal("q1", old, { asOf: "2026-09-02 10:00" })).toBe("added")
    expect(versions(doc, "q1")).toEqual([
      ["2026-09-01 10:00", "oldest"],
      ["2026-09-02 10:00", "older text"]
    ])
    expect(el(doc, "q1").querySelectorAll("epic-commit").length).toBe(1)
    expect(problems(doc)).toEqual([])
  })
})

////////////////
// ## Summary, check
////////////////

describe("PlanDoc summary and check", () => {
  test("summarizes the phases, the next one and what's open, in OPEN_KINDS' order", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.addPhase("Two")
    plan.setPhase(1, "done")
    plan.addItem("question", "which browser?")
    plan.addItem("issue", "fixed already")
    plan.setItem("i1", "done")
    const summary = plan.summary()
    expect(summary.title).toBe("Demo Plan")
    expect(summary.next).toEqual({ n: 2, name: "Two", status: "todo", estimate: undefined })
    expect(Object.keys(summary.open)).toEqual(["question", "judgement", "issue", "caveat", "todo", "test"])
    expect(summary.open.question.map((item) => item.id)).toEqual(["q1"])
    expect(summary.open.issue).toEqual([])
  })

  test("check finds broken links, duplicate ids and what the definitions refuse", () => {
    const plan = freshPlan()
    el(plan, "o1").insertAdjacentHTML("beforeend", '<p id="o1">see <a href="#i7">I7</a></p>')
    plan
      .findSection("caveats")!
      .insertAdjacentHTML("beforeend", '<epic-item id="c1" status="maybe" title="x"></epic-item>')
    expect(plan.check()).toEqual([
      'id "o1" used 2 times',
      'link to missing #i7 ("I7")',
      'bad value:  <epic-item id="c1"> `status="maybe"` isn\'t one of its values (`open`, `decided`, `done`, `canceled`)'
    ])
  })
})

////////////////
// ## The old markup, read only
////////////////

describe("OldPlanReader (until the switch, P12)", () => {
  /** The old fixture with a phase, items of each kind, an answered question, review marks. */
  function oldPlan() {
    const html = readFileSync(join(FIXTURES, "plan.html"), "utf8")
      .replaceAll("{{title}}", "Old Plan")
      .replace(
        /(<ui-section id="phases"[^>]*>[\s\S]*?<\/ui-progress\s*>)/,
        '$1<ui-section id="p1" data-phase="1" data-status="active" header="P1 · First Go" badge="2h"></ui-section>'
      )
      .replace(
        '<ui-list class="plan-items" data-kind="decision" divided relaxed></ui-list>',
        '<ui-list class="plan-items" data-kind="decision" divided relaxed>' +
          '<ui-item id="q1" data-status="open"><ui-accordion class="plan-item"><ui-title><a class="plan-id" href="#q1">Q1</a> ' +
          '<span class="plan-title">which?</span></ui-title><ui-content><p>why</p><ui-grid class="spell-pros-cons">' +
          '<ui-column><ui-segment><ui-label attached="top">A · Keep (recommended)</ui-label></ui-segment></ui-column>' +
          "</ui-grid></ui-content></ui-accordion></ui-item>" +
          '<ui-item id="q2" data-status="decided" data-answered><ui-accordion class="plan-item"><ui-title>' +
          '<a class="plan-id" href="#q2">Q2</a> <span class="plan-title">done?</span></ui-title><ui-content>' +
          '<p>see <a href="#c1">C1</a></p></ui-content></ui-accordion></ui-item></ui-list>'
      )
      .replace(
        '<ui-list class="plan-items" data-kind="caveat" divided relaxed></ui-list>',
        '<ui-list class="plan-items" data-kind="caveat" divided relaxed>' +
          '<ui-item id="c1" data-status="open"><a class="plan-id" href="#c1">C1</a> <span class="plan-title">linked</span></ui-item>' +
          '<ui-item id="c2" data-status="open" data-deferred="2026-09-30" data-phase="1"><a class="plan-id" href="#c2">C2</a> ' +
          '<span class="plan-title">later</span></ui-item></ui-list>'
      )
    return OldPlanReader.parse(html, NOW)
  }

  test("reads phases, items, review states and the summary, without changing a thing", () => {
    const plan = oldPlan()
    const before = plan.toString()
    expect(plan.markup).toBe("old")
    expect(plan.title).toBe("Old Plan")
    expect(plan.phases).toEqual([{ n: 1, name: "First Go", status: "active", estimate: "2h" }])
    const summary = plan.summary()
    expect(summary.open.question.map((item) => item.id)).toEqual(["q1"])
    expect(summary.open.caveat.map((item) => item.title)).toEqual(["linked", "later"])
    const sections = plan.reviewSections({ filter: "all" })
    expect(sections.find((s) => s.kind === "caveat")!.items.map((item) => [item.id, item.state])).toEqual([
      ["C1", "reviewed"],
      ["C2", "deferred"]
    ])
    expect(sections[0]!.items[0]!.recommendation).toBe("A · Keep")
    expect(plan.optionCards(plan.findItem("q1")!)).toEqual([{ letter: "A", title: "Keep", recommended: true }])
    expect(plan.describeItem("c2")).toEqual({ id: "C2", kind: "caveat", status: "open", title: "later" })
    expect(plan.reviewStatus().deferred).toBe(1)
    expect(plan.check()).toEqual([])
    expect(plan.toString()).toBe(before)
  })
})
