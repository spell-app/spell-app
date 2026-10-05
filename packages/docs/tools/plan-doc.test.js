import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vite-plus/test"

import { DOCS, TOOLS } from "./pages.js"
import {
  PlanDoc,
  PlanDocError,
  githubBase,
  isoTime,
  parseCommitSubject,
  parseDuration,
  pickAsks,
  pickerSpec,
  timeTag
} from "./plan-doc.js"
import { convertSections } from "./to-ui-section.js"

/** When the tests' edits happen:  local 2026-10-01 09:05. */
const NOW = new Date(2026, 9, 1, 9, 5)

/** A fresh plan doc from the real template, so the tests break when the template drifts from the script. */
function freshPlan() {
  return PlanDoc.parse(readFileSync(join(DOCS, "templates/epics/plan.html"), "utf8"), NOW)
}

/** A plan doc in the layout before 2026-10-01 (`#plan` with a phase list, `ol.plan-items`):  the old template. */
function oldPlan() {
  return PlanDoc.parse(readFileSync(join(TOOLS, "fixtures/plan-2026-09-30.html"), "utf8"), NOW)
}

/** Ids of `plan`'s top-level sections (`main > ui-section`;  old markup:  h2s), in page order. */
function sectionIds(plan) {
  return Array.from(plan.document.querySelectorAll("main > ui-section, main h2"), (section) => section.id)
}

/** Titles of `plan`'s top-level `<ui-section>`s, in page order. */
function headers(plan) {
  return Array.from(plan.document.querySelectorAll("main > ui-section"), (section) => section.getAttribute("header"))
}

/** Which phase sections are folded (`collapsed`), in order. */
function folds(plan) {
  return Array.from(plan.document.querySelectorAll("ui-section[data-phase]"), (section) =>
    section.hasAttribute("collapsed")
  )
}

describe("PlanDoc layout", () => {
  it("has the sections in order, as <ui-section>s with icons, the h1 in a sticky header, no #plan", () => {
    const plan = freshPlan()
    expect(sectionIds(plan)).toEqual([
      "overview",
      "phases",
      "decisions",
      "judgements",
      "caveats",
      "todos",
      "issues",
      "tests",
      "log"
    ])
    expect(headers(plan)[2]).toBe("3. Questions")
    const icon = (id) => plan.document.querySelector(`#${id} > ui-icon[slot="icon"]`).getAttribute("name")
    expect([icon("decisions"), icon("judgements")]).toEqual(["file circle question", "gavel"])
    for (const section of plan.document.querySelectorAll("main > ui-section")) {
      expect(section.querySelector(':scope > ui-icon[slot="icon"]')).not.toBeNull()
      for (const flag of ["sticky", "collapsible", "dividing"]) expect(section.hasAttribute(flag)).toBe(true)
    }
    expect(plan.document.querySelector("#overview > ui-section#o1").getAttribute("header")).toBe("1.1 Structure")
    expect(plan.document.querySelector("section, h2, h3")).toBeNull()
    expect(plan.document.querySelector("ui-sticky.spell-h1 > header.spell-page-head > h1").textContent).toBe(
      "Epic: {{title}}"
    )
    expect(plan.title).toBe("{{title}}")
    expect(plan.document.getElementById("plan")).toBeNull()
    expect(plan.check()).toEqual([])
  })
})

describe("PlanDoc phases", () => {
  it("adds phase sections to #phases, todo, numbered in order", () => {
    const plan = freshPlan()
    expect(plan.addPhase("Docs Workspace")).toBe(1)
    expect(plan.addPhase("Runtime + Index", { goal: "sidebar from headings" })).toBe(2)
    expect(plan.phases).toEqual([
      { n: 1, name: "Docs Workspace", status: "todo" },
      { n: 2, name: "Runtime + Index", status: "todo" }
    ])
    const phase = plan.document.getElementById("p2")
    expect(phase.localName).toBe("ui-section")
    expect(phase.parentElement.id).toBe("phases")
    expect(phase.getAttribute("header")).toBe("P2 · Runtime + Index")
    expect(phase.getAttribute("data-phase")).toBe("2")
    expect(phase.querySelector(':scope > ui-icon[slot="icon"]').getAttribute("name")).toBe("circle outline")
    expect(plan.toString()).toContain(
      '<ui-section id="p2" data-phase="2" data-status="todo" header="P2 · Runtime + Index" sticky collapsible dividing collapsed>'
    )
    const body = plan.document.querySelector('ui-section[data-phase="2"] > ui-list.plan-phase-body')
    // the estimate is the title's badge, not a field
    expect(Array.from(body.children, (item) => item.getAttribute("icon"))).toEqual(["bullseye", "folder", "flask"])
    expect(body.textContent).toContain("sidebar from headings")
    expect(plan.check()).toEqual([])
  })

  it("puts the estimate in the phase title's badge", () => {
    const plan = freshPlan()
    plan.addPhase("One", { estimate: "1-2h" })
    expect(plan.document.getElementById("p1").getAttribute("badge")).toBe("1-2h")
    expect(plan.phases[0].estimate).toBe("1-2h")
    plan.setEstimate(1, "3h")
    expect(plan.document.getElementById("p1").getAttribute("badge")).toBe("3h")
    expect(plan.document.querySelector("p.plan-estimate").textContent).toContain("3h in all")
  })

  it("writes a done phase's Done field, after its Goal, replacing an earlier one", () => {
    const plan = freshPlan()
    plan.addPhase("One", { goal: "<ul><li>a goal</li></ul>" })
    plan.setPhase(1, "done", { done: "<ul><li>built it</li></ul>" })
    const fields = () =>
      Array.from(plan.document.querySelectorAll("#p1 .plan-phase-body > ui-item"), (item) => item.getAttribute("icon"))
    expect(fields()).toEqual(["bullseye", "circle check", "folder", "flask"])
    plan.setDone(1, "<ul><li>built it again</li></ul>")
    expect(fields()).toEqual(["bullseye", "circle check", "folder", "flask"])
    expect(plan.document.querySelector('#p1 ui-item[icon="circle check"]').textContent).toContain("built it again")
  })

  it("migrate moves an old Estimate field into the badge", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.document
      .querySelector("#p1 .plan-phase-body")
      .append(plan.fragment('<ui-item icon="clock"><b>Estimate:</b>  2h</ui-item>'))
    plan.document.getElementById("p1").removeAttribute("badge")
    expect(plan.estimatesToBadges()).toBe(1)
    expect(plan.document.getElementById("p1").getAttribute("badge")).toBe("2h")
    expect(plan.document.querySelector('#p1 ui-item[icon="clock"]')).toBe(null)
  })

  it("sets status on the section and its heading, and logs it", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.setPhase(1, "active")
    expect(plan.activePhase).toBe(1)
    const section = plan.document.querySelector('ui-section[data-phase="1"]')
    expect(section.getAttribute("data-status")).toBe("active")
    const icons = section.querySelectorAll(':scope > ui-icon[slot="icon"]')
    expect(Array.from(icons, (icon) => icon.getAttribute("name"))).toEqual(["circle half stroke"])
    expect(plan.document.querySelector(".plan-log").textContent).toContain("2026-10-01 09:05 P1 active")
    expect(() => plan.setPhase(1, "finished")).toThrow(PlanDocError)
  })

  it("shows the active phase, else DONE, else the next one, in the header's step label", () => {
    const plan = freshPlan()
    const step = plan.document.querySelector(".plan-step")
    plan.updateStep()
    expect(step.hasAttribute("hidden")).toBe(true)
    plan.addPhase("One")
    plan.addPhase("Two")
    expect(step.querySelector("ui-label").textContent).toBe("P1")
    expect(step.querySelector("ui-label").getAttribute("title")).toBe("Next:  P1 · One")
    expect(step.querySelector("ui-label").getAttribute("icon")).toBe("circle right")
    plan.setPhase(1, "active")
    const active = step.querySelector("ui-label")
    expect([active.textContent, active.getAttribute("color"), active.getAttribute("href")]).toEqual([
      "P1",
      "orange",
      "#p1"
    ])
    expect(active.getAttribute("title")).toBe("P1 · One")
    plan.setPhase(1, "done")
    plan.setPhase(2, "done")
    expect(step.querySelector("ui-label").textContent).toBe("DONE")
    expect(step.hasAttribute("hidden")).toBe(false)
  })

  it("starts phases folded, folds done ones, and never unfolds one", () => {
    const plan = freshPlan()
    for (const name of ["One", "Two", "Three"]) plan.addPhase(name)
    expect(folds(plan)).toEqual([true, true, true])
    // the reader opens P2 and P3;  finishing P2 folds it, P3 stays as the reader left it
    for (const n of [2, 3]) plan.document.getElementById(`p${n}`).removeAttribute("collapsed")
    plan.setPhase(1, "done")
    plan.setPhase(2, "done")
    expect(folds(plan)).toEqual([true, true, false])
    // going active doesn't unfold
    plan.setPhase(1, "active")
    expect(folds(plan)).toEqual([true, true, false])
  })

  it("keeps the progress bar at done of all phases, hidden while there are none", () => {
    const plan = freshPlan()
    const bar = plan.document.querySelector("ui-progress.plan-progress")
    expect(bar.parentElement.id).toBe("phases")
    expect(bar.hasAttribute("hidden")).toBe(true)
    plan.addPhase("One")
    plan.addPhase("Two")
    plan.setPhase(1, "done")
    expect([bar.getAttribute("value"), bar.getAttribute("total"), bar.hasAttribute("hidden")]).toEqual([
      "1",
      "2",
      false
    ])
  })

  it("still edits docs with the old markup (a phase list under #plan, `ol.plan-items`, `ul.plan-log`)", () => {
    const html = readFileSync(join(TOOLS, "fixtures/plan-2026-09-30.html"), "utf8")
      .replace(/<ui-steps class="plan-phases"[^>]*><\/ui-steps>/, '<ul class="plan-phases"></ul>')
      .replace(/<ui-feed class="plan-log"[\s\S]*?<\/ui-feed>/, '<ul class="plan-log"></ul>')
    const plan = PlanDoc.parse(html, NOW)
    plan.addPhase("One")
    plan.setPhase(1, "active")
    const icons = plan.document.querySelectorAll('[data-phase="1"] ui-icon')
    expect(Array.from(icons, (icon) => icon.getAttribute("name"))).toEqual(["circle half stroke", "circle half stroke"])
    expect(plan.phases).toEqual([{ n: 1, name: "One", status: "active" }])
    expect(plan.document.querySelector("ul.plan-log > li").textContent).toContain("2026-10-01 09:05 P1 active")
    expect(plan.addItem("issue", "old list")).toBe("i1")
    expect(plan.document.querySelector("ol.plan-items > li#i1")).not.toBeNull()
    expect(plan.check()).toEqual([])
  })

  it("done removes that phase's UPDATE markers, not other phases'", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.addPhase("Two")
    plan.setPhase(1, "active")
    plan.addItem("issue", "found in P1")
    expect(plan.updateMarkers(1)).toHaveLength(1)
    plan.setPhase(1, "done")
    plan.setPhase(2, "active")
    plan.addItem("caveat", "found in P2")
    plan.setPhase(1, "done")
    expect(plan.updateMarkers(1)).toHaveLength(0)
    expect(plan.updateMarkers(2)).toHaveLength(1)
  })
})

