import { describe, expect, it, onTestFinished } from "vitest"

import { UI } from "$/ui/runtime"
import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-ad"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-ad/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one ad;  returns it with its root. */
async function render(html: string) {
  const host = await ElementFixture.render<UIHost>(html)
  const root = host.shadowRoot!.firstElementChild as HTMLElement
  return { host, root }
}

describe("<ui-ad> classes", () => {
  it.each([
    ["", "ui ad"],
    ['unit="medium rectangle"', "ui medium rectangle ad"],
    ['unit="leaderboard" centered', "ui leaderboard centered ad"],
    ['unit="large mobile banner"', "ui large mobile banner ad"],
    ['unit="small square" test', "ui small square ad test"],
    ['unit="huge rectangle"', "ui ad"]
  ])("<ui-ad %s>", async (attributes, classes) => {
    const { root } = await render(`<ui-ad ${attributes}></ui-ad>`)
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("ad")
  })
})

describe("<ui-ad> units and test", () => {
  it.each([
    ["medium rectangle", 300, 250],
    ["large rectangle", 336, 280],
    ["half page", 300, 600],
    ["small rectangle", 180, 150],
    ["vertical rectangle", 240, 400],
    ["square", 250, 250],
    ["small square", 200, 200],
    ["button", 120, 90],
    ["square button", 125, 125],
    ["small button", 120, 60],
    ["skyscraper", 120, 600],
    ["wide skyscraper", 160, 600],
    ["banner", 468, 60],
    ["vertical banner", 120, 240],
    ["top banner", 930, 180],
    ["half banner", 234, 60],
    ["leaderboard", 728, 90],
    ["large leaderboard", 970, 90],
    ["billboard", 970, 250],
    ["panorama", 980, 120],
    ["netboard", 580, 400]
  ])("sizes a %s to %i x %i", async (unit, width, height) => {
    const { root } = await render(`<ui-ad unit="${unit}"></ui-ad>`)
    const style = getComputedStyle(root)
    expect(style.width).toBe(`${width}px`)
    expect(style.height).toBe(`${height}px`)
  })

  it("shows mobile units on phone-sized viewports only", async () => {
    const { root } = await render(`<ui-ad unit="mobile leaderboard"></ui-ad>`)
    const phone = matchMedia("(width < 768px)").matches
    expect(getComputedStyle(root).display).toBe(phone ? "block" : "none")
  })

  it("draws a test ad's text:  the translated 'Ad' when bare, else its own", async () => {
    await UI.load()
    const { host, root } = await render(`<ui-ad unit="small rectangle" test></ui-ad>`)
    expect(root.dataset.text).toBe(UI.i18n.t("adTest"))
    expect(getComputedStyle(root, "::after").content).toBe(`"Ad"`)
    host.setAttribute("test", "Your ad here")
    await ElementFixture.tick()
    expect(getComputedStyle(root, "::after").content).toBe(`"Your ad here"`)
    host.removeAttribute("test")
    await ElementFixture.tick()
    expect(root.hasAttribute("data-text")).toBe(false)
    expect(root.className).toBe("ui small rectangle ad")
  })

  it("centres a centered ad", async () => {
    const holder = await ElementFixture.render(
      `<div style="width: 600px"><p>x</p><ui-ad unit="small rectangle" centered></ui-ad><p>y</p></div>`
    )
    const root = holder.querySelector<UIHost>("ui-ad")!.shadowRoot!.firstElementChild!
    const box = root.getBoundingClientRect()
    const parent = holder.getBoundingClientRect()
    expect(box.left - parent.left).toBeCloseTo(parent.right - box.right, 0)
  })
})

describe("<ui-ad> tokens from outside", () => {
  /** The inner box's background color. */
  function measure(host: Element): string {
    return getComputedStyle(host.shadowRoot!.querySelector("[part~=ad]")!).backgroundColor
  }

  /** The element under test. */
  const MARKUP = `<ui-ad test unit="button"></ui-ad>`

  it("takes a token set on the HOST", async () => {
    const host = await ElementFixture.render(
      MARKUP.replace("<ui-ad", `<ui-ad style="--ui-ad-test-background: rgb(255, 0, 0)"`)
    )
    expect(measure(host)).toBe("rgb(255, 0, 0)")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-ad-test-background: rgb(255, 0, 0)"><div>${MARKUP}</div></section>`
    )
    expect(measure(wrapper.querySelector("ui-ad")!)).toBe("rgb(255, 0, 0)")
  })

  it("takes a token set through `::part(ad)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(ad) { --ui-ad-test-background: rgb(255, 0, 0) }</style>${MARKUP.replace("<ui-ad", '<ui-ad class="themed"')}</div>`
    )
    expect(measure(wrapper.querySelector("ui-ad")!)).toBe("rgb(255, 0, 0)")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-ad-test-background", "rgb(255, 0, 0)")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-ad-test-background")
    })
    const host = await ElementFixture.render(MARKUP)
    expect(measure(host)).toBe("rgb(255, 0, 0)")
  })

  it("keeps its defaults when nothing is set", async () => {
    const host = await ElementFixture.render(MARKUP)
    const probe = await ElementFixture.render(`<span style="background-color: oklch(0.4 0 0)"></span>`)
    expect(measure(host)).toBe(getComputedStyle(probe).backgroundColor)
  })
})

describe("<ui-ad> outer margin", () => {
  it("keeps 1em vertical margins between siblings:  the HOST's position decides (the root is an only child)", async () => {
    const holder = await ElementFixture.render(
      `<div><h4>Heading</h4><ui-ad unit="small square"></ui-ad><ui-ad unit="small square"></ui-ad></div>`
    )
    const [middle, last] = [...holder.querySelectorAll<UIHost>("ui-ad")].map((host) =>
      getComputedStyle(host.shadowRoot!.firstElementChild!)
    )
    expect([middle!.marginTop, middle!.marginBottom]).toEqual(["16px", "16px"])
    expect([last!.marginTop, last!.marginBottom]).toEqual(["0px", "0px"])
  })
})

describe("<ui-ad> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
