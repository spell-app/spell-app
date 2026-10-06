import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { AnimationNames } from "$/ui/runtime"
import { breakpoints, colorsCSS, foundationCSS, pageCSS, sizes, utilitiesCSS } from "$/ui/styles"
import { StyleGenerator } from "$/ui/styles/StyleGenerator"

import { Fixture } from "$/ui/test/fixture"

import layersRaw from "./layers.css?raw"
import tokensRaw from "./tokens.css?raw"
import colorsRaw from "./colors.css?raw"
import sizesRaw from "./sizes.css?raw"
import utilitiesRaw from "./utilities.css?raw"
import animationsRaw from "./animations.css?raw"
import mediaRaw from "./media.css?raw"
import classicThemeCSS from "$/ui/styles/themes/classic.css?inline"
import darkThemeCSS from "$/ui/styles/themes/dark.css?inline"

/**
 * The CSS foundation, in a real browser:  sheets adopted into the document and into shadow roots.
 * - Page-level sheets are adopted per test and removed again, so the fallback tests can run without them.
 * - Design tests that depend on `light-dark()` resolving where USED read the `?raw` sheets:  the barrel's
 *   `?inline` sheets are only faithful once `css.lightningcss.targets` is modern (see `index.ts`).
 */

/** Every `.css` file under `src/styles/`, as written. */
const RAW_SHEETS = import.meta.glob<string>("./**/*.css", { query: "?raw", import: "default", eager: true })

/**
 * 13 KB:  the gzip budget for `foundationCSS`.
 * - Was 12 KB;  the per-colour `-on` / `-inverted-on` contrast tokens and their remaps added ~0.65 KB.
 */
const FOUNDATION_GZIP_BUDGET = 13 * 1024

/** `true` when Vite's Lightning CSS lowered `light-dark()` in the barrel's sheets (default targets). */
const LIGHT_DARK_LOWERED = colorsCSS.includes("--lightningcss-light")

