import { join } from "node:path"
import { describe, expect, test } from "vite-plus/test"

import { AS } from "spell-kit/assembler"

// the ONE list:  the page server waits on these folders (page-server's `BundleBuild`), the kit's `spell bundle` builds
// their bundles (moved here from spell-server's Bundle tests, epic `repo-split` P8:  it's spell-app's own settings)
describe("spell-app's bundles", () => {
  test("the root package.json's list names every bundle, each once", () => {
    const outputs = AS.Bundle.specs(join(import.meta.dirname, "../../..")).map((spec) => spec.name)
    expect([...outputs].sort()).toEqual(AS.BUNDLES.map((spec) => spec.name).sort())
    expect(new Set(outputs).size).toBe(outputs.length)
  })
})
