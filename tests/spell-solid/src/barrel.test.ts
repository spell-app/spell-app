import { describe, expect, it } from "vite-plus/test"

import * as spellSolid from "$/spell-solid"
import * as core from "$/ui/core"

/**
 * `$/spell-solid`'s barrel, and how Spell UI carries it.
 * - The files import the barrel back as `E`:  a cycle, on purpose.
 *   A binding the cycle leaves `undefined` slips past `tsc` and the bundler alike;  this catches it.
 * - Spell UI's `$/ui/core` re-exports every name, so its `E` holds them too.
 * - A component pack that imports `$/spell-solid` reads Spell UI's core module from the page (`SpellUI.packModules`):
 *   ONE copy on a page.
 * - It imports only `$/util`'s generic files and Solid:  never Spell UI, or any other package.
 */
describe("$/spell-solid", () => {
  it("every export is live", () => {
    expect(Object.keys(spellSolid).length).toBeGreaterThan(30)
    expect(Object.entries(spellSolid).filter(([, value]) => value === undefined)).toEqual([])
  })

  it("E holds the very objects the barrel exports", () => {
    expect(Object.keys(spellSolid.E).sort()).toEqual(Object.keys(spellSolid).sort())
    const named = spellSolid as Record<string, unknown>
    expect(Object.entries(spellSolid.E).filter(([name, value]) => value !== named[name])).toEqual([])
  })

  it("base classes are the real ones, not a half-loaded binding", () => {
    expect(spellSolid.UIComponent.prototype.elementSetup.DOMElement).toBe(spellSolid.DOMElement)
    expect(spellSolid.UIComponent.registry.definitions).toBeInstanceOf(Map)
  })

  it("Spell UI's core carries every name, the same objects:  its E is a superset", () => {
    const fromCore = core as Record<string, unknown>
    const missing = Object.keys(spellSolid).filter((name) => name !== "E" && !(name in core))
    const different = Object.entries(spellSolid).filter(([name, value]) => name !== "E" && fromCore[name] !== value)
    expect(missing).toEqual([])
    expect(different.map(([name]) => name)).toEqual([])
    expect(core.E.UIComponent).toBe(spellSolid.E.UIComponent)
  })

  it("Spell UI's settings are installed as its core loads", () => {
    expect(spellSolid.SpellSolid.isInstalled).toBe(true)
    expect(spellSolid.SpellSolid.settings.motion.defaultAnimation).toBe("fade")
    expect(spellSolid.UIComponent.prototype.elementSetup.animation).toBe("fade")
  })

  it("a task waiting for settings runs at once when they're in;  install() runs the waiting ones, in order", () => {
    const { SpellSolid } = spellSolid
    const ran: string[] = []
    SpellSolid.whenInstalled(() => ran.push("now"))
    expect(ran).toEqual(["now"])
    // a page that swaps its runtime:  installing again keeps working, and runs nothing twice
    SpellSolid.install(SpellSolid.settings)
    expect(ran).toEqual(["now"])
  })

  it("imports nothing but $/util's generic files, Solid, and itself", () => {
    const sources = import.meta.glob<string>("../../../packages/spell-solid/src/**/*.{ts,tsx}", {
      eager: true,
      query: "?raw",
      import: "default"
    })
    const allowed =
      /^(\.\/|\$\/spell-solid$|\$\/util\/(class|decorators|dom|string|util\.types)$|solid-js$|@solidjs\/web$)/
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
