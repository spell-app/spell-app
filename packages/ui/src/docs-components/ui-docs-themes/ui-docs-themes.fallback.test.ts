import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"
import { ThemeSheets } from "$/ui/styles"
import { ThemePreference } from "$/ui/docs-components/ThemePreference"
import { DOCS_LOOK_KEYS } from "$/ui/docs-components/docs-components.types"

import { DocsThemesFallback } from "./ui-docs-themes.fallback"

FallbackStub.define("x-fb-docs-themes", (host, root, internals) =>
  DocsThemesFallback.render(host, root, new Error("boom"), internals)
)

/** `host`'s fallback wrapper. */
function controlsOf(host: StubHost) {
  return FallbackStub.shadow(host).firstElementChild as HTMLElement
}

beforeEach(() => {
  vi.spyOn(ThemePreference, "osScheme").mockReturnValue("light")
})

afterEach(async () => {
  localStorage.removeItem(DOCS_LOOK_KEYS.theme)
  localStorage.removeItem(DOCS_LOOK_KEYS.scheme)
  ThemePreference.reset()
  ThemePreference.applyScheme("system")
  await ThemeSheets.apply(undefined)
  vi.restoreAllMocks()
})

describe("DocsThemesFallback", () => {
  it("renders the class grammar, a native select of every theme, a scheme button and a Match system box", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-docs-themes size="small"></x-fb-docs-themes>`)
    const controls = controlsOf(host)
    expect(controls.className).toBe("ui small themes")
    expect(controls.getAttribute("part")).toBe("controls")
    const select = controls.querySelector("select[part=theme]")!
    const values = [...select.querySelectorAll("option")].map((option) => option.value)
    expect(values.slice(0, 4)).toEqual(["spell", "spell-brand", "default", "classic"])
    expect(values.slice(4).sort()).toEqual([...ThemeSheets.names].sort())
    expect(select.querySelector("optgroup")!.label).toBe("Fomantic themes")
    expect(controls.querySelector("button[part=scheme]")!.textContent).toBe("Switch to dark")
    const system = controls.querySelector("label[part=system]")!
    expect(system.textContent!.trim()).toBe("Match system")
    expect(system.querySelector("input")!.checked).toBe(true)
    await expectAccessible(host)
  })

  it("still applies and remembers a choice, and fires ui-change", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-docs-themes></x-fb-docs-themes>`)
    const controls = controlsOf(host)
    const changes: unknown[] = []
    host.addEventListener("ui-change", (event) => changes.push((event as CustomEvent).detail))
    const button = controls.querySelector<HTMLButtonElement>("button[part=scheme]")!
    button.click()
    expect(document.documentElement.classList.contains("ui-dark")).toBe(true)
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBe("dark")
    expect(button.textContent).toBe("Switch to light")
    const box = controls.querySelector<HTMLInputElement>("label[part=system] input")!
    expect(box.checked).toBe(false)
    box.click()
    expect(localStorage.getItem(DOCS_LOOK_KEYS.scheme)).toBeNull()
    expect(button.textContent).toBe("Switch to dark")
    const select = controls.querySelector("select")!
    select.value = "github"
    select.dispatchEvent(new Event("change"))
    await vi.waitFor(() => expect(ThemeSheets.current).toBe("github"))
    expect(localStorage.getItem(DOCS_LOOK_KEYS.theme)).toBe("github")
    expect(changes).toMatchObject([
      { scheme: "dark", shown: "dark" },
      { scheme: "system", shown: "light" },
      { theme: "github", scheme: "system" }
    ])
  })

  it("show=scheme:  the button alone;  show=theme:  the select alone", () => {
    const scheme = controlsOf(Fixture.render<StubHost>(`<x-fb-docs-themes show="scheme"></x-fb-docs-themes>`))
    expect([...scheme.children].map((child) => child.getAttribute("part"))).toEqual(["scheme"])
    const theme = controlsOf(Fixture.render<StubHost>(`<x-fb-docs-themes show="theme"></x-fb-docs-themes>`))
    expect([...theme.children].map((child) => child.getAttribute("part"))).toEqual(["theme"])
  })
})
