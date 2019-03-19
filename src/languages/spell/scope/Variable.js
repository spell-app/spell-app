import assert from "assert";
import {
  Scope,
  Type,
} from "./all.js";

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
export class Variable {
  constructor(props) {
    // Convert string to 'name'
    if (typeof props === "string") props = { name: props };
    assert(props.name, "Variables must be created with a 'name'");
    // Assign all properties in the order provided.
    Object.assign(this, props);
  }

  toString() {
    const { name, initializer } = this;
    // If we're attached to a Type,
    if (this.scope instanceof Type) {
      // Add class props directly
      if (this.kind === "static")
        return `${this.scope.name}.${this.name} = ${initializer}`;
      // Add instance props with defineProp
      return `defineProp(${this.scope.name}.prototype, '${this.name}', { value: ${initializer} })`;
    }

    if (this.kind === "argument") {
      if (initializer) return `${name} = ${initializer}`;
      return name;
    }

    // HMM... this is a bit conflatey... may need `var` without explicit initializer?
    if (initializer) {
      const allocator = this.allocator || 'let';
      return `${allocator} ${name} = ${initializer}`;
    }

    return name;
  }
}
