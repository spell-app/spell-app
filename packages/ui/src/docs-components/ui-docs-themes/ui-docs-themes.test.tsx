import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { expectAccessible } from "$/ui/test/A11y"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { UI } from "$/ui/runtime"
import { SiteData } from "$/ui/docs-components/SiteData"
import { ThemePreference } from "$/ui/docs-components/ThemePreference"
import {
  DOCS_LEGACY_SCHEME_KEYS,
  DOCS_LOOK_KEYS,
  DOCS_PLAIN_THEME,
  type DocsShownScheme
} from "$/ui/docs-components/docs-components.types"

import { SPELL, SPELL_BRAND, type DocsThemesChange } from "./ui-docs-themes.types"

import "$/ui/docs-components/ui-docs-themes"
import "$/ui/components/ui-button"

////////////////
// ## Fixtures
////////////////

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

/** The OS's scheme the tests pretend:  `osScheme()` is spied on, so the real OS never matters. */
let os: DocsShownScheme = "light"

////////////////
// ## Helpers
////////////////

/** Render `html` and wait for it, and for the site data to reach its menu. */
async function render(html: string) {
  const host = await ElementFixture.render<HTMLElement>(html)
  await SiteData.load()
  await ElementFixture.settle()
  return host
}

/** `host`'s inner part `name` (the first one). */
function part<T extends HTMLElement = HTMLElement>(host: Element, name: string) {
  return host.shadowRoot!.querySelector<T>(`[part~=${name}]`)!
}

/** The scheme `host`'s sun / moon button shows:  its `light` / `dark` class. */
function shownOf(host: Element) {
  const classes = part(host, "scheme").classList
  return classes.contains("dark") ? "dark" : classes.contains("light") ? "light" : undefined
}

/** `host`'s overlay theme rows:  `[value, name]`. */
function rows(host: Element): [string, string][] {
  return [...host.shadowRoot!.querySelectorAll<HTMLButtonElement>("[role=menuitemradio]")].map((row) => [
    row.value,
    row.querySelector(".name")!.textContent!
  ])
}

/** `host`'s overlay row for theme `value`. */
function row(host: Element, value: string) {
  return host.shadowRoot!.querySelector<HTMLButtonElement>(`[role=menuitemradio][value="${value}"]`)!
}

/** The dropdown's option rows (`show="theme"`):  `[value, text]`. */
function dropdownRows(host: Element): [string, string][] {
  return [...part(host, "theme").querySelectorAll("ui-item:not([type])")].map((item) => [
    item.getAttribute("value")!,
    item.textContent!.trim()
  ])
}

/** The dropdown's text (its `trigger` slot). */
function labelOf(host: Element) {
  return part(host, "theme").querySelector("[slot=trigger]")!.textContent
}

/** Pick `value` in `host`'s dropdown, as the dropdown reports a viewer's choice. */
function pick(host: Element, value: string) {
  part(host, "theme").dispatchEvent(new CustomEvent("ui-change", { detail: { value }, bubbles: true, composed: true }))
}

/** `<html>`'s scheme:  its `ui-light` / `ui-dark` class and inline `color-scheme`. */
function htmlScheme() {
  const root = document.documentElement
  return {
    light: root.classList.contains("ui-light"),
    dark: root.classList.contains("ui-dark"),
    colorScheme: root.style.colorScheme
  }
}

/** Back to no stored look (so the default theme, in memory), nothing applied, the system scheme. */
async function clean() {
  for (const key of [DOCS_LOOK_KEYS.theme, DOCS_LOOK_KEYS.scheme, ...DOCS_LEGACY_SCHEME_KEYS]) {
    localStorage.removeItem(key)
  }
  ThemePreference.reset()
  ThemePreference.applyScheme("system")
  await (await UI.load()).themes.apply(undefined)
}

beforeEach(async () => {
  os = "light"
  vi.spyOn(ThemePreference, "osScheme").mockImplementation(() => os)
  SiteData.reset(REAL_DATA)
  await UI.load()
  // Escape through a keyboard binding rather than `CloseWatcher`, so the test can press it
  UI.overlays.useCloseWatcher = false
  await clean()
})

afterEach(async () => {
  await clean()
  vi.restoreAllMocks()
})

////////////////
// ## Markup and overlay
////////////////

