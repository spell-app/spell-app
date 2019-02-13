//
//  # `SST`:  Spell Syntax Tree
//  Abstract/Concrete Syntax Tree nodes, attempting to unify:
//
//  | Project     | URL                                   |
//  |-------------|---------------------------------------
//  | `estree`    | https://github.com/estree/estree
//  | `cstree`    | https://github.com/cst/cst
//  | `unist`     | https://github.com/syntax-tree/unist
//
//
import assert from "assert";

const OPTIONAL = "OPTIONAL";
function assertType(node, name, type, optional) {
  const value = node[name];
  if (value == null) {
    if (optional) return;
    throw new TypeError(`${node.constructor.name}.${name} must be a ${type}`);
  }
  if (typeof type === "string") {
    if (typeof value !== type) throw new TypeError(`${node.constructor.name}.${name} must be a ${type}`);
  }
  else if (type === Array) {
    if (!Array.isArray(value)) throw new TypeError(`${node.constructor.name}.${name} must be an array`);
  }
  else if (!(value instanceof type)) {
    throw new TypeError(`${node.constructor.name}.${name} must be instance of ${type.name}`);
  }
}

export class Enum {
  constructor(value) {
    if (!(value in this.constructor.whitelist)) throw new TypeError(`${this.constructor.name} value '${value}' not understood`);
    this.value = value;
  }
}


//
//  ## Base Node Types
//

// Base type for all SST nodes.
//
//  | Property    | Type              | Description |
//  |-------------|-------------------|-------------!
//  | `type`      | `string`          | Node type
//  | `loc?`      | `SourceLocation`  | Source location
export class Node {
  constructor(props) {
    Object.assign(this, props);
    assertType(this, "type", "string");
    assertType(this, "loc", SourceLocation, OPTIONAL);
  }
}


// Source location for a node.
//
//  | Property    | Type        | Description |
//  |-------------|-------------|-------------!
//  | `source?`   | `string`    | Source file location (e.g. URL)
//  | `start`     | `Position`  | Start position
//  | `end`       | `Position`  | End position (non-inclusive)
export class SourceLocation {
  constructor(props) {
    Object.assign(this, props);
    assertType(this, "source", "string", OPTIONAL);
    assertType(this, "start", Position);
    assertType(this, "end", Position);
  }
}


// File position for a node.
// TODO: **`cst` *column* is 0-based and `unist` is 1-based!!!**
//
//  | Property    | Type        | Description |
//  |-------------|-------------|-------------|
//  | `line`      | `integer`   | 1-based
//  | `column`    | `integer`   | 0-based (TODO: unist is 1-based)
//  | `offset?`   | `integer`   | (CST-only, 0-based char offset in file)
export class Position {
  constructor(props) {
    Object.assign(this, props);
    assertType(this, "line", "number");
    assertType(this, "column", "number");
    assertType(this, "offset", "number", OPTIONAL);
  }
}


//
//  ## Specific Javascript node types
//


// Abstract `Expression` node type.
export class Expression extends Node {}


// `Identifier` node type.
// Note that an identifier may be an expression or a destructuring pattern.
//  | Property    | Type            | Description |
//  |-------------|-----------------|-------------|
//  | `type`      | `"Identifier"`
//  | `name`      | `string`        | Identifier name, must be legal in source language.
export class Identifier extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "name", "string");
  }
}
Object.defineProperty(Identifier.prototype, "type", { value: "Identifier" });


