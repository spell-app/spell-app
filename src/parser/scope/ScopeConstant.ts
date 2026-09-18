import { ParserError } from "~/parser"
import type { P } from "~/parser"

export type ScopeConstantProps = {
  name: string
  output?: string
  scope?: P.Scope
}

/**
 * `ScopeConstant` a variable defined within a `Scope`.
 * - `name` (required) Constant name, quotes will be stripped.
 * - `output` Literal output string for constant when expressed in target language,
 *            with quotes as necessary.  Defaults to `'name'`.
 * - `scope` Where constant was defined.
 */
export class ScopeConstant {
  declare name: string
  declare output: string
  declare scope: P.Scope

  constructor(name: string)
  constructor(props: ScopeConstantProps)
  constructor(input: string | ScopeConstantProps) {
    // Use string as constant `name`
    if (typeof input === "string") {
      this.name = input
    } else Object.assign(this, input)

    if (typeof this.name !== "string") {
      throw new ParserError({
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

  static stripEnclosingQuotes(name: string) {
    return name.replace(/^['"](.*)['"]$/, "$1")
  }

  toString() {
    return this.output
  }
}
