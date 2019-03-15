//
//  Intermediate types -- simplified AST
//
import keyBy from "lodash/keyBy";
import flatten from "lodash/flatten";
import lowerFirst from "lodash/lowerFirst"
import upperFirst from "lodash/upperFirst"
import snakeCase from "lodash/snakeCase"
import uniq from "lodash/uniq"
import JSON5 from "JSON5";


import {
  Parser,
  ParseError,
  Rule,
  SpellParser,

  clearMemoized,
  memoize,
  typeCase,
  toLower,
} from "./all.js";

// NOTE: this is the only export from this file.
// Consumers of this file should use `scope.addMethod(...)` or `new `Scope.Method(...)`
//
//  Expected properties:
//
//  - async       // if `true`, something in the scope is being called asynchronously
export class Scope {
  constructor(props) {
    // You can initialize with just a `Parser` instance if desired.
    if (props instanceof Parser) props = { parser: props };

    const { statement, ...otherProps } = props;
    Object.assign(this, otherProps);
    if (statement) this.addStatement(statement);
  }

  //
  //  Compiling
  //

  toString() {
    return this.compileStatements();
  }


  /////////////////
  // Vars
  //

  // Local variables as a map.
  @memoize
  get _variables() { return this._getItemMap("variables") }

  // Add a variable to this scope.
  @clearMemoized("_variables")
  addVariable(variable, results) { return this._addItem(variable, "variables", results, Variable) }

  // Return definition of `var` anywhere in our parent chain.
  getVariable(name) {
    return this.getLocalVariable(name) || this.scope?.getVariable(name);
  }

  // Return definition of `var` DEFINED IN THIS SCOPE ONLY.
  getLocalVariable(name) {
    return this._getItem("_variables", name);
  }


  /////////////////
  // Constants
  //

  // Local constants as a map.
  @memoize
  get _constants() { return this._getItemMap("constants") }

  // Add a constant to this scope.
  @clearMemoized("_constants")
  addConstant(constant, results) { return this._addItem(constant, "constants", results, Constant) }

  // Return definition of `constant` anywhere in our parent chain.
  getConstant(name) {
    return this._getItem("_constants", name) || this.scope?.getConstant(name);
  }


  /////////////////
  // Methods
  //

  // Local variables as a map.
  @memoize
  get _methods() { return this._getItemMap("methods") }

  // Add a method to this scope.
  @clearMemoized("_methods")
  addMethod(method, results) { return this._addItem(method, "methods", results, Method) }

  // Return definition of `method` anywhere in our parent chain.
  getMethod(name) {
    return this._getItem("_methods", name) || this.scope?.getMethod(name);
  }


  /////////////////
  // Types
  //

  @memoize
  get _types() { return this._getItemMap("types", typeCase) }

  // Add a type to this scope.
  @clearMemoized("_types")
  addType(type, results) {
    return this._addItem(type, "types", results, Type);
  }

  // Return definition of `type` anywhere in our parent chain.
  getType(name) {
    return this._getItem("_types", name, typeCase) || this.scope?.getType(name);
  }

  // Return the named type, creating and adding one if necessary.
  getOrStubType(name, results) {
    return this.getType(name) || this.addType({ name, stub: true }, results);
  }


  /////////////////
  //  Statements
  //
  addStatement(statement, results) {
    return this._addItem(statement, "statements", results);
  }

  // Add a Match for a Block, e.g. from an `if` or `forEach` which has nested statements.
  addBlock(block, results) {
    block.matched.forEach(match => {
      this.addStatement(match.compile());   // TODO: not clear if we should add to `results`... ???
    });
  }

  compileStatements(statements = this.statements) {
    if (!statements || statements.length === 0) return "{}";
    // Hack whitespace off of the end of lines as necessary
    statements = statements.map(statement => (""+statement).trimEnd());
    if (statements.length === 1) return `{ ${statements} }`;
    return `{\n  ${this.statements.join("\n  ")}\n}`;
  }


  /////////////////
  // Parser

  // Default to our parent `scope`'s `parser` if one was not explicitly set up.
  get parser() { return this._parser || this.scope?.parser }
  set parser(parser) { this._parser = parser }

  // Syntactic sugar
  get rules() { return this.parser?.rules }

  // Parse using this scope in various flavors.
  parse(text, ruleName) { return this.parser.parse(text, ruleName, this) };
  statement(text) { return this.parser.parse(text, "statement", this) };
  exp(text) { return this.parser.parse(text, "expression", this) };

  // Return a named rule from our parser.
  // Throws if not found.
  getRuleOrDie(ruleName) { return this.parser?.getRuleOrDie(ruleName) }

  // Add a generic rule.
  // `ruleProps` can be properties or an actual rule instance.
  // Consider using (or making) a more-specific setter like those below
  //  to set up `alias`, `precedence`, etc.
  addRule(ruleProps, results) {
    const rule = this.parser.defineRule(ruleProps, results);
    results?.rules?.push(rule);
    return rule;
  }

