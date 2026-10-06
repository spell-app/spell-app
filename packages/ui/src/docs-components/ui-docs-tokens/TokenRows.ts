import type { SiteDataFile, SiteToken } from "$/ui/docs-components/docs-components.types"
import { SiteData } from "$/ui/docs-components/SiteData"
import type { TokenPattern, TokenRowsText, TokenTable, TokenView, TokenViewParams } from "./ui-docs-tokens.types"

/****************
 * ### `TokenRows`
 * What `<ui-docs-tokens>` shows, from the site's data and its attributes:  the tables and their rows, or the message
 * to show instead.  Pure (no DOM, no Solid), so the element and the native fallback share it and tests drive it
 * directly.
 * - A family:  `families[folder].tokens`, as one table;  `tag` finds the folder through `SiteData.family()`.
 * - `global`:  `foundation`, one table per group, `groups` picking some.
 * - Then `tokens` (names, `prefix*`) and the filter text narrow the rows;  a table left with none is dropped.
 * - Static:  pure, and shared by the element and its fallback.
 ****************/
export class TokenRows {
  /**
   * The view for `data` and the element's attributes (`params`).
   * - `text`:  the element's message texts (`text(key, params)`), so messages stay translated
   */
  static viewFor(data: SiteDataFile, params: TokenViewParams, text: TokenRowsText): TokenView {
    const tables = TokenRows.tablesFor(data, params, text)
    if (!Array.isArray(tables)) return tables
    const patterns = TokenRows.patternsFor(params.tokens)
    const query = params.query?.trim().toLowerCase() ?? ""
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

  /** `tokens` as patterns:  exact names, and prefixes (a trailing `*`, dropped). */
  static patternsFor(tokens: string | undefined): TokenPattern[] {
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

  /**
   * What `row` resolves to where it's drawn, as a CSS value:  the token itself, with its default as the fallback for
   * a family token (no sheet declares the public name);  a foundation token (`isGlobal`) is always declared.
   */
  static cssValueFor(row: SiteToken, { isGlobal }: { isGlobal: boolean }): string {
    return isGlobal ? `var(${row.name})` : `var(${row.name}, ${row.default})`
  }

  ////////////////
  // ## Internal
  ////////////////

  /** The tables before narrowing, or the message to show instead. */
  private static tablesFor(data: SiteDataFile, params: TokenViewParams, text: TokenRowsText): TokenTable[] | TokenView {
    if (params.isGlobal) {
      const ids = TokenRows.words(params.groups)
      const groups = data.foundation.filter((group) => !ids.length || ids.includes(group.id))
      return groups.map((group) => ({
        id: group.id,
        title: group.title,
        description: group.description,
        rows: group.tokens
      }))
    }
    const name = params.family || params.tag
    if (!name) return { kind: "message", text: text("missing"), isError: true }
    const family = params.family
      ? Object.hasOwn(data.families, params.family)
        ? data.families[params.family]
        : undefined
      : SiteData.family(data, name)
    if (!family) return { kind: "message", text: text("unknownFamily", { family: name }), isError: true }
    if (!family.tokens.length) {
      return { kind: "message", text: text("noTokens", { tag: `<${family.mainTag}>` }), isError: false }
    }
    return [{ id: family.folder, rows: family.tokens }]
  }

  /** Space-separated words of an attribute;  none when unset. */
  private static words(value: string | undefined): string[] {
    return (value ?? "").split(/\s+/).filter(Boolean)
  }
}

/** A trailing `*` in the `tokens` attribute:  a prefix. */
const PREFIX_MARK = "*"