describe("<ui-docs-themes> markup", () => {
  it("renders the palette button, its overlay, and the sun / moon button showing the page's scheme", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    expect(part(host, "controls").className).toBe("ui themes")
    expect(part(host, "palette").localName).toBe("button")
    expect(part(host, "palette").getAttribute("aria-label")).toBe("Theme:  Spell")
    const overlay = part(host, "overlay")
    expect(overlay.localName).toBe("ui-popup")
    expect(overlay.getAttribute("on")).toBe("click")
    const scheme = part(host, "scheme")
    expect(scheme.className).toBe("scheme button light")
    expect(scheme.getAttribute("aria-label")).toBe("Switch to dark")
    expect([...scheme.querySelectorAll("ui-icon")].map((icon) => icon.getAttribute("name"))).toEqual([
      "sun outline",
      "moon"
    ])
    expect([...host.shadowRoot!.querySelectorAll("[part~=tip]")].map((tip) => tip.textContent)).toEqual([
      "Theme:  Spell",
      "Switch to dark"
    ])
    expect(part(host, "system").getAttribute("aria-checked")).toBe("true")
    expect(host.matches(":state(following)")).toBe(true)
    expect(host.matches(":state(dark)")).toBe(false)
    expect(part(host, "theme")).toBeNull()
    await expectAccessible(host)
  })

  it("follows the OS's scheme while nothing is chosen:  a moon on a dark OS", async () => {
    os = "dark"
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    expect(shownOf(host)).toBe("dark")
    expect(part(host, "scheme").getAttribute("aria-label")).toBe("Switch to light")
    expect(host.matches(":state(dark)")).toBe(true)
  })

  it("switches its icon when the OS switches scheme, while following it", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    os = "dark"
    ThemePreference.osChanged()
    await ElementFixture.settle()
    expect(shownOf(host)).toBe("dark")
    expect(ThemePreference.shownScheme()).toBe("dark")
  })

  it.each([
    ["theme", ["theme"], ["palette", "overlay", "scheme"]],
    ["scheme", ["scheme"], ["palette", "overlay", "theme"]]
  ])("show=%s", async (show, present, absent) => {
    const host = await render(`<ui-docs-themes show="${show}"></ui-docs-themes>`)
    for (const name of present) expect(part(host, name), name).not.toBeNull()
    for (const name of absent) expect(part(host, name), name).toBeNull()
  })

  it("passes size and inverted on", async () => {
    const host = await render(`<ui-docs-themes size="small" inverted></ui-docs-themes>`)
    expect(part(host, "controls").className).toBe("ui small inverted themes")
    const dropdown = await render(`<ui-docs-themes size="small" inverted show="theme"></ui-docs-themes>`)
    expect(part(dropdown, "theme").getAttribute("size")).toBe("small")
    expect(part(dropdown, "theme").hasAttribute("inverted")).toBe(true)
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

describe("<ui-docs-themes> overlay", () => {
  it("lists Spell (checked), Spell Brand, Plain, Classic, then every Fomantic theme titled from the site data", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    const list = rows(host)
    expect(list.slice(0, 4)).toEqual([
      [SPELL, "Spell"],
      [SPELL_BRAND, "Spell Brand"],
      [DOCS_PLAIN_THEME, "Plain"],
      ["classic", "Classic"]
    ])
    expect(
      list
        .slice(4)
        .map(([value]) => value)
        .sort()
    ).toEqual([...UI.themes.names].sort())
    expect(list).toContainEqual(["github", "GitHub"])
    expect(list.map(([value]) => value)).not.toContain("dark")
    expect(row(host, SPELL).getAttribute("aria-checked")).toBe("true")
    expect(row(host, SPELL).querySelector(".description")!.textContent).toBe("The Spell brand")
    expect(host.shadowRoot!.querySelector(".menu > .header")!.textContent).toBe("Fomantic themes")
    // one tab stop:  the chosen theme
    expect(rows(host).filter(([value]) => row(host, value).tabIndex === 0)).toEqual([[SPELL, "Spell"]])
  })

  it("opens on the palette button, focuses the chosen theme;  arrows move;  Escape closes back to the button", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    const palette = part(host, "palette")
    const focused = () => host.shadowRoot!.activeElement
    palette.focus()
    await userEvent.keyboard("{Enter}")
    await vi.waitFor(() => expect(part(host, "overlay").matches(":popover-open")).toBe(true))
    await vi.waitFor(() => expect(focused()).toBe(row(host, SPELL)))
    await ElementFixture.settle()
    expect(host.matches(":state(open)")).toBe(true)
    expect(host.shadowRoot!.querySelectorAll("[part~=tip]")[0]!.hasAttribute("hidden")).toBe(true)

    await userEvent.keyboard("{ArrowDown}")
    expect(focused()).toBe(row(host, SPELL_BRAND))
    await userEvent.keyboard("{ArrowUp}{ArrowUp}")
    expect(focused()).toBe(row(host, rows(host).at(-1)![0]))
    await userEvent.keyboard("{Home}")
    expect(focused()).toBe(row(host, SPELL))
    await userEvent.keyboard("{End}")
    await ElementFixture.settle()
    expect(row(host, rows(host).at(-1)![0]).tabIndex).toBe(0)

    await userEvent.keyboard("{Escape}")
    await vi.waitFor(() => expect(part(host, "overlay").matches(":popover-open")).toBe(false))
    await ElementFixture.settle()
    expect(host.matches(":state(open)")).toBe(false)
    expect(focused()).toBe(palette)
  })

  it("a theme row picks it:  classic + the theme, on the page and in shadow roots;  one ui-change;  stays open", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    const probe = await ElementFixture.render<HTMLElement>(`<ui-button>Probe</ui-button>`)
    const changes: DocsThemesChange[] = []
    host.addEventListener("ui-change", (event) => changes.push((event as CustomEvent<DocsThemesChange>).detail))
    row(host, "github").click()
    await vi.waitFor(() => expect(UI.styles.has(UI.themes.slots.theme)).toBe(true))
    expect(UI.themes.current).toBe("github")
    const base = UI.styles.sheet(UI.themes.slots.base)!
    const theme = UI.styles.sheet(UI.themes.slots.theme)!
    expect(document.adoptedStyleSheets).toEqual(expect.arrayContaining([base, theme]))
    expect(probe.shadowRoot!.adoptedStyleSheets).toEqual(expect.arrayContaining([base, theme]))
    expect(changes).toMatchObject([{ theme: "github", scheme: "system", shown: "light" }])
    await ElementFixture.settle()
    expect(row(host, "github").getAttribute("aria-checked")).toBe("true")
    expect(row(host, SPELL).getAttribute("aria-checked")).toBe("false")
    expect(part(host, "palette").getAttribute("aria-label")).toBe("Theme:  GitHub")
    expect(host.matches(":state(themed)")).toBe(true)
    // picking it again changes nothing
    row(host, "github").click()
    expect(changes).toHaveLength(1)
  })

  it("Plain:  no sheet at all", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    row(host, "classic").click()
    await vi.waitFor(() => expect(UI.styles.has(UI.themes.slots.base)).toBe(true))
    expect(UI.styles.has(UI.themes.slots.theme)).toBe(false)
    row(host, DOCS_PLAIN_THEME).click()
    await vi.waitFor(() => expect(UI.styles.has(UI.themes.slots.base)).toBe(false))
    expect(UI.themes.current).toBeUndefined()
    expect(part(host, "palette").getAttribute("aria-label")).toBe("Theme:  Plain")
  })
})

