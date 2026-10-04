import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { hueAliases, hueStates, hues, semanticAliases, semanticColors, type Oklch } from "$/ui/styles"
import { ColorContrast } from "$/ui/styles/ColorContrast"

import { Fixture } from "$/ui/test/fixture"

import layersRaw from "./layers.css?raw"
import tokensRaw from "./tokens.css?raw"
import colorsRaw from "./colors.css?raw"
import sizesRaw from "./sizes.css?raw"
import utilitiesRaw from "./utilities.css?raw"

/**
 * WCAG contrast of the GENERATED palette, per colour and per scheme.
 * - Colours are read back from the browser (`getComputedStyle`), so what's measured is what `colors.css`
 *   resolves to -- `light-dark()`, relative-colour roles and remaps included -- not the vocabulary's numbers.
 * - Ratios via `ColorContrast` (clipped to sRGB, as axe does), so a pass here is a pass in the axe tests.
 * - Raw sheets, so `light-dark()` survives whatever the Lightning CSS targets (see `styles.test.ts`).
 */

/** Every colour name a component accepts:  hues, aliases, semantic colours and their aliases. */
const NAMES = [
  ...Object.keys(hues),
  ...Object.keys(hueAliases),
  ...Object.keys(semanticColors),
  ...Object.keys(semanticAliases)
]

/** Palette hues and their aliases:  the colours with a `-border` role worth a 3:1 check. */
const HUE_NAMES = new Set([...Object.keys(hues), ...Object.keys(hueAliases)])

/** Scheme classes from `utilities.css`. */
const SCHEMES = ["ui-light", "ui-dark"] as const

/** Solid-colour tokens `--ui-color-on` must read on:  the colour and each interaction state. */
const SOLIDS = ["--ui-color", ...Object.keys(hueStates).map((state) => `--ui-color-${state}`)]

describe("palette contrast (WCAG AA)", () => {
  it.each(SCHEMES)("puts readable text on every solid colour and state (%s)", (scheme) => {
    adoptFoundation()
    const failures: string[] = []
    for (const name of NAMES) {
      const probe = renderProbe(scheme, name)
      for (const solid of SOLIDS) failures.push(...check(probe, name, "--ui-color-on", solid, ColorContrast.text))
      failures.push(...check(probe, name, "--ui-color-inverted-on", "--ui-color-inverted", ColorContrast.text))
    }
    expect(failures).toEqual([])
  })

  it.each(SCHEMES)("keeps the text roles readable on the page and the tinted background (%s)", (scheme) => {
    adoptFoundation()
    const failures: string[] = []
    for (const name of NAMES) {
      const probe = renderProbe(scheme, name)
      for (const role of ["--ui-color-text", "--ui-color-header"]) {
        failures.push(...check(probe, name, role, "--ui-background", ColorContrast.text))
        failures.push(...check(probe, name, role, "--ui-color-background", ColorContrast.text))
      }
      // the `-inverted` colour is TEXT on a dark surface too (inverted labels, icons, basic buttons)
      if (scheme === "ui-dark") {
        failures.push(...check(probe, name, "--ui-color-inverted", "--ui-background", ColorContrast.text))
      }
      // NOTE: semantic borders are decorative (a message's edge), so only hue borders -- button / label
      // outlines -- need the 3:1 of a UI component boundary
      if (HUE_NAMES.has(name)) {
        failures.push(...check(probe, name, "--ui-color-border", "--ui-background", ColorContrast.large))
      }
    }
    expect(failures).toEqual([])
  })

  it("measures OKLCH like the browser paints it", () => {
    // cross-check `ColorContrast`'s conversion against a canvas pixel, for every light-scheme base
    const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!
    for (const [name, hue] of Object.entries(hues)) {
      const [lightness, chroma, angle] = hue.onLight
      context.fillStyle = `oklch(${lightness} ${chroma} ${angle})`
      context.fillRect(0, 0, 1, 1)
      const pixel = [...context.getImageData(0, 0, 1, 1).data.slice(0, 3)]
      const expected = ColorContrast.linearSrgb(hue.onLight).map((channel) => Math.round(encode(channel) * 255))
      for (const [index, value] of pixel.entries()) expect(Math.abs(value - expected[index]!), name).toBeLessThan(2)
    }
  })
})

/**
 * Adopt the raw foundation into the document for the current test.
 * - SIDE EFFECT:  appended to `document.adoptedStyleSheets`, removed when the test finishes.
 */
function adoptFoundation() {
  const sheets = [layersRaw, tokensRaw, colorsRaw, sizesRaw, utilitiesRaw].map((css) => {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(css)
    return sheet
  })
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, ...sheets]
  onTestFinished(() => {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => !sheets.includes(sheet))
  })
}

/** A `.ui.<name>` span inside a `scheme` wrapper:  the element whose remapped tokens get measured. */
function renderProbe(scheme: string, name: string): HTMLElement {
  return Fixture.render(`<div class="${scheme}"><span class="ui ${name}"></span></div>`)
    .firstElementChild as HTMLElement
}

/** `[]` if `foreground` on `background` (both tokens, resolved on `probe`) reaches `minimum`, else the failure. */
function check(probe: HTMLElement, name: string, foreground: string, background: string, minimum: number): string[] {
  const ratio = ColorContrast.ratio(resolve(probe, foreground), resolve(probe, background))
  return ratio >= minimum ? [] : [`${name}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1 < ${minimum}`]
}

/**
 * Token `name` resolved on `probe`, as OKLCH.
 * - SIDE EFFECT:  sets `probe`'s inline `color`.
 * - Throws on anything but an opaque `oklch()`:  the palette is all OKLCH, and alpha would need a backdrop.
 */
function resolve(probe: HTMLElement, name: string): Oklch {
  probe.style.color = `var(${name})`
  const value = getComputedStyle(probe).color
  const match = /^oklch\(([\d.]+) ([\d.]+) ([\d.]+|none)\)$/.exec(value)
  if (!match) throw new Error(`${name} resolved to ${value}, not an opaque oklch()`)
  return [Number(match[1]), Number(match[2]), match[3] === "none" ? 0 : Number(match[3])]
}

/** sRGB transfer function:  linear light -> gamma-encoded channel. */
function encode(linear: number): number {
  return linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055
}