// Literal node type.
//
//  | Property    | Type            | Description |
//  |-------------|-----------------|-------------|
//  | `type`      | `"Literal"`
//  | `value`     | `null`, `string`, `boolean`, `number`, `RegExp` | Value of this literal.
export class Literal extends Expression {
  constructor() {
    super(...arguments);
    assert(
      this.value == null ||
      typeof this.value === "string" ||
      typeof this.value === "boolean" ||
      typeof this.value === "number" ||
      this.value instanceof RegExp
    , `literal.value must be one of: null, string, number, boolean or RegExp. Received ${this.value}`
  }
}
Object.defineProperty(Literal.prototype, "type", { value: "Literal" });


// Regular Expression Literal node type.
// `node.regex` allows regular expressions to be expressed in environments
//  without full regular expression support.
//
//  | Property        | Type              | Description |
//  |-----------------|-------------------|-------------|
//  | `value?`        | `RegExp`          | Regular expression pattern
//  | `regex`         | `object`          | (for incompatible environments: RegExp description)
//  | `regex.pattern` | `string`          | (for incompatible environments: RegExp pattern)
//  | `regex.flags`   | `string`          | (for incompatible environments: RegExp flags)
export class RegExpLiteral extends Literal {
  constructor() {
    super(...arguments);
    if (this.value == null) {
      assert(this.value instanceof RegExp, "RegExpLiteral.value must be a regular expression");
    }
    else if (this.regex != null) {
      assert(this.regex instanceof Object, "RegExpLiteral.regex must be an object");
      assert.equal(typeof this.regex.pattern, "string", "RegExpLiteral.regex.pattern must be a string");
      assert.equal(typeof this.regex.flags, "string", "RegExpLiteral.regex.flags must be a string");
    }
    else {
      assert(true, "RegExpLiteral must specify a 'value' or 'regex'");
    }
  }
}


// A complete program source tree.
//
//  | Property    | Type                        | Description |
//  |-------------|-----------------------------|-------------|
//  | `type`      | `"Program"`
//  | `body`      | `[ Directive | Statement ]` | Program contents
export class Program extends Node {
  constructor() {
    super(...arguments);
    assertType(this, "body", Array);
  }
}
Object.defineProperty(Program.prototype, "type", { value: "Program" });


// A function declaration or expression.
//
//  | Property    | Type           | Description |
//  |-------------|----------------|-------------|
//  | `id?`       | `Identifier`   | Function name
//  | `params`    | `[ Pattern ]`  | Function parameters
//  | `body`      | `FunctionBody` | Nodes for function body
export class _Function extends Node {
  constructor() {
    super(...arguments);
    assertType(this, "id", Identifier, OPTIONAL);
    assertType(this, "params", Array);
    assertType(this, "body", FunctionBody);
  }
}

// Any statement.
export class Statement extends Node {}


// An expression statement, i.e., a statement consisting of a single expression.
//
//  | Property     | Type                    | Description |
//  |--------------|-------------------------|-------------|
//  | `type`       | `"ExpressionStatement"`
//  | `expression` | `Expression`
export class ExpressionStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "expression", Expression);
  }
}
Object.defineProperty(ExpressionStatement.prototype, "type", { value: "ExpressionStatement" });


// A directive from the directive prologue of a script or function.
// The directive property is the raw string source of the directive without quotes.
//  | Property     | Type             | Description |
//  |--------------|------------------|-------------|
//  | `type`       | `"Directive"`
//  | `expression` | `Literal`
//  | `directive`  | `string`
export class Directive extends Node {
  constructor() {
    super(...arguments);
    assertType(this, "expression", Literal);
    assertType(this, "directive", "string");
  }
}
// FIXME: estree says type is "ExpressionStatement" ???   Seems like a bug.
Object.defineProperty(Directive.prototype, "type", { value: "Directive" });


// A block statement, i.e., a sequence of statements surrounded by braces.
//
//  | Property    | Type           | Description |
//  |-------------|----------------|-------------|
//  | `type`      | `"BlockStatement"`
//  | `body`      | `[ Statement ]`
export class BlockStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "body", Array);
  }
}
Object.defineProperty(Directive.prototype, "type", { value: "BlockStatement" });


// The body of a function, which is a block statement that may begin with directives.
//
//  | Property    | Type                        | Description |
//  |-------------|-----------------------------|-------------|
//  | `body`      | `[ Directive | Statement ]` | Function body
export class FunctionBody extends BlockStatement {
  constructor() {
    super(...arguments);
    assertType(this, "body", Array);
  }
}


// An empty statement, i.e., a solitary semicolon.
//
//  | Property     | Type               | Description |
//  |--------------|--------------------|-------------|
//  | `type`       | `"EmptyStatement"`
export class EmptyStatement extends Statement {}
Object.defineProperty(EmptyStatement.prototype, "type", { value: "EmptyStatement" });


