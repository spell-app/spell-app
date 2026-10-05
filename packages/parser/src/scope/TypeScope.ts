import { typeCase, instanceCase, snakeCase } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { BlockScope } from "./BlockScope"

/**
 * `TypeScope` -- a scope which encapsulates a known class or type.
 *  - `name` is the name of the type.
 *  - `superType` is name of the superclass, if any.
 *  - `methods` (from BlockScope) are instance methods' records -- see `ScopeMethod`.
 *  - `variables` (from BlockScope) are instance fields
 *  - `classMethods` and `classVariables` are static to the class.
 *  - `itemType`:  what a list type holds, e.g. `Card` for `a deck is a list of cards`.
 *  - `a card belongs to one pile`:  the item type's member naming its pile -- see `declareOwnerMember()`.
 *  - Member lookup walks the super-type chain:  `chain()`, `isA()`, `getMember()`.
 */
export class TypeScope extends BlockScope {
  /** Name of the type, which should be singular.  Will be normalized to Type_Case. */
  declare name: string
  /** Name of superclass, which should be singular.  Will be normalized to Type_Case. */
  declare superType?: string
  /** If true, the type was created as a stub. */
  declare stub?: boolean
  /**
   * What a list type holds, e.g. `Card` for `a deck is a list of cards` -- `undefined` for any other type.
   * - Set when declared (`claim()` for a stub), so journaled with it.
   * - Read through `scope.getItemType()`, which walks the super-type chain:  a sub-type of `Deck` holds cards too.
   */
  declare itemType?: P.Datatype
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
   * - Clears `stub`, takes `declaredBy`, `superType` and -- for a list type -- `itemType`.
   *   Journaled, so incremental parsing can take that back.
   * - Changes THIS object, NOT `types.replace()`:  matches parsed so far point at it (`data.scopeType`),
   *   and it may already hold property `classVariables`.
   * - `superType` MUST be right:  a project's declarations read it -- see `SP.SpellDeclarations`.
   */
  claim(declaredBy: P.Match, superType?: string, { itemType }: ClaimListOptions = {}): void {
    const previous = {
      stub: this.stub,
      declaredBy: this.declaredBy,
      superType: this.superType,
      itemType: this.itemType
    }
    const next = { stub: false, declaredBy, superType: superType && typeCase(superType), itemType }
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
   * - `name`:  how it compiles, e.g. `short_rank`.
   * - `asWritten`:  how it's written, if different, e.g. `short rank`.
   * - Either finds it (`getMember()`):  `variables` normalize their keys.
   * - Its `datatype`, if the statement gives one, e.g. `number`:
   *   a later `the X of Y` reads it (`getMember()`), as do editors.
   * - Compiled output still comes from each statement's own AST.
   * - `autoDeclared`:  its type never declared it, so its first `set` did -- see `P.ScopeVariable.autoDeclared`.
   * - The FIRST declaration of a name wins, as for types:  a later getter for the same property adds nothing.
   * - A getter's `datatype` comes once its body has parsed:  what it returns -- see spell's `property_value_getter`.
   */
  declareProperty(
    name: string,
    declaredBy: P.Match,
    { asWritten, datatype, autoDeclared }: DeclarePropertyOptions = {}
  ): void {
    const existing = this.variables.get(name, "LOCAL_ONLY")
    if (!existing) {
      // only what's there:  a declaration writes out what a record holds -- see spell's `SpellDeclarations`
      const props: P.ScopeVariableProps = { name, datatype, declaredBy }
      if (asWritten && asWritten !== name) props.asWritten = asWritten
      if (autoDeclared) props.autoDeclared = true
      this.variables.add(props)
    }
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
   * SIDE EFFECT:  `itemType` gains the read-only member naming us, the list type it belongs to ONE of,
   * e.g. `pile` on `Card` for `a card belongs to one pile`:  the pile holding a card, or nothing.
   * - Declared by that statement (`declaredBy`, so go-to-definition lands there).
   *   An import loads it from the member's own declaration instead -- see `SP.SpellDeclarations`.
   * - Its `datatype` is us, and it's `exclusive`, so a `set` of it is refused:  moving the item to a list does it.
   * - Its name is our class's when the code runs (`runtimeName`):  that's the getter compiled spell defines.
   * - REPLACES a property of that name another statement declared, journaled,
   *   e.g. one auto-declared by `set the pile of the card to ...`
   * - Ours from an earlier parse of the same statement:  ours again, as `declareProperty()`.
   */
  declareOwnerMember(itemType: TypeScope, declaredBy: P.Match): void {
    const name = instanceCase(this.runtimeName ?? this.name)
    const existing = itemType.variables.get(name, "LOCAL_ONLY")
    if (existing && existing.declaredBy === declaredBy) return
    if (existing?.exclusive && TypeScope.sameStatement(existing.declaredBy, declaredBy)) {
      const previous = existing.declaredBy
      existing.declaredBy = declaredBy
      declaredBy.scope.parser?.journal?.record({
        undo: () => (existing.declaredBy = previous),
        redo: () => (existing.declaredBy = declaredBy)
      })
      P.ScopeList.noteDeclared(existing)
      return
    }
    // only what's there:  a declaration writes out what a record holds
    const props: P.ScopeVariableProps = { name, datatype: this.name, exclusive: true, declaredBy }
    if (!existing) {
      itemType.variables.add(props)
      return
    }
    const [replaced] = itemType.variables.replace(props)
    P.ScopeList.noteDeclared(replaced)
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

  ////////////////
  // ## Members
  ////////////////

  /**
   * Us, then our super-type, and so on up -- stopping at one we've seen, in case of a cycle.
   * - Each super-type is looked up from where WE were declared, e.g. `Thing` from a project's `Card`.
   */
  chain(): TypeScope[] {
    const chain: TypeScope[] = [this]
    for (let at = this.superTypeScope(); at && !chain.includes(at); at = at.superTypeScope()) chain.push(at)
    return chain
  }

  /** Our super-type's record, looked up from where we were declared -- `undefined` if none, or unknown. */
  superTypeScope(): TypeScope | undefined {
    return this.superType ? this.parentScope?.types?.get(this.superType) : undefined
  }

  /** Are we `ancestor`, or a sub-type of it?  By record, or by name, e.g. `"thing"`. */
  isA(ancestor: TypeScope | string): boolean {
    const name = typeof ancestor === "string" ? typeCase(ancestor) : undefined
    return this.chain().some((type) => (name ? type.name === name : type === ancestor))
  }

  /**
   * Our member `words`, or the nearest super-type's -- `undefined` if none says.
   * - A property (`ScopeVariable`) or a method (`ScopeMethod`).
   * - A property first, then a method, at each step.
   * - `LOCAL_ONLY` at each step:  a type's lists fall back to its parent SCOPE's, not its super-type's.
   */
  getMember(words: string): P.ScopeVariable | P.ScopeMethod | undefined {
    for (const type of this.chain()) {
      const member = type.variables.get(words, "LOCAL_ONLY") ?? type.methods.get(words, "LOCAL_ONLY")
      if (member) return member
    }
    return undefined
  }

  /**
   * Our class variable `words`, or the nearest super-type's -- `undefined` if none declares it.
   * - e.g. `Suits` for a joker's `suits`, when `Joker` is a `Card`
   * - `LOCAL_ONLY` at each step, as for `getMember()`.
   */
  getClassVariable(words: string): P.ScopeVariable | undefined {
    for (const type of this.chain()) {
      const found = type.classVariables.get(words, "LOCAL_ONLY")
      if (found) return found
    }
    return undefined
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

  /** `ScopeMethod`s static to this class, keyed by (snake_case-normalized) name; `kind` set to `"static"`. */
  /*@memoize*/
  get classMethods(): P.ScopeList<P.ScopeMethod, P.ScopeMethod | P.ScopeMethodProps> {
    return this.derived(
      "classMethods",
      () =>
        new P.ScopeList({
          target: this,
          keyProp: "name",
          normalizeKey: snakeCase,
          transformer(item) {
            if (!(item instanceof P.ScopeMethod)) item = new P.ScopeMethod(item)
            item.scope = this.target
            item.kind = "static"
            return item
          }
        })
    )
  }
}

/** What `TypeScope.claim()` takes for a list type -- see `TypeScope.itemType`. */
export type ClaimListOptions = {
  /** What it holds, e.g. `Card`. */
  itemType?: P.Datatype
}

/** What `TypeScope.declareProperty()` takes besides a name -- each optional. */
export type DeclarePropertyOptions = {
  /** Its words as written, e.g. `short rank` -- see `P.ScopeVariable.asWritten`. */
  asWritten?: string
  /** What it holds, e.g. `number`. */
  datatype?: P.Datatype
  /** Declared by its first `set` -- see `P.ScopeVariable.autoDeclared`. */
  autoDeclared?: boolean
}

/** Constructor props for `TypeScope`. */
export type TypeScopeProps = {
  /** Name of the type, which should be singular.  Will be normalized to Type_Case. */
  name: string
  /** Name of superclass, which should be singular.  Will be normalized to Type_Case. */
  superType?: string
  /** If true, the type was created as a stub. */
  stub?: boolean
  /** See `TypeScope.itemType`. */
  itemType?: P.Datatype
  /** See `TypeScope.runtimeName`. */
  runtimeName?: string
  /** See `TypeScope.declaredBy`. */
  declaredBy?: P.Match
  /** See `TypeScope.declaredAt`. */
  declaredAt?: P.DeclaredAt
}
