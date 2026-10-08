import { describe, expect, it } from "vite-plus/test"

import * as library from "$/ui"
import { ComponentDefinitions } from "$/ui/components/ComponentDefinitions"
import { ValueSets } from "$/ui/vocabulary"

/** Tag of every element class `@spell-app/ui` exports (each carries its vocabulary). */
const EXPORTED_TAGS = Object.values(library)
  // classes only:  `UI` is a proxy that throws on any key before the runtime loads
  .filter((value) => typeof value === "function")
  .map((value) => (value as { prototype?: { vocabulary?: { tag?: unknown } } }).prototype?.vocabulary?.tag)
  .filter((tag): tag is string => typeof tag === "string")

describe("ComponentDefinitions", () => {
  it("has exactly one definition per tag, each a defined element", () => {
    const tags = ComponentDefinitions.all.map((definition) => definition.tag)
    expect(new Set(tags).size).toBe(tags.length)
    for (const tag of tags) expect(customElements.get(tag), tag).toBeDefined()
  })

  it("has a definition for every element class the library exports", () => {
    expect(EXPORTED_TAGS.length).toBeGreaterThan(80)
    for (const tag of EXPORTED_TAGS) expect(ComponentDefinitions.byTag(tag), tag).toBeDefined()
  })

  it("files every tag, doc-only ones too, under at least two known topics, and names other names", () => {
    const known = new Set<string>(ValueSets.topics)
    for (const { tag, topics, aka } of [...ComponentDefinitions.all, ...ComponentDefinitions.docs]) {
      expect(topics.length, `${tag}:  add topics to its vocabulary`).toBeGreaterThanOrEqual(2)
      for (const topic of topics) expect(known.has(topic), `${tag}:  unknown topic ${topic}`).toBe(true)
      expect(aka.length, `${tag}:  add aka to its vocabulary`).toBeGreaterThan(0)
    }
  })

  it("uses every topic somewhere", () => {
    const used = new Set(
      [...ComponentDefinitions.all, ...ComponentDefinitions.docs].flatMap((definition) => definition.topics)
    )
    expect(ValueSets.topics.filter((topic) => !used.has(topic))).toEqual([])
  })

  it("keeps the doc-only `<ui-docs-*>` elements apart:  in `docs`, filed under `documentation`, never in `all`", () => {
    expect(ComponentDefinitions.docs.map((definition) => definition.tag)).toContain("ui-docs-example")
    for (const { tag, topics } of ComponentDefinitions.docs) {
      expect(tag.startsWith("ui-docs-"), tag).toBe(true)
      expect(topics, tag).toContain("documentation")
    }
    expect(ComponentDefinitions.all.filter((definition) => definition.tag.startsWith("ui-docs-"))).toEqual([])
    expect(ComponentDefinitions.all.filter((definition) => definition.topics.includes("documentation"))).toEqual([])
    expect(ComponentDefinitions.byTag("ui-docs-example")).toBeUndefined()
  })

  it("puts a folder's main tag first, and names tags readably", () => {
    expect(ComponentDefinitions.byFolder().get("ui-button")?.[0]?.tag).toBe("ui-button")
    expect(ComponentDefinitions.nameOf("ui-breadcrumb-section")).toBe("Breadcrumb section")
    expect(ComponentDefinitions.byTag("ui-or")?.folder).toBe("ui-button")
  })
})

describe("UIComponent.describe()", () => {
  it("exposes the whole vocabulary live on the class", () => {
    expect(library.UIButton.describe().tag).toBe("ui-button")
    expect(library.UIButton.describe().topics).toContain("buttons")
  })
})
