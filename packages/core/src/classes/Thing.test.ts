import { describe, test, expect, vi, afterEach } from "vite-plus/test"

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
    expect(task.toJSON()).toEqual({ $type: "Task", title: "Write tests" })
  })

  test('JSON says its class first, `"$type"` -- which isn\'t a prop (output-targets Q49)', () => {
    const task = new Task({ title: "Write tests", priority: "low" })
    expect(JSON.stringify(task)).toBe('{"$type":"Task","title":"Write tests","priority":"low"}')
    expect(task.keys()).toEqual(["title", "priority"])
    // its CLASS's name, even when the instance says another `type`
    task.type = "Chore"
    expect(task.toJSON()["$type"]).toBe("Task")
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

describe("Thing.isOfType()", () => {
  test("its own type and each it extends, as `spellCore.isOfType()`", () => {
    class UrgentTask extends Task {}
    const task = new UrgentTask({})
    expect(["urgenttask", "Task", "thing"].map((type) => task.isOfType(type))).toEqual([true, true, true])
    expect(task.isOfType("list")).toBe(false)
    expect(task.isOfType("task")).toBe(spellCore.isOfType(task, "task"))
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

describe("Thing.id (people-and-orgs P1)", () => {
  /** `a dated-event is a thing`:  its kind, in its made-up id, is `dated-event`. */
  class DatedEvent extends Thing {}

  test("made on first read, then kept:  its kind in lower kebab case, then 8 random base-36 characters", () => {
    const event = new DatedEvent()
    expect(event.id).toMatch(/^dated-event-[0-9a-z]{8}$/)
    expect(event.id).toBe(event.id)
    expect(event.keys()).toEqual(["id"])
  })

  test("a set id wins:  by constructor props, or set later", () => {
    expect(new Task({ id: "owen" }).id).toBe("owen")
    const task = new Task({ title: "Write tests" })
    const madeUp = task.id
    task.id = "write-tests"
    expect(task.id).toBe("write-tests")
    expect(task.id).not.toBe(madeUp)
  })

  test("two things NEVER share a made-up id, even in runs seeded the same", () => {
    spellCore.seedRandom(7)
    const first = new Task().id
    spellCore.seedRandom(7)
    const second = new Task().id
    const ids = new Set(Array.from({ length: 1000 }, () => new Task().id))
    expect(second).not.toBe(first)
    expect(ids.size).toBe(1000)
  })

  test("JSON has an id ONLY once it's read or set:  existing JSON doesn't change", () => {
    const task = new Task({ title: "Write tests" })
    expect(task.toJSON()).toEqual({ $type: "Task", title: "Write tests" })
    const id = task.id
    expect(task.toJSON()).toEqual({ $type: "Task", title: "Write tests", id })
    expect(new Task({ id: "owen" }).toJSON()).toEqual({ $type: "Task", id: "owen" })
  })

  test("a list has one too, as a thing has", () => {
    const deck = new Deck({ name: "spare" })
    expect(deck.toJSON()).toEqual({ $type: "Deck", name: "spare", $items: [] })
    expect(deck.id).toMatch(/^deck-[0-9a-z]{8}$/)
    expect(new Deck({ id: "spare-deck" }).id).toBe("spare-deck")
  })

  test("not a text:  warns, as any declared prop does, and is stored anyway", () => {
    const warn = vi.spyOn(spellCore.console, "warn").mockImplementation(() => {})
    const task = new Task({ id: 42 })
    expect(warn).toHaveBeenCalledWith("Expected id to be type 'text', got:", 42)
    expect(task.id).toBe(42)
  })

  test("`savedInline`:  no by default, set per class, inherited", () => {
    class Note extends DatedEvent {}
    expect([Thing.savedInline, List.savedInline, DatedEvent.savedInline]).toEqual([false, false, false])
    DatedEvent.savedInline = true
    expect([Thing.savedInline, DatedEvent.savedInline, Note.savedInline]).toEqual([false, true, true])
  })
})