describe("PlanDoc estimates", () => {
  /** The Overview's total line, as text. */
  function total(plan) {
    return plan.document.querySelector("#overview > p.plan-estimate")?.textContent
  }

  it("parses hours, minutes and ranges", () => {
    expect(parseDuration("30m")).toEqual({ min: 30, max: 30 })
    expect(parseDuration("45 min")).toEqual({ min: 45, max: 45 })
    expect(parseDuration("~1.5h")).toEqual({ min: 90, max: 90 })
    expect(parseDuration("1h30m")).toEqual({ min: 90, max: 90 })
    expect(parseDuration("1-2h")).toEqual({ min: 60, max: 120 })
    expect(parseDuration("30m-1h")).toEqual({ min: 30, max: 60 })
    for (const bad of [undefined, "", "TBD", "a day", "2 hours-ish", "1h-2h-3h"]) {
      expect(parseDuration(bad)).toBeUndefined()
    }
  })

  it("totals the phases' estimates in the Overview, and what's left", () => {
    const plan = freshPlan()
    plan.addPhase("One", { estimate: "1h" })
    expect(plan.phases[0].estimate).toBe("1h")
    expect(total(plan)).toBe("Estimate:  1h in all, 1h left")
    plan.addPhase("Two", { estimate: "30m-1h" })
    plan.addPhase("Three")
    expect(total(plan)).toBe("Estimate:  1h 30m-2h in all, 1h 30m-2h left (P3 not estimated)")
    plan.setPhase(1, "done")
    expect(total(plan)).toBe("Estimate:  1h 30m-2h in all, 30m-1h left (P3 not estimated)")
    plan.setEstimate(3, "15m")
    expect(plan.phases[2].estimate).toBe("15m")
    expect(total(plan)).toBe("Estimate:  1h 45m-2h 15m in all, 45m-1h 15m left")
    expect(plan.summary().estimate).toBe("1h 45m-2h 15m in all, 45m-1h 15m left")
    expect(plan.check()).toEqual([])
  })

  it("goes below the summary and the prompt;  none without an estimate", () => {
    const plan = freshPlan()
    plan.setPrompt("make it so")
    plan.addPhase("One")
    expect(total(plan)).toBeUndefined()
    plan.setEstimate(1, "2h")
    expect(plan.document.querySelector(".plan-prompt-panel").nextElementSibling.className).toBe("plan-estimate")
  })

  it("estimates a phase made without one", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    expect(plan.phases[0].estimate).toBeUndefined()
    plan.setEstimate(1, "1h")
    expect(plan.phases[0].estimate).toBe("1h")
    expect(() => plan.setEstimate(9, "1h")).toThrow(PlanDocError)
  })
})

describe("PlanDoc items", () => {
  it("numbers items per kind and links their ids", () => {
    const plan = freshPlan()
    expect(plan.addItem("caveat", "first")).toBe("c1")
    expect(plan.addItem("caveat", "second", { details: "<p>why</p>" })).toBe("c2")
    expect(plan.addItem("issue", "an issue")).toBe("i1")
    const first = plan.document.getElementById("c1")
    expect(first.localName).toBe("ui-item")
    expect(first.parentElement.matches('ui-list.plan-items[data-kind="caveat"]')).toBe(true)
    expect(first.querySelector("a.plan-id").getAttribute("href")).toBe("#c1")
    expect(plan.check()).toEqual([])
  })

  it("files a judgement call (J1) in #judgements;  open until closed;  summary lists it after questions", () => {
    const plan = freshPlan()
    expect(
      plan.addItem("judgement", "nav starts on Topics", { details: "<p>chose ... over ... because ...</p>" })
    ).toBe("j1")
    const item = plan.document.getElementById("j1")
    expect(item.closest("ui-section").id).toBe("judgements")
    expect(item.getAttribute("data-status")).toBe("open")
    expect(Object.keys(plan.summary().open)).toEqual(["question", "judgement", "issue", "caveat", "todo", "test"])
    expect(plan.summary().open.judgement.map((open) => open.id)).toEqual(["j1"])
    plan.setItem("j1", "done")
    expect(plan.summary().open.judgement).toEqual([])
    expect(plan.check()).toEqual([])
  })

  it("titles an item's details panel with the item's line, not 'details'", () => {
    const plan = freshPlan()
    plan.addItem("decision", "padding tokens stay public (Q8)", { details: "<p>why</p>" })
    const panel = plan.document.querySelector("#q1 > ui-accordion.plan-item")
    expect(panel.querySelector("ui-title > a.plan-id").textContent).toBe("Q1")
    expect(panel.querySelector("ui-title > .plan-title").textContent).toBe("padding tokens stay public (Q8)")
    expect(panel.querySelector("ui-content").innerHTML).toBe("<p>why</p>")
  })

  it("escapes titles", () => {
    const plan = freshPlan()
    const id = plan.addItem("todo", "use <ui-alert> & friends")
    expect(plan.document.getElementById(id).querySelector(".plan-title").textContent).toBe("use <ui-alert> & friends")
  })

  it("closes and reopens, keeping the item", () => {
    const plan = freshPlan()
    plan.addItem("issue", "flaky")
    plan.setItem("I1", "done")
    expect(plan.items("issue")).toEqual([{ id: "i1", title: "flaky", status: "done" }])
    plan.setItem("i1", "open")
    expect(plan.items("issue")[0].status).toBe("open")
    expect(() => plan.setItem("i9", "done")).toThrow(PlanDocError)
  })

  it("marks items UPDATE only while a phase is active, on the item's line", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.addItem("todo", "before")
    plan.setPhase(1, "active")
    plan.addItem("todo", "during")
    plan.addItem("todo", "with details", { details: "<p>x</p>" })
    expect(plan.document.querySelector("#t1 .plan-update")).toBeNull()
    expect(plan.document.querySelector("#t2 > .plan-update").getAttribute("data-phase")).toBe("1")
    expect(plan.document.querySelector("#t3 > ui-accordion > ui-title > .plan-update")).not.toBeNull()
  })
})

