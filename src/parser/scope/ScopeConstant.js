import { ParserError } from "~/parser"

// RegExp to match quotes surrounding string name.
const ENCLOSING_QUOTES = /^['"](.*)['"]$/

/**
 * `ScopeConstant` a variable defined within a `Scope`.
 * - `name` (required) Constant name, quotes will be stripped.
 * - `output` Literal output string for constant when expressed in target language,
 *            with quotes as necessary.  Defaults to `'name'`.
 * - `scope` Where constant was defined.
 */
export class ScopeConstant {
  constructor(props) {
    // Use string as constant `name`
    if (typeof props === "string") props = { name: props }

    if (typeof props.name !== "string") throw new ParserError("Constants must be created with a 'name'")
    props.name = props.name.replace(ENCLOSING_QUOTES, "$1")
    // Assign all properties in the order provided.
    Object.assign(this, props)
    // Set up `output` as single-quoted version of the `name`.
    if (this.output === undefined) this.output = `'${this.name}'`
  }

  toString() {
    return this.output
  }
}
