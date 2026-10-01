/**
 * Search text for the component browser:  blind to case, spacing, dashes and other punctuation, so `date time`,
 * `Date & Time` and `date-time` all match one another.
 * - Shared by the BUILD (`ComponentIndex` writes each tag's key into the page) and the CLIENT (`ComponentBrowser`
 *   normalizes the query the same way), so the two can't drift.  Runtime-light on purpose:  the client imports it.
 */
export class SearchText {
  /** `"Date & Time"` / `"date-time"` / `"ui-date"` => `"datetime"` / `"datetime"` / `"uidate"`. */
  static normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\p{L}\p{N}]+/gu, "")
  }

  /**
   * One haystack from several terms (name, tag, topics, other names).
   * - Joined with `|`, which `normalize()` never leaves in a query, so a query can't match across two terms.
   */
  static key(terms: readonly string[]): string {
    return terms
      .map((term) => SearchText.normalize(term))
      .filter(Boolean)
      .join("|")
  }

  /** Does `key` (from `key()`) contain the normalized `query`?  An empty query matches everything. */
  static matches(key: string, query: string): boolean {
    return !query || key.includes(query)
  }
}
