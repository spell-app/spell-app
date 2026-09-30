import { describe, expect, it } from "vitest"

import { E, V } from "$/api"
import * as elements from "$/elements"
import * as vocabulary from "$/vocabulary"

/**
 * `@spell/ui/api`:  `E` / `V` MUST stay the whole `$/elements` / `$/vocabulary` surface, although `V` goes through
 * `vocabulary.api.ts` (see `api.ts`), and survive the circular barrels (`AGENTS.md`:  `barrel.test.ts`).
 */
describe("api entry", () => {
  it("E ~== the $/elements barrel, forms bases included", () => {
    expect(Object.keys(E).sort()).toEqual(Object.keys(elements).sort())
    expect(E.UIElement).toBe(elements.UIElement)
    expect(E.FormElement).toBeTypeOf("function")
    expect(E.ClassBuilder).toBeTypeOf("function")
  })

  it("V ~== the $/vocabulary barrel", () => {
    expect(Object.keys(V).sort()).toEqual(Object.keys(vocabulary).sort())
    expect(V.Vocabulary).toBe(vocabulary.Vocabulary)
    expect(V.Converters).toBeDefined()
  })
})
