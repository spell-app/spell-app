import assert from "assert"

// Variable definition, including:
//      - global variable
//      - block-local variable
//      - class property
//      - instance property
//
// Expected properties:
//  - module
//  - scope
//  - name
//  - datatype
//  - initializer
//  - kind:  "argument", "static"
export default class Variable {
  constructor(props) {
    // Convert string to 'name'
    if (typeof props === "string") props = { name: props }
    assert(props.name, "Variables must be created with a 'name'")
    // Assign all properties in the order provided.
    Object.assign(this, props)
  }
}
