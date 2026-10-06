import { describe, expect, it } from "vite-plus/test"

import * as core from "$/ui/core"
import * as forms from "$/ui/forms"
import * as elements from "$/ui/elements"

/**
 * Load-order smoke test for the two shared lib entries (WWOD §8 › "Barrels").
 * - The element-core files import `$/ui/core` back as `E` (and the `forms` files `$/ui/forms` as `F`):  a cycle, on
 *   purpose.  A binding the cycle leaves `undefined` slips past `tsc` and the bundler alike;  this catches it.
 * - Entered through `$/ui/core`, as every component file does;  the folder's other tests enter through the
 *   `$/ui/elements` barrel (whose first class file is `ClassBuilder`), so both routes run.
 * - NOTE: entering at a leaf the core reads while it evaluates -- `$/ui/elements/UIElement`, which `ContentPart`
 *   extends -- would throw:  that leaf is still mid-load when the core reaches its reader.  Nothing imports one by
 *   path but `core.ts` / `forms.ts`, and nothing may.
 */
describe("$/ui/core and $/ui/forms load order", () => {
  it("every export of $/ui/core is live", () => {
    expect(Object.keys(core).length).toBeGreaterThan(50)
    expect(undefinedExports(core)).toEqual([])
  })

  it("every export of $/ui/forms is live", () => {
    expect(Object.keys(forms).length).toBeGreaterThan(5)
    expect(undefinedExports(forms)).toEqual([])
  })

  it("E holds the very objects $/ui/core exports", () => {
    expect(Object.keys(core.E).sort()).toEqual(Object.keys(core).sort())
    expect(differentExports(core.E, core)).toEqual([])
  })

  it("F holds the very objects $/ui/forms exports", () => {
    expect(Object.keys(forms.F).sort()).toEqual(Object.keys(forms).sort())
    expect(differentExports(forms.F, forms)).toEqual([])
  })

  it("base classes are the real ones, not a half-loaded binding", () => {
    expect(core.ContentPart.prototype).toBeInstanceOf(core.UIElement)
    expect(core.SourceElement.prototype).toBeInstanceOf(core.UIElement)
    expect(forms.FormElement.prototype).toBeInstanceOf(core.UIElement)
    expect(core.SourceHost.prototype).toBeInstanceOf(core.UIHost)
    expect(core.SourceBodyHost.prototype).toBeInstanceOf(core.UIHost)
    expect(forms.FormHost.prototype).toBeInstanceOf(core.UIHost)
  })

  it("static initializers ran:  their values exist", () => {
    expect(core.RootSettings.generation).toBeInstanceOf(core.Cell)
    expect(forms.FormElement.validator).toBeInstanceOf(forms.Validator)
    expect(core.UIElement.prototype.Host).toBe(core.UIHost)
    expect(forms.FormElement.prototype.Host).toBe(forms.FormHost)
    expect(core.SourceElement.prototype.Host).toBe(core.SourceHost)
  })

  it("$/ui/elements hands out the same objects as the entries", () => {
    const entries: Record<string, unknown> = { ...core, ...forms }
    const different = Object.keys(elements).filter(
      (name) => (elements as Record<string, unknown>)[name] !== entries[name]
    )
    expect(different).toEqual([])
  })
})

/** Names `module` exports as `undefined`. */
function undefinedExports(module: object): string[] {
  return Object.entries(module)
    .filter(([, value]) => value === undefined)
    .map(([name]) => name)
}

/** Names whose value in `namespace` isn't the one in `module`. */
function differentExports(namespace: object, module: object): string[] {
  const named = module as Record<string, unknown>
  return Object.entries(namespace)
    .filter(([name, value]) => value !== named[name])
    .map(([name]) => name)
}
