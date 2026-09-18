import type { P } from "~/parser"

export type ScopeVariableProps = {
  name: string
  output?: string
  kind?: "argument" | "static"
  datatype?: string
  initializer?: string
  isAlias?: boolean
  scope?: P.Scope
}

/**
 * `ScopeVariable` a variable defined within a `Scope`.
 */
export class ScopeVariable {
  /** Pointer to the scope where this variable was defined. */
  declare scope: P.Scope
  /** Required variable name, as used in spell. */
  declare name: string
  /**
   * Variable output name in translated language.
   * Use this to make an "alias" for the variable w/in its scope,
   * e.g. to map spell: `its` to javascript: `this`.
   */
  declare output: string | undefined
  /** Variable kind, One of `"argument"`, `"static"` or `undefined` for a normal variable. */
  declare kind: "argument" | "static" | undefined
  /** Type of the variable.  Not consistently used (yet). */
  declare datatype: string | undefined
  /** String used to initialize the variable.  Not consistently used. */
  declare initializer: string | undefined
  /**
   * If true, this is an "alias" for another variable,
   * meaning we will need to declare the variable if it is assigned to.
   * DOCME?
   */
  declare isAlias: boolean

  /** Create with a string name or `ScopeVariableProps` object. */
  constructor(input: string | ScopeVariableProps) {
    // If passed in as a string, use it as the name
    if (typeof input === "string") this.name = input
    else Object.assign(this, input)
    if (!this.name) throw new TypeError("Variables must be created with a 'name'")
  }
}
