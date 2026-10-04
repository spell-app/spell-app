import { describe, expect, it } from "vite-plus/test"

import { foundationCSS } from "$/ui/styles"

import { Sheets } from "$/ui/test/sheets"

import themesCSS from "./ui-docs-themes.css?inline"
import themesRaw from "./ui-docs-themes.css?raw"

/** The scheme button and the overlay's rows, as the element renders them (the shadow markup contract). */
const MARKUP = `<div class="ui themes" part="controls">
  <button class="palette button" part="palette"><span class="glyph">P</span></button>
  <button class="scheme light button" part="scheme">
    <span class="light glyph">S</span><span class="dark glyph">M</span>
  </button>
  <div class="panel">
    <div class="menu">
      <button class="option checked" role="menuitemradio"><span class="check">C</span><span class="name">Spell</span></button>
      <button class="option" role="menuitemradio"><span class="check">C</span><span class="name">Plain</span></button>
    </div>
    <button class="system" role="switch" aria-checked="true"><span class="label">Match</span><span class="track"></span></button>
  </div>
</div>`

/**
 * `ui-docs-themes.css`:  the sheet's source rules, and its look on the shadow markup contract.
 * - The overlay box and the dropdown are other families' (`<ui-popup>`, `<ui-dropdown>`), tested there;  a stand-in
 *   host with the contract's markup is enough for the rest.
 */
describe("ui-docs-themes.css source", () => {
  it("never uses rem;  its one !important is the documented sun / moon swap", () => {
    const text = Sheets.withoutComments(themesRaw)
    expect(text).not.toMatch(/\d(\.\d+)?rem\b/)
    expect(text.match(/!important/g)).toHaveLength(1)
    expect(text).toMatch(/\.scheme \.glyph \{\s*transition:[^}]*!important;/)
  })

  it("declares its sublayer order before any rule", () => {
    const text = Sheets.withoutComments(themesRaw).trim()
    expect(text.replace(/\s+/g, " ").startsWith(Sheets.layers("docs-themes"))).toBe(true)
  })

  it("declares no public token of its own:  private aliases only", () => {
    const declared = [...Sheets.withoutComments(themesRaw).matchAll(/(--ui-docs-themes-[\w-]+)\s*:/g)]
    expect(declared.map((match) => match[1])).toEqual([])
  })
})

describe("ui-docs-themes.css look", () => {
  it("lays the controls in one row:  36px round buttons, --ui-docs-themes-gap / -button-size set them", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, themesCSS])
    const shadow = host.shadowRoot!
    const controls = shadow.querySelector<HTMLElement>("[part~=controls]")!
    const scheme = shadow.querySelector<HTMLElement>("[part~=scheme]")!
    expect(getComputedStyle(controls).display).toBe("inline-flex")
    expect(getComputedStyle(controls).columnGap).toBe("4px")
    expect([getComputedStyle(scheme).width, getComputedStyle(scheme).height]).toEqual(["36px", "36px"])
    expect(getComputedStyle(scheme).borderRadius).toBe("50%")
    host.style.setProperty("--ui-docs-themes-gap", "20px")
    host.style.setProperty("--ui-docs-themes-button-size", "40px")
    expect(getComputedStyle(controls).columnGap).toBe("20px")
    expect(getComputedStyle(scheme).width).toBe("40px")
  })

  it("shows the glyph of the button's scheme:  the other one shrunk, faded and blurred", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, themesCSS])
    const shadow = host.shadowRoot!
    const sun = getComputedStyle(shadow.querySelector(".light.glyph")!)
    const moon = getComputedStyle(shadow.querySelector(".dark.glyph")!)
    expect([sun.opacity, sun.scale, sun.filter]).toEqual(["1", "1", "blur(0px)"])
    expect([moon.opacity, moon.scale, moon.filter]).toEqual(["0", "0.25", "blur(4px)"])
    shadow.querySelector("[part~=scheme]")!.className = "scheme dark button"
    for (const animation of shadow.getAnimations()) animation.finish()
    expect(getComputedStyle(shadow.querySelector(".dark.glyph")!).opacity).toBe("1")
    expect(getComputedStyle(shadow.querySelector(".light.glyph")!).opacity).toBe("0")
  })

  it("marks the chosen theme, and turns the switch on", () => {
    const host = Sheets.host(MARKUP, [...foundationCSS, themesCSS])
    const [checked, other] = host.shadowRoot!.querySelectorAll(".option")
    expect(getComputedStyle(checked!.querySelector(".check")!).opacity).toBe("1")
    expect(getComputedStyle(other!.querySelector(".check")!).opacity).toBe("0")
    expect(getComputedStyle(checked!).backgroundColor).not.toBe(getComputedStyle(other!).backgroundColor)
    const knob = getComputedStyle(host.shadowRoot!.querySelector(".track")!, "::after")
    expect(knob.translate).not.toBe("none")
  })

  it("size scales the buttons", () => {
    const host = Sheets.host(MARKUP.replace('class="ui themes"', 'class="ui small themes"'), [
      ...foundationCSS,
      themesCSS
    ])
    expect(getComputedStyle(host.shadowRoot!.querySelector("[part~=scheme]")!).width).toBe("31.5px")
  })
})
