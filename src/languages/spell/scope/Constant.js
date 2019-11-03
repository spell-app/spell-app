import { ParseError } from "../all"

import { Scope, Variable } from "./all"

//
// Constant definition.
//
// Expected properties:
//  - module
//  - scope
//  - name
//  - value (defaults to `'name'`)
//  - datatype (defaults to `string`)
//
export class Constant {
  constructor(props) {
    // Use string as constant `name`
    if (typeof props === "string") {
      // remove surrounding single quotes
      if (typeof props === "string" && props.startsWith("'") && props.endsWith("'")) props = props.slice(1, -1)
      props = { name: props }
    }
    if (!props.name) throw new ParseError("Constants must be created with a 'name'")
    // Assign all properties in the order provided.
    Object.assign(this, props)
    if (this.value === undefined) this.value = `'${this.name}'`
  }

  toString() {
    return this.value
  }
}
Scope.Constant = Constant
