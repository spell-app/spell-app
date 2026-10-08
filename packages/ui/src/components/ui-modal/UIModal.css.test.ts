import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { page } from "vite-plus/test/browser"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { modalVocabulary } from "./UIModal.en"

import buttonCSS from "$/ui/components/ui-button/UIButton.css?inline"
import modalCSS from "./UIModal.css?inline"
import modalRaw from "./UIModal.css?raw"

/**
 * `UIModal.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the class grammar the shadow `<dialog>` uses),
 * and a `<dialog>` in a stand-in shadow host for what only the element's dialog does
 * (top layer, `::backdrop`, transitions).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Adopt the modal sheets (and buttons) and render example `name` at `width` px. */
async function example(name: string, width = 1000): Promise<HTMLElement> {
  await resize(width)
  Sheets.adopt([...foundationCSS, buttonCSS, modalCSS])
  return Fixture.render(EXAMPLES[`./examples/${name}.html`]!)
}

/** The static modal in `root` whose header reads `text`. */
function modalNamed(root: Element, text: string): HTMLElement {
  const found = [...root.querySelectorAll<HTMLElement>(".ui.modal")].find(
    (each) => each.querySelector(".header")?.textContent?.trim() === text
  )
  if (!found) throw new Error(`no modal "${text}"`)
  return found
}

////////////////
// ## Source
////////////////

describe("UIModal.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(modalRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(modalRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(modalRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("modal"))).toBe(true)
  })

  it("parses with replaceSync, keeping the dialog, backdrop and starting-style rules", () => {
    for (const css of [modalCSS, modalRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(40)
      expect(selectors).toContain("dialog.ui.modal::backdrop")
      expect(selectors).toContain("dialog.ui.modal:not([open])")
    }
    expect(modalCSS).toContain("@starting-style")
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = modalRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(modalVocabulary))
      expect(Sheets.covers(css, phrase), `${modalVocabulary.tag}: ${phrase}`).toBe(true)
  })

  it("declares the owner tokens the parts read, on every root", () => {
    expect(modalVocabulary.ownsParts).toEqual(["header", "content", "description", "actions"])
    const text = Sheets.withoutComments(modalRaw)
    for (const token of [
      "--_ui-modal-basic: 0;",
      "--_ui-modal-header-size: var(--ui-modal-header-size, 1.42857em);",
      "--ui-inverted: 0;"
    ]) {
      expect(text).toMatch(new RegExp(`\\.ui\\.modal \\{[^}]*${token.replace(/[.()]/g, "\\$&")}`))
    }
  })
})

////////////////
// ## Examples
////////////////

describe("UIModal.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every modal in %s", async (path) => {
    await resize(1000)
    Sheets.adopt([...foundationCSS, modalCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    for (const modal of root.querySelectorAll<HTMLElement>(".ui.modal")) {
      const style = getComputedStyle(modal)
      expect(style.display, modal.outerHTML.slice(0, 80)).toBe("block")
      expect(style.boxSizing).toBe("border-box")
      expect(style.fontSize).toBe("16px")
    }
  })

  it("draws the standard modal:  surface, shadow, radius;  a bordered header, padded content, muted actions", async () => {
    const root = await example("types")
    const modal = modalNamed(root, "Profile Picture")
    const style = getComputedStyle(modal)
    const probe = getComputedStyle(
      Fixture.render(`<span style="background: var(--ui-surface); color: var(--ui-surface-muted)"></span>`)
    )
    expect(style.backgroundColor).toBe(probe.backgroundColor)
    expect(style.boxShadow).not.toBe("none")
    expect(parseFloat(style.borderTopLeftRadius)).toBeGreaterThan(0)
    expect(style.width).toBe("850px")
    const header = getComputedStyle(modal.querySelector(".header")!)
    expect(header.borderBottomStyle).toBe("solid")
    expect(parseFloat(header.fontSize)).toBeCloseTo(16 * 1.42857, 0)
    expect(header.fontWeight).toBe("700")
    expect(getComputedStyle(modal.querySelector(".content")!).paddingTop).toBe("24px")
    const actions = getComputedStyle(modal.querySelector(".actions")!)
    expect(actions.backgroundColor).toBe(probe.color)
    expect(actions.textAlign).toBe("right")
  })

  it("sizes are widths (Fomantic's ratios), never text sizes;  header sizes follow", async () => {
    const root = await example("variations", 1150)
    for (const [name, width, header] of [
      ["Mini", 340, 1.3],
      ["Tiny", 510, 1.3],
      ["Small", 680, 1.3],
      ["Large", 1020, 1.6]
    ] as const) {
      const modal = modalNamed(root, name)
      expect(parseFloat(getComputedStyle(modal).width), name).toBeCloseTo(width, 0)
      expect(getComputedStyle(modal).fontSize, name).toBe("16px")
      expect(parseFloat(getComputedStyle(modal.querySelector(".header")!).fontSize), name).toBeCloseTo(16 * header, 0)
    }
  })

  it("responsive widths:  95% on mobile, 88% (times a small ratio) on tablets", async () => {
    const root = await example("variations", 600)
    const parent = modalNamed(root, "Mini").parentElement!.clientWidth
    expect(parseFloat(getComputedStyle(modalNamed(root, "Mini")).width)).toBeCloseTo(parent * 0.95, 0)
    await page.viewport(800, 800)
    const tablet = modalNamed(root, "Small").parentElement!.clientWidth
    expect(parseFloat(getComputedStyle(modalNamed(root, "Small")).width)).toBeCloseTo(tablet * 0.88 * 0.8, 0)
    expect(parseFloat(getComputedStyle(modalNamed(root, "Large")).width)).toBeCloseTo(tablet * 0.88, 0)
  })

  it("fullscreen:  95% wide;  overlay fullscreen:  100%, square corners", async () => {
    const root = await example("variations")
    const full = modalNamed(root, "Full screen")
    expect(parseFloat(getComputedStyle(full).width)).toBeCloseTo(full.parentElement!.clientWidth * 0.95, 0)
    const overlay = getComputedStyle(modalNamed(root, "Overlay full screen"))
    expect(parseFloat(overlay.width)).toBeCloseTo(modalNamed(root, "Overlay full screen").parentElement!.clientWidth, 0)
    expect(overlay.borderTopLeftRadius).toBe("0px")
  })

  it("basic:  no box, light text, no rules;  inverted:  the dark scheme", async () => {
    const root = await example("types")
    const basic = modalNamed(root, "Archive Old Messages")
    const style = getComputedStyle(basic)
    expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(style.boxShadow).toBe("none")
    expect(style.getPropertyValue("--_ui-modal-basic").trim()).toBe("1")
    expect(getComputedStyle(basic.querySelector(".header")!).borderBottomStyle).toBe("none")
    const inverted = modalNamed(await example("variations"), "Inverted")
    expect(getComputedStyle(inverted).colorScheme).toBe("dark")
    expect(getComputedStyle(inverted).getPropertyValue("--ui-inverted").trim()).toBe("1")
  })

  it("scrolling content caps its height and scrolls;  the inside close icon sits top right", async () => {
    const root = await example("content")
    const scrolling = root.querySelector<HTMLElement>(".scrolling.content")!
    expect(getComputedStyle(scrolling).overflowY).toBe("auto")
    expect(scrolling.scrollHeight).toBeGreaterThan(scrolling.clientHeight)
    const close = root.querySelector<HTMLElement>(".close.inside")!
    const box = close.parentElement!.getBoundingClientRect()
    expect(getComputedStyle(close).position).toBe("absolute")
    expect(box.right - close.getBoundingClientRect().right).toBeCloseTo(16, 0)
    expect(close.getBoundingClientRect().top).toBeGreaterThan(box.top)
  })

  it("static close icon sits OUTSIDE the box on computers", async () => {
    await resize(1000)
    Sheets.adopt([...foundationCSS, modalCSS])
    const root = Fixture.render(
      `<div style="padding: 60px"><div class="ui active modal" style="position: relative">` +
        `<button type="button" class="close icon" aria-label="Close">x</button><div class="header">H</div></div></div>`
    )
    const close = root.querySelector<HTMLElement>(".close")!
    expect(close.getBoundingClientRect().bottom).toBeLessThan(close.parentElement!.getBoundingClientRect().top)
  })
})

