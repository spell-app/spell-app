import { describe, expect, it, onTestFinished } from "vite-plus/test"
import { page } from "vite-plus/test/browser"

import { foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { tabsVocabulary } from "./ui-tabs.vocabulary.en"
import { tabVocabulary } from "./ui-tab.vocabulary.en"

import menuCSS from "$/ui/components/ui-menu/ui-menu.css?inline"
import segmentCSS from "$/ui/components/ui-segment/ui-segment.css?inline"
import tabCSS from "./ui-tab.css?inline"
import tabRaw from "./ui-tab.css?raw"

/**
 * `ui-tab.css` on its own, before any element exists:  the sheet's source rules and the computed styles of the
 * class-grammar examples (Fomantic's menu of tabs over `.ui.tab.segment` panes), with the sheets the elements adopt:
 * `ui-menu.css` and `ui-segment.css` before `ui-tab.css`.
 * - Sheets are adopted into the document per test and removed again.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed, each documented where it's used:  none. */
const ALLOWED_IMPORTANT = 0

/** Render example `name` with the tab sheets, on a desktop-wide viewport. */
async function example(name: string): Promise<HTMLElement> {
  await resize(1000)
  Sheets.adopt([...foundationCSS, segmentCSS, menuCSS, tabCSS])
  return Fixture.render(EXAMPLES[`./examples/${name}.html`]!)
}

////////////////
// ## Source
////////////////

describe("ui-tab.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(tabRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(tabRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(tabRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("tab"))).toBe(true)
  })

  it("parses with replaceSync, keeping the pane host rules and Fomantic's static ones", () => {
    for (const css of [tabCSS, tabRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors.some((selector) => selector.includes(":host(:state(pane):not(:state(selected)))"))).toBe(true)
      expect(selectors.some((selector) => selector.includes(".ui.tab.active"))).toBe(true)
      expect(selectors.some((selector) => selector.includes(".ui.tab.loading::after"))).toBe(true)
    }
  })

  it("covers every class word the vocabularies can emit (the menu's words in `ui-menu.css`)", () => {
    const css = tabRaw + menuCSS + segmentCSS
    for (const vocabulary of [tabsVocabulary, tabVocabulary]) {
      for (const phrase of Sheets.classPhrases(vocabulary)) {
        expect(Sheets.covers(css, phrase), `${vocabulary.tag}: ${phrase}`).toBe(true)
      }
    }
  })
})

////////////////
// ## Examples
////////////////

describe("ui-tab.css examples", () => {
  it.each(Object.keys(EXAMPLES))("shows only the active pane in %s, and draws the tabs as menu items", (path) => {
    Sheets.adopt([...foundationCSS, segmentCSS, menuCSS, tabCSS])
    const root = Fixture.render(EXAMPLES[path]!)
    const panes = [...root.querySelectorAll<HTMLElement>(".ui.tab")]
    expect(panes.length).toBeGreaterThan(0)
    for (const pane of panes) {
      const visible = pane.classList.contains("active") || pane.classList.contains("loading")
      expect(getComputedStyle(pane).display, pane.outerHTML.slice(0, 80)).toBe(visible ? "block" : "none")
    }
    for (const tab of root.querySelectorAll<HTMLElement>(".ui.menu > button.item")) {
      expect(getComputedStyle(tab).appearance).toBe("none")
      expect(getComputedStyle(tab).position).toBe("relative")
    }
  })

  it("joins a top attached tabular menu and its bottom attached pane", async () => {
    const root = await example("types")
    const menu = root.querySelector<HTMLElement>(".ui.tabular.menu")!
    const pane = root.querySelector<HTMLElement>(".ui.bottom.attached.active.tab")!
    expect(Math.round(pane.getBoundingClientRect().top)).toBe(Math.round(menu.getBoundingClientRect().bottom))
    const active = getComputedStyle(menu.querySelector(".active.item")!)
    expect(active.marginBottom).toBe("-1px")
    expect(active.borderTopWidth).toBe("1px")
  })

  it("resets a <button> tab to the menu's item font, never the button's", async () => {
    const root = await example("types")
    const tab = root.querySelector<HTMLElement>(".ui.pointing.secondary.menu > .item:not(.active)")!
    const menu = tab.parentElement!
    expect(getComputedStyle(tab).fontFamily).toBe(getComputedStyle(menu).fontFamily)
    expect(getComputedStyle(tab).backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(tab).borderBottomWidth).toBe("2px")
  })

  it("lays vertical tabs out beside their pane", async () => {
    const root = await example("variations")
    const tabs = root.querySelector<HTMLElement>(".ui.vertical.tabs")!
    const menu = tabs.querySelector<HTMLElement>(".ui.menu")!
    const pane = tabs.querySelector<HTMLElement>(".ui.tab")!
    expect(getComputedStyle(tabs).flexDirection).toBe("row")
    expect(pane.getBoundingClientRect().left).toBeGreaterThanOrEqual(menu.getBoundingClientRect().right - 1)
    expect(Math.round(pane.getBoundingClientRect().top)).toBe(Math.round(menu.getBoundingClientRect().top))
  })

  it("takes a public token from a wrapper of the tab set (static markup)", () => {
    Sheets.adopt([...foundationCSS, segmentCSS, menuCSS, tabCSS])
    const root = Fixture.render(
      `<div style="--ui-tabs-pane-margin: 2em 0 0"><div class="ui tabs">` +
        `<div class="ui menu"><button class="active item">A</button></div>` +
        `<div class="ui active tab segment">A</div></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".ui.tab")!).marginTop).toBe("32px")
  })

  it("shows a loading pane with a spinner", async () => {
    const root = await example("states")
    const loading = root.querySelector<HTMLElement>(".ui.loading.tab")!
    expect(getComputedStyle(loading).minHeight).toBe("250px")
    expect(getComputedStyle(loading, "::after").animationName).toBe("ui-tab-spin")
    expect(getComputedStyle(loading.querySelector("p")!).visibility).toBe("hidden")
  })
})

/**
 * Resize the test iframe's viewport to `width` for this test.
 * - SIDE EFFECT:  restored when the test finishes.
 */
async function resize(width: number) {
  const [previousWidth, previousHeight] = [window.innerWidth, window.innerHeight]
  await page.viewport(width, 800)
  onTestFinished(() => page.viewport(previousWidth, previousHeight))
}
