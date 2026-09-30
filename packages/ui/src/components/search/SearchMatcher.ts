import type { SearchCategory, SearchMatch, SearchResponse, SearchResult } from "$/core"

/**
 * Local search over a `<ui-search>` `source`, and the shapes results arrive in.  Pure data, NO DOM.
 * - Ported from Fomantic's `search.object()`:  each result is tried field by field (`fields`, in order);  its
 *   FIRST matching field decides its bucket, and buckets sort as
 *   - the query at the start of a word (`(?:\s|^)query`) -- always tried, except for `all`
 *   - then, by `match` (`SearchMatch`):  `exact` / `some` / `all` matches
 *   - then `fuzzy` matches
 * - Case-insensitive unless `ignoreCase: false`;  `ignoreDiacritics` folds `á` to `a` on both sides.
 * - Numbers count as text;  other field values are skipped.
 */
export class SearchMatcher {
  /** Fields tried, in order. */
  readonly fields: readonly string[]

  /** What counts as a match besides a word start. */
  readonly match: SearchMatch

  /** Case-insensitive. */
  readonly ignoreCase: boolean

  /** Fold diacritics. */
  readonly ignoreDiacritics: boolean

  constructor(options: SearchMatcherOptions = {}) {
    this.fields = options.fields ?? DEFAULT_FIELDS
    this.match = options.match ?? "exact"
    this.ignoreCase = options.ignoreCase ?? true
    this.ignoreDiacritics = options.ignoreDiacritics ?? false
  }

  /** Results of `source` matching `query`, best first;  `[]` for a blank query. */
  search(source: readonly SearchResult[], query: string): SearchResult[] {
    const term = this.fold(query.trim())
    if (!term) return []
    const wordStart = new RegExp(`(?:\\s|^)${term.replace(REGEXP_SPECIALS, "\\$&")}`, "u")
    const words = term.split(WHITESPACE)
    const first: SearchResult[] = []
    const exact: SearchResult[] = []
    const fuzzy: SearchResult[] = []
    for (const result of source) {
      const texts = this.texts(result)
      if (this.match === "all") {
        const joined = texts.join(" ")
        if (words.every((word) => joined.includes(word))) exact.push(result)
        continue
      }
      for (const text of texts) {
        if (wordStart.test(text)) first.push(result)
        else if (this.match === "exact" && text.includes(term)) exact.push(result)
        else if (this.match === "some" && words.some((word) => text.includes(word))) exact.push(result)
        else if (this.match === "fuzzy" && SearchMatcher.fuzzy(term, text)) fuzzy.push(result)
        else continue
        break
      }
    }
    return [...first, ...exact, ...fuzzy]
  }

  /**
   * `results` grouped by their `category`, in order of first appearance.
   * - NOTE: as Fomantic's `categoryResults()`, a result WITHOUT a category is left out.
   */
  static categorize(results: readonly SearchResult[]): SearchCategory[] {
    const groups = new Map<string, SearchResult[]>()
    for (const result of results) {
      if (!result.category) continue
      const group = groups.get(result.category)
      if (group) group.push(result)
      else groups.set(result.category, [result])
    }
    return [...groups].map(([name, members]) => ({ name, results: members }))
  }

  /**
   * A remote answer as groups:  Fomantic's `{ results }` (a list, or categories as a list or a keyed object), or a
   * bare list.  A plain list is ONE unnamed group, capped at `maxResults` (`0`:  no cap).
   * - Anything else (no `results`, not an object) is no results.
   */
  static groups(response: SearchResponse | null | undefined, maxResults = 0): SearchCategory[] {
    const results = Array.isArray(response) ? response : (response as { results?: unknown } | null)?.results
    if (!results || typeof results !== "object") return []
    const list = (Array.isArray(results) ? results : Object.values(results)) as unknown[]
    if (list.length && list.every(SearchMatcher.isCategory)) {
      return (list as SearchCategory[]).filter((category) => category.results.length)
    }
    const plain = (list as SearchResult[]).filter((result) => result && typeof result === "object")
    return [{ name: "", results: maxResults > 0 ? plain.slice(0, maxResults) : plain }]
  }

  ////////////////
  // ## Internals
  ////////////////

  /** Folded texts of `result`'s searchable fields, in field order. */
  private texts(result: SearchResult): string[] {
    const texts: string[] = []
    for (const field of this.fields) {
      const value = result[field]
      if (typeof value === "string" || typeof value === "number") texts.push(this.fold(String(value)))
    }
    return texts
  }

  /** `text` compared the configured way:  diacritics stripped, lower-cased. */
  private fold(text: string): string {
    const plain = this.ignoreDiacritics ? text.normalize("NFD").replace(COMBINING_MARKS, "") : text
    return this.ignoreCase ? plain.toLowerCase() : plain
  }

  /** Is `value` a `{ name, results: [] }` category? */
  private static isCategory(value: unknown): value is SearchCategory {
    return !!value && typeof value === "object" && Array.isArray((value as SearchCategory).results)
  }

  /**
   * Fomantic's `fuzzySearch()`:  every character of `term` appears in `text`, in order;  a term as long as the
   * text must equal it.
   */
  private static fuzzy(term: string, text: string): boolean {
    if (term.length > text.length) return false
    if (term.length === text.length) return term === text
    let position = 0
    for (const char of term) {
      position = text.indexOf(char, position) + 1
      if (!position) return false
    }
    return true
  }
}

/** Constructor props for `SearchMatcher`, named as Fomantic's search settings. */
export type SearchMatcherOptions = {
  /** Fields tried, in order (Fomantic's `searchFields`);  default `title`, `description`. */
  fields?: readonly string[]
  /** Fomantic's `fullTextSearch`;  default `exact`. */
  match?: SearchMatch
  /** Fomantic's `ignoreSearchCase`;  default true. */
  ignoreCase?: boolean
  /** Fomantic's `ignoreDiacritics`;  default false. */
  ignoreDiacritics?: boolean
}

/** Fields searched by default. */
const DEFAULT_FIELDS = ["title", "description"]

/** Characters to escape in a `RegExp` source. */
const REGEXP_SPECIALS = /[$()*+./?[\\\]^{|}-]/g

/** Runs of whitespace, between query words. */
const WHITESPACE = /\s+/

/** Unicode combining diacritical marks. */
const COMBINING_MARKS = /[̀-ͯ]/g
