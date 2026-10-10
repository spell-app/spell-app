import { describe, test, expect } from "vite-plus/test"

import { thing } from "$/util"
import { Thing, List } from "$/core"

/**
 * Construction order:  `create()` runs exactly once per instance, and never before a field it sets is initialized.
 * - `Thing` / `List` call `create()` from their own constructor, before any subclass field initializer.
 * - `@thing` moves that call after the decorated class's fields;  `runsCreate()` keeps it to one call.
 * - See `Thing.create()` and `@thing` in `packages/util/src/spell/spellDecorators.ts`.
 */

////////////////
// ## Classes under test
////////////////

/** Every `create()` call, by instance:  OUTSIDE the instance, so a field initializer can't reset the count. */
const createCalls = new Map<object, number>()

/** Record a `create()` call on `instance`. */
function countCreate(instance: object) {
  createCalls.set(instance, (createCalls.get(instance) ?? 0) + 1)
}

/** The way spell compiles a thing:  accessor pairs, a `create()`, NO fields. */
class Compiled extends Thing {
  get title(): string {
    return (this as any).getProp("title")
  }
  set title(value: string) {
    ;(this as any).setProp("title", value)
  }
  override create() {
    countCreate(this)
    if (!this.title) this.title = "set in create()"
  }
}

/** A plain field + `create()`, WITHOUT `@thing`:  the field initializer runs after `create()`, and wins. */
class Clobbered extends Thing {
  created = ""
  override create() {
    this.created = "set in create()"
  }
}

/** The same, WITH `@thing`:  `create()` runs after the field initializer, so its write stays. */
@thing
class Kept extends Thing {
  created = ""
  override create() {
    countCreate(this)
    this.created = "set in create()"
  }
}

/** Compiled spell extending a hand-written `@thing` class:  no fields, no decorator of its own. */
class CompiledOnKept extends Kept {
  get title(): string {
    return (this as any).getProp("title")
  }
  set title(value: string) {
    ;(this as any).setProp("title", value)
  }
}

/** `@thing` on `@thing`:  only the outer wrapper calls `create()`, after BOTH classes' fields. */
@thing
class KeptTwice extends Kept {
  extra = "field"
  sawExtra: unknown = "not run"
  override create() {
    super.create()
    this.sawExtra = this.extra
  }
}

/** A `@thing` list subclass:  `List` defers to it the same way. */
@thing
class KeptList extends List {
  label = ""
  override create() {
    countCreate(this)
    this.label = "set in create()"
  }
}

////////////////
// ## Tests
////////////////

describe("`create()` construction order", () => {
  test("compiled-style class:  `create()` runs once, after constructor props", () => {
    const task = new Compiled({ title: "From props" })
    expect(createCalls.get(task)).toBe(1)
    expect(task.title).toBe("From props")
    expect(new Compiled({}).title).toBe("set in create()")
  })

  test("without `@thing`, a plain field set in `create()` is clobbered by its initializer", () => {
    // Pins WHY `@thing` exists:  `Thing`'s constructor calls `create()` before subclass fields initialize.
    expect(new Clobbered({}).created).toBe("")
  })

  test("`@thing`:  `create()` runs once, after the class's fields", () => {
    const kept = new Kept({})
    expect(createCalls.get(kept)).toBe(1)
    expect(kept.created).toBe("set in create()")
  })

  test("`@thing` keeps the class name, so `type` is unchanged", () => {
    expect(Kept.name).toBe("Kept")
    expect(new Kept({}).type).toBe("Kept")
  })

  test("compiled class extending a `@thing` class:  `create()` runs exactly once", () => {
    const task = new CompiledOnKept({ title: "From props" })
    expect(createCalls.get(task)).toBe(1)
    expect(task.created).toBe("set in create()")
    expect(task.title).toBe("From props")
    expect(task.type).toBe("CompiledOnKept")
  })

  test("`@thing` on `@thing`:  `create()` runs once, after both classes' fields", () => {
    const twice = new KeptTwice({})
    expect(createCalls.get(twice)).toBe(1)
    expect(twice.created).toBe("set in create()")
    expect(twice.sawExtra).toBe("field")
  })

  test("`@thing` `List` subclass:  `create()` runs once, after its fields", () => {
    const list = new KeptList({})
    expect(createCalls.get(list)).toBe(1)
    expect(list.label).toBe("set in create()")
  })
})