// A `debugger` statement.
//
//  | Property     | Type                  | Description |
//  |--------------|-----------------------|-------------|
//  | `type`       | `"DebuggerStatement"`
export class DebuggerStatement extends Statement {}
Object.defineProperty(DebuggerStatement.prototype, "type", { value: "DebuggerStatement" });


// A `with` statement.
//
//  | Property    | Type                        | Description |
//  |-------------|-----------------------------|-------------|
//  | `type`      | `"WithStatement"`
//  | `object`    | `Expression`
//  | `body`      | `Statement`
export class WithStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "object", Expression);
    assertType(this, "body", Statement);
  }
}
Object.defineProperty(WithStatement.prototype, "type", { value: "WithStatement" });


//
//  ## Control flow
//

// A `return` statement.
//
//  | Property    | Type                        | Description |
//  |-------------|-----------------------------|-------------|
//  | `type`      | `"ReturnStatement"`
//  | `argument?` | `Expression`
export class ReturnStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "argument", Expression, OPTIONAL);
  }
}
Object.defineProperty(ReturnStatement.prototype, "type", { value: "ReturnStatement" });


// A labeled statement, i.e., a statement prefixed by a break/continue label.
//
//  | Property    | Type                        | Description |
//  |-------------|-----------------------------|-------------|
//  | `type`      | `"LabeledStatement"`
//  | `label`     | `Identifier`
//  | `body`      | `Statement`
export class LabeledStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "label", Identifier);
    assertType(this, "body", Statement);
  }
}
Object.defineProperty(LabeledStatement.prototype, "type", { value: "LabeledStatement" });


// A `break` statement/
//
//  | Property    | Type                        | Description |
//  |-------------|-----------------------------|-------------|
//  | `type`      | `"BreakStatement"`
//  | `label?`    | `Identifier`
export class BreakStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "label", Identifier, OPTIONAL);
  }
}
Object.defineProperty(BreakStatement.prototype, "type", { value: "BreakStatement" });


// A `continue` statement/
//
//  | Property    | Type                        | Description |
//  |-------------|-----------------------------|-------------|
//  | `type`      | `"BreakStatement"`
//  | `label?`    | `Identifier`
export class ContinueStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "label", Identifier, OPTIONAL);
  }
}
Object.defineProperty(ContinueStatement.prototype, "type", { value: "ContinueStatement" });


//
//  ## Choice
//

// A `if` statement
//
//  | Property       | Type                        | Description |
//  |----------------|-----------------------------|-------------|
//  | `type`         | `"IfStatement"`
//  | `test`         | `Expression`
//  | `consequent`   | `Statement`
//  | `alternate?`   | `Statement`
export class IfStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "test", Expression);
    assertType(this, "consequent", Statement);
    assertType(this, "alternate", Statement, OPTIONAL);
  }
}
Object.defineProperty(IfStatement.prototype, "type", { value: "IfStatement" });


// A `switch` statement
//
//  | Property       | Type                        | Description |
//  |----------------|-----------------------------|-------------|
//  | `type`         | `"SwitchStatement"`
//  | `discriminant` | `Expression`
//  | `cases`        | `[ SwitchCase ]`
export class SwitchStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "discriminant", Expression);
    assertType(this, "cases", Array);
  }
}
Object.defineProperty(SwitchStatement.prototype, "type", { value: "SwitchStatement" });


// A `case` (if `test` is an `Expression`) or `default` (if `test === null`) clause
// in the body of a switch statement.
//
//  | Property       | Type                        | Description |
//  |----------------|-----------------------------|-------------|
//  | `type`         | `"SwitchCase"`
//  | `test?`        | `Expression`
//  | `consequent`   | `[ Statement ]`
export class SwitchCase extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "test", Expression, OPTIONAL);
    assertType(this, "cases", Array);
  }
}
Object.defineProperty(SwitchCase.prototype, "type", { value: "SwitchCase" });


// A `try` statement. If `handler` is `null` then `finalizer` must be a `BlockStatement`.
//
//  | Property       | Type                        | Description |
//  |----------------|-----------------------------|-------------|
//  | `type`         | `"TryStatement"`
//  | `block`        | `BlockStatement`
//  | `handler?`     | `CatchClause`
//  | `finalizer?`   | `BlockStatement`
export class TryStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "block", BlockStatement);
    assertType(this, "handler", CatchClause, OPTIONAL);
    assertType(this, "finalizer", BlockStatement, OPTIONAL);
  }
}
Object.defineProperty(TryStatement.prototype, "type", { value: "TryStatement" });


