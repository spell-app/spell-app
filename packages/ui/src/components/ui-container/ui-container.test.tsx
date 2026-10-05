import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-container"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-container/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

describe("<ui-container>", () => {
  it.each([
    ["", "ui container"],
    ["text", "ui text container"],
    ['text="no"', "ui container"],
    ['fluid="yes"', "ui fluid container"],
    ["wide", "ui wide container"],
    ['grid relaxed="very"', "ui grid very relaxed container"],
    ["grid relaxed", "ui grid relaxed container"],
    ['text-align="justified"', "ui justified container"],
    ['text-align="center"', "ui center aligned container"],
    ['scrolling="very short" resizable', "ui resizable very short scrolling container"]
  ])("<ui-container %s>", async (attributes, classes) => {
    const host = await ElementFixture.render<UIHost>(`<ui-container ${attributes}><p>x</p></ui-container>`)
    const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=container]")!
    expect(root.className).toBe(classes)
    expect(root.localName).toBe("div")
    expect(root.querySelector("slot")).not.toBeNull()
  })

  it("centres a fixed width on wide pages", async () => {
    const host = await ElementFixture.render<UIHost>(`<ui-container><p>x</p></ui-container>`)
    const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=container]")!
    const style = getComputedStyle(root)
    expect(style.marginLeft).toBe(style.marginRight)
  })
})

describe("<ui-container> tokens from outside", () => {
  /** The inner box's max width. */
  function measure(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=container]")!).maxWidth
  }

  /** The element under test. */
  const MARKUP = `<ui-container text>Text</ui-container>`

  it("takes a token set on the HOST", async () => {
    const host = await ElementFixture.render(
      MARKUP.replace("<ui-container", `<ui-container style="--ui-container-text-width: 500px"`)
    )
    expect(measure(host)).toBe("500px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-container-text-width: 500px"><div>${MARKUP}</div></section>`
    )
    expect(measure(wrapper.querySelector("ui-container")!)).toBe("500px")
  })

  it("takes a token set through `::part(container)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(container) { --ui-container-text-width: 500px }</style>${MARKUP.replace("<ui-container", '<ui-container class="themed"')}</div>`
    )
    expect(measure(wrapper.querySelector("ui-container")!)).toBe("500px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-container-text-width", "500px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-container-text-width")
    })
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("500px")
  })

  it("keeps its defaults when nothing is set", async () => {
    const host = await ElementFixture.render(MARKUP)
    const probe = await ElementFixture.render(`<span style="max-width: 700px"></span>`)
    expect(measure(host)).toBe(getComputedStyle(probe).maxWidth)
  })
})

describe("<ui-container> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
