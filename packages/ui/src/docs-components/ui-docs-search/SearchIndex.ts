import type { SiteDataFile, SiteSearchFile, SiteTag } from "$/ui/docs-components/docs-components.types"
import {
  GROUP_LIMIT,
  INSIDE_MIN,
  KIND_WEIGHT,
  SCORES,
  TRAIL,
  type SearchEntry,
  type SearchGroup,
  type SearchHit,
  SearchKinds,
  type SearchKind
} from "./ui-docs-search.types"

/****************
 * ### `SearchIndex`
 * What `<ui-docs-search>` searches, and how it ranks:  every component tag, every attribute, every page and every
 * page's sections, built once from the site's data (`components.json` + `search.json`);  the page shown's sections
 * come live, per search (`PageOutline`).
 * - Matching is blind to case and accents.  The WHOLE query is tried against the title (exact, start, a word's
 *   start, inside), then against each term (a tag, another name, a topic ...);  failing those, every WORD of the
 *   query must start a word somewhere (title or terms), so `button circular` finds `circular` on `<ui-button>`.
 *   Inside-a-word matches need `INSIDE_MIN` characters:  `or` finds `Or`, never every `color`.
 * - Ranking:  `SCORES` by how it matched, times `KIND_WEIGHT`, plus the entry's `boost`, minus a little per title
 *   character (the shorter title wins a tie).  Groups show their best `GROUP_LIMIT`;  the group with the best hit
 *   comes first (ties:  `SearchKinds` order).
 * - The page shown:  its own sections come from the DOM, so the search file's copy of that page is skipped;  its
 *   attributes get a small boost.
 * - Plain data, no Solid:  the element keeps the query in a signal and asks `search()`.
 ****************/
export class SearchIndex {
  /** Every entry, but the page shown's sections. */
  readonly entries: readonly SearchEntry[]

  /** Entries of each page's sections, by page path:  skipped for the page shown. */
  private readonly pageOf: ReadonlyMap<SearchEntry, string>

  /** Folded (`fold()`) title and terms of each entry, made once. */
  private readonly keys: ReadonlyMap<SearchEntry, Key>

  /** Index what loaded:  `data`'s tags and attributes, `search`'s pages and sections;  neither:  an empty index. */
  constructor({ data, search }: SearchIndexProps = {}) {
    const entries: SearchEntry[] = []
    const pageOf = new Map<SearchEntry, string>()
    const families = data?.families ?? {}
    const topics = data?.topics ?? []
    for (const tag of data?.components ?? []) {
      const page = tag.href?.replace(/#.*$/, "") ?? `components/${tag.mainTag}.html`
      const family = Object.hasOwn(families, tag.folder) ? families[tag.folder]!.title : tag.name
      const component = SearchIndex.component(tag, family, topics)
      entries.push(component)
      pageOf.set(component, page)
      for (const attribute of SearchIndex.attributes(tag, page, family)) {
        entries.push(attribute)
        pageOf.set(attribute, page)
      }
    }
    for (const page of search?.pages ?? []) {
      if (!page.tag) {
        const entry: SearchEntry = {
          kind: "page",
          title: page.title,
          ...(page.summary && { context: page.summary }),
          href: page.path,
          terms: [page.path.replace(/\.html$/, "").replace(/\/index$/, "")]
        }
        entries.push(entry)
        pageOf.set(entry, page.path)
      }
      page.sections.forEach((section, at) => {
        const entry: SearchEntry = {
          kind: "section",
          title: section.title,
          context: [page.title, ...SearchIndex.trail(page.sections, at, page.tabs)].join(TRAIL),
          href: `${page.path}#${section.id}`,
          terms: [page.title, section.id]
        }
        entries.push(entry)
        pageOf.set(entry, `${page.path}#`)
      })
    }
    this.entries = entries
    this.pageOf = pageOf
    this.keys = new Map(entries.map((entry) => [entry, SearchIndex.key(entry)]))
  }

  /**
   * The groups `query` finds, best first.
   * - `here`:  the page shown's sections (`PageOutline.read()`), searched like the rest
   * - `current`:  the page shown's path from the site root (`components/ui-divider.html`):  its search-file sections
   *   are skipped (`here` has them, live), its attributes boosted
   */
  search(query: string, here: readonly SearchEntry[] = [], current?: string): SearchGroup[] {
    const words = SearchIndex.words(query)
    if (!words.length) return []
    const folded = words.join(" ")
    const hits = new Map<SearchKind, SearchHit[]>()
    for (const entry of here) consider(entry, SearchIndex.key(entry), 0)
    for (const entry of this.entries) {
      const page = this.pageOf.get(entry)
      if (current && page === `${current}#`) continue
      consider(entry, this.keys.get(entry)!, current && page === current ? HERE_BOOST : 0)
    }
    const groups = [...hits].map(([kind, list]) => ({
      kind,
      hits: list.sort(SearchIndex.compare).slice(0, GROUP_LIMIT[kind])
    }))
    return groups.sort(
      (a, b) => b.hits[0]!.score - a.hits[0]!.score || SearchKinds.indexOf(a.kind) - SearchKinds.indexOf(b.kind)
    )

    /** Score `entry` (its `key`, plus `bonus`), filing a hit under its kind. */
    function consider(entry: SearchEntry, key: Key, bonus: number) {
      const hit = SearchIndex.match({ entry, key, query: folded, words, bonus })
      if (!hit) return
      const list = hits.get(entry.kind)
      if (list) list.push(hit)
      else hits.set(entry.kind, [hit])
    }
  }

  ////////////////
  // ## Matching
  ////////////////

  /** `text` folded for matching:  lower case, no accents, single spaces. */
  static fold(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/\p{M}+/gu, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  /** `text` without anything but letters and digits:  `ui-or` ~== `uior` ~== `UI Or`. */
  static compact(text: string): string {
    return SearchIndex.fold(text).replace(/[^\p{L}\p{N}]+/gu, "")
  }

  /** The words of a query, folded;  `›` and `>` separate words too (`ui-button › circular`). */
  static words(query: string): string[] {
    return SearchIndex.fold(query)
      .split(/[\s›>]+/)
      .filter(Boolean)
  }

  /**
   * Where `needle` starts a word in `haystack` (both folded):  at the start, or after anything that isn't a letter
   * or digit;  -1 when it never does.
   */
  static wordStart(haystack: string, needle: string): number {
    for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, at + 1)) {
      if (at === 0 || !/[\p{L}\p{N}]/u.test(haystack[at - 1]!)) return at
    }
    return -1
  }

