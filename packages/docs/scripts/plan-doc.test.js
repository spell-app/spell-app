import { readFileSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { DOCS } from "./pages.js"
import { PlanDoc, PlanDocError, timeTag } from "./plan-doc.js"

/** When the tests' edits happen:  local 2026-10-01 09:05. */
const NOW = new Date(2026, 9, 1, 9, 5)

/** A fresh plan doc from the real template, so the tests break when the template drifts from the script. */
function freshPlan() {
  return PlanDoc.parse(readFileSync(join(DOCS, "templates/plans/plan.html"), "utf8"), NOW)
}

/** A plan doc in the layout before 2026-10-01 (`#plan` with a phase list, `ol.plan-items`):  the old template. */
function oldPlan() {
  return PlanDoc.parse(readFileSync(join(DOCS, "scripts/fixtures/plan-2026-09-30.html"), "utf8"), NOW)
}

/** Ids of `plan`'s h2s, in page order. */
function sectionIds(plan) {
  return Array.from(plan.document.querySelectorAll("main h2"), (h2) => h2.id)
}

describe("PlanDoc layout", () => {
  it("has the sections in order, the h1 in a sticky header, no #plan", () => {
    const plan = freshPlan()
    expect(sectionIds(plan)).toEqual(["overview", "phases", "decisions", "caveats", "todos", "issues", "log"])
    expect(plan.document.getElementById("decisions").textContent).toContain("3. Questions & Decisions")
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
    const heading = plan.document.getElementById("p2")
    expect(heading.textContent).toContain("P2 · Runtime + Index")
    expect(heading.querySelector("ui-icon").getAttribute("name")).toBe("circle outline")
    const body = plan.document.querySelector('section[data-phase="2"] > ui-list.plan-phase-body')
    expect(Array.from(body.children, (item) => item.getAttribute("icon"))).toEqual(["bullseye", "folder", "flask"])
    expect(body.textContent).toContain("sidebar from headings")
    expect(plan.check()).toEqual([])
  })

  it("sets status on the section and its heading, and logs it", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.setPhase(1, "active")
    expect(plan.activePhase).toBe(1)
    const section = plan.document.querySelector('section[data-phase="1"]')
    expect(section.getAttribute("data-status")).toBe("active")
    expect(plan.document.querySelector("#p1 ui-icon").getAttribute("name")).toBe("circle half stroke")
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
    const folds = () =>
      Array.from(plan.document.querySelectorAll("section[data-phase]"), (section) => section.getAttribute("data-fold"))
    expect(folds()).toEqual(["closed", null, null])
    // redoing P1:  it's the last finished now, P2 folds
    plan.setPhase(1, "active")
    plan.setPhase(1, "done")
    expect(folds()).toEqual([null, "closed", null])
  })

  it("keeps the progress bar at done of all phases, hidden while there are none", () => {
    const plan = freshPlan()
    const bar = plan.document.querySelector("ui-progress.plan-progress")
    expect(bar.closest("section").querySelector("h2").id).toBe("phases")
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
    expect(quote.closest("section").querySelector("h2").id).toBe("overview")
    expect(quote.innerHTML).toBe("<p>Update the template<br>- make &lt;h1&gt; sticky</p><p>Also &amp; more</p>")
    plan.setPrompt("")
    expect(plan.document.querySelector("blockquote.plan-prompt")).toBeNull()
    plan.setPrompt("again")
    expect(plan.document.querySelector(".plan-summary + blockquote.plan-prompt").textContent).toBe("again")
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
    expect(sectionIds(plan)).toEqual(["overview", "phases", "decisions", "caveats", "todos", "issues", "log"])
    const h2s = Array.from(plan.document.querySelectorAll("main h2"), (h2) => h2.textContent.trim())
    expect(h2s[0]).toBe("1. Overview")
    expect(h2s[2]).toBe("3. Questions & Decisions")
    expect(h2s[6]).toBe("7. Log")
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
    expect(plan.document.getElementById("o1").textContent).toBe("1.1 Structure")
    expect(plan.document.querySelector(".plan-phases")).toBeNull()
    expect(
      plan.document.querySelector("#overview").closest("section").querySelector(".plan-summary.lede")
    ).not.toBeNull()
    expect(plan.document.querySelector("#phases-section > ui-progress.plan-progress")).not.toBeNull()
    expect(plan.document.querySelector("ui-sticky.spell-h1 .plan-step ui-label").textContent).toBe("P3 · Three")
    const decision = plan.document.getElementById("d1")
    expect(decision.localName).toBe("ui-item")
    expect(decision.querySelector("ui-accordion.plan-item > ui-title > .plan-title").textContent).toBe(
      "padding tokens stay public"
    )
    expect(decision.querySelector("ui-accordion.plan-item > ui-content").innerHTML).toBe("<p>why</p>")
    expect(plan.document.querySelector("#i1 > .plan-title").textContent).toBe("plain")
    expect(plan.document.querySelector("ui-list.plan-phase-body > ui-item[icon=bullseye]")).not.toBeNull()
    const folds = Array.from(plan.document.querySelectorAll("section[data-phase]"), (s) => s.getAttribute("data-fold"))
    expect(folds).toEqual(["closed", null, null])
    expect(plan.check()).toEqual([])
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
