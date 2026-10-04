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
  /**
   * A member's words as written, if not its `name` -- e.g. `short rank` for property `short_rank`.
   * - For editors:  `name` is how it compiles, and how scope finds it (either spelling normalizes to it).
   */
  declare words: string | undefined
  /**
   * `true` for a property its type never declared, which a `set the X of Y to ...` declared at its first set --
   * see spell's `assignment_statement`.
   */
  declare auto: boolean | undefined
  /**
   * `true` for the member an EXCLUSIVE list type gives its item type, naming it, e.g. `pile` on `Card` for `a pile is
   * an exclusive list of cards`:  the pile holding the card, or nothing.  READ-ONLY -- see `P.TypeScope.exclusive`.
   * - Declared by the list type's statement, NOT a property statement of the item type's.
   */
  declare exclusive: boolean | undefined
  /**
   * How a READ of it compiles, if not `<object>.<name>` -- a template, `{it}` standing for what it's read from:
   * `{it}.length`, `{it}.getFullYear()` or `spellCore.itemCountOf({it})`.
   * - A built-in type's member, from spell's table of them -- see spell's `BUILT_IN_TYPE_TABLE`.
   * - NEVER set by a statement:  what a project declares compiles as its own statements say.
   */
  declare compile: string | undefined
  /**
   * Its docs, as markdown, for a member with no source to read them from:  a built-in type's.
   * - Anything a project declares has its docstring above its declaring statement instead.
   */
  declare doc: string | undefined

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
  /** See `ScopeVariable.words`. */
  words?: string
  /** See `ScopeVariable.auto`. */
  auto?: boolean
  /** See `ScopeVariable.exclusive`. */
  exclusive?: boolean
  /** See `ScopeVariable.compile`. */
  compile?: string
  /** See `ScopeVariable.doc`. */
  doc?: string
}
