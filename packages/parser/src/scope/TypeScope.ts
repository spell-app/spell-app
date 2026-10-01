import { typeCase, instanceCase, snakeCase } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { BlockScope } from "./BlockScope"

/**
 * `TypeScope` -- a scope which encapsulates a known class or type.
 *  - `name` is the name of the type.
 *  - `superType` is name of the superclass, if any.
 *  - `methods` (from BlockScope) are instance methods, including `constructor` if provided.
 *  - `variables` (from BlockScope) are instance fields
 *  - `classMethods` and `classVariables` are static to the class.
 */
export class TypeScope extends BlockScope {
  /** Name of the type, which should be singular.  Will be normalized to Type_Case. */
  declare name: string
  /** Name of superclass, which should be singular.  Will be normalized to Type_Case. */
  declare superType?: string
  /** If true, the type was created as a stub. */
  declare stub?: boolean
  /**
   * Name of our class when the code runs, if not `name` -- e.g. `Card` for a type imported as `Playingcard`.
   * - Why:  runtime type checks compare class names as strings, e.g. `spellCore.isOfType(thing, 'Card')`.
   *   Compiled code names the class by `name` -- `import { Card as Playingcard }` -- but that doesn't rename it.
   * - See `P.ASTTypeExpression.runtimeName`.
   */
  declare runtimeName?: string
  /**
   * Match whose `mutateScope()` declared this type, if it came from source -- for go-to-definition etc.
   * - For a `stub`, its FIRST mention, e.g. a property definition before the type's own `is a` line.
   */
  declare declaredBy: P.Match | undefined
  /** Where it was declared, if IMPORTED -- so there's no `declaredBy`.  See `P.DeclaredAt`. */
  declare declaredAt?: P.DeclaredAt

  /** Create with a string `typeName`, or `TypeScopeProps` object; normalizes `name`/`superType` to Type_Case. */
  constructor(typeName: string)
  constructor(props: TypeScopeProps)
  constructor(input: string | TypeScopeProps) {
    // If passed in as a string, use it as the name
    if (typeof input === "string") super({ name: input })
    else super(input)

    if (!this.name) throw new TypeError("Types must be created with a 'name'")

    // Make sure type `name` and `superType` are in `Type_Case`
    this.name = typeCase(this.name)
    if (this.superType) this.superType = typeCase(this.superType)
  }

  ////////////////
  // ## Declaring
  ////////////////

  /**
   * Type `name` in `scope.types`, or a new STUB for it if there isn't one yet.
   * - Lets a property or method be declared on a type before the type's own `is a` line,
   *   e.g. a forward reference, or a type defined later in the same file.
   * - `declaredBy` (the mentioning match) is a stub's `declaredBy`, until `claim()` upgrades it.
   */
  static getOrStub(scope: P.Scope, name: string, declaredBy: P.Match): TypeScope {
    return scope.types?.get(name) ?? scope.types!.add({ name, stub: true, declaredBy })[0]!
  }

  /**
   * `declaredBy` really declares us, with `superType`:  we were stubbed by an earlier mention (see `getOrStub()`),
   * or left by an earlier parse of the same statement (see `sameStatement()`).
   * - Clears `stub`, takes `declaredBy` and `superType`, journaled so incremental parsing can take that back.
   * - Changes THIS object, NOT `types.replace()`:  matches parsed so far point at it (`data.scopeType`),
   *   and it may already hold property `classVariables`.
   * - `superType` MUST be right:  a project's declarations read it -- see `SP.SpellDeclarations`.
   */
  claim(declaredBy: P.Match, superType?: string): void {
    const previous = { stub: this.stub, declaredBy: this.declaredBy, superType: this.superType }
    const next = { stub: false, declaredBy, superType: superType && typeCase(superType) }
    Object.assign(this, next)
    // now IT declares us -- see `ScopeList.noteDeclared()`
    P.ScopeList.noteDeclared(this)
    declaredBy.scope.parser?.journal?.record({
      undo: () => Object.assign(this, previous),
      redo: () => Object.assign(this, next)
    })
  }