describe("styles foundation", () => {
  it("declares --ui-font-size in px", () => {
    adoptIntoPage(foundationCSS)
    expect(property(document.documentElement, "--ui-font-size")).toBe("16px")
  })

  it("resolves derived hue tokens to colours", () => {
    adoptIntoPage(foundationCSS)
    const base = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    const hover = Fixture.render(`<span style="color: var(--ui-red-hover)"></span>`)
    expect(getComputedStyle(hover).color).toMatch(/^(oklch|rgb|color)\(/)
    expect(getComputedStyle(hover).color).not.toBe(getComputedStyle(base).color)
  })

  it("remaps a hue class onto the generic --ui-color tokens", () => {
    adoptIntoPage(foundationCSS)
    const red = Fixture.render(`<span style="color: var(--ui-red-text)"></span>`)
    const remapped = Fixture.render(`<span class="ui red" style="color: var(--ui-color-text)"></span>`)
    expect(getComputedStyle(remapped).color).toBe(getComputedStyle(red).color)
  })

  it("remaps sizes onto --ui-scale;  medium is a real no-op size", () => {
    adoptIntoPage(foundationCSS)
    const large = Fixture.render(`<div class="ui large"><span class="ui medium"></span></div>`)
    expect(property(large, "--ui-scale")).toBe(String(sizes.large))
    expect(property(large.firstElementChild!, "--ui-scale")).toBe("1")
  })

  it("lays out .ui-stack as a flex column", () => {
    adoptIntoPage(foundationCSS)
    const style = getComputedStyle(Fixture.render(`<div class="ui-stack"><p>a</p><p>b</p></div>`))
    expect(style.display).toBe("flex")
    expect(style.flexDirection).toBe("column")
  })

  it("cloaks undefined custom elements", () => {
    adoptIntoPage(foundationCSS)
    const wrapper = Fixture.render(`<div class="ui-cloak"><ui-styles-never-defined></ui-styles-never-defined></div>`)
    expect(getComputedStyle(wrapper).opacity).toBe("0")
    expect(getComputedStyle(Fixture.render(`<div class="ui-cloak"><p>ready</p></div>`)).opacity).toBe("1")
  })

  it("renders the CSS-only tooltip, coloured by data-variation", () => {
    adoptIntoPage(pageCSS)
    const button = Fixture.render(`<button data-tooltip="Add users" data-variation="red">+</button>`)
    const bubble = getComputedStyle(button, "::after")
    expect(bubble.content).not.toBe("none")
    expect(bubble.position).toBe("absolute")
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    expect(bubble.backgroundColor).toBe(getComputedStyle(red).color)
  })

  it("resolves the custom-media breakpoints at build time", () => {
    expect(utilitiesCSS).not.toContain("--ui-mobile")
    expect(utilitiesCSS).toContain("768px")
  })
})

describe("styles in shadow roots", () => {
  it("resolves page tokens and remaps inside a shadow root", () => {
    adoptIntoPage(foundationCSS)
    const inner = renderShadow(`<b class="ui red"></b>`, foundationCSS)
    expect(property(inner, "--ui-font-size")).toBe("16px")
    expect(getComputedStyle(inner).display).not.toBe("")
    const red = Fixture.render(`<span style="color: var(--ui-red)"></span>`)
    inner.style.color = "var(--ui-color)"
    expect(getComputedStyle(inner).color).toBe(getComputedStyle(red).color)
  })

  it("falls back to :host tokens when the page never loaded them", () => {
    const inner = renderShadow(`<b></b>`, foundationCSS)
    expect(property(document.documentElement, "--ui-font-size")).toBe("")
    expect(property(inner, "--ui-font-size")).toBe("16px")
    expect(property(inner, "--ui-size-large")).toBe(String(sizes.large))
  })

  it("lets a wrapper override a token for the components inside it", () => {
    adoptIntoPage(foundationCSS)
    const inner = renderShadow(`<b></b>`, foundationCSS, `style="--ui-font-size: 20px"`)
    expect(property(inner, "--ui-font-size")).toBe("20px")
  })

  it("resets shadow markup without touching the page", () => {
    adoptIntoPage(foundationCSS)
    const inner = renderShadow(`<p>shadow</p>`, foundationCSS)
    expect(getComputedStyle(inner).marginBlockStart).toBe("0px")
    expect(getComputedStyle(Fixture.render(`<p>page</p>`)).marginBlockStart).not.toBe("0px")
  })
})

describe("colour schemes", () => {
  /** Raw sheets, so `light-dark()` survives whatever the Lightning CSS targets. */
  const RAW_FOUNDATION = [layersRaw, tokensRaw, colorsRaw, sizesRaw, utilitiesRaw]

  it("flips tokens in a .ui-dark subtree, in the page and in shadow roots", () => {
    adoptIntoPage(RAW_FOUNDATION)
    expectSchemes(RAW_FOUNDATION)
  })

  it("inverts relative to the parent scheme with .ui-invert", () => {
    adoptIntoPage(RAW_FOUNDATION)
    const light = Fixture.render(`<div class="ui-light"><span class="ui-invert"></span></div>`)
    const dark = Fixture.render(`<div class="ui-dark"><span class="ui-invert"></span></div>`)
    expect(getComputedStyle(light.firstElementChild!).colorScheme).toBe("dark")
    expect(getComputedStyle(dark.firstElementChild!).colorScheme).toBe("light")
  })

  // Needs `css.lightningcss.targets` set to modern browsers in the Vite / Vitest configs -- see `index.ts`.
  it.skipIf(LIGHT_DARK_LOWERED)("keeps light-dark() in the barrel's sheets (modern lightningcss targets)", () => {
    adoptIntoPage(foundationCSS)
    expectSchemes(foundationCSS)
  })

  /** A `.ui-dark` subtree gets `onDark` hues, in light DOM and through a shadow root. */
  function expectSchemes(shadowSheets: readonly string[]) {
    const light = Fixture.render(`<span class="ui-light" style="color: var(--ui-red)"></span>`)
    const dark = Fixture.render(`<div class="ui-dark"><span style="color: var(--ui-red)"></span></div>`)
    const onDark = Fixture.render(`<span style="color: var(--ui-red-on-dark)"></span>`)
    expect(getComputedStyle(dark.firstElementChild!).color).toBe(getComputedStyle(onDark).color)
    expect(getComputedStyle(light).color).not.toBe(getComputedStyle(onDark).color)
    const inner = renderShadow(`<b class="ui red" style="color: var(--ui-color)"></b>`, shadowSheets, `class="ui-dark"`)
    expect(getComputedStyle(inner).color).toBe(getComputedStyle(onDark).color)
  }
})

describe("page sheets and themes", () => {
  it("styles headings under .ui-typography only", () => {
    adoptIntoPage(pageCSS)
    const page = Fixture.render(`<div class="ui-typography"><h1>Title</h1></div>`)
    expect(getComputedStyle(page.firstElementChild!).fontSize).toBe("32px")
    expect(getComputedStyle(Fixture.render(`<h1>Plain</h1>`)).fontFamily).not.toContain("system-ui")
  })

  it("restores Fomantic's base size and palette with the classic theme", () => {
    adoptIntoPage([...foundationCSS, classicThemeCSS])
    expect(property(document.documentElement, "--ui-font-size")).toBe("14px")
    const red = Fixture.render(`<span class="ui-light" style="color: var(--ui-red)"></span>`)
    const classic = Fixture.render(`<span style="color: oklch(0.577 0.213 27.2)"></span>`)
    expect(getComputedStyle(red).color).toBe(getComputedStyle(classic).color)
  })

  it("forces the dark scheme with the dark theme", () => {
    adoptIntoPage([...foundationCSS, darkThemeCSS])
    expect(getComputedStyle(document.documentElement).colorScheme).toBe("dark")
    expect(property(document.documentElement, "--ui-scheme")).toBe("dark")
  })
})

describe("style sources", () => {
  it("never uses rem", () => {
    for (const [path, css] of Object.entries(RAW_SHEETS)) {
      expect(withoutComments(css), path).not.toMatch(/\d(\.\d+)?rem\b/)
    }
  })

  it("keeps the generated sheets current (run `yarn gen:styles`)", () => {
    for (const [name, css] of Object.entries(new StyleGenerator().sheets())) {
      expect(squash(RAW_SHEETS[`./${name}`] ?? ""), name).toBe(squash(css))
    }
  })

  it("covers every runtime animation name", () => {
    for (const name of AnimationNames) {
      const directions = STATIC_ANIMATIONS.has(name) ? ["static"] : ["in", "out"]
      for (const direction of directions) expect(animationsRaw).toContain(`[data-ui-animation="${name} ${direction}"]`)
    }
  })

  it("matches media.css to the breakpoint vocabulary", () => {
    for (const name of ["tablet", "computer", "largeMonitor", "widescreen"] as const) {
      expect(mediaRaw).toContain(`${breakpoints[name]}px`)
    }
  })

  it(`fits the foundation in ${FOUNDATION_GZIP_BUDGET / 1024} KB gzipped`, async () => {
    // `?raw` + `minify()` ~== a production build with modern targets (the dev `?inline` text isn't minified)
    const names = ["layers", "reset", "tokens", "colors", "sizes", "animations", "utilities"]
    const text = names.map((name) => minify(RAW_SHEETS[`./${name}.css`] ?? "")).join("")
    expect(text.length).toBeGreaterThan(10_000)
    expect(await gzipSize(text)).toBeLessThanOrEqual(FOUNDATION_GZIP_BUDGET)
  })
})

/** Attention animations run `static`;  the rest `in` / `out`. */
const STATIC_ANIMATIONS = new Set<string>(["flash", "shake", "bounce", "tada", "pulse", "jiggle", "glow"])

/**
 * Adopt `css` into the document for the current test.
 * - SIDE EFFECT:  appended to `document.adoptedStyleSheets`, removed when the test finishes.
 */
function adoptIntoPage(css: readonly string[]) {
  const sheets = toSheets(css)
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, ...sheets]
  onTestFinished(() => {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => !sheets.includes(sheet))
  })
}

