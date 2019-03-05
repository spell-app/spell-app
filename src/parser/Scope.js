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

    const { parser, module, parentScope, vars, methods, statements } = props;
    this.parser = parser;
    this.module = module;
    this.parentScope = parentScope;

    this.vars = [];
    this._vars = {};
    if (vars) this.addVar(...vars);

    this.methods = [];
    this._methods = {};
    if (methods) this.addMethod(...methods);

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
    return this.getLocalVar(name) || this.parentScope?.getVar(name);
  }

  // Add a var to the block
  addVar(...variables) {
    variables.forEach(variable => variable.parentScope = this);
    this.vars = [...this.vars, ...variables];
    this._vars = {...this._vars, ...keyBy(variables, "name") };
  }

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
    return this.getLocalMethod(name) || this.parentScope?.getMethod(name);
  }

  // Add a method to the block
  addMethod(...methods) {
    methods.forEach(method => method.parentScope = this);
    this.methods = [...this.methods, ...methods];
    this._methods = {...this._methods, ...keyBy(methods, "name") };
  }

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
}

// Module
export class Module extends Scope {}


// Variable definition, including:
//      - global variable
//      - block-local variable
//      - class property
//      - instance property
export class Variable {
  constructor({ module, parentScope, name, datatype, initializer }) {
    this.module = module;
    this.parentScope = parentScope;
    this.name = name;
    this.datatype = datatype;
    this.initializer = initializer;
  }
}


// Method
export class Method extends Scope {
  constructor({ name, args, returns, ...superProps }) {
    super(superProps);
    this.name = name;
    this.args = args || [];
    this._args = keyBy(args, "name");  // convert to map
    this.returns = returns;  // string or array ???
  }

  // When looking up local vars in the top-level method scope, include our args.
  // TODO: special case for `it` and `its`!!!
  getLocalVar(name) {
    return super.getLocalVar(name) || this._args[name];
  }
}


// Type, which extends block.  Specifically:
//  - `supers` is array of superclass(es).
//  - `methods` (from block) are instance methods, including `constructor` if provided.
//  - `vars` (from block) are instance vars
//  - `classMethods` and `classVars` are static to the class.
//  - `statements` are random bits of logic to initialize the type.
export class Type extends Scope {
  constructor({ supers, classMethods, classVars, ...superProps }) {
    this.super(superProps);

    this.supers = supers;

    this.classVars = [];
    this._classVars = {}
    if (classVars) this.addClassVars(...classVars);

    this.classMethods = [];
    this._classMethods = {}
    if (classMethods) this.addClassMethods(...classMethods);
  }

  addClassVar(variable) {
    variables.forEach(variable => variable.parentScope = this);
    this.vars = [...this.classVars, ...variables];
    this._vars = {...this._classVars, ...keyBy(variables, "name") };
  }

  addClassMethod(...methods) {
    methods.forEach(method => method.parentScope = this);
    this.classMethods = [...this.classMethods, ...methods];
    this._classMethods = {...this._classMethods, ...keyBy(methods, "name") };
  }
}