  /** `entry`'s hit for the folded `query` (and its `words`), `bonus` added;  `undefined` when it doesn't match. */
  private static match({ entry, key, query, words, bonus }: MatchInput): SearchHit | undefined {
    const title = SearchIndex.titleScore(key, query)
    const term = SearchIndex.termScore(key, query)
    const spread = words.length > 1 ? SearchIndex.wordsScore(key, words) : 0
    const best = Math.max(title, term, spread)
    if (!best) return undefined
    const score = best * KIND_WEIGHT[entry.kind] + (entry.boost ?? 0) + bonus - key.title.length * LENGTH_COST
    const marks = title ? SearchIndex.marks(key.title, [query]) : SearchIndex.marks(key.title, words)
    return { entry, score, marks }
  }

  /** How the whole query matches the title (0:  it doesn't). */
  private static titleScore(key: Key, query: string): number {
    if (key.title === query || key.titleCompact === SearchIndex.compact(query)) return SCORES.titleExact
    if (key.title.startsWith(query)) return SCORES.titleStart
    if (SearchIndex.wordStart(key.title, query) !== -1) return SCORES.titleWord
    if (query.length >= INSIDE_MIN && key.title.includes(query)) return SCORES.titleInside
    return 0
  }

  /** How the whole query matches the best term (0:  none does). */
  private static termScore(key: Key, query: string): number {
    const compact = SearchIndex.compact(query)
    let best = 0
    for (const [index, term] of key.terms.entries()) {
      const termCompact = key.termsCompact[index]!
      if (term === query || (compact && termCompact === compact)) return SCORES.termExact
      if (term.startsWith(query) || (compact.length >= INSIDE_MIN && termCompact.startsWith(compact)))
        best = Math.max(best, SCORES.termStart)
      else if (SearchIndex.wordStart(term, query) !== -1) best = Math.max(best, SCORES.termWord)
      else if (query.length >= INSIDE_MIN && term.includes(query)) best = Math.max(best, SCORES.termInside)
    }
    return best
  }

  /** Every word starts a word of the title or a term (0:  one doesn't);  more for each found in the title. */
  private static wordsScore(key: Key, words: readonly string[]): number {
    let inTitle = 0
    for (const word of words) {
      if (SearchIndex.wordStart(key.title, word) !== -1) inTitle++
      else if (!key.terms.some((term) => SearchIndex.wordStart(term, word) !== -1)) return 0
    }
    return SCORES.words + SCORES.wordInTitle * inTitle
  }

