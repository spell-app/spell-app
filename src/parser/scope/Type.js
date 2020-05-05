import assert from "assert"
import lowerFirst from "lodash/lowerFirst"

import { Scope, Variable, Method, indexedList, typeCase } from ".."

// Type, which extends Scope.  Specifically:
//  - `name` is the name of the type, and should be TypeCase and singular.
//  - `superClass` is name of superclass, if provided, and should be TypeCase and singular.
//  - `stub` is `true` if the type was created as a stub.
//  - `methods` (from Scope) are instance methods, including `constructor` if provided.
//  - `variables` (from Scope) are instance variables
//  - `classMethods` and `classVariables` are static to the class.
export default class Type extends Scope {
  constructor(props) {
    // If you just pass a string we'll assume it's the type name.
    if (typeof props === "string") props = { name: props }
    assert(props.name, "Types must be initialized with a 'name'")
    // Make sure type `name` and `superType` are in `Type_Case`
    props.name = typeCase(props.name)
    if (props.superType) props.superType = typeCase(props.superType)

    super(props)
  }

  //----------------------------
  // Class Variables and Methods (statics)
  //
  @indexedList({
    keyProp: "name",
    normalizeKey: typeCase,
    transformer(item) {
      if (!(item instanceof Variable)) item = new Variable(item)
      item.scope = this
      item.kind = "static"
      return item
    }
  })
  classVariables

  @indexedList({
    keyProp: "name",
    normalizeKey: typeCase,
    transformer(item) {
      if (!(item instanceof Method)) item = new Method(item)
      item.scope = this
      item.kind = "static"
      return item
    }
  })
  classMethods

  // Syntactic sugar for the type name.
  // e.g. if the type name is `Card`, the instanceName would be `card`.
  get instanceName() {
    return lowerFirst(this.name)
  }
}
Scope.Type = Type
