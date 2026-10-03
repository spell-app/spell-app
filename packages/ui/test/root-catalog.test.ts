import { describe, expect, it } from "vite-plus/test"

import { ComponentDefinitions } from "$/ui/components/component-definitions"
import { ROOT_CATALOG } from "$/ui/components/ui-root/ui-root.catalog"

/**
 * `<ui-root>`'s generated catalog (`ui-root.catalog.ts`) agrees with the vocabularies:  run `yarn gen:root` after
 * adding, moving or renaming a tag.
 */
describe("ui-root catalog", () => {
  it("has every tag, in its family's folder (else run `yarn gen:root`)", () => {
    const expected = Object.fromEntries(
      ComponentDefinitions.all.map((definition) => [definition.tag, definition.folder] as const)
    )
    const actual = Object.fromEntries(Object.entries(ROOT_CATALOG).map(([tag, entry]) => [tag, entry.folder] as const))
    expect(actual).toEqual(expected)
  })
})
