import { describe, expect, it, onTestFinished } from "vitest"

import { UI } from "$/ui/runtime"
import { ThemeSheets } from "$/ui/styles"
import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-button"
import "$/ui/components/ui-checkbox"
import "$/ui/components/ui-flag"
import "$/ui/components/ui-segment"
import "$/ui/components/ui-parts"
import "$/ui/components/ui-input"
import "$/ui/components/ui-menu"
import "$/ui/components/ui-message"
import "$/ui/components/ui-modal"
import "$/ui/components/ui-progress"

/**
 * Shared harness for every theme's cases (theme agents APPEND a `describe("<name>")` below;  don't rewrite).
 * - `ThemeHarness.use(name)`:  apply a theme for this test only (cleared when it finishes).
 * - `ThemeHarness.inner(html, selector)`:  render element markup, wait for it, return the box INSIDE the first
 *   element's shadow root that `selector` matches, and its computed style.  Themes MUST be asserted there:  the
 *   class-grammar half of a sheet only reaches component markup through the shadow root.
 * - `ThemeHarness.page(html, selector)`:  the same for class-grammar markup in the page (static examples).
 * - Import the families a case renders at the top (`import "$/ui/components/ui-<name>"`).
 */
class ThemeHarness {
  /** Apply `name` (`ThemeSheets.apply()`) for the current test;  back to our own look when it finishes. */
  static async use(name: string | undefined) {
    await UI.load()
    await ThemeSheets.apply(name)
    onTestFinished(() => ThemeSheets.apply(undefined))
  }

  /** Render `html`;  the element matching `selector` in the first element's shadow root, and its computed style. */
  static async inner(
    html: string,
    selector: string
  ): Promise<{ host: HTMLElement; box: Element; style: CSSStyleDeclaration }> {
    const host = await ElementFixture.render<HTMLElement>(html)
    const box = host.shadowRoot?.querySelector(selector)
    if (!box) throw new Error(`ThemeHarness.inner: no "${selector}" in <${host.localName}>'s shadow root`)
    return { host, box, style: getComputedStyle(box) }
  }

  /** Render class-grammar `html` in the page;  the element matching `selector` and its computed style. */
  static async page(html: string, selector: string): Promise<{ box: Element; style: CSSStyleDeclaration }> {
    const wrapper = await ElementFixture.render<HTMLElement>(`<div>${html}</div>`)
    const box = wrapper.querySelector(selector)
    if (!box) throw new Error(`ThemeHarness.page: no "${selector}" in the markup`)
    return { box, style: getComputedStyle(box) }
  }
}

