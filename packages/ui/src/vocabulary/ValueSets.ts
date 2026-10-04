import { numberToWord, proto, suggest } from "$/ui/util"

import type { AttributeKind, AttributeSpec, ValueSetName } from "./vocabulary.types"

/**
 * The shared English value sets attribute values are checked against:  hues, sizes, positions, alignments ...
 * - Why shared:  a hue or size means the same thing on every component, so vocabularies reference a set by key
 *   (`values: "hues"`) and a translation maps it ONCE (`Dictionary.values.hues`).
 * - Data is `@proto static` (on the prototype, and on the class as a static), so a theme which adds hues
 *   calls `ValueSets.add("hues", "indigo")` and every reader sees it.
 * - Helpers are static:  there is one set of canonical values per page.
 */
export class ValueSets {
  declare hues: readonly string[]
  declare sizes: readonly string[]
  declare positions: readonly string[]
  declare attachments: readonly string[]
  declare alignments: readonly string[]
  declare verticalAlignments: readonly string[]
  declare floats: readonly string[]
  declare widths: readonly string[]
  declare devices: readonly string[]
  declare booleans: readonly string[]
  declare topics: readonly string[]

  ////////////////
  // ## Data
  ////////////////

  /**
   * Fomantic's `@variationAllColors`, in its order -- `suggest()` breaks ties toward earlier entries.
   * - NOTE: extensible;  a new hue needs a token block in `colors.css` plus `ValueSets.add("hues", ...)`.
   */
  @proto static hues = [
    "primary",
    "secondary",
    "red",
    "orange",
    "yellow",
    "olive",
    "green",
    "teal",
    "blue",
    "violet",
    "purple",
    "pink",
    "brown",
    "grey",
    "black"
  ] as const

  /** Ratios of 16, smallest first;  `medium` means "default" and emits no class. */
  @proto static sizes = ["mini", "tiny", "small", "medium", "large", "big", "huge", "massive"] as const

  /**
   * Popup / tooltip positions:  Fomantic's 8 (`popup.js` `positions()`, `data-position`), plus 4 of our own.
   * - Map 1:1 onto anchor positioning's `position-area` (see plan, "Overlays").
   * - Ours:  `left top` ... `right bottom`, BESIDE the target, lined up with its top / bottom edge.  NOT the same
   *   as `top left` (above, lined up with its left edge):  word order matters here, unlike class words.
   */
  @proto static positions = [
    "top left",
    "top center",
    "top right",
    "bottom left",
    "bottom center",
    "bottom right",
    "left center",
    "right center",
    "left top",
    "left bottom",
    "right top",
    "right bottom"
  ] as const

  /** `attached` positions, e.g. `top attached` segment, `top right attached` label, `left attached` button. */
  @proto static attachments = [
    "top",
    "bottom",
    "left",
    "right",
    "top left",
    "top right",
    "bottom left",
    "bottom right"
  ] as const

  /** Text alignment;  `justified` emits just `justified`, not `justified aligned`. */
  @proto static alignments = ["left", "center", "right", "justified"] as const

  /** Vertical alignment for grids, rows, columns, items. */
  @proto static verticalAlignments = ["top", "middle", "bottom"] as const

  /** `floated` values. */
  @proto static floats = ["left", "right"] as const