/**
 * Render `html` into the shadow root of a fresh host that adopts `css`;  return the shadow's first element.
 * - `hostAttributes` go on the host, e.g. a class or an inline token override.
 */
function renderShadow<T extends HTMLElement = HTMLElement>(
  html: string,
  css: readonly string[],
  hostAttributes = ""
): T {
  const host = Fixture.render(`<section ${hostAttributes}></section>`)
  const root = host.attachShadow({ mode: "open" })
  root.adoptedStyleSheets = toSheets(css)
  root.innerHTML = html
  return root.firstElementChild as T
}

/** Constructable sheets from CSS text. */
function toSheets(css: readonly string[]): CSSStyleSheet[] {
  return css.map((text) => {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(text)
    return sheet
  })
}

/** Computed value of custom property `name` on `element`. */
function property(element: Element, name: string): string {
  return getComputedStyle(element).getPropertyValue(name).trim()
}

/** `css` without comments. */
function withoutComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "")
}

/** `css` without comments or any whitespace:  compares sheets regardless of formatting. */
function squash(css: string): string {
  return withoutComments(css).replace(/\s+/g, "")
}

/**
 * Rough CSS minifier, for SIZE measurement only (the output isn't valid CSS in every case):
 * comments, whitespace and leading zeros out, like Lightning CSS's `minify`.
 */
function minify(css: string): string {
  return withoutComments(css)
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>()])\s*/g, "$1")
    .replace(/;}/g, "}")
    .replace(/([^\d.])0\.(\d)/g, "$1.$2")
    .trim()
}

/** Gzipped byte size of `text`, via the browser's `CompressionStream`. */
async function gzipSize(text: string): Promise<number> {
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"))
  return (await new Response(stream).arrayBuffer()).byteLength
}
