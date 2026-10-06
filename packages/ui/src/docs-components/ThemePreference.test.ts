import { afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import { UI } from "$/ui/runtime"
import { LEGACY_SCHEME_KEYS, SCHEME_KEY } from "$/server/site/site.types"

import { ThemePreference } from "./ThemePreference"
import {
  DOCS_DEFAULT_THEME,
  DOCS_LEGACY_SCHEME_KEYS,
  DOCS_LOOK_KEYS,
  DOCS_SCHEME_SWITCHING
} from "./docs-components.types"
import { SPELL } from "./ui-docs-themes/ui-docs-themes.types"

beforeEach(async () => {
  // the real OS's scheme never matters
  vi.spyOn(ThemePreference, "osScheme").mockReturnValue("light")
  await UI.load()
  await clean()
})

afterEach(async () => {
  await clean()
  vi.restoreAllMocks()
})

describe("DOCS_LOOK_KEYS.scheme", () => {
  test("ONE scheme key for every doc site:  the site header's (`$/server/site`)", () => {
    expect(DOCS_LOOK_KEYS.scheme).toBe(SCHEME_KEY)
    expect([...DOCS_LEGACY_SCHEME_KEYS]).toEqual([...LEGACY_SCHEME_KEYS])
  })
})

describe("ThemePreference.reset()", () => {
  test.each([
    ["spell-site:theme", "dark"],
    ["spell-ui-site:scheme", "light"]
  ])("moves an old key's scheme (%s) to the one key, once", (key, scheme) => {
    localStorage.setItem(key, scheme)
    ThemePreference.reset()
    expect(ThemePreference.look.scheme).toBe(scheme)
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBe(scheme)
    for (const old of DOCS_LEGACY_SCHEME_KEYS) expect(localStorage.getItem(old)).toBeNull()
  })

  test("an old key never overrides the one key", () => {
    localStorage.setItem(DOCS_LOOK_KEYS.scheme, "light")
    localStorage.setItem("spell-site:theme", "dark")
    ThemePreference.reset()
    expect(ThemePreference.look.scheme).toBe("light")
  })
})

describe("ThemePreference.restore()", () => {
  test("with nothing stored, restore() applies the Spell theme", async () => {
    expect(DOCS_DEFAULT_THEME).toBe(SPELL)
    await ThemePreference.restore()
    expect(UI.themes.current).toBe(SPELL)
    expect(UI.styles.has(UI.themes.slots.theme)).toBe(true)
  })

  test("forgets a stored theme that no longer exists, for the default", async () => {
    localStorage.setItem(DOCS_LOOK_KEYS.theme, "no-such-theme")
    ThemePreference.reset()
    await ThemePreference.restore()
    expect(UI.themes.current).toBe(DOCS_DEFAULT_THEME)
    expect(localStorage.getItem(DOCS_LOOK_KEYS.theme)).toBeNull()
    expect(ThemePreference.look.theme).toBe(DOCS_DEFAULT_THEME)
  })
})

describe("ThemePreference.applyScheme()", () => {
  test("a scheme switch turns transitions off for a frame (`DOCS_SCHEME_SWITCHING`)", async () => {
    const root = document.documentElement
    ThemePreference.applyScheme("dark")
    expect(root.classList.contains(DOCS_SCHEME_SWITCHING)).toBe(true)
    await vi.waitFor(() => expect(root.classList.contains(DOCS_SCHEME_SWITCHING)).toBe(false))
  })
})

describe("ThemePreference.HEAD_SCRIPT", () => {
  test("applies the stored scheme (or an old key's) synchronously, and never throws", () => {
    localStorage.setItem(DOCS_LOOK_KEYS.scheme, "dark")
    runHeadScript()
    expect(htmlScheme()).toEqual({ light: false, dark: true, colorScheme: "dark" })
    ThemePreference.applyScheme("system")
    localStorage.removeItem(DOCS_LOOK_KEYS.scheme)
    localStorage.setItem("spell-ui-site:scheme", "light")
    runHeadScript()
    expect(htmlScheme()).toEqual({ light: true, dark: false, colorScheme: "light" })
    ThemePreference.applyScheme("system")
    localStorage.setItem(DOCS_LOOK_KEYS.scheme, "<junk>")
    runHeadScript()
    expect(document.documentElement.className).not.toMatch(/ui-(light|dark)/)
  })
})

/** Back to no stored look (so the default theme, in memory), nothing applied, the system scheme. */
async function clean() {
  for (const key of [DOCS_LOOK_KEYS.theme, DOCS_LOOK_KEYS.scheme, ...DOCS_LEGACY_SCHEME_KEYS]) {
    localStorage.removeItem(key)
  }
  ThemePreference.reset()
  ThemePreference.applyScheme("system")
  await UI.themes.apply(undefined)
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

/** Run `ThemePreference.HEAD_SCRIPT` as a page's inline `<head>` script:  an inline classic script runs on insert. */
function runHeadScript() {
  const script = document.createElement("script")
  script.textContent = ThemePreference.HEAD_SCRIPT
  document.head.append(script)
  script.remove()
}
