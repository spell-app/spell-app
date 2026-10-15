import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { EpicAddress, PageTargets } from "$/epics/links"

describe("EpicAddress.parse()", () => {
  test("the four forms:  saga page, an item on it, epic page, an item on that", () => {
    const shape = (text: string) => {
      const { saga, epic, item, page, id } = EpicAddress.parse(text)
      return { saga, epic, item, page, id }
    }
    expect(shape("SAGA:/drawable-spell")).toEqual({
      saga: "drawable-spell",
      epic: undefined,
      item: undefined,
      page: "sagas/drawable-spell/drawable-spell.saga.html",
      id: undefined
    })
    expect(shape("SAGA:/drawable-spell#T3")).toMatchObject({ item: "T3", id: "t3" })
    expect(shape("SAGA:/drawable-spell/python-target")).toMatchObject({
      epic: "python-target",
      page: "epics/python-target/python-target.plan.html"
    })
    expect(shape("SAGA:/drawable-spell/python-target#T1")).toMatchObject({ epic: "python-target", id: "t1" })
  })

  test("the colon form, any case, a trailing slash:  read the same;  written back in the slash form", () => {
    for (const text of ["SAGA:/drawable-spell:python-target#T1", "saga:/Drawable-Spell/Python-Target/#t1"])
      expect(EpicAddress.parse(text).toString()).toBe("SAGA:/drawable-spell/python-target#T1")
  })

  test("anything else throws;  `isAddress()` tells an href for one", () => {
    for (const text of ["SAGA:/", "SAGA:/a/b/c", "SAGA:/a#", "GOAL:/a", "epics/a/a.plan.html", "SAGA:/a b"])
      expect(() => EpicAddress.parse(text), text).toThrow(TypeError)
    expect(EpicAddress.isAddress("saga:/x")).toBe(true)
    expect(EpicAddress.isAddress("../x.html")).toBe(false)
  })

  test("the page server's typed path, under a worktree too", () => {
    expect(EpicAddress.fromPath("/saga/epics/seo")?.page).toBe("epics/seo/seo.plan.html")
    expect(EpicAddress.fromPath("/worktrees/w/saga/epics")?.page).toBe("sagas/epics/epics.saga.html")
    expect(EpicAddress.fromPath("/sagas/epics/epics.saga.html")).toBeUndefined()
    expect(EpicAddress.parse("SAGA:/epics/seo").serverPath).toBe("/saga/epics/seo")
  })
})

describe("EpicAddress from `<epic-link>`'s attributes", () => {
  test("no saga needed with an epic;  none of either:  the page it's in", () => {
    expect(new EpicAddress({ epic: "seo", item: "J3" }).hrefFrom("http://x/")).toBe(
      "http://x/epics/seo/seo.plan.html#j3"
    )
    expect(new EpicAddress({ item: "T3" }).hrefFrom("http://x/")).toBe("#t3")
    expect(new EpicAddress({ saga: "epics", item: "T3" }).page).toBe("sagas/epics/epics.saga.html")
    expect(new EpicAddress({ epic: "seo", item: "J3" }).toString()).toBe('<epic-link epic="seo" item="J3">')
  })

  test("bad names, a bad id, or an item AND a phase:  `TypeError`", () => {
    expect(() => new EpicAddress({ saga: "Drawable Spell" })).toThrow(TypeError)
    expect(() => new EpicAddress({ item: "#t1" })).toThrow(TypeError)
    expect(() => new EpicAddress({ item: "T1", phase: "7" })).toThrow(TypeError)
  })

  test("the short form:  `python-target T1`, `T1` on its own page, a phase with its number and title", () => {
    const item = new EpicAddress({ saga: "drawable-spell", epic: "python-target", item: "t1" })
    expect(item.labelFor()).toBe("python-target T1")
    expect(item.labelFor({ samePage: true })).toBe("T1")
    expect(new EpicAddress({ saga: "epics", item: "T3" }).labelFor()).toBe("epics T3")
    expect(new EpicAddress({ epic: "seo" }).labelFor()).toBe("seo")
    const phase = new EpicAddress({ phase: "epic-migrate" })
    expect(phase.labelFor({ samePage: true, landing: { id: "p7", title: "Epic Migrate", number: 7 } })).toBe(
      "P7 · Epic Migrate"
    )
    expect(phase.labelFor({ samePage: true })).toBe("epic-migrate")
    expect(new EpicAddress({ epic: "seo", phase: "P2" }).labelFor()).toBe("seo P2")
  })
})