////////////////
// ## Scheme
////////////////

describe("<ui-docs-themes> scheme", () => {
  it("a click flips the shown scheme and stores it:  ui-dark / ui-light + color-scheme on <html>", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    const changes: DocsThemesChange[] = []
    host.addEventListener("ui-change", (event) => changes.push((event as CustomEvent<DocsThemesChange>).detail))
    part(host, "scheme").click()
    await ElementFixture.settle()
    expect(htmlScheme()).toEqual({ light: false, dark: true, colorScheme: "dark" })
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBe("dark")
    expect(shownOf(host)).toBe("dark")
    expect(part(host, "scheme").getAttribute("aria-label")).toBe("Switch to light")
    expect(part(host, "system").getAttribute("aria-checked")).toBe("false")
    expect(host.matches(":state(dark)")).toBe(true)
    expect(host.matches(":state(following)")).toBe(false)
    part(host, "scheme").click()
    await ElementFixture.settle()
    expect(htmlScheme()).toEqual({ light: true, dark: false, colorScheme: "light" })
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBe("light")
    expect(changes.map(({ scheme, shown }) => [scheme, shown])).toEqual([
      ["dark", "dark"],
      ["light", "light"]
    ])
  })

  it("Match system:  on drops the stored scheme (the OS's shows);  off keeps the shown one as a choice", async () => {
    os = "dark"
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    part(host, "scheme").click()
    await ElementFixture.settle()
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBe("light")
    part(host, "system").click()
    await ElementFixture.settle()
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBeNull()
    expect(htmlScheme()).toEqual({ light: false, dark: false, colorScheme: "" })
    expect(part(host, "system").getAttribute("aria-checked")).toBe("true")
    expect(shownOf(host)).toBe("dark")
    part(host, "system").click()
    await ElementFixture.settle()
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBe("dark")
    expect(htmlScheme().dark).toBe(true)
  })

  it("every picker on the page follows a change made in another", async () => {
    const wrapper = await ElementFixture.render<HTMLElement>(
      `<div><ui-docs-themes></ui-docs-themes><ui-docs-themes for="ui-button" show="theme"></ui-docs-themes></div>`
    )
    await SiteData.load()
    const [first, second] = wrapper.querySelectorAll("ui-docs-themes")
    part(first!, "scheme").click()
    row(first!, "github").click()
    await vi.waitFor(() => expect(UI.themes.current).toBe("github"))
    await ElementFixture.settle()
    expect(part(second!, "theme").getAttribute("value")).toBe("github")
    expect(second!.matches(":state(dark)")).toBe(true)
  })
})

