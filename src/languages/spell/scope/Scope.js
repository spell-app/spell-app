import { indexedList, typeCase, snakeCase } from ".."
import { Variable, Constant, Method, Type } from "."

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
//    - `scope.remove(name)`
//  See `src/utils/indexedList.js` for more details.
//
//  Scopes also point to a `parser` (possibly from a parent scope)
//  which defines a set of spell `rules`.  You can add rules dynamically:
//    - `scope.addRule()`
//
//  Finally, you can use the scope to actually parse some text:
//    - `scope.parse(text, startRuleName)`
//    - `scope.compile(text, startRuleName)
//
export default class Scope {
  constructor(props) {
    Object.assign(this, props)
  }

  //----------------------------
  // Local and scope Variables
  //
  @indexedList({
    keyProp: "name",
    parentProp: "scope",
    normalizeKey: snakeCase,
    transformer(item) {
      if (!(item instanceof Variable)) item = new Variable(item)
      item.scope = this
      return item
    }
  })
  variables

  //----------------------------
  // Local and scope Methods
  //
  @indexedList({
    keyProp: "name",
    parentProp: "scope",
    normalizeKey: snakeCase,
    transformer(item) {
      if (!(item instanceof Method)) item = new Method(item)
      item.scope = this
      return item
    }
  })
  methods

  //----------------------------
  // Local and scope Constants
  // TODO: do local constants make sense?  scope to module?  global?
  //
  @indexedList({
    keyProp: "name",
    parentProp: "scope",
    normalizeKey: snakeCase,
    transformer(item) {
      if (!(item instanceof Constant)) item = new Constant(item)
      item.scope = this
      return item
    }
  })
  constants

  //----------------------------
  // Local and scope Types
  // TODO: do local types make sense?  scope to module?  global?
  //
  @indexedList({
    keyProp: "name",
    parentProp: "scope",
    normalizeKey: typeCase,
    transformer(item) {
      if (!(item instanceof Type)) item = new Type(item)
      item.scope = this
      return item
    }
  })
  types

  // Return the named type.  If not found, create a `stub` type.
  getOrStubType(name) {
    return this.types(name) || this.types.add({ name, stub: true })
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

  // Syntactic sugar
  get rules() {
    return this.parser?.rules
  }

  // Parse using this scope in various flavors.
  parse(text, ruleName) {
    return this.parser.parse(text, ruleName, this)
  }

  compile(text, ruleName) {
    return this.parser.compile(text, ruleName, this)
  }

  // Return a named rule from our parser.
  // Throws if not found.
  getRuleOrDie(ruleName) {
    return this.parser?.getRuleOrDie(ruleName)
  }

  // Add a generic rule to our `parser`.
  // `rule` is a `Rule` instance or props which will be converted in `defineRule()`.
  addRule(rule) {
    const { parser } = this
    if (!parser) throw new TypeError("scope.addRule() called on scope without a 'parser'")
    return this.parser.defineRule(rule)
  }
}