describe("phases", () => {
  const phases = [
    { id: "p1", title: "CLI Doc Refresh" },
    { id: "p-epic-migrate", title: "Epic Migrate" },
    { id: "p3", title: "Send Command" }
  ]

  test("by number, by stable id, by name:  with its place as its number", () => {
    expect(EpicAddress.findPhase(phases, "2")).toMatchObject({ phase: { id: "p-epic-migrate" }, number: 2 })
    expect(EpicAddress.findPhase(phases, "P3")?.number).toBe(3)
    expect(EpicAddress.findPhase(phases, "epic-migrate")?.number).toBe(2)
    expect(EpicAddress.findPhase(phases, "p-epic-migrate")?.number).toBe(2)
    expect(EpicAddress.findPhase(phases, "Send Command")?.phase.id).toBe("p3")
    expect(EpicAddress.findPhase(phases, "send-command")?.phase.id).toBe("p3")
    expect(EpicAddress.findPhase(phases, "9")).toBeUndefined()
    expect(EpicAddress.findPhase(phases, "nope")).toBeUndefined()
  })

  test("unread pages:  a number guesses `p7`, a name its stable id", () => {
    expect(EpicAddress.phaseIdFor("P7")).toBe("p7")
    expect(EpicAddress.phaseIdFor("Epic Migrate")).toBe("p-epic-migrate")
    expect(EpicAddress.phaseIdFor("p-epic-migrate")).toBe("p-epic-migrate")
  })
})

describe("the checkout's root", () => {
  test("served:  the origin, a worktree's prefix kept;  `file:`, from the pack or the docs bundle", () => {
    expect(EpicAddress.rootUrl("http://127.0.0.1:4747/epics/a/a.plan.html#t1", [])).toBe("http://127.0.0.1:4747/")
    expect(EpicAddress.rootUrl("http://h/worktrees/w/components/epics/x.html", [])).toBe("http://h/worktrees/w/")
    const file = "file:///Users/o/spell-app/epics/a/a.plan.html"
    expect(
      EpicAddress.rootUrl(file, ["file:///x/other.js", "file:///Users/o/spell-app/packages/epics/components/__pack/epics.pack.js"])
    ).toBe("file:///Users/o/spell-app/")
    expect(EpicAddress.rootUrl(file, ["file:///Users/o/spell-app/packages/epics/tools/_assets/spell-ui.js?v=2"])).toBe(
      "file:///Users/o/spell-app/"
    )
    expect(EpicAddress.rootUrl(file, [])).toBeUndefined()
    expect(EpicAddress.pageOf(`${file}#t1`, "file:///Users/o/spell-app/")).toBe("epics/a/a.plan.html")
  })
})

describe("PageTargets", () => {
  const { document } = parseHTML(`<!doctype html><html><body>
    <epic-page epic="demo" saga="epics">
      <epic-section id="phases" kind="phases">
        <epic-phase id="p1" title="First"></epic-phase>
        <epic-phase id="p-second-one"><span slot="title">Second <code>one</code></span></epic-phase>
      </epic-section>
      <epic-section id="todos" kind="todos"><epic-item id="t1" title="Do  the thing"></epic-item></epic-section>
      <epic-section id="o1" kind="overview-part" source="parts/o1.html" part-ids="h4 h5"></epic-section>
    </epic-page></body></html>`)
  const page = new PageTargets(document)

  test("an item with its title;  a phase by number or name, with its number;  an id in an unloaded part", () => {
    expect(page.find(new EpicAddress({ item: "T1" }))).toEqual({ id: "t1", title: "Do the thing" })
    expect(page.find(new EpicAddress({ phase: "2" }))).toEqual({ id: "p-second-one", title: "Second one", number: 2 })
    expect(page.find(new EpicAddress({ phase: "second-one" }))?.number).toBe(2)
    expect(page.find(new EpicAddress({ item: "p1" }))).toEqual({ id: "p1", title: "First", number: 1 })
    expect(page.find(new EpicAddress({ item: "h5" }))).toEqual({ id: "h5" })
    expect(page.find(new EpicAddress({ item: "t9" }))).toBeUndefined()
    expect(page.saga).toBe("epics")
  })
})
