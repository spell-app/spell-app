import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { expectAccessible } from "$/ui/test/a11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { UI } from "$/ui/runtime"
import { ThemeSheets } from "$/ui/styles"
import { SiteData } from "$/ui/docs-components/SiteData"
import { ThemePreference } from "$/ui/docs-components/ThemePreference"
import {
  DOCS_DEFAULT_THEME,
  DOCS_LOOK_KEYS,
  DOCS_PLAIN_THEME,
  DOCS_SCHEME_SWITCHING,
  type SiteDataFile
} from "$/ui/docs-components/docs-components.types"

import { ThemeMenu } from "./ThemeMenu"
import { DEFAULT_VALUE, SPELL, type DocsThemesChange } from "./ui-docs-themes.types"

import "$/ui/docs-components/ui-docs-themes"

/** The committed site data, served by Vite. */
const REAL_DATA = Object.values(
  import.meta.glob<string>("/site/_data/components.json", { query: "?url", import: "default", eager: true })
)[0]!

/** Element-markup examples, by path. */
const EXAMPLES = import.meta.glob<string>("/src/docs-components/ui-docs-themes/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Render `html` and wait for it, and for the site data to reach its menu. */
async function render(html: string) {
  const host = await ElementFixture.render<HTMLElement>(html)
  await SiteData.load()
  await ElementFixture.settle()
  return host
}

/** `host`'s inner theme dropdown. */
function dropdownOf(host: Element) {
  return host.shadowRoot!.querySelector<HTMLElement>("[part~=theme]")!
}

/** `host`'s inner scheme button for `scheme`. */
function schemeButton(host: Element, scheme: string) {
  return host.shadowRoot!.querySelector<HTMLElement>(`[part~=${scheme}]`)!
}

/** The dropdown's option rows:  `[value, text]`. */
function rows(host: Element): [string, string][] {
  return [...dropdownOf(host).querySelectorAll("ui-item:not([type])")].map((item) => [
    item.getAttribute("value")!,
    item.textContent!.trim()
  ])
}

/** The dropdown's text (its `trigger` slot). */
function labelOf(host: Element) {
  return dropdownOf(host).querySelector("[slot=trigger]")!.textContent
}

/** Pick `value` in `host`'s dropdown, as the dropdown reports a viewer's choice. */
function pick(host: Element, value: string) {
  dropdownOf(host).dispatchEvent(new CustomEvent("ui-change", { detail: { value }, bubbles: true, composed: true }))
}

/** Run `ThemePreference.HEAD_SCRIPT` as a page's inline `<head>` script:  an inline classic script runs on insert. */
function runHeadScript() {
  const script = document.createElement("script")
  script.textContent = ThemePreference.HEAD_SCRIPT
  document.head.append(script)
  script.remove()
}

/** Back to no stored look (so the default theme, in memory), nothing applied, the system scheme. */
async function clean() {
  localStorage.removeItem(DOCS_LOOK_KEYS.theme)
  localStorage.removeItem(DOCS_LOOK_KEYS.scheme)
  ThemePreference.reset()
  ThemePreference.applyScheme("system")
  await ThemeSheets.apply(undefined)
}

beforeEach(async () => {
  SiteData.reset(REAL_DATA)
  await UI.load()
  await clean()
})
afterEach(clean)

describe("<ui-docs-themes> markup", () => {
  it("renders the theme dropdown and the light / dark / system buttons", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    const controls = host.shadowRoot!.querySelector("[part~=controls]")!
    expect(controls.className).toBe("ui themes")
    expect(dropdownOf(host).localName).toBe("ui-dropdown")
    const group = host.shadowRoot!.querySelector("[part~=scheme]")!
    expect(group.localName).toBe("ui-buttons")
    expect([...group.querySelectorAll("ui-button")].map((button) => button.getAttribute("icon"))).toEqual([
      "sun",
      "moon",
      "desktop"
    ])
    expect(schemeButton(host, "system").hasAttribute("active")).toBe(true)
    expect(labelOf(host)).toBe("Spell theme")
    await expectAccessible(host)
  })

  it.each([
    ["theme", true, false],
    ["scheme", false, true]
  ])("show=%s", async (show, dropdown, buttons) => {
    const host = await render(`<ui-docs-themes show="${show}"></ui-docs-themes>`)
    expect(!!host.shadowRoot!.querySelector("[part~=theme]")).toBe(dropdown)
    expect(!!host.shadowRoot!.querySelector("[part~=scheme]")).toBe(buttons)
  })

  it("passes size and inverted on to the widgets", async () => {
    const host = await render(`<ui-docs-themes size="small" inverted></ui-docs-themes>`)
    expect(host.shadowRoot!.querySelector("[part~=controls]")!.className).toBe("ui small inverted themes")
    expect(dropdownOf(host).getAttribute("size")).toBe("small")
    expect(dropdownOf(host).hasAttribute("inverted")).toBe(true)
    expect(host.shadowRoot!.querySelector("[part~=scheme]")!.hasAttribute("inverted")).toBe(true)
  })

  it("renders every element example", async () => {
    for (const [path, html] of Object.entries(EXAMPLES)) {
      const wrapper = await ElementFixture.render<HTMLElement>(`<div>${html}</div>`)
      for (const host of wrapper.querySelectorAll("ui-docs-themes")) {
        expect(host.shadowRoot!.querySelector("[part~=controls]"), path).not.toBeNull()
      }
    }
  })
})