  /**
   * Record property `name` as one of our instance `variables`, declared by `declaredBy`.
   * - For editors:  a property's declaration, and its `datatype` if the statement gives one, e.g. `number`.
   *   Nothing parsed later reads these -- compiled output comes from each statement's own AST.
   * - The FIRST declaration of a name wins, as for types:  a later getter for the same property adds nothing.
   * - NOTE: spell's getter rule is `changesScope: "internal"`, so editing one doesn't re-parse the getters after it.
   *   Rename the first of two getters for one property and the property has no record until the second re-parses
   *   -- editors then find it by name instead.
   */
  declareProperty(name: string, declaredBy: P.Match, datatype?: string): void {
    const existing = this.variables.get(name, "LOCAL_ONLY")
    if (!existing) this.variables.add({ name, datatype, declaredBy })
    // an earlier parse of THIS statement left it:  it's ours again -- see `sameStatement()`
    else if (existing.declaredBy !== declaredBy && TypeScope.sameStatement(existing.declaredBy, declaredBy)) {
      const previous = existing.declaredBy
      existing.declaredBy = declaredBy
      declaredBy.scope.parser?.journal?.record({
        undo: () => (existing.declaredBy = previous),
        redo: () => (existing.declaredBy = declaredBy)
      })
      P.ScopeList.noteDeclared(existing)
    }
  }

  /**
   * Is `old` an earlier parse of the same statement as `match`:  same rule, same line of the same file?
   * - Why:  incremental parsing can REPLAY a record an old match added (`P.ParseJournal` swaps in whole item
   *   lists), so a re-parsed statement finds "its" record already there -- declared by a match that's gone.
   *   It should take it back, as a full parse would have it declare it.
   * - Its TEXT may differ, e.g. `a card is a t` while typing `a card is a thing`:  what the line says now wins.
   * - A genuine second declaration, e.g. the same line twice, is on another line:  the first still wins.
   */
  static sameStatement(old: P.Match | undefined, match: P.Match): boolean {
    if (!old || old === match) return false
    return (
      old.rule === match.rule &&
      old.line === match.line &&
      old.getScopeOfType(P.FileScope) === match.getScopeOfType(P.FileScope)
    )
  }

  /**
   * Syntactic sugar for the type name.
   * - e.g. if type name is `Card`, `instanceName` would be `card`.
   */
  get instanceName() {
    return instanceCase(this.name)
  }

  /** Named `ScopeVariable`s static to this class, keyed by (snake_case-normalized) name; `kind` set to `"static"`. */
  /*@memoize*/
  get classVariables() {
    return this.derived(
      "classVariables",
      () =>
        new P.ScopeList({
          target: this,
          keyProp: "name",
          normalizeKey: snakeCase,
          transformer(item) {
            if (!(item instanceof P.ScopeVariable)) item = new P.ScopeVariable(item)
            item.scope = this.target
            item.kind = "static"
            return item
          }
        })
    )
  }

  /** Named `MethodScope`s static to this class, keyed by (snake_case-normalized) name; `kind` set to `"static"`. */
  /*@memoize*/
  get classMethods() {
    return this.derived(
      "classMethods",
      () =>
        new P.ScopeList({
          target: this,
          keyProp: "name",
          normalizeKey: snakeCase,
          transformer(item) {
            if (!(item instanceof P.MethodScope)) item = new P.MethodScope(item)
            item.parentScope = this.target
            item.kind = "static"
            return item
          }
        })
    )
  }
}

/** Constructor props for `TypeScope`. */
export type TypeScopeProps = {
  /** Name of the type, which should be singular.  Will be normalized to Type_Case. */
  name: string
  /** Name of superclass, which should be singular.  Will be normalized to Type_Case. */
  superType?: string
  /** If true, the type was created as a stub. */
  stub?: boolean
  /** See `TypeScope.runtimeName`. */
  runtimeName?: string
  /** See `TypeScope.declaredBy`. */
  declaredBy?: P.Match
  /** See `TypeScope.declaredAt`. */
  declaredAt?: P.DeclaredAt
  /** Instance methods, including `constructor` if provided. */
  methods?: P.MethodScope[]
  /** Instance variables. */
  variables?: P.ScopeVariable[]
}