describe("PlanDoc questions and decisions", () => {
  /** `id:status` of every item in the shared list, in order. */
  function order(plan) {
    const list = plan.document.querySelector('ui-list.plan-items[data-kind="decision"]')
    return Array.from(list.children, (item) => `${item.id}:${item.getAttribute("data-status")}`)
  }

  it("one Q list (D13):  open questions on top, then the answered ones in id order;  a decision is born answered", () => {
    const plan = freshPlan()
    expect(plan.addItem("decision", "first")).toBe("q1")
    plan.addItem("question", "which?")
    plan.addItem("decision", "second")
    plan.addItem("question", "and?")
    expect(order(plan)).toEqual(["q2:open", "q4:open", "q1:decided", "q3:decided"])
    expect(plan.document.getElementById("q1").querySelector(".plan-title").textContent).toBe("first")
    expect(plan.summary().open.question.map((item) => item.id)).toEqual(["q2", "q4"])
    expect(plan.document.getElementById("decisions").querySelector('[id^="d"]')).toBe(null)
  })

  it("decide:  the answer goes INTO the question, which keeps its title and moves among the answered", () => {
    const plan = freshPlan()
    plan.addItem("question", "which browser?", { details: "<p>the options</p>" })
    plan.addItem("question", "later?")
    plan.addItem("decision", "earlier")
    expect(plan.decide("Q1", "Chrome first", { details: "<p>most readers</p>" })).toBe("q1")
    expect(order(plan)).toEqual(["q2:open", "q1:decided", "q3:decided"])
    const question = plan.document.getElementById("q1")
    expect(question.querySelector(".plan-title").textContent).toBe("which browser?")
    expect(question.querySelector("ui-content").innerHTML).toBe(
      '<div class="plan-answer-block"><div class="plan-answer-title"><b>Answer</b> · Chrome first</div>' +
        "<p>most readers</p></div><p>the options</p>"
    )
    expect(plan.document.querySelector(".plan-answer")).toBe(null)
    // no details yet:  it gets a panel, the line its title
    plan.decide("q2", "not now")
    const panel = plan.document.querySelector("#q2 > ui-accordion.plan-item")
    expect(panel.querySelector(":scope > ui-title > .plan-id").textContent).toBe("Q2")
    expect(panel.querySelector(":scope > ui-content > .plan-answer-block").textContent).toBe("Answer · not now")
    expect(order(plan)).toEqual(["q1:decided", "q2:decided", "q3:decided"])
    // answering again replaces the answer
    plan.decide("q2", "maybe later")
    expect(plan.document.querySelectorAll("#q2 .plan-answer-block").length).toBe(1)
    plan.addItem("caveat", "x")
    expect(() => plan.decide("c1", "nope")).toThrow(PlanDocError)
    expect(plan.check()).toEqual([])
  })

  it("decide --option marks the chosen option card, and only it", () => {
    const plan = freshPlan()
    const card = (letter) =>
      `<ui-column><ui-segment><ui-label attached="top">${letter} · way ${letter}</ui-label><p>x</p></ui-segment></ui-column>`
    plan.addItem("question", "which way?", {
      details: `<ui-grid class="spell-pros-cons" columns="2">${card("A")}${card("B")}</ui-grid>`
    })
    plan.decide("q1", "way B", { option: "b" })
    const chosen = () => Array.from(plan.document.querySelectorAll("#q1 ui-column[data-chosen]"), (c) => c.textContent)
    expect(chosen()).toEqual(["B · way Bx"])
    plan.decide("q1", "way A", { option: "A" })
    expect(chosen()).toEqual(["A · way Ax"])
    expect(() => plan.decide("q1", "way C", { option: "C" })).toThrow(PlanDocError)
  })

  it("closing an answered question supersedes it;  reopening puts it back in force;  an unanswered one reopens open", () => {
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

  it("still reads an old doc's D items and struck question + decision pairs", () => {
    const plan = freshPlan()
    for (const title of ["linked from D1", "linked from Q2", "neither"]) plan.addItem("caveat", title)
    const list = plan.document.querySelector('.plan-items[data-kind="decision"]')
    list.innerHTML =
      '<ui-item id="q1" data-status="done"><a class="plan-id" href="#q1">Q1</a> <span class="plan-title">which?</span> ' +
      '<a class="plan-answer" href="#d1">→ D1</a></ui-item>' +
      '<ui-item id="d1" data-status="decided"><ui-accordion class="plan-item"><ui-title><a class="plan-id" href="#d1">D1</a> ' +
      '<span class="plan-title">this (<a href="#q1">Q1</a>)</span></ui-title><ui-content><p>see <a href="#c1">C1</a></p>' +
      "</ui-content></ui-accordion></ui-item>"
    plan.addItem("question", "open?")
    plan.decide("q2", "yes", { details: '<p>see <a href="#c2">C2</a></p>' })
    const sections = plan.reviewSections({ filter: "all" })
    const caveats = sections.find((s) => s.kind === "caveat").items.map((item) => [item.id, item.state])
    expect(caveats).toEqual([
      ["C1", "reviewed"],
      ["C2", "reviewed"],
      ["C3", "outstanding"]
    ])
    // Questions:  the Q items, never D1
    expect(sections[0].items.map((item) => item.id)).toEqual(["Q1", "Q2"])
    // the old struck question stays beside its decision;  the new answer goes after
    expect(order(plan)).toEqual(["q1:done", "d1:decided", "q2:decided"])
    plan.setItem("d1", "done")
    plan.setItem("d1", "open")
    expect(plan.document.getElementById("d1").getAttribute("data-status")).toBe("decided")
    plan.updateStates()
    expect(plan.document.getElementById("d1").getAttribute("data-state")).toBe("old")
    expect(plan.summary().open.question).toEqual([])
  })
})

describe("PlanDoc states", () => {
  /** `data-state` of each item id, after the whole-doc pass. */
  function stateOf(plan, ...ids) {
    plan.updateStates()
    return ids.map((id) => plan.document.getElementById(id).getAttribute("data-state"))
  }

  it("stamps every change:  data-changed (ISO local time);  data-bedtime during a /bedtime run, until reviewed", () => {
    const plan = freshPlan()
    const stamp = isoTime(NOW)
    expect(stamp).toMatch(/^2026-10-01T09:05:00[+-]\d\d:\d\d$/)
    plan.addItem("issue", "one")
    plan.addItem("question", "two?")
    const changed = (id) => plan.document.getElementById(id).getAttribute("data-changed")
    expect([changed("i1"), changed("q1")]).toEqual([stamp, stamp])
    for (const id of ["i1", "q1"]) plan.document.getElementById(id).removeAttribute("data-changed")
    plan.setItem("i1", "done")
    plan.decide("q1", "yes")
    expect([changed("i1"), changed("q1")]).toEqual([stamp, stamp])
    plan.startOvernight("P1")
    expect(plan.bedtime).toBe(true)
    plan.addItem("todo", "overnight")
    plan.defer("i1")
    const bedtime = (id) => plan.document.getElementById(id).hasAttribute("data-bedtime")
    expect([bedtime("t1"), bedtime("i1"), bedtime("q1")]).toEqual([true, true, false])
    plan.review("t1")
    plan.queue("i1", "fix it")
    expect([bedtime("t1"), bedtime("i1")]).toEqual([false, false])
    // a backfilled review is stamped that day, not now
    plan.review("q1", { date: "2026-09-20" })
    expect(changed("q1")).toBe(isoTime(new Date(2026, 8, 20)))
  })

  it("colors items:  attention, progress, open, recent, old", () => {
    const plan = freshPlan()
    plan.document.body.setAttribute("data-recent-since", isoTime(new Date(2026, 8, 30)))
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
    plan.document.getElementById("i2").setAttribute("data-changed", isoTime(new Date(2026, 8, 1)))
    plan.document.getElementById("t1").setAttribute("data-working", "")
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
    // a reviewed judgement call is blue once its review is no longer recent
    plan.document.body.setAttribute("data-recent-since", isoTime(new Date(2026, 9, 2)))
    expect(stateOf(plan, "j2", "q2")).toEqual(["open", "old"])
    // no git history:  only a /bedtime run makes green
    plan.document.body.removeAttribute("data-recent-since")
    plan.document.getElementById("q2").setAttribute("data-bedtime", "")
    expect(stateOf(plan, "q2", "c1")).toEqual(["recent", "open"])
  })

  it("writes <body data-recent-since> from recentSince:  a time sets it, null removes it, undefined leaves it", () => {
    const html = readFileSync(join(DOCS, "templates/epics/plan.html"), "utf8")
    const since = "2026-10-03T21:14:02-04:00"
    const plan = PlanDoc.parse(html, NOW, { recentSince: since })
    plan.updateStates()
    expect(plan.document.body.getAttribute("data-recent-since")).toBe(since)
    const kept = PlanDoc.parse(plan.toString(), NOW)
    kept.updateStates()
    expect(kept.document.body.getAttribute("data-recent-since")).toBe(since)
    const none = PlanDoc.parse(plan.toString(), NOW, { recentSince: null })
    none.updateStates()
    expect(none.document.body.hasAttribute("data-recent-since")).toBe(false)
  })

  it("review labels:  to do orange, deferred grey, reviewed green while recent, then grey", () => {
    const plan = freshPlan()
    plan.document.body.setAttribute("data-recent-since", isoTime(new Date(2026, 8, 30)))
    for (const title of ["a", "b", "c"]) plan.addItem("todo", title)
    plan.queue("t1", "do it")
    plan.defer("t2")
    plan.review("t3")
    const color = (id) => plan.document.querySelector(`#${id} .plan-review`).getAttribute("color")
    plan.updateStates()
    expect([color("t1"), color("t2"), color("t3")]).toEqual(["orange", "grey", "green"])
    plan.document.body.setAttribute("data-recent-since", isoTime(new Date(2026, 9, 2)))
    plan.updateStates()
    expect(color("t3")).toBe("grey")
  })

  it("items added while a phase is active carry it;  each phase ends with what it raised that isn't reviewed", () => {
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
    const phase = (id) => plan.document.getElementById(id).getAttribute("data-phase")
    expect([phase("t1"), phase("i1"), phase("q1")]).toEqual([null, "1", "1"])
    plan.updateStates()
    const line = plan.document.querySelector("#p1 > .plan-phase-body > .plan-to-review")
    expect(line.getAttribute("icon")).toBe("list check")
    expect(line.innerHTML).toBe('<b>To review:</b>  <a href="#q1">Q1</a>, <a href="#j1">J1</a>, <a href="#c1">C1</a>')
    expect(line.nextElementSibling).toBe(null)
    expect(plan.document.querySelector("#p2 .plan-to-review")).toBe(null)
    // nothing left:  the line goes
    for (const id of ["q1", "j1", "c1"]) plan.review(id)
    plan.updateStates()
    expect(plan.document.querySelector("#p1 .plan-to-review")).toBe(null)
    expect(plan.check()).toEqual([])
  })

  it("the review picker colors by the plan doc's state", () => {
    const plan = freshPlan()
    plan.addItem("issue", "bug")
    plan.addItem("issue", "queued")
    plan.queue("i2", "fix")
    const section = plan.reviewSections({ filter: "open" }).find((s) => s.kind === "issue")
    const spec = pickerSpec(plan, "/r/docs/epics/demo/demo.html", section, plan.reviewStatus(), "/r/docs/details")
    expect(spec.questions[0].options.map((option) => option.state.color)).toEqual(["red", "orange"])
  })
})

describe("PlanDoc commits", () => {
  const SHA = "cd6a9d7600000000000000000000000000000001"
  const BASE = "https://github.com/spell-app/spell-app"

  it("reads phase and item commits from subjects", () => {
    const parse = (subject) => parseCommitSubject(subject)
    expect(parse("P1:  Side Bar And Chrome -- Spell Docs + Review tabs")).toEqual({
      phases: [1],
      items: [],
      sentence: "Spell Docs + Review tabs"
    })
    expect(parse("P1 follow-up:  ivory rail").phases).toEqual([1])
    expect(parse("P1 follow-up:  ivory rail").sentence).toBe("ivory rail")
    expect(parse("P4 + P5:  both -- did both").phases).toEqual([4, 5])
    expect(parse("WIP P3:  half").phases).toEqual([3])
    expect(parse("review-review P3:  x").phases).toEqual([3])
    expect(parse("P6a:  first half").phases).toEqual([6])
    expect(parse("Fix I3:  the label").items).toEqual(["i3"])
    expect(parse("review-review J2:  y").items).toEqual(["j2"])
    expect(parse("P052 fonts:  x")).toBe(null)
    expect(parse("P052:  x")).toBe(null)
    expect(parse("Merge branch 'main' into review-review")).toBe(null)
    expect(parse("goals skills:  linked")).toBe(null)
  })

  it("finds the GitHub page from the remote, https or ssh", () => {
    expect(githubBase("https://github.com/spell-app/spell-app.git")).toBe(BASE)
    expect(githubBase("git@github.com:spell-app/spell-app.git")).toBe(BASE)
    expect(githubBase("ssh://git@github.com/spell-app/spell-app")).toBe(BASE)
    expect(githubBase("https://gitlab.com/x/y.git")).toBe(null)
    expect(githubBase("")).toBe(null)
  })

  it("lists a phase's commits after Done (else Goal), before the To review line;  replaces by sha", () => {
    const plan = freshPlan()
    plan.addPhase("One", { goal: "<ul><li>g</li></ul>" })
    plan.setPhase(1, "active")
    plan.addItem("caveat", "x")
    plan.updateStates()
    expect(plan.addCommit({ phase: 1 }, SHA, "built <it>", { base: BASE })).toBe("added")
    const fields = () =>
      Array.from(
        plan.document.querySelectorAll("#p1 > .plan-phase-body > *"),
        (field) => field.getAttribute("class") || null
      )
    expect(fields()).toEqual([null, "plan-commits", null, null, "plan-to-review"])
    const field = plan.document.querySelector("#p1 .plan-commits")
    expect(field.getAttribute("icon")).toBe("code branch")
    expect(field.querySelector("ul.plan-commit-list").innerHTML).toBe(
      `<li data-sha="${SHA}"><a class="plan-commit" href="${BASE}/commit/${SHA}" target="github">cd6a9d7</a>  built &lt;it&gt;</li>`
    )
    plan.setPhase(1, "done", { done: "<ul><li>d</li></ul>" })
    expect(plan.addCommit({ phase: 1 }, SHA, "built it again")).toBe("replaced")
    expect(field.querySelectorAll("li").length).toBe(1)
    expect(field.querySelector("li").innerHTML).toBe('<code class="plan-commit">cd6a9d7</code>  built it again')
    expect(plan.hasCommit({ phase: 1 }, SHA)).toBe(true)
  })

  it("lists an item's commits at the end of its details, giving it a panel when it has none", () => {
    const plan = freshPlan()
    plan.addItem("issue", "plain")
    plan.addItem("issue", "detailed", { details: "<p>why</p>" })
    plan.addCommit({ item: "I1" }, SHA, "fixed it", { base: BASE })
    plan.addCommit({ item: "i2" }, SHA, "fixed it too", { base: BASE })
    const plain = plan.document.querySelector("#i1 > ui-accordion.plan-item")
    expect(plain.querySelector(":scope > ui-title > .plan-id").textContent).toBe("I1")
    expect(plain.querySelector(":scope > ui-content > div.plan-commits > ul.plan-commit-list > li")).not.toBe(null)
    const content = plan.document.querySelector("#i2 > ui-accordion > ui-content")
    expect(Array.from(content.children, (child) => child.localName)).toEqual(["p", "div"])
    expect(plan.check()).toEqual([])
  })

  it("backfills from the doc's history, oldest first, once", () => {
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
    const entries = plan.document.querySelectorAll("#p1 .plan-commit-list > li")
    expect(Array.from(entries, (entry) => entry.textContent)).toEqual(["aaaaaaa  the first", "bbbbbbb  more"])
    expect(plan.backfillCommits(log, { base: BASE })).toEqual([])
  })
})

describe("PlanDoc prompt", () => {
  it("quotes the prompt at the top of the Overview:  paragraphs, line breaks, escaped", () => {
    const plan = freshPlan()
    plan.setPrompt("Update the template\n- make <h1> sticky\n\nAlso & more")
    const quote = plan.document.querySelector("blockquote.plan-prompt")
    expect(quote.closest("ui-section").id).toBe("overview")
    expect(quote.innerHTML).toBe("<p>Update the template<br>- make &lt;h1&gt; sticky</p><p>Also &amp; more</p>")
    plan.setPrompt("")
    expect(plan.document.querySelector("blockquote.plan-prompt, .plan-prompt-panel")).toBeNull()
    plan.setPrompt("again")
    const panel = "ui-section#overview > .plan-summary + ui-accordion.plan-prompt-panel"
    expect(plan.document.querySelector(`${panel} > ui-content > blockquote.plan-prompt`).textContent).toBe("again")
  })

  it('folds it away in a "Kickoff prompt" aside, closed;  an old bare quote moves into one', () => {
    const plan = freshPlan()
    plan.setPrompt("make it so")
    const panel = plan.document.querySelector("ui-accordion.plan-prompt-panel.spell-aside")
    expect(panel.querySelector(":scope > ui-title").textContent).toBe("Kickoff prompt")
    expect(panel.hasAttribute("open")).toBe(false)
    // a doc from before 2026-10-04:  the quote bare under the summary
    const quote = panel.querySelector("blockquote.plan-prompt")
    panel.replaceWith(quote)
    expect(plan.migrate()).toContain('kickoff prompt folded into a "Kickoff prompt" aside')
    expect(plan.document.querySelector(".plan-summary + .plan-prompt-panel blockquote.plan-prompt").textContent).toBe(
      "make it so"
    )
    expect(plan.document.querySelectorAll("blockquote.plan-prompt").length).toBe(1)
  })

  it('copies it into the "Plan hung?" notice, exact, with a copy button;  the notice goes with the first phase', () => {
    const plan = freshPlan()
    const copy = () => plan.document.querySelector("ui-message.plan-hung > ui-code.plan-hung-prompt[copy]")
    plan.setPrompt("make <h1> & co\n\nline 3 </script> x")
    expect(copy().querySelector("script").textContent).toBe("make <h1> & co\n\nline 3 <\\/script> x")
    expect(plan.toString()).toContain("make <h1> & co")
    plan.setPrompt("")
    expect(copy()).toBeNull()
    plan.setPrompt("again")
    expect(plan.document.querySelectorAll("ui-code.plan-hung-prompt").length).toBe(1)
    plan.addPhase("First")
    expect(plan.document.querySelector("ui-message.plan-hung")).toBeNull()
    // and with it gone, a new prompt doesn't bring it back
    plan.setPrompt("later")
    expect(copy()).toBeNull()
  })
})

describe("PlanDoc tests", () => {
  it("adds a test to 'To test' (V1), open until closed;  summary counts it", () => {
    const plan = freshPlan()
    const id = plan.addItem("test", "/isolate tmp-x moves within seconds")
    expect(id).toBe("v1")
    expect(plan.document.getElementById("v1").parentElement.closest("ui-section").id).toBe("tests")
    expect(plan.summary().open.test.map((item) => item.id)).toEqual(["v1"])
    plan.setItem("v1", "done")
    expect(plan.summary().open.test).toEqual([])
  })

  it("adds the section to a doc from before it, just above the Log, renumbered", () => {
    const plan = freshPlan()
    plan.document.getElementById("tests").remove()
    expect(headers(plan).at(-1)).toBe("9. Log")
    plan.addItem("test", "x")
    expect(sectionIds(plan).slice(-2)).toEqual(["tests", "log"])
    expect(headers(plan).slice(-2)).toEqual(["8. To test", "9. Log"])
  })
})

describe("PlanDoc migrate", () => {
  /** The old template with two phases (one done), an item with details, an Overview h3 and a link to `#plan`. */
  function filledOldPlan() {
    const plan = oldPlan()
    plan.addPhase("One")
    plan.addPhase("Two")
    plan.addPhase("Three")
    plan.setPhase(1, "done")
    plan.setPhase(2, "done")
    plan.setPhase(3, "active")
    oldDecision(plan, "padding tokens stay public", "<p>why</p>")
    plan.addItem("question", "which emoji names?")
    plan.addItem("question", "still open?")
    oldDecision(plan, "CLDR names (Q1)")
    plan.setItem("q1", "done")
    plan.addItem("issue", "plain")
    plan
      .require("#o1")
      .insertAdjacentHTML("afterend", '<p>back to <a href="#plan">the plan</a>, <a href="#questions">questions</a></p>')
    return plan
  }

  /**
   * Append a decision as docs before D13 had them:  its own `D` id, `open` (as before 2026-10-01), `details` in its
   * panel.
   */
  function oldDecision(plan, title, details) {
    const list = plan.document.querySelector('.plan-items[data-kind="decision"]')
    const id = `d${list.querySelectorAll(':scope > [id^="d"]').length + 1}`
    const line = `<a class="plan-id" href="#${id}">${id.toUpperCase()}</a> <span class="plan-title">${title}</span>`
    const item = plan.element(list.localName === "ol" ? "li" : "ui-item", { id, "data-status": "open" })
    item.innerHTML = details
      ? `<ui-accordion class="plan-item"><ui-title>${line}</ui-title><ui-content>${details}</ui-content></ui-accordion>`
      : line
    list.append(item)
  }

  it("brings an old doc into the current layout", () => {
    const plan = filledOldPlan()
    const changes = plan.migrate()
    expect(changes.length).toBeGreaterThan(3)
    expect(sectionIds(plan)).toEqual([
      "overview",
      "phases",
      "decisions",
      "judgements",
      "caveats",
      "todos",
      "issues",
      "tests",
      "log"
    ])
    expect(headers(plan)[0]).toBe("1. Overview")
    expect(headers(plan)[2]).toBe("3. Questions")
    expect(headers(plan)[3]).toBe("4. Judgement calls")
    expect(headers(plan)[7]).toBe("8. To test")
    expect(headers(plan)[8]).toBe("9. Log")
    // every section a <ui-section>, each top-level one with its icon;  `#phases-section` gone
    expect(plan.document.querySelector("section, h2, h3, ui-sticky.spell-h2, ui-sticky.spell-h3")).toBeNull()
    expect(plan.document.getElementById("phases-section")).toBeNull()
    for (const section of plan.document.querySelectorAll("main > ui-section"))
      expect(section.querySelector(':scope > ui-icon[slot="icon"]')).not.toBeNull()
    // open question on top;  D2 answered Q1, so it went INTO it;  D1 stood alone:  a question born answered, Q3
    const list = plan.document.querySelector('ui-list.plan-items[data-kind="decision"]')
    expect(Array.from(list.children, (item) => `${item.id}:${item.getAttribute("data-status")}`)).toEqual([
      "q2:open",
      "q1:decided",
      "q3:decided"
    ])
    expect(plan.document.querySelector("a.plan-answer")).toBeNull()
    expect(plan.document.querySelector("#q1 .plan-answer-block#d2 > .plan-answer-title").textContent).toBe(
      "D2 · CLDR names"
    )
    expect(plan.document.querySelector('a[href="#questions"]')).toBeNull()
    expect(plan.document.getElementById("o1").getAttribute("header")).toBe("1.1 Structure")
    expect(plan.document.querySelector(".plan-phases")).toBeNull()
    expect(plan.document.querySelector("ui-section#overview > .plan-summary.lede")).not.toBeNull()
    expect(plan.document.querySelector("ui-section#phases > ui-progress.plan-progress")).not.toBeNull()
    expect(plan.document.querySelector("ui-sticky.spell-h1 .plan-step ui-label").textContent).toBe("P3")
    const decision = plan.document.getElementById("q3")
    expect(decision.localName).toBe("ui-item")
    expect(decision.querySelector("ui-accordion.plan-item > ui-title > .plan-title").textContent).toBe(
      "padding tokens stay public"
    )
    expect(decision.querySelector("ui-accordion.plan-item > ui-content").innerHTML).toBe(
      '<div class="plan-answer-block" id="d1"><div class="plan-answer-title"><b>D1</b> · padding tokens stay public' +
        "</div><p>why</p></div>"
    )
    expect(plan.document.querySelector("#i1 > .plan-title").textContent).toBe("plain")
    expect(plan.document.querySelector("ui-list.plan-phase-body > ui-item[icon=bullseye]")).not.toBeNull()
    // both done phases fold;  the active one is left as it was
    expect(folds(plan)).toEqual([true, true, false])
    const active = plan.document.querySelector('ui-section[data-phase="3"] > ui-icon[slot="icon"]')
    expect(active.getAttribute("name")).toBe("circle half stroke")
    expect(plan.check()).toEqual([])
  })

  it("migrates a doc that to-ui-section.js converted first, to the same outline", () => {
    const direct = filledOldPlan()
    direct.migrate()
    const converted = filledOldPlan()
    expect(convertSections(converted.document).converted).toBe(13)
    converted.migrate()
    expect(sectionIds(converted)).toEqual(sectionIds(direct))
    expect(headers(converted)).toEqual(headers(direct))
    expect(converted.phases).toEqual(direct.phases)
    expect(folds(converted)).toEqual(folds(direct))
    const order = (plan) => Array.from(plan.document.querySelectorAll(".plan-items > [id]"), (item) => item.id)
    expect(order(converted)).toEqual(order(direct))
    expect(converted.document.querySelector("ui-section#overview > .plan-summary.lede")).not.toBeNull()
    expect(converted.check()).toEqual([])
  })

  it('titles the page "Epic: <title>", h1 and <title>;  readers drop the prefix', () => {
    const plan = filledOldPlan()
    plan.document.querySelector("h1").textContent = "Old Title"
    plan.document.querySelector("title").textContent = "Old Title"
    expect(plan.migrate()).toContain('page title "Epic: <title>"')
    expect(plan.document.querySelector("h1").textContent).toBe("Epic: Old Title")
    expect(plan.document.querySelector("title").textContent).toBe("Epic: Old Title")
    expect(plan.title).toBe("Old Title")
    expect(plan.summary().title).toBe("Old Title")
  })

  it("moves each section's intro into its data-tip:  the title's tooltip", () => {
    const plan = filledOldPlan()
    plan.migrate()
    const judgements = plan.document.getElementById("judgements")
    expect(judgements.getAttribute("data-tip")).toMatch(/^Choices made without you/)
    expect(plan.document.querySelector("main > ui-section > p.meta")).toBe(null)
    expect(freshPlan().document.querySelector("main > ui-section > p.meta")).toBe(null)
  })

  it('renames "Questions & Decisions" to "Questions", its note too;  old default icons swap, custom ones stay', () => {
    const plan = freshPlan()
    const decisions = plan.document.getElementById("decisions")
    decisions.setAttribute("header", "3. Questions & Decisions")
    decisions.setAttribute(
      "data-tip",
      "Open questions first: waiting on you, each also asked in Claude Code. Then what was decided, and why: " +
        "settled, don't re-argue without new facts. An answered question sits just above its decision."
    )
    decisions.querySelector('ui-icon[slot="icon"]').setAttribute("name", "gavel")
    plan.document.querySelector('#judgements > ui-icon[slot="icon"]').setAttribute("name", "compass")
    plan.document.querySelector('#caveats > ui-icon[slot="icon"]').setAttribute("name", "star")
    const changes = plan.migrate()
    expect(changes).toContain('"Questions & Decisions" titled "Questions", its note too')
    expect(decisions.getAttribute("header")).toBe("3. Questions")
    expect(decisions.getAttribute("data-tip")).toBe(
      freshPlan().document.getElementById("decisions").getAttribute("data-tip")
    )
    const icon = (id) => plan.document.querySelector(`#${id} > ui-icon[slot="icon"]`).getAttribute("name")
    expect([icon("decisions"), icon("judgements"), icon("caveats")]).toEqual(["file circle question", "gavel", "star"])
  })

  it('keeps the hand-written "Judgement calls:" lines (J14);  the "To review" line goes after them', () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.setPhase(1, "active")
    plan.addItem("judgement", "a call")
    plan.addItem("judgement", "accepted")
    plan.setItem("j2", "done")
    plan.document
      .querySelector("#p1 > .plan-phase-body")
      .append(
        plan.fragment(
          '<ui-item icon="compass"><b>Judgement calls:</b>  <a href="#j1">J1</a> <a href="#j2">J2</a></ui-item>'
        )
      )
    plan.migrate()
    const body = plan.document.querySelector("#p1 > .plan-phase-body")
    const lines = Array.from(body.children, (line) => line.textContent.trim().split(":")[0])
    expect(lines.slice(-2)).toEqual(["Judgement calls", "To review"])
    expect(body.querySelector(".plan-to-review").textContent).toBe("To review:  J1")
    expect(plan.migrate()).toEqual([])
  })

  /** An old doc's question list:  struck questions with `→ Dn`, their decisions, stand-alone ones (`html`). */
  function oldQuestions(html) {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.document.querySelector('.plan-items[data-kind="decision"]').innerHTML = html
    return plan
  }

  /** An old struck question `n`, answered by `d` (`→ D<d>`), `details` in its panel. */
  function struck(n, d, details = "") {
    const line =
      `<a class="plan-id" href="#q${n}">Q${n}</a> <span class="plan-title">question ${n}?</span> ` +
      `<a class="plan-answer" href="#d${d}">→ D${d}</a>`
    return details
      ? `<ui-item id="q${n}" data-status="done"><ui-accordion class="plan-item"><ui-title>${line}</ui-title>` +
          `<ui-content>${details}</ui-content></ui-accordion></ui-item>`
      : `<ui-item id="q${n}" data-status="done">${line}</ui-item>`
  }

  /** An old decision `n`, titled `title` (HTML), `details` in its panel, `attributes` on the item. */
  function decision(n, title, details = "", attributes = 'data-status="decided"') {
    const line = `<a class="plan-id" href="#d${n}">D${n}</a> <span class="plan-title">${title}</span>`
    return details
      ? `<ui-item id="d${n}" ${attributes}><ui-accordion class="plan-item"><ui-title>${line}</ui-title>` +
          `<ui-content>${details}</ui-content></ui-accordion></ui-item>`
      : `<ui-item id="d${n}" ${attributes}>${line}</ui-item>`
  }

  /** Two option cards, `A · ...` and `B. ...`, as old docs label them. */
  function cards(a, b) {
    const card = (label) =>
      `<ui-column><ui-segment><ui-label attached="top">${label}</ui-label></ui-segment></ui-column>`
    return `<ui-grid class="spell-pros-cons" columns="2">${card(a)}${card(b)}</ui-grid>`
  }

  it("merges each answering decision INTO its question:  the answer card, keeping its id, marks and details", () => {
    const plan = oldQuestions(
      struck(1, 2, "<p>the options</p>") +
        decision(
          2,
          'Inbox file (<a href="#q1">Q1</a>)',
          '<p>why</p><p class="meta">Answers <a href="#q1">Q1</a>: question 1?</p>',
          'data-status="decided" data-reviewed="2026-10-02" data-changed="2026-10-02T10:00:00-04:00"'
        ) +
        '<ui-item id="q2" data-status="open"><a class="plan-id" href="#q2">Q2</a> <span class="plan-title">open?</span></ui-item>'
    )
    plan.document.getElementById("o1").insertAdjacentHTML("afterend", '<p>see <a href="#d2">D2</a></p>')
    expect(plan.migrate()).toContain("1 decisions merged into questions:  1 answering one, 0 stand-alone")
    const question = plan.document.getElementById("q1")
    expect(question.getAttribute("data-status")).toBe("decided")
    expect(question.hasAttribute("data-answered")).toBe(true)
    expect(question.getAttribute("data-reviewed")).toBe("2026-10-02")
    expect(question.querySelector(".plan-review").textContent).toBe("reviewed 10-02")
    expect(question.querySelector(".plan-answer")).toBeNull()
    expect(question.querySelector("ui-content").innerHTML).toBe(
      '<div class="plan-answer-block" id="d2"><div class="plan-answer-title"><b>D2</b> · Inbox file</div>' +
        "<p>why</p></div><p>the options</p>"
    )
    // the old link lands inside Q1;  open questions stay on top;  `item()` finds Q1 by D2
    expect(plan.check()).toEqual([])
    const order = Array.from(question.parentElement.children, (item) => item.id)
    expect(order).toEqual(["q2", "q1"])
    expect(plan.item("D2")).toBe(question)
    // idempotent
    const html = plan.toString()
    expect(plan.migrate()).toEqual([])
    expect(plan.toString()).toBe(html)
  })

  it("turns a stand-alone decision into a question born answered;  a struck (superseded) one is canceled", () => {
    const plan = oldQuestions(
      struck(1, 1) +
        decision(1, "first (Q1)") +
        decision(2, "<code>alone</code>", "<p>because</p>") +
        decision(3, "superseded", "", 'data-status="done"')
    )
    expect(plan.migrate()).toContain("3 decisions merged into questions:  1 answering one, 2 stand-alone")
    const list = plan.document.querySelector('.plan-items[data-kind="decision"]')
    expect(Array.from(list.children, (item) => `${item.id}:${item.getAttribute("data-status")}`)).toEqual([
      "q1:decided",
      "q2:decided",
      "q3:canceled"
    ])
    const alone = plan.document.getElementById("q2")
    expect(alone.querySelector(":scope > ui-accordion > ui-title").innerHTML).toBe(
      '<a class="plan-id" href="#q2">Q2</a> <span class="plan-title"><code>alone</code></span>'
    )
    expect(alone.querySelector("ui-content").innerHTML).toBe(
      '<div class="plan-answer-block" id="d2"><div class="plan-answer-title"><b>D2</b> · <code>alone</code></div>' +
        "<p>because</p></div>"
    )
    expect(plan.document.querySelector("#q3 > ui-accordion > ui-content > .plan-answer-block#d3")).not.toBeNull()
    expect(plan.document.querySelector("#q1 .plan-answer-title").textContent).toBe("D1 · first")
    plan.updateStates()
    expect(plan.document.getElementById("q3").getAttribute("data-state")).toBe("old")
    expect(plan.summary().open.question).toEqual([])
    expect(plan.check()).toEqual([])
  })

  it("chooses the option the decision names:  a letter first, 'option B', or every word of one option's title", () => {
    const plan = oldQuestions(
      struck(1, 1, cards("A · Inbox file (recommended)", "B · In the doc")) +
        decision(1, "B: written into the doc (Q1)") +
        struck(2, 2, cards("A. Merge each phase (recommended)", "B. Merge at the end")) +
        decision(2, "Merge at the end: main stays as it is (Q2)") +
        struck(3, 3, cards("A · Top-down", "B · Bottom-up")) +
        decision(3, "Neither, really (Q3)", "<p>we went with option A after all</p>") +
        struck(4, 4, cards("A · Page-wide", "B · Per subtree")) +
        decision(4, "Per root (Q4)") +
        struck(5, 5, cards("A · One", "B · Two").replace("<ui-column>", "<ui-column data-chosen>")) +
        decision(5, "B: two (Q5)")
    )
    expect(plan.migrate()).toContain(
      "5 decisions merged into questions:  5 answering one, 0 stand-alone;  options chosen:  3, not inferred:  1"
    )
    const chosen = (id) =>
      plan.document.querySelector(`#${id} ui-column[data-chosen] ui-label`)?.textContent.slice(0, 1) ?? null
    expect(["q1", "q2", "q3", "q4", "q5"].map(chosen)).toEqual(["B", "B", "A", null, "A"])
  })

  it("cancel:  struck through, closed;  reopen undoes it", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.setPhase(1, "active")
    plan.addItem("issue", "moot")
    plan.setItem("i1", "canceled")
    plan.document.body.setAttribute("data-recent-since", "2026-09-01T00:00:00-04:00")
    plan.updateStates()
    const item = plan.document.getElementById("i1")
    expect([item.getAttribute("data-status"), item.getAttribute("data-state")]).toEqual(["canceled", "recent"])
    expect(plan.document.querySelector("#p1 .plan-to-review")).toBeNull()
    expect(plan.summary().open.issue).toEqual([])
    expect(plan.reviewSections({ filter: "all" }).find((s) => s.kind === "issue").items[0].state).toBe("reviewed")
    plan.setItem("i1", "open")
    expect(item.getAttribute("data-status")).toBe("open")
  })

  it("does nothing to a current doc", () => {
    const plan = filledOldPlan()
    plan.migrate()
    const html = plan.toString()
    expect(plan.migrate()).toEqual([])
    expect(plan.toString()).toBe(html)
  })
})

