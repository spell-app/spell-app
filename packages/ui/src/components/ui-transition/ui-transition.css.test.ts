import { describe, expect, it } from "vite-plus/test"

import { colorsCSS, foundationCSS } from "$/ui/styles"

import { Fixture } from "$/ui/test/Fixture"
import { Sheets } from "$/ui/test/Sheets"

import { transitionVocabulary } from "./ui-transition.vocabulary.en"

import buttonCSS from "$/ui/components/ui-button/ui-button.css?inline"
import segmentCSS from "$/ui/components/ui-segment/ui-segment.css?inline"
import transitionCSS from "./ui-transition.css?inline"
import transitionRaw from "./ui-transition.css?raw"
import animationsRaw from "$/ui/styles/animations.css?raw"

/**
 * `ui-transition.css` (plus `animations.css`, which owns Fomantic's transition states) on its own:  the sheet's source
 * rules, the computed styles of the light-DOM examples, and a stand-in shadow host for the element's box.
 */

/** Every example fragment, by path. */
const EXAMPLES = import.meta.glob<string>("./examples/*.html", { query: "?raw", import: "default", eager: true })

/** `!important`s the sheet is allowed:  none. */
const ALLOWED_IMPORTANT = 0

/** Adopt the sheets and render the class-grammar example. */
function example(): HTMLElement {
  Sheets.adopt([...foundationCSS, buttonCSS, segmentCSS, transitionCSS])
  return Fixture.render(EXAMPLES["./examples/transition.html"]!)
}

////////////////
// ## Source
////////////////

describe("ui-transition.css source", () => {
  it("never uses rem", () => {
    expect(Sheets.withoutComments(transitionRaw)).not.toMatch(/\d(\.\d+)?rem\b/)
  })

  it(`uses !important exactly ${ALLOWED_IMPORTANT} times`, () => {
    expect(Sheets.withoutComments(transitionRaw).match(/!important/g) ?? []).toHaveLength(ALLOWED_IMPORTANT)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(transitionRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("transition"))).toBe(true)
  })

  it("parses with replaceSync", () => {
    for (const css of [transitionCSS, transitionRaw]) {
      expect(Sheets.selectors(css)).toContain(".ui.inline.transition")
    }
  })

  it("covers every class word the vocabulary can emit (with animations.css's states)", () => {
    const css = transitionRaw + animationsRaw + colorsCSS
    for (const phrase of Sheets.classPhrases(transitionVocabulary))
      expect(Sheets.covers(css, phrase), `${transitionVocabulary.tag}: ${phrase}`).toBe(true)
  })
})

////////////////
// ## Examples
////////////////

describe("ui-transition.css examples", () => {
  it("visible shows, hidden takes no room", () => {
    const root = example()
    const [visible, hidden] = root.querySelectorAll<HTMLElement>(".ui.transition")
    expect(getComputedStyle(visible!).display).toBe("block")
    expect(getComputedStyle(visible!).visibility).toBe("visible")
    expect(getComputedStyle(hidden!).display).toBe("none")
  })

  it("looping repeats forever;  disabled pauses", () => {
    const root = example()
    const looping = root.querySelector<HTMLElement>(".ui.looping.pulse.transition")!
    expect(getComputedStyle(looping).animationName).toBe("ui-pulse")
    expect(getComputedStyle(looping).animationIterationCount).toBe("infinite")
    const disabled = root.querySelector<HTMLElement>(".ui.disabled.transition")!
    expect(getComputedStyle(disabled).animationPlayState).toBe("paused")
  })

  it("pulsating:  the ring in the remapped hue", () => {
    const root = example()
    const [red, grey] = root.querySelectorAll<HTMLElement>(".ui.pulsating.transition")
    expect(getComputedStyle(red!).animationName).toBe("ui-pulsating")
    expect(getComputedStyle(red!).boxShadow).not.toBe(getComputedStyle(grey!).boxShadow)
  })

  it("the protocol beats the class grammar's reset:  `.ui.transition[data-ui-animation]` runs its keyframes", () => {
    Sheets.adopt([...foundationCSS, transitionCSS])
    const box = Fixture.render(`<div class="ui transition" data-ui-animation="fade-up out">x</div>`)
    expect(getComputedStyle(box).animationName).toBe("ui-fade-up-out")
  })
})

////////////////
// ## Element box
////////////////

describe("ui-transition.css on the element's box", () => {
  it("the host has no box;  `inline` makes an inline block;  `[hidden]` always hides", () => {
    const host = Sheets.host(`<div class="ui inline transition" part="transition"><slot></slot></div>`, [
      ...foundationCSS,
      transitionCSS
    ])
    const box = Sheets.inner(host)
    expect(getComputedStyle(host).display).toBe("contents")
    expect(getComputedStyle(box).display).toBe("inline-block")
    box.hidden = true
    expect(getComputedStyle(box).display).toBe("none")
  })
})
