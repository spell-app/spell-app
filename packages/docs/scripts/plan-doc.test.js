import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { DOCS } from "./pages.js"
import { PlanDoc, PlanDocError, parseDuration, timeTag } from "./plan-doc.js"
import { convertSections } from "./to-ui-section.js"

/** When the tests' edits happen:  local 2026-10-01 09:05. */
const NOW = new Date(2026, 9, 1, 9, 5)

/** A fresh plan doc from the real template, so the tests break when the template drifts from the script. */
function freshPlan() {
  return PlanDoc.parse(readFileSync(join(DOCS, "templates/epics/plan.html"), "utf8"), NOW)
}

/** A plan doc in the layout before 2026-10-01 (`#plan` with a phase list, `ol.plan-items`):  the old template. */
function oldPlan() {
  return PlanDoc.parse(readFileSync(join(DOCS, "scripts/fixtures/plan-2026-09-30.html"), "utf8"), NOW)
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
    expect(sectionIds(plan)).toEqual(["overview", "phases", "decisions", "caveats", "todos", "issues", "tests", "log"])
    expect(headers(plan)[2]).toBe("3. Questions & Decisions")
    for (const section of plan.document.querySelectorAll("main > ui-section")) {
      expect(section.querySelector(':scope > ui-icon[slot="icon"]')).not.toBeNull()
      for (const flag of ["sticky", "collapsible", "dividing"]) expect(section.hasAttribute(flag)).toBe(true)
    }
    expect(plan.document.querySelector("#overview > ui-section#o1").getAttribute("header")).toBe("1.1 Structure")
    expect(plan.document.querySelector("section, h2, h3")).toBeNull()
    expect(plan.document.querySelector("ui-sticky.spell-h1 > header.spell-page-head > h1")).not.toBeNull()
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
      '<ui-section id="p2" data-phase="2" data-status="todo" header="P2 · Runtime + Index" sticky collapsible dividing>'
    )
    const body = plan.document.querySelector('ui-section[data-phase="2"] > ui-list.plan-phase-body')
    expect(Array.from(body.children, (item) => item.getAttribute("icon"))).toEqual([
      "bullseye",
      "folder",
      "flask",
      "clock"
    ])
    expect(body.textContent).toContain("sidebar from headings")
    expect(plan.check()).toEqual([])
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
    expect(step.querySelector("ui-label").textContent).toBe("next:  P1 · One")
    plan.setPhase(1, "active")
    const active = step.querySelector("ui-label")
    expect([active.textContent, active.getAttribute("color"), active.getAttribute("href")]).toEqual([
      "P1 · One",
      "orange",
      "#p1"
    ])
    plan.setPhase(1, "done")
    plan.setPhase(2, "done")
    expect(step.querySelector("ui-label").textContent).toBe("DONE")
    expect(step.hasAttribute("hidden")).toBe(false)
  })

  it("folds every done phase but the one finished last", () => {
    const plan = freshPlan()
    for (const name of ["One", "Two", "Three"]) plan.addPhase(name)
    plan.setPhase(1, "done")
    plan.setPhase(2, "done")
    expect(folds(plan)).toEqual([true, false, false])
    // redoing P1:  it's the last finished now, P2 folds
    plan.setPhase(1, "active")
    expect(folds(plan)).toEqual([false, false, false])
    plan.setPhase(1, "done")
    expect(folds(plan)).toEqual([false, true, false])
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
    const html = readFileSync(join(DOCS, "scripts/fixtures/plan-2026-09-30.html"), "utf8")
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
    expect(plan.document.querySelector("blockquote.plan-prompt").nextElementSibling.className).toBe("plan-estimate")
  })

  it("adds the field to a phase made without one", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.document.querySelector('#p1 ui-item[icon="clock"]').remove()
    expect(plan.phases[0].estimate).toBeUndefined()
    plan.setEstimate(1, "1h")
    expect(plan.document.querySelector('#p1 ui-item[icon="clock"]').textContent).toBe("Estimate:  1h")
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

  it("titles an item's details panel with the item's line, not 'details'", () => {
    const plan = freshPlan()
    plan.addItem("decision", "padding tokens stay public (Q8)", { details: "<p>why</p>" })
    const panel = plan.document.querySelector("#d1 > ui-accordion.plan-item")
    expect(panel.querySelector("ui-title > a.plan-id").textContent).toBe("D1")
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

  it("share one list:  open questions on top, decisions in force `decided`", () => {
    const plan = freshPlan()
    plan.addItem("decision", "first")
    plan.addItem("question", "which?")
    plan.addItem("decision", "second")
    plan.addItem("question", "and?")
    expect(order(plan)).toEqual(["q1:open", "q2:open", "d1:decided", "d2:decided"])
    expect(plan.items("question").map((item) => item.id)).toEqual(["q1", "q2"])
    expect(plan.summary().open.question.map((item) => item.id)).toEqual(["q1", "q2"])
  })

  it("decide:  the answer at the end, linked to its question, which is struck and moved beside it", () => {
    const plan = freshPlan()
    plan.addItem("question", "which browser?")
    plan.addItem("question", "later?")
    plan.addItem("decision", "earlier")
    expect(plan.decide("Q1", "Chrome first", { details: "<p>most readers</p>" })).toBe("d2")
    expect(order(plan)).toEqual(["q2:open", "d1:decided", "q1:done", "d2:decided"])
    const decision = plan.document.getElementById("d2")
    expect(decision.querySelector(".plan-title").textContent).toBe("Chrome first (Q1)")
    expect(decision.querySelector(".plan-title a").getAttribute("href")).toBe("#q1")
    expect(decision.querySelector("ui-content").textContent).toContain("Answers Q1:  which browser?")
    expect(plan.document.querySelector("#q1 a.plan-answer").getAttribute("href")).toBe("#d2")
    expect(() => plan.decide("d1", "nope")).toThrow(PlanDocError)
    expect(plan.check()).toEqual([])
  })

  it("closing a decision supersedes it;  reopening puts it back in force", () => {
    const plan = freshPlan()
    plan.addItem("decision", "one")
    plan.setItem("d1", "done")
    expect(order(plan)).toEqual(["d1:done"])
    plan.setItem("d1", "open")
    expect(order(plan)).toEqual(["d1:decided"])
  })
})

describe("PlanDoc prompt", () => {
  it("quotes the prompt at the top of the Overview:  paragraphs, line breaks, escaped", () => {
    const plan = freshPlan()
    plan.setPrompt("Update the template\n- make <h1> sticky\n\nAlso & more")
    const quote = plan.document.querySelector("blockquote.plan-prompt")
    expect(quote.parentElement.id).toBe("overview")
    expect(quote.innerHTML).toBe("<p>Update the template<br>- make &lt;h1&gt; sticky</p><p>Also &amp; more</p>")
    plan.setPrompt("")
    expect(plan.document.querySelector("blockquote.plan-prompt")).toBeNull()
    plan.setPrompt("again")
    expect(plan.document.querySelector(".plan-summary + blockquote.plan-prompt").textContent).toBe("again")
  })

  it('copies it into the "Plan hung?" notice, exact, with a copy button;  the notice goes once a phase starts', () => {
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
    plan.setPhase(1, "todo")
    expect(plan.document.querySelector("ui-message.plan-hung")).not.toBeNull()
    plan.setPhase(1, "active")
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
    expect(headers(plan).at(-1)).toBe("8. Log")
    plan.addItem("test", "x")
    expect(sectionIds(plan).slice(-2)).toEqual(["tests", "log"])
    expect(headers(plan).slice(-2)).toEqual(["7. To test", "8. Log"])
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
    plan.addItem("decision", "padding tokens stay public", { details: "<p>why</p>" })
    plan.addItem("question", "which emoji names?")
    plan.addItem("question", "still open?")
    plan.addItem("decision", "CLDR names (Q1)")
    plan.setItem("q1", "done")
    // decisions in old docs are `open`
    for (const id of ["d1", "d2"]) plan.document.getElementById(id).setAttribute("data-status", "open")
    plan.addItem("issue", "plain")
    plan
      .require("#o1")
      .insertAdjacentHTML("afterend", '<p>back to <a href="#plan">the plan</a>, <a href="#questions">questions</a></p>')
    return plan
  }

  it("brings an old doc into the current layout", () => {
    const plan = filledOldPlan()
    const changes = plan.migrate()
    expect(changes.length).toBeGreaterThan(3)
    expect(sectionIds(plan)).toEqual(["overview", "phases", "decisions", "caveats", "todos", "issues", "tests", "log"])
    expect(headers(plan)[0]).toBe("1. Overview")
    expect(headers(plan)[2]).toBe("3. Questions & Decisions")
    expect(headers(plan)[6]).toBe("7. To test")
    expect(headers(plan)[7]).toBe("8. Log")
    // every section a <ui-section>, each top-level one with its icon;  `#phases-section` gone
    expect(plan.document.querySelector("section, h2, h3, ui-sticky.spell-h2, ui-sticky.spell-h3")).toBeNull()
    expect(plan.document.getElementById("phases-section")).toBeNull()
    for (const section of plan.document.querySelectorAll("main > ui-section"))
      expect(section.querySelector(':scope > ui-icon[slot="icon"]')).not.toBeNull()
    // open question on top, the answered one just before its decision, decisions in force `decided`
    const list = plan.document.querySelector('ui-list.plan-items[data-kind="decision"]')
    expect(Array.from(list.children, (item) => `${item.id}:${item.getAttribute("data-status")}`)).toEqual([
      "q2:open",
      "d1:decided",
      "q1:done",
      "d2:decided"
    ])
    expect(plan.document.querySelector("#q1 a.plan-answer").getAttribute("href")).toBe("#d2")
    expect(plan.document.querySelector('a[href="#questions"]')).toBeNull()
    expect(plan.document.getElementById("o1").getAttribute("header")).toBe("1.1 Structure")
    expect(plan.document.querySelector(".plan-phases")).toBeNull()
    expect(plan.document.querySelector("ui-section#overview > .plan-summary.lede")).not.toBeNull()
    expect(plan.document.querySelector("ui-section#phases > ui-progress.plan-progress")).not.toBeNull()
    expect(plan.document.querySelector("ui-sticky.spell-h1 .plan-step ui-label").textContent).toBe("P3 · Three")
    const decision = plan.document.getElementById("d1")
    expect(decision.localName).toBe("ui-item")
    expect(decision.querySelector("ui-accordion.plan-item > ui-title > .plan-title").textContent).toBe(
      "padding tokens stay public"
    )
    expect(decision.querySelector("ui-accordion.plan-item > ui-content").innerHTML).toBe("<p>why</p>")
    expect(plan.document.querySelector("#i1 > .plan-title").textContent).toBe("plain")
    expect(plan.document.querySelector("ui-list.plan-phase-body > ui-item[icon=bullseye]")).not.toBeNull()
    expect(folds(plan)).toEqual([true, false, false])
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

describe("timeTag", () => {
  it("shows local date and time, and carries the offset in datetime", () => {
    const tag = timeTag(NOW)
    expect(tag).toMatch(/^<time datetime="2026-10-01T09:05[+-]\d\d:\d\d">2026-10-01 09:05<\/time>$/)
  })
})