describe("<ui-docs-themes> menu", () => {
  it("lists Spell, Plain, Classic, then every Fomantic theme titled from the site data", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    const list = rows(host)
    expect(list[0]).toEqual([SPELL, "Spell"])
    expect(list[1]).toEqual([DEFAULT_VALUE, "Plain"])
    expect(list[2]).toEqual(["classic", "Classic"])
    expect(
      list
        .slice(3)
        .map(([value]) => value)
        .sort()
    ).toEqual([...ThemeSheets.names].sort())
    expect(list).toContainEqual(["github", "GitHub"])
    expect(list).toContainEqual(["bootstrap3", "Bootstrap 3"])
    expect(dropdownOf(host).querySelector("ui-item[type=header]")!.textContent).toBe("Fomantic themes")
    expect(list.map(([value]) => value)).not.toContain("dark")
  })

  it('for="ui-button":  only the themes touching the button family, and how many', async () => {
    const data = await SiteData.load()
    const buttons = data.themes.filter((theme) => theme.families.includes("ui-button")).map((theme) => theme.name)
    const host = await render(`<ui-docs-themes for="ui-button" show="theme"></ui-docs-themes>`)
    const listed = rows(host)
      .slice(3)
      .map(([value]) => value)
    expect(listed.sort()).toEqual(buttons.filter((name) => ThemeSheets.names.includes(name)).sort())
    expect(listed).toContain("github")
    expect(listed).not.toContain("gmail")
    expect(labelOf(host)).toBe(`${listed.length} themes`)
  })

  it("ThemeMenu:  no data, every theme under its sheet name;  an unknown `for` tag filters nothing", () => {
    const menu = new ThemeMenu(["fixed-width", "github"], undefined, "ui-button")
    expect(menu.themes()).toEqual(["fixed-width", "github"])
    expect(menu.title("fixed-width")).toBe("Fixed width")
    const data = { components: [], docs: [], families: {}, themes: [] } as unknown as SiteDataFile
    expect(new ThemeMenu(["github"], data, "ui-nope").themes()).toEqual(["github"])
  })

  it("ThemeMenu:  `1 theme`, and the chosen look (never `0 themes`) for a family no theme touches", () => {
    const text = (key: string, values?: Record<string, unknown>) =>
      ({
        themeCount: `${values?.count} themes`,
        themeCountOne: "1 theme",
        themeLabel: `${values?.title} theme`,
        default: "Default"
      })[key] ?? key
    const one = new ThemeMenu(["github"], undefined, "ui-button")
    expect(one.label(undefined, text as never)).toBe("1 theme")
    const none = new ThemeMenu([], undefined, "ui-sticky")
    expect(none.label(undefined, text as never)).toBe("Default theme")
  })
})

