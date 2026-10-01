import { describe, expect, it, onTestFinished } from "vitest"

import { ICON_SET_ATTRIBUTES, ICON_SET_TAG } from "$/ui/icons"
import { expectAccessible } from "$/ui/test/a11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import { iconSetVocabulary } from "./icon.vocabulary.en"

import "$/ui/components/icon"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/icon/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render one `<ui-icon>`;  returns it with its root span. */
async function icon(html: string) {
  const host = await ElementFixture.render<UIHost>(html)
  const root = host.shadowRoot!.querySelector<HTMLElement>("[part~=icon]")!
  return { host, root }
}

describe("<ui-icon> classes", () => {
  it.each([
    ["", "ui icon"],
    ['size="large"', "ui large icon"],
    ['size="medium"', "ui icon"],
    ['color="red"', "ui red icon"],
    ["circular inverted", "ui circular inverted icon"],
    ['circular="no"', "ui icon"],
    ['bordered="yes"', "ui bordered icon"],
    ["disabled loading", "ui disabled loading icon"],
    ["fitted link", "ui fitted link icon"],
    ["flipped", "ui flipped icon"],
    ['flipped="vertically"', "ui vertically flipped icon"],
    ["rotated", "ui rotated icon"],
    ['rotated="counterclockwise"', "ui counterclockwise rotated icon"],
    ["corner", "ui corner icon"],
    ['corner="top left"', "ui top left corner icon"],
    ['size="huge" color="blue" rotated="halfway"', "ui huge blue halfway rotated icon"]
  ])("<ui-icon %s>", async (attributes, classes) => {
    const { root } = await icon(`<ui-icon name="house" ${attributes}></ui-icon>`)
    expect(root.className).toBe(classes)
  })

  it("draws the svg for `name`, and a new one when it changes", async () => {
    const { host, root } = await icon(`<ui-icon name="house"></ui-icon>`)
    await expect.poll(() => root.querySelector("svg path")).not.toBeNull()
    const first = root.querySelector("svg path")!.getAttribute("d")
    host.setAttribute("name", "check circle")
    await expect.poll(() => root.querySelector("svg path")?.getAttribute("d")).not.toBe(first)
    expect(root.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true")
  })

  it("draws `… outline` as the regular icon;  `outline` ~== that name, and `element.style` stays native", async () => {
    const { host: solid } = await icon(`<ui-icon name="heart"></ui-icon>`)
    const { host: named } = await icon(`<ui-icon name="heart outline"></ui-icon>`)
    const { host: outline } = await icon(`<ui-icon name="heart" outline style="color: red"></ui-icon>`)
    await expect.poll(() => [solid, named, outline].every((host) => !!path(host))).toBe(true)
    expect(path(solid)).not.toBe(path(named))
    expect(path(outline)).toBe(path(named))
    expect(outline.style).toBeInstanceOf(CSSStyleDeclaration)
    expect(outline.style.color).toBe("red")
  })

  it.each(["github", "circle-check", "Address Book"])("draws `name=%j` from the default pack", async (name) => {
    const { host } = await icon(`<ui-icon name="${name}"></ui-icon>`)
    await expect.poll(() => path(host)).toBeTruthy()
  })

  it("sets `:state(disabled)` / `:state(loading)`", async () => {
    const { host } = await icon(`<ui-icon name="spinner" loading disabled></ui-icon>`)
    expect(host.matches(":state(loading)")).toBe(true)
    expect(host.matches(":state(disabled)")).toBe(true)
  })
})

describe("<ui-icon> tokens from outside", () => {
  /** The root span's width. */
  function width(root: Element): string {
    return getComputedStyle(root).width
  }

  /** The root span of the first `<ui-icon>` in `wrapper`. */
  function rootIn(wrapper: Element): Element {
    return wrapper.querySelector("ui-icon")!.shadowRoot!.querySelector("[part~=icon]")!
  }

  it("takes a token set on the HOST", async () => {
    const { root } = await icon(`<ui-icon name="house" style="--ui-icon-width: 30px"></ui-icon>`)
    expect(width(root)).toBe("30px")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const wrapper = await ElementFixture.render(
      `<section style="--ui-icon-width: 30px"><ui-icon name="house"></ui-icon></section>`
    )
    expect(width(rootIn(wrapper))).toBe("30px")
  })

  it("takes a token set through `::part(icon)`", async () => {
    const wrapper = await ElementFixture.render(
      `<div><style>.themed::part(icon) { --ui-icon-width: 30px }</style><ui-icon class="themed" name="house"></ui-icon></div>`
    )
    expect(width(rootIn(wrapper))).toBe("30px")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-icon-width", "30px")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-icon-width")
    })
    const { root } = await icon(`<ui-icon name="house"></ui-icon>`)
    expect(width(root)).toBe("30px")
  })

  it("variations:  `circular` swaps the width;  a size follows its ladder token", async () => {
    const { root } = await icon(`<ui-icon name="house" circular style="--ui-icon-width: 30px"></ui-icon>`)
    expect(width(root)).not.toBe("30px")
    const { root: huge } = await icon(`<ui-icon name="house" size="huge" style="--ui-icon-size-huge: 2"></ui-icon>`)
    expect(getComputedStyle(huge).fontSize).toBe("32px")
  })

  it("reaches the members of a group, set on the group", async () => {
    const group = await ElementFixture.render(
      `<ui-icons style="--ui-icon-width: 30px"><ui-icon name="house"></ui-icon></ui-icons>`
    )
    expect(width(rootIn(group))).toBe("30px")
  })
})

