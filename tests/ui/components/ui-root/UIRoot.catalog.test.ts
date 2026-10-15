import { describe, expect, it } from "vite-plus/test"

import { ComponentDefinitions } from "$/ui/components/ComponentDefinitions"
import { ROOT_CATALOG } from "$/ui/components/ui-root/UIRoot.catalog"

/**
 * `<ui-root>`'s generated catalog (`UIRoot.catalog.ts`) agrees with the vocabularies:  run `yarn gen:root` after
 * adding, moving or renaming a tag.
 */
describe("ROOT_CATALOG", () => {
  it("has every tag, the doc-only ones too, in its family's folder (else run `yarn gen:root`)", () => {
    const expected = Object.fromEntries(
      [...ComponentDefinitions.all, ...ComponentDefinitions.docs].map(
        (definition) => [definition.tag, definition.folder] as const
      )
    )
    const actual = Object.fromEntries(Object.entries(ROOT_CATALOG).map(([tag, entry]) => [tag, entry.folder] as const))
    expect(actual).toEqual(expected)
  })

  it("knows every tag, and its family", () => {
    expect(ROOT_CATALOG).toMatchObject({
      "ui-or": { folder: "ui-button" },
      "ui-content": { folder: "ui-parts" },
      "ui-root": { folder: "ui-root" }
    })
  })
})