describe("<ui-docs-themes> choosing", () => {
  it("a theme:  registers classic + the theme, on the page and in shadow roots;  fires one ui-change", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    const probe = await ElementFixture.render<HTMLElement>(`<ui-button>Probe</ui-button>`)
    const changes: DocsThemesChange[] = []
    const inner: Event[] = []
    document.body.addEventListener("ui-change", (event) => {
      if (event.target === host) changes.push((event as CustomEvent<DocsThemesChange>).detail)
      else inner.push(event)
    })
    pick(host, "github")
    await vi.waitFor(() => expect(UI.styles.has(ThemeSheets.SLOTS.theme)).toBe(true))
    expect(ThemeSheets.current).toBe("github")
    const base = UI.styles.sheet(ThemeSheets.SLOTS.base)!
    const theme = UI.styles.sheet(ThemeSheets.SLOTS.theme)!
    expect(document.adoptedStyleSheets).toEqual(expect.arrayContaining([base, theme]))
    expect(probe.shadowRoot!.adoptedStyleSheets).toEqual(expect.arrayContaining([base, theme]))
    expect(changes).toMatchObject([{ theme: "github", scheme: "system" }])
    expect(inner).toEqual([])
    await ElementFixture.settle()
    expect(labelOf(host)).toBe("GitHub theme")
    expect(host.matches(":state(themed)")).toBe(true)
  })

  it("Classic:  classic alone;  Plain:  neither", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    pick(host, "classic")
    await vi.waitFor(() => expect(UI.styles.has(ThemeSheets.SLOTS.base)).toBe(true))
    expect(UI.styles.has(ThemeSheets.SLOTS.theme)).toBe(false)
    pick(host, DEFAULT_VALUE)
    await vi.waitFor(() => expect(UI.styles.has(ThemeSheets.SLOTS.base)).toBe(false))
    expect(ThemeSheets.current).toBeUndefined()
  })

  it("the scheme:  ui-light / ui-dark on <html>, system neither;  the chosen button is active", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    const root = document.documentElement
    const changes: DocsThemesChange[] = []
    host.addEventListener("ui-change", (event) => changes.push((event as CustomEvent<DocsThemesChange>).detail))
    schemeButton(host, "dark").click()
    await ElementFixture.settle()
    expect(root.classList.contains("ui-dark")).toBe(true)
    expect(root.classList.contains("ui-light")).toBe(false)
    expect(schemeButton(host, "dark").hasAttribute("active")).toBe(true)
    expect(schemeButton(host, "system").hasAttribute("active")).toBe(false)
    expect(host.matches(":state(dark)")).toBe(true)
    schemeButton(host, "light").click()
    await ElementFixture.settle()
    expect([root.classList.contains("ui-light"), root.classList.contains("ui-dark")]).toEqual([true, false])
    schemeButton(host, "system").click()
    await ElementFixture.settle()
    expect([root.classList.contains("ui-light"), root.classList.contains("ui-dark")]).toEqual([false, false])
    expect(changes.map((change) => change.scheme)).toEqual(["dark", "light", "system"])
  })

  it("every picker on the page follows a change made in another", async () => {
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div><ui-docs-themes></ui-docs-themes><ui-docs-themes for="ui-button"></ui-docs-themes></div>`
    )
    const [first, second] = wrapper.querySelectorAll("ui-docs-themes")
    schemeButton(first!, "dark").click()
    pick(first!, "github")
    await vi.waitFor(() => expect(ThemeSheets.current).toBe("github"))
    await ElementFixture.settle()
    expect(schemeButton(second!, "dark").hasAttribute("active")).toBe(true)
    expect(dropdownOf(second!).getAttribute("value")).toBe("github")
  })
})

describe("<ui-docs-themes> persistence", () => {
  it("stores the look, and restore() re-applies it on the next page", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    schemeButton(host, "dark").click()
    pick(host, "material")
    await vi.waitFor(() => expect(ThemeSheets.current).toBe("material"))
    expect(localStorage.getItem(DOCS_LOOK_KEYS.theme)).toBe("material")
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBe("dark")

    // "the next page":  nothing applied, nothing in memory
    ThemePreference.reset()
    ThemePreference.applyScheme("system")
    await ThemeSheets.apply(undefined)
    await ThemePreference.restore()
    expect(document.documentElement.classList.contains("ui-dark")).toBe(true)
    expect(ThemeSheets.current).toBe("material")
    const next = await render(`<ui-docs-themes></ui-docs-themes>`)
    expect(dropdownOf(next).getAttribute("value")).toBe("material")
    expect(schemeButton(next, "dark").hasAttribute("active")).toBe(true)
  })

  it("system and Spell (the default) are stored as absent keys;  Plain as its own value", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    schemeButton(host, "light").click()
    schemeButton(host, "system").click()
    pick(host, "github")
    pick(host, SPELL)
    await vi.waitFor(() => expect(ThemeSheets.current).toBe(SPELL))
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBeNull()
    expect(localStorage.getItem(DOCS_LOOK_KEYS.theme)).toBeNull()
    pick(host, DEFAULT_VALUE)
    await vi.waitFor(() => expect(ThemeSheets.current).toBeUndefined())
    expect(localStorage.getItem(DOCS_LOOK_KEYS.theme)).toBe(DOCS_PLAIN_THEME)
    // the next page keeps Plain
    ThemePreference.reset()
    expect(ThemePreference.look.theme).toBeUndefined()
  })

  it("with nothing stored, restore() applies the Spell theme", async () => {
    expect(DOCS_DEFAULT_THEME).toBe(SPELL)
    await ThemePreference.restore()
    expect(ThemeSheets.current).toBe(SPELL)
    expect(UI.styles.has(ThemeSheets.SLOTS.theme)).toBe(true)
  })

  it("a scheme switch turns transitions off for a frame (`DOCS_SCHEME_SWITCHING`)", async () => {
    const root = document.documentElement
    ThemePreference.applyScheme("dark")
    expect(root.classList.contains(DOCS_SCHEME_SWITCHING)).toBe(true)
    await vi.waitFor(() => expect(root.classList.contains(DOCS_SCHEME_SWITCHING)).toBe(false))
  })

  it("HEAD_SCRIPT applies the stored scheme synchronously, and never throws", () => {
    localStorage.setItem(DOCS_LOOK_KEYS.scheme, "dark")
    runHeadScript()
    expect(document.documentElement.classList.contains("ui-dark")).toBe(true)
    localStorage.setItem(DOCS_LOOK_KEYS.scheme, "<junk>")
    ThemePreference.applyScheme("system")
    runHeadScript()
    expect(document.documentElement.className).not.toMatch(/ui-(light|dark)/)
  })

  it("forgets a stored theme that no longer exists, for the default", async () => {
    localStorage.setItem(DOCS_LOOK_KEYS.theme, "no-such-theme")
    ThemePreference.reset()
    await ThemePreference.restore()
    expect(ThemeSheets.current).toBe(DOCS_DEFAULT_THEME)
    expect(localStorage.getItem(DOCS_LOOK_KEYS.theme)).toBeNull()
    expect(ThemePreference.look.theme).toBe(DOCS_DEFAULT_THEME)
  })

  it("works for the page when storage throws", async () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError")
    })
    try {
      const host = await render(`<ui-docs-themes></ui-docs-themes>`)
      schemeButton(host, "dark").click()
      await ElementFixture.settle()
      expect(document.documentElement.classList.contains("ui-dark")).toBe(true)
      expect(ThemePreference.look.scheme).toBe("dark")
    } finally {
      spy.mockRestore()
    }
  })
})
