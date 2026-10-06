import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { ComponentTokens } from "../src/styles/ComponentTokens.ts"
import type { SiteToken, SiteTokenSeed, SiteTokenType } from "../src/docs-components/docs-components.types.ts"

/****************
 * ### `FamilyTokens`
 * The public CSS tokens of one family, read from its sheets:  the token table of its docs page (`yarn site:data`).
 * - Ported from the old Astro site's `CssTokens` table (deleted with it, epic `spell-ui-pages` P7):  the same rows,
 *   plus a `type` for each.
 * - A sheet never declares its public tokens (`docs/theming.md` "Component tokens").  Two kinds of rows:
 *   - ALIASED tokens, the ones a variation swaps:  `--_ui-button-radius: var(--ui-button-radius, var(--ui-radius))`.
 *     The public name, its default, the comment right above as the description, unless it's a group header
 *     (`/* ## Owner tokens ... *\/`).
 *   - tokens READ WHERE THEY PAINT, varied by nothing:  `padding: var(--ui-modal-content-padding, 1.5em)`.  The first
 *     read's fallback is the default, the comment right above that property the description.
 * - Defaults show the PUBLIC names of the tokens they derive from;  a default built from sheet plumbing reads badly,
 *   so the family's seed (`site/_data/pages.json`) may pass readable text (`defaults`), other prefixes, or a whole
 *   hand-written `list`.
 * - Foundation names that share a prefix (`--ui-text-muted` for `text`) are left out.
 ****************/
export class FamilyTokens {
  /** Every `--ui-*` name the foundation sheets (`src/styles/*.css`) declare. */
  readonly foundation: Set<string>

  constructor(stylesFolder: string) {
    this.foundation = new Set(
      readdirSync(stylesFolder)
        .filter((file) => file.endsWith(".css"))
        .flatMap((file) => ComponentTokens.declarations(readFileSync(join(stylesFolder, file), "utf8")))
        .map(({ name }) => name)
    )
  }

  /**
   * The tokens of the family in `folder` (its path), named `name` (`ui-button`), as `seed` says.
   * - Sheets:  `<name>.css` first, then the rest A-Z;  first row of a name wins (aliases before reads).
   */
  read(folder: string, name: string, seed: SiteTokenSeed = {}): SiteToken[] {
    if (seed.list) return seed.list.map((row) => ({ ...row, type: FamilyTokens.typeFor(row.name, row.default) }))
    const prefixes = seed.prefixes ?? [`--${name}-`]
    const defaults = seed.defaults ?? {}
    const main = `${name}.css`
    const sheets = readdirSync(folder)
      .filter((file) => file.endsWith(".css"))
      .sort((a, b) => Number(b === main) - Number(a === main) || a.localeCompare(b))
      .map((file) => readFileSync(join(folder, file), "utf8"))

    const rows = new Map<string, Row>()
    const add = (row: Row) => {
      if (rows.has(row.name) || this.foundation.has(row.name)) return
      if (prefixes.some((prefix) => row.name.startsWith(prefix))) rows.set(row.name, row)
    }
    for (const css of sheets) for (const row of ComponentTokens.aliases(css)) add(row)
    const aliased = new Set(sheets.flatMap((css) => ComponentTokens.aliases(css).map((row) => row.name)))
    for (const css of sheets) for (const row of FamilyTokens.reads(css)) add(row)
    return [...rows.values()].map((row) => {
      const value = defaults[row.name] ?? FamilyTokens.publicNames(row.default, aliased)
      const description = row.description?.startsWith("## ") ? undefined : row.description
      return {
        name: row.name,
        default: value,
        ...(description && { description }),
        type: FamilyTokens.typeFor(row.name, row.default)
      }
    })
  }

  /**
   * What a token's value is, guessed from its name and its sheet default:  the token table gives `color` a live swatch.
   * - `color`:  a colour function or keyword in the default, or a name ending in a colour word
   * - `time`:  `ms` / `s` values;  `length`:  a length or a `calc()` of them;  `number`:  a bare number
   */
  static typeFor(name: string, value: string): SiteTokenType {
    const text = value.trim()
    if (SHADOW_NAME.test(name)) return "other"
    if (COLOR_NAME.test(name) || COLOR_VALUE.test(text)) return "color"
    if (TIME_VALUE.test(text) || TIME_NAME.test(name)) return "time"
    if (LENGTH_VALUE.test(text) || LENGTH_NAME.test(name)) return "length"
    if (/^-?\d*\.?\d+$/.test(text)) return "number"
    return "other"
  }

