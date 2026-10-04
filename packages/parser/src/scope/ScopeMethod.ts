import type { P } from "$/parser"

/**
 * `ScopeMethod` -- a method or function, as a scope RECORD:  what it's called, what it takes, what it gives back.
 * - Why:  a method is also a parser rule (its call site), but a rule can't say its parameters' types or what it
 *   returns.  This can, so a call's `datatype` can come from `returns`, and editors can read `params`.
 * - Lives in a scope's `methods`:  a type's instance methods in its `TypeScope`'s, a free function in its project's.
 * - Added by the defining statement's `mutateScope()` through `ScopeList.add()`, so the journal can take it back.
 */
export class ScopeMethod {
  /** Name it compiles to, e.g. `turn_over` -- what `methods` is keyed by. */
  declare name: string
  /** Its words as written in its signature, e.g. `turn (a card) over`. */
  declare words: string | undefined
  /** Its parameters, in order, each with its datatype if known -- NOT the instance it's called on. */
  declare params: P.ScopeParam[]
  /**
   * Datatype it returns, if known -- `undefined` until return types are worked out (P5 of precedence-and-types).
   * - A call's `datatype` comes from here.
   */
  declare returns: P.Datatype | undefined
  /** Type it's a method of, e.g. `Card` -- `undefined` for a free function. */
  declare of: string | undefined
  /** `"static"` for a class method -- see `TypeScope.classMethods`. */
  declare kind: "static" | undefined
  /** Scope it was added to -- set by its `ScopeList`. */
  declare scope: P.Scope | undefined
  /** Match whose `mutateScope()` declared it, if it came from source -- for go-to-definition etc. */
  declare declaredBy: P.Match | undefined
  /** Where it was declared, if IMPORTED -- so there's no `declaredBy`.  See `P.DeclaredAt`. */
  declare declaredAt: P.DeclaredAt | undefined

  /** Create from `ScopeMethodProps`;  `params` default to none. */
  constructor(props: ScopeMethodProps) {
    Object.assign(this, props)
    if (!this.name) throw new TypeError("Methods must be created with a 'name'")
    this.params ??= []
  }
}

/** Constructor props for `ScopeMethod` -- see there. */
export type ScopeMethodProps = {
  /** See `ScopeMethod.name`. */
  name: string
  /** See `ScopeMethod.words`. */
  words?: string
  /** See `ScopeMethod.params`. */
  params?: P.ScopeParam[]
  /** See `ScopeMethod.returns`. */
  returns?: P.Datatype
  /** See `ScopeMethod.of`. */
  of?: string
  /** See `ScopeMethod.kind`. */
  kind?: "static"
  /** See `ScopeMethod.scope`. */
  scope?: P.Scope
  /** See `ScopeMethod.declaredBy`. */
  declaredBy?: P.Match
  /** See `ScopeMethod.declaredAt`. */
  declaredAt?: P.DeclaredAt
}

/** One parameter of a `ScopeMethod`, e.g. `{ name: "pile", datatype: "Pile" }` for `(a pile)`. */
export type ScopeParam = {
  /** Parameter name, as the method's body calls it, e.g. `pile`. */
  name: string
  /** Its datatype, if the signature says, e.g. `Pile` for `(a pile)`, `text` for `(x as text)`. */
  datatype?: P.Datatype
}
