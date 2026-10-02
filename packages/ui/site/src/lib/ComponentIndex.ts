import { getCollection } from "astro:content"

import { ValueSets, type ComponentTopic } from "$/ui/vocabulary"
import { ComponentDefinitions, type ComponentDefinition } from "$/ui/components/component-definitions"

import { STATUS_BADGES } from "./nav"
import { SearchText } from "./SearchText"

/**
 * The component list the site shows, at BUILD time:  one row per TAG (`ui-button`, `ui-buttons`, `ui-or` ...), from
 * `ComponentDefinitions` (the vocabularies' `topics` / `aka`), with each row's docs link.
 * - Used by the sidebar's component browser (`ComponentBrowser.astro`) and the `/components/` index, so both link
 *   the same way.
 * - A folder's main tag (`ui-button`) links to its page;  its other tags to their heading on it
 *   (`/components/ui-button/#ui-or`, the `<h3 id>` `VocabularyTable.astro` renders).
 * - NEVER import this from a client script:  `ComponentDefinitions` eagerly imports every vocabulary.  The client
 *   gets `clientIndex()`, written into the page as JSON.
 */
export class ComponentIndex {
  /** Every row, sorted by name;  built once per build. */
  private static cached?: Promise<ComponentRow[]>

  /** Every tag's row, A-Z by name. */
  static rows(): Promise<ComponentRow[]> {
    return (ComponentIndex.cached ??= ComponentIndex.build())
  }

  /**
   * One group per topic, in `ValueSets.topics` order (curated:  newcomer topics first, Fomantic's groups last);
   * a tag appears under EACH of its topics.  Topics no tag uses are left out.
   */
  static async topics(): Promise<TopicGroup[]> {
    const rows = await ComponentIndex.rows()
    return (ValueSets.topics as readonly ComponentTopic[])
      .map((topic) => ({
        topic,
        title: ComponentIndex.topicTitle(topic),
        rows: rows.filter((row) => row.topics.includes(topic))
      }))
      .filter((group) => group.rows.length > 0)
  }

  /**
   * What client scripts need per tag, written into every page as JSON (`ComponentBrowser.astro`):  `search`, the
   * browser's search key (`SearchText.key()`).  Live examples load through `<ui-root>`'s own catalog.
   */
  static async clientIndex(): Promise<ClientIndex> {
    const index: ClientIndex = {}
    for (const row of await ComponentIndex.rows()) index[row.tag] = { search: row.search }
    return index
  }

  /** `"date & time"` => `"Date & time"`. */
  static topicTitle(topic: string): string {
    return topic.charAt(0).toUpperCase() + topic.slice(1)
  }

  /** Every definition as a row, with its folder page's status badge. */
  private static async build(): Promise<ComponentRow[]> {
    const pages = new Map((await getCollection("components")).map((entry) => [entry.id, entry.data]))
    return ComponentDefinitions.all.map((definition) => ({
      tag: definition.tag,
      name: definition.name,
      folder: definition.folder,
      path: ComponentIndex.path(definition),
      main: definition.tag === definition.folder,
      topics: definition.topics,
      description: definition.description,
      badge: STATUS_BADGES[pages.get(definition.folder)?.status ?? "done"],
      search: SearchText.key([definition.name, definition.tag, ...definition.topics, ...definition.aka])
    }))
  }

  /** Site path of `definition`'s docs, WITHOUT the base:  its folder's page, plus `#<tag>` for a sub-tag. */
  private static path(definition: ComponentDefinition): string {
    const page = `/components/${definition.folder}/`
    return definition.tag === definition.folder ? page : `${page}#${definition.tag}`
  }
}

/** One tag in the component lists. */
export type ComponentRow = {
  /** e.g. `ui-or` */
  tag: string
  /** display name, e.g. `Or` */
  name: string
  /** its folder (family), e.g. `ui-button` */
  folder: string
  /** docs path, WITHOUT the base (see `url()`):  `/components/ui-button/` or `/components/ui-button/#ui-or` */
  path: string
  /** the folder's main tag, whose path is the page itself (so it can be `aria-current`) */
  main: boolean
  /** topic ids it's filed under */
  topics: readonly ComponentTopic[]
  /** the vocabulary's one-line summary */
  description?: string
  /** status badge of its folder's page;  none when `done` */
  badge?: string
  /** search key (`SearchText.key()`):  name, tag, topics and other names */
  search: string
}

/** One topic and its tags. */
export type TopicGroup = {
  /** topic id, e.g. `date & time` */
  topic: ComponentTopic
  /** display title, e.g. `Date & time` */
  title: string
  /** its tags, A-Z */
  rows: ComponentRow[]
}

/** Tag => what client scripts need about it (`ComponentIndex.clientIndex()`). */
export type ClientIndex = Record<string, { search: string }>
