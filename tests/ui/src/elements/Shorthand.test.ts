import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { Shorthand } from "$/ui/elements"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("Shorthand.resolve()", () => {
  it("renders nothing for nil and booleans", () => {
    for (const value of [undefined, null, false, true]) {
      expect(Shorthand.resolve(value, Shorthand.map.name)).toBeUndefined()
    }
  })

  it("maps primitives", () => {
    expect(Shorthand.resolve("check", Shorthand.map.name)).toEqual({ name: "check" })
    expect(Shorthand.resolve(3, Shorthand.map.content)).toEqual({ content: 3 })
    expect(Shorthand.resolve("a.png", Shorthand.map.src)).toEqual({ src: "a.png" })
    expect(Shorthand.resolve("email", Shorthand.map.type)).toEqual({ type: "email" })
    expect(Shorthand.resolve(["a", "b"], Shorthand.map.content)).toEqual({ content: ["a", "b"] })
    expect(Shorthand.resolve("", Shorthand.map.content)).toEqual({ content: "" })
  })

  it("passes props objects through", () => {
    expect(Shorthand.resolve({ name: "check", color: "red" }, Shorthand.map.name)).toEqual({
      name: "check",
      color: "red"
    })
  })

  it("merges defaults < value < overrides", () => {
    const props = Shorthand.resolve({ name: "user", size: "big" }, Shorthand.map.name, {
      defaults: { name: "dropdown", size: "small", color: "grey" },
      overrides: { size: "huge" }
    })
    expect(props).toEqual({ name: "user", size: "huge", color: "grey" })
  })

  it("calls function overrides with the merged props", () => {
    const overrides = vi.fn((props: Record<string, unknown>) => ({ label: `${String(props.name)}!` }))
    const props = Shorthand.resolve("check", Shorthand.map.name, { defaults: { color: "red" }, overrides })
    expect(overrides).toHaveBeenCalledWith({ color: "red", name: "check" })
    expect(props).toEqual({ color: "red", name: "check", label: "check!" })
  })

  it("merges and de-duplicates classes", () => {
    const props = Shorthand.resolve({ class: "icon red  big" }, Shorthand.map.name, {
      defaults: { class: "ui icon" },
      overrides: { class: "red close" }
    })
    expect(props?.class).toBe("ui icon red big close")
  })

  it("merges object styles key by key, later winning", () => {
    const props = Shorthand.resolve({ style: { color: "red", margin: "0" } }, Shorthand.map.name, {
      defaults: { style: { color: "blue", padding: "1em" } },
      overrides: { style: { margin: "1px" } }
    })
    expect(props?.style).toEqual({ color: "red", padding: "1em", margin: "1px" })
  })

  it("joins string styles", () => {
    const props = Shorthand.resolve({ style: "color: red" }, Shorthand.map.name, { defaults: { style: "margin: 0" } })
    expect(props?.style).toBe("margin: 0; color: red")
  })

  it("rejects other types with a dev warning", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(Shorthand.resolve((() => "x") as never, Shorthand.map.name)).toBeUndefined()
    expect(Shorthand.resolve(new Date() as never, Shorthand.map.name)).toBeUndefined()
    expect(warn).toHaveBeenCalledTimes(2)
  })
})

describe("Shorthand.mergeClasses()", () => {
  it("keeps first occurrences in order", () => {
    expect(Shorthand.mergeClasses("a b", undefined, "b c", "")).toBe("a b c")
    expect(Shorthand.mergeClasses(undefined, "")).toBeUndefined()
  })
})
