import { afterEach, describe, expect, test } from "vite-plus/test"
import { flush } from "solid-js"
import { render } from "@solidjs/web"

import { ElementFixture } from "spell/test-helpers/ElementFixture"
import { Inspector, InspectorColumn, isThing, itemsOf, uiReady } from "spell-app/app/solid"

/**
 * The Inspector (`Inspector.tsx`):  what a part of the app is, picking it, and the column that shows it.
 * - In the browser:  Solid's client build, so `flush()` before asserting.
 */

/** Undo for each test:  unmount, close the Inspector. */
const cleanups: (() => void)[] = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  Inspector.close()
  flush()
})

describe("Inspector.partFor()", () => {
  test("a Spell UI element:  itself, with its tag's attributes", async () => {
    const button = await inArea(`<ui-button color="primary">Go</ui-button>`)
    const part = Inspector.partFor(button.querySelector("ui-button")!)
    expect(part && { value: part.value.constructor.name, schema: part.schema, label: part.label }).toEqual({
      value: button.querySelector("ui-button")!.constructor.name,
      schema: "ui-button",
      label: '<ui-button "Go" />'
    })
  })

  test("anything else:  nothing to inspect", async () => {
    const area = await inArea(`<p>words</p>`)
    expect(Inspector.partFor(area.querySelector("p")!)).toBeUndefined()
  })
})

describe("picking", () => {
  test("a click in the app picks the control under it, and never reaches the app", async () => {
    const area = await inArea(`<ui-button>Go</ui-button>`)
    let pressed = 0
    area.querySelector("ui-button")!.addEventListener("click", () => pressed++)
    cleanups.push(Inspector.watch(area))
    Inspector.toggle()
    flush()
    expect(Inspector.isPicking).toBe(true)

    area.querySelector("ui-button")!.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }))
    flush()
    expect(Inspector.picked?.label).toBe('<ui-button "Go" />')
    expect(pressed).toBe(0)
    // picked:  the app has its clicks back
    expect(Inspector.isPicking).toBe(false)
  })

  test("the column shows what's picked, in a property editor", async () => {
    const area = await inArea(`<ui-input value="hi"></ui-input>`)
    const host = await mount(() => <InspectorColumn />)
    Inspector.toggle()
    Inspector.pick(area.querySelector("ui-input")!)
    flush()
    await ElementFixture.settle(host)
    const editor = host.querySelector<HTMLElement & { schema: unknown }>(".Inspector ui-property-editor")!
    expect(editor.schema).toBe("ui-input")
    expect(host.querySelector(".InspectorCard h2")!.textContent!.trim()).toBe("<ui-input />")
  })
})

describe("the properties card", () => {
  test("a Spell UI element's fields in sections, a group each, in the groups' order;  its words head Content", async () => {
    const area = await inArea(`<ui-button>Go</ui-button>`)
    const host = await mount(() => <InspectorColumn />)
    Inspector.toggle()
    Inspector.pick(area.querySelector("ui-button")!)
    flush()
    await ElementFixture.settle(host)
    const sections = [...host.querySelectorAll(".InspectorMain ui-property-group")]
    const labels = sections.map((section) => section.getAttribute("label"))
    expect(labels.slice(0, 4)).toEqual(["Name", "Content", "Appearance", "Layout"])
    const content = sections[1]!
    expect(content.querySelector("ui-property")!.getAttribute("name")).toBe("textContent")
    expect([...sections[2]!.querySelectorAll(":scope > ui-property")].map((p) => p.getAttribute("name"))).toContain(
      "color"
    )
  })
})