describe("<ui-icon> accessibility", () => {
  it("is hidden without a label, an image with one", async () => {
    const { host } = await icon(`<ui-icon name="house"></ui-icon>`)
    expect(host.internals.ariaHidden).toBe("true")
    expect(host.internals.role).toBeNull()
    host.setAttribute("label", "Home")
    await ElementFixture.tick()
    expect(host.internals.role).toBe("img")
    expect(host.internals.ariaLabel).toBe("Home")
    expect(host.internals.ariaHidden).toBeNull()
  })

  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})

describe("<ui-icons>", () => {
  it("renders the group and puts direct children in `:state(in-icons)`", async () => {
    const group = await ElementFixture.render<UIHost>(
      `<ui-icons size="huge" label="Add user"><ui-icon name="user"></ui-icon><ui-icon name="plus" corner="top right"></ui-icon></ui-icons>`
    )
    const root = group.shadowRoot!.querySelector("[part~=icons]")!
    expect(root.className).toBe("ui huge icons")
    expect(root.querySelector("slot")).not.toBeNull()
    expect(group.internals.role).toBe("img")
    const [base, corner] = group.querySelectorAll<UIHost>("ui-icon")
    expect(base!.matches(":state(in-icons)")).toBe(true)
    expect(corner!.matches(":state(in-icons)")).toBe(true)
    expect(corner!.shadowRoot!.querySelector("[part~=icon]")!.className).toBe("ui top right corner icon")
    // positioned by the group:  the corner's root is absolutely positioned against the group's root
    expect(getComputedStyle(corner!.shadowRoot!.querySelector("[part~=icon]")!).position).toBe("absolute")
  })

  it("doesn't claim an icon that isn't a direct child, nor a standalone one", async () => {
    const root = await ElementFixture.render(
      `<div><ui-icons><span><ui-icon name="user"></ui-icon></span></ui-icons><ui-icon name="user"></ui-icon></div>`
    )
    for (const element of root.querySelectorAll("ui-icon")) expect(element.matches(":state(in-icons)")).toBe(false)
  })

  it("follows an icon moved into and out of a group", async () => {
    const root = await ElementFixture.render(`<div><ui-icons></ui-icons><ui-icon name="user"></ui-icon></div>`)
    const group = root.querySelector("ui-icons")!
    const child = root.querySelector("ui-icon")!
    group.append(child)
    await ElementFixture.settle(root)
    expect(child.matches(":state(in-icons)")).toBe(true)
    root.append(child)
    await ElementFixture.settle(root)
    expect(child.matches(":state(in-icons)")).toBe(false)
  })
})

describe("<ui-icon-set>", () => {
  it("names the tag and attributes the runtime reads", () => {
    expect(iconSetVocabulary.tag).toBe(ICON_SET_TAG)
    expect(iconSetVocabulary.attributes.map((attribute) => attribute.name)).toEqual(Object.values(ICON_SET_ATTRIBUTES))
  })

  it("is hidden, and adds a pack:  `slack` only draws once `fa7-brands` is added", async () => {
    const { host: before, root } = await icon(`<ui-icon name="slack"></ui-icon>`)
    await ElementFixture.settle()
    expect(root.querySelector("svg")).toBeNull()
    const set = await ElementFixture.render<UIHost>(`<ui-icon-set src="fa7-brands"></ui-icon-set>`)
    expect(getComputedStyle(set).display).toBe("none")
    const { host: after } = await icon(`<ui-icon name="slack"></ui-icon>`)
    await expect.poll(() => path(after)).toBeTruthy()
    expect(path(before)).toBeUndefined()
    set.remove()
  })

  it("draws a stroke-style pack's icon stroked, not filled", async () => {
    const pack = new URL("/test/fixtures/stroke-pack/pack.js", location.href).href
    const set = await ElementFixture.render<UIHost>(`<ui-icon-set src="${pack}" prefix="lucide"></ui-icon-set>`)
    const { root } = await icon(`<ui-icon name="lucide:bell"></ui-icon>`)
    await expect.poll(() => root.querySelector("svg")).not.toBeNull()
    const svg = root.querySelector("svg")!
    expect(getComputedStyle(svg).fill).toBe("none")
    expect(getComputedStyle(svg).stroke).not.toBe("none")
    set.remove()
  })
})

/** `d` of the first path an icon drew, or `undefined`. */
function path(host: UIHost): string | undefined {
  return host.shadowRoot!.querySelector("svg path")?.getAttribute("d") ?? undefined
}
