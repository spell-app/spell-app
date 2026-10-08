import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-text"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-text/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one `<ui-text>`;  returns it with its root. */
async function text(html: string) {
  const host = await ElementFixture.render<DOMElement>(html)
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=text]")!
  return { host, root }
}

////////////////
// ## Rendering
////////////////

describe("<ui-text> classes", () => {
  it.each([
    ["", "ui text"],
    ['size="large"', "ui large text"],
    ['size="medium"', "ui text"],
    ['color="red"', "ui red text"],
    ['state="error"', "ui error text"],
    ['color="red" inverted', "ui red inverted text"],
    ['inverted="no"', "ui text"],
    ['disabled="yes"', "ui disabled text"],
    ['size="huge" color="blue" state="warning" disabled', "ui huge blue warning disabled text"]
  ])("<ui-text %s>", async (attributes, classes) => {
    const { root } = await text(`<ui-text ${attributes}>Words</ui-text>`)
    expect(root.localName).toBe("span")
    expect(root.className).toBe(classes)
    expect(root.querySelector("slot")).not.toBeNull()
  })

  it("follows attribute changes", async () => {
    const { host, root } = await text(`<ui-text color="red">Words</ui-text>`)
    host.setAttribute("color", "green")
    await ElementFixture.tick()
    expect(root.className).toBe("ui green text")
  })
})

describe("<ui-text> states and looks", () => {
  it("sets :state(disabled)", async () => {
    const { host } = await text(`<ui-text disabled>x</ui-text>`)
    expect(host.matches(":state(disabled)")).toBe(true)
    host.removeAttribute("disabled")
    await ElementFixture.tick()
    expect(host.matches(":state(disabled)")).toBe(false)
  })

  it("flows inline:  the element has no box, the span is sized against the surrounding text", async () => {
    const { host, root } = await text(`<ui-text size="huge">x</ui-text>`)
    expect(getComputedStyle(host).display).toBe("contents")
    expect(getComputedStyle(root).display).toBe("inline")
    const surrounding = Number.parseFloat(getComputedStyle(host.parentElement!).fontSize)
    expect(Number.parseFloat(getComputedStyle(root).fontSize)).toBeCloseTo(surrounding * 4, 0)
  })

  it("paints a hue different from uncoloured text", async () => {
    const { root: plain } = await text(`<ui-text>x</ui-text>`)
    const { root: red } = await text(`<ui-text color="red">x</ui-text>`)
    expect(getComputedStyle(red).color).not.toBe(getComputedStyle(plain).color)
  })
})

////////////////
// ## Tokens
////////////////

describe("<ui-text> tokens from outside", () => {
  /** The inner box's opacity. */
  function measure(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=text]")!).opacity
  }

  /** The element under test. */
  const MARKUP = `<ui-text disabled>Off</ui-text>`

  it("takes a token set on the element", async () => {
    const host = await ElementFixture.render(
      MARKUP.replace("<ui-text", `<ui-text style="--ui-text-disabled-opacity: 0.25"`)
    )
    expect(measure(host)).toBe("0.25")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-text-disabled-opacity: 0.25"><div>${MARKUP}</div></section>`
    )
    expect(measure(wrapper.querySelector("ui-text")!)).toBe("0.25")
  })

  it("takes a token set through `::part(text)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(text) { --ui-text-disabled-opacity: 0.25 }</style>${MARKUP.replace("<ui-text", '<ui-text class="themed"')}</div>`
    )
    expect(measure(wrapper.querySelector("ui-text")!)).toBe("0.25")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-text-disabled-opacity", "0.25")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-text-disabled-opacity")
    })
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("0.25")
  })

  it("keeps its defaults when nothing is set", async () => {
    const host = await ElementFixture.render(MARKUP)
    const probe = await ElementFixture.render(`<span style="opacity: var(--ui-disabled-opacity)"></span>`)
    expect(measure(host)).toBe(getComputedStyle(probe).opacity)
  })

  it("variations:  a size reads its ratio token", async () => {
    const host = await ElementFixture.render(
      `<div style="font-size: 16px"><ui-text size="large" style="--ui-text-size-large: 3">Big</ui-text></div>`
    )
    const root = host.querySelector("ui-text")!.shadowRoot!.querySelector("[part~=text]")!
    expect(getComputedStyle(root).fontSize).toBe("48px")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-text> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
