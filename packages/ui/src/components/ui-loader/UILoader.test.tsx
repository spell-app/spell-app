import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { DOMElement } from "$/ui/elements"

import "$/ui/components/ui-loader"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-loader/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one `<ui-loader>`;  returns it with its root. */
async function loader(html: string) {
  const host = await ElementFixture.render<DOMElement & { visible: boolean }>(html)
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=loader]")!
  return { host, root }
}

////////////////
// ## Classes
////////////////

describe("<ui-loader> classes", () => {
  it.each([
    ["", "ui loader"],
    ['size="large"', "ui large loader"],
    ['size="medium"', "ui loader"],
    ['color="red" speed="slow"', "ui red slow loader"],
    ['speed="fast" visible', "ui fast active loader"],
    ['visible="yes" inline="no"', "ui active loader"],
    ["visible text", "ui text active loader"],
    ["visible inline centered", "ui centered inline active loader"],
    ["visible indeterminate", "ui indeterminate active loader"],
    ["visible double elastic inverted", "ui double elastic inverted active loader"],
    ["visible disabled", "ui disabled active loader"]
  ])("<ui-loader %s>", async (attributes, classes) => {
    const { root } = await loader(`<ui-loader ${attributes}></ui-loader>`)
    expect(root).toMatchObject({ localName: "div", className: classes })
    expect(root.querySelector("slot")).not.toBeNull()
  })
})

////////////////
// ## Live region
////////////////

describe("<ui-loader> live region", () => {
  it("is a polite status on the element, named `Loading…` while empty", async () => {
    const { host, root } = await loader(`<ui-loader visible></ui-loader>`)
    expect(host.internals).toMatchObject({ role: "status", ariaLive: "polite", ariaLabel: "Loading…" })
    // nothing in the shadow root claims the role:  the element is the region
    expect(root.hasAttribute("role")).toBe(false)
  })

  it("takes its name from slotted text instead, and back when it's removed", async () => {
    const { host } = await loader(`<ui-loader visible text>Preparing files</ui-loader>`)
    expect(host.internals.ariaLabel).toBeNull()
    host.textContent = ""
    await expect.poll(() => host.internals.ariaLabel).toBe("Loading…")
  })
})

////////////////
// ## States and visibility
////////////////

describe("<ui-loader> states and visibility", () => {
  it("sets :state(hidden) once hidden, and :state(disabled)", async () => {
    const { host } = await loader(`<ui-loader visible disabled></ui-loader>`)
    expect(host.matches(":state(hidden)")).toBe(false)
    expect(host.matches(":state(disabled)")).toBe(true)
    host.visible = false
    expect(host.hidden).toBe(true)
    await expect.poll(() => host.matches(":state(hidden)")).toBe(true)
  })

  it("starts hidden;  shows only while visible, and not while disabled", async () => {
    const { host, root } = await loader(`<ui-loader inline></ui-loader>`)
    expect(getComputedStyle(root).display).toBe("none")
    expect(host.hidden).toBe(true)
    host.visible = true
    await ElementFixture.tick()
    expect(getComputedStyle(root).display).not.toBe("none")
    host.setAttribute("disabled", "")
    await ElementFixture.tick()
    expect(getComputedStyle(root).display).toBe("none")
  })

  it("centres over the nearest positioned ancestor across the shadow boundary", async () => {
    const box = await ElementFixture.render<HTMLElement>(
      `<div style="position: relative; width: 300px; height: 200px"><ui-loader visible></ui-loader></div>`
    )
    const root = box.querySelector("ui-loader")!.shadowRoot!.querySelector<HTMLElement>("[part~=loader]")!
    const outer = box.getBoundingClientRect()
    const inner = root.getBoundingClientRect()
    expect(inner.left + inner.width / 2).toBeCloseTo(outer.left + outer.width / 2, 0)
    expect(inner.top + inner.height / 2).toBeCloseTo(outer.top + outer.height / 2, 0)
  })
})

////////////////
// ## Tokens from outside
////////////////

describe("<ui-loader> tokens from outside", () => {
  /** The inner box's width. */
  function measure(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=loader]")!).width
  }

  /** The element under test. */
  const MARKUP = `<ui-loader visible></ui-loader>`

  it("takes a token set on the element", async () => {
    const host = await ElementFixture.render(MARKUP.replace("<ui-loader", `<ui-loader style="--ui-loader-size: 40px"`))
    expect(measure(host)).toBe("40px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-loader-size: 40px"><div>${MARKUP}</div></section>`
    )
    expect(measure(wrapper.querySelector("ui-loader")!)).toBe("40px")
  })

  it("takes a token set through `::part(loader)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(loader) { --ui-loader-size: 40px }</style>${MARKUP.replace("<ui-loader", '<ui-loader class="themed"')}</div>`
    )
    expect(measure(wrapper.querySelector("ui-loader")!)).toBe("40px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-loader-size", "40px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-loader-size")
    })
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("40px")
  })

  it("keeps its defaults when nothing is set", async () => {
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("32px")
  })

  it("variations:  a speed derives from the base token", async () => {
    const { root } = await loader(`<ui-loader active speed="slow" style="--ui-loader-speed: 1s"></ui-loader>`)
    expect(getComputedStyle(root, "::after").animationDuration).toBe("1.5s")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-loader> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
