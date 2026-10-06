import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { FallbackStub } from "$/ui/test/FallbackStub"

import { PanelFallback } from "./ui-panel.fallback"

// defines `<ui-sections>`:  the fallback finds a section's group through the owner registry
import "$/ui/components/ui-section"

FallbackStub.define("x-fb-panel", (host, root, internals) =>
  PanelFallback.render({ host, root, error: new Error("boom"), internals })
)

/** The fallback's `<section>` root in `host`. */
function root(host: Element): HTMLElement {
  return FallbackStub.shadow(host).querySelector<HTMLElement>("[part~=section]")!
}

describe("PanelFallback", () => {
  it("draws the section in the panel's class grammar:  `section panel`, `sub` inside another panel", () => {
    const outer = Fixture.render(`<x-fb-panel header="Theme" color="violet">
      <x-fb-panel header="Color">fields</x-fb-panel>
    </x-fb-panel>`)
    const inner = outer.querySelector("x-fb-panel")!
    expect(root(outer).className).toBe("ui violet section panel")
    expect(root(inner).className).toBe("ui section panel sub")
  })

  it("still folds:  a real fold button over `hidden=until-found` content", () => {
    const host = Fixture.render(`<x-fb-panel header="Presets" collapsible>chips</x-fb-panel>`)
    const shadow = FallbackStub.shadow(host)
    const button = shadow.querySelector<HTMLButtonElement>("button[part~=toggle]")!
    const content = shadow.querySelector("[part~=content]")!
    button.click()
    expect(content.getAttribute("hidden")).toBe("until-found")
    expect(host.hasAttribute("collapsed")).toBe(true)
  })
})
