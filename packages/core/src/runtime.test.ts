import { describe, test, expect, vi, beforeEach, afterEach } from "vite-plus/test"

import { spellCore, Thing, on, off, once, trigger } from "$/core"

/** `a card is a thing`:  what an event brings, e.g. `trigger card-click with the card`. */
class Card extends Thing {}

// `SpellEvent.trigger()` says what it triggers on `console.info`
beforeEach(() => {
  vi.spyOn(console, "info").mockImplementation(() => {})
  spellCore.resetRuntime()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe("on() / trigger()", () => {
  test("a listener gets the event, with what it brings;  `trigger()` answers what each listener did", () => {
    const card = new Card({})
    const heard: unknown[] = []
    on<{ card: Card }>("card-click", ({ type, card }) => heard.push([type, card]))
    on("card-click", () => "second")
    expect(trigger("card-click", { card })).toEqual([1, "second"])
    expect(heard).toEqual([["card-click", card]])
  })

  test("the event's name is case-insensitive", () => {
    const listener = vi.fn()
    on("Card-Click", listener)
    trigger("card-click")
    expect(listener).toHaveBeenCalledOnce()
  })

  test("each finds the CURRENT runtime:  a new run hears nothing of the last run's listeners", () => {
    const first = vi.fn()
    on("card-click", first)
    spellCore.resetRuntime()
    const second = vi.fn()
    on("card-click", second)
    trigger("card-click")
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })

  test("`spellCore.on()` ... are the same functions, on the same lists as `spellCore.RUNTIME`'s own", () => {
    expect([spellCore.on, spellCore.off, spellCore.once, spellCore.trigger]).toEqual([on, off, once, trigger])
    const listener = vi.fn()
    // a program compiled before `on()` says it this way
    spellCore.RUNTIME.on("card-click", listener)
    spellCore.trigger("card-click")
    on("card-click", listener)
    spellCore.RUNTIME.trigger("card-click")
    expect(listener).toHaveBeenCalledTimes(3)
  })

  test("`off()` stops a listener;  `once()` hears only the next one", () => {
    const listener = vi.fn()
    const onlyOnce = vi.fn()
    on("tick", listener)
    once("tick", onlyOnce)
    trigger("tick")
    off("tick", listener)
    trigger("tick")
    expect(listener).toHaveBeenCalledOnce()
    expect(onlyOnce).toHaveBeenCalledOnce()
  })

  test("nothing running:  `trigger()` is heard by nobody, `on()` throws saying what to do", () => {
    spellCore.clearRuntime()
    expect(trigger("tick")).toEqual([])
    expect(() => off("tick", () => {})).not.toThrow()
    expect(() => on("tick", () => {})).toThrow("call spellCore.resetRuntime() first")
    expect(() => once("tick", () => {})).toThrow(TypeError)
  })
})
