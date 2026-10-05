import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { Transitions } from "./Transitions"

/** Stand-in for `animations.css`:  a short `fade` in / out, driven by `data-ui-animation`. */
const KEYFRAMES = `
  @keyframes test-fade-in { from { opacity: 0 } to { opacity: 1 } }
  @keyframes test-fade-out { from { opacity: 1 } to { opacity: 0 } }
  [data-ui-animation="fade in"] { animation: test-fade-in var(--ui-animation-duration, 40ms) linear }
  [data-ui-animation="fade out"] { animation: test-fade-out var(--ui-animation-duration, 40ms) linear }
  [data-ui-animation="shake static"] { animation: test-fade-in 30ms linear }
  .block { display: block }
`

describe("Transitions", () => {
  const sheet = new CSSStyleSheet()
  const transitions = new Transitions({ browser: { reducedMotion: false } })

  beforeAll(() => {
    sheet.replaceSync(KEYFRAMES)
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
  })
  afterAll(() => {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((each) => each !== sheet)
  })

  it("runs in:  un-hides, sets the attribute, resolves on animationend and cleans up", async () => {
    const element = Fixture.render(`<p hidden>hi</p>`)
    const done = transitions.animate(element, "fade", "in")
    expect(element.hidden).toBe(false)
    expect(element.getAttribute("data-ui-animation")).toBe("fade in")
    expect(transitions.isAnimating(element, "in")).toBe(true)
    await expect(done).resolves.toBe(true)
    expect(element.hasAttribute("data-ui-animation")).toBe(false)
    expect(transitions.isAnimating(element)).toBe(false)
  })

  it("runs out:  hides afterwards, forcing display:none when CSS overrides [hidden]", async () => {
    const element = Fixture.render(`<p class="block">bye</p>`)
    await expect(transitions.animate(element, "fade", "out", { duration: 20 })).resolves.toBe(true)
    expect(element.hidden).toBe(true)
    expect(getComputedStyle(element).display).toBe("none")
    expect(element.style.getPropertyValue("--ui-animation-duration")).toBe("")
    await transitions.animate(element, "fade", "in", { duration: 20 })
    expect(getComputedStyle(element).display).toBe("block")
  })

  it("an opposite animation interrupts the running one", async () => {
    const element = Fixture.render(`<p>x</p>`)
    const out = transitions.animate(element, "fade", "out", { duration: 500 })
    const back = transitions.animate(element, "fade", "in", { duration: 20 })
    await expect(out).resolves.toBe(false)
    await expect(back).resolves.toBe(true)
    expect(element.hidden).toBe(false)
  })

  it("static animations leave visibility alone", async () => {
    const element = Fixture.render(`<p>x</p>`)
    await expect(transitions.animate(element, "shake", "static")).resolves.toBe(true)
    expect(element.hidden).toBe(false)
  })

  it("resolves immediately when no keyframes apply", async () => {
    const element = Fixture.render(`<p>x</p>`)
    await expect(transitions.animate(element, "zoom", "out")).resolves.toBe(true)
    expect(element.hidden).toBe(true)
  })

  it("honours reduced motion", async () => {
    const reduced = new Transitions({ browser: { reducedMotion: true } })
    const element = Fixture.render(`<p>x</p>`)
    await expect(reduced.animate(element, "fade", "out")).resolves.toBe(true)
    expect(element.hidden).toBe(true)
    expect(element.hasAttribute("data-ui-animation")).toBe(false)
  })

  it("whenTransitionEnds() waits for running animations", async () => {
    const element = Fixture.render(`<p>x</p>`)
    const animation = element.animate([{ opacity: 0 }, { opacity: 1 }], 30)
    await transitions.whenTransitionEnds(element)
    expect(animation.playState).toBe("finished")
  })
})
