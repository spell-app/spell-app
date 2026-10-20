import { describe, expect, it } from "vite-plus/test"

import * as spellElement from "$/spell-element"

/**
 * `$/spell-element`'s barrel.
 * - The files import the barrel back as `E`:  a cycle, on purpose.
 *   A binding the cycle leaves `undefined` slips past `tsc` and the bundler alike;  this catches it.
 * - It imports only util's generic files (`@spell-app/util/class` ...) and Solid:  never Spell UI, or any other package.
 * - How Spell UI carries it (its core entry re-exports every name, and installs its settings):
 *   Spell UI's barrel and settings tests (`tests/ui/src/elements/`).
 */
describe("$/spell-element", () => {
  it("every export is live", () => {
    expect(Object.keys(spellElement).length).toBeGreaterThan(30)
    expect(Object.entries(spellElement).filter(([, value]) => value === undefined)).toEqual([])
  })

  it("E holds the very objects the barrel exports", () => {
    expect(Object.keys(spellElement.E).sort()).toEqual(Object.keys(spellElement).sort())
    const named = spellElement as Record<string, unknown>
    expect(Object.entries(spellElement.E).filter(([name, value]) => value !== named[name])).toEqual([])
  })

  it("base classes are the real ones, not a half-loaded binding", () => {
    expect(spellElement.UIComponent.prototype.elementSetup.DOMElement).toBe(spellElement.DOMElement)
    expect(spellElement.UIComponent.registry.definitions).toBeInstanceOf(Map)
  })

  it("a task waiting for settings runs at once when they're in;  install() runs the waiting ones, in order", () => {
    const { SpellSolid } = spellElement
    const ran: string[] = []
    SpellSolid.whenInstalled(() => ran.push("now"))
    expect(ran).toEqual(["now"])
    // a page that swaps its runtime:  installing again keeps working, and runs nothing twice
    SpellSolid.install(SpellSolid.settings)
    expect(ran).toEqual(["now"])
  })

  it("imports nothing but util's generic files, Solid, and itself", () => {
    const sources = import.meta.glob<string>("../../../packages/spell-element/src/**/*.{ts,tsx}", {
      eager: true,
      query: "?raw",
      import: "default"
    })
    const allowed =
      /^(\.\/|\$\/spell-element$|@spell-app\/util\/(class|decorators|dom|string|util\.types)$|solid-js$|@solidjs\/web$)/
    const strays = Object.entries(sources).flatMap(([file, text]) =>
      [...text.matchAll(/^\s*(?:import|export)\b[^"']*?from\s+["']([^"']+)["']/gm)]
        .map((match) => match[1]!)
        .filter((specifier) => !allowed.test(specifier))
        .map((specifier) => `${file.replace(/^.*\/src\//, "")}: ${specifier}`)
    )
    expect(Object.keys(sources).length).toBeGreaterThan(10)
    expect(strays).toEqual([])
  })
})