  /**
   * Ranges of `title` (folded:  same length as shown, `fold()` keeps every character's place) to highlight:  each
   * needle at its first word start, else its first place inside a word.
   */
  static marks(title: string, needles: readonly string[]): [number, number][] {
    const ranges: [number, number][] = []
    for (const needle of needles) {
      let at = SearchIndex.wordStart(title, needle)
      if (at === -1 && needle.length >= INSIDE_MIN) at = title.indexOf(needle)
      if (at !== -1) ranges.push([at, at + needle.length])
    }
    ranges.sort((a, b) => a[0] - b[0])
    const merged: [number, number][] = []
    for (const range of ranges) {
      const last = merged.at(-1)
      if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1])
      else merged.push(range)
    }
    return merged
  }

  /** Best first;  then A-Z by title. */
  private static compare(a: SearchHit, b: SearchHit): number {
    return b.score - a.score || a.entry.title.localeCompare(b.entry.title)
  }

  /**
   * `entry`'s folded title and terms.
   * - The title keeps its LENGTH (lower case only, `toLowerCase()` of the shown text):  `marks()` index the shown
   *   title.  Accents fold through `fold()` only where that keeps the length.
   */
  private static key(entry: SearchEntry): Key {
    const lower = entry.title.toLowerCase()
    const folded = SearchIndex.fold(entry.title)
    const title = folded.length === lower.length ? folded : lower
    const terms = entry.terms.map((term) => SearchIndex.fold(term)).filter(Boolean)
    return {
      title,
      titleCompact: SearchIndex.compact(entry.title),
      terms,
      termsCompact: terms.map((term) => SearchIndex.compact(term))
    }
  }

  ////////////////
  // ## Entries
  ////////////////

  /** A component tag:  its name, its tag in mono, found by its tag, other names and topics. */
  private static component(tag: SiteTag, family: string, topics: SiteDataFile["topics"]): SearchEntry {
    const titles = tag.topics.map((id) => topics.find((topic) => topic.id === id)?.title ?? id)
    return {
      kind: "component",
      title: tag.name,
      code: `<${tag.tag}>`,
      ...(!tag.main && { context: family }),
      href: tag.href ?? `components/${tag.mainTag}.html#${tag.tag}`,
      terms: [tag.tag, ...tag.aka, ...(tag.main ? [] : [family]), ...titles],
      ...(tag.page && { boost: PAGE_BOOST })
    }
  }

  /**
   * `tag`'s attributes:  each lands on its tag's API tables, `#<tag>` on `page`:  a family `<ui-docs-api>`'s header for
   * that tag, or a page's own `<ui-docs-api tag>` (`ui-radio.html#ui-radio`;  `SiteSections` lands both).
   */
  private static attributes(tag: SiteTag, page: string, family: string): SearchEntry[] {
    return tag.attributes.map((attribute) => ({
      kind: "attribute",
      title: attribute.name,
      code: `<${tag.tag}>`,
      context: family,
      href: `${page}#${tag.tag}`,
      terms: [tag.tag, tag.name, ...(attribute.aliases ?? [])]
    }))
  }

  /**
   * Where a section sits:  its tab's label, then the titles of the sections around it, outermost first (not its own).
   * - `sections` are a page's (`SiteSearchSection`s or the live outline's), `at` the section's index.
   */
  static trail(
    sections: readonly { title: string; parent?: number; tab?: string }[],
    at: number,
    tabs?: Readonly<Record<string, string>>
  ): string[] {
    const titles: string[] = []
    let tab: string | undefined
    for (let index = sections[at]!.parent; index !== undefined; index = sections[index]!.parent) {
      titles.unshift(sections[index]!.title)
      tab = sections[index]!.tab ?? tab
    }
    tab = sections[at]!.parent === undefined ? sections[at]!.tab : tab
    const label = tab && tabs && Object.hasOwn(tabs, tab) ? tabs[tab] : undefined
    return label ? [label, ...titles] : titles
  }
}

/** What a `SearchIndex` is built from:  the site's files that loaded. */
export type SearchIndexProps = {
  /** `components.json`:  tags and their attributes */
  data?: SiteDataFile
  /** `search.json`:  pages and their sections */
  search?: SiteSearchFile
}

/** What `SearchIndex.match()` scores:  an entry, its key, the folded query and its words, and a bonus. */
type MatchInput = {
  /** the entry tried */
  entry: SearchEntry
  /** its folded text (`SearchIndex.key()`) */
  key: Key
  /** the whole query, folded */
  query: string
  /** the query's words, folded */
  words: readonly string[]
  /** added to the score:  the page shown's own attributes */
  bonus: number
}

/** An entry's text, folded once for matching. */
type Key = {
  /** the title, lower case, the shown title's length */
  readonly title: string
  /** the title, letters and digits only (`SearchIndex.compact()`) */
  readonly titleCompact: string
  /** the terms, folded */
  readonly terms: readonly string[]
  /** the terms, letters and digits only */
  readonly termsCompact: readonly string[]
}

/** Boost of a tag with a page of its own (a family's main tag, `ui-radio`) over a sub-tag on its family's page. */
const PAGE_BOOST = 20

/** Boost of an entry on the page shown (its attributes). */
const HERE_BOOST = 40

/** Score taken off per title character:  shorter titles win ties. */
const LENGTH_COST = 0.5
