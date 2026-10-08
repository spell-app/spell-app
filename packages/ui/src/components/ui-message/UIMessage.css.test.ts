import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { messageVocabulary } from "./UIMessage.vocabulary.en"

import partsCSS from "$/ui/components/ui-parts/UIParts.css?inline"
import messageCSS from "./UIMessage.css?inline"
import messageRaw from "./UIMessage.css?raw"

/**
 * `UIMessage.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the same class grammar the shadow root will use), and what a message hands the content
 * parts slotted into it.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

////////////////
// ## Source
////////////////

describe("UIMessage.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(messageRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(messageRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(messageRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("message"))).toBe(true)
  })

  it("parses with replaceSync, keeping the ::slotted content rules and host-position spacing", () => {
    for (const css of [messageCSS, messageRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(40)
      expect(selectors.some((selector) => selector.includes("::slotted(p:first-child)"))).toBe(true)
      expect(selectors.some((selector) => selector.includes(":host(:not(:first-child)) > .ui.message"))).toBe(true)
    }
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = messageRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(messageVocabulary))
      expect(Sheets.covers(css, phrase), `${messageVocabulary.tag}: ${phrase}`).toBe(true)
  })

  it("declares the owner token the header / content parts read, on every root", () => {
    expect(messageVocabulary.ownsParts).toEqual(["header", "content"])
    expect(Sheets.withoutComments(messageRaw)).toMatch(/\.ui\.message \{[^}]*--_ui-message-layout: block;/)
    expect(Sheets.withoutComments(messageRaw)).toMatch(/\.ui\.icon\.message \{[^}]*--_ui-message-layout: icon;/)
  })
})

////////////////
// ## Examples
////////////////

describe("UIMessage.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every message in %s", (path) => {
    Sheets.adopt([...foundationCSS, messageCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const messages = root.querySelectorAll<HTMLElement>(".ui.message")
    expect(messages.length).toBeGreaterThan(0)
    for (const message of messages) {
      const style = getComputedStyle(message)
      expect(style.position, message.outerHTML.slice(0, 80)).toBe("relative")
      expect(style.boxSizing).toBe("border-box")
      if (!message.checkVisibility()) continue
      expect(style.boxShadow).toContain("inset")
      expect(parseFloat(style.paddingLeft)).toBeCloseTo(1.5 * parseFloat(style.fontSize), 1)
    }
  })

  it("draws a plain message as a tinted, bordered, rounded box with a bold header", () => {
    Sheets.adopt([...foundationCSS, messageCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const message = root.querySelector<HTMLElement>('.ui.message[class="ui message"]')!
    const style = getComputedStyle(message)
    const surface = Fixture.render(`<span style="background: var(--ui-surface-muted)"></span>`)
    expect(style.backgroundColor).toBe(getComputedStyle(surface).backgroundColor)
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(0)
    expect(style.marginTop).toBe("16px")
    expect(style.marginBottom).toBe("0px")
    const header = getComputedStyle(message.querySelector(".header")!)
    expect(header.fontWeight).toBe("700")
    expect(parseFloat(header.fontSize)).toBeCloseTo(1.14285 * parseFloat(style.fontSize), 1)
    // opaque, not Fomantic's 0.85:  faded tinted text fails 4.5:1 (see `--ui-message-text-opacity`)
    expect(getComputedStyle(message.querySelector("p")!).opacity).toBe("1")
    const list = root.querySelector(".ui.message .list li")!
    expect(getComputedStyle(list, "::before").content).toBe('"•"')
  })

  it("lays an icon message out as a row, the icon large beside the content", () => {
    Sheets.adopt([...foundationCSS, messageCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const message = root.querySelector<HTMLElement>(".ui.icon.message")!
    const style = getComputedStyle(message)
    expect(style.display).toBe("flex")
    expect(style.getPropertyValue("--_ui-message-layout").trim()).toBe("icon")
    const icon = message.querySelector<HTMLElement>(":scope > .icon")!
    expect(parseFloat(getComputedStyle(icon).fontSize)).toBeCloseTo(3 * parseFloat(style.fontSize), 0)
    expect(getComputedStyle(icon).opacity).toBe("0.8")
    const content = message.querySelector<HTMLElement>(":scope > .content")!
    expect(content.getBoundingClientRect().left).toBeGreaterThan(icon.getBoundingClientRect().right)
    expect(getComputedStyle(content).flexGrow).toBe("1")
  })

  it("pins the close button top right", () => {
    Sheets.adopt([...foundationCSS, messageCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const close = root.querySelector<HTMLElement>(".ui.message > .close.icon")!
    const message = close.parentElement!.getBoundingClientRect()
    const box = close.getBoundingClientRect()
    expect(getComputedStyle(close).position).toBe("absolute")
    expect(message.right - box.right).toBeLessThan(12)
    expect(box.top - message.top).toBeLessThan(20)
    expect(getComputedStyle(close).opacity).toBe("0.7")
  })

  it("tints colours and states from their roles:  surface, text, header and border", () => {
    Sheets.adopt([...foundationCSS, messageCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    for (const [selector, hue] of [
      [".ui.red.message:not(.inverted)", "red"],
      [".ui.warning.message", "warning"],
      [".ui.positive.message:not(.inverted)", "positive"],
      [".ui.error.message", "error"]
    ] as const) {
      const message = root.querySelector(selector)!
      const style = getComputedStyle(message)
      expect(style.backgroundColor, selector).toBe(roles(hue).backgroundColor)
      expect(style.color, selector).toBe(roles(hue).color)
      const header = message.querySelector(".header")
      if (header) expect(getComputedStyle(header).color).toBe(roles(hue).outlineColor)
    }

    /** `hue`'s roles on a probe:  surface as its background, text as its colour, header as its outline. */
    function roles(hue: string) {
      return getComputedStyle(
        Fixture.render(
          `<span style="background: var(--ui-${hue}-background); color: var(--ui-${hue}-text); outline-color: var(--ui-${hue}-header)"></span>`
        )
      )
    }
  })

  it("floats, compacts, attaches, aligns and inverts", () => {
    Sheets.adopt([...foundationCSS, messageCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!)
    expect(style(".ui.floating.message").boxShadow.split("inset").length).toBeGreaterThan(1)
    expect(style(".ui.floating.message").boxShadow).toMatch(/\d+px \d+px \d+px/)
    expect(style(".ui.compact.message:not(.icon)").display).toBe("inline-block")
    expect(style(".ui.compact.icon.message").display).toBe("inline-flex")
    const top = style(".ui.attached.message:not(.bottom)")
    expect(parseFloat(top.borderTopLeftRadius)).toBeGreaterThan(0)
    expect(top).toMatchObject({ borderBottomLeftRadius: "0px", marginBottom: "-1px", marginLeft: "-1px" })
    const bottom = style(".ui.bottom.attached.message")
    expect(bottom.borderTopLeftRadius).toBe("0px")
    expect(parseFloat(bottom.borderBottomLeftRadius)).toBeGreaterThan(0)
    expect(bottom.marginTop).toBe("-1px")
    expect(style(".ui.centered.message:not(.icon)").textAlign).toBe("center")
    expect(style(".ui.centered.icon.message").justifyContent).toBe("center")
    expect(style(".ui.right.aligned.message").textAlign).toBe("right")
    const inverted = style('.ui.inverted.message[class="ui inverted message"]')
    expect(inverted.colorScheme).toBe("dark")
    expect(inverted.getPropertyValue("--ui-inverted").trim()).toBe("1")
    expect(luminance(inverted.backgroundColor)).toBeLessThan(0.3)
    expect(luminance(inverted.color)).toBeGreaterThan(0.6)
    expect(luminance(style(".ui.red.inverted.message").backgroundColor)).toBeLessThan(0.3)
  })

  it("scales by size;  medium is the default", () => {
    Sheets.adopt([...foundationCSS, messageCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    const ladder = ["mini", "tiny", "small", "large", "big", "huge", "massive"].map((name) =>
      size(`.ui.${name}.message`)
    )
    expect([...ladder].sort((a, b) => a - b)).toEqual(ladder)
    expect(size(".ui.medium.message")).toBe(size(".ui.floating.message"))
  })

  it("hides hidden messages and shows visible ones", () => {
    Sheets.adopt([...foundationCSS, messageCSS])
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    expect(getComputedStyle(root.querySelector(".ui.hidden.message")!).display).toBe("none")
    expect(getComputedStyle(root.querySelector(".ui.visible.message")!).display).toBe("block")
  })
})

////////////////
// ## In shadow roots
////////////////

describe("UIMessage.css in shadow roots", () => {
  it("styles slotted paragraphs and lists, and spaces hosts by their position", () => {
    Sheets.adopt(foundationCSS)
    const frame = Fixture.render(`<div></div>`)
    const [first, second] = [1, 2].map(() => {
      const host = document.createElement("span")
      frame.append(host)
      Sheets.attach(
        host,
        `<div class="ui message" part="message"><div class="content" part="content"><div class="header" part="header">Header</div><slot></slot></div></div>`,
        sheets()
      )
      host.innerHTML = `<p>One</p><p>Two</p><ul><li>Item</li></ul>`
      return host
    })
    expect(getComputedStyle(first!).display).toBe("contents")
    expect(getComputedStyle(Sheets.inner(first!)).marginTop).toBe("0px")
    expect(getComputedStyle(Sheets.inner(second!)).marginTop).not.toBe("0px")
    const [one, two] = second!.querySelectorAll("p")
    expect(getComputedStyle(one!).marginTop).toBe("4px")
    expect(getComputedStyle(two!).marginTop).toBe("12px")
    expect(getComputedStyle(two!).opacity).toBe("1")
    const list = getComputedStyle(second!.querySelector("ul")!)
    expect(list.paddingLeft).toBe("16px")
    expect(list.opacity).toBe("1")
  })

  it("hands slotted parts its header colour, header size and icon layout, but not its fill or scale", () => {
    Sheets.adopt(foundationCSS)
    const host = Fixture.render(`<span></span>`)
    Sheets.attach(
      host,
      `<div class="ui large red icon message"><span class="icon"><slot name="icon"></slot></span><div class="content"><slot></slot></div></div>`,
      sheets()
    )
    const header = document.createElement("span")
    const content = document.createElement("span")
    host.append(header, content)
    Sheets.attach(header, `<div class="header in-message" part="header">Part header</div>`, [
      ...foundationCSS,
      partsCSS
    ])
    Sheets.attach(content, `<div class="content in-message" part="content">Part content</div>`, [
      ...foundationCSS,
      partsCSS
    ])
    const redHeader = Fixture.render(`<span style="color: var(--ui-red-header)"></span>`)
    const inner = getComputedStyle(Sheets.inner(header))
    expect(inner.color).toBe(getComputedStyle(redHeader).color)
    expect(parseFloat(inner.fontSize)).toBeCloseTo(
      1.14285 * parseFloat(getComputedStyle(Sheets.inner(host)).fontSize),
      0
    )
    expect(getComputedStyle(Sheets.inner(content)).flexGrow).toBe("1")
    expect(inner.getPropertyValue("--ui-color").trim()).toBe("")
    expect(inner.getPropertyValue("--ui-scale").trim()).toBe("")
    expect(inner.getPropertyValue("--_ui-message-layout").trim()).toBe("icon")
  })
})

/** The foundation plus `UIMessage.css`, as a `<ui-message>` adopts them. */
function sheets(): string[] {
  return [...foundationCSS, messageCSS]
}

/** Relative luminance (0..1) of a computed `rgb()` / `oklch()` colour, via a canvas round trip. */
function luminance(color: string): number {
  const context = document.createElement("canvas").getContext("2d")!
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return (0.2126 * r! + 0.7152 * g! + 0.0722 * b!) / 255
}

////////////////
// ## Tokens
////////////////

describe("UIMessage.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, messageCSS])
    const root = Fixture.render(`<div style="--ui-message-radius: 20px"><div class="ui message">x</div></div>`)
    expect(getComputedStyle(root.querySelector(".ui.message")!).borderTopLeftRadius).toBe("20px")
  })
})
