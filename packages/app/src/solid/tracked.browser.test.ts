import { describe, test, expect } from "vitest"
import { createEffect, createMemo, createRoot, flush } from "solid-js"

import { createStore } from "$/util"
import { tracked } from "$/app/solid"

/**
 * `tracked()`:  Solid sees `easy-state` change.  In the browser, so Solid's CLIENT build:  staged writes, effects.
 */

/** A store shaped like the editor's:  a nested object and a list, mutated in place. */
function newStore() {
  return createStore({ project: { title: "One" }, tasks: [] as string[] })
}

describe("tracked()", () => {
  test("starts with the current value", () => {
    const store = newStore()
    createRoot((dispose) => {
      const title = tracked(() => store.project.title)
      expect(title()).toBe("One")
      dispose()
    })
  })

  test("an easy-state write reaches a Solid memo after `flush()`", () => {
    const store = newStore()
    createRoot((dispose) => {
      const title = tracked(() => store.project.title)
      const loud = createMemo(() => title().toUpperCase())
      flush()
      store.project.title = "Two"
      // staged:  Solid's CLIENT build, as in the app
      expect(title()).toBe("One")
      flush()
      expect(loud()).toBe("TWO")
      dispose()
    })
  })

  test("an in-place list change notifies (same array, `equals: false`)", () => {
    const store = newStore()
    const seen: number[] = []
    const dispose = createRoot((dispose) => {
      const tasks = tracked(() => (store.tasks.length, store.tasks))
      createEffect(
        () => tasks().length,
        (length) => {
          seen.push(length)
        }
      )
      return dispose
    })
    flush()
    store.tasks.push("a")
    flush()
    store.tasks.push("b")
    flush()
    expect(seen).toEqual([0, 1, 2])
    dispose()
  })

  test("a write from inside a Solid effect's apply doesn't throw", () => {
    const store = newStore()
    const dispose = createRoot((dispose) => {
      const title = tracked(() => store.project.title)
      createEffect(
        () => title(),
        (value) => {
          if (value === "One") store.project.title = "Two"
        }
      )
      return dispose
    })
    expect(() => flush()).not.toThrow()
    flush()
    expect(store.project.title).toBe("Two")
    dispose()
  })

  test("a function value comes back as the function, not called", () => {
    const store = createStore({ handler: (): string => "first" })
    createRoot((dispose) => {
      const handler = tracked(() => store.handler)
      expect(handler()()).toBe("first")
      store.handler = () => "second"
      flush()
      expect(handler()()).toBe("second")
      dispose()
    })
  })

  test("disposing the owner stops tracking", () => {
    const store = newStore()
    let reads = 0
    const dispose = createRoot((dispose) => {
      tracked(() => {
        reads++
        return store.project.title
      })
      return dispose
    })
    expect(reads).toBe(1)
    store.project.title = "Two"
    expect(reads).toBe(2)
    dispose()
    store.project.title = "Three"
    expect(reads).toBe(2)
  })

  test("with no owner, `dispose()` stops it", () => {
    const store = newStore()
    let reads = 0
    const title = tracked(() => {
      reads++
      return store.project.title
    })
    store.project.title = "Two"
    flush()
    expect(title()).toBe("Two")
    title.dispose()
    store.project.title = "Three"
    expect(reads).toBe(2)
  })
})
