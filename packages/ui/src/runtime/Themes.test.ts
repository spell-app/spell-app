import { describe, expect, onTestFinished, test } from "vite-plus/test"

import { UI } from "$/ui/runtime"
import { ThemeHarness } from "$/ui/test/ThemeHarness"

import "$/ui/components/ui-button"

////////////////
// ## The sheets
////////////////

describe("UI.themes.sheets / names", () => {
  test("lists every sheet in the folder;  names are the Fomantic themes (no classic, no dark)", async () => {
    await UI.load()
    expect(UI.themes.sheets).toContain("classic")
    expect(UI.themes.sheets).toContain("dark")
    expect(UI.themes.names).not.toContain("classic")
    expect(UI.themes.names).not.toContain("dark")
    for (const name of UI.themes.names) expect(UI.themes.sheets).toContain(name)
  })
})

describe("UI.themes.load()", () => {
  test("every sheet is wholly inside @layer ui.theme (bar LAYER_EXCEPTIONS)", async () => {
    await UI.load()
    // a reset must sit UNDER everything:  `resetcss` in `ui.theme` would beat typography and native.css
    const LAYER_EXCEPTIONS: Readonly<Record<string, string>> = { resetcss: "ui.reset" }
    for (const name of UI.themes.sheets) {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(await UI.themes.load(name))
      for (const rule of sheet.cssRules) {
        // `@font-face` / `@property` can't live in a layer and are harmless outside one
        if (rule instanceof CSSFontFaceRule || rule instanceof CSSPropertyRule) continue
        expect(rule instanceof CSSLayerBlockRule && rule.name, `${name}.css:  ${rule.cssText.slice(0, 60)}`).toBe(
          LAYER_EXCEPTIONS[name] ?? "ui.theme"
        )
      }
    }
  })
})

////////////////
// ## Applying
////////////////

describe("UI.themes.apply()", () => {
  test("registers classic + the theme on the page and in shadow roots, in that order;  undefined clears", async () => {
    const { host } = await ThemeHarness.inner(`<ui-button>Probe</ui-button>`, ".ui.button")
    const theme = UI.themes.names[0]
    if (!theme) return // no Fomantic theme ported yet
    await ThemeHarness.use(theme)
    const base = UI.styles.sheet(UI.themes.slots.base)!
    const sheet = UI.styles.sheet(UI.themes.slots.theme)!
    expect(document.adoptedStyleSheets).toContain(base)
    expect(document.adoptedStyleSheets).toContain(sheet)
    const adopted = [...host.shadowRoot!.adoptedStyleSheets]
    expect(adopted.indexOf(base)).toBeGreaterThan(-1)
    expect(adopted.indexOf(sheet)).toBeGreaterThan(adopted.indexOf(base))
    // the app stylesheet stays last
    expect(adopted.at(-1)).toBe(UI.styles.appSheet)

    await UI.themes.apply(undefined)
    expect(UI.styles.has(UI.themes.slots.base)).toBe(false)
    expect(UI.styles.has(UI.themes.slots.theme)).toBe(false)
    expect(host.shadowRoot!.adoptedStyleSheets).not.toContain(sheet)
    expect(UI.themes.current).toBeUndefined()
  })

  test('apply("classic") is classic alone, and reaches components (Lato, 14px)', async () => {
    const before = (await ThemeHarness.inner(`<ui-button>Probe</ui-button>`, ".ui.button")).style.fontFamily
    await ThemeHarness.use("classic")
    expect(UI.styles.has(UI.themes.slots.theme)).toBe(false)
    const { style } = await ThemeHarness.inner(`<ui-button>Probe</ui-button>`, ".ui.button")
    expect(style.fontFamily).toMatch(/^Lato/)
    expect(style.fontFamily).not.toBe(before)
  })

  test("the last apply() wins", async () => {
    await UI.load()
    const [first, second] = UI.themes.names
    if (!first || !second) return
    onTestFinished(() => UI.themes.apply(undefined))
    await Promise.all([UI.themes.apply(first), UI.themes.apply(second)])
    expect(UI.themes.current).toBe(second)
    expect(UI.styles.sheet(UI.themes.slots.theme)!.cssRules.length).toBeGreaterThan(0)
    const text = await UI.themes.load(second)
    const probe = new CSSStyleSheet()
    probe.replaceSync(text)
    expect(UI.styles.sheet(UI.themes.slots.theme)!.cssRules[0]!.cssText).toBe(probe.cssRules[0]!.cssText)
  })

  test("refuses dark and unknown names", async () => {
    await UI.load()
    await expect(UI.themes.apply("dark")).rejects.toThrow(/isn't a theme/)
    await expect(UI.themes.apply("no-such-theme")).rejects.toThrow(/isn't a theme/)
  })
})
