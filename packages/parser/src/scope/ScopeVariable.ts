import type { PropRule } from "@spell-app/util"
import { P } from "$/parser"

/**
 * `ScopeVariable`:  a variable defined within a `Scope`.
 */
export class ScopeVariable {
  /** Pointer to the scope where this variable was defined. */
  declare scope: P.Scope
  /** Required variable name, as used in spell. */
  declare name: string
  /**
   * Variable output name in translated language.
   * - Use this to make an "alias" for the variable within its scope,
   *   e.g. to map spell's `its` to javascript's `this`.
   */
  declare output: string | undefined
  /**
   * Variable kind.  One of `"argument"`, `"static"`, `"only"` or `undefined` for a normal variable.
   * - `"only"`:  the one thing of its type, e.g. `solitaire` after spell's `solitaire is an app`.
   */
  declare kind: "argument" | "static" | "only" | undefined
  /**
   * What it holds, in spell's words -- `undefined` if unknown.  See `P.Datatype`.
   * - e.g. `Card` for an argument `(a card)`, or the datatype of the value it was declared with
   * - Set when it's declared, and never changed after:  the first datatype wins.
   */
  declare datatype: P.Datatype | undefined
  /** String used to initialize the variable.  Not consistently used. */
  declare initializer: string | undefined
  /**
   * `true` if this is an implicit "alias" for another variable rather than a genuinely-declared one,
   * e.g. `it`/`its` mapped to `this` -- see `MethodScope` constructor.
   * - Assigning to an alias' name declares a real variable in its place:
   *   the `assignment` rule (in `$/spell`) treats it as `isNewVariable` and `variables.replace()`s it.
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
   * A member's words as the user wrote them, if not its `name`,
   * e.g. `short rank` for property `short_rank`.
   * - For editors:  `name` is how it compiles, and how scope finds it
   *   (either spelling normalizes to it).
   */
  declare asWritten: string | undefined
  /**
   * `true` for a property its type never declared:  a `set the X of Y to ...` declared it at its first set.
   * - See spell's `AssignmentStatement`.
   */
  declare autoDeclared: boolean | undefined
  /**
   * `true` for the member naming the ONE list of a family holding an item,
   * e.g. `pile` on `Card` for `a card belongs to one pile`.
   * - Its value:  the pile holding the card, or nothing.
   * - READ-ONLY:  a move or an `add` changes it -- see `P.TypeScope.declareOwnerMember()`.
   * - Declared by that membership statement, NOT by a property statement of the item type.
   */
  declare exclusive: boolean | undefined
  /**
   * A built-in member's READ template:
   * javascript which reads it, `{it}` standing for the value it's read from.
   * - e.g. `{it}.length`, `{it}.getFullYear()` or `core.itemCountOf({it})`
   * - `undefined`:  a read compiles as plain `<object>.<name>`.
   * - From spell's table of built-in types -- see spell's `BUILT_IN_TYPE_TABLE`.
   * - The ONE statement that sets it:  a VALUE kind's property, `Suit.color({it})`,
   *   as a value is plain text with no properties of its own -- see `P.TypeScope.valueKind`.
   * - Anything else a project declares compiles as its own statements say.
   */
  declare readAs: string | undefined
  /**
   * A property's RULES:  what its value must be, beyond its type -- see `PropRule`.
   * - e.g. `[{ type: "empty" }]` for `- its title must not be empty`
   * - Said by any statement about it, on its own line or another.
   *   - `P.TypeScope.addPropertyRules()` keeps them by statement (`ruleSources`);  this is them all, in order.
   * - Imported:  as its declaration says them.
   * - Epic `property-editor` P9.
   */
  declare rules: readonly PropRule[] | undefined
  /** Which statement said which of `rules`, so a statement parsed again replaces its own. */
  declare ruleSources: ReadonlyArray<{ declaredBy: P.Match; rules: readonly PropRule[] }> | undefined
  /**
   * Its docs as markdown, for a member with no source to read them from:  a built-in type's.
   * - Anything a project declares has its docstring above its declaring statement instead.
   */
  declare docstring: string | undefined

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
   * - Use this to make an "alias" for the variable within its scope,
   *   e.g. to map spell's `its` to javascript's `this`.
   */
  output?: string
  /** See `ScopeVariable.kind`. */
  kind?: "argument" | "static" | "only"
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
  /** See `ScopeVariable.asWritten`. */
  asWritten?: string
  /** See `ScopeVariable.autoDeclared`. */
  autoDeclared?: boolean
  /** See `ScopeVariable.exclusive`. */
  exclusive?: boolean
  /** See `ScopeVariable.readAs`. */
  readAs?: string
  /** See `ScopeVariable.rules`. */
  rules?: readonly PropRule[]
  /** See `ScopeVariable.docstring`. */
  docstring?: string
}
