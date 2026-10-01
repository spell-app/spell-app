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

describe("PlanDoc phases", () => {
  it("adds phases to the list and to #phases, todo, numbered in order", () => {
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
    expect(plan.document.querySelector('section[data-phase="2"]').textContent).toContain("sidebar from headings")
    expect(plan.check()).toEqual([])
  })

  it("sets status in the list and on the heading, and logs it", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.setPhase(1, "active")
    expect(plan.activePhase).toBe(1)
    const step = plan.document.querySelector('ui-steps.plan-phases > ui-step[data-phase="1"]')
    expect([step.hasAttribute("selected"), step.hasAttribute("completed")]).toEqual([true, false])
    expect(step.getAttribute("href")).toBe("#p1")
    expect(plan.document.querySelector("#p1 ui-icon").getAttribute("name")).toBe("circle half stroke")
    expect(plan.document.querySelector(".plan-log").textContent).toContain("2026-10-01 09:05 P1 active")
    plan.setPhase(1, "done")
    expect([step.hasAttribute("selected"), step.hasAttribute("completed")]).toEqual([false, true])
    expect(() => plan.setPhase(1, "finished")).toThrow(PlanDocError)
  })

  it("keeps the progress bar at done of all phases, hidden while there are none", () => {
    const plan = freshPlan()
    const bar = plan.document.querySelector("ui-progress.plan-progress")
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

  it("still edits docs with the old list markup (`ul.plan-phases`, `ul.plan-log`)", () => {
    const html = readFileSync(join(DOCS, "templates/plans/plan.html"), "utf8")
      .replace(/<ui-steps class="plan-phases"[^>]*><\/ui-steps>/, '<ul class="plan-phases"></ul>')
      .replace(/<ui-feed class="plan-log"[\s\S]*?<\/ui-feed>/, '<ul class="plan-log"></ul>')
    const plan = PlanDoc.parse(html, NOW)
    plan.addPhase("One")
    plan.setPhase(1, "active")
    const icons = plan.document.querySelectorAll('[data-phase="1"] ui-icon')
    expect(Array.from(icons, (icon) => icon.getAttribute("name"))).toEqual(["circle half stroke", "circle half stroke"])
    expect(plan.phases).toEqual([{ n: 1, name: "One", status: "active" }])
    expect(plan.document.querySelector("ul.plan-log > li").textContent).toContain("2026-10-01 09:05 P1 active")
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
    const li = plan.document.getElementById("c2")
    expect(li.querySelector("a.plan-id").getAttribute("href")).toBe("#c2")
    expect(li.querySelector("ui-accordion.spell-aside ui-content").innerHTML).toBe("<p>why</p>")
    expect(plan.check()).toEqual([])
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

  it("marks items UPDATE only while a phase is active", () => {
    const plan = freshPlan()
    plan.addPhase("One")
    plan.addItem("todo", "before")
    plan.setPhase(1, "active")
    plan.addItem("todo", "during")
    expect(plan.document.querySelector("#t1 .plan-update")).toBeNull()
    expect(plan.document.querySelector("#t2 .plan-update").getAttribute("data-phase")).toBe("1")
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
    expect(html).not.toMatch(/ styled=""/)
    expect(html).toMatch(/<ui-accordion class="spell-aside" styled>/)
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
