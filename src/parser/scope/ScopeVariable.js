import assert from "assert"

/**
 * `ScopeVariable` a variable defined within a `Scope`.
 * - `name` (required) variable name, used in spell.
 * - `output` variable output name in translated language.
 *            Use this to make an "alias" for the variable w/in its scope,
 *            e.g. to map spell: `its` to javascript: `this`.
 * - `kind` One of `"argument"`, `"static"` or `undefined` for a normal variable.
 * - `scope` Pointer to the scope where this variable was defined.
 * - `datatype` Type of the variable.  Not consistently used (yet).
 * - `initializer` String used to initialize the variable.  Not consistently used.
 */
export class ScopeVariable {
  constructor(props) {
    // Convert string to 'name'
    if (typeof props === "string") props = { name: props }
    assert(props.name, "Variables must be created with a 'name'")
    // Assign all properties in the order provided.
    Object.assign(this, props)
  }
}