describe("ThemeSheets", () => {
  it("lists every sheet in the folder;  names are the Fomantic themes (no classic, no dark)", () => {
    expect(ThemeSheets.sheets).toContain("classic")
    expect(ThemeSheets.sheets).toContain("dark")
    expect(ThemeSheets.names).not.toContain("classic")
    expect(ThemeSheets.names).not.toContain("dark")
    for (const name of ThemeSheets.names) expect(ThemeSheets.sheets).toContain(name)
  })

  it("every sheet is wholly inside @layer ui.theme (bar LAYER_EXCEPTIONS)", async () => {
    // a reset must sit UNDER everything:  `resetcss` in `ui.theme` would beat typography and native.css
    const LAYER_EXCEPTIONS: Readonly<Record<string, string>> = { resetcss: "ui.reset" }
    for (const name of ThemeSheets.sheets) {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(await ThemeSheets.load(name))
      for (const rule of sheet.cssRules) {
        // `@font-face` / `@property` can't live in a layer and are harmless outside one
        if (rule instanceof CSSFontFaceRule || rule instanceof CSSPropertyRule) continue
        expect(rule instanceof CSSLayerBlockRule && rule.name, `${name}.css:  ${rule.cssText.slice(0, 60)}`).toBe(
          LAYER_EXCEPTIONS[name] ?? "ui.theme"
        )
      }
    }
  })

  it("apply() registers classic + the theme on the page and in shadow roots, in that order;  undefined clears", async () => {
    const { host } = await ThemeHarness.inner(`<ui-button>Probe</ui-button>`, ".ui.button")
    const theme = ThemeSheets.names[0]
    if (!theme) return // no Fomantic theme ported yet
    await ThemeHarness.use(theme)
    const base = UI.styles.sheet(ThemeSheets.SLOTS.base)!
    const sheet = UI.styles.sheet(ThemeSheets.SLOTS.theme)!
    expect(document.adoptedStyleSheets).toContain(base)
    expect(document.adoptedStyleSheets).toContain(sheet)
    const adopted = [...host.shadowRoot!.adoptedStyleSheets]
    expect(adopted.indexOf(base)).toBeGreaterThan(-1)
    expect(adopted.indexOf(sheet)).toBeGreaterThan(adopted.indexOf(base))
    // the app stylesheet stays last
    expect(adopted.at(-1)).toBe(UI.styles.appSheet)

    await ThemeSheets.apply(undefined)
    expect(UI.styles.has(ThemeSheets.SLOTS.base)).toBe(false)
    expect(UI.styles.has(ThemeSheets.SLOTS.theme)).toBe(false)
    expect(host.shadowRoot!.adoptedStyleSheets).not.toContain(sheet)
    expect(ThemeSheets.current).toBeUndefined()
  })

  it('apply("classic") is classic alone, and reaches components (Lato, 14px)', async () => {
    const before = (await ThemeHarness.inner(`<ui-button>Probe</ui-button>`, ".ui.button")).style.fontFamily
    await ThemeHarness.use("classic")
    expect(UI.styles.has(ThemeSheets.SLOTS.theme)).toBe(false)
    const { style } = await ThemeHarness.inner(`<ui-button>Probe</ui-button>`, ".ui.button")
    expect(style.fontFamily).toMatch(/^Lato/)
    expect(style.fontFamily).not.toBe(before)
  })

  it("the last apply() wins", async () => {
    const [first, second] = ThemeSheets.names
    if (!first || !second) return
    await UI.load()
    onTestFinished(() => ThemeSheets.apply(undefined))
    await Promise.all([ThemeSheets.apply(first), ThemeSheets.apply(second)])
    expect(ThemeSheets.current).toBe(second)
    expect(UI.styles.sheet(ThemeSheets.SLOTS.theme)!.cssRules.length).toBeGreaterThan(0)
    const text = await ThemeSheets.load(second)
    const probe = new CSSStyleSheet()
    probe.replaceSync(text)
    expect(UI.styles.sheet(ThemeSheets.SLOTS.theme)!.cssRules[0]!.cssText).toBe(probe.cssRules[0]!.cssText)
  })

  it("refuses dark and unknown names", async () => {
    await expect(ThemeSheets.apply("dark")).rejects.toThrow(/isn't a theme/)
    await expect(ThemeSheets.apply("no-such-theme")).rejects.toThrow(/isn't a theme/)
  })
})

////////////////
// ## Themes (one describe per theme;  APPEND yours)
////////////////

describe("github", () => {
  it("button:  gradient, bold, embossed;  primary is GitHub's button blue", async () => {
    await ThemeHarness.use("github")
    const { style } = await ThemeHarness.inner(`<ui-button>Fork</ui-button>`, ".ui.button")
    expect(style.backgroundImage).toContain("linear-gradient")
    expect(style.fontWeight).toBe("700")
    expect(style.textShadow).not.toBe("none")
    const primary = await ThemeHarness.inner(`<ui-button primary>Save</ui-button>`, ".ui.button")
    expect(primary.style.backgroundColor).toContain("0.542")
  })

  it("message:  info gets GitHub's tinted gradient, 15px padding at 13px", async () => {
    await ThemeHarness.use("github")
    const { style } = await ThemeHarness.inner(`<ui-message state="info">Note</ui-message>`, ".ui.message")
    expect(style.backgroundImage).toContain("linear-gradient")
    expect(style.paddingTop).toBe("15px")
  })

  it("menu:  gradient bar, roomy items (1em 1.25em)", async () => {
    await ThemeHarness.use("github")
    const { host, style } = await ThemeHarness.inner(
      `<ui-menu aria-label="Probe"><ui-item href="#">One</ui-item></ui-menu>`,
      ".ui.menu"
    )
    expect(style.backgroundImage).toContain("linear-gradient")
    const item = host.querySelector("ui-item")!.shadowRoot!.querySelector(".item")!
    expect(getComputedStyle(item).paddingInlineStart).toBe(`${13 * 1.25}px`)
  })

  it("input:  inset shadow, GitHub's border", async () => {
    await ThemeHarness.use("github")
    const { style } = await ThemeHarness.inner(`<ui-input aria-label="Probe"></ui-input>`, "input")
    expect(style.boxShadow).toContain("inset")
    expect(style.borderTopColor).toContain("0.845")
  })
})

describe("material", () => {
  it("button:  white with a hairline ring, regular weight, Roboto, 13px", async () => {
    await ThemeHarness.use("material")
    const { style } = await ThemeHarness.inner(`<ui-button>Flat</ui-button>`, ".ui.button")
    expect(style.fontFamily).toMatch(/^Roboto/)
    expect(style.fontWeight).toBe("400")
    expect(style.textTransform).toBe("none")
    expect(style.boxShadow).toContain("inset")
    expect(style.fontSize).toBe("13px")
  })

  it("menu:  a floating card with no dividers", async () => {
    await ThemeHarness.use("material")
    const { style } = await ThemeHarness.inner(
      `<ui-menu aria-label="Probe"><ui-item href="#">One</ui-item></ui-menu>`,
      ".ui.menu"
    )
    expect(style.boxShadow).toContain("6px")
  })

  it("modal:  square corners, no header rule", async () => {
    await ThemeHarness.use("material")
    const { host, style } = await ThemeHarness.inner(`<ui-modal header="Title" content="Body"></ui-modal>`, ".ui.modal")
    expect(style.borderTopLeftRadius).toBe("0px")
    const header = host.shadowRoot!.querySelector(".ui.modal > .header")!
    expect(getComputedStyle(header).borderBottomStyle).toBe("none")
    expect(getComputedStyle(header).fontWeight).toBe("400")
  })

  it("header:  regular weight", async () => {
    await ThemeHarness.use("material")
    const { style } = await ThemeHarness.inner(`<ui-header level="2">Heading</ui-header>`, ".header")
    expect(style.fontWeight).toBe("400")
  })
})

describe("fomantic-classic", () => {
  it("button:  glossy gradient, ring, wider padding (1.5em)", async () => {
    await ThemeHarness.use("fomantic-classic")
    const { style } = await ThemeHarness.inner(`<ui-button>Gloss</ui-button>`, ".ui.button")
    expect(style.backgroundImage).toContain("linear-gradient")
    expect(style.boxShadow).toContain("inset")
    expect(style.paddingInlineStart).toBe(`${14 * 1.5}px`)
  })

  it("progress:  a framed, inset track", async () => {
    await ThemeHarness.use("fomantic-classic")
    const { style } = await ThemeHarness.inner(
      `<ui-progress value="40" aria-label="Probe"></ui-progress>`,
      ".ui.progress"
    )
    expect(style.borderTopWidth).toBe("1px")
    expect(style.boxShadow).toContain("inset")
  })

  it("header:  a block header has a gradient fill and Open Sans", async () => {
    await ThemeHarness.use("fomantic-classic")
    const { style } = await ThemeHarness.inner(`<ui-header block level="3">Block</ui-header>`, ".header")
    expect(style.backgroundImage).toContain("linear-gradient")
    expect(style.fontFamily).toMatch(/^"Open Sans"/)
  })
})

////////////////
// ## T3 themes:  flat, fixed-width, bookish, colored, duo, pulsar, striped, timeline, gmail, instagram
////////////////

/**
 * Helpers for the T3 themes' cases.
 * - Families load by DYNAMIC import (`load()`), so these cases add no line to the shared import block above.
 */
class T3 {
  /** Load every family the T3 cases render.  Cached by the module system after the first call. */
  static load() {
    return Promise.all([
      import("$/ui/components/ui-form"),
      import("$/ui/components/ui-input"),
      import("$/ui/components/ui-parts"),
      import("$/ui/components/ui-checkbox"),
      import("$/ui/components/ui-loader"),
      import("$/ui/components/ui-progress"),
      import("$/ui/components/ui-feed"),
      import("$/ui/components/ui-message"),
      import("$/ui/components/ui-card"),
      import("$/ui/components/ui-modal")
    ])
  }

  /** Apply theme `name` for this test, families loaded. */
  static async use(name: string) {
    await T3.load()
    await ThemeHarness.use(name)
  }

  /**
   * Computed style of `selector` in the shadow root of the `index`th `tag` under `root`.
   * - `pseudo`:  `::before` / `::after`, for the boxes components draw with pseudo-elements.
   */
  static style(root: Element, tag: string, selector: string, pseudo?: string, index = 0): CSSStyleDeclaration {
    const host = root.querySelectorAll(tag)[index]
    const box = host?.shadowRoot?.querySelector(selector)
    if (!box) throw new Error(`T3.style: no "${selector}" in <${tag}> #${index}'s shadow root`)
    return getComputedStyle(box, pseudo)
  }

  /** A colour token as the page computes it, to compare with a computed colour inside a shadow root. */
  static color(token: string): string {
    const probe = document.createElement("span")
    probe.style.color = `var(${token})`
    document.body.append(probe)
    onTestFinished(() => probe.remove())
    return getComputedStyle(probe).color
  }
}

describe("flat", () => {
  it("Open Sans everywhere;  ink on green buttons", async () => {
    await T3.use("flat")
    const { style } = await ThemeHarness.inner(`<ui-button>Probe</ui-button>`, ".ui.button")
    expect(style.fontFamily).toMatch(/^"Open Sans"/)
    const green = await ThemeHarness.inner(`<ui-button color="green">Go</ui-button>`, ".ui.button")
    expect(green.style.color).not.toBe("rgb(255, 255, 255)")
  })

  it("a form's inputs are underlined, square and transparent;  its labels uppercase;  a lone input keeps its box", async () => {
    await T3.use("flat")
    const root = await ElementFixture.render(
      `<div><ui-form><ui-field><label>Name</label><ui-input></ui-input></ui-field></ui-form><ui-input></ui-input></div>`
    )
    const inForm = T3.style(root, "ui-input", "input")
    expect(inForm.borderTopWidth).toBe("0px")
    expect(inForm.borderBottomWidth).toBe("1px")
    expect(inForm.borderBottomLeftRadius).toBe("0px")
    expect(inForm.backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(root.querySelector("label")!).textTransform).toBe("uppercase")
    const lone = T3.style(root, "ui-input", "input", undefined, 1)
    expect(lone.borderTopWidth).toBe("1px")
    expect(lone.borderBottomLeftRadius).toBe("4px")
  })
})

describe("fixed-width", () => {
  it("narrower modals on a computer screen;  a small modal is 0.6 of it", async () => {
    const { page } = await import("vitest/browser")
    const [width, height] = [window.innerWidth, window.innerHeight]
    onTestFinished(() => page.viewport(width, height))
    await page.viewport(1000, 800)
    await T3.use("fixed-width")
    const root = await ElementFixture.render(
      `<div><ui-modal header="A"></ui-modal><ui-modal size="small" header="B"></ui-modal></div>`
    )
    expect(T3.style(root, "ui-modal", ".ui.modal").width).toBe("700px")
    expect(T3.style(root, "ui-modal", ".ui.modal", undefined, 1).width).toBe("420px")
  })
})

describe("bookish", () => {
  it("Karma headers at normal weight;  a page h1 bold, at 1.75 x the base", async () => {
    await T3.use("bookish")
    const { style } = await ThemeHarness.inner(`<ui-header>Chapter</ui-header>`, ".ui.header")
    expect(style.fontFamily).toMatch(/^Karma/)
    expect(style.fontWeight).toBe("400")
    const h1 = await ThemeHarness.inner(`<ui-header level="1">Book</ui-header>`, "h1.ui.header")
    expect(h1.style.fontWeight).toBe("700")
    expect(h1.style.fontSize).toBe("24.5px")
    // the bundled font loads:  its `url()` survived inlining
    expect((await document.fonts.load("16px Karma")).length).toBeGreaterThan(0)
  })
})

describe("colored", () => {
  it("a chosen checkbox fills with the primary colour;  a chosen radio keeps a white box, primary bullet", async () => {
    await T3.use("colored")
    const primary = T3.color("--ui-primary")
    const root = await ElementFixture.render(
      `<div><ui-checkbox selected label="Box"></ui-checkbox>` + `<ui-radio selected label="Radio"></ui-radio></div>`
    )
    const box = T3.style(root, "ui-checkbox", "label", "::before")
    expect(box.backgroundColor).toBe(primary)
    expect(box.transitionDuration).toMatch(/^0s(, 0s)*$/)
    expect(T3.style(root, "ui-radio", "label", "::after").backgroundColor).toBe(primary)
    expect(T3.style(root, "ui-radio", "label", "::before").backgroundColor).toBe(T3.color("--ui-surface"))
  })
})

describe("duo", () => {
  it("the arc is a primary + secondary ring;  a coloured loader keeps its one-colour arc", async () => {
    await T3.use("duo")
    const root = await ElementFixture.render(
      `<div><ui-loader active></ui-loader><ui-loader active color="red"></ui-loader></div>`
    )
    const arc = T3.style(root, "ui-loader", ".ui.loader", "::after")
    expect(arc.borderTopColor).toBe(T3.color("--ui-primary"))
    expect(arc.borderBottomColor).toBe(T3.color("--ui-secondary"))
    expect(T3.style(root, "ui-loader", ".ui.loader", "::after", 1).borderBottomColor).toBe("rgba(0, 0, 0, 0)")
  })
})

describe("pulsar", () => {
  it("a primary arc on the pulsar animation, 2s a cycle", async () => {
    await T3.use("pulsar")
    const { box } = await ThemeHarness.inner(`<ui-loader active></ui-loader>`, ".ui.loader")
    const arc = getComputedStyle(box, "::after")
    expect(arc.animationName).toBe("ui-theme-pulsar")
    expect(arc.animationDuration).toBe("2s")
    expect(arc.borderTopColor).toBe(T3.color("--ui-primary"))
  })
})

describe("striped", () => {
  it("bars carry stripes, which march while active", async () => {
    await T3.use("striped")
    const { style } = await ThemeHarness.inner(`<ui-progress value="50" active></ui-progress>`, ".bar")
    expect(style.backgroundImage).toMatch(/^linear-gradient/)
    expect(style.animationName).toBe("ui-theme-striped")
  })
})

describe("timeline", () => {
  it("a line down the labels (none after the last), round badges on it, meta as raised boxes", async () => {
    await T3.use("timeline")
    const root = await ElementFixture.render(
      `<ui-feed><ui-event icon="pencil"><ui-content><ui-summary>One</ui-summary><ui-meta>Meta</ui-meta></ui-content>` +
        `</ui-event><ui-event icon="user"><ui-content><ui-summary>Two</ui-summary></ui-content></ui-event></ui-feed>`
    )
    expect(T3.style(root, "ui-event", ".label").borderLeftWidth).toBe("3px")
    expect(T3.style(root, "ui-event", ".label", undefined, 1).borderLeftColor).toBe("rgba(0, 0, 0, 0)")
    const badge = T3.style(root, "ui-event", ".label > .icon")
    expect(badge.borderRadius).toBe("50%")
    expect(badge.width).toBe("42px")
    const meta = T3.style(root, "ui-meta", ".meta")
    expect(meta.display).toBe("inline-block")
    expect(meta.borderTopWidth).toBe("1px")
  })
})

describe("gmail", () => {
  it("compact grey messages;  warnings in Gmail's yellow", async () => {
    await T3.use("gmail")
    const root = await ElementFixture.render(
      `<div><ui-message>Hi</ui-message><ui-message state="warning">Careful</ui-message></div>`
    )
    const message = T3.style(root, "ui-message", ".ui.message")
    expect(message.paddingTop).toBe("7px")
    expect(message.backgroundColor).toBe("oklch(0.964 0 0)")
    expect(T3.style(root, "ui-message", ".ui.message", undefined, 1).backgroundColor).toBe("oklch(0.944 0.062 95.4)")
  })
})

describe("instagram", () => {
  it("Montserrat cards, a flat ring, no drop shadow", async () => {
    await T3.use("instagram")
    const { style } = await ThemeHarness.inner(`<ui-card><ui-content>Post</ui-content></ui-card>`, ".ui.card")
    expect(style.fontFamily).toMatch(/^Montserrat/)
    expect(style.boxShadow).not.toMatch(/1px 3px/)
    expect((await document.fonts.load("16px Montserrat")).length).toBeGreaterThan(0)
  })
})

describe("famfamfam", () => {
  it("draws a flag from the sprite, by its code class, inside the shadow root", async () => {
    await ThemeHarness.use("famfamfam")
    const { box, style } = await ThemeHarness.inner(`<ui-flag country="france"></ui-flag>`, ".ui.flag")
    expect(box.classList.contains("fr")).toBe(true)
    expect(style.backgroundImage).toMatch(/flags\.png/)
    expect(style.backgroundPosition).toBe("0px -1976px")
    expect(style.width).toBe("16px")
    expect(style.height).toBe("11px")
  })

  it("keeps the emoji for a flag the sprite lacks", async () => {
    await ThemeHarness.use("famfamfam")
    const { style } = await ThemeHarness.inner(`<ui-flag country="pirate"></ui-flag>`, ".ui.flag")
    expect(style.backgroundImage).toBe("none")
  })
})

describe("systemfont", () => {
  it("swaps Lato for the system stack and bold for 600, in shadow roots and the page", async () => {
    await ThemeHarness.use("systemfont")
    const { style } = await ThemeHarness.inner(`<ui-button>Probe</ui-button>`, ".ui.button")
    expect(style.fontFamily).toMatch(/^system-ui/)
    expect(style.getPropertyValue("--ui-font-weight-bold").trim()).toBe("600")
    const { style: strong } = await ThemeHarness.page(`<strong>Bold</strong>`, "strong")
    expect(strong.fontWeight).toBe("600")
  })
})

describe("resetcss", () => {
  it("resets the page's markup, never a component's own", async () => {
    await ThemeHarness.use("resetcss")
    const { style: list } = await ThemeHarness.page(`<ul><li>One</li></ul>`, "ul")
    expect(list.listStyleType).toBe("none")
    expect(list.paddingInlineStart).toBe("0px")
    // the segment's root is a `<div>`, which the reset lists:  its own padding survives
    const { style } = await ThemeHarness.inner(`<ui-segment>Probe</ui-segment>`, ".ui.segment")
    expect(style.paddingTop).not.toBe("0px")
  })
})

describe("rtl", () => {
  it("turns the page and every shadow root right-to-left, in the Arabic stack", async () => {
    await ThemeHarness.use("rtl")
    expect(getComputedStyle(document.documentElement).direction).toBe("rtl")
    const { style } = await ThemeHarness.inner(`<ui-button>Probe</ui-button>`, ".ui.button")
    expect(style.direction).toBe("rtl")
    expect(style.fontFamily).toMatch(/^"Noto Kufi Arabic"/)
  })

  it("an invisible checkbox's native input goes off the START edge, so it adds no scroll", async () => {
    await ThemeHarness.use("rtl")
    const { box } = await ThemeHarness.inner(`<ui-checkbox invisible label="Probe"></ui-checkbox>`, "input")
    expect(box.getBoundingClientRect().left).toBeGreaterThan(window.innerWidth)
  })
})

////////////////
// ## T2 themes:  chubby, basic, bootstrap3, amazon, raised, round, twitter
////////////////

/**
 * Helpers for the T2 themes' cases.
 * - Families load by DYNAMIC import (`load()`), so these cases add no line to the shared import block above.
 */
class T2 {
  /** Load every family the T2 cases render.  Cached by the module system after the first call. */
  static load() {
    return Promise.all([
      import("$/ui/components/ui-accordion"),
      import("$/ui/components/ui-card"),
      import("$/ui/components/ui-comment"),
      import("$/ui/components/ui-form"),
      import("$/ui/components/ui-step"),
      import("$/ui/components/ui-table")
    ])
  }

  /** Apply theme `name` for this test, families loaded. */
  static async use(name: string) {
    await T2.load()
    await ThemeHarness.use(name)
  }

  /** Computed style of `selector` in the shadow root of the `index`th `tag` under `root` (`pseudo`:  `::after` ...). */
  static style(root: Element, tag: string, selector: string, pseudo?: string, index = 0): CSSStyleDeclaration {
    const host = root.querySelectorAll(tag)[index]
    const box = host?.shadowRoot?.querySelector(selector)
    if (!box) throw new Error(`T2.style: no "${selector}" in <${tag}> #${index}'s shadow root`)
    return getComputedStyle(box, pseudo)
  }

  /** A colour token as the page computes it, to compare with a computed colour inside a shadow root. */
  static color(token: string): string {
    const probe = document.createElement("span")
    probe.style.color = `var(${token})`
    document.body.append(probe)
    onTestFinished(() => probe.remove())
    return getComputedStyle(probe).color
  }
}

describe("chubby", () => {
  it("button:  Source Sans Pro, regular weight, 2.5em padding at 0.92 of the em;  basic ones (and a basic group's) bold uppercase", async () => {
    await T2.use("chubby")
    const { style } = await ThemeHarness.inner(`<ui-button>Chubby</ui-button>`, ".ui.button")
    expect(style.fontFamily).toMatch(/^"Source Sans Pro"/)
    expect(style.fontWeight).toBe("400")
    expect(style.fontSize).toBe(`${14 * 0.92}px`)
    expect(parseFloat(style.paddingInlineStart)).toBeCloseTo(14 * 0.92 * 2.5, 1)
    expect(style.backgroundColor).toBe("oklch(0.935 0.006 239.8)")
    const basic = await ThemeHarness.inner(`<ui-button basic>Basic</ui-button>`, ".ui.button")
    expect(basic.style.textTransform).toBe("uppercase")
    expect(basic.style.fontWeight).toBe("700")
    const group = await ElementFixture.render(`<ui-buttons basic><ui-button>One</ui-button></ui-buttons>`)
    expect(T2.style(group, "ui-button", ".ui.button").textTransform).toBe("uppercase")
  })

  it("header:  Source Sans Pro, a page h1 at 1.33 x the base", async () => {
    await T2.use("chubby")
    const { style } = await ThemeHarness.inner(`<ui-header level="1">Title</ui-header>`, "h1.ui.header")
    expect(style.fontFamily).toMatch(/^"Source Sans Pro"/)
    expect(parseFloat(style.fontSize)).toBeCloseTo(14 * 1.33, 1)
  })

  it("menu:  bold, roomy items;  the active one in the primary colour;  no shadow", async () => {
    await T2.use("chubby")
    const { host, style } = await ThemeHarness.inner(
      `<ui-menu aria-label="Probe"><ui-item href="#">One</ui-item><ui-item href="#" active>Two</ui-item></ui-menu>`,
      ".ui.menu"
    )
    expect(style.boxShadow).toBe("none")
    const [item, active] = [...host.querySelectorAll("ui-item")].map((el) =>
      getComputedStyle(el.shadowRoot!.querySelector(".item")!)
    )
    expect(item!.paddingTop).toBe(`${14 * 1.25}px`)
    expect(item!.fontWeight).toBe("700")
    expect(active!.backgroundColor).toBe(T2.color("--ui-primary"))
  })

  it("styled accordion:  1.25em titles, the open one in the primary text colour", async () => {
    await T2.use("chubby")
    const { box } = await ThemeHarness.inner(
      `<ui-accordion styled open="0"><ui-title>One</ui-title><ui-content>Body</ui-content></ui-accordion>`,
      ".title"
    )
    const title = getComputedStyle(box)
    expect(parseFloat(title.paddingTop)).toBeCloseTo(parseFloat(title.fontSize) * 1.25, 1)
    expect(title.color).toBe(T2.color("--ui-primary-text"))
  })

  it("comment:  a rounded, raised card;  a reply in its thread is flat", async () => {
    await T2.use("chubby")
    const root = await ElementFixture.render(
      `<ui-comments><ui-comment><ui-content><ui-author>A</ui-author></ui-content>` +
        `<ui-comments><ui-comment><ui-content><ui-author>B</ui-author></ui-content></ui-comment></ui-comments>` +
        `</ui-comment></ui-comments>`
    )
    const outer = T2.style(root, "ui-comment", ".comment")
    expect(outer.borderTopLeftRadius).toBe("7px")
    expect(outer.boxShadow).not.toBe("none")
    expect(T2.style(root, "ui-comment", ".comment", undefined, 1).boxShadow).toBe("none")
  })

  it("form:  uppercase labels, 2px input borders", async () => {
    await T2.use("chubby")
    const root = await ElementFixture.render(
      `<ui-form><ui-field><label>Name</label><ui-input aria-label="Name"></ui-input></ui-field></ui-form>`
    )
    expect(getComputedStyle(root.querySelector("label")!).textTransform).toBe("uppercase")
    expect(T2.style(root, "ui-input", "input").borderTopWidth).toBe("2px")
  })
})

describe("basic", () => {
  it("button:  flat grey, no ring;  primary is #333", async () => {
    await T2.use("basic")
    const { style } = await ThemeHarness.inner(`<ui-button>Plain</ui-button>`, ".ui.button")
    expect(style.backgroundColor).toBe("oklch(0.949 0 0)")
    expect(style.fontSize).toBe(`${14 * 0.92}px`)
    const primary = await ThemeHarness.inner(`<ui-button primary>Go</ui-button>`, ".ui.button")
    expect(primary.style.backgroundColor).toBe("oklch(0.321 0 0)")
  })

  it("step:  transparent pills, no arrows", async () => {
    await T2.use("basic")
    const root = await ElementFixture.render(
      `<ui-steps><ui-step header="One"></ui-step><ui-step header="Two"></ui-step></ui-steps>`
    )
    const step = T2.style(root, "ui-step", ".step")
    expect(step.backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(step.borderTopLeftRadius).toBe("9999px")
    expect(T2.style(root, "ui-step", ".step", "::after").display).toBe("none")
  })

  it("progress:  no track, a regular-weight label;  card:  no box", async () => {
    await T2.use("basic")
    const { box, style } = await ThemeHarness.inner(
      `<ui-progress value="40" aria-label="Probe">Uploading</ui-progress>`,
      ".ui.progress"
    )
    expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0)")
    expect(getComputedStyle(box.querySelector(".label")!).fontWeight).toBe("400")
    const card = await ThemeHarness.inner(`<ui-card><ui-content>Post</ui-content></ui-card>`, ".ui.card")
    expect(card.style.boxShadow).toBe("none")
    expect(card.style.backgroundColor).toBe("rgba(0, 0, 0, 0)")
  })
})

describe("bootstrap3", () => {
  it("button:  Helvetica, a hairline ring, 1.42857 line height;  primary is Bootstrap's blue", async () => {
    await T2.use("bootstrap3")
    const { style } = await ThemeHarness.inner(`<ui-button>Default</ui-button>`, ".ui.button")
    expect(style.fontFamily).toMatch(/^"Helvetica Neue"/)
    expect(style.boxShadow).toContain("inset")
    expect(parseFloat(style.lineHeight)).toBeCloseTo(14 * 1.42857, 1)
    const primary = await ThemeHarness.inner(`<ui-button primary>Go</ui-button>`, ".ui.button")
    expect(primary.style.backgroundColor).toBe("oklch(0.564 0.118 247.7)")
  })

  it("group:  members overlap by 1px", async () => {
    await T2.use("bootstrap3")
    const root = await ElementFixture.render(
      `<ui-buttons><ui-button>A</ui-button><ui-button>B</ui-button></ui-buttons>`
    )
    expect(T2.style(root, "ui-button", ".ui.button", undefined, 1).marginLeft).toBe("-1px")
  })
})

describe("amazon", () => {
  it("globals:  13px Arial, amazon's link blue", async () => {
    await T2.use("amazon")
    const { style } = await ThemeHarness.inner(`<ui-menu aria-label="Probe"></ui-menu>`, ".ui.menu")
    expect(style.fontFamily).toMatch(/^Arial/)
    expect(getComputedStyle(document.documentElement).getPropertyValue("--ui-font-size").trim()).toBe("13px")
    expect(T2.color("--ui-link")).toBe("oklch(0.513 0.162 253.7)")
  })

  it("button:  gradient and ring;  the orange primary has near-black text and a real border;  a dark inset labeled icon", async () => {
    await T2.use("amazon")
    const { style } = await ThemeHarness.inner(`<ui-button>Add</ui-button>`, ".ui.button")
    expect(style.backgroundImage).toContain("linear-gradient")
    expect(style.boxShadow).toContain("inset")
    expect(style.fontSize).toBe("13px")
    const primary = await ThemeHarness.inner(`<ui-button primary>Buy</ui-button>`, ".ui.button")
    expect(primary.style.backgroundColor).toBe("oklch(0.86 0.128 87.9)")
    expect(primary.style.color).toBe("oklch(0.178 0 0)")
    expect(primary.style.borderTopWidth).toBe("1px")
    const labeled = await ThemeHarness.inner(`<ui-button labeled icon="plus">Add</ui-button>`, ".ui.button > .icon")
    expect(labeled.style.backgroundColor).toBe("oklch(0.344 0.02 248.4)")
    expect(labeled.style.width).toBe("26px")
  })
})

describe("raised", () => {
  it("button:  a 0.3em bottom edge;  basic buttons keep their flat hairline", async () => {
    await T2.use("raised")
    const { style } = await ThemeHarness.inner(`<ui-button>Raised</ui-button>`, ".ui.button")
    expect(style.boxShadow).toMatch(/-4\.2px/)
    expect(style.backgroundImage).toContain("linear-gradient")
    expect(parseFloat(style.borderTopLeftRadius)).toBeCloseTo(14 * 0.4, 2)
    const basic = await ThemeHarness.inner(`<ui-button basic>Flat</ui-button>`, ".ui.button")
    expect(basic.style.boxShadow).not.toMatch(/-4\.2px/)
    expect(basic.style.backgroundImage).toBe("none")
  })
})

describe("round", () => {
  it("button:  white pills, uppercase, a 2px ring;  coloured ones drop the ring", async () => {
    await T2.use("round")
    const { style } = await ThemeHarness.inner(`<ui-button>Round</ui-button>`, ".ui.button")
    expect(style.borderTopLeftRadius).toBe("9999px")
    expect(style.textTransform).toBe("uppercase")
    expect(style.boxShadow).toMatch(/0px 0px 0px 2px inset/)
    expect(style.backgroundColor).toBe("oklch(1 0 0)")
    const red = await ThemeHarness.inner(`<ui-button color="red">Stop</ui-button>`, ".ui.button")
    expect(red.style.boxShadow).not.toMatch(/2px inset/)
    expect(red.style.backgroundImage).toContain("linear-gradient")
  })
})

describe("twitter", () => {
  it("button:  a white-to-grey gradient, bold;  primary is Twitter's blue with a darker hairline", async () => {
    await T2.use("twitter")
    const { style } = await ThemeHarness.inner(`<ui-button>Follow</ui-button>`, ".ui.button")
    expect(style.backgroundImage).toContain("linear-gradient")
    expect(style.fontWeight).toBe("700")
    expect(style.fontFamily).toMatch(/^"Helvetica Neue"/)
    const primary = await ThemeHarness.inner(`<ui-button primary>Tweet</ui-button>`, ".ui.button")
    expect(primary.style.backgroundColor).toBe("oklch(0.719 0.128 243.9)")
    expect(primary.style.boxShadow).toContain("0.605")
  })
})