// A `catch` clause following a `try` block.
//
//  | Property       | Type                        | Description |
//  |----------------|-----------------------------|-------------|
//  | `type`         | `"CatchClause"`
//  | `param`        | `Pattern`
//  | `body`         | `BlockStatement`
export class CatchClause extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "param", Pattern);
    assertType(this, "body", BlockStatement);
  }
}
Object.defineProperty(CatchClause.prototype, "type", { value: "CatchClause" });



//
//  ## Loops
//

// A `while` statement
//
//  | Property       | Type                        | Description |
//  |----------------|-----------------------------|-------------|
//  | `type`         | `"WhileStatement"`
//  | `test`         | `Expression`
//  | `body`         | `Statement`
export class WhileStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "test", Expression);
    assertType(this, "body", Statement);
  }
}
Object.defineProperty(WhileStatement.prototype, "type", { value: "WhileStatement" });


// A `do/while` statement
//
//  | Property       | Type                        | Description |
//  |----------------|-----------------------------|-------------|
//  | `type`         | `"DoWhileStatement"`
//  | `body`         | `Statement`
//  | `test`         | `Expression`
export class DoWhileStatement extends Statement {
  constructor() {
    super(...arguments);
    assertType(this, "test", Expression);
    assertType(this, "body", Statement);
  }
}
Object.defineProperty(DoWhileStatement.prototype, "type", { value: "DoWhileStatement" });


// A `for` statement
//
//  | Property       | Type                        | Description |
//  |----------------|-----------------------------|-------------|
//  | `type`         | `"ForStatement"`
//  | `init?`        | `VariableDeclaration | Expression`
//  | `test?`        | `Expression`
//  | `update?`      | `Expression`
//  | `body`         | `Statement`
export class ForStatement extends Statement {
  constructor() {
    super(...arguments);
    assert(this.init == null || this.init instanceof VariableDeclaration || this.init instanceof Expression,
      "ForStatement.init must be a VariableDeclaration or an Expression");
    assertType(this, "test", Statement, OPTIONAL);
    assertType(this, "update", Expression, OPTIONAL);
    assertType(this, "body", Statement);
  }
}
Object.defineProperty(ForStatement.prototype, "type", { value: "ForStatement" });


// A `for/in` statement
//
//  | Property       | Type                        | Description |
//  |----------------|-----------------------------|-------------|
//  | `type`         | `"ForInStatement"`
//  | `left`         | `VariableDeclaration | Pattern`
//  | `right`        | `Expression`
//  | `body`         | `Statement`
export class ForInStatement extends Statement {
  constructor() {
    super(...arguments);
    assert(this.left instanceof VariableDeclaration || this.left instanceof Pattern,
      "ForInStatement.init must be a VariableDeclaration or an Expression");
    assertType(this, "right", Expression);
    assertType(this, "body", Statement);
  }
}
Object.defineProperty(ForInStatement.prototype, "type", { value: "ForInStatement" });



//
//  ## Declarations
//

// Any declaration node. Note that declarations are considered statements;
// this is because declarations can appear in any statement context.
export class Declaration extends Statement {}


// A function declaration. Note that unlike in the parent interface `Function`, the `id` cannot be `null`.
//
//  | Property    | Type                     | Description |
//  |-------------|--------------------------|-------------|
//  | `type`      | `"FunctionDeclaration"`
//  | `id`        | `Identifier`             | Function name
//FIXME: extends Declaration: some sort of HOC thing???
export class FunctionDeclaration extends _Function {
  constructor() {
    super(...arguments);
    assertType(this, "id", Identifier);
  }
}
Object.defineProperty(FunctionDeclaration.prototype, "type", { value: "FunctionDeclaration" });


// A variable declaration.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"VariableDeclaration"`
//  | `declarations`  | `[ VariableDeclarator ]`
//  | `kind`          | `"var"`
export class VariableDeclaration extends Declaration {
  constructor() {
    super(...arguments);
    assertType(this, "declarations", Array);
  }
}
Object.defineProperty(VariableDeclaration.prototype, "type", { value: "VariableDeclaration" });
Object.defineProperty(VariableDeclaration.prototype, "kind", { value: "var" });


