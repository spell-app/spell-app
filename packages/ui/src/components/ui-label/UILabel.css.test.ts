import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { labelVocabulary } from "./UILabel.en"
import { labelsVocabulary } from "./UILabels.en"

import labelCSS from "./UILabel.css?inline"
import labelRaw from "./UILabel.css?raw"

/**
 * `UILabel.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the same class grammar the shadow roots will use), and group looks reaching slotted labels.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

////////////////
// ## Source
////////////////

describe("UILabel.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(labelRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(labelRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(labelRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("label"))).toBe(true)
  })

  it("parses with replaceSync, keeping the ::slotted group rules and the tag style query", () => {
    for (const css of [labelCSS, labelRaw]) {
      const sheet = Sheets.from([css])[0]!
      const selectors = Sheets.rules(sheet).map((rule) => rule.selectorText)
      expect(selectors.length).toBeGreaterThan(60)
      expect(selectors.some((selector) => selector.includes(".ui.labels > ::slotted(*)"))).toBe(true)
      expect(css).toMatch(/@container style\(--_label-tag: ?1\)/)
    }
  })

  it("covers every class word the vocabularies can emit", () => {
    const css = labelRaw + colorsCSS
    for (const vocabulary of [labelVocabulary, labelsVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary))
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
    }
  })
})

////////////////
// ## Examples
////////////////

describe("UILabel.css examples", () => {
  it.each(Object.keys(EXAMPLES))("styles every label in %s", (path) => {
    Sheets.adopt([...foundationCSS, labelCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const labels = root.querySelectorAll<HTMLElement>(".ui.label")
    expect(labels.length).toBeGreaterThan(0)
    for (const label of labels) {
      const style = getComputedStyle(label)
      expect(style.fontWeight, label.outerHTML.slice(0, 80)).toBe("700")
      expect(style.fontFamily).toContain("system-ui")
      expect(style.display).toMatch(/^(inline-)?block$/)
      expect(label.getBoundingClientRect().height).toBeGreaterThan(0)
    }
  })

  it("fills colours from the resolved hue, and outlines basic ones", () => {
    Sheets.adopt([...foundationCSS, labelCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const red = Fixture.render(`<span style="background-color: var(--ui-red); color: var(--ui-surface)"></span>`)
    const filled = getComputedStyle(root.querySelector(".ui.red.label:not(.basic, .circular)")!)
    expect(filled.backgroundColor).toBe(getComputedStyle(red).backgroundColor)
    const basic = getComputedStyle(root.querySelector(".ui.red.basic.label:not(.tag)")!)
    expect(basic).toMatchObject({
      borderTopWidth: "1px",
      borderTopColor: getComputedStyle(red).backgroundColor,
      backgroundColor: getComputedStyle(red).color
    })
  })

  it("scales by size;  medium is the default", () => {
    Sheets.adopt([...foundationCSS, labelCSS])
    const root = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const size = (selector: string) => parseFloat(getComputedStyle(root.querySelector(selector)!).fontSize)
    const ladder = ["mini", "tiny", "small", "large", "big", "huge", "massive"].map((name) => size(`.ui.${name}.label`))
    expect([...ladder].sort((a, b) => a - b)).toEqual(ladder)
    expect(size(".ui.medium.label")).toBe(size('.ui.label[class="ui label"]'))
  })

  it("dims disabled labels and darkens active ones", () => {
    Sheets.adopt([...foundationCSS, labelCSS])
    const root = Fixture.render(EXAMPLES["./examples/states.html"]!)
    for (const label of root.querySelectorAll(".ui.disabled.label"))
      expect(parseFloat(getComputedStyle(label).opacity)).toBeCloseTo(0.45, 2)
    const active = getComputedStyle(root.querySelector(".ui.active.label")!).backgroundColor
    const plain = getComputedStyle(root.querySelector(".ui.label:not(.active, .disabled)")!).backgroundColor
    expect(active).not.toBe(plain)
  })

  it("draws tags, pointing arrows and round badges with pseudo-elements and tokens", () => {
    Sheets.adopt([...foundationCSS, labelCSS])
    const types = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const tag = types.querySelector(".ui.tag.label")!
    expect(getComputedStyle(tag, "::before").content).toBe('""')
    expect(getComputedStyle(tag, "::after").borderTopLeftRadius).toBe("50%")
    expect(getComputedStyle(tag).position).toBe("relative")
    const pointing = types.querySelector(".ui.left.pointing.label, .ui[class*='left pointing'].label")!
    expect(getComputedStyle(pointing, "::before").content).toBe('""')
    expect(getComputedStyle(pointing, "::before").top).not.toBe("0px")
    const variations = Fixture.render(EXAMPLES["./examples/variations.html"]!)
    const badge = variations.querySelector<HTMLElement>(".ui.circular.label:not(.empty)")!.getBoundingClientRect()
    expect(badge.width).toBeCloseTo(badge.height, 0)
    const dot = variations.querySelector<HTMLElement>(".ui.empty.circular.label")!.getBoundingClientRect()
    expect(dot.width).toBeLessThan(10)
  })

  it("pins corner and attached labels to their owner's edges", () => {
    Sheets.adopt([...foundationCSS, labelCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const corner = root.querySelector<HTMLElement>(".ui.red.corner.label")!
    const owner = corner.parentElement!.getBoundingClientRect()
    const box = corner.getBoundingClientRect()
    expect(Math.abs(box.top - owner.top)).toBeLessThan(1)
    expect(Math.abs(box.right - owner.right)).toBeLessThan(1)
    const attached = root.querySelector<HTMLElement>(".ui.top.attached.label")!
    const edge = attached.parentElement!.getBoundingClientRect()
    expect(Math.abs(attached.getBoundingClientRect().width - edge.width)).toBeLessThan(1)
    expect(Math.abs(attached.getBoundingClientRect().top - edge.top)).toBeLessThan(1)
  })

  it("pins bottom CORNER attached labels to the bottom edge (I91)", () => {
    Sheets.adopt([...foundationCSS, labelCSS])
    const root = Fixture.render(
      `<div><div class="owner" style="position: relative; height: 200px">` +
        `<div class="ui bottom left attached label">L</div><div class="ui bottom right attached label">R</div></div></div>`
    )
    const owner = root.querySelector(".owner")!.getBoundingClientRect()
    for (const label of root.querySelectorAll<HTMLElement>(".ui.label")) {
      expect(Math.abs(label.getBoundingClientRect().bottom - owner.bottom)).toBeLessThan(1)
    }
  })

  it("takes a public token from a wrapper (static markup)", () => {
    Sheets.adopt([...foundationCSS, labelCSS])
    const root = Fixture.render(`<div style="--ui-label-radius: 12px"><div class="ui label">A</div></div>`)
    expect(getComputedStyle(root.querySelector(".ui.label")!).borderTopLeftRadius).toBe("12px")
  })

  it("hands a group's look to its labels", () => {
    Sheets.adopt([...foundationCSS, labelCSS])
    const root = Fixture.render(EXAMPLES["./examples/groups.html"]!)
    const basic = getComputedStyle(root.querySelector(".ui.basic.labels > .label")!)
    expect(basic.borderTopWidth).toBe("1px")
    const tagged = root.querySelector(".ui.tag.labels > .label")!
    expect(getComputedStyle(tagged, "::before").content).toBe('""')
    const huge = parseFloat(getComputedStyle(root.querySelector(".ui.huge.labels > .label")!).fontSize)
    const plain = parseFloat(getComputedStyle(root.querySelector(".ui.basic.labels > .label")!).fontSize)
    expect(huge).toBeGreaterThan(plain)
  })
})

////////////////
// ## In shadow roots
////////////////

describe("UILabel.css in shadow roots", () => {
  it("keeps the host out of layout and styles the inner root", () => {
    Sheets.adopt(foundationCSS)
    const host = Sheets.host(`<span class="ui teal label" part="label">New</span>`, [...foundationCSS, labelCSS])
    const teal = Fixture.render(`<span style="background-color: var(--ui-teal)"></span>`)
    expect(getComputedStyle(host).display).toBe("contents")
    expect(getComputedStyle(Sheets.inner(host)).backgroundColor).toBe(getComputedStyle(teal).backgroundColor)
  })

  it("styles a `<ui-detail href>`'s own link, and one slotted inside it, from their own shadow root", () => {
    Sheets.adopt(foundationCSS)
    // Stands in for `<ui-detail href>`:  its OWN shadow renders `<a class="detail">`,
    // with no `.ui.label` ancestor in that tree -- the label sheet's link rule must key on `.detail` standalone to
    // reach it.
    const link = Sheets.host(`<a class="detail" part="detail" href="#view">View Mail</a>`, [...foundationCSS, labelCSS])
    expect(getComputedStyle(Sheets.inner(link)).cursor).toBe("pointer")

    // Stands in for `<ui-detail>` with a plain `<a>` projected into its own default slot.
    const projected = Sheets.host(`<span class="detail" part="detail"><slot></slot></span>`, [
      ...foundationCSS,
      labelCSS
    ])
    const anchor = document.createElement("a")
    anchor.textContent = "View Mail"
    projected.append(anchor)
    expect(getComputedStyle(anchor).cursor).toBe("pointer")
  })

  it("hands a group's basic and tag looks to slotted labels", () => {
    Sheets.adopt(foundationCSS)
    const group = Sheets.host(`<div class="ui basic tag labels" part="group"><slot></slot></div>`, [
      ...foundationCSS,
      labelCSS
    ])
    const child = document.createElement("span")
    Sheets.attach(child, `<span class="ui label">$10</span>`, [...foundationCSS, labelCSS])
    group.append(child)
    const inner = Sheets.inner(child)
    expect(getComputedStyle(inner).borderTopWidth).toBe("1px")
    expect(getComputedStyle(inner, "::before").content).toBe('""')
    expect(parseFloat(getComputedStyle(inner).marginRight)).toBeGreaterThan(0)
  })
})
