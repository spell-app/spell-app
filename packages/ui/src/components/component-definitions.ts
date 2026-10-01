import type { ComponentTopic, ComponentVocabulary } from "$/ui/vocabulary"

/** One tag, as the docs' component browser (and later `<ui-root>`'s loader) needs it. */
export type ComponentDefinition = {
  /** Canonical tag, e.g. `ui-buttons`. */
  readonly tag: string
  /** Its folder under `src/components/` (= its family, its docs page, its package entry), e.g. `ui-button`. */
  readonly folder: string
  /** Display name from the tag:  `ui-breadcrumb-section` => `Breadcrumb section`. */
  readonly name: string
  /** What it's filed under (the vocabulary's `topics`). */
  readonly topics: readonly ComponentTopic[]
  /** Other names people search for (the vocabulary's `aka`). */
  readonly aka: readonly string[]
  /** The vocabulary's one-line summary. */
  readonly description?: string
}

/** Every English vocabulary module, by path.  Above the class:  `ComponentDefinitions.all` reads it at definition. */
const VOCABULARY_MODULES = import.meta.glob<Record<string, unknown>>("./*/*.vocabulary.en.ts", { eager: true })

/** A vocabulary module's folder:  `./ui-button/ui-or.vocabulary.en.ts` => `ui-button`. */
const FOLDER = /^\.\/([\w-]+)\//

/**
 * Every component tag's definition, rolled up from each folder's vocabularies (`<tag>.vocabulary.en.ts`):  the topics
 * and other names live IN the vocabulary (translatable, and live on the class as `UIButton.vocabulary`);  this only
 * collects them.
 * - Reads the vocabulary MODULES (`import.meta.glob`, eager), never the families' `index.ts`, so nothing is defined
 *   as a side effect.  NOT re-exported by `core`:  for the docs site, tools and tests (and later `<ui-root>`).
 * - A new tag needs nothing here:  its vocabulary's `topics` / `aka` are picked up (`test/component-definitions.test.ts`
 *   checks every defined tag has a definition with topics).
 */
export class ComponentDefinitions {
  /** Every definition, sorted by name. */
  static readonly all: readonly ComponentDefinition[] = ComponentDefinitions.collect()

  /** The definition of `tag`, if it's a component tag. */
  static byTag(tag: string): ComponentDefinition | undefined {
    return ComponentDefinitions.all.find((definition) => definition.tag === tag)
  }

  /** Topic => its definitions (sorted by name), in `ValueSets.topics` order of first use;  a tag under each topic. */
  static byTopic(): Map<ComponentTopic, ComponentDefinition[]> {
    const topics = new Map<ComponentTopic, ComponentDefinition[]>()
    for (const definition of ComponentDefinitions.all) {
      for (const topic of definition.topics) {
        const list = topics.get(topic) ?? []
        list.push(definition)
        topics.set(topic, list)
      }
    }
    return topics
  }

  /** Folder => its tags' definitions, the folder's main tag (`ui-<folder>`) first. */
  static byFolder(): Map<string, ComponentDefinition[]> {
    const folders = new Map<string, ComponentDefinition[]>()
    for (const definition of ComponentDefinitions.all) {
      const list = folders.get(definition.folder) ?? []
      list.push(definition)
      folders.set(definition.folder, list)
    }
    for (const [folder, list] of folders) {
      list.sort((a, b) => Number(b.tag === folder) - Number(a.tag === folder) || a.name.localeCompare(b.name))
    }
    return folders
  }

  /** `ui-breadcrumb-section` => `Breadcrumb section`. */
  static nameOf(tag: string): string {
    const words = tag.replace(/^ui-/, "").replace(/-/g, " ")
    return words.charAt(0).toUpperCase() + words.slice(1)
  }

  /** Every vocabulary object of every `<tag>.vocabulary.en.ts`, with its folder. */
  private static collect(): ComponentDefinition[] {
    const definitions: ComponentDefinition[] = []
    for (const [path, module] of Object.entries(VOCABULARY_MODULES)) {
      const folder = FOLDER.exec(path)?.[1]
      if (!folder) continue
      for (const value of Object.values(module)) {
        if (!ComponentDefinitions.isVocabulary(value)) continue
        definitions.push({
          tag: value.tag,
          folder,
          name: ComponentDefinitions.nameOf(value.tag),
          topics: value.topics ?? [],
          aka: value.aka ?? [],
          description: value.description
        })
      }
    }
    return definitions.sort((a, b) => a.name.localeCompare(b.name))
  }

  /** A component vocabulary (a `tag` and `attributes`), not a constant or a helper a module also exports. */
  private static isVocabulary(value: unknown): value is ComponentVocabulary {
    return typeof value === "object" && value !== null && "tag" in value && "attributes" in value
  }
}
