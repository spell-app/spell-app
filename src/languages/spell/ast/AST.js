/** AST classes.  These do not necessarily correspond do anyone else's AST. */
import _get from "lodash/get"

import { proto, readonly, Assertable, OPTIONAL } from "~/util"
import { Match } from "~/parser"

// TODO: define this in `constants` or some such?
const LEGAL_PROPERTY_IDENTIFIER = /^[a-zA-Z][\w\$]*$/

/** Enclose `value` in parens, unless it is already a propertly parenthesized string. */
function encloseInParens(value) {
  // TODO: this is not a sufficient check!!!
  if (typeof value === "string" && value.startsWith("(") && value.endsWith(")")) return value
  return `(${value})`
}

function convertStatementsToBlock(match, statements) {
  if (!statements) return new StatementBlock(match)
  if (statements instanceof StatementBlock) return statements
  return new StatementBlock(match, { statements: [statements] })
}

/** Abstract root of all AST node types.
 *  - `type` is
 */
export class ASTNode extends Assertable {
  /** On construction, pass:
   *  - `match` passed to `getAST()` method,
   *  - `props` as arbitrary properties to be assigned to the instance.
   *  Use `this.assert()` or `this.assertType()` to validate input as much as you can.
   *
   *  TODO: `datatype` as a function which turns into a getter?
   */
  constructor(match, props) {
    super()
    if (props) Object.assign(this, props)
    this.match = match
    this.assertType("match", Match)
  }

  /** Return our node type, which is the name of our constructor function. */
  get nodeType() {
    return this.constructor.displayName
  }

  /** Scope of the top-level match. */
  get parentScope() {
    return this.match.scope
  }

  /** Compile this AST into Javascript.  You MUST override in a subclass. */
  toJS() {
    throw new TypeError(`AST ${this.type} must implement toJS()`)
  }
}

/** Blank line */
export class BlankLine extends ASTNode {
  toJS() {
    return "\n"
  }
}

/** Base of all Expression types.  Useful for `instanceof`.
 *  - Try to figure out `datatype` if you can, either as a value or as a getter.
 */
export class Expression extends ASTNode {}

/** QuotedExpression -- use to wrap resulting AST in quotes.
 *  TODO: is this a good idea?  Don't use too much!
 */
export class QuotedExpression extends Expression {
  @proto @readonly datatype = "string"
  constructor(...args) {
    super(...args)
    this.assertType("expression", Expression)
  }
  toJS() {
    return `'${this.expression.toJS()}'`
  }
}

/** Generic Literal type.  Useful for `instanceof`.
 *  - `value` is the actual JS value, which by default we assume we can just output.
 *  - `raw` (optional) is the raw input value.
 */
export class Literal extends Expression {
  toJS() {
    return this.value
  }
}

/** NumericLiteral type. */
export class NumericLiteral extends Literal {
  @proto @readonly datatype = "number"
  constructor(...args) {
    super(...args)
    this.assertType("value", "number")
  }
}

/** StringLiteral type. */
export class StringLiteral extends Literal {
  @proto @readonly datatype = "string"
  constructor(...args) {
    super(...args)
    this.assertType("value", "string")
  }
}

/** BooleanLiteral type. */
export class BooleanLiteral extends Literal {
  @proto @readonly datatype = "boolean"
  constructor(...args) {
    super(...args)
    this.assertType("value", "boolean")
  }
}

/** RegExpLiteral type. */
export class RegExpLiteral extends Literal {
  @proto @readonly datatype = RegExp
  constructor(...args) {
    super(...args)
    this.assertType("value", RegExp)
  }
}

/** NullLiteral type. TODO: ???? */
export class NullLiteral extends Literal {
  // TODO: ???
  @proto @readonly datatype = "null"
  constructor(...args) {
    super(...args)
    this.assertType("value", undefined)
  }
  toJS() {
    return "null"
  }
}

/** UndefinedLiteral type. TODO: ???? */
export class UndefinedLiteral extends Literal {
  @proto @readonly datatype = "undefined"
  constructor(...args) {
    super(...args)
    this.assertType("value", undefined)
  }
  toJS() {
    return "undefined"
  }
}

