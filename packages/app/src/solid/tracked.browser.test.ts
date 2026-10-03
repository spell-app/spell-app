import { describe, test, expect } from "vitest"
import { createEffect, createMemo, createRoot, flush } from "solid-js"

import { reactiveObject } from "$/util"
import { tracked } from "$/app/solid"

/**
 * `tracked()`:  a Solid memo over a read of spell cells.  In the browser, so Solid's CLIENT build:  staged writes,
 * effects.  The bridge under it is pinned by `cellsBridge.browser.test.tsx`.
 */

/** State shaped like the editor's:  a nested object and a list -- spell cells, so each REPLACED to change. */
function newState() {
  return reactiveObject({ project: reactiveObject({ title: "One" }), tasks: [] as string[] })
}

describe("tracked()", () => {
  test("starts with the current value", () => {
    const state = newState()
    createRoot((dispose) => {
      const title = tracked(() => state.project.title)
      expect(title()).toBe("One")
      dispose()
    })
  })

  test("a spell write reaches a Solid memo after `flush()`", () => {
    const state = newState()
    createRoot((dispose) => {
      const title = tracked(() => state.project.title)
      const loud = createMemo(() => title().toUpperCase())
      flush()
      state.project.title = "Two"
      // staged:  Solid's CLIENT build, as in the app -- the cell itself is current
      expect(title()).toBe("One")
      expect(state.project.title).toBe("Two")
      flush()
      expect(loud()).toBe("TWO")
      dispose()
    })
  })

  test("a replaced list notifies;  a change IN PLACE doesn't -- cells follow props, not what they hold", () => {
    const state = newState()
    const seen: number[] = []
    const dispose = createRoot((dispose) => {
      const tasks = tracked(() => state.tasks)
      createEffect(
        () => tasks().length,
        (length) => {
          seen.push(length)
        }
      )
      return dispose
    })
    flush()
    state.tasks = [...state.tasks, "a"]
    flush()
    state.tasks.push("b")
    flush()
    state.tasks = [...state.tasks, "c"]
    flush()
    expect(seen).toEqual([0, 1, 3])
    dispose()
  })

  test("ten writes, one re-read -- after the writes, never in the middle of them", () => {
    const state = newState()
    let reads = 0
    const titles: string[] = []
    const dispose = createRoot((dispose) => {
      const title = tracked(() => {
        reads++
        return state.project.title
      })
      createEffect(
        () => title(),
        (value) => {
          titles.push(value)
        }
      )
      return dispose
    })
    flush()
    for (let count = 1; count <= 10; count++) state.project.title = `title ${count}`
    expect(reads).toBe(1)
    flush()
    expect(reads).toBe(2)
    expect(titles).toEqual(["One", "title 10"])
    dispose()
  })

  test("a read that writes what it just read doesn't re-read itself (plan doc I3)", () => {
    const state = newState()
    let reads = 0
    const dispose = createRoot((dispose) => {
      const tasks = tracked(() => {
        reads++
        // like a Solitaire computed property filling a new pile on every read
        state.tasks = [...state.tasks, "made"]
        return state.tasks.length
      })
      createEffect(
        () => tasks(),
        () => {}
      )
      return dispose
    })
    flush()
    flush()
    expect(reads).toBe(1)
    dispose()
  })

  test("a write from inside a Solid effect's apply doesn't throw", () => {
    const state = newState()
    const dispose = createRoot((dispose) => {
      const title = tracked(() => state.project.title)
      createEffect(
        () => title(),
        (value) => {
          if (value === "One") state.project.title = "Two"
        }
      )
      return dispose
    })
    expect(() => flush()).not.toThrow()
    flush()
    expect(state.project.title).toBe("Two")
    dispose()
  })

  test("a function value comes back as the function, not called", () => {
    const state = reactiveObject({ handler: undefined as undefined | (() => string) })
    state.handler = () => "first"
    createRoot((dispose) => {
      const handler = tracked(() => state.handler)
      expect(handler()!()).toBe("first")
      state.handler = () => "second"
      flush()
      expect(handler()!()).toBe("second")
      dispose()
    })
  })

  test("disposing the owner stops tracking", () => {
    const state = newState()
    let reads = 0
    const dispose = createRoot((dispose) => {
      tracked(() => {
        reads++
        return state.project.title
      })
      return dispose
    })
    expect(reads).toBe(1)
    state.project.title = "Two"
    flush()
    expect(reads).toBe(2)
    dispose()
    state.project.title = "Three"
    flush()
    expect(reads).toBe(2)
  })

  test("with no owner, `dispose()` stops it", () => {
    const state = newState()
    let reads = 0
    const title = tracked(() => {
      reads++
      return state.project.title
    })
    state.project.title = "Two"
    flush()
    expect(title()).toBe("Two")
    title.dispose()
    state.project.title = "Three"
    flush()
    expect(reads).toBe(2)
  })
})
