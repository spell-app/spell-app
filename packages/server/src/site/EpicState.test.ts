import { describe, expect, it } from "vite-plus/test"

import { epicStateFor, epicStateMark, idleDays, urgentWords } from "$/server/site/EpicState"

// epic `airplane` P8 (Owen, 2026-10-10):  in progress, errors, done, paused;  future as before;  no sleeping
describe("epicStateFor()", () => {
  const now = new Date(2026, 9, 10, 21, 30)
  const state = (facts: Parameters<typeof epicStateFor>[0]) => epicStateFor(facts, now)

  it("is in progress with phases left, touched in the last 3 days or a session running;  paused after", () => {
    expect(state({ phases: ["done", "todo"], updated: "2026-10-08" })).toMatchObject({
      name: "progress",
      color: "blue",
      count: "1/2",
      tip: "in progress:  1/2 phases done, updated 2026-10-08"
    })
    // between phases, open items and all:  still in progress (it used to sleep)
    expect(state({ phases: ["done", "todo"], updated: "2026-10-10", urgent: ["q1"] }).name).toBe("progress")
    expect(state({ phases: ["done", "active"], updated: "2026-10-07" })).toMatchObject({
      name: "paused",
      color: "grey",
      icon: "circle pause",
      tip: "paused:  no update since 2026-10-07, 1/2 phases done"
    })
    expect(state({ phases: ["done", "active"], updated: "2026-10-01", running: true, active: "P2 · Two" }).tip).toBe(
      "in progress:  P2 · Two under way, a session is running"
    )
    expect(state({ phases: [], updated: "2026-10-09" }).tip).toBe(
      "in progress:  planning, no phases yet, updated 2026-10-09"
    )
    expect(state({ phases: ["todo"] }).name).toBe("progress")
  })

  it("is done or has errors once every phase is done:  errors while items need Owen", () => {
    expect(state({ phases: ["done", "done"], updated: "2026-01-01" })).toMatchObject({ name: "done", color: "green" })
    expect(state({ phases: ["done"], urgent: ["j3", "q1", "j4"] })).toMatchObject({
      name: "errors",
      color: "red",
      icon: "circle exclamation",
      tip: "errors:  every phase done, but 1 question, 2 judgement calls need you"
    })
  })

  it("keeps a future epic's seedling", () => {
    expect(state({ phases: [], future: true, updated: "2026-01-01" })).toMatchObject({
      name: "future",
      icon: "seedling"
    })
  })
})

describe("the rest", () => {
  it("draws a card's mark:  the count for in progress, else the icon;  the tooltip escaped", () => {
    const now = new Date(2026, 9, 10)
    expect(epicStateMark(epicStateFor({ phases: ["done", "todo"], active: "P2 · <a> & b" }, now))).toBe(
      '<ui-label class="spell-epic-state" size="mini" color="blue" basic title="in progress:  P2 · &lt;a&gt; &amp; b under way">1/2</ui-label>'
    )
    expect(epicStateMark(epicStateFor({ phases: ["done"] }, now))).toBe(
      '<ui-icon class="spell-epic-state" name="circle check" color="green" title="done:  every phase done, nothing needs you"></ui-icon>'
    )
  })

  it("counts calendar days, and words urgent items by kind", () => {
    expect(idleDays("2026-10-07", new Date(2026, 9, 10, 0, 1))).toBe(3)
    expect(idleDays("2026-10-10", new Date(2026, 9, 10, 23, 59))).toBe(0)
    expect(idleDays(null)).toBeUndefined()
    expect(urgentWords(["i1", "q2", "i3"])).toBe("1 question, 2 issues")
    expect(urgentWords(["x1"])).toBe("1 item")
  })
})
