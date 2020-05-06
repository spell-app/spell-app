import { IndexedList, forward, writeOnce, memoize, snakeCase, Variable, Method } from ".."

/**
 * DOCME
 */

//
//  Scope: execution context which maintain `IndexedList`s of:
//    - variables
//    - methods
//    - constants (TODO: make constants global??)
//    - types (TODO: make types global?)
//  Scopes can point to parent `scope`(s) and "inherit" the above from their ancestors.
//
//  Access as:
//    - `scope.variables()`                   return local variables defined on this scope
//    - `scope.variables('name')              returns named variable from scope or parent scope(s).
//    - `scope.variables('name', 'LOCAL')     returns named variable from LOCAL SCOPE ONLY
//  Update as:
//    - `scope.variables.add(new Variable())  pass explicit pre-created variable, make sure to set `name`
//    - `scope.variables.add('name')          creates a Variable for you implicitly
//    - `scope.variables.remove(name)`
//  See `src/util/indexedList.js` for more details.
//
//  Scopes also point to a `parser` (possibly from a parent scope)
//  which defines a set of spell `rules`.  You can add rules dynamically:
//    - `scope.addRule()`
//
//  Finally, you can use the scope to actually parse some raw text:
//    - `scope.parse(text, startRuleName)`
//    - `scope.compile(text, startRuleName)
//
export default class Scope {
  /**
   * Pointer to our parent scope.
   *
   * Note: we forward `.types`, `.constants` and `.rules` to our parent scope,
   *       so they will be defined, e.g. at the `Project` level
   *       rather than the `File` level.
   */
  @forward("types", "constants", "rules")
  @writeOnce
  scope

  constructor(props) {
    Object.assign(this, props)
  }

  /** Scope `variables`. */
  @memoize
  get variables() {
    return new IndexedList({
      target: this,
      keyProp: "name",
      parentProp: "scope.variables",
      normalizeKey: snakeCase,
      transformer(item) {
        if (!(item instanceof Variable)) item = new Variable(item)
        item.scope = this.target
        return item
      }
    })
  }

  /** Scope `methods`. */
  @memoize
  get methods() {
    return new IndexedList({
      target: this,
      keyProp: "name",
      parentProp: "scope.methods",
      normalizeKey: snakeCase,
      transformer(item) {
        if (!(item instanceof Method)) item = new Method(item)
        item.scope = this.target
        return item
      }
    })
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
  parse(text, ruleName) {
    return this.parser.parse(text, ruleName, this)
  }

  compile(text, ruleName) {
    return this.parser.compile(text, ruleName, this)
  }

  // Add a generic rule to our `parser`.
  // `rule` is a `Rule` instance or props which will be converted in `defineRule()`.
  addRule(rule) {
    const { parser } = this
    if (!parser) throw new TypeError("scope.addRule() called on scope without a 'parser'")
    this.rules.add(rule)
    return this.parser.defineRule(rule)
  }
}
