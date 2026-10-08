import { describe, expect, it } from "vite-plus/test"

import type { UIElement, UIHost } from "$/ui/elements"
import { UI } from "$/ui/runtime"
import { ElementFixture } from "$/ui/test/ElementFixture"

// NOTE: order matters:  table registers its `label` text BEFORE breadcrumb does
import "$/ui/components/ui-table"
import "$/ui/components/ui-breadcrumb"

/** Text `key` as the element `host` resolves it. */
function textOf(host: Element, key: string): string {
  return ((host as UIHost).controller as UIElement).translationForKey(key as never)
}

describe("UIElement.translationForKey()", () => {
  it("gives two families sharing a key each their own English text", async () => {
    const breadcrumb = await ElementFixture.render(`<ui-breadcrumb><a href="#a">A</a></ui-breadcrumb>`)
    expect(breadcrumb.shadowRoot!.querySelector("nav")!.getAttribute("aria-label")).toBe("Breadcrumb")
    expect(textOf(breadcrumb, "label")).toBe("Breadcrumb")
    const table = await ElementFixture.render(`<ui-table><table><tr><td>1</td></tr></table></ui-table>`)
    expect(textOf(table, "label")).toBe("Table")
  })

  it("takes a translation per component first, then a shared one, then its own English", async () => {
    const breadcrumb = await ElementFixture.render(`<ui-breadcrumb><a href="#a">A</a></ui-breadcrumb>`)
    const table = await ElementFixture.render(`<ui-table><table><tr><td>1</td></tr></table></ui-table>`)
    const { locale } = UI.i18n
    try {
      UI.i18n.locale = "xx"
      expect(textOf(breadcrumb, "label")).toBe("Breadcrumb")
      UI.i18n.register("xx", { label: "Etiqueta" })
      expect(textOf(table, "label")).toBe("Etiqueta")
      UI.i18n.register("xx", { label: "Migas" }, "ui-breadcrumb")
      expect(textOf(breadcrumb, "label")).toBe("Migas")
      expect(textOf(table, "label")).toBe("Etiqueta")
    } finally {
      UI.i18n.locale = locale
    }
  })
})