  /**
   * Column counts of the 16-column grid, as strings.
   * - `ValueSets.has("widths", ...)` ALSO accepts words (`four`), fractions (`1/4`) and percentages (`25%`),
   *   via `ValueSets.columns()`.
   */
  @proto static widths = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16"
  ] as const

  /**
   * Responsive targets for `multiple` attributes (`only`, `reversed`).
   * - `large screen` is two words;  `ClassBuilder` and `Vocabulary` treat it as one token.
   * - `reversed` also takes a `vertically` suffix (`computer vertically`), handled by `ClassBuilder`.
   */
  @proto static devices = ["mobile", "tablet", "computer", "large screen", "widescreen"] as const

  /** Boolean spellings `Converters.boolean()` understands;  here so a translation can map them (`si` => `yes`). */
  @proto static booleans = ["true", "false", "yes", "no"] as const

  /**
   * Topics a component is filed under (a vocabulary's `topics`), for finding it:  the docs' component browser, and
   * later `<ui-root>`.  Many per tag, so it's found however someone looks:  how a newcomer thinks of it ("forms",
   * "notifications", "loading") AND how widget libraries file it;  the last four are Fomantic's own groups.
   * - A translation maps them once (`Dictionary.values.topics`), like any shared value.
   * - `documentation`:  the doc-only `<ui-docs-*>` elements (`src/docs-components/`), which the component list
   *   leaves out;  no component uses it.
   */
  @proto static topics = [
    "basic",
    "layout",
    "containers",
    "navigation",
    "menus",
    "forms",
    "inputs",
    "controls",
    "buttons",
    "selection",
    "date & time",
    "text",
    "typography",
    "media",
    "images",
    "icons",
    "data display",
    "lists",
    "tables",
    "cards",
    "feedback",
    "messages",
    "notifications",
    "overlays",
    "dialogs",
    "popups",
    "loading",
    "progress",
    "status",
    "animation",
    "social",
    "content parts",
    "documentation",
    "elements",
    "collections",
    "views",
    "modules"
  ] as const

  ////////////////
  // ## Lookup
  ////////////////

  /**
   * Values of `set`:  a shared set by name, or an inline list passed straight through.
   * - Reads the PROTOTYPE, so `ValueSets.add()` and subclass overrides are seen.
   */
  static get(set: ValueSetName | readonly string[]): readonly string[] {
    if (typeof set !== "string") return set
    return (ValueSets.prototype[set] as readonly string[] | undefined) ?? []
  }

  /**
   * True if `value` is one of `set`'s canonical values.
   * - Exact and case-sensitive:  callers normalize first (`Converters.enumValue()` trims and lower-cases).
   * - `widths` also accepts anything `ValueSets.columns()` parses into 1..16.
   */
  static has(set: ValueSetName | readonly string[], value: string): boolean {
    if (set === "widths") {
      const columns = ValueSets.columns(value)
      return columns !== undefined && ValueSets.isColumnCount(Math.round(columns))
    }
    return ValueSets.lookup(ValueSets.get(set)).has(value)
  }

  /**
   * Closest canonical value to a misspelt `value`, for dev-time "did you mean" warnings.
   * - Delegates to `$/ui/util`'s Levenshtein `suggest()`;  `undefined` when nothing is close.
   */
  static suggest(set: ValueSetName | readonly string[], value: string): string | undefined {
    return suggest(value, ValueSets.get(set))
  }

  /**
   * Add `values` to shared set `set`, e.g. a theme's extra hues.
   * - SIDE EFFECT: replaces the prototype's (and the static's) array, so readers holding the old array
   *   keep the old list -- look sets up with `ValueSets.get()` rather than caching them.
   */
  static add(set: ValueSetName, ...values: string[]) {
    const current = ValueSets.get(set)
    const next = Object.freeze([...current, ...values.filter((value) => !current.includes(value))])
    Object.defineProperty(ValueSets.prototype, set, { value: next, writable: true, configurable: true })
    ;(ValueSets as unknown as Record<string, unknown>)[set] = next
  }

  /**
   * The value set an attribute's values come from:  its own `values`, else the default for its kind.
   * - `color` => `hues`, `size` => `sizes`, `textAlign` => `alignments`, `verticalAlign` => `verticalAlignments`,
   *   `multiple` => `devices`, `boolean` => `booleans`
   * - `undefined` for free-form kinds (`string`, `number`, `json`, `width`, `keyOnly`).
   */
  static of(spec: AttributeSpec): ValueSetName | readonly string[] | undefined {
    return spec.values ?? KIND_VALUES[spec.kind]
  }

  ////////////////
  // ## Widths
  ////////////////

  /**
   * Fomantic's word for column count 1..16, e.g. `4` => `"four"`;  `undefined` otherwise.
   * - Same as `$/ui/util`'s `numberToWord()`, here so value-set users needn't import both.
   */
  static numberToWord(value: number | string): string | undefined {
    return numberToWord(value)
  }

  /**
   * Parse a width into a column count out of 16, WITHOUT rounding, so callers can warn on inexact values.
   * - `4` / `"4"` => `4`
   * - `"four"` => `4`
   * - `"1/4"` => `4`;  `"1/3"` => `5.33...`
   * - `"25%"` => `4`
   * - Returns `undefined` for anything unparseable or outside `(0, 16.5)`.
   */
  static columns(value: string | number): number | undefined {
    let columns: number
    if (typeof value === "number") columns = value
    else {
      const text = value.trim()
      const fraction = FRACTION.exec(text)
      const percent = PERCENT.exec(text)
      if (fraction) columns = (16 * Number(fraction[1])) / Number(fraction[2])
      else if (percent) columns = (16 * Number(percent[1])) / 100
      else if (NUMBER.test(text)) columns = Number(text)
      else columns = ValueSets.wordColumns().get(text.toLowerCase()) ?? NaN
    }
    return Number.isFinite(columns) && columns > 0 && columns < 16.5 ? columns : undefined
  }

  /** True for an integer column count 1..16. */
  static isColumnCount(columns: number) {
    return Number.isInteger(columns) && columns >= 1 && columns <= 16
  }

  ////////////////
  // ## Internals
  ////////////////

  /** `Set` per value array, for O(1) `has()`;  weak, so arrays replaced by `add()` drop out. */
  private static sets = new WeakMap<readonly string[], Set<string>>()

  /** Lazily-built `"four"` => `4` map for `columns()`. */
  private static words: Map<string, number> | undefined

  /** `Set` of `values`, built once per array. */
  private static lookup(values: readonly string[]) {
    let set = ValueSets.sets.get(values)
    if (!set) ValueSets.sets.set(values, (set = new Set(values)))
    return set
  }

  /** Number word => column count. */
  private static wordColumns() {
    if (!ValueSets.words) {
      ValueSets.words = new Map()
      for (let columns = 1; columns <= 16; columns++) ValueSets.words.set(numberToWord(columns)!, columns)
    }
    return ValueSets.words
  }
}

/** Default value set per attribute kind, for `ValueSets.of()`. */
const KIND_VALUES: Partial<Record<AttributeKind, ValueSetName>> = {
  color: "hues",
  size: "sizes",
  textAlign: "alignments",
  verticalAlign: "verticalAlignments",
  multiple: "devices",
  boolean: "booleans"
}

/** `a/b` fraction of the full width. */
const FRACTION = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/

/** `n%` of the full width. */
const PERCENT = /^(\d+(?:\.\d+)?)\s*%$/

/** Plain column count. */
const NUMBER = /^\d+(?:\.\d+)?$/
