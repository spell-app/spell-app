import { describe, expect, it } from "vite-plus/test"

import { E, V } from "$/ui/api"
import * as elements from "$/ui/elements"
import * as vocabulary from "$/ui/vocabulary"

/**
 * `@spell-app/ui/api`:  `E` / `V` MUST stay the whole `$/ui/elements` / `$/ui/vocabulary` surface, although `V` goes through
 * `vocabulary.api.ts` (see `api.ts`), and survive the circular barrels (`AGENTS.md`:  `barrel.test.ts`).
 */
describe("api entry", () => {
  it("E ~== the $/ui/elements barrel, forms bases included", () => {
    expect(Object.keys(E).sort()).toEqual(Object.keys(elements).sort())
    expect(E.UIElement).toBe(elements.UIElement)
    expect(E.FormElement).toBeTypeOf("function")
    expect(E.ClassBuilder).toBeTypeOf("function")
  })

  it("V ~== the $/ui/vocabulary barrel", () => {
    expect(Object.keys(V).sort()).toEqual(Object.keys(vocabulary).sort())
    expect(V.Vocabulary).toBe(vocabulary.Vocabulary)
    expect(V.Converters).toBeDefined()
  })
})
