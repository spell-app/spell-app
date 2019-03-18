//
//  Intermediate types -- simplified AST
//
import assert from "assert";
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

  clearMemoized,
  indexedList,
  memoize,
  proto,
  typeCase,
  snakeCase,
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
  // Local and scope Variables
  //
  @indexedList({
    keyProp: "name",
    parentProp: "scope",
    normalizeKey: snakeCase,
    transformer(item) {
      if (!(item instanceof Variable)) item = new Variable(item);
      item.scope = this;
      return item;
    }
  })
  variables


  /////////////////
  // Local and scope Constants
  //
  @indexedList({
    keyProp: "name",
    parentProp: "scope",
    normalizeKey: snakeCase,
    transformer(item) {
      if (!(item instanceof Constant)) item = new Constant(item);
      item.scope = this;
      return item;
    }
  })
  constants


  /////////////////
  // Local and scope Methods
  //
  @indexedList({
    keyProp: "name",
    parentProp: "scope",
    normalizeKey: snakeCase,
    transformer(item) {
      if (!(item instanceof Method)) item = new Method(item);
      item.scope = this;
      return item;
    }
  })
  methods


  /////////////////
  // Local and scope Types
  //
  @indexedList({
    keyProp: "name",
    parentProp: "scope",
    normalizeKey: typeCase,
    transformer(item) {
      if (!(item instanceof Type)) item = new Type(item);
      item.scope = this;
      return item;
    }
  })
  types

  // Return the named type.  If not found, create a stub type.
  getOrStubType(name) {
    const type = this.types(name);
    if (type) return type;
    return this.types.add({ name, stub: true });
  }



  /////////////////
  //  Statements
  //
  addStatement(statement, results) {
    if (!this.statements) this.statements = [];
    this.statements.push(statement);
    return statement;
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
    return this.addRule(props);
  }

  // Add an expression suffix rule, e.g. "<thing> is not? a face card".
  addExpressionSuffixRule(props, results) {
    this._addRuleAlias(props, "expression_suffix");
    props.precedence = 10;       // TODO
    return this.addRule(props);
  }

  // Add a statement rule.
  addStatementRule(props, results) {
    this._addRuleAlias(props, "statement");
    return this.addRule(props);
  }

  // Add an enumerated type rule.
  // `props.name` is the name of the enumeration, and must be upper-case.
  // `props.enumeration` is the array of enumerated values.
  // Automatically adds all strings in the enumeration as "constants".
  // Returns `{ datatype, statements }` for working with the enumeration.
  addEnumeration(props, results) {
    props.scope = this;
    assert(Array.isArray(props.enumeration), "scope.addEnumeration() must be called with an 'enumeration'");
    const { enumeration, name } = props;
    results.name = name;
    results.canonicalRef = `${this.name}.${name}`;
    results.enumeration = enumeration;

    // Figure out enumeration datatype(s) and add constants for all string values
    results.datatype = uniq(enumeration.map(
      value => {
        if (typeof value === "string") this.constants.add(value);
        return typeof value;
      })
    );
    if (results.datatype.length === 1) results.datatype = results.datatype[0];
    results.enumType = { type: "enum", datatype: results.datatype, enumeration };

    // Add statements to declare the value
    const initializer = JSON5.stringify(enumeration);
    let literals, statement;
    if (this instanceof Type) {
      literals = [ [ this.name, this.instanceName], [name, lowerFirst(name) ] ];
      // Add the full list as a class var.
      statement = this.classVariables.add({...props, initializer, datatype: results.enumType });
      results.statements.push(statement);
      // Add instance var which points to the class var.
      statement = this.variables.add({...props, initializer: results.canonicalRef, datatype: results.enumType });
      results.statements.push(statement);
    }
    else {
      literals = [ this.name, [name, lowerFirst(name) ] ];
      statement = this.variables.add({...props, initializer, datatype: results.enumType })
      results.statements.push(statement);
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
}


// Module:  Scope for parsing a "file".
export class Module extends Scope {}


// Method
// Expected properties:
//  - name
//  - args        // NOTE: we DO NOT expect args to change after Method is created!
//  - returns
export class Method extends Scope {
  constructor({ args, ...props}) {
    super(props);
    // Add `args` to our variables list
    if (args) args.forEach(arg => this.addArg(arg));
  }

  addArg(arg) {
    if (!(arg instanceof Argument)) arg = new Argument(arg);
    return this.variables.add(arg);
  }

  toString() {
    // TODO: needs to include arg initializers below...
    const args = this.variables().filter(variable => variable.kind === "arg")
      .map(arg => arg.name).join(", ") || "";

    // Return as an inline expression?
    if (this.asExpression) {
      const statements = this.statements || [];
      if (statements.length > 1)
        Spell.logger.warn(`Method.toString(): 'asExpression' specified but method has ${statements.length} statements.`, statements);
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

  // Compile the type.
  // NOTE: this currently ignores methods/properties, we'll want to fix that...
  toString() {
    if (this.superType) return `export class ${this.name} extends ${this.superType} {}`;
    return `export class ${this.name} {}`;
  }


  /////////////////
  // Class Variables and Methods (statics)
  //
  @indexedList({
    keyProp: "name",
    normalizeKey: snakeCase,
    transformer(item) {
      if (!(item instanceof Variable)) item = new Variable(item);
      item.scope = this;
      item.kind = "static";
      return item;
    }
  })
  classVariables

  @indexedList({
    keyProp: "name",
    normalizeKey: snakeCase,
    transformer(item) {
      if (!(item instanceof Method)) item = new Method(item);
      item.scope = this;
      item.kind = "static";
      return item;
    }
  })
  classMethods

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

// Subclass of variable specifically used for method ards.
export class Argument extends Variable {
  @proto kind = "arg";
}


// Add classes on Scope for ease of use in other files.
Scope.Constant = Constant;
Scope.Method = Method;
Scope.Module = Module;
Scope.Type = Type;
Scope.Variable = Variable;
