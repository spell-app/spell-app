//
//  Intermediate types -- simplified AST
//
import keyBy from "lodash/keyBy";
import flatten from "lodash/flatten";

import {
  Parser,
  ParseError,

  memoize,
  clearMemoized
} from "./all.js";


export class Scope {
  constructor(props) {
    // You can initialize with just a `Parser` instance if desired.
    if (props instanceof Parser) props = { parser: props };

    // Assign all properties in the order they were passed
    Object.assign(this, props);
  }

  /////////////////
  // Vars
  //

  // Local variables as a map.
  @memoize
  get _vars() { return keyBy(this.vars, "name") }

  // Add a variable to this scope.
  @clearMemoized("_vars")
  addVar(variable) { return this.addItem(variable, "vars", Variable) }

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
  addMethod(method) { return this.addItem(method, "methods", Method) }

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
  addType(type) { return this.addItem(type, "types", Type) }

  // Return definition of `type` anywhere in our parent chain.
  getType(name) {
    return this._types[name] || this.scope?.getType(name);
  }

  // Return the named type, creating and adding one if necessary.
  getOrAddType(name) {
    let type = this.getType(name);
    if (!type) {
      type = new Type(name);
      this.addType(type);
    }
    return type;
  }


  /////////////////
  //  Statements
  //
  addStatement(...statements) {
    this.statements = [...this.statements, ...flatten(statements)];
  }

  compileStatements() {
    let { statements } = this;
    if (!statements || statements.length === 0) return "{}";
    if (statements.length === 1) return `{ ${statements} }`;
    return `{\n  ${this.statements.join("\n  ")}\n}`;
  }


  /////////////////
  // Parser

  // Return a named rule from our parser.
  // Throws if not found.
  getRuleOrDie(ruleName) {
    let rule = this.parser?.rules[ruleName];
    if (!rule) throw new ParseError(`getRuleOrDie('${ruleName}'): rule not found`);
    return rule;
  }

  addRule(ruleProps) {
    return this.parser.defineRule(ruleProps);
  }

  addStatementRule(props) {
    this.parser.debug("TODO: scope.addStatementRule()", props);
    const { name, syntax, compile } = props;
    try {
      const rule = this.parser.defineRule({ name, alias: "statement", compile, syntax });
      this.parser.debug("defined rule: ", rule);
    }
    catch(e) { console.error(e); }
  }

  // Console shims for `addDebugMethods`
  get debug() { return this.parser?.debug || Function.prototype }
  get info() { return this.parser?.info || Function.prototype }
  get warn() { return this.parser?.warn || Function.prototype }
  get error() { return this.parser?.error || Function.prototype }
  get group() { return this.parser?.group || Function.prototype }
  get groupEnd() { return this.parser?.groupEnd || Function.prototype }

  // Parse using this scope in various flavors.
  parse = (...args) => { return this.parser.parse(tokens, undefined, this) };
  statement = (tokens) => { return this.parser.parse(tokens, "statement", this) };
  exp = (tokens) => { return this.parser.parse(tokens, "expression", this) };

  /////////////////
  // Utility

  // Add `item` to one of our lists:  vars, methods, types, etc.
  // If you pass a vanilla Object, we'll do use `new Constructor(item)`.
  // You'll receive the item back.
  // NOTE: this modifies the item!  Create a clone before calling this if you care!
  addItem(item, listProp, constructor, customizer) {
    // Coerce to an instance of constructor
    if (constructor && item.constructor === Object) item = new constructor(item);

    // add to list and array
    if (!this[listProp]) this[listProp] = [];
    this[listProp].push(item);

    // set item scope.
    item.scope = this;

    // call customizer if provided
    if (customizer) customizer(item);

    return item;
  }
}

// Module
export class Module extends Scope {}


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
    this.assert(props.name, "Variables must be created with a 'name'");
    // Assign all properties in the order provided.
    Object.assign(this, props);
  }
}


// Method
// Expected properties:
//  - name
//  - args
//  - returns
export class Method extends Scope {
  constructor(props) {
    super(props);
    // If we have args, convert to a map
    if (this.args)
      this._args = keyBy(this.args, "name");  // convert to map
  }

  // When looking up local vars in the top-level method scope, include our args.
  // TODO: special case for `it` and `its`!!!
  getLocalVar(name) {
    return super.getLocalVar(name) || this._args?.[name];
  }

  compileArgs() {
    if (!this.args) return "";
    return this.args.map(arg => arg.name).join(", ");
  }

  compile() {
    const statements = this.compileStatements();
    const args = this.compileArgs();

    // If we're attached to a Type,
    if (this.scope instanceof Type) {
      // Add class props directly
      if (this.kind === "static") {
        return `${this.scope.name}.${this.name} = function(${args}) ${statements}`;
      }
      if (this.kind === "getter") {
        // Add instance props to the prototype using `defineProperty()`
        return `defineProp(${this.scope.name}.prototype, '${this.name}', { get() ${statements} })`;
      }
      return `defineProp(${this.scope.name}.prototype, '${this.name}', { value: function(${args}) ${statements} })`;
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

    // Assign properties in the order specified.
    super(props);
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
  addClassVar(variable) {
    return this.addItem(variable, "classVars", Variable, (variable) => variable.kind = "static")
  }

  @memoize
  get _classMethods() { return keyBy(this.classMethods, "name") }

  // Add a classMethod to this scope.
  @clearMemoized("_classMethods")
  addClassMethod(method) {
    return this.addItem(method, "classMethods", Method, (method) => method.kind = "static")
  }
}


// Add classes on Scope for ease of use in other files
Scope.Module = Module;
Scope.Variable = Variable;
Scope.Method = Method;
Scope.Type = Type;
