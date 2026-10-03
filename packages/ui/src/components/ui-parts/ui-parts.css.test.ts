import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { PART_NOUNS, PART_VOCABULARIES } from "./ui-parts.types"

import iconCSS from "$/ui/components/ui-icon/ui-icon.css?inline"
import partsCSS from "./ui-parts.css?inline"
import partsRaw from "./ui-parts.css?raw"

/**
 * `ui-parts.css` on its own, before any part element exists:  the sheet's source rules, the standalone header, and
 * every part in every owner context -- statically (the `in-<owner>` class) and in shadow roots (the
 * `:state(in-<owner>)` a `ContentPart` sets), including owner tokens read through style queries.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

describe("ui-parts.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(partsRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(partsRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(partsRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("parts"))).toBe(true)
  })

  it("pairs every owner-context rule:  the host state and the static class", () => {
    for (const css of [partsCSS, partsRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(150)
      for (const owner of ["card", "item", "feed", "comment", "modal", "message", "list", "statistic", "step"]) {
        expect(
          selectors.some((selector) => selector.includes(`:host(:state(in-${owner}))`)),
          owner
        ).toBe(true)
        expect(
          selectors.some((selector) => selector.includes(`.in-${owner}.`)),
          owner
        ).toBe(true)
      }
      expect(css).toMatch(/@container style\(--_ui-card-layout: ?horizontal\)/)
    }
  })

  it("lists one vocabulary per part noun, and covers the header's class words", () => {
    expect(PART_VOCABULARIES.map((vocabulary) => vocabulary.noun)).toEqual([...PART_NOUNS])
    const css = partsRaw + colorsCSS
    for (const vocabulary of PART_VOCABULARIES) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
  })
})

describe("ui-parts.css examples", () => {
  it.each(Object.keys(EXAMPLES))("names and styles every owned part in %s", (path) => {
    Sheets.adopt([...foundationCSS, iconCSS, partsCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const owned = root.querySelectorAll<HTMLElement>("[class*='in-']")
    expect(owned.length).toBeGreaterThan(0)
    for (const part of owned) {
      const noun = [...part.classList].find((word) => (PART_NOUNS as readonly string[]).includes(word))
      if (!noun) continue
      expect(getComputedStyle(part).getPropertyValue("--_ui-part").trim(), part.outerHTML.slice(0, 60)).toBe(noun)
    }
  })

  it("sizes page headers by level and content headers by size;  medium is the default", () => {
    Sheets.adopt([...foundationCSS, iconCSS, partsCSS])
    const root = Fixture.render(EXAMPLES["./examples/header.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    const base = parseFloat(getComputedStyle(root).fontSize)
    const levels = ["h1", "h2", "h3", "h4", "h5", "h6"].map((tag) => size(`${tag}.ui.header:not([class*='massive'])`))
    expect([...levels].sort((a, b) => b - a)).toEqual(levels)
    expect(levels[0]).toBeCloseTo(base * 2, 1)
    const ladder = ["mini", "tiny", "small", "large", "huge"].map((name) => size(`div.ui.${name}.header`))
    expect([...ladder].sort((a, b) => a - b)).toEqual(ladder)
    expect(size("div.ui.medium.header")).toBe(size('div.ui.header[class="ui header"]'))
    expect(size("div.ui.medium.header")).toBeCloseTo(base * 1.28571, 1)
    expect(size("h2.ui.massive.header")).toBeCloseTo(base * 2.28571, 1)
  })

  it("draws header variations", () => {
    Sheets.adopt([...foundationCSS, iconCSS, partsCSS])
    const root = Fixture.render(EXAMPLES["./examples/header.html"]!)
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!)
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    const pair = Fixture.render(`<div><h2 class="ui header">A</h2><h2 class="ui header">B</h2></div>`)
    const [a, b] = [...pair.children].map((header) => getComputedStyle(header))
    expect(parseFloat(a!.marginTop)).toBeLessThanOrEqual(0)
    expect(parseFloat(b!.marginTop)).toBeGreaterThan(0)
    expect(b!.marginBottom).toBe("0px")
    expect(style(".ui.dividing.header:not(.red)").borderBottomStyle).toBe("solid")
    expect(style(".ui.red.dividing.header").borderBottomColor).toBe(getComputedStyle(red).color)
    expect(style(".ui.red.dividing.header").boxShadow).toContain("inset")
    expect(style(".ui.block.header").backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    expect(parseFloat(style(".ui.top.attached.header").borderTopLeftRadius)).toBeGreaterThan(0)
    expect(style(".ui.top.attached.header").borderBottomLeftRadius).toBe("0px")
    expect(style(".ui.bottom.attached.header").borderTopStyle).toBe("none")
    expect(style(".ui.right.floated.header").float).toBe("right")
    expect(style(".ui.center.aligned.header:not(.icon)").textAlign).toBe("center")
    expect(style(".ui.justified.header").textAlign).toBe("justify")
    expect(parseFloat(style(".ui.disabled.header").opacity)).toBeCloseTo(0.45, 2)
    expect(style(".ui.inverted.header").colorScheme).toBe("dark")
    expect(style(".ui.inverted.header").getPropertyValue("--ui-inverted").trim()).toBe("1")
  })

  it("hands icons their header size, and styles content and sub headers inside a header", () => {
    Sheets.adopt([...foundationCSS, iconCSS, partsCSS])
    const root = Fixture.render(EXAMPLES["./examples/header.html"]!)
    const iconHeader = root.querySelector<HTMLElement>(".ui.icon.header:has(.content)")!
    const icon = iconHeader.querySelector<HTMLElement>(".ui.icon")!
    expect(parseFloat(getComputedStyle(icon).fontSize)).toBeCloseTo(
      3 * parseFloat(getComputedStyle(iconHeader).fontSize),
      0
    )
    expect(getComputedStyle(icon).display).toBe("flex")
    expect(getComputedStyle(iconHeader.querySelector(".content")!).display).toBe("block")
    const plain = root.querySelector<HTMLElement>(".ui.header:not(.icon):has(.plug, svg) .ui.icon")!
    expect(parseFloat(getComputedStyle(plain).fontSize)).toBeCloseTo(
      1.5 * parseFloat(getComputedStyle(plain.parentElement!).fontSize),
      0
    )
    const sub = getComputedStyle(root.querySelector(".ui.header:not(.icon) > .sub.header")!)
    expect(sub.fontWeight).toBe("400")
    expect(sub.display).toBe("block")
  })

  it("styles owned headers by owner, never as a ui header", () => {
    Sheets.adopt([...foundationCSS, iconCSS, partsCSS])
    const root = Fixture.render(EXAMPLES["./examples/header.html"]!)
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!)
    const card = style(".in-card.header")
    expect(card.fontWeight).toBe("700")
    expect(parseFloat(card.fontSize)).toBeCloseTo(1.28571 * parseFloat(style(".in-card.content").fontSize), 0)
    expect(style(".in-modal.header").borderBottomStyle).toBe("solid")
    expect(parseFloat(style(".in-message.header").fontSize)).toBeGreaterThan(parseFloat(style(".ui.message").fontSize))
    const red = Fixture.render(`<span style="color: var(--ui-red-header)"></span>`)
    expect(style(".ui.red.message .in-message.header").color).toBe(getComputedStyle(red).color)
    const link = Fixture.render(`<span style="color: var(--ui-link)"></span>`)
    expect(style("a.in-list.header").color).toBe(getComputedStyle(link).color)
  })

  it("lays card parts out, and follows the horizontal card's owner token", () => {
    Sheets.adopt([...foundationCSS, partsCSS])
    const root = Fixture.render(EXAMPLES["./examples/content.html"]!)
    const [first, second] = root.querySelectorAll<HTMLElement>(".ui.card:not(.horizontal) > .in-card.content")
    expect(getComputedStyle(first!).borderTopStyle).toBe("none")
    expect(getComputedStyle(second!).borderTopStyle).toBe("solid")
    expect(getComputedStyle(second!).paddingTop).toBe(getComputedStyle(second!).fontSize)
    const horizontal = root.querySelectorAll<HTMLElement>(".ui.horizontal.card > .in-card.content")[1]!
    expect(getComputedStyle(horizontal).borderTopStyle).toBe("none")
    const description = Fixture.render(EXAMPLES["./examples/description.html"]!)
    const after = getComputedStyle(description.querySelector(".in-card.description")!)
    expect(parseFloat(after.marginTop)).toBeCloseTo(0.5 * parseFloat(after.fontSize), 1)
  })

  it("inlines a date inside a feed summary through the --_ui-part token", () => {
    Sheets.adopt([...foundationCSS, partsCSS])
    const root = Fixture.render(EXAMPLES["./examples/date.html"]!)
    const [alone, inline] = root.querySelectorAll<HTMLElement>(".in-feed.date")
    expect(getComputedStyle(inline!).display).toBe("inline-block")
    expect(getComputedStyle(alone!).display).not.toBe("inline-block")
    expect(parseFloat(getComputedStyle(inline!).fontSize)).toBeLessThan(parseFloat(getComputedStyle(alone!).fontSize))
  })

  it("sizes and colours statistic values, and lines up horizontal ones", () => {
    Sheets.adopt([...foundationCSS, partsCSS])
    const root = Fixture.render(EXAMPLES["./examples/value.html"]!)
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!)
    const base = parseFloat(getComputedStyle(root).fontSize)
    expect(parseFloat(style(".ui.statistic:not(.horizontal, .red) > .value:not(.text)").fontSize)).toBeCloseTo(
      4 * base,
      1
    )
    expect(parseFloat(style(".in-statistic.text.value").fontSize)).toBeCloseTo(2 * base, 1)
    expect(style(".ui.horizontal.statistic > .value").display).toBe("inline-block")
    expect(style(".ui.horizontal.statistic > .label").display).toBe("inline-block")
    expect(style(".in-statistic.label").textTransform).toBe("uppercase")
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    expect(style(".ui.red.statistic > .value").color).toBe(getComputedStyle(red).color)
    expect(style(".in-search.value").float).toBe("right")
  })

  it("follows step, accordion and label owner tokens", () => {
    Sheets.adopt([...foundationCSS, partsCSS])
    const titles = Fixture.render(EXAMPLES["./examples/title.html"]!)
    const link = Fixture.render(`<span style="color: var(--ui-link)"></span>`)
    expect(getComputedStyle(titles.querySelector(".active.step .in-step.title")!).color).toBe(
      getComputedStyle(link).color
    )
    const [first, second] = titles.querySelectorAll(".ui.styled.accordion > .title")
    expect(getComputedStyle(first!).borderTopStyle).toBe("none")
    expect(getComputedStyle(second!).borderTopStyle).toBe("solid")
    const details = Fixture.render(EXAMPLES["./examples/detail.html"]!)
    const [plain, tab] = details.querySelectorAll(".in-label.detail")
    expect(getComputedStyle(plain!).backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(tab!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
  })

  it("styles comment, modal and toast parts", () => {
    Sheets.adopt([...foundationCSS, partsCSS])
    const root = Fixture.render(EXAMPLES["./examples/actions.html"]!)
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!)
    expect(style(".in-modal.actions").textAlign).toBe("right")
    expect(style(".in-modal.actions").borderTopStyle).toBe("solid")
    expect(parseFloat(style(".in-comment.actions").fontSize)).toBeLessThan(parseFloat(style(".ui.comments").fontSize))
    expect(style(".in-comment.actions > a").display).toBe("inline-block")
    const avatars = Fixture.render(EXAMPLES["./examples/avatar.html"]!)
    expect(getComputedStyle(avatars.querySelector(".in-comment.avatar")!).float).toBe("left")
    expect(getComputedStyle(avatars.querySelector(".in-card.avatar")!).borderTopLeftRadius).toBe("50%")
  })
})

describe("ui-parts.css in shadow roots", () => {
  it("styles a part by its host's in-<owner> state, and reads the owner's tokens", () => {
    Sheets.adopt(foundationCSS)
    definePart()
    const card = Fixture.render(`<div class="ui card" style="--_ui-card-layout: vertical"></div>`)
    card.innerHTML = `<test-part noun="content" owner="card"></test-part><test-part noun="content" owner="card"></test-part>`
    const [first, second] = [...card.querySelectorAll("test-part")].map((host) => Sheets.inner(host))
    expect(getComputedStyle(card.querySelector("test-part")!).display).toBe("contents")
    expect(getComputedStyle(first!).borderTopStyle).toBe("none")
    expect(getComputedStyle(second!).borderTopStyle).toBe("solid")
    card.style.setProperty("--_ui-card-layout", "horizontal")
    expect(getComputedStyle(second!).borderTopStyle).toBe("none")
  })

  it("renders an unowned header as a standalone ui header", () => {
    Sheets.adopt(foundationCSS)
    const host = Sheets.host(`<h2 class="ui header" part="header"><slot></slot></h2>`, [...foundationCSS, partsCSS])
    host.textContent = "Title"
    const inner = getComputedStyle(Sheets.inner(host))
    expect(inner.fontWeight).toBe("700")
    expect(parseFloat(inner.fontSize)).toBeCloseTo(1.71428 * 16, 0)
  })
})

/**
 * Define `<test-part noun owner>`:  a stand-in `ContentPart` rendering `<div class="<noun>">` with
 * `:state(in-<owner>)` and `ui-parts.css`.
 * - Idempotent:  custom elements can only be defined once per page.
 */
function definePart() {
  if (customElements.get("test-part")) return
  customElements.define(
    "test-part",
    class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return
        this.attachInternals().states.add(`in-${this.getAttribute("owner")}`)
        const noun = this.getAttribute("noun")!
        Sheets.attach(this, `<div class="${noun}" part="${noun}"><slot></slot></div>`, [...foundationCSS, partsCSS])
      }
    }
  )
}