////////////////
// ## On a <dialog>
////////////////

describe("UIModal.css on a <dialog>", () => {
  /** A `<dialog class="ui modal">` in a stand-in shadow host with the modal sheet, shown with `showModal()`. */
  async function dialog(classes = "ui modal") {
    await resize(1000)
    Sheets.adopt(foundationCSS)
    const host = Sheets.host(
      `<dialog class="${classes}"><div class="header">Title</div><div class="content">Body</div></dialog>`,
      [...foundationCSS, modalCSS]
    )
    const element = host.shadowRoot!.querySelector("dialog")!
    element.showModal()
    onTestFinished(() => element.close())
    await Promise.allSettled(element.getAnimations().map((animation) => animation.finished))
    return element
  }

  it("is centred in the top layer, over a dimmed ::backdrop, fading and scaling in", async () => {
    const element = await dialog()
    const box = element.getBoundingClientRect()
    expect(Math.abs(box.left + box.width / 2 - window.innerWidth / 2)).toBeLessThan(1)
    expect(Math.abs(box.top + box.height / 2 - window.innerHeight / 2)).toBeLessThan(1)
    expect(getComputedStyle(element, "::backdrop").backgroundColor).toBe("oklch(0 0 0 / 0.85)")
    expect(getComputedStyle(element).transitionProperty).toContain("overlay")
    expect(getComputedStyle(element).opacity).toBe("1")
  })

  it("scrolls inside itself when taller than the viewport, and its close icon sits inside", async () => {
    const element = await dialog()
    element.querySelector(".content")!.setAttribute("style", "height: 3000px")
    expect(element.getBoundingClientRect().height).toBeLessThanOrEqual(window.innerHeight)
    expect(getComputedStyle(element).overflowY).toBe("auto")
    element.insertAdjacentHTML("beforeend", `<button type="button" class="close icon" aria-label="Close">x</button>`)
    const close = element.querySelector<HTMLElement>(".close")!
    expect(close.getBoundingClientRect().top).toBeGreaterThan(element.getBoundingClientRect().top)
  })

  it("top aligned:  near the top of the viewport", async () => {
    const element = await dialog("ui top aligned modal")
    expect(element.getBoundingClientRect().top).toBeCloseTo(window.innerHeight * 0.05, 0)
  })

  it("overlay fullscreen:  the whole viewport", async () => {
    const element = await dialog("ui overlay fullscreen modal")
    const box = element.getBoundingClientRect()
    expect([box.left, box.top, box.width, box.height]).toEqual([0, 0, window.innerWidth, window.innerHeight])
  })
})

/** Set the viewport to `width` for this test (Fomantic's breakpoints are the viewport's). */
async function resize(width: number) {
  const [previousWidth, previousHeight] = [window.innerWidth, window.innerHeight]
  await page.viewport(width, 800)
  onTestFinished(() => page.viewport(previousWidth, previousHeight))
}

////////////////
// ## Tokens
////////////////

describe("UIModal.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, modalCSS])
    const root = Fixture.render(
      `<div style="--ui-modal-radius: 20px"><div class="ui active modal"><div class="content">x</div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.modal")!).borderTopLeftRadius).toBe("20px")
  })
})
