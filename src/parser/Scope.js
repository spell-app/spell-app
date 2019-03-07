//
//  Intermediate types -- simplified AST
//
import keyBy from "lodash/keyBy";
import flatten from "lodash/flatten";
import lowerFirst from "lodash/lowerFirst"
import upperFirst from "lodash/upperFirst"
import uniq from "lodash/uniq"
import JSON5 from "JSON5";


import {
  Parser,
  ParseError,
  Rule,

  memoize,
  clearMemoized
} from "./all.js";

// NOTE: this is the only export from this file.
// Consumers of this file should use `scope.addMethod(...)` or `new `Scope.Method(...)`
export class Scope {
  constructor(props) {
    // You can initialize with just a `Parser` instance if desired.
    if (props instanceof Parser) props = { parser: props };

    // Assign all properties in the order they were passed
    Object.assign(this, props);
  }

  compile() {
    // TODO
    return "Don't know how to compile a base Scope";
  }

  toString() {
    return this.compile();
  }

  /////////////////
  // Vars
  //

  // Local variables as a map.
  @memoize
  get _vars() { return keyBy(this.vars, "name") }

  // Add a variable to this scope.
  @clearMemoized("_vars")
  addVar(variable, results) { return this._addItem(variable, "vars", results, Variable) }

  // Return definition of `var` in this block.
  getLocalVar(name) {
    return this._vars[name];
  }

  // Return true if this block already has a local var defined
  hasLocalVar(name) {
    return !!this.getLocalVar(name);
  }

  // Return definition of `var` anywhere in our parent chain.
  getVar(name) {
    return this.getLocalVar(name) || this.scope?.getVar(name);
  }


  /////////////////
  // Methods
  //

  // Local variables as a map.
  @memoize
  get _methods() { return keyBy(this.methods, "name") }

  // Add a method to this scope.
  @clearMemoized("_methods")
  addMethod(method, results) { return this._addItem(method, "methods", results, Method) }

  // Return definition of `method` anywhere in our parent chain.
  getMethod(name) {
    return this._methods[name] || this.scope?.getMethod(name);
  }


  /////////////////
  // Types
  //

  @memoize
  get _types() { return keyBy(this.types, "name") }

  // Add a type to this scope.
  @clearMemoized("_types")
  addType(type, results) { return this._addItem(type, "types", results, Type) }

  // Return definition of `type` anywhere in our parent chain.
  getType(name) {
    return this._types[name] || this.scope?.getType(name);
  }

  // Return the named type, creating and adding one if necessary.
  getOrAddType(name, results) {
    return this.getType(name) || this.addType({ name }, results);
  }


  /////////////////
  //  Statements
  //
  addStatement(statement, results) {
    return this._addItem(statement, "statements", results);
  }

  // Add a Match for a Block (e.g. from parsing a nested block in a BlockStatement)
  addBlock(block, results) {
    block.matched.forEach(match => {
      this.addStatement(match.compile());   // TODO: not clear if we should add to `results`... ???
    });
  }

  compileStatements(statements = this.statements) {
    if (!statements || statements.length === 0) return "{}";
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
        if (typeof value === "string")
          this.addConstantRule(value, results);
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
      this.addClassVar({...props, initializer, datatype: results.enumType }, results),
      // Add instance var which points to the class var.
      this.addVar({...props, initializer: results.canonicalRef, datatype: results.enumType }, results)
    }
    else {
      literals = [ this.name, [name, lowerFirst(name) ] ];
      this.addVar({...props, initializer, datatype: results.enumType }, results)
    }

    // Add multi-word identifier rule to get the enumeration back, e.g. `card suits` or `Card Suits`.
    this.addIdentifierRule({
      name: `${this.name}_${name}`,
      literals,
      datatype: results.enumType,
      compile: () => results.canonicalRef
    }, results);
  }

  // Add a single-word constant identifier, passing just the constant name.
  // We assume that the constant value is the quoted name.
  addConstantRule(name, results) {
    return this.addRule({
      name: "constant",
      datatype: "string",
      literal: name,
      precedence: 1,    // must be above "identifier"
      compile: () => `'${name}'`
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

  // Add `item` to one of our lists:  vars, methods, types, etc.
  // If you pass a vanilla Object, we'll do use `new Constructor(item)`.
  // You'll receive the item back.
  // NOTE: this modifies the item!  Create a clone before calling this if you care!
  _addItem(item, listProp, results, constructor) {
    if (!item) return;

    // Coerce to an instance of constructor
    if (constructor && item.constructor === Object) item = new constructor(item);

    // add to list
    if (!this[listProp]) this[listProp] = [];
    this[listProp].push(item);

    // Have the item point back to this scope (if it's not a string)
    if (typeof item !== "string") item.scope = this;

    // Add to results if provided.
    if (results && results.statements) results.statements.push(item);

    return item;
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
  constructor({ args, statement, ...props}) {
    super(props);
    if (args) args.forEach(arg => this.addArg(arg));
    if (statement) this.addStatement(statement);
  }

  @memoize
  get _args() { return keyBy(this.args, "name") }

  // Add an arg to this scope.
  // NOTE: we do not add args to someone else's `results`.
  @clearMemoized("_args")
  addArg(arg) { return this._addItem(arg, "args", Variable) }

  // When looking up local vars in the top-level method scope, include our args.
  // TODO: special case for `it` and `its`!!!
  getLocalVar(name) {
    return super.getLocalVar(name) || this._args[name];
  }

  compile() {
    const statements = this.compileStatements();
    const args = this.args?.map(arg => arg.name).join(", ") || "";

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
//  - `methods` (from block) are instance methods, including `constructor` if provided.
//  - `vars` (from block) are instance vars
//  - `classMethods` and `classVars` are static to the class.
//  - `statements` are random bits of logic to initialize the type.
export class Type extends Scope {
  constructor(props) {
    // If you just pass a string we'll assume it's the type name.
    if (typeof props === "string") props = { name: props };
    super(props);

    this.assert(props.name && props.name === upperFirst(props.name),
      `Types must be initialized with an upper-case name, e.g. 'Card'.  Received '${props.name}'`);
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
  compile() {
    if (this.superType) return `export class ${this.name} extends ${this.superType} {}`;
    return `export class ${this.name} {}`;
  }

  @memoize
  get _classVars() { return keyBy(this.classVars, "name") }

  // Add a classVar to this scope.
  @clearMemoized("_classVars")
  addClassVar(variable, results) {
    variable.kind = "static";
    return this._addItem(variable, "classVars", results, Variable)
  }

  @memoize
  get _classMethods() { return keyBy(this.classMethods, "name") }

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
    if (!props.name)
      throw new TypeError("Variables must be created with a 'name'");
    // Assign all properties in the order provided.
    Object.assign(this, props);
  }

  compile() {
    // If we're attached to a Type,
    if (this.scope instanceof Type) {
      // Add class props directly
      if (this.kind === "static")
        return `${this.scope.name}.${this.name} = ${this.initializer}`;
      // Add instance props with defineProp
      return `defineProp(${this.scope.name}.prototype, '${this.name}', { value: ${this.initializer} })`;
    }

    // Return as a normal var declaration
    // TODO: note if var has been used before, etc.
    return `var ${name} = ${initializer}`
  }

  toString() {
    return this.compile();
  }
}


// Add classes on Scope for ease of use in other files.
Scope.Module = Module;
Scope.Variable = Variable;
Scope.Method = Method;
Scope.Type = Type;
