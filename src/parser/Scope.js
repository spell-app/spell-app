//
//  Intermediate types -- simplified AST
//
import keyBy from "lodash/keyBy";

import {
  Parser,
  ParseError
} from "./all.js";


export class Scope {
  constructor(props) {
    // You can initialize with just a `Parser` instance if desired.
    if (props instanceof Parser) props = { parser: props };

    const { name, parser, module, scope, vars, methods, types, statements } = props;
    if (name) this.name = name;
    if (parser) this.parser = parser;
    if (module) this.module = module;
    if (scope) this.scope = scope;

    this.vars = [];
    this._vars = {};
    if (vars) this.addVar(vars);

    this.methods = [];
    this._methods = {};
    if (methods) this.addMethod(methods);

    this.types = [];
    this._types = {};
    if (types) this.addType(types);

    this.statements = statements || [];
  }

  /////////////////
  // Vars
  //
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

  // Add a variable or array of variables to this scope.
  addVar(variable) { return this.addItem(variable, "vars", "_vars") }

  /////////////////
  // Methods
  //
  // Return definition of `method` in this block.
  getLocalMethod(name) {
    return this._methods[name];
  }

  // Return true if this block already has a local method defined
  hasLocalMethod(name) {
    return !!this.getLocalMethod(name);
  }

  // Return definition of `method` anywhere in our parent chain.
  getMethod(name) {
    return this.getLocalMethod(name) || this.scope?.getMethod(name);
  }

  // Add a method or array of methods to this scope.
  addMethod(method) { return this.addItem(method, "methods", "_methods") }


  /////////////////
  // Types
  //
  // Return definition of `type` in this block.
  getLocalType(name) {
    return this._types[name];
  }

  // Return true if this block already has a local type defined
  hasLocalType(name) {
    return !!this.getLocalType(name);
  }

  // Return definition of `type` anywhere in our parent chain.
  getType(name) {
    return this.getLocalType(name) || this.scope?.getType(name);
  }

  // Add a type or array of types to this scope.
  addType(type) { return this.addItem(type, "types", "_types") }


  /////////////////
  //  Statements
  //
  addStatement(...statements) {
    this.statements = [...this.statements, ...statements];
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

  addIdentifier(props) {
    this.parser.debug("TODO: scope.addIdentifier()", props);
    const { key, value } = props;
  }

  addStatement(props) {
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


  /////////////////
  // Utility

  // Add `item` to one of our lists:  vars, methods, types, etc.
  // You can pass a single item or an array.
  // If you pass a single item, you'll get a single item back.
  // If you pass an array you'll get an array back.
  addItem(item, listProp, mapProp) {
    if (Array.isArray(item))
      return item.map(item => this.addItem(item, listProps, mapProp));

    this[listProp].push(item);
    if (item.name) this[mapProp][name] = item;
    item.scope = this;

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
export class Variable {
  constructor({ module, scope, name, datatype, initializer }) {
    this.assert(name, "Variables must be created with a 'name'");
    if (module) this.module = module;
    if (scope) this.scope = scope;
    this.name = name;
    if (datatype) this.datatype = datatype;
    if (initializer) this.initializer = initializer;
  }
}


// Method
export class Method extends Scope {
  constructor({ name, args, returns, ...superProps }) {
    super(superProps);
    if (name) this.name = name;
    this.args = args || [];
    this._args = keyBy(args, "name");  // convert to map
    if (returns) this.returns = returns;  // string or array ???
  }

  // When looking up local vars in the top-level method scope, include our args.
  // TODO: special case for `it` and `its`!!!
  getLocalVar(name) {
    return super.getLocalVar(name) || this._args[name];
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
    const { superType, classMethods, classVars, ...superProps } = props;
    super(superProps);

    if (superType) this.superType = superType;

    this.classVars = [];
    this._classVars = {}
    if (classVars) this.addClassVars(...classVars);

    this.classMethods = [];
    this._classMethods = {}
    if (classMethods) this.addClassMethods(...classMethods);
  }

  // Compile the type.
  // NOTE: this currently ignores methods/properties, we'll want to fix that...
  compile() {
    if (this.superType) return `export class ${this.name} extends ${this.superType} {}`;
    return `export class ${this.name} {}`;
  }

  // Add a class variable or array of class variables to this scope.
  addClassVar(variable) { return this.addItem(variable, "classVars", "_classVars") }

  // Add a class method or array of class methods to this scope.
  addClassMethod(method) { return this.addItem(method, "classMethods", "_classMethods") }
}


// Add classes on Scope for ease of use in other files
Scope.Module = Module;
Scope.Variable = Variable;
Scope.Method = Method;
Scope.Type = Type;
