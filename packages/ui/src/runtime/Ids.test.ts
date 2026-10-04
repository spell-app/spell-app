import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { Ids } from "./Ids"

describe("Ids", () => {
  it("hands out unique ids, skipping ones already in the document", () => {
    const ids = new Ids()
    Fixture.render(`<p id="test-1"></p>`)
    expect(ids.next("test")).toBe("test-2")
    expect(ids.next("test")).toBe("test-3")
  })

  it("ensure() keeps an existing id and assigns a missing one", () => {
    const ids = new Ids()
    const named = Fixture.render(`<p id="mine"></p>`)
    const anonymous = Fixture.render(`<p></p>`)
    expect(ids.ensure(named)).toBe("mine")
    expect(ids.ensure(anonymous, "label")).toMatch(/^label-\d+$/)
    expect(ids.ensure(anonymous, "label")).toBe(anonymous.id)
  })
})
