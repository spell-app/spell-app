import assert from "assert"
import lowerFirst from "lodash/lowerFirst"

import { IndexedList, typeCase, snakeCase, memoize } from ".."
import { Scope, MethodScope, ScopeVariable } from "."

// Type, which extends Scope.  Specifically:
//  - `name` is the name of the type, and should be TypeCase and singular.
//  - `superClass` is name of superclass, if provided, and should be TypeCase and singular.
//  - `stub` is `true` if the type was created as a stub.
//  - `methods` (from Scope) are instance methods, including `constructor` if provided.
//  - `variables` (from Scope) are instance variables
//  - `classMethods` and `classVariables` are static to the class.
export class TypeScope extends Scope {
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
      parentProp: "scope.classVariables",
      normalizeKey: snakeCase,
      transformer(item) {
        if (!(item instanceof ScopeVariable)) item = new ScopeVariable(item)
        item.scope = this
        item.kind = "static"
        return item
      }
    })
  }

  /** Scope `classVariables`. */
  @memoize
  get classMethods() {
    return new IndexedList({
      target: this,
      keyProp: "name",
      parentProp: "scope.classMethods",
      normalizeKey: snakeCase,
      transformer(item) {
        if (!(item instanceof MethodScope)) item = new MethodScope(item)
        item.scope = this
        item.kind = "static"
        return item
      }
    })
  }

  // Syntactic sugar for the type name.
  // e.g. if the type name is `Card`, the instanceName would be `card`.
  get instanceName() {
    return lowerFirst(this.name)
  }
}
