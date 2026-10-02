import { describe, test, expect, vi, afterEach } from "vitest"

import { observe } from "$/util"
import { spellCore, Thing, List } from "$/core"

/**
 * A thing written the way spell compiles one:  each property a getter / setter pair over `getProp` / `setProp`.
 * - `any` for `this` as `getProp` / `setProp` are `protected`, as compiled JS never sees TS access modifiers.
 */
class Task extends Thing {
  static Priorities = ["low", "high"]
  get title(): string {
    return (this as any).getProp("title")
  }
  set title(value: string) {
    ;(this as any).setProp("title", value, { type: "text" })
  }
  get priority(): string {
    return (this as any).getProp("priority")
  }
  set priority(value: string) {
    ;(this as any).setProp("priority", value, { oneOf: Task.Priorities })
  }
  get tags(): List {
    return (this as any).getProp("tags", () => new List({}))
  }
  set tags(value: List) {
    ;(this as any).setProp("tags", value)
  }
}

/** A list subclass with a typed property, e.g. `a deck has a name as text`. */
class Deck extends List {
  get name(): string {
    return (this as any).getProp("name")
  }
  set name(value: string) {
    ;(this as any).setProp("name", value, { type: "text" })
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("compiled-style getter / setter properties", () => {
  test("constructor props go through the setter into reactive props", () => {
    const task = new Task({ title: "Write tests" })
    expect(task.title).toBe("Write tests")
    expect(task.toJSON()).toEqual({ title: "Write tests" })
  })

  test("reads are tracked:  a later write re-runs an observer", () => {
    const task = new Task({ title: "One" })
    const seen: string[] = []
    const stop = observe(() => {
      seen.push(task.title)
    })
    task.title = "Two"
    stop()
    expect(seen).toEqual(["One", "Two"])
  })

  test("`getProp()` initializer makes a default once per instance", () => {
    const task = new Task({})
    expect(task.tags).toBeInstanceOf(List)
    expect(task.tags).toBe(task.tags)
    expect(new Task({}).tags).not.toBe(task.tags)
  })
})

describe("`setProp()` check", () => {
  test("a value of the right type doesn't warn", () => {
    const warn = vi.spyOn(spellCore.console, "warn").mockImplementation(() => {})
    new Task({ title: "ok", priority: "low" })
    expect(warn).not.toHaveBeenCalled()
  })

  test("a value of the wrong type warns, and is stored anyway", () => {
    const warn = vi.spyOn(spellCore.console, "warn").mockImplementation(() => {})
    const task = new Task({ title: 42 })
    expect(warn).toHaveBeenCalledWith("Expected title to be type 'text', got:", 42)
    expect(task.title).toBe(42)
  })

  test("a value not in `oneOf` warns, and is stored anyway", () => {
    const warn = vi.spyOn(spellCore.console, "warn").mockImplementation(() => {})
    const task = new Task({ priority: "urgent" })
    expect(warn).toHaveBeenCalledWith("Expected priority to be one of 'low,high', got:", "urgent")
    expect(task.priority).toBe("urgent")
  })

  test("works on a `List` subclass too", () => {
    const warn = vi.spyOn(spellCore.console, "warn").mockImplementation(() => {})
    const deck = new Deck({ name: 7 })
    expect(warn).toHaveBeenCalledWith("Expected name to be type 'text', got:", 7)
    expect(deck.name).toBe(7)
  })
})
