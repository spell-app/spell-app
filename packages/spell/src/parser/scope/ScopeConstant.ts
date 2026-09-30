import { P } from "~/parser"

/**
 * `ScopeConstant` a constant defined within a `Scope`.
 * - `name` (required) Constant name, quotes will be stripped.
 * - `output` Literal output string for constant when expressed in target language,
 *            with quotes as necessary.  Defaults to `'name'`.
 * - `scope` Where constant was defined.
 */
export class ScopeConstant {
  /** Constant name, quotes will be stripped. */
  declare name: string
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

/** Constructor props for `ScopeConstant`. */
export type ScopeConstantProps = {
  /** Constant name, quotes will be stripped. */
  name: string
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
