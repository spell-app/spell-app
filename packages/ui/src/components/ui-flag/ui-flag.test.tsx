import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { UI } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-flag"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-flag/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one `<ui-flag>`;  returns it with its root. */
async function flag(html: string) {
  const host = await ElementFixture.render<UIHost>(html)
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=flag]")!
  return { host, root }
}

////////////////
// ## Classes
////////////////

describe("<ui-flag> classes", () => {
  it.each([
    ['country="fr"', "ui flag fr"],
    ['country="fr" size="large"', "ui large flag fr"],
    ['country="fr" size="medium"', "ui flag fr"],
    ['country="fr" size="massive"', "ui massive flag fr"],
    ['country="england"', "ui flag gb-eng"]
  ])("<ui-flag %s>", async (attributes, classes) => {
    const { root } = await flag(`<ui-flag ${attributes}></ui-flag>`)
    expect(root.localName).toBe("span")
    expect(root.className).toBe(classes)
  })
})

////////////////
// ## Glyph and name
////////////////

describe("<ui-flag> glyph and name", () => {
  it("is role=img, named by its region in the runtime's locale, holding the emoji", async () => {
    const { root } = await flag(`<ui-flag country="fr"></ui-flag>`)
    expect(root.getAttribute("role")).toBe("img")
    expect(root.getAttribute("aria-label")).toBe(UI.i18n.displayName("region", "FR"))
    expect(root.getAttribute("aria-label")).toBe("France")
    expect(root.textContent).toBe("🇫🇷")
  })

  it("names the non-country flags from its texts", async () => {
    const { root } = await flag(`<ui-flag country="pirate"></ui-flag>`)
    expect(root.getAttribute("aria-label")).toBe("Pirate flag")
    const { root: wales } = await flag(`<ui-flag country="wales"></ui-flag>`)
    expect(wales.getAttribute("aria-label")).toBe("Wales")
  })

  it("follows `country`", async () => {
    const { host, root } = await flag(`<ui-flag country="fr"></ui-flag>`)
    host.setAttribute("country", "Germany")
    await ElementFixture.tick()
    expect(root.textContent).toBe("🇩🇪")
    expect(root.getAttribute("aria-label")).toBe("Germany")
  })

  it("renders an empty, unnamed box for an unknown country", async () => {
    const { root } = await flag(`<ui-flag country="atlantis"></ui-flag>`)
    expect(root.textContent).toBe("")
    expect(root.hasAttribute("role")).toBe(false)
    expect(root.hasAttribute("aria-label")).toBe(false)
    expect(root.className).toBe("ui flag")
  })

  it("is sized against the surrounding text", async () => {
    const { host, root } = await flag(`<ui-flag country="fr" size="large"></ui-flag>`)
    const surrounding = Number.parseFloat(getComputedStyle(host.parentElement!).fontSize)
    expect(Number.parseFloat(getComputedStyle(root).fontSize)).toBeCloseTo(surrounding * 6, 0)
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-flag> tokens from outside", () => {
  /** The inner box's margin right. */
  function measure(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=flag]")!).marginRight
  }

  /** The element under test. */
  const MARKUP = `<ui-flag country="fr"></ui-flag>`

  it("takes a token set on the HOST", async () => {
    const host = await ElementFixture.render(MARKUP.replace("<ui-flag", `<ui-flag style="--ui-flag-distance: 10px"`))
    expect(measure(host)).toBe("10px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-flag-distance: 10px"><div>${MARKUP}</div></section>`
    )
    expect(measure(wrapper.querySelector("ui-flag")!)).toBe("10px")
  })

  it("takes a token set through `::part(flag)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(flag) { --ui-flag-distance: 10px }</style>${MARKUP.replace("<ui-flag", '<ui-flag class="themed"')}</div>`
    )
    expect(measure(wrapper.querySelector("ui-flag")!)).toBe("10px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-flag-distance", "10px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-flag-distance")
    })
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("10px")
  })

  it("keeps its defaults when nothing is set", async () => {
    const host = await ElementFixture.render(MARKUP)
    const probe = await ElementFixture.render(`<span style="margin-right: var(--ui-space-2xs)"></span>`)
    expect(measure(host)).toBe(getComputedStyle(probe).marginRight)
  })

  it("variations:  a size reads its ratio token", async () => {
    const host = await ElementFixture.render(
      `<div style="font-size: 16px"><ui-flag country="fr" size="large" style="--ui-flag-size-large: 4"></ui-flag></div>`
    )
    const root = host.querySelector("ui-flag")!.shadowRoot!.querySelector("[part~=flag]")!
    expect(getComputedStyle(root).fontSize).toBe("64px")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-flag> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