  /** `value` with each ALIAS read by its public name (`--_ui-x` => `--ui-x`);  a private switch keeps its name. */
  private static publicNames(value: string, aliased: Set<string>): string {
    return value.replace(/--_ui-[a-z0-9-]+/g, (name) =>
      aliased.has(`--${name.slice(3)}`) ? `--${name.slice(3)}` : name
    )
  }

  /**
   * Public tokens `css` reads with a fallback, `var(--ui-x, <default>)`, first read wins.
   * - Includes the public read inside an alias or a dual read;  `read()` drops those already listed.
   */
  private static reads(css: string): Row[] {
    const stripped = ComponentTokens.stripComments(css)
    const found: Row[] = []
    for (const match of stripped.matchAll(/var\(\s*(--ui-[a-z0-9-]+)\s*,/g)) {
      const start = match.index + match[0].length
      let depth = 0
      let end = start
      for (; end < stripped.length; end++) {
        if (stripped[end] === "(") depth++
        else if (stripped[end] === ")" && depth-- === 0) break
      }
      found.push({
        name: match[1]!,
        default: stripped.slice(start, end).replace(/\s+/g, " ").trim(),
        description: FamilyTokens.commentAbove(css, match.index)
      })
    }
    return found
  }

  /**
   * The comment right above the declaration holding `index`, whitespace collapsed.
   * - Looks back to the previous `;` / `{` only, so a rule's or another declaration's comment never matches.
   * - `stripComments()` keeps offsets (comments become spaces), so `index` works in both texts.
   */
  private static commentAbove(css: string, index: number): string | undefined {
    const stripped = ComponentTokens.stripComments(css)
    const start = Math.max(stripped.lastIndexOf(";", index), stripped.lastIndexOf("{", index)) + 1
    const comment = /\/\*((?:(?!\*\/)[\s\S])*)\*\/\s*[a-z-]+\s*:[^;{}]*$/.exec(css.slice(start, index))?.[1]
    return comment
      ?.replace(/^\s*\*(?!\/)/gm, "")
      .replace(/\s+/g, " ")
      .trim()
  }
}

/** One token row before its type is guessed. */
type Row = {
  /** the public token, `--ui-*` */
  name: string
  /** its default, as the sheet writes it */
  default: string
  /** the comment above it, whitespace collapsed */
  description?: string
}

/** A colour in a default value. */
const COLOR_VALUE =
  /\b(oklch|oklab|rgba?|hsla?|hwb|lab|lch|color-mix|light-dark)\(|#[0-9a-f]{3,8}\b|\b(transparent|currentcolor)\b|var\(--_?ui-(ink|surface|primary|secondary|red|orange|yellow|olive|green|teal|blue|violet|purple|pink|brown|grey|black|white|positive|negative|info|warning|success|error|border-color|text-|focus-(color|border)|link|highlight|background\b|color\b)/i

/** A token name that says colour, maybe in a state (`--ui-button-color-hover`). */
const COLOR_NAME = /-(color|background|bg|fill|stroke|tint|hue)(-(hover|focus|down|active|selected|pressed|disabled))?$/

/** A shadow or a border shorthand:  several values, no one type. */
const SHADOW_NAME = /-(shadow|border|outline)(-|$)(?!.*(color|width|radius))/

/** A duration. */
const TIME_VALUE = /^-?\d*\.?\d+m?s$/

/** A token name that says duration. */
const TIME_NAME = /-(duration|delay)$/

/** A length, or a `calc()` / `min()` / `max()` / `clamp()` of lengths, or a foundation length token. */
const LENGTH_VALUE =
  /^(-?\d*\.?\d+(px|em|%|vh|vw|vmin|vmax|ch|ex|lh|cqi|cqb)|0)$|^(calc|min|max|clamp)\(.*(px|em|%|vh|vw)|^var\(--ui-(space|radius|font-size|size)\b/

/** A token name that says length. */
const LENGTH_NAME =
  /-(padding|margin|radius|width|height|size|gap|offset|indent|spacing|inset|distance|top|bottom|left|right)(-(block|inline|top|bottom|left|right|start|end|x|y))?$/
