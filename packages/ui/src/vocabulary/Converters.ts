import { Warnings } from "$/ui/util"
import type { EnumOptions, ValueSetName } from "./vocabulary.types"
import { ValueSets } from "./ValueSets"

/**
 * Pure attribute => property converters, shared by `ElementDefinition` (the fork's props) and the native fallbacks.
 * - Why here, library-neutral:  the elements and their native fallbacks need the SAME booleans / enums / widths
 *   semantics, and frameworks send attributes in odd shapes -- Vue sends `open="false"` when it can't find a
 *   property, so `"false"` MUST mean false (plan, "Framework consumption contract").
 * - Static and stateless:  converters run on every `attributeChangedCallback`.
 * - Attribute values arrive as `string | null` (`null` ~== absent);  properties may arrive as anything.
 */
export class Converters {
  ////////////////
  // ## Booleans
  ////////////////

  /**
   * Attribute value => boolean.
   * - absent (`null` / `undefined`) => false
   * - `""`, `"true"`, `"yes"`, or the attribute's own name (`disabled="disabled"`) => true
   * - `"false"`, `"no"`, `"0"` => false (case-insensitive)
   * - any other present value => true, as HTML presence semantics say
   * - real booleans pass through, so the same converter serves properties
   */
  static boolean(value: string | boolean | null | undefined, attribute?: string): boolean {
    if (value == null) return false
    if (typeof value === "boolean") return value
    const text = value.trim().toLowerCase()
    if (text === "" || text === "true" || text === "yes" || text === attribute) return true
    return !FALSE_WORDS.has(text)
  }

  /**
   * Boolean property => attribute value for reflection:  true => `""`, false => `null` (remove).
   * - NEVER `"false"`:  a present attribute is true to CSS (`[open]`) and to other libraries.
   */
  static booleanToAttribute(value: boolean | null | undefined): "" | null {
    return value ? "" : null
  }

  /**
   * `keyOrValueAndKey` attribute => `true` (bare), `false` (absent / `"false"`), or its value.
   * - `pointing` => true;  `pointing="left"` => `"left"`;  `pointing="false"` => false.
   * - A value is checked against `set` with the same warning as `enumValue()`;  unknown values => `true`,
   *   so a typo still gets the bare variation rather than nothing.
   */
  static keyOrValue(
    value: string | boolean | null | undefined,
    set: ValueSetName | readonly string[] | undefined,
    options: EnumOptions = {}
  ): string | boolean {
    if (value == null || typeof value === "boolean") return value ?? false
    const text = value.trim().toLowerCase()
    if (text === "" || text === "true" || text === "yes" || text === options.attribute) return true
    if (FALSE_WORDS.has(text)) return false
    if (!set) return text
    return Converters.enumValue(text, set, options) ?? true
  }

  ////////////////
  // ## Icons
  ////////////////

  /**
   * `icon` attribute value => icon name, `""` for "the element's own icon", or `undefined` for none.
   * - Why:  frameworks (JSX, Astro) render a bare `icon` as `icon="true"`, which MUST NOT be looked up as a glyph.
   * - bare / `"true"` / `"yes"` / `true` => `fallback` (the vocabulary default), else `""`
   * - `"false"` / `"no"` / `false` => `undefined`, even over a default.  NOT `"0"`:  Font Awesome has a `0` glyph.
   * - a string / number => the trimmed name;  absent (`null` / `undefined`) or any other value => `undefined`
   */
  static icon(value: unknown, fallback?: unknown): string | undefined {
    if (value == null || value === false) return undefined
    const text =
      typeof value === "string"
        ? value.trim()
        : value === true
          ? ""
          : typeof value === "number"
            ? `${value}`
            : undefined
    if (text === undefined) return undefined
    const word = text.toLowerCase()
    if (word === "false" || word === "no") return undefined
    if (word === "" || word === "true" || word === "yes") return typeof fallback === "string" ? fallback : ""
    return text
  }

  ////////////////
  // ## Enums
  ////////////////

  /**
   * Attribute value => canonical member of `set`, or `undefined` if it isn't one.
   * - Trims and lower-cases, and collapses inner whitespace (`"top   left"` => `"top left"`).
   * - SIDE EFFECT (dev only): warns `did you mean "red"?` via `ValueSets.suggest()` for unknown values.
   */
  static enumValue(
    value: string | null | undefined,
    set: ValueSetName | readonly string[],
    options: EnumOptions = {}
  ): string | undefined {
    if (value == null) return undefined
    const text = value.trim().toLowerCase().replace(WHITESPACE, " ")
    if (ValueSets.has(set, text)) return text
    if (text === "") return undefined
    const guess = ValueSets.suggest(set, text)
    const where = options.tag ? `<${options.tag} ${options.attribute ?? ""}>` : (options.attribute ?? "value")
    Warnings.devWarn(
      where,
      `unknown value ${JSON.stringify(value)}${guess ? `;  did you mean ${JSON.stringify(guess)}?` : ""}`
    )
    return undefined
  }

  ////////////////
  // ## Numbers, JSON, lists
  ////////////////

  /**
   * Attribute value => number;  `undefined` when absent, blank or not a number.
   * - Numbers pass through (property path).
   */
  static number(value: string | number | null | undefined): number | undefined {
    if (value == null) return undefined
    if (typeof value === "number") return Number.isNaN(value) ? undefined : value
    if (value.trim() === "") return undefined
    const number = Number(value)
    return Number.isNaN(number) ? undefined : number
  }

  /**
   * Rich property value:  JSON text is parsed, a plain string stays a string, anything else passes through.
   * - Why parse:  `json` attributes are property-first (`AGENTS.md`), but plain HTML can still write
   *   `options='[...]'` and frameworks without property binding set strings.
   * - Why not parse EVERY string:  a string is also a value -- `rules="email"` / `el.rules = "minLength[6]"` is
   *   Fomantic's shorthand.  Only JSON-shaped text (starting `[`, `{` or `"`) is parsed.
   * - Consumers MUST accept a string where they don't want one (`options` drops non-arrays).
   * - SIDE EFFECT (dev only): warns and returns `undefined` for JSON-shaped text that doesn't parse (a typo).
   */
  static json<T = unknown>(value: unknown): T | undefined {
    if (typeof value !== "string") return value as T
    const text = value.trim()
    if (text === "") return undefined
    if (!JSON_START.includes(text[0]!)) return value as T
    try {
      return JSON.parse(text) as T
    } catch (error) {
      Warnings.devWarn("Converters.json()", `invalid JSON ${JSON.stringify(value)}:`, (error as Error).message)
      return undefined
    }
  }

  /**
   * Space- or comma-separated attribute value => `string[]`, e.g. `"a, b c"` => `["a", "b", "c"]`.
   * - Arrays pass through;  absent => `[]`.
   * - NOTE: splits multi-word values like `large screen` -- `multiple` attributes use `ClassBuilder`'s tokenizer.
   */
  static list(value: string | readonly string[] | null | undefined): string[] {
    if (value == null) return []
    if (typeof value !== "string") return [...value]
    return value.split(LIST_SEPARATOR).filter(Boolean)
  }
}

/** Spellings of false;  everything else present is true. */
const FALSE_WORDS = new Set(["false", "no", "0"])

/** Separator for `Converters.list()`. */
const LIST_SEPARATOR = /[\s,]+/

/** Runs of whitespace, collapsed by `enumValue()`. */
const WHITESPACE = /\s+/g

/** First characters of JSON text `Converters.json()` parses:  arrays, objects, quoted strings. */
const JSON_START = '[{"'
