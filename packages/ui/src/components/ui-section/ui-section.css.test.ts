import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/fixture"
import { Sheets } from "$/ui/test/sheets"

import { sectionVocabulary } from "./ui-section.vocabulary.en"
import { sectionsVocabulary } from "./ui-sections.vocabulary.en"

import sectionCSS from "./ui-section.css?inline"
import sectionRaw from "./ui-section.css?raw"

/**
 * `ui-section.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * light-DOM examples (the same class grammar the shadow root uses).
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Render example `name` with the foundation and the section sheet adopted. */
function example(name: string): HTMLElement {
  Sheets.adopt([...foundationCSS, sectionCSS])
  return Fixture.render(EXAMPLES[`./examples/${name}.html`]!)
}

/** The section in `root` titled `header`. */
function titled(root: Element, header: string): HTMLElement {
  const match = [...root.querySelectorAll<HTMLElement>(".ui.section")].find(
    (section) => section.querySelector(":scope > .title .header")!.textContent === header
  )
  if (!match) throw new Error(`no section titled "${header}"`)
  return match
}

/** Computed style of `section`'s direct child `.name`. */
function child(section: Element, name: string): CSSStyleDeclaration {
  return getComputedStyle(section.querySelector(`:scope > .${name}`)!)
}

/** Font size in pixels. */
function font(style: CSSStyleDeclaration): number {
  return parseFloat(style.fontSize)
}

describe("ui-section.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(sectionRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(sectionRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(sectionRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("section"))).toBe(true)
  })

  it("parses with replaceSync, keeping the ::slotted content rules and host-position spacing", () => {
    for (const css of [sectionCSS, sectionRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.length).toBeGreaterThan(40)
      expect(selectors.some((selector) => selector.includes("::slotted(:first-child)"))).toBe(true)
      expect(selectors.some((selector) => selector.includes(":host(:not(:first-child)) > .ui.section"))).toBe(true)
    }
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = sectionRaw + colorsCSS
    for (const vocabulary of [sectionVocabulary, sectionsVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
  })
})

