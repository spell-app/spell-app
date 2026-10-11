import { P } from "$/parser"

/**
 * `ScopeConstant` a constant defined within a `Scope`.
 * - `name` (required) Constant name, quotes will be stripped.
 * - `value` Its value as spell says it, e.g. `up`:  each writer quotes it its own way.  Defaults to `name`.
 * - `output` Literal output string for constant when expressed in javascript,
 *            with quotes as necessary.  Defaults to `'name'`.  Writers read `value`;  kept for older declarations.
 * - `scope` Where constant was defined.
 */
export class ScopeConstant {
  /** Constant name, quotes will be stripped. */
  declare name: string
  /**
   * Its value as spell says it, e.g. `up` or `2`:  no quotes, so each writer quotes it its own way
   * (epic `python-target` P3, output-targets' T4).
   */
  declare value: string | number
  /**
   * Literal output string for constant when expressed in target language, with quotes as necessary.
   * Defaults to `'name'`.
   */
  declare output: string
  /** Scope where constant was defined. */
  declare scope: P.Scope
  /** Match whose `mutateScope()` declared this constant, if it came from source -- for go-to-definition etc. */
  declare declaredBy: P.Match | undefined
  /** Where it was declared, if IMPORTED -- so there's no `declaredBy`.  See `P.DeclaredAt`. */
  declare declaredAt: P.DeclaredAt | undefined

  /** Create with a string `name`, or `ScopeConstantProps` object; strips quotes and defaults `output`. */
  constructor(name: string)
  constructor(props: ScopeConstantProps)
  constructor(input: string | ScopeConstantProps) {
    // Use string as constant `name`
    if (typeof input === "string") {
      this.name = input
    } else Object.assign(this, input)

    if (typeof this.name !== "string") {
      throw new P.ParserError({
        message: "Constants must be created with a 'name'",
        context: this,
        activity: "constructor",
        params: { props: input }
      })
    }

    // Strip quotes from the name
    this.name = ScopeConstant.stripEnclosingQuotes(this.name)
    // its value:  from an `output` given, unquoted, else its name
    if (this.value === undefined) this.value = this.output === undefined ? this.name : spellValueOf(this.output)
    // Set up `output` as single-quoted version of the `name`.
    if (this.output === undefined) this.output = `'${this.name}'`
  }

  /** Strip enclosing single or double quotes from `name`, if present. */
  static stripEnclosingQuotes(name: string) {
    return name.replace(/^['"](.*)['"]$/, "$1")
  }

  /** String form of this constant ~== `output`, e.g. for template interpolation. */
  toString() {
    return this.output
  }
}

/**
 * A value as spell says it, from a value that may be written as javascript, e.g. `'clubs'` => `clubs`, `2` => `2`.
 * - Strips ONE pair of enclosing quotes, single or double:  older declarations and scopes wrote values quoted.
 * - Anything else, as it is.
 */
export function spellValueOf<V extends string | number>(value: V): V {
  return (typeof value === "string" ? value.replace(/^'([^']*)'$|^"([^"]*)"$/, "$1$2") : value) as V
}

/**
 * The initializer text of a variable holding an enumeration's `values`, as scopes and declarations keep it:
 * `['clubs', 'diamonds']`, `[1, 2]`.
 * - The values are spell's (`clubs`);  older ones, already quoted (`'clubs'`), are read as spell's first.
 */
export function enumerationInitializer(values: Array<string | number>): string {
  return `[${values.map((value) => (typeof value === "string" ? `'${spellValueOf(value)}'` : value)).join(", ")}]`
}

/** Constructor props for `ScopeConstant`. */
export type ScopeConstantProps = {
  /** Constant name, quotes will be stripped. */
  name: string
  /** Its value as spell says it, e.g. `up` -- default:  `output` unquoted, else `name`. */
  value?: string | number
  /**
   * Literal output string for constant when expressed in target language, with quotes as necessary.
   * Defaults to `'name'`.
   */
  output?: string
  /** Scope where constant was defined. */
  scope?: P.Scope
  /** See `ScopeConstant.declaredBy`. */
  declaredBy?: P.Match
  /** See `ScopeConstant.declaredAt`. */
  declaredAt?: P.DeclaredAt
}
