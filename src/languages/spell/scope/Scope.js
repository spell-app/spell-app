//
//  Intermediate types -- simplified AST
//
import assert from "assert"
import lowerFirst from "lodash/lowerFirst"
import uniq from "lodash/uniq"

import { Parser, indexedList, typeCase, snakeCase } from "../all"

import { Variable, Constant, Method, Type } from "./all"

// NOTE: this is the only export from this file.
// Consumers of this file should use `scope.addMethod(...)` or `new `Scope.Method(...)`
//
//  Expected properties:
//
//  - async       // if `true`, something in the scope is being called asynchronously
export default class Scope {
  constructor(props) {
    // You can initialize with just a `Parser` instance if desired.
    if (props instanceof Parser) props = { parser: props }

    const { statement, ...otherProps } = props
    Object.assign(this, otherProps)
    if (statement) this.addStatement(statement)
  }

  //
  //  Compiling
  //

  toString() {
    return this.compileStatements()
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
  // Local and scope Constants
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
  // Local and scope Types
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

  // Return the named type.  If not found, create a stub type.
  getOrStubType(name) {
    const type = this.types(name)
    if (type) return type
    return this.types.add({ name, stub: true })
  }

  //----------------------------
  //  Statements
  //
  addStatement(statement, results) {
    if (!this.statements) this.statements = []
    this.statements.push(statement)
    return statement
  }

  // Add a Match for a Block, e.g. from an `if` or `forEach` which has nested statements.
  addBlock(block, results) {
    block.matched.forEach(match => {
      this.addStatement(match.compile()) // TODO: not clear if we should add to `results`... ???
    })
  }

  compileStatements(statements = this.statements) {
    if (!statements || statements.length === 0) return "{}"
    // Hack whitespace off of the end of lines as necessary
    statements = statements.map(statement => `${statement}`.trimEnd())
    if (statements.length === 1) return `{ ${statements} }`
    return `{\n  ${this.statements.join("\n  ")}\n}`
  }

  //----------------------------
  // Parser

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

  statement(text) {
    return this.parser.parse(text, "statement", this)
  }

  exp(text) {
    return this.parser.parse(text, "expression", this)
  }

  // Return a named rule from our parser.
  // Throws if not found.
  getRuleOrDie(ruleName) {
    return this.parser?.getRuleOrDie(ruleName)
  }

  // Add a generic rule.
  // `ruleProps` can be properties or an actual rule instance.
  // Consider using (or making) a more-specific setter like those below
  //  to set up `alias`, `precedence`, etc.
  addRule(ruleProps, results) {
    const rule = this.parser.defineRule(ruleProps, results)
    if (results && results.rules) results.rules.push(rule)
    if (results) results.statements.push(`// SPELL added rule: \`${rule.toSyntax()}\``)
    return rule
  }

  // Add a multi-word identifier.
  // Single word identifiers dont' need special treatment. (???)
  addExpressionRule(props, results) {
    this._addRuleAlias(props, "expression", "single_expression")
    if (!props.precedence) props.precedence = 20 // TODO
    return this.addRule(props, results)
  }

  // Add an expression suffix rule, e.g. "<thing> is not? a face card".
  addExpressionSuffixRule(props, results) {
    this._addRuleAlias(props, "expression_suffix")
    if (!props.precedence) props.precedence = 20 // TODO
    return this.addRule(props, results)
  }

  // Add a statement rule.
  addStatementRule(props, results) {
    this._addRuleAlias(props, "statement")
    return this.addRule(props, results)
  }

  // Add an enumerated type rule.
  // `props.name` is the name of the enumeration, and must be upper-case.
  // `props.enumeration` is the array of enumerated values.
  // Automatically adds all strings in the enumeration as "constants".
  // Returns `{ datatype, statements }` for working with the enumeration.
  addEnumeration(props, results) {
    props.scope = this
    assert(Array.isArray(props.enumeration), "scope.addEnumeration() must be called with an 'enumeration'")
    const { enumeration, name } = props
    results.name = name
    results.canonicalRef = `${this.name}.${name}`
    results.enumeration = enumeration
    props.enumerationValues = []

    // Figure out enumeration datatype(s) and add constants for all string values
    results.datatype = uniq(
      enumeration.map(value => {
        const enumerationValue = typeof value === "string" ? this.constants.add(value).value : value
        props.enumerationValues.push(enumerationValue)
        return typeof value
      })
    )
    // eslint-disable-next-line prefer-destructuring
    if (results.datatype.length === 1) results.datatype = results.datatype[0]
    results.enumType = { type: "enum", datatype: results.datatype, enumeration }

    // Add statements to declare the value
    // WAS:    const initializer = JSON5.stringify(enumeration);
    const initializer = `[${enumeration.join(", ")}]`
    let literals
    let statement
    if (this instanceof Type) {
      literals = [[this.name, this.instanceName], [name, lowerFirst(name)]]
      // Add the full list as a class var.
      statement = this.classVariables.add({ ...props, initializer, datatype: results.enumType })
      results.statements.push(statement)
      // Add instance var which points to the class var.
      statement = this.variables.add({ ...props, initializer: results.canonicalRef, datatype: results.enumType })
      results.statements.push(statement)
    } else {
      literals = [this.name, [name, lowerFirst(name)]]
      statement = this.variables.add({ ...props, initializer, datatype: results.enumType })
      results.statements.push(statement)
    }

    // Add multi-word identifier rule to get the enumeration back, e.g. `card suits` or `Card Suits`.
    this.addExpressionRule(
      {
        name: `${this.name}_${name}`,
        literals,
        datatype: results.enumType,
        compile() {
          return results.canonicalRef
        }
      },
      results
    )
  }

  // Add an alias to rule `props`.
  // NOTE: modifies the props!
  _addRuleAlias(props, ...aliai) {
    if (!props.alias) props.alias = []
    else if (typeof props.alias === "string") props.alias = [props.alias]
    aliai.forEach(alias => {
      if (!props.alias.includes(alias)) props.alias.push(alias)
    })
    return props
  }
}
