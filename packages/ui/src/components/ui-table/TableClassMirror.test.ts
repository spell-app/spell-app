import { describe, expect, onTestFinished, test } from "vite-plus/test"

import { TableClassMirror } from "./TableClassMirror"

describe("TableClassMirror.mirrored()", () => {
  test("puts the element's phrase after the author's words, once", () => {
    expect(TableClassMirror.mirrored("mine celled", "ui celled table")).toBe("mine ui celled table")
    expect(TableClassMirror.mirrored(null, "ui table")).toBe("ui table")
  })

  test("NEVER dedupes the phrase:  a phrase may repeat a word", () => {
    expect(TableClassMirror.mirrored("", "ui head stuck first stuck table")).toBe("ui head stuck first stuck table")
  })
})

describe("TableClassMirror.apply()", () => {
  test("keeps the author's words, in their order, and swaps only its own", () => {
    const { mirror, table } = mirrored(`class="mine celled"`)
    mirror.apply(table, "ui very basic table")
    expect(table.className).toBe("mine celled ui very basic table")
    mirror.apply(table, "ui celled very basic table")
    expect(table.className).toBe("mine ui celled very basic table")
    mirror.apply(table, "ui table")
    // `celled` was the author's before the element emitted it:  it stays
    expect(table.className).toBe("mine celled ui table")
  })

  test("owns the words a table carries on first apply (an SSR table), so they go with their attribute", () => {
    const { mirror, table } = mirrored(`class="ui celled table"`)
    mirror.apply(table, "ui celled table")
    mirror.apply(table, "ui table")
    expect(table.className).toBe("ui table")
  })

  test("re-applies its words after a framework rewrites `className`", async () => {
    const { mirror, table } = mirrored()
    mirror.apply(table, "ui celled table")
    table.className = "x"
    // a `MutationObserver` delivers in a microtask
    await Promise.resolve()
    expect(table.className).toBe("x ui celled table")
  })

  test("lets go on `detach()`:  the table keeps its classes, and a rewrite stays", async () => {
    const { mirror, table } = mirrored()
    mirror.apply(table, "ui celled table")
    mirror.detach()
    expect(table.className).toBe("ui celled table")
    table.className = "x"
    await Promise.resolve()
    expect(table.className).toBe("x")
  })
})

/** A mirror and a fresh `<table attributes>`;  the mirror lets go when the test ends. */
function mirrored(attributes = "") {
  const holder = document.createElement("div")
  holder.innerHTML = `<table ${attributes}></table>`
  const mirror = new TableClassMirror()
  onTestFinished(() => mirror.detach())
  return { mirror, table: holder.querySelector("table")! }
}
