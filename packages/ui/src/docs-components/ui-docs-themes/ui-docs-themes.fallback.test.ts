import { afterEach, describe, expect, it, vi } from "vitest"

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

afterEach(async () => {
  localStorage.removeItem(DOCS_LOOK_KEYS.theme)
  localStorage.removeItem(DOCS_LOOK_KEYS.scheme)
  ThemePreference.reset()
  ThemePreference.applyScheme("system")
  await ThemeSheets.apply(undefined)
})

describe("DocsThemesFallback", () => {
  it("renders the class grammar, a native select of every theme and three scheme buttons", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-docs-themes size="small"></x-fb-docs-themes>`)
    const controls = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(controls.className).toBe("ui small themes")
    expect(controls.getAttribute("part")).toBe("controls")
    const select = controls.querySelector("select[part=theme]")!
    const values = [...select.querySelectorAll("option")].map((option) => option.value)
    expect(values.slice(0, 2)).toEqual(["default", "classic"])
    expect(values.slice(2).sort()).toEqual([...ThemeSheets.names].sort())
    expect(select.querySelector("optgroup")!.label).toBe("Fomantic themes")
    const buttons = [...controls.querySelectorAll("button")]
    expect(buttons.map((button) => button.getAttribute("part"))).toEqual(["light", "dark", "system"])
    expect(buttons.map((button) => button.getAttribute("aria-pressed"))).toEqual(["false", "false", "true"])
    await expectAccessible(host)
  })

  it("still applies and remembers a choice, and fires ui-change", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-docs-themes></x-fb-docs-themes>`)
    const controls = FallbackStub.shadow(host).firstElementChild as HTMLElement
    const changes: unknown[] = []
    host.addEventListener("ui-change", (event) => changes.push((event as CustomEvent).detail))
    controls.querySelector<HTMLButtonElement>("button[part=dark]")!.click()
    expect(document.documentElement.classList.contains("ui-dark")).toBe(true)
    expect(controls.querySelector("button[part=dark]")!.getAttribute("aria-pressed")).toBe("true")
    const select = controls.querySelector("select")!
    select.value = "github"
    select.dispatchEvent(new Event("change"))
    await vi.waitFor(() => expect(ThemeSheets.current).toBe("github"))
    expect(localStorage.getItem(DOCS_LOOK_KEYS.theme)).toBe("github")
    expect(changes).toMatchObject([{ scheme: "dark" }, { theme: "github", scheme: "dark" }])
  })

  it("show=scheme leaves the select out", () => {
    const host = Fixture.render<StubHost>(`<x-fb-docs-themes show="scheme"></x-fb-docs-themes>`)
    expect(FallbackStub.shadow(host).querySelector("select")).toBeNull()
  })
})
