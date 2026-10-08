import type { SiteDataFile, SiteTag } from "$/ui/docs-components/docs-components.types"

import { INDEX_PAGE, PAGE_EXTENSION, SEARCH_SEPARATOR, type NavRow, type NavTopic } from "./UIDocsNav.types"

/****************
 * ### `NavIndex`
 * What `<ui-docs-nav>` lists, built once from the site's data (`SiteData`):  one row per COMPONENT tag, A-Z,
 * and one group per topic.  Replaces the Astro site's `ComponentIndex` (build time) + `SearchText` (shared with the
 * client).
 * - Rows:  `components` only;  the doc-only `<ui-docs-*>` tags (`docs`) are never listed.
 * - Topics:  in the data's order (`ValueSets.topics`:  newcomer topics first, Fomantic's groups last);
 *   a tag sits under EACH of its topics;  a topic no tag uses is left out.
 * - Search:  blind to case, spacing, dashes and other punctuation (`date time` ~== `Date & Time` ~== `date-time`);
 *   matches a substring of the name, the tag, a topic (id or title) or another name (`aka`).
 * - Plain data, no Solid:  the element keeps the query in a signal and asks `matching()`.
 ****************/
export class NavIndex {
  /** Every component tag, A-Z by name. */
  readonly rows: readonly NavRow[]

  /** Every topic with a tag, in the data's order, its rows A-Z. */
  readonly topics: readonly NavTopic[]

  /** Rows by tag. */
  private readonly byTag: ReadonlyMap<string, NavRow>

  constructor(data: SiteDataFile) {
    const titles = new Map(data.topics.map((topic) => [topic.id, topic.title]))
    this.rows = [...data.components]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((tag) => NavIndex.row(data, tag, titles))
    this.byTag = new Map(this.rows.map((row) => [row.tag, row]))
    this.topics = data.topics
      .map((topic) => ({ ...topic, rows: this.rows.filter((row) => row.topics.includes(topic.id)) }))
      .filter((topic) => topic.rows.length > 0)
  }

  /** `tag`'s row, or `undefined` (not a component:  a page, a docs tag, a removed tag). */
  row(tag: string): NavRow | undefined {
    return this.byTag.get(tag)
  }

  /** The tags matching `query` (normalized, `normalize()`);  every tag for an empty one. */
  matching(query: string): ReadonlySet<string> {
    return new Set(this.rows.filter((row) => NavIndex.matches(row.search, query)).map((row) => row.tag))
  }

  /**
   * The page shown, by its own URL:  its file name without `.html`;  a folder (`/ui/`) is `index`.
   * - What `current` defaults to.
   */
  static page(): string {
    const file = location.pathname.slice(location.pathname.lastIndexOf("/") + 1)
    return file ? file.replace(PAGE_EXTENSION, "") : INDEX_PAGE
  }

  ////////////////
  // ## Search text
  ////////////////

  /** `"Date & Time"` / `"date-time"` / `"ui-date"` => `"datetime"` / `"datetime"` / `"uidate"`. */
  static normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}]+/gu, "")
  }

  /**
   * One haystack from several terms (name, tag, topics, other names).
   * - Joined with `SEARCH_SEPARATOR`, which `normalize()` never leaves in a query, so a query can't match across two
   *   terms.
   */
  static key(terms: readonly string[]): string {
    return terms
      .map((term) => NavIndex.normalize(term))
      .filter(Boolean)
      .join(SEARCH_SEPARATOR)
  }

  /** Does `key` (from `key()`) contain the normalized `query`?  An empty query matches everything. */
  static matches(key: string, query: string): boolean {
    return !query || key.includes(query)
  }

  /**
   * `tag` as a row:  its link, status and search key.
   * - Status:  its own page's (`SiteFamily.pages`) for a sub-tag with one, else its family's.
   */
  private static row(data: SiteDataFile, tag: SiteTag, titles: ReadonlyMap<string, string>): NavRow {
    const family = Object.hasOwn(data.families, tag.folder) ? data.families[tag.folder] : undefined
    const own = family?.pages && Object.hasOwn(family.pages, tag.tag) ? family.pages[tag.tag] : undefined
    const status = own?.status ?? family?.status ?? "done"
    const topicTitles = tag.topics.map((topic) => titles.get(topic) ?? topic)
    return {
      tag: tag.tag,
      name: tag.name,
      href: tag.href ?? `components/${tag.folder}.html#${tag.tag}`,
      page: tag.page,
      topics: tag.topics,
      ...(status === "done" ? {} : { status }),
      search: NavIndex.key([tag.name, tag.tag, ...tag.topics, ...topicTitles, ...tag.aka])
    }
  }
}
