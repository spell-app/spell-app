import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { dimmerVocabulary } from "./UIDimmer.vocabulary.en"

import buttonCSS from "$/ui/components/ui-button/UIButton.css?inline"
import segmentCSS from "$/ui/components/ui-segment/UISegment.css?inline"
import modalCSS from "$/ui/components/ui-modal/UIModal.css?inline"
import dimmerCSS from "./UIDimmer.css?inline"
import dimmerRaw from "./UIDimmer.css?raw"
import dimmablePageRaw from "./UIDimmer.page.css?raw"

/**
 * `UIDimmer.css` on its own, before any element exists:  the sheet's source rules, the computed styles of the
 * light-DOM examples (the class grammar the shadow box uses), and the dimmer tokens it shares with the modal.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed:  none. */
const ALLOWED_IMPORTANT = 0

/** Adopt the sheets and render example `name`. */
function example(name: string): HTMLElement {
  Sheets.adopt([...foundationCSS, buttonCSS, segmentCSS, dimmerCSS])
  return Fixture.render(EXAMPLES[`./examples/${name}.html`]!)
}

/** The static dimmer in the segment whose first paragraph reads `text`. */
function dimmerIn(root: Element, text: string): HTMLElement {
  const segment = [...root.querySelectorAll(".ui.segment")].find(
    (each) => each.querySelector("p")?.textContent === text
  )
  if (!segment) throw new Error(`no segment "${text}"`)
  return segment.querySelector<HTMLElement>(".ui.dimmer")!
}

////////////////
// ## Source
////////////////

describe("UIDimmer.css source", () => {
  it("never uses rem", () => {
    for (const css of [dimmerRaw, dimmablePageRaw]) expect(Sheets.withoutComments(css)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(dimmerRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(dimmerRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("dimmer"))).toBe(true)
  })

  it("parses with replaceSync, keeping the dialog, starting-style and on-hover rules", () => {
    for (const css of [dimmerCSS, dimmerRaw]) {
      const selectors = Sheets.selectors(css)
      expect(selectors).toContain("dialog.ui.dimmer::backdrop")
      expect(selectors).toContain(":host(:state(on-hover)) > .ui.dimmer:not(.active, .disabled)")
    }
    expect(dimmerCSS).toContain("@starting-style")
  })

  it("covers every class word the vocabulary can emit", () => {
    const css = dimmerRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(dimmerVocabulary))
      expect(Sheets.covers(css, phrase), `${dimmerVocabulary.tag}: ${phrase}`).toBe(true)
    for (const shade of ["medium", "light", "very light"]) expect(Sheets.covers(css, shade), shade).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("UIDimmer.css examples", () => {
  it("an active dimmer fades in over its dimmable parent, dark, content centred", async () => {
    const root = example("types")
    const dimmer = dimmerIn(root, "A segment holding some text that the dimmer covers.")
    const style = getComputedStyle(dimmer)
    expect(dimmer.getAnimations().length).toBeGreaterThan(0)
    await Promise.all(dimmer.getAnimations().map((animation) => animation.finished))
    expect(style).toMatchObject({
      display: "flex",
      position: "absolute",
      opacity: "1",
      justifyContent: "center",
      colorScheme: "dark"
    })
    expect(dimmer.offsetWidth).toBe(dimmer.parentElement!.clientWidth)
    expect(dimmer.offsetHeight).toBe(dimmer.parentElement!.clientHeight)
  })

  it("inverted is light;  shades are lighter;  blurring filters what's behind", () => {
    const root = example("variations")
    const alpha = (element: Element) => Number(getComputedStyle(element).backgroundColor.match(/\/ ([\d.]+)\)$/)?.[1])
    expect(getComputedStyle(dimmerIn(root, "A light dimmer.")).colorScheme).toBe("light")
    const [medium, light, veryLight] = ["Medium", "Light", "Very light"].map((text) => alpha(dimmerIn(root, text)))
    expect(medium).toBeCloseTo(0.65)
    expect(light).toBeCloseTo(0.45)
    expect(veryLight).toBeCloseTo(0.25)
    const blurring = dimmerIn(root, "What's behind a blurring dimmer is blurred and greyed.")
    expect(getComputedStyle(blurring).backdropFilter).toContain("blur(5px)")
  })

  it("aligned content;  simple shows under a dimmed parent;  disabled never shows", () => {
    const root = example("variations")
    expect(getComputedStyle(dimmerIn(root, "Content at the top.")).justifyContent).toBe("flex-start")
    expect(getComputedStyle(dimmerIn(root, "Content at the bottom.")).justifyContent).toBe("flex-end")
    const simple = dimmerIn(root, "A CSS-only dimmer, shown by its dimmed parent.")
    expect(simple.offsetHeight).toBe(simple.parentElement!.clientHeight)
    expect(getComputedStyle(dimmerIn(root, "A disabled dimmer never shows.")).display).toBe("none")
  })
})

////////////////
// ## Tokens
////////////////

describe("UIDimmer.css tokens", () => {
  it("one `--ui-dimmer-background` themes the dimmer AND the modal's backdrop", () => {
    Sheets.adopt([...foundationCSS, dimmerCSS, modalCSS])
    const root = Fixture.render(
      `<div style="--ui-dimmer-background: rgb(10 20 30 / 0.5)"><div class="dimmable">` +
        `<div class="ui active dimmer"></div></div><div class="ui modal"></div></div>`
    )
    expect(getComputedStyle(root.querySelector(".dimmer")!).backgroundColor).toBe("rgba(10, 20, 30, 0.5)")
    expect(getComputedStyle(root.querySelector(".modal")!).getPropertyValue("--_ui-modal-dimmer-background")).toBe(
      "rgb(10 20 30 / 0.5)"
    )
  })
})
