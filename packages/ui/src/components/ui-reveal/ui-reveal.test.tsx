/// <reference types="vite-plus/test/browser-playwright" />
import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { commands, userEvent } from "vite-plus/test/browser"
import { Keys } from "$/ui/test/Keys"

import { expectAccessible } from "$/ui/test/A11y"

import { ElementFixture } from "$/ui/test/ElementFixture"
import type { UIHost } from "$/ui/elements"

import "$/ui/components/ui-reveal"

/** Element-markup rewrites of every example, by path. */
const EXAMPLES = import.meta.glob<string>("/src/components/ui-reveal/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** A tiny image URL. */
const IMAGE = "data:image/gif;base64,R0lGODlhAQABAAAAACw="

/** Two 100px images in `<ui-reveal attributes>`;  `extra` goes in the hidden slot after the image. */
function markup(attributes: string, extra = "") {
  return (
    `<ui-reveal ${attributes}><img slot="visible" src="${IMAGE}" alt="Front" width="100" height="100">` +
    `<img slot="hidden" src="${IMAGE}" alt="Back" width="100" height="100">${extra}</ui-reveal>`
  )
}

/** Render one reveal;  returns it with its root and content boxes. */
async function render(html: string) {
  const host = await ElementFixture.render<UIHost>(html)
  const root = host.shadowRoot!.firstElementChild as HTMLElement
  const visible = root.querySelector<HTMLElement>("[part=visible]")!
  const hidden = root.querySelector<HTMLElement>("[part=hidden]")!
  return { host, root, visible, hidden }
}

/** Wait for `element`'s transitions to finish. */
async function settled(element: Element) {
  await Promise.all(element.getAnimations().map((animation) => animation.finished))
}

////////////////
// ## Rendering
////////////////

describe("<ui-reveal> classes", () => {
  it.each([
    ["", "ui reveal"],
    ["fade", "ui fade reveal"],
    ["move", "ui move reveal"],
    ['move="right"', "ui right move reveal"],
    ['rotate="left"', "ui left rotate reveal"],
    ['slide="down"', "ui down slide reveal"],
    ['size="small" instant visible', "ui small instant visible reveal"],
    ["active disabled fade", "ui active disabled fade reveal"]
  ])("<ui-reveal %s>", async (attributes, classes) => {
    const { root } = await render(markup(attributes))
    expect(root.className).toBe(classes)
    expect(root.getAttribute("part")).toBe("reveal")
  })
})

describe("<ui-reveal> structure", () => {
  it("wraps the visible slot (and the default slot) and the hidden slot in Fomantic's content boxes", async () => {
    const { host, visible, hidden } = await render(markup("fade", "<span>more</span>"))
    expect(visible.className).toBe("visible content")
    expect(hidden.className).toBe("hidden content")
    const [front, back] = host.querySelectorAll("img")
    expect(front!.assignedSlot!.parentElement).toBe(visible)
    expect(back!.assignedSlot!.parentElement).toBe(hidden)
    expect(getComputedStyle(visible).position).toBe("absolute")
    expect(getComputedStyle(hidden).position).toBe("relative")
  })

  it("lays the visible content over the hidden one, the box as big as the hidden content", async () => {
    const { root, visible, hidden } = await render(markup("fade"))
    const box = root.getBoundingClientRect()
    expect(box.width).toBeCloseTo(100, 0)
    expect(box.height).toBeCloseTo(100, 0)
    expect(visible.getBoundingClientRect().top).toBe(hidden.getBoundingClientRect().top)
    expect(Number(getComputedStyle(visible).zIndex)).toBeGreaterThan(Number(getComputedStyle(hidden).zIndex))
  })
})

////////////////
// ## Behaviour
////////////////

describe("<ui-reveal> revealing", () => {
  it("reveals on hover", async () => {
    const { root, visible } = await render(markup("fade instant"))
    await userEvent.hover(root)
    await settled(visible)
    expect(getComputedStyle(visible).opacity).toBe("0")
    await userEvent.unhover(root)
    await settled(visible)
    expect(getComputedStyle(visible).opacity).toBe("1")
  })

  it("reveals while active, :state(active)", async () => {
    const { host, visible } = await render(markup("move active instant"))
    await settled(visible)
    expect(getComputedStyle(visible).transform).not.toBe("none")
    expect(host.matches(":state(active)")).toBe(true)
  })

  it("is a named tab stop, and reveals on keyboard focus", async () => {
    const holder = await ElementFixture.render(
      `<div><button>before</button>${markup('fade instant aria-label="Stevie"')}</div>`
    )
    const host = holder.querySelector<UIHost>("ui-reveal")!
    const root = host.shadowRoot!.firstElementChild as HTMLElement
    expect(root.getAttribute("tabindex")).toBe("0")
    expect(root.getAttribute("role")).toBe("group")
    expect(root.getAttribute("aria-label")).toBe("Stevie")
    holder.querySelector("button")!.focus()
    await Keys.tab()
    expect(root.matches(":focus-visible")).toBe(true)
    const visible = root.querySelector<HTMLElement>("[part=visible]")!
    await settled(visible)
    expect(getComputedStyle(visible).opacity).toBe("0")
  })

  it("needs no stop of its own when the content is focusable:  the link's focus reveals it", async () => {
    const { host, root, visible } = await render(markup("fade instant", `<a slot="hidden" href="#x">Profile</a>`))
    await ElementFixture.tick()
    expect(root.hasAttribute("tabindex")).toBe(false)
    expect(root.hasAttribute("role")).toBe(false)
    host.querySelector("a")!.focus()
    await settled(visible)
    expect(getComputedStyle(visible).opacity).toBe("0")
    host.querySelector("a")!.remove()
    await ElementFixture.tick()
    expect(root.getAttribute("tabindex")).toBe("0")
  })

  it("never reveals when disabled, and is no tab stop", async () => {
    const { host, root, visible, hidden } = await render(markup("move disabled instant"))
    expect(root.hasAttribute("tabindex")).toBe(false)
    expect(host.matches(":state(disabled)")).toBe(true)
    await userEvent.hover(root)
    await settled(visible)
    expect(getComputedStyle(visible).transform).toBe("none")
    expect(getComputedStyle(hidden).display).toBe("none")
  })

  it("swaps at once under prefers-reduced-motion", async () => {
    await commands.emulateReducedMotion(true)
    onTestFinished(() => commands.emulateReducedMotion(false))
    const { visible } = await render(markup("move"))
    // ~0:  the foundation's own reduced-motion rule (`reset.css`) may pin it to a hair above zero
    expect(parseFloat(getComputedStyle(visible).transitionDuration)).toBeLessThan(0.001)
    expect(parseFloat(getComputedStyle(visible).transitionDelay)).toBeLessThan(0.001)
  })
})

////////////////
// ## Tokens
////////////////

describe("<ui-reveal> tokens from outside", () => {
  /** The visible content's transition duration. */
  async function duration(html: string, select = (element: Element) => element) {
    const element = await ElementFixture.render(html)
    const host = select(element)
    return getComputedStyle(host.shadowRoot!.querySelector("[part=visible]")!).transitionDuration
  }

  it("takes a token set on the HOST", async () => {
    expect(await duration(markup(`fade style="--ui-reveal-duration: 1s"`))).toBe("1s")
  })

  it("takes a token set on an ANCESTOR", async () => {
    const html = `<section style="--ui-reveal-duration: 1s">${markup("fade")}</section>`
    expect(await duration(html, (section) => section.querySelector("ui-reveal")!)).toBe("1s")
  })

  it("takes a token set through `::part(reveal)`", async () => {
    const html = `<div><style>.themed::part(reveal) { --ui-reveal-duration: 1s }</style>${markup('fade class="themed"')}</div>`
    expect(await duration(html, (wrapper) => wrapper.querySelector("ui-reveal")!)).toBe("1s")
  })

  it("takes a token set on `:root`", async () => {
    document.documentElement.style.setProperty("--ui-reveal-duration", "1s")
    onTestFinished(() => {
      document.documentElement.style.removeProperty("--ui-reveal-duration")
    })
    expect(await duration(markup("fade"))).toBe("1s")
  })

  it("keeps its defaults when nothing is set", async () => {
    expect(await duration(markup("fade"))).toBe("0.5s")
  })
})

////////////////
// ## Accessibility
////////////////

describe("<ui-reveal> accessibility", () => {
  it.each(Object.keys(EXAMPLES))("axe passes on %s", async (path) => {
    const root = await ElementFixture.render(EXAMPLES[path]!)
    await expectAccessible(root)
  })
})
