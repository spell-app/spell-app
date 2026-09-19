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
  /** Name of the type, which should be singular.  Will be normalized to TypeCase. */
  declare name: string
  /** Name of superclass, which should be singular.  Will be normalized to TypeCased. */
  declare superType?: string
  /** If true, the type was created as a stub. */
  declare stub?: boolean

  constructor(typeName: string)
  constructor(props: TypeScopeProps)
  constructor(input: string | TypeScopeProps) {
    // If passed in as a string, use it as the name
    if (typeof input === "string") super({ name: input })
    else super(input)

    if (!this.name) throw new TypeError("Types must be created with a 'name'")

    // Make sure type `name` and `superType` are in `Type_Case`
    this.name = this.name = typeCase(this.name)
    if (this.superType) this.superType = typeCase(this.superType)
  }

  // Syntactic sugar for the type name.
  // e.g. if the type name is `Card`, the instanceName would be `card`.
  get instanceName() {
    return instanceCase(this.name)
  }

  /** Scope `classVariables`. */
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

  /** Scope `classMethods`. */
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

export type TypeScopeProps = {
  name: string
  superType?: string
  stub?: boolean
  methods?: P.MethodScope[]
  variables?: P.ScopeVariable[]
}