describe("the parts tree and events", () => {
  test("lists the app's parts, nested, looking through what isn't one;  a row picks its part", async () => {
    const area = await inArea(`<ui-segment><div><ui-button>Go</ui-button></div></ui-segment><p>words</p>`)
    cleanups.push(Inspector.watch(area))
    expect(Inspector.partsIn(area).map((row) => [row.element.localName, row.depth])).toEqual([
      ["ui-segment", 0],
      ["ui-button", 1]
    ])
    const host = await mount(() => <InspectorColumn />)
    Inspector.toggle()
    flush()
    await ElementFixture.settle(host)
    const rows = [...host.querySelectorAll<HTMLElement>(".InspectorTree li")]
    expect(rows.map((row) => row.textContent)).toEqual(["<ui-segment />", '<ui-button "Go" />'])
    rows[1]!.click()
    flush()
    expect(Inspector.picked?.element).toBe(area.querySelector("ui-button"))
  })

  test("a part with parts inside folds and unfolds;  a Spell UI element says which it is", async () => {
    const area = await inArea(`<ui-segment><ui-button name="go">Go</ui-button></ui-segment><ui-button>Stop</ui-button>`)
    cleanups.push(Inspector.watch(area))
    const host = await mount(() => <InspectorColumn />)
    Inspector.toggle()
    flush()
    await ElementFixture.settle(host)
    const labels = () => [...host.querySelectorAll(".InspectorTree li")].map((row) => row.textContent)
    expect(labels()).toEqual(["<ui-segment />", '<ui-button "go" />', '<ui-button "Stop" />'])
    host.querySelector<HTMLElement>(".InspectorTree li ui-icon.InspectorFold")!.click()
    flush()
    expect(labels()).toEqual(["<ui-segment />", '<ui-button "Stop" />'])
    host.querySelector<HTMLElement>(".InspectorTree li ui-icon.InspectorFold")!.click()
    flush()
    expect(labels()).toHaveLength(3)
  })

  test("what's picked is picked again once the app is drawn afresh", async () => {
    const area = await inArea(`<ui-segment></ui-segment><ui-button>Go</ui-button>`)
    cleanups.push(Inspector.watch(area))
    Inspector.pick(area.querySelector("ui-button")!)
    // the app drawn afresh:  new elements, the same parts
    area.innerHTML = `<ui-segment></ui-segment><ui-button>Go</ui-button>`
    await ElementFixture.settle(area)
    Inspector.restorePick(Inspector.partsIn(area))
    flush()
    expect(Inspector.picked?.element).toBe(area.querySelector("ui-button"))
  })

  test("a part's events:  what it handles, then what was added", async () => {
    const area = await inArea(`<ui-button>Go</ui-button>`)
    cleanups.push(Inspector.watch(area))
    const button = area.querySelector("ui-button")!
    // Solid's delegated handler, as `onClick` leaves it
    Object.assign(button, { _$click: () => {}, _$clickData: 1 })
    expect(Inspector.eventsOf(button)).toEqual(["click"])
    Inspector.addEvent(button, "mousedown")
    flush()
    expect(Inspector.eventsOf(button)).toEqual(["click", "mousedown"])
  })

  // epic `ui-gaps` P14:  its own growing box (`fitHeight()`) became `<ui-textarea grow>`
  test("an event's code box:  a <ui-textarea grow>, one line in the Output tab's type, taller as code is typed", async () => {
    const area = await inArea(`<ui-button>Go</ui-button>`)
    cleanups.push(Inspector.watch(area))
    const host = await mount(() => <InspectorColumn />)
    Inspector.toggle()
    const button = area.querySelector("ui-button")!
    Inspector.pick(button)
    Inspector.addEvent(button, "click")
    flush()
    await ElementFixture.settle(host)
    const box = host.querySelector<HTMLElement & { value: string }>(".InspectorEvent .InspectorCode")!
    const code = box.shadowRoot!.querySelector("textarea")!
    const style = getComputedStyle(code)
    expect([box.localName, box.hasAttribute("grow"), style.fontFamily, style.fontSize]).toEqual([
      "ui-textarea",
      true,
      "monaco, monospace",
      "13px"
    ])
    const one = code.getBoundingClientRect().height
    expect(Math.round(one)).toBe(Math.round(parseFloat(style.lineHeight) + 14))
    code.value = "go()\nstop()\nagain()"
    code.dispatchEvent(new InputEvent("input", { bubbles: true, composed: true }))
    await ElementFixture.settle(host)
    expect(Math.round(code.getBoundingClientRect().height - one)).toBe(Math.round(2 * parseFloat(style.lineHeight)))
  })
})

describe("the cards", () => {
  test("a card hides and folds;  the column opens again with the cards it last showed", async () => {
    const host = await mount(() => <InspectorColumn />)
    Inspector.toggle()
    flush()
    const titles = () => [...host.querySelectorAll(".InspectorCard")].map((card) => card.classList.contains("folded"))
    expect(titles()).toEqual([false, false, false])
    Inspector.setShown("events", false)
    Inspector.toggleFolded("views")
    flush()
    expect(titles()).toEqual([false, true])
    // closed, then opened again, a click each
    Inspector.toggle()
    flush()
    Inspector.toggle()
    flush()
    expect(titles()).toEqual([false, true])
    // as it was, for the other tests
    Inspector.setShown("events", true)
    Inspector.toggleFolded("views")
    flush()
  })
})

describe("things inside things", () => {
  /** A stand-in for a spell class:  its class carries a `schema` symbol, as the runtime's do, and it has `toJSON()`. */
  class Pile {
    name = "discards"
    cards: Pile[] = []
    toJSON() {
      return { $type: "Pile" }
    }
    *[Symbol.iterator]() {
      yield* this.cards
    }
  }

  Object.defineProperty(Pile, Symbol("schema"), { value: {} })

  test("a spell thing is one, a plain value or object isn't", () => {
    expect(isThing(new Pile())).toBe(true)
    expect(isThing({ name: "x" })).toBe(false)
    expect(isThing("discards")).toBe(false)
    expect(isThing(document.createElement("div"))).toBe(false)
  })

  test("a list's items;  a title by type and name, a list item's place when it has no name", () => {
    const pile = new Pile()
    pile.cards = [new Pile()]
    expect(itemsOf(pile)).toEqual(pile.cards)
    expect(Inspector.thingLabel(pile)).toBe("Pile · discards")
    pile.name = ""
    expect(Inspector.thingLabel(pile, "#3")).toBe("Pile #3")
  })
})

/** An app area holding `html`, on the page for the test. */
async function inArea(html: string): Promise<HTMLElement> {
  await uiReady
  const area = document.body.appendChild(document.createElement("div"))
  area.innerHTML = html
  cleanups.push(() => area.remove())
  await ElementFixture.settle(area)
  return area
}

/** `component`, rendered on the page for the test. */
async function mount(component: () => unknown): Promise<HTMLElement> {
  await uiReady
  const host = document.body.appendChild(document.createElement("div"))
  const dispose = render(component as () => never, host)
  cleanups.push(() => {
    dispose()
    host.remove()
  })
  flush()
  await ElementFixture.settle(host)
  return host
}