/** KeywordLiteral type.
 *  - `value` is raw input converted into a JS-legal keyword.
 *  - `raw` (optional) is the raw input string
 */
export class KeywordLiteral extends Literal {
  @proto @readonly datatype = "string" // TODO???
  constructor(...args) {
    super(...args)
    this.assertType("value", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
}

/** ArrayLiteral
 *  - `items` (optional) is an array of Expressions
 */
export class ArrayLiteral extends Literal {
  constructor(...args) {
    super(...args)
    this.assertArrayType("items", Expression, OPTIONAL)
  }
  toJS() {
    if (!this.items) return "[]"
    return `[${this.items.map(item => item.toJS()).join(", ")}]`
  }
}

/** Enumeration
 *  - `enumeration` is an array of Expressions
 *  - `values` is an strings or numbers
 */
export class Enumeration extends Literal {
  constructor(...args) {
    super(...args)
    this.assertArrayType("enumeration", Expression)
    this.assertArrayType("values", ["string", "number"])
  }
  toJS() {
    if (!this.enumeration) return "[]"
    return `[${this.enumeration.map(item => item.toJS()).join(", ")}]`
  }
}

/** Abstract comment type. Useful for `instanceof`. */
export class Comment extends ASTNode {}

/** ParseError type.
 *  - `message` is text of the error
 */
export class ParseError extends Comment {
  constructor(...args) {
    super(...args)
    this.assertType("message", "string")
  }
  toJS() {
    return `/* PARSE ERROR: ${this.message} */`
  }
}

/** LineComment type.
 *  - `value` is text of the comment (may be empty string).
 *  - `commentSymbol` is the comment symbol used
 *  - `initialWhitespace` is whitespace between the commentSymbol and the `value`
 */
export class LineComment extends Comment {
  constructor(...args) {
    super(...args)
    this.assertType("value", "string")
    this.assertType("commentSymbol", "string", OPTIONAL)
    this.assertType("initialWhitespace", "string", OPTIONAL)
  }
  toJS() {
    const { initialWhitespace = " ", value } = this
    let { commentSymbol = "" } = this
    if (commentSymbol !== "//") commentSymbol = `//${commentSymbol}`
    return `${commentSymbol}${initialWhitespace}${value}`
  }
}

/** BlockComment type.
 *  - `value` is the entire contents of the original comment, including initial space and newlines.
 */
export class BlockComment extends Comment {
  constructor(...args) {
    super(...args)
    this.assertType("value", "string")
  }
  toJS() {
    return `/* ${this.value} */`
  }
}

/** ParserAnnotation type, used for parser annotations injected into the output.
 *  - `value` is text of the annotation.
 */
export class ParserAnnotation extends BlockComment {
  toJS() {
    return `/* SPELL: ${this.value} */`
  }
}

/** Parenthesized expression.
 *  - `expression` is the contained AST Expression. */
export class ParenthesizedExpression extends Expression {
  constructor(...args) {
    super(...args)
    this.assertType("expression", Expression)
  }
  get datatype() {
    return this.expression.datatype
  }
  toJS() {
    // don't double up on parens
    if (this.expression instanceof ParenthesizedExpression) return this.expression.toJS()
    return `(${this.expression.toJS()})`
  }
}

/** Not expression.
 *  - `expression` is the contained AST Expression.
 *  - `datatype` is ALWAYS boolean. */
export class NotExpression extends Expression {
  @proto @readonly datatype = "boolean"
  constructor(...args) {
    super(...args)
    this.assertType("expression", Expression)
  }
  toJS() {
    return `!${this.expression.toJS()}`
  }
}

/** InfixExpression:  <lhs> <operator> <rhs> */
export class InfixExpression extends Expression {
  constructor(...args) {
    super(...args)
    this.assertType("lhs", Expression)
    this.assertType("operator", "string")
    this.assertType("rhs", Expression)
  }
  toJS() {
    return `${this.lhs.toJS()} ${this.operator} ${this.rhs.toJS()}`
  }
}

/** Given an array of Expressions, join them all together with the same `operator`. */
export function MultiInfixExpression(match, { expressions, operator }) {
  // TODO: convert to class?
  if (expressions.length < 2) return expressions[0]
  const remaining = [...expressions]
  let rhs = remaining.pop()
  while (remaining.length) {
    const lhs = remaining.pop()
    rhs = new InfixExpression(match, { lhs, operator, rhs })
  }
  return rhs
}

/** BaseMethodInvocation:  abstract class for method invocations.  DO NOT CREATE!
 */
export class AbstractMethodInvocation extends Expression {
  toJS() {
    throw new TypeError("Override toJS() in your subclass!")
  }
}

/** MethodInvocation:  generic named method invocation.
 *  - `method` is method name.
 *  - `arguments` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 * NOTE: this does not ensure that the named method is actually defined in scope!!!!
 */
export class MethodInvocation extends AbstractMethodInvocation {
  constructor(...args) {
    super(...args)
    this.assertType("method", "string")
    this.assertArrayType("arguments", Expression, OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  toJS() {
    const args = this.arguments?.map(arg => arg.toJS()).join(", ") || ""
    return `${this.method}(${args})`
  }
}

/** CoreMethodInvocation:  calls a `spellCore` `method`.  Used for output languge independence.
 *  - `method` is spellcore method name.
 *  - `arguments` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 */
export class CoreMethodInvocation extends AbstractMethodInvocation {
  constructor(...args) {
    super(...args)
    this.assertType("method", "string")
    this.assertArrayType("arguments", Expression, OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  toJS() {
    const args = this.arguments?.map(arg => arg.toJS()).join(", ") || ""
    return `spellCore.${this.method}(${args})`
  }
}

/** Call a `method` on some `thing` with `arguments`.
 *  - `thing` is what we'll call the method on.
 *  - `method` is the method name.
 *  - `arguments` (optional) is a possibly empty list of Expressions.
 *  - Try to set `datatype` as string or getter if you can.
 */
export class ScopedMethodInvocation extends AbstractMethodInvocation {
  constructor(...args) {
    super(...args)
    this.assertType("thing", Expression)
    this.assertType("method", "string")
    this.assertArrayType("arguments", Expression, OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  toJS() {
    const args = this.arguments?.map(arg => arg.toJS()).join(", ") || ""
    return `${this.thing.toJS()}.${this.method}(${args})`
  }
}

/** AwaitMethodInvocation:  wrap another method invocation to `await` it.
 *  - `method` is MethodInvocation to call.
 */
export class AwaitMethodInvocation extends AbstractMethodInvocation {
  constructor(...args) {
    super(...args)
    this.assertType("method", AbstractMethodInvocation)
    // TODO: Mark the parentScope as asynchronous
    this.parentScope.async = true
  }
  toJS() {
    return `await ${this.method.toJS()}`
  }
}

/** TypeExpression -- pointer to a Type object/scope.
 *  - `name` is the normalized type name: Typecase, singular and dashes to underscores.
 *  - `raw` (optional) is the original input string, unnormalized.
 *  - `plurality` (optional) is "singular", "plural" or `undefined`
 *  TODO: ^^^ ???
 */
export class TypeExpression extends Expression {
  @proto @readonly datatype = "Type"
  constructor(...args) {
    super(...args)
    this.assertType("name", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
  toJS() {
    return this.name
  }

  /** Pointer to the known Scope for this type, if available. ??? */
  get scope() {
    return this.match.type
  }
}

/** VariableExpression -- pointer to a Variable object.
 *  - `name` is the normalized type name: dashes and spaces converted to underscores.
 *  CURRENTLY UNUSED
 *  - `raw` (optional) is the original input string, unnormalized.
 *  - `variable` (optional) is pointer to scope Variable, if there is one.
 *  - `plurality` (optional) is "singular", "plural" or `undefined`  // TODO: derive?
 */
export class VariableExpression extends Expression {
  constructor(...args) {
    super(...args)
    if (!this.name) this.name = this.match.value
    this.assertType("name", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
  // TODO: datatype according to Variable ?
  toJS() {
    return this.name
  }
}

/** ConstantExpression -- pointer to a Constant object.
 *  - `name` is the constant name (not normalized ???)
 *  - `output` is the constant string to output, including quotes.
 *  - `constant` is pointer to scope Constant, if there is one.
 */
export class ConstantExpression extends Expression {
  @proto @readonly datatype = "string"
  constructor(...args) {
    super(...args)
    this.assertType("name", "string")
    this.assertType("output", "string")
  }
  toJS() {
    return this.output
  }
}

/** ThisLiteral type. */
export class ThisLiteral extends Literal {
  toJS() {
    return "this"
  }
}

/** PropertyLiteral -- identifier which refers to some property of an object.
 *  - `value` is the normalized property name.  It will be inferred from the `match`.
 *  - `raw` (optional) is the input property name
 */
export class PropertyLiteral extends Literal {
  constructor(...args) {
    super(...args)
    if (!this.value) this.value = this.match.value
    this.assertType("value", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
}

/** PropertyExpression -- named property of some object.
 *  - `object` is the thing to get the property from, as an Expression.
 *  - `property` is the normalized property name.
 *  TODO: datatype???
 */
export class PropertyExpression extends Expression {
  constructor(...args) {
    super(...args)
    this.assertType("object", Expression)
    this.assertType("property", PropertyLiteral)
  }
  toJS() {
    const prop = this.property.toJS()
    if (LEGAL_PROPERTY_IDENTIFIER.test(prop)) return `${this.object.toJS()}.${prop}`
    return `${this.object.toJS()}['${prop}']`
  }
}

/** ObjectLiteralProperty type
 *  - `property` is the normalized property name.
 *  - `value` (optional) is the property value.
 */
export class ObjectLiteralProperty extends ASTNode {
  constructor(...args) {
    super(...args)
    this.assertType("property", PropertyLiteral)
    this.assertType("value", Expression, OPTIONAL)
  }
  toJS() {
    // If no value, assume it's available as a local variable.
    if (!this.value) return this.property.toJS()
    return `${this.property.toJS()}: ${this.value.toJS()}`
  }
}

/** ObjectLiteral -- bag of properties.
 *  - `properties` is an array of PropertyValues
 */
export class ObjectLiteral extends Expression {
  @proto @readonly datatype = "object"
  constructor(...args) {
    super(...args)
    this.assertArrayType("properties", ObjectLiteralProperty, OPTIONAL)
  }
  // TODO: datatype???
  toJS() {
    if (!this.properties) return "{}"
    // TODO: single prop on one line, newlines + indent for multiple props
    return `{ ${this.properties.map(prop => prop.toJS()).join(", ")} }`
  }
}

/** Statement abstract type. */
export class Statement extends ASTNode {}

/** StatementGroup -- set of random statements which does NOT get wrapped with curly braces!
 *  - `statements` is a list of Statements.
 */
export class StatementGroup extends Statement {
  constructor(...args) {
    super(...args)
    this.assertArrayType("statements", [Statement, Expression, Comment, BlankLine], OPTIONAL)
  }
  toJS() {
    const { statements } = this
    if (!statements) return ""
    return `${statements.map(statement => statement.toJS()).join("\n")}`
  }
}

/** StatementBlock -- set of statements which outputs with curly braces around.
 *  - `statements` is a list of Statements.
 */
export class StatementBlock extends Statement {
  constructor(...args) {
    super(...args)
    this.assertArrayType("statements", [Statement, Expression, Comment, BlankLine], OPTIONAL)
  }
  toJS() {
    const { statements } = this
    if (!statements || !statements.length) return "{}"
    const curlyDelimiter = statements.length === 1 ? " " : "\n"
    return `{${curlyDelimiter}${statements.map(statement => statement.toJS()).join("\n")}${curlyDelimiter}}`
  }
}

/** AssignmentStatement -- assign value to thing.
 *  - `thing` is an Expression.
 *  - `value` is an Expression
 *  - `isNewVariable` (optional) if true and `thing` is an Expression, we'll declare the var.
 */
export class AssignmentStatement extends Statement {
  constructor(...args) {
    super(...args)
    this.assertType("thing", Expression)
    this.assertType("value", Expression)
    this.assertType("isNewVariable", "boolean", OPTIONAL)
  }
  toJS() {
    const { thing, value, isNewVariable } = this
    const declarator = isNewVariable ? "let " : ""
    return `${declarator}${thing.toJS()} = ${value.toJS()}`
  }
}

/** ReturnStatement -- return a value.
 *  - `value` (optional) is an Expression to be returned.
 */
export class ReturnStatement extends Statement {
  constructor(...args) {
    super(...args)
    this.assertType("value", Expression, OPTIONAL)
  }
  toJS() {
    if (!this.value) return "return"
    return `return ${this.value.toJS()}`
  }
}

/** ClassDeclaration
 * - `type` is a TypeExpression
 * - `superType` (optional) is a TypeExpression
 * - `instanceType` (optional) is a TypeExpression for lists of a certain type.
 */
export class ClassDeclaration extends Statement {
  constructor(...args) {
    super(...args)
    this.assertType("type", TypeExpression)
    this.assertType("superType", TypeExpression, OPTIONAL)
    this.assertType("instanceType", TypeExpression, OPTIONAL)
  }
  toJS() {
    const { type, superType, instanceType } = this
    const superDeclarator = superType ? `extends ${superType.name} ` : ""
    const output = [`export class ${type.name} ${superDeclarator}{}`]
    output.push(`spellCore.addExport("${type.name}", ${type.name})`)
    if (instanceType) {
      output.push(`spellCore.define(${type.name}.prototype, "instanceType", { value: ${instanceType.name} })`)
      output.push(`${type.name}.instanceType = ${instanceType.name}`)
    }
    return output.join("\n")
  }
}

/** NewInstanceExpression
 * - `type` is a TypeExpression
 * - `props` (optional) is an ObjectLiteral
 */
export class NewInstanceExpression extends Expression {
  constructor(...args) {
    super(...args)
    this.assertType("type", TypeExpression)
    this.assertType("props", ObjectLiteral, OPTIONAL)
  }
  toJS() {
    const { type, props } = this
    return `new ${type.name}(${props ? props.toJS() : ""})`
  }
}

/** ListExpression
 * - `items` (optional) is a list of Expressions
 */
export class ListExpression extends Expression {
  constructor(...args) {
    super(...args)
    this.assertArrayType("items", Expression, OPTIONAL)
  }
  toJS() {
    const { items } = this
    if (!items) return "[]"
    return `[${items.map(item => item.toJS()).join(", ")}]`
  }
}

/** InlineMethodExpression
 * TODO: rename?
 * - `args` (optional) is a list of VariableExpressions
 * - `statements` (optional) is a Statement or Expression
 *    TODO: review this name, maybe "body" is better?
 * - `expression` (optional) is a Expression
 * TODO: create a scope for variables inside???
 */
export class InlineMethodExpression extends Expression {
  constructor(...args) {
    super(...args)
    this.assertArrayType("args", VariableExpression, OPTIONAL)
    this.assertType("statements", [Statement, Expression], OPTIONAL)
    this.assertType("expression", Expression, OPTIONAL)
  }
  toJS() {
    const args = this.args ? `(${this.args.map(arg => arg.toJS()).join(", ")})` : "()"
    if (this.expression) return `${args} => ${this.expression.toJS()}`
    if (this.statements) return `${args} => ${this.statements.toJS()}`
    return `${args} => {}`
  }
}

/** PrototypeExpression:  type.prototype
 *  * - `type` is a TypeExpression
 */
export class PrototypeExpression extends Expression {
  constructor(...args) {
    super(...args)
    this.assertType("type", TypeExpression)
  }
  toJS() {
    const { type } = this
    return `${type.toJS()}.prototype`
  }
}

/** ValueDefinition: assigns named value to prototype
 * - `thing` is an Expression
 * - `property` is PropertyLiteral
 * - `value` is an Expression
 */
export class ValueDefinition extends Statement {
  constructor(...args) {
    super(...args)
    this.assertType("thing", Expression)
    this.assertType("property", PropertyLiteral)
    this.assertType("value", Expression)
  }
  toJS() {
    const { thing, property, value } = this
    return `spellCore.define(${thing.toJS()}, '${property.toJS()}', { value: ${value.toJS()} })`
  }
}

/** SetterDefinition: creates a setter for type instances
 * - `thing` is an Expression
 * - `property` is PropertyLiteral
 * - `statements` is a Statement or Expression
 */
export class SetterDefinition extends Statement {
  constructor(...args) {
    super(...args)
    this.assertType("thing", Expression)
    this.assertType("property", PropertyLiteral)
    this.assertType("statements", [Statement, Expression], OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  toJS() {
    const { thing, property, statements } = this
    return (
      `spellCore.define(${thing.toJS()}, '${property.toJS()}', ` +
      `{ set(${property.toJS()}) { ${statements?.toJS() || ""} } })`
    )
  }
}

/** GetterDefinition: creates a setter for type instances
 * - `thing` is an Expression
 * - `property` is the PropertyLiteral
 * - `statements` is a Statement or Expression
 */
export class GetterDefinition extends Statement {
  constructor(...args) {
    super(...args)
    this.assertType("thing", Expression)
    this.assertType("property", PropertyLiteral)
    this.assertType("statements", [Statement, Expression], OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  toJS() {
    const { thing, property, statements } = this
    return `spellCore.define(${thing.toJS()}, '${property.toJS()}', { get() { ${statements?.toJS() || ""} } })`
  }
}

/** GetSetDefinition: creates a getter/setter combo for type instances
 * - `thing` is an Expression
 * - `property` is the PropertyLiteral
 * - `get` is a Statement or Expression for the getter
 * - `set` is a Statement or Expression for the setter
 */
export class GetSetDefinition extends Statement {
  constructor(...args) {
    super(...args)
    this.assertType("thing", Expression)
    this.assertType("property", PropertyLiteral)
    this.assertType("get", [Statement, Expression], OPTIONAL)
    this.assertType("set", [Statement, Expression], OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  toJS() {
    const { thing, property, get, set } = this
    return (
      `spellCore.define(${thing.toJS()}, '${property.toJS()}', {` +
      `\n\tget() { ${get?.toJS() || ""} },` +
      `\n\tset(${property.toJS()}) { ${set?.toJS() || ""} }` +
      `\n})`
    )
  }
}

/** MethodDefinition: creates a method for type instances
 * - `thing` is an Expression (e.g. a ProtypeExpression)
 * - `method` is the method name
 * - `args` ia array of VariableExpressions
 * - `statements` is a Statement or Expression
 */
export class MethodDefinition extends Statement {
  constructor(...args) {
    super(...args)
    this.assertType("thing", Expression)
    this.assertType("method", "string")
    this.assertArrayType("args", VariableExpression, OPTIONAL)
    this.assertType("statements", [Statement, Expression], OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  toJS() {
    const { thing, method, args = [], statements } = this
    return (
      `spellCore.define(${thing.toJS()}, '${method}', {` +
      ` value(${args.map(arg => arg.toJS())}) ${statements?.toJS() || ""} })`
    )
  }
}

/** FunctionDefinition: creates an method for type instances
 * - `method` is the method name
 * - `args` ia array of VariableExpressions
 * - `statements` is a Statement or Expression
 * TODO: export this???
 */
export class FunctionDefinition extends Statement {
  constructor(...args) {
    super(...args)
    this.assertType("method", "string", OPTIONAL)
    this.assertArrayType("args", VariableExpression, OPTIONAL)
    this.assertType("statements", [Statement, Expression], OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  toJS() {
    const { method = "", args = [], statements } = this
    return `function ${method}(${args.map(arg => arg.toJS())}) ${statements?.toJS() || ""}`
  }
}

/** IfStatement
 * - `condition` is an Expression
 * - `statements` is a Statement or Expression
 */
export class IfStatement extends Statement {
  constructor(...args) {
    super(...args)
    this.assertType("condition", Expression)
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  toJS() {
    const { condition, statements } = this
    return `if ${encloseInParens(condition.toJS())} ${statements.toJS()}`
  }
}

/** ElseIfStatement
 * - `condition` is an Expression
 * - `statements` is a Statement or Expression
 */
export class ElseIfStatement extends Statement {
  constructor(...args) {
    super(...args)
    this.assertType("condition", Expression)
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  toJS() {
    const { condition, statements } = this
    return `else if ${encloseInParens(condition.toJS())} ${statements.toJS()}`
  }
}

/** ElseStatement
 * - `statements` is a Statement or Expression
 */
export class ElseStatement extends Statement {
  constructor(...args) {
    super(...args)
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  toJS() {
    const { statements } = this
    return `else ${statements.toJS()}`
  }
}

/** TernaryExpression
 * - `condition` is an Expression
 * - `trueValue` is an Expression
 * - `falseValue` is an Expression
 */
export class TernaryExpression extends Expression {
  constructor(...args) {
    super(...args)
    this.assertType("condition", Expression)
    this.assertType("trueValue", Expression)
    this.assertType("falseValue", Expression)
  }
  toJS() {
    const { condition, trueValue, falseValue } = this
    const expression = `(${condition.toJS()} ? ${trueValue.toJS()} : ${falseValue.toJS()})`
    return expression
  }
}

/** ConsoleMethodInvocation
 * - `method` is method name, e.g. `log` or `warn`
 * - `args` is an array of expressions
 */
export class ConsoleMethodInvocation extends Statement {
  @proto method = "log"
  constructor(...args) {
    super(...args)
    this.assertArrayType("args", Expression, OPTIONAL)
    this.assertType("method", "string")
  }
  toJS() {
    const { method, args } = this
    return `console.${method}${encloseInParens(args.map(arg => arg.toJS()).join(", "))}`
  }
}

/** JSXElement
 * - `tagName`
 * - `attrs`
 * - `children`
 */
export class JSXElement extends Expression {
  constructor(...args) {
    super(...args)
    this.assertType("tagName", "string")
    this.assertArrayType("attrs", JSXAttribute, OPTIONAL)
    this.assertArrayType("children", [JSXElement, JSXEndTag, JSXElement, JSXText, JSXExpression])
  }
  toJS() {
    const attrs = this.attrs ? `, props: { ${this.attrs?.map(attr => attr.toJS()).join(", ")} }` : ""
    let children = this.children?.map(child => child.toJS()).filter(Boolean)
    if (children && children.length) children = `, children: [\n\t${children.join(",\n\t")}\n]`
    else children = ""
    return `spellCore.element({ tag: "${this.tagName}"${attrs}${children} })`
    // const attributes = this.attrs ? `, { ${this.attrs.map(attr => attr.toJS()).join(", ")} }` : ""
    // const children = this.children
    //   ? `,\n${this.children
    //       .map(child => child.toJS())
    //       .filter(Boolean)
    //       .join(",\n")}`
    //   : ""
    // return `spellCore.createElement('${this.tagName}'${attributes}${children})`
  }
}

/** JSXElement
 * - `name`
 * - `value`
 */
export class JSXAttribute extends Expression {
  constructor(...args) {
    super(...args)
    this.assertType("name", "string")
    this.assertType("value", [Expression, ParseError])
  }
  toJS() {
    // eslint-disable-next-line prefer-const
    let { name, value } = this
    // special case `class` to `className`
    if (name === "class") name = "className"
    else if (!LEGAL_PROPERTY_IDENTIFIER.test(name)) name = `"${name}"`

    if (value instanceof ParseError) {
      return `${name}: undefined ${value.toJS()}`
    }
    return `${name}: ${value.toJS()}`
  }
}

/** JSXEndTag
 * - `tagName`
 */
export class JSXEndTag extends Expression {
  constructor(...args) {
    super(...args)
    this.assertType("tagName", "string")
  }
  toJS() {
    // we don't actually output end tags
    return undefined
  }
}

/** JSXText
 * - `value`
 */
export class JSXText extends Expression {
  constructor(...args) {
    super(...args)
    this.assertType("value", "string")
  }
  toJS() {
    return this.value
  }
}

/** JSXExpression
 * - `value`
 */
export class JSXExpression extends Expression {
  constructor(...args) {
    super(...args)
    this.assertType("value", [Expression, ParseError])
  }
  toJS() {
    const { value } = this
    if (value instanceof ParseError) return `undefined ${value.toJS()}`
    return value.toJS()
  }
}