describe("PlanDoc summary, check, output", () => {
  it("summarizes the next phase and what's open", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.addPhase("Two")
    plan.setPhase(1, "done")
    plan.addItem("question", "which browser?")
    plan.addItem("issue", "fixed already")
    plan.setItem("i1", "done")
    const summary = plan.summary()
    expect(summary.next).toEqual({ n: 2, name: "Two", status: "todo" })
    expect(summary.open.question.map((item) => item.id)).toEqual(["q1"])
    expect(summary.open.issue).toEqual([])
  })

  it("reads a doc that predates a kind's section, without adding it", () => {
    const plan = oldPlan()
    const before = plan.toString()
    const summary = plan.summary()
    expect(summary.open.judgement).toEqual([])
    expect(summary.open.test).toEqual([])
    expect(plan.toString()).toBe(before)
  })

  it("check finds broken links and duplicate ids", () => {
    const plan = freshPlan()
    plan.require("#o1").insertAdjacentHTML("afterend", '<p id="o1">see <a href="#i7">I7</a></p>')
    expect(plan.check()).toEqual(['id "o1" used 2 times', 'link to missing #i7 ("I7")'])
  })

  it("writes bare boolean attributes and a lowercase doctype", () => {
    const plan = freshPlan()
    plan.addItem("caveat", "with details", { details: "<p>x</p>" })
    const html = plan.toString()
    expect(html.startsWith("<!doctype html>")).toBe(true)
    expect(html).not.toMatch(/ divided=""/)
    expect(html).toMatch(/<ui-list class="plan-items" data-kind="caveat" divided relaxed>/)
    plan.require("#o1").insertAdjacentHTML("afterend", "<ui-table celled compact striped unstackable></ui-table>")
    expect(plan.toString()).toMatch(/<ui-table celled compact striped unstackable>/)
  })
})

