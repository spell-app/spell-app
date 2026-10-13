import { describe, test, expect } from "vite-plus/test"

import { $fetch, LoadableFile } from "$/util"
import { SP } from "$/spell"
import { LSP } from "$/lsp"

/**
 * `$/lsp` MUST stay browser-safe:  the app's editor loads it.
 * - Node-only `SpellDiskWorkspace` is kept out of the barrel.  Pulling it in would ALSO install disk loading
 *   for every `LoadableFile` and turn off `SpellLocation`'s registry -- which is what these check for.
 */
describe("$/lsp barrel", () => {
  test("exports the portable pieces", () => {
    expect(LSP.SpellLanguageService).toBeTypeOf("function")
    expect(LSP.SpellLanguageServer).toBeTypeOf("function")
    expect("SpellDiskWorkspace" in LSP).toBe(false)
  })

  test("doesn't load anything disk-bound", () => {
    expect(LoadableFile.fetch).toBe($fetch)
    expect(SP.SpellLocation.useRegistry).toBe(true)
  })
})