describe("ui-section.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every section in %s", (path) => {
    Sheets.adopt([...foundationCSS, sectionCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const sections = root.querySelectorAll<HTMLElement>(".ui.section")
    expect(sections.length).toBeGreaterThan(0)
    for (const section of sections) {
      const style = getComputedStyle(section)
      expect(style.display, section.outerHTML.slice(0, 80)).toBe("block")
      expect(style.boxSizing).toBe("border-box")
      const title = child(section, "title")
      expect(title.display).toBe("flex")
      expect(Number(child(section.querySelector(":scope > .title")!, "heading").fontWeight)).toBeGreaterThanOrEqual(700)
    }
  })

  it("draws a plain section with no box, and sizes each heading level", () => {
    const root = example("types")
    const plain = titled(root, "Getting started")
    const style = getComputedStyle(plain)
    expect(style.borderTopStyle).toBe("none")
    expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(style.paddingTop).toBe("0px")
    const heading = (section: Element) => font(child(section.querySelector(":scope > .title")!, "heading"))
    expect(heading(plain)).toBeCloseTo(16 * 1.71428, 0)
    const h3 = heading(titled(root, "Chapter one"))
    const h4 = heading(titled(root, "Part A"))
    expect(h3).toBeCloseTo(16 * 1.28571, 0)
    expect(h4).toBeLessThan(h3)
  })

  it("rules a dividing title, tints a block title, and boxes a bordered section", () => {
    const root = example("types")
    const dividing = child(titled(root, "Installation"), "title")
    expect(dividing.borderBottomStyle).toBe("solid")
    expect(dividing.borderBottomWidth).toBe("1px")
    const surface = Fixture.render(`<span style="background: var(--ui-surface-strong)"></span>`)
    expect(child(titled(root, "Configuration"), "title").backgroundColor).toBe(
      getComputedStyle(surface).backgroundColor
    )
    const bordered = getComputedStyle(titled(root, "Options"))
    expect(bordered.borderTopStyle).toBe("solid")
    expect(bordered.borderLeftWidth).toBe("1px")
    expect(parseFloat(bordered.borderTopLeftRadius)).toBeGreaterThan(0)
    expect(bordered.paddingLeft).toBe("16px")
    const raised = getComputedStyle(titled(root, "Raised options"))
    expect(raised.boxShadow).not.toBe(bordered.boxShadow)
  })

  it("styles a styled section as a styled accordion:  a tinted, ruled title bar over padded content", () => {
    const root = example("types")
    const styled = titled(root, "Frequently asked")
    expect(getComputedStyle(styled).borderTopStyle).toBe("solid")
    const title = child(styled, "title")
    expect(title.backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    expect(title.borderBottomStyle).toBe("solid")
    expect(title.paddingLeft).toBe("16px")
    expect(child(styled, "content").paddingLeft).toBe("16px")
  })

  it("hides folded content and turns its chevron", () => {
    const root = example("types")
    const open = titled(root, "Open by default")
    const folded = titled(root, "Folded")
    const content = folded.querySelector<HTMLElement>(":scope > .content")!
    expect(content.getAttribute("hidden")).toBe("until-found")
    expect(content.getBoundingClientRect().height).toBe(0)
    expect(open.querySelector<HTMLElement>(":scope > .content")!.getBoundingClientRect().height).toBeGreaterThan(0)
    const chevron = (section: Element) => getComputedStyle(section.querySelector(".fold.icon")!).rotate
    expect(chevron(open)).toBe("0deg")
    expect(chevron(folded)).toBe("-90deg")
  })

  it("lays the title bar out:  icon, header, then the badge pill and the actions at the far end", () => {
    const root = example("content")
    const tasks = titled(root, "Tasks")
    const toggle = tasks.querySelector(".toggle")!
    const [icon, header] = [toggle.querySelector(".icon")!, toggle.querySelector(".header")!]
    expect(header.getBoundingClientRect().left).toBeGreaterThan(icon.getBoundingClientRect().right)
    const badge = child(tasks.querySelector(":scope > .title")!, "badge")
    expect(parseFloat(badge.borderTopLeftRadius)).toBeGreaterThan(8)
    expect(font(badge)).toBeLessThan(font(child(tasks, "title")))
    const drafts = titled(root, "Drafts")
    const bar = drafts.querySelector(":scope > .title")!.getBoundingClientRect()
    const actions = drafts.querySelector(":scope > .title > .actions")!.getBoundingClientRect()
    expect(bar.right - actions.right).toBeLessThan(20)
  })

  it("draws the subhead smaller and muted, outside the title bar", () => {
    const root = example("content")
    const decisions = titled(root, "Decisions")
    const subhead = child(decisions, "subhead")
    expect(font(subhead)).toBeLessThan(16)
    expect(subhead.color).not.toBe(getComputedStyle(decisions).color)
    expect(subhead.position).not.toBe("sticky")
  })

  it("tints the title and its rule from the colour", () => {
    Sheets.adopt([...foundationCSS, sectionCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const teal = Fixture.render(`<span style="color: var(--ui-teal-header); outline-color: var(--ui-teal)"></span>`)
    const title = child(titled(root, "Teal"), "title")
    expect(title.color).toBe(getComputedStyle(teal).color)
    expect(title.borderBottomColor).toBe(getComputedStyle(teal).outlineColor)
  })

  it("scales the content's text by size, never the title's", () => {
    const root = example("variations")
    const plain = example("types")
    const content = (section: Element) => font(child(section, "content"))
    const heading = (section: Element) => font(child(section.querySelector(":scope > .title")!, "heading"))
    const [small, large, base] = [
      titled(root, "Small content"),
      titled(root, "Large content"),
      titled(plain, "Installation")
    ]
    expect(content(small)).toBeLessThan(content(base))
    expect(content(large)).toBeGreaterThan(content(base))
    expect(heading(small)).toBe(heading(base))
    expect(heading(large)).toBe(heading(base))
  })

  it("compacts and pads", () => {
    const root = example("variations")
    const padding = (header: string) => parseFloat(child(titled(root, header), "content").paddingLeft)
    expect(padding("Padded")).toBe(24)
    expect(padding("Very padded")).toBe(48)
    expect(parseFloat(getComputedStyle(titled(root, "Compact")).paddingLeft)).toBeLessThan(16)
  })

  it("joins attached boxes edge to edge", () => {
    const root = example("variations")
    const [top, middle, bottom] = ["Top", "Middle", "Bottom"].map((header) => getComputedStyle(titled(root, header)))
    expect(parseFloat(top!.borderTopLeftRadius)).toBeGreaterThan(0)
    expect(top!.borderBottomLeftRadius).toBe("0px")
    expect(top!.marginBottom).toBe("0px")
    expect(middle!.borderTopWidth).toBe("0px")
    expect(middle!.borderTopLeftRadius).toBe("0px")
    expect(bottom!.borderTopLeftRadius).toBe("0px")
    expect(parseFloat(bottom!.borderBottomLeftRadius)).toBeGreaterThan(0)
  })

  it("caps a scrolling section's content and scrolls it;  inline `height` wins", () => {
    const root = example("variations")
    const log = child(titled(root, "Log"), "content")
    expect(log.overflowY).toBe("auto")
    const box = titled(root, "Log").querySelector<HTMLElement>(":scope > .content")!
    expect(box.scrollHeight).toBeGreaterThan(box.clientHeight)
    const capped = child(titled(root, "Six em high"), "content")
    expect(capped.maxHeight).toBe("96px")
    expect(capped.overflowY).toBe("auto")
  })

  it("aligns the title, not the content", () => {
    const root = example("variations")
    const centered = titled(root, "Centered")
    expect(getComputedStyle(centered.querySelector(".toggle")!).justifyContent).toBe("center")
    expect(child(centered, "content").textAlign).not.toBe("center")
    expect(getComputedStyle(titled(root, "Right").querySelector(".toggle")!).justifyContent).toBe("flex-end")
  })

  it("sticks titles in a scroll box, a nested one below its parent's (inline `--_ui-section-top`)", () => {
    const root = example("variations")
    const chapter = titled(root, "Chapter")
    const frame = chapter.parentElement!
    const outer = chapter.querySelector<HTMLElement>(":scope > .title")!
    const inner = titled(root, "Part one").querySelector<HTMLElement>(":scope > .title")!
    expect(getComputedStyle(outer).position).toBe("sticky")
    expect(getComputedStyle(inner).top).toBe("51px")
    expect(Number(getComputedStyle(outer).zIndex)).toBeGreaterThan(Number(getComputedStyle(inner).zIndex))
    expect(getComputedStyle(outer).backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
    frame.scrollTop = 150
    const top = frame.getBoundingClientRect().top + frame.clientTop
    expect(outer.getBoundingClientRect().top).toBeCloseTo(top, 0)
    expect(inner.getBoundingClientRect().top).toBeCloseTo(top + 51, 0)
  })

  it("inverts to the dark scheme", () => {
    const root = example("variations")
    const inverted = getComputedStyle(titled(root, "Night mode"))
    expect(inverted.colorScheme).toBe("dark")
    expect(inverted.getPropertyValue("--ui-inverted").trim()).toBe("1")
  })

  it("dims a loading section's content under a spinner, and a disabled one entirely", () => {
    const root = example("states")
    const loading = titled(root, "Results").querySelector(":scope > .content")!
    expect(getComputedStyle(loading, "::after").animationName).toBe("ui-section-spin")
    expect(getComputedStyle(loading, "::before").position).toBe("absolute")
    const disabled = getComputedStyle(titled(root, "Archived"))
    expect(Number(disabled.opacity)).toBeLessThan(1)
    expect(disabled.pointerEvents).toBe("none")
    const collapsed = titled(root, "Details").querySelector<HTMLElement>(":scope > .content")!
    // `hidden="until-found"` keeps the box (its contents are skipped):  it draws at no height
    expect(collapsed.getBoundingClientRect().height).toBe(0)
    expect(collapsed.querySelector("p")!.checkVisibility()).toBe(false)
  })
})

describe("ui-section.css groups", () => {
  /** The page rectangle of the section titled `header` in `root`. */
  function rect(root: Element, header: string) {
    return titled(root, header).getBoundingClientRect()
  }

  it("stacks folded sections in a collapsing group with no space between, sub-sections too", () => {
    const root = example("groups")
    expect(rect(root, "Install").top - rect(root, "Overview").bottom).toBeCloseTo(0, 0)
    expect(rect(root, "Defaults").top - rect(root, "Options").bottom).toBeCloseTo(0, 0)
  })

  it("puts an open section flush under the title above, with its usual space below", () => {
    const root = example("groups")
    expect(rect(root, "Configure").top - rect(root, "Install").bottom).toBeCloseTo(0, 0)
    expect(rect(root, "Deploy").top - rect(root, "Configure").bottom).toBeCloseTo(24, 0)
  })

  it("keeps a section that can't fold spaced as usual", () => {
    const root = example("groups")
    expect(rect(root, "Changelog").top - rect(root, "Deploy").bottom).toBeCloseTo(24, 0)
  })

  it("overlaps stacked boxes by their border:  one line between two", () => {
    const root = example("groups")
    const what = rect(root, "What is a dog?")
    expect(what.bottom - rect(root, "What kinds of dogs are there?").top).toBeCloseTo(1, 1)
    expect(what.top).toBeCloseTo(titled(root, "What is a dog?").parentElement!.getBoundingClientRect().top, 1)
  })

  it("leaves a plain group's sections spaced as usual, and spaces the group as one section", () => {
    const root = example("groups")
    expect(rect(root, "Second").top - rect(root, "First").bottom).toBeCloseTo(24, 0)
    const before = titled(root, "First").parentElement!.previousElementSibling!.getBoundingClientRect()
    expect(rect(root, "First").top - before.bottom).toBeGreaterThanOrEqual(24)
  })
})

describe("ui-section.css tokens", () => {
  it("takes a public token set on a wrapper of static markup", () => {
    Sheets.adopt([...foundationCSS, sectionCSS])
    const root = Fixture.render(
      `<div style="--ui-section-radius: 20px"><section class="ui bordered section"><div class="content">x</div></section></div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.section")!).borderTopLeftRadius).toBe("20px")
  })

  it("turns the chevron by the rotate tokens, start and end, negated right to left", () => {
    Sheets.adopt([...foundationCSS, sectionCSS])
    const bar = (expanded: boolean, end: boolean) => {
      const icon = `<span class="fold icon"><svg></svg></span>`
      return (
        `<section class="ui section"><header class="title"><h2 class="heading">` +
        `<button class="toggle" aria-expanded="${expanded}">${end ? "" : icon}<span class="header">H</span></button>` +
        `</h2>${end ? icon : ""}</header><div class="content">x</div></section>`
      )
    }
    const root = Fixture.render(
      `<div style="--ui-section-fold-icon-rotate: 180deg; --ui-section-fold-icon-folded-rotate: 0deg">` +
        bar(true, false) +
        bar(false, false) +
        bar(true, true) +
        bar(false, true) +
        `<div dir="rtl" style="--ui-section-fold-icon-folded-rotate: 45deg">${bar(true, true)}${bar(false, true)}</div>` +
        `</div>`
    )
    const turns = [...root.querySelectorAll(".fold.icon")].map((icon) => getComputedStyle(icon).rotate)
    expect(turns).toEqual(["180deg", "0deg", "180deg", "0deg", "-180deg", "-45deg"])
  })
})