  // Add a multi-word identifier.
  // Single word identifiers dont' need special treatment. (???)
  addIdentifierRule(props, results) {
    this._addRuleAlias(props, "identifier");
    props.precedence = 10;       // TODO
    return this.addRule(props, results);
  }

  // Add an expression suffix rule, e.g. "<thing> is not? a face card".
  addExpressionSuffixRule(props, results) {
    this._addRuleAlias(props, "expression_suffix");
    props.precedence = 10;       // TODO
    return this.addRule(props, results);
  }

  // Add a statement rule.
  addStatementRule(props, results) {
    this._addRuleAlias(props, "statement");
    return this.addRule(props, results);
  }

  // Add an enumerated type rule.
  // `props.name` is the name of the enumeration, and must be upper-case.
  // `props.enumeration` is the array of enumerated values.
  // Automatically adds all strings in the enumeration as "constants".
  // Returns `{ datatype, statements }` for working with the enumeration.
  addEnumeration(props, results) {
    this.assert(Array.isArray(props.enumeration), "addEnumeration() must be called with an 'enumeration'");
    this.assert(props.name && props.name === upperFirst(props.name),
      "addEnumeration() must be called with an upper-case 'name'");

    const { enumeration, name } = props;
    results.name = name;
    results.canonicalRef = `${this.name}.${name}`;
    results.enumeration = enumeration;

    // Figure out enumeration datatype(s) and add constants for all string values
    results.datatype = uniq(enumeration.map(
      value => {
        if (typeof value === "string") this.addConstant(value);
        return typeof value;
      })
    );
    if (results.datatype.length === 1) results.datatype = results.datatype[0];
    results.enumType = { type: "enum", datatype: results.datatype, enumeration };

    // Add statements to declare the value
    const initializer = JSON5.stringify(enumeration);
    let literals;
    if (this instanceof Type) {
      literals = [ [ this.name, this.instanceName], [name, lowerFirst(name) ] ];
      // Add the full list as a class var.
      this.addClassVariable({...props, initializer, datatype: results.enumType }, results),
      // Add instance var which points to the class var.
      this.addVariable({...props, initializer: results.canonicalRef, datatype: results.enumType }, results)
    }
    else {
      literals = [ this.name, [name, lowerFirst(name) ] ];
      this.addVariable({...props, initializer, datatype: results.enumType }, results)
    }

    // Add multi-word identifier rule to get the enumeration back, e.g. `card suits` or `Card Suits`.
    this.addIdentifierRule({
      name: `${this.name}_${name}`,
      literals,
      datatype: results.enumType,
      toString: () => results.canonicalRef
    }, results);
  }

  // Add an alias to rule `props`.
  // NOTE: modifies the props!
  _addRuleAlias(props, alias) {
    if (props.name === alias) return props;
    if (!props.alias) props.alias = [];
    else if (typeof props.alias === "string") props.alias = [props.alias];
    if (!props.alias.includes(alias)) props.alias.push(alias);
    return props;
  }

  // Console shims for `addDebugMethods`
  get debug() { return this.parser?.debug || function noop(){} }
  get info() { return this.parser?.info || function noop(){} }
  get warn() { return this.parser?.warn || function noop(){} }
  get error() { return this.parser?.error || function noop(){} }
  get assert() { return this.parser?.assert || function noop(){} }
  get group() { return this.parser?.group || function noop(){} }
  get groupEnd() { return this.parser?.groupEnd || function noop(){} }

  /////////////////
  // Utility

  // Add `item` to one of our lists:  variables, methods, types, etc.
  // If you pass a vanilla Object, we'll do use `new Constructor(item)`.
  // You'll receive the item back.
  // NOTE: this modifies the item!  Create a clone before calling this if you care!
  _addItem(item, listProp, results, constructor) {
    if (!item) return;

    // Coerce to an instance of constructor
    if (constructor && item.constructor !== constructor) item = new constructor(item);

    // add to list
    if (!this[listProp]) this[listProp] = [];
    this[listProp].push(item);

    // Have the item point back to this scope (if it's not a string)
    if (typeof item !== "string") item.scope = this;

    // Add to `results.statements` if provided.
    if (results) {
      if (!results.statements) results.statements = [];
      results.statements.push(item);
    }

    return item;
  }

  // Given an array of "items" (e.g. with `_addItem()` above),
  //  return a map of `{ item.name => item }`.
  // Case INsensitive.
  _getItemMap(listProp, caseConversion = snakeCase) {
    return keyBy(this[listProp], item => caseConversion(item.name));
  }

  // Given the name of an `itemMap` (e.g. from `_getItemMap()` above)
  // return the item found under that name.
  // If not found in us our map, ask our `scope` if set.
  // Case INsensitive.
  _getItem(mapProp, key, caseConversion = snakeCase) {
    return this[mapProp][caseConversion(key)];
  }

}

// Module
export class Module extends Scope {}