// A variable declarator.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"VariableDeclarator"`
//  | `id`            | `Pattern`
//  | `init?`         | `Expression`
export class VariableDeclarator extends Declaration {
  constructor() {
    super(...arguments);
    assertType(this, "id", Pattern);
    assertType(this, "init", Expression, OPTIONAL);
  }
}
Object.defineProperty(VariableDeclarator.prototype, "type", { value: "VariableDeclarator" });



//
//  ## Declarations
//

// Any expression node. Since the left-hand side of an assignment may be any expression
// in general, an expression can also be a pattern.
export class Expression extends Node {}


// A `this` expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"ThisExpression"`
export class ThisExpression extends Expression {}
Object.defineProperty(ThisExpression.prototype, "type", { value: "ThisExpression" });


// An array expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"ArrayExpression"`
//  | `elements`      | `[ Expression | null ]`
export class ArrayExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "elements", Array);
  }
}
Object.defineProperty(ArrayExpression.prototype, "type", { value: "ArrayExpression" });


// An object expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"ObjectExpression"`
//  | `properties`    | `[ Property ]`
export class ObjectExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "properties", Array);
  }
}
Object.defineProperty(ObjectExpression.prototype, "type", { value: "ObjectExpression" });


// A literal property in an object expression can have either a string or number as its value.
// Ordinary property initializers have a kind value "init";
// getters and setters have the kind values "get" and "set", respectively.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"Property"`
//  | `key`           | `Literal | Identifier`
//  | `value`         | `Expression`
//  | `kind`          | `"init" | "get" | "set"`
export class Property extends Node {
  constructor() {
    super(...arguments);
    assert(this.key instanceof Literal || this.key instanceof Identifier, "Property.key must be a Literal or an Identifier");
    assertType(this, "value", Expression);
    assert(["init","get","set"].includes(this.kind), "Property.kind must be 'init', 'get' or 'set'");
  }
}
Object.defineProperty(Property.prototype, "type", { value: "Property" });


// A `this` expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"ThisExpression"`
export class ThisExpression extends Expression {}
Object.defineProperty(ThisExpression.prototype, "type", { value: "ThisExpression" });


// A `function` expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"FunctionExpression"`
//FIXME: inherits from Expression
export class FunctionExpression extends Expression {}
Object.defineProperty(FunctionExpression.prototype, "type", { value: "FunctionExpression" });


//
//  ## Unary operations
//

// A unary operator expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"UnaryExpression"`
//  | `operator`      | `UnaryOperator`
//  | `prefix`        | `boolean`
//  | `argument`      | `Expression`
export class UnaryExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "operator", UnaryOperator);
    assertType(this, "prefix", "boolean");
    assertType(this, "argument", Expression);
  }
}
Object.defineProperty(UnaryExpression.prototype, "type", { value: "UnaryExpression" });


// A unary operator token.
export class UnaryOperator extends Enum {
  static whitelist = {
    "-": true,
    "+": true,
    "!": true,
    "~": true,
    "typeof": true,
    "void": true,
    "delete": true
  }
}


// An update (increment or decrement) operator expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"UpdateExpression"`
//  | `operator`      | `UpdateOperator`
//  | `argument`      | `Expression`
//  | `prefix`        | `boolean`
export class UpdateExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "operator", UpdateOperator);
    assertType(this, "prefix", "boolean");
    assertType(this, "argument", Expression);
  }
}
Object.defineProperty(UpdateExpression.prototype, "type", { value: "UpdateExpression" });


// A unary operator token.
export class UpdateOperator extends Enum {
  static whitelist = {
    "++": true,
    "--": true
  }
}


//
//  ## Binary operations
//

// A binary operator expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"BinaryExpression"`
//  | `operator`      | `BinaryOperator`
//  | `left`          | `Expression`
//  | `right`         | `Expression`
export class BinaryExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "operator", BinaryOperator);
    assertType(this, "left", Expression);
    assertType(this, "right", Expression);
  }
}
Object.defineProperty(BinaryExpression.prototype, "type", { value: "BinaryExpression" });


