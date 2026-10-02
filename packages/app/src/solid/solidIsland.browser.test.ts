import { describe, test, expect } from "vitest"
import React from "react"
import { createRoot } from "react-dom/client"
import { flushSync } from "react-dom"
import { createMemo, onCleanup } from "solid-js"
import { template } from "@solidjs/web"

import { solidIsland } from "$/app/solid"

/**
 * `solidIsland()`:  a React page renders a Solid component, keeps its props live, and unmounts it.
 * - No JSX:  React's and Solid's in one file.
 */

/** Log of what the Solid component did, for the tests to check. */
const log: string[] = []

/** A Solid component that shows `props.label`, and logs each render of it and its disposal. */
function Label(props: { label: string }) {
  const text = createMemo(() => {
    log.push(`read ${props.label}`)
    return props.label
  })
  onCleanup(() => log.push("disposed"))
  const span = template("<span class=label></span>")() as HTMLSpanElement
  // a text binding without JSX:  the memo re-runs only when `label` changes
  createMemo(() => (span.textContent = text()))
  return span
}

describe("solidIsland()", () => {
  test("renders, follows prop changes, disposes on unmount", () => {
    log.length = 0
    const Island = solidIsland(Label, { className: "island" })
    const host = document.createElement("div")
    document.body.append(host)
    const root = createRoot(host)

    flushSync(() => root.render(React.createElement(Island, { label: "one" })))
    expect(host.querySelector(".island")?.textContent).toBe("one")

    flushSync(() => root.render(React.createElement(Island, { label: "two" })))
    expect(host.querySelector(".island")?.textContent).toBe("two")

    flushSync(() => root.unmount())
    expect(log.at(-1)).toBe("disposed")
    host.remove()
  })
})