// Method
// Expected properties:
//  - name
//  - args        // NOTE: we DO NOT expect args to change after Method is created!
//  - returns
export class Method extends Scope {
  constructor({ args, ...props}) {
    super(props);
    if (args) args.forEach(arg => this.addArg(arg));
  }

  @memoize
  get _args() { return this._getItemMap("args") }

  // Add an arg to this scope.
  // NOTE: we do not add args to someone else's `results`.
  @clearMemoized("_args")
  addArg(arg) {
    arg = this._addItem(arg, "args", null, Variable);
    arg.kind = "arg";
    return arg;
  }

  // When looking up local variables in the top-level method scope, include our args.
  // TODO: special case for `it` and `its`!!!
  getLocalVariable(name) {
    return super.getLocalVariable(name) || this._getItem("_args", name);
  }

  toString() {
    const args = this.args?.map(arg => arg.name).join(", ") || "";
    // Return as an inline expression?
    if (this.asExpression) {
      const statements = this.statements || [];
      if (statements.length > 1)
        console.warn(`Method.toString(): 'asExpression' specified but method has ${statements.length} statements.`, statements);
      const expression = ""+(statements[0]).trim();
      return `(${args}) => ${expression}`;
    }

    const statements = this.compileStatements();
    // If we're attached to a Type,
    if (this.scope instanceof Type) {
      // Add class props directly
      if (this.kind === "static")
        return `${this.scope.name}.${this.name} = function(${args}) ${statements}`;

      if (this.kind === "getter")
        return `defineProp(${this.scope.name}.prototype, '${this.name}', { get() ${statements} })`;

      if (this.kind === "setter")
        return `defineProp(${this.scope.name}.prototype, '${this.name}', { set(${args}) ${statements} })`;

      return `defineProp(${this.scope.name}.prototype, '${this.name}', { value(${args}) ${statements} })`;
    }


    // Return as a normal function
    const name = this.name ? ` ${this.name}`: "";
    return `function${name}(${args}) ${statements}`;
  }
}


// Type, which extends block.  Specifically:
//  - `name` is the name of the type, and should be InitialCase.
//  - `superClass` is name of superclass, if provided, and should be InitialCase.
//  - `stub` is `true` if the type was created as a stub.
//  - `methods` (from block) are instance methods, including `constructor` if provided.
//  - `variables` (from block) are instance variables
//  - `classMethods` and `classVariables` are static to the class.
//  - `statements` are random bits of logic to initialize the type.
//
// NOTE: `name` should be upperFirst and singular
export class Type extends Scope {
  constructor(props) {
    // If you just pass a string we'll assume it's the type name.
    if (typeof props === "string") props = { name: props };
    super(props);
    // Make sure we have a `name`
    if (!this.name) throw new TypeError("Types must be initialized with a 'name'");
    // Make sure type `name` and `superType` are in `Type_Case`
    this.name = typeCase(this.name);
    if (this.superType) this.superType = typeCase(this.superType);
  }

  // Syntactic sugar for the type name.
  // e.g. if the type name is `Card`, the instanceName would be `card`.
  get instanceName() {
    return lowerFirst(this.name);
  }

  // Return the generic name for an instance of this type.
  // e.g. if the type name is `Card`, the instanceName would be `card`.
  get instanceName() {
    return lowerFirst(this.name);
  }


  // Compile the type.
  // NOTE: this currently ignores methods/properties, we'll want to fix that...
  toString() {
    if (this.superType) return `export class ${this.name} extends ${this.superType} {}`;
    return `export class ${this.name} {}`;
  }

  @memoize
  get _classVariables() { return this._getItemMap("classVariables") }

  // Add a classVariable to this scope.
  @clearMemoized("_classVariables")
  addClassVariable(variable, results) {
    variable.kind = "static";
    return this._addItem(variable, "classVariables", results, Variable)
  }

  @memoize
  get _classMethods() { return this._getItemMap("classMethods") }

  // Add a classMethod to this scope.
  @clearMemoized("_classMethods")
  addClassMethod(method, results) {
    method.kind = "static";
    return this._addItem(method, "classMethods", results, Method)
  }
}



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
export class Variable {
  constructor(props) {
    // Convert string to 'name'
    if (typeof props === "string") props = { name: props };
    if (!props.name)
      throw new TypeError("Variables must be created with a 'name'");
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

    if (this.kind === "arg") {
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




// Constant definition
//
// Expected properties:
//  - module
//  - scope
//  - name
//  - value (defaults to `'name'`)
//  - datatype (defaults to `string`)
export class Constant {
  constructor(props) {
    // Use string as constant 'name'
    if (typeof props === "string") props = { name: props };
    if (!props.name)
      throw new TypeError("Constants must be created with a 'name'");
    // Assign all properties in the order provided.
    Object.assign(this, props);
    if (this.value === undefined) this.value = `'${this.name}'`;1
  }

  toString() {
    return this.value;
  }
}


// Add classes on Scope for ease of use in other files.
Scope.Constant = Constant;
Scope.Method = Method;
Scope.Module = Module;
Scope.Type = Type;
Scope.Variable = Variable;
