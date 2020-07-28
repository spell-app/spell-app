import { forward, writeOnce } from "~/util"
/**
 * We create a `Scope` when starting a parse run to allow the parser
 * to keep state as it descends up and down.
 *
 * Scopes can be nested.
 *
 * The base scope is basically just a wrapper to the `parser`.
 */
export class Scope {
  /**
   * Pointer to our parent scope, if any, set on construction.
   *
   * Note: We forward `.methods`, `.variables.`, `.types`, `.constants` and `.rules` to our parent scope.
   *       Subclasses may choose to implement these directly, generally as `IndexedList`s.
   */
  @forward("methods", "variables", "types", "constants", "rules")
  @writeOnce
  scope

  constructor(props) {
    Object.assign(this, props)
  }

  //----------------------------
  // Parsing

  // Default to our parent `scope`'s `parser` if one was not explicitly set up.
  get parser() {
    return this._parser || this.scope?.parser
  }

  set parser(parser) {
    this._parser = parser
  }

  // Parse using this scope in various flavors.
  parse(text, ruleName, scope = this) {
    return this.parser.parse(text, ruleName, scope)
  }

  compile(text, ruleName, scope = this) {
    return this.parser.compile(text, ruleName, scope)
  }

  //-----------------
  //  Debug
  //-----------------
  toString() {
    return `[${this.constructor.name}]`
  }
}
