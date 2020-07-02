import assert from "assert"
import lowerFirst from "lodash/lowerFirst"

import { IndexedList, typeCase, instanceCase, snakeCase, memoize } from "~/util"
import { MethodScope, ScopeVariable } from "~/parser"
import { BlockScope } from "."

/**
 * `TypeScope` -- a scope which encapsulates a known class or type.
 *  - `name` is the name of the type, which should be singular and will be normalized to TypeCase.
 *  - `superClass` is name of superclass, if provided, and should be singular and will be TypeCased.
 *  - `stub` is `true` if the type was created as a stub. DOCME
 *  - `methods` (from BlockScope) are instance methods, including `constructor` if provided.
 *  - `variables` (from BlockScope) are instance variables
 *  - `classMethods` and `classVariables` are static to the class.
 */
export class TypeScope extends BlockScope {
  constructor(props) {
    // If you just pass a string we'll assume it's the type name.
    if (typeof props === "string") props = { name: props }
    assert(props.name, "Types must be initialized with a 'name'")
    // Make sure type `name` and `superType` are in `Type_Case`
    props.name = typeCase(props.name)
    if (props.superType) props.superType = typeCase(props.superType)

    super(props)
  }

  /** Scope `classVariables`. */
  @memoize
  get classVariables() {
    return new IndexedList({
      target: this,
      keyProp: "name",
      normalizeKey: snakeCase,
      transformer(item) {
        if (!(item instanceof ScopeVariable)) item = new ScopeVariable(item)
        item.scope = this.target
        item.kind = "static"
        return item
      }
    })
  }

  /** Scope `classMethods`. */
  @memoize
  get classMethods() {
    return new IndexedList({
      target: this,
      keyProp: "name",
      normalizeKey: snakeCase,
      transformer(item) {
        if (!(item instanceof MethodScope)) item = new MethodScope(item)
        item.scope = this.target
        item.kind = "static"
        return item
      }
    })
  }

  // Syntactic sugar for the type name.
  // e.g. if the type name is `Card`, the instanceName would be `card`.
  get instanceName() {
    return instanceCase(this.name)
  }
}
