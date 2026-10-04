import type { SiteDataFile, SiteToken } from "$/ui/docs-components/docs-components.types"
import { SiteData } from "$/ui/docs-components/SiteData"

import {
  PREFIX_MARK,
  type TokenPattern,
  type TokenRowsOptions,
  type TokenRowsText,
  type TokenTable,
  type TokenView
} from "./ui-docs-tokens.types"

/****************
 * ### `TokenRows`
 * What `<ui-docs-tokens>` shows, from the site's data and its attributes:  the tables and their rows, or the message
 * to show instead.  Pure (no DOM, no Solid), so the element and the native fallback share it and tests drive it
 * directly.
 * - A family:  `families[folder].tokens`, as one table;  `tag` finds the folder through `SiteData.family()`.
 * - `global`:  `foundation`, one table per group, `groups` picking some.
 * - Then `tokens` (names, `prefix*`) and the filter text narrow the rows;  a table left with none is dropped.
 ****************/
export class TokenRows {
  /**
   * The view for `data` and the element's attributes.
   * - `text`:  the element's message texts (`text(key, params)`), so messages stay translated
   */
  static view(data: SiteDataFile, options: TokenRowsOptions, text: TokenRowsText): TokenView {
    const tables = TokenRows.tables(data, options, text)
    if (!Array.isArray(tables)) return tables
    const patterns = TokenRows.patterns(options.tokens)
    const query = options.query?.trim().toLowerCase() ?? ""
    const narrowed = tables.map((table) => ({
      ...table,
      rows: table.rows.filter((row) => TokenRows.matches(row, patterns) && TokenRows.found(row, query))
    }))
    const total = tables.reduce(
      (sum, table) => sum + table.rows.filter((row) => TokenRows.matches(row, patterns)).length,
      0
    )
    return { kind: "tables", tables: narrowed.filter((table) => table.rows.length), total }
  }

  /** The tables before narrowing, or the message to show instead. */
  private static tables(data: SiteDataFile, options: TokenRowsOptions, text: TokenRowsText): TokenTable[] | TokenView {
    if (options.global) {
      const ids = TokenRows.words(options.groups)
      const groups = data.foundation.filter((group) => !ids.length || ids.includes(group.id))
      return groups.map((group) => ({
        id: group.id,
        title: group.title,
        description: group.description,
        rows: group.tokens
      }))
    }
    const name = options.family || options.tag
    if (!name) return { kind: "message", text: text("missing"), error: true }
    const family = options.family
      ? Object.hasOwn(data.families, options.family)
        ? data.families[options.family]
        : undefined
      : SiteData.family(data, name)
    if (!family) return { kind: "message", text: text("unknownFamily", { family: name }), error: true }
    if (!family.tokens.length)
      return { kind: "message", text: text("noTokens", { tag: `<${family.mainTag}>` }), error: false }
    return [{ id: family.folder, rows: family.tokens }]
  }

  /** `tokens` as patterns:  exact names, and prefixes (a trailing `*`, dropped). */
  static patterns(tokens: string | undefined): TokenPattern[] {
    return TokenRows.words(tokens).map((word) =>
      word.endsWith(PREFIX_MARK) ? { prefix: word.slice(0, -PREFIX_MARK.length) } : { name: word }
    )
  }

  /** Whether `row` passes `patterns` (none:  every row). */
  static matches(row: SiteToken, patterns: readonly TokenPattern[]): boolean {
    if (!patterns.length) return true
    return patterns.some((pattern) =>
      "prefix" in pattern ? row.name.startsWith(pattern.prefix) : row.name === pattern.name
    )
  }

  /** Whether `row`'s name, default or description holds `query` (lower case;  empty:  every row). */
  static found(row: SiteToken, query: string): boolean {
    if (!query) return true
    return [row.name, row.default, row.description ?? ""].some((text) => text.toLowerCase().includes(query))
  }

  /** Space-separated words of an attribute;  none when unset. */
  private static words(value: string | undefined): string[] {
    return (value ?? "").split(/\s+/).filter(Boolean)
  }
}
