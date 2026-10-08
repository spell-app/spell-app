import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { adVocabulary } from "./UIAd.en"

import adCSS from "./UIAd.css?inline"
import adRaw from "./UIAd.css?raw"

/**
 * `UIAd.css` on the class-grammar examples:  the source rules, every unit's box, the test placeholder.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

////////////////
// ## Source
////////////////

describe("UIAd.css source", () => {
  it("never uses rem or !important", () => {
    const text = Sheets.withoutComments(adRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text).not.toContain("!important")
  })

  it("declares its sublayer order before any rule, and inlines the mobile breakpoint", () => {
    const text = Sheets.withoutComments(adRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("ad"))).toBe(true)
    expect(adCSS).not.toContain("--ui-mobile")
  })

  it("has a rule for every unit", () => {
    const [unit] = adVocabulary.attributes
    const units: readonly string[] = unit.values
    for (const unit of units) expect(Sheets.covers(adRaw, unit), unit).toBe(true)
    for (const phrase of Sheets.classPhrases(adVocabulary)) expect(Sheets.covers(adRaw, phrase), phrase).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UIAd.css examples", () => {
  it("sizes each unit and labels test ads", () => {
    Sheets.adopt([...foundationCSS, adCSS])
    const root = Fixture.render(EXAMPLES["./examples/types.html"]!)
    const medium = root.querySelector<HTMLElement>('.ui[class*="medium rectangle"].ad')!
    expect(getComputedStyle(medium).width).toBe("300px")
    expect(getComputedStyle(medium).height).toBe("250px")
    expect(getComputedStyle(medium, "::after").content).toBe(`"Medium rectangle"`)
    expect(getComputedStyle(root.querySelector(".ui.leaderboard.ad:not(.mobile)")!).width).toBe("728px")
    expect(getComputedStyle(medium).overflow).toBe("hidden")
  })

  it("centres, and falls back to 'Ad' without data-text", () => {
    Sheets.adopt([...foundationCSS, adCSS])
    const root = Fixture.render(`<div style="width: 800px">${EXAMPLES["./examples/variations.html"]!}</div>`)
    const centered = root.querySelector<HTMLElement>(".ui.centered.ad")!
    expect(getComputedStyle(centered).marginLeft).toBe(getComputedStyle(centered).marginRight)
    expect(parseFloat(getComputedStyle(centered).marginLeft)).toBeGreaterThan(0)
    const bare = root.querySelector(".ui.small.rectangle.test.ad:not([data-text])")!
    expect(getComputedStyle(bare, "::after").content).toBe(`"Ad"`)
  })
})

////////////////
// ## Tokens
////////////////

describe("UIAd.css tokens", () => {
  it("takes a public token from a wrapper or the ad itself (static markup)", () => {
    Sheets.adopt([...foundationCSS, adCSS])
    const root = Fixture.render(
      `<div style="--ui-ad-test-background: rgb(255, 0, 0)"><div class="ui test button ad"></div></div>` +
        `<div><p>A</p><div class="ui button ad" style="--ui-ad-margin: 7px 0">B</div><p>C</p></div>`
    )
    expect(getComputedStyle(root.firstElementChild!).backgroundColor).toBe("rgb(255, 0, 0)")
    expect(getComputedStyle(root.nextElementSibling!.querySelector(".ad")!).marginTop).toBe("7px")
  })
})