////////////////
// ## Dropdown
////////////////

describe("<ui-docs-themes> dropdown (show=theme)", () => {
  it('for="ui-button":  only the themes touching the button family, and how many', async () => {
    const data = await SiteData.load()
    const buttons = data.themes.filter((theme) => theme.families.includes("ui-button")).map((theme) => theme.name)
    const host = await render(`<ui-docs-themes for="ui-button" show="theme"></ui-docs-themes>`)
    const listed = dropdownRows(host)
      .slice(4)
      .map(([value]) => value)
    expect(listed.sort()).toEqual(buttons.filter((name) => UI.themes.names.includes(name)).sort())
    expect(listed).toContain("github")
    expect(listed).not.toContain("gmail")
    expect(labelOf(host)).toBe(`${listed.length} themes`)
  })

  it("a pick applies it and fires one ui-change (the dropdown's own is stopped)", async () => {
    const host = await render(`<ui-docs-themes show="theme"></ui-docs-themes>`)
    const inner: Event[] = []
    const changes: DocsThemesChange[] = []
    document.body.addEventListener("ui-change", (event) => {
      if (event.target === host) changes.push((event as CustomEvent<DocsThemesChange>).detail)
      else inner.push(event)
    })
    pick(host, "material")
    await vi.waitFor(() => expect(UI.themes.current).toBe("material"))
    expect(changes).toMatchObject([{ theme: "material" }])
    expect(inner).toEqual([])
    await ElementFixture.settle()
    expect(labelOf(host)).toBe("Material theme")
  })
})

////////////////
// ## Persistence
////////////////

describe("<ui-docs-themes> persistence", () => {
  it("stores the look, and restore() re-applies it on the next page", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    part(host, "scheme").click()
    row(host, "material").click()
    await vi.waitFor(() => expect(UI.themes.current).toBe("material"))
    expect(localStorage.getItem(DOCS_LOOK_KEYS.theme)).toBe("material")
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBe("dark")

    // "the next page":  nothing applied, nothing in memory
    ThemePreference.reset()
    ThemePreference.applyScheme("system")
    await UI.themes.apply(undefined)
    await ThemePreference.restore()
    expect(htmlScheme().dark).toBe(true)
    expect(UI.themes.current).toBe("material")
    const next = await render(`<ui-docs-themes></ui-docs-themes>`)
    expect(row(next, "material").getAttribute("aria-checked")).toBe("true")
    expect(shownOf(next)).toBe("dark")
  })

  it("system and Spell (the default) are stored as absent keys;  Plain as its own value", async () => {
    const host = await render(`<ui-docs-themes></ui-docs-themes>`)
    part(host, "scheme").click()
    await ElementFixture.settle()
    part(host, "system").click()
    row(host, "github").click()
    row(host, SPELL).click()
    await vi.waitFor(() => expect(UI.themes.current).toBe(SPELL))
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBeNull()
    expect(localStorage.getItem(DOCS_LOOK_KEYS.theme)).toBeNull()
    row(host, DOCS_PLAIN_THEME).click()
    await vi.waitFor(() => expect(UI.themes.current).toBeUndefined())
    expect(localStorage.getItem(DOCS_LOOK_KEYS.theme)).toBe(DOCS_PLAIN_THEME)
    // the next page keeps Plain
    ThemePreference.reset()
    expect(ThemePreference.look.theme).toBeUndefined()
  })

  it("works for the page when storage throws", async () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError")
    })
    try {
      const host = await render(`<ui-docs-themes></ui-docs-themes>`)
      part(host, "scheme").click()
      await ElementFixture.settle()
      expect(htmlScheme().dark).toBe(true)
      expect(ThemePreference.look.scheme).toBe("dark")
    } finally {
      spy.mockRestore()
    }
  })
})
