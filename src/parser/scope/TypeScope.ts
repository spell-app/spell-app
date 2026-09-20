import { IndexedList, typeCase, instanceCase, snakeCase } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { BlockScope } from "./BlockScope"

/**
 * `TypeScope` -- a scope which encapsulates a known class or type.
 *  - `name` is the name of the type.
 *  - `superType` is name of the superclass, if any.
 *  - `methods` (from BlockScope) are instance methods, including `constructor` if provided.
 *  - `variables` (from BlockScope) are instance variables
 *  - `classMethods` and `classVariables` are static to the class.
 */
export class TypeScope extends BlockScope {
  /** Name of the type, which should be singular.  Will be normalized to Type_Case. */
  declare name: string
  /** Name of superclass, which should be singular.  Will be normalized to Type_Case. */
  declare superType?: string
  /** If true, the type was created as a stub. */
  declare stub?: boolean

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
        new IndexedList({
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
        new IndexedList({
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
  /** Instance methods, including `constructor` if provided. */
  methods?: P.MethodScope[]
  /** Instance variables. */
  variables?: P.ScopeVariable[]
}
