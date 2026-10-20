import { describe, expect, it } from "vite-plus/test"
import type { JSX } from "@solidjs/web"

import type { DOMElement, DOMElementClass, UIComponentClass } from "$/spell-element"
import type { ComponentVocabulary } from "$/ui/vocabulary"
import { E } from "$/ui/core"
import { UIButton } from "$/ui/components/ui-button"
import { UIDropdown } from "$/ui/components/ui-dropdown"
import { es } from "$/ui/test/dictionary.es"
import { ElementFixture } from "$/ui/test/ElementFixture"

UIButton.define("ie-boton", es)
UIDropdown.define("ie-desplegable", es)

describe("UIComponent.define(tag, dictionary)", () => {
  it("maps Spanish attribute names and values onto the canonical grammar", async () => {
    const host = await ElementFixture.render<DOMElement>(
      `<ie-boton primario color="rojo" tamano="pequeno">Guardar</ie-boton>`
    )
    expect(host.shadowRoot!.querySelector("button")!.className).toBe("ui small red primary button")
    expect("primario" in host).toBe(true)
  })

  it("reflects canonical values back in Spanish", async () => {
    const host = await ElementFixture.render<DOMElement & { color: string }>(`<ie-boton>Guardar</ie-boton>`)
    host.color = "azul"
    await ElementFixture.tick()
    expect(host.shadowRoot!.querySelector("button")!.className).toBe("ui blue button")
    expect(host.getAttribute("color")).toBe("azul")
  })

  it("names the shared attributes in Spanish:  `<ie-boton desactivado>` is disabled", async () => {
    const host = await ElementFixture.render<DOMElement & { desactivado: boolean }>(
      `<ie-boton desactivado>Guardar</ie-boton>`
    )
    expect({
      native: host.shadowRoot!.querySelector("button")!.disabled,
      state: host.matches(":state(disabled)"),
      property: host.desactivado,
      english: "disabled" in host
    }).toEqual({ native: true, state: true, property: true, english: false })
    // the button and dropdown declare their own `disabled` / `loading`:  the same words name them
    // (a tag that takes the shared ones:  "names the shared attributes a tag takes in Spanish", below)
    const dropdown = await ElementFixture.render<DOMElement>(`<ie-desplegable cargando></ie-desplegable>`)
    expect(dropdown.matches(":state(loading)")).toBe(true)
  })

  it("names the shared attributes a tag takes in Spanish, after its own;  then the platform's `hidden`", () => {
    /** A tag that declares only `label`, so it takes every shared attribute. */
    class Labelled extends E.UIComponent<any> {
      render(): JSX.Element {
        return <span />
      }
    }
    const vocabulary: ComponentVocabulary = {
      tag: "x-labelled",
      noun: "labelled",
      attributes: [{ name: "label", kind: "string", description: "The label." }],
      events: [],
      slots: [],
      parts: [],
      states: [],
      texts: []
    }
    Object.defineProperty(Labelled.prototype, "vocabulary", { value: vocabulary })
    const Class = (Labelled as unknown as UIComponentClass & typeof E.UIComponent).define("x-etiquetado", {
      lang: "es",
      attributes: { label: "etiqueta" }
    }) as DOMElementClass
    // `SharedVocabulary.es.ts`;  `visible` turned round is the platform's `hidden`
    expect(Class.observedAttributes).toEqual(["etiqueta", "desactivado", "cargando", "visible", "animacion", "hidden"])
  })

  it("dispatches translated events", async () => {
    const button = await ElementFixture.render<DOMElement>(`<ie-boton alternable>Votar</ie-boton>`)
    const toggles: unknown[] = []
    button.addEventListener("ie-alternar", (event) => toggles.push((event as CustomEvent).detail.active))
    button.shadowRoot!.querySelector("button")!.click()
    expect(toggles).toEqual([true])

    const dropdown = await ElementFixture.render<DOMElement>(`<ie-desplegable seleccion marcador="Género">
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
