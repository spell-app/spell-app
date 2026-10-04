import { P } from "$/parser"

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
  /** Variable kind.  One of `"argument"`, `"static"` or `undefined` for a normal variable. */
  declare kind: "argument" | "static" | undefined
  /**
   * What it holds, in spell's words -- see `P.Datatype` -- e.g. `Card` for an argument `(a card)`, or what
   * the value it was declared with was.  `undefined` if unknown.
   * - Set when it's declared, and never changed after:  the first datatype wins.
   */
  declare datatype: P.Datatype | undefined
  /** String used to initialize the variable.  Not consistently used. */
  declare initializer: string | undefined
  /**
   * `true` if this is an implicit "alias" for another variable rather than a genuinely-declared one,
   * e.g. `it`/`its` mapped to `this` -- see `MethodScope` constructor.
   * - Assigning to an alias' name declares a real variable in its place: the `assignment` rule (in
   *   `$/spell`) treats it as `isNewVariable` and `variables.replace()`s it.
   */
  declare isAlias: boolean
  /**
   * Match whose `mutateScope()` declared this variable, if it came from source -- for go-to-definition etc.
   * - `undefined` for built-ins and for variables tests add by hand.
   */
  declare declaredBy: P.Match | undefined
  /** Where it was declared, if IMPORTED -- so there's no `declaredBy`.  See `P.DeclaredAt`. */
  declare declaredAt: P.DeclaredAt | undefined

  /** Create with a string name or `ScopeVariableProps` object. */
  constructor(input: string | ScopeVariableProps) {
    // If passed in as a string, use it as the name
    if (typeof input === "string") this.name = input
    else Object.assign(this, input)
    if (!this.name) throw new TypeError("Variables must be created with a 'name'")
  }
}

/** Constructor props for `ScopeVariable`. */
export type ScopeVariableProps = {
  /** Required variable name, as used in spell. */
  name: string
  /**
   * Variable output name in translated language.
   * Use this to make an "alias" for the variable w/in its scope, e.g. to map spell: `its` to
   * javascript: `this`.
   */
  output?: string
  /** Variable kind.  One of `"argument"`, `"static"` or `undefined` for a normal variable. */
  kind?: "argument" | "static"
  /** See `ScopeVariable.datatype`. */
  datatype?: P.Datatype
  /** String used to initialize the variable.  Not consistently used. */
  initializer?: string
  /** See `ScopeVariable.isAlias`. */
  isAlias?: boolean
  /** Pointer to the scope where this variable was defined. */
  scope?: P.Scope
  /** See `ScopeVariable.declaredBy`. */
  declaredBy?: P.Match
  /** See `ScopeVariable.declaredAt`. */
  declaredAt?: P.DeclaredAt
}
