import { onTestFinished } from "vite-plus/test"

import { ClassBuilder } from "$/ui/elements"
import type { AttributeSpec, ComponentVocabulary } from "$/ui/vocabulary"

import { Fixture } from "./Fixture"

/**
 * Helpers for component CSS tests (`UI<Name>.css.test.ts`):  adopt sheets for one test, walk a sheet's rules,
 * stand in shadow hosts, and check a sheet covers every class word a vocabulary can emit.
 * - Static-only:  there's one document per test run.
 * - Adoption is per test:  sheets are removed again when the test finishes, so tests never leak styles.
 */
export class Sheets {
  ////////////////
  // ## Adoption
  ////////////////

  /**
   * Adopt `css` into the document for the current test.
   * - SIDE EFFECT:  appended to `document.adoptedStyleSheets`, removed when the test finishes.
   * - MUST be called inside a test.
   */
  static adopt(css: readonly string[]) {
    const sheets = Sheets.from(css)
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, ...sheets]
    onTestFinished(() => {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter((sheet) => !sheets.includes(sheet))
    })
  }

  /** Constructable sheets from CSS text. */
  static from(css: readonly string[]): CSSStyleSheet[] {
    return css.map((text) => {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(text)
      return sheet
    })
  }

  /**
   * A fixture `<span>` host whose open shadow root adopts `css` and holds `html`.
   * - Stands in for a component element before its class exists.
   */
  static host(html: string, css: readonly string[]): HTMLElement {
    const host = Fixture.render(`<span></span>`)
    Sheets.attach(host, html, css)
    return host
  }

  /** Attach an open shadow root to `host` adopting `css`, holding `html`;  returns the shadow root. */
  static attach(host: Element, html: string, css: readonly string[]): ShadowRoot {
    const root = host.attachShadow({ mode: "open" })
    root.adoptedStyleSheets = Sheets.from(css)
    root.innerHTML = html
    return root
  }

  /** First element of `host`'s shadow root. */
  static inner<T extends Element = HTMLElement>(host: Element): T {
    return host.shadowRoot!.firstElementChild as T
  }

  ////////////////
  // ## Source
  ////////////////

  /** Every `CSSStyleRule` in `sheet`, including those nested in `@layer` / `@media` / `@container`. */
  static rules(sheet: CSSStyleSheet | CSSGroupingRule): CSSStyleRule[] {
    const rules: CSSStyleRule[] = []
    for (const rule of sheet.cssRules) {
      if (rule instanceof CSSStyleRule) rules.push(rule)
      if (rule instanceof CSSGroupingRule) rules.push(...Sheets.rules(rule))
    }
    return rules
  }

  /** Selectors of every style rule in `css`, parsed with `replaceSync`. */
  static selectors(css: string): string[] {
    return Sheets.rules(Sheets.from([css])[0]!).map((rule) => rule.selectorText)
  }

  /** `css` without comments. */
  static withoutComments(css: string): string {
    return css.replace(/\/\*[\s\S]*?\*\//g, "")
  }

  /** `@layer` statement a component sheet `name` declares first. */
  static layers(name: string): string {
    const prefix = `ui.components.${name}`
    return `@layer ${prefix}.types, ${prefix}.content, ${prefix}.variations, ${prefix}.states;`
  }

  ////////////////
  // ## Vocabulary coverage
  ////////////////

  /**
   * Class phrases `vocabulary` can emit for class-bearing attributes, one attribute at a time.
   * - `equal` is probed only for a `width` whose spec sets `canEqual`.
   * - `size` / `color` are left out:  `sizes.css` / `colors.css` own those remaps.  `valueOnly` too (it was `color`
   *   until 2026-09-30, and states such as `error` are `colors.css` remaps).
   */
  static classPhrases(vocabulary: ComponentVocabulary): string[] {
    const builder = new ClassBuilder(vocabulary)
    const skip = new Set(["ui", vocabulary.noun])
    const phrases = new Set<string>()
    for (const spec of vocabulary.attributes) {
      if (spec.kind === "size" || spec.kind === "color" || spec.kind === "valueOnly") continue
      const values: (string | true)[] =
        spec.kind === "keyOnly"
          ? [true]
          : spec.kind === "keyOrValueAndKey"
            ? [true, ...Sheets.valuesOf(spec)]
            : Sheets.valuesOf(spec)
      if (spec.kind === "width" && spec.canEqual) values.push("equal")
      for (const value of values) {
        const text = builder.build({ [spec.name]: value })
        const phrase = text
          .split(" ")
          .filter((word) => !skip.has(word))
          .join(" ")
        if (phrase) phrases.add(phrase)
      }
    }
    return [...phrases]
  }

  /** `css` styles `phrase`:  as a `[class*="..."]` phrase, or every word as a class selector. */
  static covers(css: string, phrase: string): boolean {
    if (css.includes(`[class*="${phrase}"]`)) return true
    return phrase.split(" ").every((word) => new RegExp(`\\.${word}(?![\\w-])`).test(css))
  }

  /** Inline values of a spec, or a sample of a shared set. */
  private static valuesOf(spec: AttributeSpec): string[] {
    const { values } = spec
    if (!values) return []
    if (typeof values !== "string") return [...values]
    return SAMPLES[values] ?? []
  }
}

/** A few values of each shared set, enough to exercise every class phrase. */
const SAMPLES: Readonly<Record<string, string[]>> = {
  widths: ["2", "3", "12"],
  floats: ["left", "right"],
  alignments: ["left", "center", "right", "justified"],
  verticalAlignments: ["top", "middle", "bottom"],
  attachments: ["top", "bottom", "left", "right", "top left", "top right", "bottom left", "bottom right"]
}
