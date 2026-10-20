import { describe, expect, it, vi } from "vite-plus/test"

import { ElementFixture } from "@spell-app/ui/test/ElementFixture"
import { expectAccessible } from "@spell-app/ui/test/A11y"

import "$/brand/components/brand-logo"

/** The `<svg part="logo">` of a `<brand-logo>`, once the outlines have loaded. */
async function logo(host: Element): Promise<SVGSVGElement> {
  return vi.waitFor(() => {
    const svg = host.shadowRoot!.querySelector<SVGSVGElement>(`[part~="logo"]`)
    if (!svg) throw new Error("no logo yet")
    return svg
  })
}

describe("<brand-logo>", () => {
  it("draws the hat mark, named Spell, in ink, 2em high", async () => {
    const host = await ElementFixture.render(`<brand-logo style="font-size: 16px"></brand-logo>`)
    const svg = await logo(host)
    expect(["role", "aria-label", "viewBox"].map((name) => svg.getAttribute(name))).toEqual([
      "img",
      "Spell",
      "12 39 218 192"
    ])
    expect(svg.querySelector("path")!.getAttribute("d")!.length).toBeGreaterThan(100)
    expect([...svg.classList]).toEqual(["logo", "ink"])
    expect(svg.getBoundingClientRect().height).toBe(32)
    await expectAccessible(host)
  })

  it("draws each lockup wider than the mark;  `app` is named Spell App", async () => {
    const host = await ElementFixture.render(`<div style="font-size: 16px">
      <brand-logo></brand-logo>
      <brand-logo variant="lockup"></brand-logo>
      <brand-logo variant="tagline"></brand-logo>
      <brand-logo variant="app"></brand-logo>
    </div>`)
    const [mark, lockup, tagline, app] = await Promise.all([...host.querySelectorAll("brand-logo")].map(logo))
    const width = (svg: SVGSVGElement | undefined) => svg!.getBoundingClientRect().width
    for (const svg of [lockup, tagline, app]) {
      expect(width(svg)).toBeGreaterThan(width(mark) * 1.5)
      expect(svg!.querySelector("g")!.innerHTML).toContain("<path")
    }
    expect(app!.getAttribute("aria-label")).toBe("Spell App")
  })

  it("`tone` colours it;  `current` follows the page's colour", async () => {
    const host = await ElementFixture.render(`<div style="color: rgb(1, 2, 3)">
      <brand-logo tone="white"></brand-logo>
      <brand-logo tone="current"></brand-logo>
    </div>`)
    const [white, current] = await Promise.all([...host.querySelectorAll("brand-logo")].map(logo))
    expect(getComputedStyle(white!).fill).toBe("rgb(255, 255, 255)")
    expect(getComputedStyle(current!).fill).toBe("rgb(1, 2, 3)")
  })

  it('`label` renames it;  `label=""` hides it from screen readers', async () => {
    const host = await ElementFixture.render(`<div>
      <brand-logo label="Home"></brand-logo>
      <brand-logo label=""></brand-logo>
    </div>`)
    const [named, decorative] = await Promise.all([...host.querySelectorAll("brand-logo")].map(logo))
    expect(named!.getAttribute("aria-label")).toBe("Home")
    expect(decorative!.getAttribute("aria-hidden")).toBe("true")
    expect(decorative!.hasAttribute("role")).toBe(false)
  })
})