describe("PlanDoc review", () => {
  /** States of `kind`'s section, by id, under `filter`. */
  function states(plan, kind, filter) {
    const section = plan.reviewSections({ filter }).find((s) => s.kind === kind)
    return Object.fromEntries(section.items.map((item) => [item.id, item.state]))
  }

  /** The review label's text on item `id`, or `null`. */
  function label(plan, id) {
    return plan.document.getElementById(id).querySelector(".plan-review")?.textContent ?? null
  }

  it("marks reviewed, deferred and to do, each with a dated label", () => {
    const plan = freshPlan()
    for (const title of ["one", "two", "three", "four"]) plan.addItem("issue", title, { details: "<p>x</p>" })
    expect(plan.review("I1")).toBe("one")
    plan.defer("i2")
    plan.queue("i3", "fix it")
    expect(states(plan, "issue", "all")).toEqual({ I1: "reviewed", I2: "deferred", I3: "queued", I4: "outstanding" })
    expect(label(plan, "i1")).toBe("reviewed 10-01")
    expect(label(plan, "i2")).toBe("deferred")
    expect(label(plan, "i3")).toBe("to do")
    expect(plan.document.getElementById("i3").getAttribute("data-work")).toBe("fix it")
    expect(label(plan, "i4")).toBeNull()
    // the label sits in the panel's title, right after the id
    expect(plan.document.querySelector("#i1 ui-title > .plan-id + .plan-review + .plan-title")).not.toBeNull()
  })

  it("review clears deferred;  unqueue leaves it reviewed;  relabeling leaves one label, no extra spaces", () => {
    const plan = freshPlan()
    plan.addItem("caveat", "one")
    plan.defer("c1")
    plan.review("c1")
    expect(plan.document.getElementById("c1").hasAttribute("data-deferred")).toBe(false)
    plan.queue("c1", "do it")
    plan.unqueue("c1")
    expect(states(plan, "caveat", "all")).toEqual({ C1: "reviewed" })
    const item = plan.document.getElementById("c1")
    expect(item.querySelectorAll(".plan-review").length).toBe(1)
    expect(item.innerHTML).not.toMatch(/ {2}<ui-label/)
  })

  it("counts struck, decided, and items a decision links to as reviewed", () => {
    const plan = freshPlan()
    plan.addItem("caveat", "linked")
    plan.addItem("caveat", "struck")
    plan.addItem("caveat", "neither")
    plan.setItem("c2", "done")
    plan.addItem("decision", "accept it", { details: '<p>see <a href="#c1">C1</a></p>' })
    expect(states(plan, "caveat", "all")).toEqual({ C1: "reviewed", C2: "reviewed", C3: "outstanding" })
  })

  it("filters:  unreviewed (default), open, reviewed, queued;  counts what isn't reviewed", () => {
    const plan = freshPlan()
    for (const title of ["a", "b", "c", "d"]) plan.addItem("todo", title)
    plan.review("t1")
    plan.defer("t2")
    plan.queue("t3", "build it")
    plan.setItem("t1", "done")
    const ids = (filter) => Object.keys(states(plan, "todo", filter))
    expect(ids()).toEqual(["T2", "T4"])
    expect(ids("open")).toEqual(["T2", "T3", "T4"])
    expect(ids("reviewed")).toEqual(["T1", "T3"])
    expect(ids("queued")).toEqual(["T3"])
    const todos = plan.reviewSections().find((s) => s.kind === "todo")
    expect([todos.notReviewed, todos.total]).toEqual([2, 4])
    expect(() => plan.reviewSections({ filter: "nope" })).toThrow(PlanDocError)
  })

  it("sections in page order;  Questions holds questions, never decisions", () => {
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
    expect(sections[0].items.map((item) => [item.id, item.state])).toEqual([
      ["Q2", "outstanding"],
      ["Q1", "reviewed"]
    ])
  })

  it("finds the recommended option:  a label first, then a bold lead, never a table cell", () => {
    const plan = freshPlan()
    plan.addItem("question", "pick", {
      details:
        "<table><tr><td>yes (recommended)</td></tr></table>" +
        '<ui-segment><ui-label attached="top">A. Mark + links (recommended)</ui-label><p>why</p></ui-segment>'
    })
    plan.addItem("question", "bold", { details: "<p><b>Skip short sections (recommended)</b>:  cheap</p>" })
    plan.addItem("question", "none", { details: "<p>no idea yet</p>" })
    plan.addItem("question", "bare")
    const items = plan.reviewSections().find((s) => s.kind === "question").items
    expect(items.map((item) => item.recommendation)).toEqual(["A. Mark + links", "Skip short sections", null, null])
  })

  it("picker spec:  a checkbox per open item, labelled by id, its whole text, its state a badge", () => {
    const plan = freshPlan()
    const details =
      '<p>why:  see <a href="#c1">C1</a> and <a href="../../scripts/x.js">x.js</a></p><ul><li>more</li></ul>'
    for (const title of ["one", "two", "three", "struck"]) plan.addItem("issue", title, { details })
    plan.review("i2")
    plan.defer("i3")
    plan.setItem("i4", "done")
    const section = plan.reviewSections({ filter: "open" }).find((s) => s.kind === "issue")
    const spec = pickerSpec(plan, "/r/docs/epics/demo/demo.plan.html", section, plan.reviewStatus(), "/r/docs/details")
    const [question] = spec.questions
    expect([spec.bare, question.multiple, question.selectAll, question.filter, question.moreDetails]).toEqual([
      true,
      true,
      true,
      true,
      true
    ])
    expect(question.options.map((o) => [o.letter, o.checked, o.done, o.state.icon, o.state.label])).toEqual([
      ["I1", true, false, "circle outline", "Not reviewed yet"],
      ["I2", false, true, "circle check", "Reviewed 2026-10-01"],
      ["I3", true, false, "circle pause", "Deferred 2026-10-01"]
    ])
    // the whole text, its links made to work from the page's folder;  no fold
    expect(question.options[0].body).toBe(
      '<p>why:  see <a href="../epics/demo/demo.plan.html#c1">C1</a> and <a href="../scripts/x.js">x.js</a></p><ul><li>more</li></ul>'
    )
    expect(question.options[0].details).toBeUndefined()
    expect(question.title).toBe("Issues (2/4)")
    expect(spec.askedBy).toBe("<code>/epic review demo</code>")
  })

  it("status:  last review date and count, deferred, the to-do list", () => {
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
})

describe("timeTag", () => {
  it("shows local date and time, and carries the offset in datetime", () => {
    const tag = timeTag(NOW)
    expect(tag).toMatch(/^<time datetime="2026-10-01T09:05[+-]\d\d:\d\d">2026-10-01 09:05<\/time>$/)
  })
})

describe("PlanDoc overnight", () => {
  it("start:  an unnumbered section above the Overview, active, with empty lists", () => {
    const plan = freshPlan()
    expect(plan.overnight).toBe(null)
    plan.startOvernight("P3-P6", "seo")
    expect(sectionIds(plan)[0]).toBe("overnight")
    expect(plan.overnight).toBe("active")
    expect(plan.summary().overnight).toBe("active")
    const section = plan.document.getElementById("overnight")
    expect(section.getAttribute("header")).toBe("Overnight · 2026-10-01")
    expect(section.querySelector(".overnight-summary").textContent).toContain("Running P3-P6 unattended on branch seo")
    expect(section.querySelectorAll(".overnight-none").length).toBe(2)
  })

  it("phase and problem lines:  placeholders go, ids link to items the doc has", () => {
    const plan = freshPlan()
    const judgement = plan.addItem("judgement", "Kept the old parser", {})
    plan.startOvernight("P1")
    plan.overnightPhase(1, `abc1234 built it;  ${judgement.toUpperCase()}, J99`)
    plan.overnightProblem("tests flaky")
    const phases = plan.document.querySelector(".overnight-phases")
    expect(phases.querySelector(".overnight-none")).toBe(null)
    expect(phases.innerHTML).toContain(`<a href="#${judgement}">${judgement.toUpperCase()}</a>`)
    expect(phases.innerHTML).toContain("J99")
    expect(phases.innerHTML).not.toContain('href="#j99"')
    expect(plan.document.querySelector(".overnight-problems").textContent.trim()).toBe("tests flaky")
  })

  it("done, then remove;  a second start replaces the first;  lines need a start", () => {
    const plan = freshPlan()
    expect(() => plan.overnightProblem("x")).toThrow(PlanDocError)
    plan.startOvernight("P1")
    plan.startOvernight("P2")
    expect(plan.document.querySelectorAll("#overnight").length).toBe(1)
    plan.finishOvernight("2 done, 1 WIP")
    expect(plan.overnight).toBe("done")
    expect(plan.document.querySelector(".overnight-summary").textContent).toBe("2 done, 1 WIP")
    expect(plan.removeOvernight()).toBe(true)
    expect(plan.overnight).toBe(null)
    expect(plan.removeOvernight()).toBe(false)
  })

  it("migrate's section ordering leaves it on top", () => {
    const plan = freshPlan()
    plan.startOvernight("P1")
    plan.orderSections()
    expect(sectionIds(plan)[0]).toBe("overnight")
    expect(plan.document.getElementById("overnight").getAttribute("header")).toBe("Overnight · 2026-10-01")
  })
})

describe("PlanDoc review inbox", () => {
  /** Option cards A and B, B recommended, as a question's details. */
  const OPTIONS =
    '<ui-grid class="spell-pros-cons" columns="2" stackable>' +
    '<ui-column><ui-segment><ui-label attached="top">A · Keep folds</ui-label><p>a</p></ui-segment></ui-column>' +
    '<ui-column><ui-segment><ui-label attached="top">B · Unfold   it (recommended)</ui-label><p>b</p></ui-segment></ui-column>' +
    "</ui-grid>"

  /** A doc with one item of each kind, details where they matter. */
  function inboxPlan() {
    const plan = freshPlan()
    plan.addItem("question", "which?", { details: OPTIONS })
    plan.addItem("question", "no recommendation?", { details: "<p>talk</p>" })
    plan.addItem("judgement", "chose X")
    plan.addItem("caveat", "slow")
    plan.addItem("test", "click it")
    return plan
  }

  /** Item `id`'s status. */
  function status(plan, id) {
    return plan.document.getElementById(id).getAttribute("data-status")
  }

  it("optionCards:  letter, title without (recommended), which one is recommended", () => {
    const plan = inboxPlan()
    expect(plan.optionCards(plan.item("q1"))).toEqual([
      { letter: "A", title: "Keep folds", recommended: false },
      { letter: "B", title: "Unfold it", recommended: true }
    ])
    expect(plan.describeItem("J1")).toEqual({ id: "J1", kind: "judgement", status: "open", title: "chose X" })
    expect(plan.describeItem("z9")).toBeNull()
  })

  it("approve:  a question takes its recommended option;  none recommended:  left", () => {
    const plan = inboxPlan()
    expect(plan.applyMark({ id: "q1", action: "approve" })).toEqual({
      applied: true,
      did: "approved:  answered B · Unfold it (recommended)"
    })
    const q1 = plan.document.getElementById("q1")
    expect(q1.getAttribute("data-status")).toBe("decided")
    expect(q1.querySelector(".plan-answer-title").textContent).toBe("Answer · Unfold it")
    expect(q1.querySelector("ui-column[data-chosen] ui-label").textContent).toMatch(/^B/)
    expect(q1.getAttribute("data-reviewed")).toBe("2026-10-01")
    expect(plan.applyMark({ id: "q2", action: "approve" })).toMatchObject({ applied: false, left: /needs talk/ })
    expect(status(plan, "q2")).toBe("open")
  })

  it("approve:  a judgement call and a test close;  a caveat is reviewed;  a closed item reviewed", () => {
    const plan = inboxPlan()
    expect(plan.applyMark({ id: "j1", action: "approve" }).did).toBe("approved:  closed (accepted)")
    expect(plan.applyMark({ id: "v1", action: "approve" }).did).toBe("approved:  closed (passed)")
    expect(plan.applyMark({ id: "c1", action: "approve" }).did).toBe("approved:  reviewed")
    expect(plan.applyMark({ id: "j1", action: "approve" }).did).toBe("approved:  reviewed")
    expect([status(plan, "j1"), status(plan, "v1"), status(plan, "c1")]).toEqual(["done", "done", "open"])
    expect(plan.document.getElementById("c1").getAttribute("data-reviewed")).toBe("2026-10-01")
    const log = Array.from(plan.document.querySelectorAll(".plan-log ui-summary"), (line) => line.textContent)
    expect(log.at(-1)).toMatch(/J1 approved:  reviewed$/)
  })

  it("pick, todo;  revisit and details left;  a gone item flagged", () => {
    const plan = inboxPlan()
    expect(plan.applyMark({ id: "q1", action: "pick", pick: "A" }).did).toBe("picked A:  Keep folds")
    expect(plan.document.querySelector("#q1 .plan-answer-title").textContent).toBe("Answer · Keep folds")
    expect(plan.applyMark({ id: "q1", action: "pick", pick: "C" })).toMatchObject({
      applied: false,
      left: "no option C"
    })
    expect(plan.applyMark({ id: "c1", action: "todo" }).did).toBe("to todo T1")
    const t1 = plan.document.getElementById("t1")
    expect(t1.querySelector(".plan-title").textContent).toBe("Follow up:  slow")
    expect(t1.querySelector('ui-content a[href="#c1"]').textContent).toBe("C1")
    expect(plan.applyMark({ id: "q2", action: "revisit", when: "soon", note: "why?" })).toEqual({
      applied: false,
      left: 'to talk over:  "why?"'
    })
    expect(plan.applyMark({ id: "q2", action: "details" }).applied).toBe(false)
    expect(plan.applyMark({ id: "i9", action: "approve" })).toMatchObject({ applied: false, gone: true })
  })

  it("a revisit with a pick:  left to talk over, the question NOT answered", () => {
    const plan = inboxPlan()
    expect(plan.applyMark({ id: "q1", action: "revisit", when: "soon", note: "only plan docs?", pick: "A" })).toEqual({
      applied: false,
      left: 'to talk over:  picks A · Keep folds, asks:  "only plan docs?"'
    })
    expect(status(plan, "q1")).toBe("open")
    expect(plan.document.querySelector("#q1 ui-column[data-chosen]")).toBeNull()
    expect(plan.applyMark({ id: "q1", action: "revisit", when: "soon", note: "", pick: "C" }).left).toBe(
      "to talk over:  picks C (no such option card), no note"
    )
    expect(pickAsks("B", { letter: "B", title: "Unfold it" }, "why?")).toBe('picks B · Unfold it, asks:  "why?"')
  })

  it("setDetails:  replace or append, between the answer card and the commits;  stamped", () => {
    const plan = inboxPlan()
    plan.decide("q1", "B")
    plan.addCommit({ item: "q1" }, "abc1234", "did it")
    plan.setDetails("q1", "<p>new</p>")
    const content = () =>
      Array.from(plan.document.querySelector("#q1 ui-content").children, (el) => el.className || el.localName)
    expect(content()).toEqual(["plan-answer-block", "p", "plan-commits"])
    plan.setDetails("q1", '<div class="plan-reply">re</div>', { append: true })
    expect(content()).toEqual(["plan-answer-block", "p", "plan-reply", "plan-commits"])
    // an item without details gets a panel
    plan.setDetails("c1", "<p>more</p>")
    expect(plan.document.querySelector("#c1 > ui-accordion > ui-content").innerHTML).toBe("<p>more</p>")
    expect(plan.document.getElementById("c1").getAttribute("data-changed")).toMatch(/^2026-10-01T09:05/)
  })
})
