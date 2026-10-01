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

  // the docs' API tables label `color` kinds "color";  a value emitted alone is `valueOnly`
  it.each(attributes((spec) => spec.kind === "color"))("<%s> `kind: color` is a colour", (_, spec) => {
    expect(spec.name).toBe("color")
  })
})
