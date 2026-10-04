import { describe, expect, it } from "vite-plus/test"

import type { UIHost } from "$/ui/elements"
import { UIButton } from "$/ui/components/ui-button"
import { UIDropdown } from "$/ui/components/ui-dropdown"
import { es } from "$/ui/test/dictionary.es"
import { ElementFixture } from "$/ui/test/ElementFixture"

UIButton.define("ie-boton", es)
UIDropdown.define("ie-desplegable", es)

describe("translation hook (alias define)", () => {
  it("maps Spanish attribute names and values onto the canonical grammar", async () => {
    const host = await ElementFixture.render<UIHost>(
      `<ie-boton primario color="rojo" tamano="pequeno">Guardar</ie-boton>`
    )
    expect(host.shadowRoot!.querySelector("button")!.className).toBe("ui small red primary button")
    expect("primario" in host).toBe(true)
  })

  it("reflects canonical values back in Spanish", async () => {
    const host = await ElementFixture.render<UIHost & { color: string }>(`<ie-boton>Guardar</ie-boton>`)
    host.color = "azul"
    await ElementFixture.tick()
    expect(host.shadowRoot!.querySelector("button")!.className).toBe("ui blue button")
    expect(host.getAttribute("color")).toBe("azul")
  })

  it("dispatches translated events", async () => {
    const button = await ElementFixture.render<UIHost>(`<ie-boton alternable>Votar</ie-boton>`)
    const toggles: unknown[] = []
    button.addEventListener("ie-alternar", (event) => toggles.push((event as CustomEvent).detail.active))
    button.shadowRoot!.querySelector("button")!.click()
    expect(toggles).toEqual([true])

    const dropdown = await ElementFixture.render<UIHost>(`<ie-desplegable seleccion marcador="Género">
      <ui-item value="f">Femenino</ui-item><ui-item value="m">Masculino</ui-item>
    </ie-desplegable>`)
    const changes: unknown[] = []
    dropdown.addEventListener("ie-cambio", (event) => changes.push((event as CustomEvent).detail.value))
    const root = dropdown.shadowRoot!.firstElementChild!
    expect(root.className).toBe("ui selection dropdown")
    root.querySelector<HTMLElement>("[role=combobox]")!.click()
    await ElementFixture.tick()
    root.querySelectorAll<HTMLElement>("[role=option]")[1]!.click()
    await ElementFixture.tick()
    expect(changes).toEqual(["m"])
    expect(root.querySelector("[part~=text]")!.textContent).toBe("Masculino")
  })
})
