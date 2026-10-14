import { afterEach, describe, expect, test } from "vite-plus/test"

import { ElementFixture } from "$/ui/test/ElementFixture"
import { expectAccessible } from "$/ui/test/A11y"

import { ChoicesForm } from "$/epics/answers"

import "$/epics/components/epic-choice-rows"

////////////////
// ## Fixtures
////////////////

/** A section of two rows:  a rename, and one that stays;  the table's `flags`. */
function section(flags = "") {
  return (
    `<ui-section id="q1" header="Q1 · Members"><epic-choice-rows ${flags}>` +
    `<epic-choice-row name="q1-A-7" file="packages/ui/src/A.tsx" line="7" purpose="menu open" note="a \`boolean\`" ` +
    `current="this.open" recommended="this.isOpen"></epic-choice-row>` +
    `<epic-choice-row name="q1-A-9" file="packages/ui/src/A.tsx" line="9" purpose="dark" current="UI.isDark" ` +
    `recommended="UI.isDark"></epic-choice-row></epic-choice-rows></ui-section>`
  )
}

afterEach(() => ChoicesForm.adopt(undefined))

/** `host`'s shadow part `name`. */
function part<T extends HTMLElement = HTMLElement>(host: Element, name: string): T | null {
  return host.shadowRoot!.querySelector<T>(`[part~="${name}"]`)
}

/** The rows under `root`. */
function rows(root: Element): Element[] {
  return Array.from(root.querySelectorAll("epic-choice-row"))
}

/** Type `text` into `row`'s box, as a keystroke does. */
async function type(row: Element, text: string) {
  const box = part<HTMLTextAreaElement>(row, "box")!
  box.value = text
  box.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
  await ElementFixture.settle()
}

////////////////
// ## Tests
////////////////

describe("<epic-choice-rows>, <epic-choice-row>", () => {
  test("the heads, then each row's cells on the same columns:  File | Purpose | Current | Recommended;  axe", async () => {
    const root = await ElementFixture.render(section())
    await ElementFixture.settle()
    const table = root.querySelector("epic-choice-rows")!
    expect(Array.from(part(table, "head")!.children, (head) => head.textContent)).toEqual([
      "File",
      "Purpose",
      "Current",
      "Recommended"
    ])
    const [rename] = rows(root) as [Element]
    expect(part(rename, "file")!.textContent).toBe("A.tsx:7ui/src")
    expect(part(rename, "purpose")!.querySelector("code")!.textContent).toBe("boolean")
    expect(part<HTMLTextAreaElement>(rename, "box")!.value).toBe("this.isOpen")
    // a cell of the row lines up with its head
    const headLeft = part(table, "head")!.children[3]!.getBoundingClientRect().left
    expect(part(rename, "pick")!.getBoundingClientRect().left).toBeCloseTo(headLeft, 0)
    await expectAccessible(table)
  })

  test("counts its section:  renames and rows that stay, then what Owen changed;  a changed box orange, with its reset", async () => {
    const root = await ElementFixture.render(section())
    await ElementFixture.settle()
    expect(root.getAttribute("badge")).toBe("1 to rename · 1 stay")
    const [, stays] = rows(root) as [Element, Element]
    expect(part(stays, "purpose")!.textContent).toContain("stays")
    await type(stays, "UI.dark")
    expect(stays.matches(":state(changed)")).toBe(true)
    expect(root.getAttribute("badge")).toBe("1 to rename · 1 stay · 1 changed")
    expect(ChoicesForm.forPage().collect()).toEqual({ "q1-A-9": "UI.dark" })
    part(stays, "reset")!.click()
    await ElementFixture.settle()
    expect(stays.matches(":state(changed)")).toBe(false)
    expect(part(stays, "reset")).toBeNull()
    expect(ChoicesForm.forPage().collect()).toEqual({})
  })

  test("one line of text:  a pasted line break goes;  Enter adds none", async () => {
    const root = await ElementFixture.render(section())
    const [row] = rows(root) as [Element]
    await type(row, "two\nlines")
    expect(part<HTMLTextAreaElement>(row, "box")!.value).toBe("two lines")
    const enter = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
    part(row, "box")!.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(true)
  })

  test("`no-file`:  no File column;  `stacked`:  today's text over the box, one Syntax column", async () => {
    const root = await ElementFixture.render(section("no-file stacked"))
    await ElementFixture.settle()
    const table = root.querySelector("epic-choice-rows")!
    expect(Array.from(part(table, "head")!.children, (head) => head.textContent)).toEqual([
      "Purpose",
      "Syntax:  today, then yours"
    ])
    const [row] = rows(root) as [Element]
    expect([part(row, "file"), part(row, "current")]).toEqual([null, null])
    expect(part(row, "pick")!.querySelector("code")!.textContent).toBe("this.open")
  })
})
