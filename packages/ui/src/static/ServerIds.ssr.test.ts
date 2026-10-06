import { parseHTML } from "linkedom"
import { describe, expect, test } from "vite-plus/test"

import { ServerIds } from "$/ui/static"

describe("ServerIds.next()", () => {
  test("skips ids the page being rendered already has", () => {
    const ids = new ServerIds()
    ids.reset(parseHTML(`<html><body><p id="ui-modal-1"></p></body></html>`).document)
    expect([ids.next("ui-modal"), ids.next("ui-modal")]).toEqual(["ui-modal-2", "ui-modal-3"])
  })

  test("restarts numbering per page, so the same page ALWAYS renders the same ids", () => {
    const ids = new ServerIds()
    ids.reset(undefined)
    const first = [ids.next(), ids.next()]
    ids.reset(undefined)
    expect([ids.next(), ids.next()]).toEqual(first)
    expect(first).toEqual(["ui-1", "ui-2"])
  })
})

describe("ServerIds.ensure()", () => {
  test("keeps an element's id, and gives one to an element without", () => {
    const { document } = parseHTML(`<html><body><p id="mine"></p><p></p></body></html>`)
    const ids = new ServerIds()
    ids.reset(document)
    const [named, anonymous] = document.querySelectorAll("p")
    expect(ids.ensure(named!)).toBe("mine")
    expect(ids.ensure(anonymous!, "label")).toBe("label-1")
    expect(anonymous!.id).toBe("label-1")
  })
})