// A binary operator token.
export class BinaryOperator extends Enum {
  static whitelist = {
    "==": true,
    "!=": true,
    "===": true,
    "!==" : true,
    "<": true,
    "<=": true,
    ">": true,
    ">=" : true,
    "<<": true,
    ">>": true,
    ">>>" : true,
    "+": true,
    "-": true,
    "*": true,
    "/": true,
    "%" : true,
    "|": true,
    "^": true,
    "&": true,
    "in" : true,
    "instanceof": true
  }
}


// An assignment operator expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"AssignmentExpression"`
//  | `operator`      | `BinaryOperator`
//  | `left`          | `Expression`
//  | `right`         | `Expression`
export class AssignmentExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "operator", AssignmentOperator);
    assertType(this, "left", Expression);   // FIXME: also Pattern
    assertType(this, "right", Expression);
  }
}
Object.defineProperty(AssignmentExpression.prototype, "type", { value: "AssignmentExpression" });

// An assignment operator token.
export class AssignmentOperator extends Enum {
  static whitelist = {
    "=": true,
    "+=": true,
    "-=": true,
    "*=": true,
    "/=": true,
    "%=" : true,
    "<<=": true,
    ">>=": true,
    ">>>=" : true,
    "|=": true,
    "^=": true,
    "&=": true
  }
}


// A logical operator expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"LogicalExpression"`
//  | `operator`      | `BinaryOperator`
//  | `left`          | `Expression`
//  | `right`         | `Expression`
export class LogicalExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "operator", LogicalOperator);
    assertType(this, "left", Expression);
    assertType(this, "right", Expression);
  }
}
Object.defineProperty(LogicalExpression.prototype, "type", { value: "LogicalExpression" });

// An assignment operator token.
export class LogicalOperator extends Enum {
  static whitelist = {
    "||": true,
    "&&": true
  }
}


// A member expression.
// If `computed` is `true`, the node corresponds to a computed (`a[b]`) member expression
// and `property` is an `Expression`.
//
// If `computed` is `false`, the node corresponds to a static (`a.b`) member expression
// and property is an `Identifier`.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"MemberExpression"`
//  | `object`        | `Expression`
//  | `property`      | `Expression`
//  | `computed`      | `boolean`
export class MemberExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "operator", MemberOperator);
    assertType(this, "left", Expression);
    assertType(this, "right", Expression);
  }
}
Object.defineProperty(MemberExpression.prototype, "type", { value: "MemberExpression" });


// A conditional expression, i.e., a ternary `?`/`:` expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"ConditionalExpression"`
//  | `test`          | `Expression`
//  | `alternate`     | `Expression`
//  | `consequent`    | `Expression`
export class ConditionalExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "test", Expression);
    assertType(this, "alternate", Expression);
    assertType(this, "consequent", Expression);
  }
}
Object.defineProperty(ConditionalExpression.prototype, "type", { value: "ConditionalExpression" });


// A function or method call expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"CallExpression"`
//  | `callee`        | `Expression`
//  | `arguments`     | `[ Expression ]`
export class CallExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "callee", Expression);
    assertType(this, "arguments", Array);
  }
}
Object.defineProperty(CallExpression.prototype, "type", { value: "CallExpression" });


// A `new` expression.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"NewExpression"`
//  | `callee`        | `Expression`
//  | `arguments`     | `[ Expression ]`
export class NewExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "callee", Expression);
    assertType(this, "arguments", Array);
  }
}
Object.defineProperty(NewExpression.prototype, "type", { value: "NewExpression" });


// A sequence expression, i.e., a comma-separated sequence of expressions.
//
//  | Property        | Type                    | Description |
//  |-----------------|-------------------------|-------------|
//  | `type`          | `"SequenceExpression"`
//  | `expressions`     | `[ Expression ]`
export class SequenceExpression extends Expression {
  constructor() {
    super(...arguments);
    assertType(this, "callee", Expression);
    assertType(this, "arguments", Array);
  }
}
Object.defineProperty(SequenceExpression.prototype, "type", { value: "SequenceExpression" });
