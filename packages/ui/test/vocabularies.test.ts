import { describe, expect, it } from "vite-plus/test"

import type { AttributeSpec, ComponentVocabulary } from "$/ui/vocabulary"
import { SkeletonText } from "$/ui/vocabulary/SkeletonText"
import { ROOT_CATALOG } from "$/ui/components/ui-root/ui-root.catalog"

/** Every family's English vocabulary module, by path:  the components' and the doc-only elements'. */
const MODULES = import.meta.glob<Record<string, unknown>>(
  ["/src/components/*/*.vocabulary.en.ts", "/src/docs-components/*/*.vocabulary.en.ts"],
  { eager: true }
)

/** Every exported vocabulary (a `tag` and an `attributes` array). */
const VOCABULARIES = Object.values(MODULES).flatMap((module) =>
  Object.values(module).filter(
    (value): value is ComponentVocabulary =>
      typeof value === "object" && value !== null && "tag" in value && "attributes" in value
  )
)

/** `[tag, attribute]` for each attribute matching `test`. */
function attributes(test: (spec: AttributeSpec) => boolean): [string, AttributeSpec][] {
  return VOCABULARIES.flatMap((vocabulary) =>
    vocabulary.attributes.filter(test).map((spec): [string, AttributeSpec] => [vocabulary.tag, spec])
  )
}

describe("*.vocabulary.en.ts kinds, across families", () => {
  it("finds the vocabularies", () => {
    expect(VOCABULARIES.length).toBeGreaterThan(40)
  })

  // frameworks render a bare `icon` as `icon="true"`:  only the `icon` kind reads that as "the default icon"
  it.each(attributes((spec) => spec.name === "icon"))(
    "<%s icon> is kind `icon` (or the `keyOnly` class)",
    (_, spec) => {
      expect(["icon", "keyOnly"]).toContain(spec.kind)
    }
  )

  // `<ui-root display="skeleton">` draws a placeholder for a described tag;  `none` says "none of its own" on purpose.
  // Parsed here, so a typo in skeleton text fails a test, not a page;  the catalog holds what it parses to
  it.each(VOCABULARIES.map((vocabulary) => [vocabulary.tag, vocabulary] as const))(
    "<%s> says what its skeleton is (skeleton text, or none), and the catalog agrees (else `yarn gen:root`)",
    (tag, vocabulary) => {
      expect(vocabulary.skeleton).toBeTypeOf("string")
      const skeleton = SkeletonText.parse(vocabulary.skeleton!)
      expect(ROOT_CATALOG[tag]?.skeleton).toEqual(skeleton || undefined)
    }
  )

  // the docs' API tables label `color` kinds "color";  a value emitted alone is `valueOnly`
  it.each(attributes((spec) => spec.kind === "color"))("<%s> `kind: color` is a colour", (_, spec) => {
    expect(spec.name).toBe("color")
  })
})

/** Source of every vocabulary and family types file:  pure data, imported in node too (`yarn site:data`, `gen:root`). */
const DATA_FILES = import.meta.glob<string>(
  [
    "/src/components/*/*.vocabulary.en.ts",
    "/src/components/*/*.types.ts",
    "/src/docs-components/*/*.vocabulary.en.ts",
    "/src/docs-components/*/*.types.ts"
  ],
  { query: "?raw", import: "default", eager: true }
)

describe("*.vocabulary.en.ts / *.types.ts imports", () => {
  // `$/ui/core` by VALUE loads the element layer, which node can't:  `yarn site:data` / `yarn gen:root` import every
  // vocabulary through tsx (no `?inline` css, no JSX)
  it.each(Object.entries(DATA_FILES))("%s imports `$/ui/core` for types only", (_, source) => {
    // one statement:  `import { ... } from` (braces may span lines) or `import X from`, not `import type`
    const valueImports = [...source.matchAll(/^import (?!type )(?:\{[^}]*\}|[\w*][^\n{]*?) from "\$\/ui\/core"/gm)]
      .map((match) => match[0])
      .filter((statement) => !/^import \{(\s*type \w+,?)+\s*\}/.test(statement))
    expect(valueImports).toEqual([])
  })
})
