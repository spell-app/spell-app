import { describe, expect, it } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/docs-components/ui-docs-inspector"
import "$/ui/components/ui-button"

////////////////
// ## Fixtures
////////////////

/** Element-markup examples, by path. */
const EXAMPLES = import.meta.glob<string>("/src/docs-components/ui-docs-inspector/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A toggle button and an inspector showing it. */
const TOGGLE = `
  <div>
    <ui-button id="star" toggle icon="star">Star</ui-button>
    <ui-docs-inspector for="star"></ui-docs-inspector>
  </div>`

////////////////
// ## Helpers
////////////////

/** Render `html`;  returns its inspector and the element it shows (if any), once the first read has drawn. */
async function render(html: string) {
  const wrapper = await ElementFixture.render<HTMLElement>(html)
  const inspector = wrapper.querySelector<DOMElement>("ui-docs-inspector")!
  const target = wrapper.querySelector<DOMElement>(`#${inspector.getAttribute("for")}`) ?? undefined
  await expect.poll(() => inspector.shadowRoot?.querySelector("[part~=title]")?.textContent).toBeTruthy()
  return { wrapper, inspector, target }
}

/** Each group's rows as text, by its caption:  `name = value`, or a state's `:state(x)`. */
function groups(inspector: Element): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const group of inspector.shadowRoot!.querySelectorAll("[part~=group]")) {
    const caption = group.querySelector("[part~=caption]")!.textContent!.trim()
    result[caption] = [...group.querySelectorAll("[part~=row]")].map((row) => {
      const name = row.querySelector("[part~=name]")!.textContent!.trim()
      const value = row.querySelector("[part~=value]")?.textContent?.trim()
      return value === undefined ? name : `${name} = ${value}`
    })
  }
  return result
}

////////////////
// ## Tests
////////////////

describe("<ui-docs-inspector> rows", () => {
  it("shows the element's attributes, set properties and states, under a title naming it", async () => {
    const { inspector } = await render(TOGGLE)
    expect(inspector.shadowRoot!.querySelector("[part~=title]")!.textContent).toBe('<ui-button id="star">')
    const shown = groups(inspector)
    expect(shown.Attributes).toEqual(['id = "star"', 'toggle = ""', 'icon = "star"'])
    expect(shown.Properties).toEqual(["toggle = true", 'icon = "star"', 'type = "button"'])
    expect(shown.States).toEqual([])
    await expect.poll(() => inspector.internals.ariaLabel).toBe('Live view of <ui-button id="star">')
  })

  it("follows a click:  the attribute, the property and the state come in", async () => {
    const { inspector, target } = await render(TOGGLE)
    target!.shadowRoot!.querySelector("button")!.click()
    await expect.poll(() => groups(inspector).States).toEqual([":state(active)"])
    const shown = groups(inspector)
    expect(shown.Attributes).toContain('active = ""')
    expect(shown.Properties).toContain("active = true")
  })

  it("keeps an unchanged row's node:  only changed rows draw again", async () => {
    const { inspector, target } = await render(TOGGLE)
    const iconRow = () =>
      [...inspector.shadowRoot!.querySelectorAll("[part~=row]")].find((row) => row.textContent!.startsWith("icon"))
    const before = iconRow()
    ;(target as unknown as { size: string }).size = "large"
    await expect.poll(() => groups(inspector).Properties).toContain('size = "large"')
    expect(iconRow()).toBe(before)
  })

  it("`all` shows unset properties too", async () => {
    const { inspector } = await render(TOGGLE.replace("<ui-docs-inspector", "<ui-docs-inspector all"))
    const properties = groups(inspector).Properties!
    expect(properties).toContain("active = false")
    expect(properties).toContain("size = undefined")
  })

  it("is `:state(missing)` while no element has the id, and picks it up once one does", async () => {
    const { inspector, wrapper } = await render(`<div><ui-docs-inspector for="later"></ui-docs-inspector></div>`)
    expect(inspector.matches(":state(missing)")).toBe(true)
    expect(inspector.shadowRoot!.querySelector("[part~=missing]")!.textContent).toBe("No element with id “later”")
    wrapper.insertAdjacentHTML("beforeend", `<input id="later" value="x">`)
    await expect.poll(() => inspector.matches(":state(missing)")).toBe(false)
    expect(groups(inspector)).toEqual({ Attributes: ['id = "later"', 'value = "x"'], Properties: [], States: [] })
  })

  it("follows a new `for` at once", async () => {
    const { inspector } = await render(`
      <div>
        <ui-button id="one">A</ui-button>
        <ui-button id="other" primary>B</ui-button>
        <ui-docs-inspector for="one"></ui-docs-inspector>
      </div>`)
    inspector.setAttribute("for", "other")
    await expect
      .poll(() => inspector.shadowRoot!.querySelector("[part~=title]")!.textContent)
      .toBe('<ui-button id="other">')
    expect(groups(inspector).Properties).toEqual(["primary = true", 'type = "button"'])
  })
})

describe("<ui-docs-inspector> examples", () => {
  it.each(Object.entries(EXAMPLES))("%s:  renders and is accessible", async (_path, html) => {
    const { inspector } = await render(html)
    expect(inspector.matches(":state(missing)")).toBe(false)
    await expectAccessible(inspector)
  })
})
