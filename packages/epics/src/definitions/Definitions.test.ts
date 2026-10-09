import { readdirSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, test } from "vite-plus/test"

import {
  Definitions,
  FLOW,
  ItemLetters,
  OVERVIEW_PART,
  SectionIds,
  type EpicAttributeSpec,
  type EpicTag
} from "$/epics/definitions"
import { SkeletonText } from "$/ui/vocabulary/SkeletonText"

/** The pack's family folders. */
const COMPONENTS = fileURLToPath(new URL("../../components/", import.meta.url))

/** `HTMLElement` properties an attribute's might shadow:  the global attributes'. */
const PLATFORM_PROPERTIES = ["id", "title", "hidden", "lang", "dir", "slot", "style", "role", "part", "className"]

/** A vocabulary file:  `<Name>.en.ts`, named for its tag's component (`EpicItem.en.ts`). */
const VOCABULARY_FILE = /^([A-Z]\w*)\.en\.ts$/

/** Every `<Name>.en.ts` under `components/`, as its tag:  `EpicItem.en.ts` => `epic-item`. */
function vocabularyFiles(): string[] {
  return readdirSync(COMPONENTS, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((folder) => readdirSync(`${COMPONENTS}${folder.name}`))
    .flatMap((file) => VOCABULARY_FILE.exec(file)?.[1] ?? [])
    .map((name) => name.replace(/(?<=[a-z0-9])(?=[A-Z])/g, "-").toLowerCase())
}

/** `tag`'s attribute named `name`. */
function attributeNamed(tag: EpicTag, name: string): EpicAttributeSpec | undefined {
  return Definitions.all[tag].attributes.find((spec: EpicAttributeSpec) => spec.name === name)
}

describe("Definitions.all", () => {
  test("lists EVERY vocabulary file under `components/`, each under its own tag", () => {
    expect(Definitions.tags.toSorted()).toEqual(vocabularyFiles().toSorted())
    for (const tag of Definitions.tags) expect(Definitions.all[tag].tag).toBe(tag)
  })

  test("every tag is filed (2+ topics, `aka`), its skeleton (if any) is skeleton text, and it has a `base` part", () => {
    for (const tag of Definitions.tags) {
      const vocabulary = Definitions.of(tag)!
      expect(vocabulary.topics!.length, tag).toBeGreaterThanOrEqual(2)
      expect(vocabulary.aka!.length, tag).toBeGreaterThan(0)
      if (vocabulary.skeleton !== undefined) expect(() => SkeletonText.parse(vocabulary.skeleton!), tag).not.toThrow()
      expect(
        vocabulary.parts.map((part) => part.name),
        tag
      ).toContain("base")
    }
  })

  test("every content model names known tags, attributes and values;  every `or slot` attribute has its slot", () => {
    for (const tag of Definitions.tags) {
      const vocabulary = Definitions.of(tag)!
      for (const spec of vocabulary.children) {
        if (spec.tag !== FLOW) expect(Definitions.has(spec.tag), `${tag} > ${spec.tag}`).toBe(true)
        if (spec.slot)
          expect(
            vocabulary.slots.map((slot) => slot.name),
            `${tag} slot`
          ).toContain(spec.slot)
        if (spec.where) {
          const values = attributeNamed(spec.tag as EpicTag, spec.where.attribute)?.values
          expect(values, `${tag} > ${spec.tag}[${spec.where.attribute}]`).toEqual(
            expect.arrayContaining([...spec.where.values])
          )
        }
        if (spec.when) {
          const values = attributeNamed(tag, spec.when.attribute)?.values
          expect(values, `${tag}[${spec.when.attribute}]`).toEqual(expect.arrayContaining([...spec.when.values]))
        }
      }
      for (const spec of vocabulary.attributes) {
        if (spec.required === "or slot")
          expect(
            vocabulary.slots.map((slot) => slot.name),
            tag
          ).toContain(spec.name)
      }
    }
  })

  test("no attribute's JS property shadows the platform's own (`DOMElement` refuses it):  `id` is `epicId` ...", () => {
    for (const tag of Definitions.tags) {
      for (const spec of Definitions.of(tag)!.attributes) {
        expect(PLATFORM_PROPERTIES, `${tag} ${spec.name}`).not.toContain(spec.property ?? Definitions.keyOf(spec))
      }
    }
  })

  test("`<epic-section kind>` is `SectionIds`' kinds plus `overview-part`;  `ItemLetters` names only those", () => {
    expect(attributeNamed("epic-section", "kind")!.values).toEqual([OVERVIEW_PART, ...Object.keys(SectionIds)])
    for (const kind of Object.keys(ItemLetters)) expect(Object.keys(SectionIds)).toContain(kind)
  })
})

describe("Definitions.attribute()", () => {
  test("finds an attribute by its camelCase key, the element's property", () => {
    expect(Definitions.attribute("epic-item", "reviewAs")!.name).toBe("review-as")
    expect(Definitions.attribute("epic-item", "review-as")).toBeUndefined()
  })
})

describe("Definitions.valueProblem() / parse() / text()", () => {
  const status = attributeNamed("epic-item", "status")!
  const answered = attributeNamed("epic-item", "answered")!
  const phase = attributeNamed("epic-item", "phase")!
  const reviewed = attributeNamed("epic-item", "reviewed")!

  test("checks values, booleans, numbers and formats", () => {
    expect(Definitions.valueProblem(status, "open")).toBeUndefined()
    expect(Definitions.valueProblem(status, "closed")).toMatch(/isn't one of its values/)
    expect(Definitions.valueProblem(answered, "")).toBeUndefined()
    expect(Definitions.valueProblem(answered, "maybe")).toMatch(/isn't a boolean/)
    expect(Definitions.valueProblem(phase, "3")).toBeUndefined()
    expect(Definitions.valueProblem(phase, "three")).toMatch(/isn't a number/)
    expect(Definitions.valueProblem(reviewed, "2026-10-07")).toBeUndefined()
    expect(Definitions.valueProblem(reviewed, "10-07")).toMatch(/isn't a well-formed date/)
  })

  test("parses Spell UI's boolean spellings, and numbers", () => {
    expect(["", "true", "yes", "false", "no"].map((text) => Definitions.parse(answered, text))).toEqual([
      true,
      true,
      true,
      false,
      false
    ])
    expect(Definitions.parse(phase, "3")).toBe(3)
  })

  test("writes `true` as presence, leaves `false` / `undefined` out, and refuses the wrong type", () => {
    expect(Definitions.text(answered, true)).toBe("")
    expect(Definitions.text(answered, false)).toBeUndefined()
    expect(Definitions.text(phase, 3)).toBe("3")
    expect(() => Definitions.text(phase, "3")).toThrow(TypeError)
    expect(() => Definitions.text(status, "closed")).toThrow(/isn't one of its values/)
  })
})
