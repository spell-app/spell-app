import { describe, expect, it } from "vitest"

import type { AttributeSpec, ComponentVocabulary } from "$/ui/vocabulary"

/** Every family's English vocabulary module, by path. */
const MODULES = import.meta.glob<Record<string, unknown>>("/src/components/*/*.vocabulary.en.ts", { eager: true })

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

describe("vocabulary kinds, across families", () => {
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

  // `<ui-root display="skeleton">` draws a placeholder for a described tag;  `null` says "none of its own" on purpose
  it.each(VOCABULARIES.map((vocabulary) => [vocabulary.tag, vocabulary] as const))(
    "<%s> says what its skeleton is (a description, or null)",
    (_, vocabulary) => {
      expect(vocabulary).toHaveProperty("skeleton")
      const { skeleton } = vocabulary
      if (skeleton === null) return
      expect(skeleton?.parts?.length || skeleton?.height || skeleton?.width).toBeTruthy()
      for (const length of [skeleton?.width, skeleton?.height]) if (length) expect(length).toMatch(/^\d+(\.\d+)?em$/)
    }
  )

  // the docs' API tables label `color` kinds "color";  a value emitted alone is `valueOnly`
  it.each(attributes((spec) => spec.kind === "color"))("<%s> `kind: color` is a colour", (_, spec) => {
    expect(spec.name).toBe("color")
  })
})

/** Source of every vocabulary and family types file:  pure data, read by the docs site's server render too. */
const DATA_FILES = import.meta.glob<string>(["/src/components/*/*.vocabulary.en.ts", "/src/components/*/*.types.ts"], {
  query: "?raw",
  import: "default",
  eager: true
})

describe("vocabularies and types files stay pure data", () => {
  // `$/ui/core` by VALUE loads the element layer, whose Solid client APIs throw in `astro dev`'s server render
  it.each(Object.entries(DATA_FILES))("%s imports `$/ui/core` for types only", (_, source) => {
    // one statement:  `import { ... } from` (braces may span lines) or `import X from`, not `import type`
    const valueImports = [...source.matchAll(/^import (?!type )(?:\{[^}]*\}|[\w*][^\n{]*?) from "\$\/ui\/core"/gm)]
      .map((match) => match[0])
      .filter((statement) => !/^import \{(\s*type \w+,?)+\s*\}/.test(statement))
    expect(valueImports).toEqual([])
  })
})
