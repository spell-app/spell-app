/** AST classes.  These do not necessarily correspond do anyone else's AST. */
import React from "react"
import _get from "lodash/get"

import { proto, memoize, readonly, Assertable, OPTIONAL } from "~/util"
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

// Abstract method to draw a node
function drawNode(node, { className = "", children = null } = {}) {
  return (
    <span className={className} data-start={`${node.match.start}`} data-end={`${node.match.end}`}>
      {children}
    </span>
  )
}

/** Draw a single item in a list by having it render its component. */
const _drawItem = (item, index) => item.component
/** Draw a comma as a list delimiter. */
const _drawComma = index => <span className="punctuation comma">, </span>
/** Draw a newline as a list delimiter. */
const _drawNewline = index => <span className="punctuation newline">\n</span>
/** Draw a period. */
const _drawPeriod = index => <span className="punctuation period">.</span>

/** Draw a series of items with a delimiter between */
function _drawList(items, drawItem = _drawItem, drawSeparator = _drawComma) {
  if (!items) return null
  return items.map((item, index) => (
    <>
      {drawItem(item, index)}
      {index !== items.length - 1 && drawSeparator(index)}
    </>
  ))
}

/** Surround `content` in parens. */
const _drawInParens = content => {
  return (
    <>
      <span className="punctuation open-paren">(</span>
      {content}
      <span className="punctuation close-paren">)</span>
    </>
  )
}
/** Surround `content` in curly brackets. */
const _drawInCurlies = content => {
  const whiteSpace = content ? " " : ""
  return (
    <>
      <span className="punctuation left-curly-bracket">{`{${whiteSpace}`}</span>
      {content}
      <span className="punctuation right-curly-bracket">{`${whiteSpace}}`}</span>
    </>
  )
}
/** Surround `content` in square brackets. */
const _drawInSquares = content => {
  const whiteSpace = content ? " " : ""
  return (
    <>
      <span className="punctuation left-square-bracket">{`[${whiteSpace}`}</span>
      {content}
      <span className="punctuation right-square-bracket">{`${whiteSpace}]`}</span>
    </>
  )
}
/** Surround `content` in single quotes. */
const _drawInSingleQuotes = content => {
  return (
    <>
      <span className="punctuation left-single-quote">&lsquo;</span>
      {content}
      <span className="punctuation right-single-quote">&rsquo;</span>
    </>
  )
}

/** Draw a single argument in an arg list. */
const _drawArg = (arg, index) => <span className={`arg arg-${index}`}>{arg.component}</span>
/** Draw an array of arguments including surrounding parens. */
const _drawArgs = args => {
  return _drawInParens(<span className="args">{_drawList(args, _drawArg)}</span>)
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
    return this.constructor.name || this.constructor.displayName
  }

  /** Scope of the top-level match. */
  get parentScope() {
    return this.match.scope
  }

  /** Compile this AST into Javascript.  You MUST override in a subclass. */
  toJS() {
    throw new TypeError(`AST ${this.nodeType} must implement toJS()`)
  }

  /** Return STATIC react component to render this node. */
  @memoize
  get component() {
    return this.draw()
  }

  /**
   * Override in your subclass to output your node.
   * NOTE: don't call this directly, use `node.component` for memoization.
   */
  draw() {
    return drawNode(this, { className: this.className, children: this.drawChildren() })
  }
  get className() {
    return "ASTNode"
  }
  drawChildren() {
    return null
  }
}

/** Blank line */
export class BlankLine extends ASTNode {
  toJS() {
    return "\n"
  }
  get className() {
    return `${super.className} BlankLine`
  }
  drawChildren() {
    return _drawNewline()
  }
}

/** Base of all Expression types.  Useful for `instanceof`.
 *  - Try to figure out `datatype` if you can, either as a value or as a getter.
 */
export class Expression extends ASTNode {
  get className() {
    return `${super.className} Expression`
  }
}

/** QuotedExpression -- use to wrap resulting AST in quotes.
 *  TODO: is this a good idea?  Don't use too much!
 */
export class QuotedExpression extends Expression {
  @proto @readonly datatype = "string"
  constructor(match, props) {
    super(match, props)
    this.assertType("expression", Expression)
  }
  toJS() {
    return `'${this.expression.toJS()}'`
  }

  get className() {
    return `${super.className} QuotedExpression`
  }
  drawChildren() {
    return _drawInSingleQuotes(<span className="expression">{this.expression.component}</span>)
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
  get className() {
    return `${super.className} Literal`
  }
  drawChildren() {
    return <span className="value">{this.value}</span>
  }
}

/** NumericLiteral type. */
export class NumericLiteral extends Literal {
  @proto @readonly datatype = "number"
  constructor(match, props) {
    if (typeof props === "number") props = { value: props }
    super(match, props)
    this.assertType("value", "number")
  }

  get className() {
    return `${super.className} NumericLiteral`
  }
}

/** StringLiteral type. */
export class StringLiteral extends Literal {
  @proto @readonly datatype = "string"
  constructor(match, props) {
    if (typeof props === "string") props = { value: props }
    super(match, props)
    this.assertType("value", "string")
  }

  get className() {
    return `${super.className} StringLiteral`
  }
}

/** BooleanLiteral type. */
export class BooleanLiteral extends Literal {
  @proto @readonly datatype = "boolean"
  constructor(match, props) {
    if (typeof props === "string") props = { value: props }
    super(match, props)
    this.assertType("value", "boolean")
  }

  get className() {
    return `${super.className} BooleanLiteral`
  }
}

/** RegExpLiteral type. */
export class RegExpLiteral extends Literal {
  @proto @readonly datatype = RegExp
  constructor(match, props) {
    super(match, props)
    this.assertType("value", RegExp)
  }

  get className() {
    return `${super.className} RegExpLiteral`
  }
}

/** NullLiteral type. TODO: ???? */
export class NullLiteral extends Literal {
  // TODO: ???
  @proto @readonly datatype = "null"
  constructor(match, props) {
    super(match, props)
    this.assertType("value", undefined)
  }
  toJS() {
    return "null"
  }
  get className() {
    return `${super.className} NullLiteral`
  }
  drawChildren() {
    return <span className="value">null</span>
  }
}

/** UndefinedLiteral type. TODO: ???? */
export class UndefinedLiteral extends Literal {
  @proto @readonly datatype = "undefined"
  constructor(match, props) {
    super(match, props)
    this.assertType("value", undefined)
  }
  toJS() {
    return "undefined"
  }
  get className() {
    return `${super.className} UndefinedLiteral`
  }
  drawChildren() {
    return <span className="value">undefined</span>
  }
}

/** ThisLiteral type. */
export class ThisLiteral extends Literal {
  toJS() {
    return "this"
  }
  get className() {
    return `${super.className} ThisLiteral`
  }
  drawChildren() {
    return <span className="value">this</span>
  }
}

/** KeywordLiteral type.
 *  - `value` is raw input converted into a JS-legal keyword.
 *  - `raw` (optional) is the raw input string
 */
export class KeywordLiteral extends Literal {
  @proto @readonly datatype = "string" // TODO???
  constructor(match, props) {
    super(match, props)
    this.assertType("value", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
  get className() {
    return `${super.className} KeywordLiteral`
  }
}

/** ArrayLiteral
 *  - `items` (optional) is an array of Expressions
 */
export class ArrayLiteral extends Literal {
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("items", Expression, OPTIONAL)
  }
  toJS() {
    if (!this.items) return "[]"
    return `[${this.items.map(item => item.toJS()).join(", ")}]`
  }
  get className() {
    return `${super.className} ArrayLiteral`
  }
  drawChildren() {
    return _drawInSquares(_drawList(this.items))
  }
}

/** Enumeration
 *  - `enumeration` is an array of Expressions
 *  - `values` is an strings or numbers
 */
export class Enumeration extends Literal {
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("enumeration", Expression)
    this.assertArrayType("values", ["string", "number"])
  }
  toJS() {
    if (!this.enumeration) return "[]"
    return `[${this.enumeration.map(item => item.toJS()).join(", ")}]`
  }
  get className() {
    return `${super.className} Enumeration`
  }
  drawChildren() {
    return _drawInSquares(_drawList(this.enumeration))
  }
}

/** Abstract comment type. Useful for `instanceof`. */
export class Comment extends ASTNode {}

/** ParseError type.
 *  - `message` is text of the error
 */
export class ParseError extends Comment {
  constructor(match, props) {
    super(match, props)
    this.assertType("message", "string")
  }
  toJS() {
    return `/* PARSE ERROR: ${this.message} */`
  }
  get className() {
    return `${super.className} ParseError`
  }
  drawChildren() {
    return <span className="message">{this.message}</span>
  }
}

/** LineComment type.
 *  - `value` is text of the comment (may be empty string).
 *  - `commentSymbol` is the comment symbol used
 *  - `initialWhitespace` is whitespace between the commentSymbol and the `value`
 */
export class LineComment extends Comment {
  constructor(match, props) {
    super(match, props)
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
  get className() {
    return `${super.className} LineComment`
  }
  drawChildren() {
    const { initialWhitespace = " ", value } = this
    let { commentSymbol = "" } = this
    if (commentSymbol !== "//") commentSymbol = `//${commentSymbol}`
    return (
      <>
        <span className="punctuation line-comment-symbol">${commentSymbol}</span>
        <span className="whitespace">${initialWhitespace}</span>
        <span className="comment">{this.value}</span>
      </>
    )
  }
}

/** BlockComment type.
 *  - `value` is the entire contents of the original comment, including initial space and newlines.
 */
export class BlockComment extends Comment {
  constructor(match, props) {
    super(match, props)
    this.assertType("value", "string")
  }
  toJS() {
    return `/* ${this.value} */`
  }
  get className() {
    return `${super.className} BlockComment`
  }
  drawChildren() {
    return (
      <>
        <span className="punctuation open-comment-symbol">{"/*"}</span>
        <span className="comment">{this.value}</span>
        <span className="punctuation close-comment-symbol">{"*/"}</span>
      </>
    )
  }
}

/** ParserAnnotation type, used for parser annotations injected into the output.
 *  - `value` is text of the annotation.
 */
export class ParserAnnotation extends BlockComment {
  toJS() {
    return `/* SPELL: ${this.value} */`
  }
  get className() {
    return `${super.className} ParserAnnotation`
  }
  drawChildren() {
    return (
      <>
        <span className="punctuation open-comment-symbol">{"/*"}</span>
        <span className="annotation">SPELL:</span>
        <span className="comment">{this.value}</span>
        <span className="punctuation close-comment-symbol">{"*/"}</span>
      </>
    )
  }
}

/** Parenthesized expression.
 *  - `expression` is the contained AST Expression. */
export class ParenthesizedExpression extends Expression {
  constructor(match, props) {
    super(match, props)
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
  get className() {
    return `${super.className} ParenthesizedExpression`
  }
  drawChildren() {
    if (this.expression instanceof ParenthesizedExpression) return this.expression.component
    return _drawInParens(<span className="expression">{this.expression.component}</span>)
  }
}

/** Not expression.
 *  - `expression` is the contained AST Expression.
 *  - `datatype` is ALWAYS boolean. */
export class NotExpression extends Expression {
  @proto @readonly datatype = "boolean"
  constructor(match, props) {
    super(match, props)
    this.assertType("expression", Expression)
  }
  toJS() {
    return `!${this.expression.toJS()}`
  }
  get className() {
    return `${super.className} NotExpression`
  }
  drawChildren() {
    return (
      <>
        <span className="punctuation exclamation-point">!</span>
        <span className="expression">{this.expression.component}</span>
      </>
    )
  }
}

/** InfixExpression:  <lhs> <operator> <rhs> */
export class InfixExpression extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("lhs", Expression)
    this.assertType("operator", "string")
    this.assertType("rhs", Expression)
  }
  toJS() {
    return `${this.lhs.toJS()} ${this.operator} ${this.rhs.toJS()}`
  }
  get className() {
    return `${super.className} InfixExpression`
  }
  drawChildren() {
    return (
      <>
        <span className="lhs">{this.lhs.component}</span>
        <span className="operator">{this.operator}</span>
        <span className="rhs">{this.rhs.component}</span>
      </>
    )
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
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 * NOTE: this does not ensure that the named method is actually defined in scope!!!!
 */
export class MethodInvocation extends AbstractMethodInvocation {
  constructor(match, props) {
    super(match, props)
    this.assertType("method", "string")
    this.assertArrayType("args", Expression, OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  toJS() {
    const args = this.args?.map(arg => arg.toJS()).join(", ") || ""
    return `${this.method}(${args})`
  }
  get className() {
    return `${super.className} MethodInvocation`
  }
  drawChildren() {
    return (
      <>
        <span className="method-name">{this.method}</span>
        {_drawArgs(this.args)}
      </>
    )
  }
}

/** CoreMethodInvocation:  calls a `spellCore` `method`.  Used for output languge independence.
 *  - `method` is spellcore method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 */
export class CoreMethodInvocation extends AbstractMethodInvocation {
  constructor(match, props) {
    super(match, props)
    this.assertType("method", "string")
    this.assertArrayType("args", Expression, OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  toJS() {
    const args = this.args?.map(arg => arg.toJS()).join(", ") || ""
    return `spellCore.${this.method}(${args})`
  }
  get className() {
    return `${super.className} CoreMethodInvocation`
  }
  drawChildren() {
    return (
      <>
        <span className="method-scope">spellCore</span>
        {_drawPeriod()}
        <span className="method-name">{this.method}</span>
        {_drawArgs(this.args)}
      </>
    )
  }
}

/** Call a `method` on some `thing` with `args`.
 *  - `thing` is what we'll call the method on.
 *  - `method` is the method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - Try to set `datatype` as string or getter if you can.
 */
export class ScopedMethodInvocation extends AbstractMethodInvocation {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertType("method", "string")
    this.assertArrayType("args", Expression, OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  toJS() {
    const args = this.args?.map(arg => arg.toJS()).join(", ") || ""
    return `${this.thing.toJS()}.${this.method}(${args})`
  }
  get className() {
    return `${super.className} ScopedMethodInvocation`
  }
  drawChildren() {
    return (
      <>
        <span className="method-scope">{this.thing.component}</span>
        {_drawPeriod()}
        <span className="method-name">{this.method}</span>
        {_drawArgs(this.args)}
      </>
    )
  }
}

/** AwaitMethodInvocation:  wrap another method invocation to `await` it.
 *  - `method` is MethodInvocation to call.
 */
export class AwaitMethodInvocation extends AbstractMethodInvocation {
  constructor(match, props) {
    super(match, props)
    this.assertType("method", AbstractMethodInvocation)
    // TODO: Mark the parentScope as asynchronous
    this.parentScope.async = true
  }
  toJS() {
    return `await ${this.method.toJS()}`
  }
  get className() {
    return `${super.className} AwaitMethodInvocation`
  }
  drawChildren() {
    return (
      <>
        <span className="keyword await">await </span>
        {this.method.component}
      </>
    )
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
  constructor(match, props) {
    super(match, props)
    this.assertType("name", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
  toJS() {
    return this.name
  }
  get className() {
    return `${super.className} TypeExpression`
  }
  drawChildren() {
    return <span className="type">{this.name}</span>
  }

  /** Pointer to the known Scope for this type, if available. ??? */
  get scope() {
    return this.match.type
  }
}

/** VariableExpression -- pointer to a Variable object.
 *  - `name` is the normalized type name: dashes and spaces converted to underscores.
 *  - `default` (optional) AST for default value. See `DestructuredAssignment`
 *  CURRENTLY UNUSED
 *  - `raw` (optional) is the original input string, unnormalized.
 *  - `variable` (optional) is pointer to scope Variable, if there is one.
 *  - `plurality` (optional) is "singular", "plural" or `undefined`  // TODO: derive?
 */
export class VariableExpression extends Expression {
  constructor(match, props) {
    super(match, props)
    if (!this.name) this.name = this.match.value
    this.assertType("name", "string")
    this.assertType("default", Expression, OPTIONAL)
    this.assertType("raw", "string", OPTIONAL)
  }
  toJS() {
    if (this.default) return `${this.name} = ${this.default.toJS()}`
    return this.name
  }
  get className() {
    return `${super.className} VariableExpression`
  }
  drawChildren() {
    if (this.default)
      return (
        <>
          <span className="name">{this.name}</span>
          <span className="punctuation equals">{" = "}</span>
          <span className="default">{this.default.component}</span>
        </>
      )
    return <span className="name">{this.name}</span>
  }
}

/** ConstantExpression -- pointer to a Constant object.
 *  - `name` is the constant name (not normalized ???)
 *  - `output` is the constant string to output, including quotes.
 *  - `constant` is pointer to scope Constant, if there is one.
 */
export class ConstantExpression extends Expression {
  @proto @readonly datatype = "string"
  constructor(match, props) {
    super(match, props)
    this.assertType("name", "string")
    this.assertType("output", "string")
  }
  toJS() {
    return this.output
  }
  get className() {
    return `${super.className} ConstantExpression`
  }
  drawChildren() {
    return <span className="constant">{this.output}</span>
  }
}

/** PropertyLiteral -- identifier which refers to some property of an object.
 *  - `value` is the normalized property name.  It will be inferred from the `match`.
 *  - `raw` (optional) is the input property name
 */
export class PropertyLiteral extends Literal {
  constructor(match, props) {
    if (typeof props === "string") props = { value: props }
    super(match, props)
    if (this.value === undefined) this.value = this.match.value
    this.assertType("value", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
  get isLegalIdentifier() {
    return LEGAL_PROPERTY_IDENTIFIER.test(this.value)
  }
  get className() {
    return `${super.className} PropertyLiteral ${this.isLegalIdentifier ? "legal-identifier" : "non-legal-identifier"}`
  }
  drawChildren() {
    if (this.isLegalIdentifier) return <span clasName="property">{this.value}</span>
    return _drawInSingleQuotes(<span clasName="property">{this.value}</span>)
  }
}

/** PropertyExpression -- named property of some object.
 *  - `object` is the thing to get the property from, as an Expression.
 *  - `property` is the normalized property name.
 *  TODO: datatype???
 */
export class PropertyExpression extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("object", Expression)
    if (typeof this.property === "string") this.property = new PropertyLiteral(this.match, this.property)
    this.assertType("property", PropertyLiteral)
  }
  toJS() {
    const prop = this.property.toJS()
    if (this.property.isLegalIdentifier) return `${this.object.toJS()}.${prop}`
    return `${this.object.toJS()}['${prop}']`
  }
  get className() {
    return `${super.className} PropertyExpression`
  }
  drawChildren() {
    const object = <span className="object">{this.object.component}</span>
    if (this.property.isLegalIdentifier) {
      return (
        <>
          {object}
          {_drawPeriod()}
          {this.property.component}
        </>
      )
    }
    return (
      <>
        {object}
        {_drawInSquares(this.property.component)}
      </>
    )
  }
}

/** ObjectLiteralProperty type
 *  - `property` is the normalized property name.
 *  - `value` (optional) is the property value.
 */
export class ObjectLiteralProperty extends ASTNode {
  constructor(match, props) {
    super(match, props)
    if (typeof this.property === "string") this.property = new PropertyLiteral(this.match, this.property)
    this.assertType("property", PropertyLiteral)
    this.assertType("value", [Expression, FunctionDefinition], OPTIONAL)
    // this.assert(this.property.isLegalIdentifier || !!this.value, "Non-legal identifiers must specify a value!")
  }
  toJS() {
    // If no value, assume it's available as a local variable.
    if (!this.value) return this.property.toJS()
    return `${this.property.toJS()}: ${this.value.toJS()}`
  }
  get className() {
    return `${super.className} ObjectLiteralProperty`
  }
  drawChildren() {
    // If no value, assume it's available as a local variable.
    if (!this.value) return <span className="value">{this.property.component}</span>

    return (
      <>
        {this.property.component}
        <span className="punctuation colon">: </span>
        <span className="value">{this.value.component}</span>
      </>
    )
  }
}

/** ObjectLiteral -- bag of properties.
 *  - `properties` is an array of PropertyValues
 */
export class ObjectLiteral extends Expression {
  @proto @readonly datatype = "object"
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("properties", ObjectLiteralProperty, OPTIONAL)
  }
  addProp(property, value) {
    if (typeof value === "string") value = new StringLiteral(this.match, { value })
    this.assert(
      value instanceof Expression || value instanceof FunctionDefinition,
      `AST.ObjectLiteral.addProp(${property}): value must be an Expression`
    )
    if (!this.properties) this.properties = []
    this.properties.push(new ObjectLiteralProperty(this.match, { property, value }))
  }
  // TODO: datatype???
  toJS() {
    if (!this.properties) return "{}"
    // TODO: single prop on one line, newlines + indent for multiple props
    return `{ ${this.properties.map(prop => prop.toJS()).join(", ")} }`
  }
  get className() {
    return `${super.className} ObjectLiteral`
  }
  drawChildren() {
    return _drawInCurlies(_drawList(this.properties))
  }
}

/** Statement abstract type. */
export class Statement extends ASTNode {
  get className() {
    return `${super.className} Statement`
  }
}

/** StatementGroup -- set of random statements which does NOT get wrapped with curly braces!
 *  - `statements` is a list of Statements.
 */
export class StatementGroup extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("statements", [Statement, Expression, Comment, BlankLine], OPTIONAL)
  }
  toJS() {
    const { statements } = this
    if (!statements) return ""
    return `${statements.map(statement => statement.toJS()).join("\n")}`
  }
  get className() {
    return `${super.className} StatementGroup`
  }
  drawChildren() {
    return _drawList(this.statements, _drawItem, _drawNewline)
  }
}

/** StatementBlock -- set of statements which outputs with curly braces around.
 *  - `statements` is a list of Statements.
 */
export class StatementBlock extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("statements", [Statement, Expression, Comment, BlankLine], OPTIONAL)
  }
  toJS() {
    let { statements } = this
    // Unwind any single nested StatementGroups
    while (statements?.length === 1 && statements[0] instanceof StatementGroup) {
      statements = statements[0].statements
    }
    if (!statements || !statements.length) return "{}"
    const curlyDelimiter = statements.length === 1 ? " " : "\n"
    return `{${curlyDelimiter}${statements.map(statement => statement.toJS()).join("\n")}${curlyDelimiter}}`
  }
  get className() {
    return `${super.className} StatementBlock`
  }
  drawChildren() {
    return _drawInCurlies(_drawList(this.statements, _drawItem, _drawNewline))
  }
}

/** AssignmentStatement -- assign value to thing.
 *  - `thing` is an Expression.
 *  - `value` is an Expression
 *  - `isNewVariable` (optional) if true and `thing` is an Expression, we'll declare the var.
 */
export class AssignmentStatement extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertType("value", Expression)
    this.assertType("isNewVariable", "boolean", OPTIONAL)
  }
  toJS() {
    const { thing, value, isNewVariable } = this
    const declarator = isNewVariable ? "let " : ""
    return `${declarator}${thing.toJS()} = ${value.toJS()}`
  }
  get className() {
    return `${super.className} AssignmentStatement`
  }
  drawChildren() {
    return (
      <>
        {this.isNewVariable && <span className="declarator">let </span>}
        <span className="thing">{this.thing.component}</span>
        <span className="punctuation equals"> = </span>
        <span className="value">{this.value.component}</span>
      </>
    )
  }
}

/** DestructuredAssignment -- pull multiple variables with defaults out of a `thing`
 *  - `thing` is an Expression.
 *  - `variables` are VariableExpressions, possibly with defaults
 *  - `isNewVariable` (optional) if true and `thing` is an Expression, we'll declare the var.
 */
export class DestructuredAssignment extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertArrayType("variables", VariableExpression)
    this.assertType("isNewVariable", "boolean", OPTIONAL)
  }
  toJS() {
    const { thing, variables, isNewVariable } = this
    const declarator = isNewVariable ? "let " : ""
    return `${declarator}{ ${variables.map(variable => variable.toJS()).join(", ")} } = ${thing.toJS()}`
  }
  get className() {
    return `${super.className} DestructuredAssignment`
  }
  drawChildren() {
    return (
      <>
        {this.isNewVariable && <span className="declarator">let </span>}
        {_drawInCurlies(_drawList(this.variables))}
        <span className="punctuation equals"> = </span>
        <span className="thing">{this.thing.component}</span>
      </>
    )
  }
}

/** ReturnStatement -- return a value.
 *  - `value` (optional) is an Expression to be returned.
 */
export class ReturnStatement extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertType("value", Expression, OPTIONAL)
  }
  toJS() {
    if (!this.value) return "return"
    return `return ${this.value.toJS()}`
  }
  get className() {
    return `${super.className} ReturnStatement`
  }
  drawChildren() {
    return (
      <>
        <span className="keyword return">{"return "}</span>
        <span className="value">{this.value.component}</span>
      </>
    )
  }
}

/** ClassDeclaration
 * - `type` is a TypeExpression
 * - `superType` (optional) is a TypeExpression
 * - `instanceType` (optional) is a TypeExpression for lists of a certain type.
 */
export class ClassDeclaration extends Statement {
  constructor(match, props) {
    super(match, props)
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
      // output.push(`${type.name}.instanceType = ${instanceType.name}`)
    }
    return output.join("\n")
  }
  get className() {
    return `${super.className} ClassDeclaration`
  }
  drawChildren() {
    return (
      <>
        <span className="keyword export">{"export "}</span>
        <span className="keyword class">{"class "}</span>
        <span className="type">{this.type.component}</span>
        {!!this.superType && (
          <>
            <span className="keyword extends">{" extends "}</span>
            <span className="superType">{this.superType.component}</span>
          </>
        )}
        <span className="todo">TODO: output addExport() etc</span>
      </>
    )
  }
}

/** NewInstanceExpression
 * - `type` is a TypeExpression
 * - `props` (optional) is an ObjectLiteral
 */
export class NewInstanceExpression extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("type", TypeExpression)
    this.assertType("props", ObjectLiteral, OPTIONAL)
  }
  toJS() {
    const { type, props } = this
    return `new ${type.name}(${props ? props.toJS() : ""})`
  }
  get className() {
    return `${super.className} NewInstanceExpression`
  }
  drawChildren() {
    return (
      <>
        <span className="keyword export">{"new "}</span>
        <span className="type">{this.type.component}</span>
        {_drawInParens(_drawList(this.props))}
      </>
    )
  }
}

/** ListExpression
 * - `items` (optional) is a list of Expressions
 */
export class ListExpression extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("items", Expression, OPTIONAL)
  }
  toJS() {
    const { items } = this
    if (!items) return "[]"
    return `[${items.map(item => item.toJS()).join(", ")}]`
  }
  get className() {
    return `${super.className} ListExpression`
  }
  drawChildren() {
    return _drawInSquares(_drawList(this.items))
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
  constructor(match, props) {
    super(match, props)
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
  get className() {
    return `${super.className} InlineMethodExpression`
  }
  drawChildren() {
    return (
      <>
        {_drawArgs(this.args)}
        <span className="punctuation fat-arrow"> => </span>
        {_drawInCurlies(this.expression?.component || this.statements?.component)}
      </>
    )
  }
}

/** PrototypeExpression:  type.prototype
 *  * - `type` is a TypeExpression
 */
export class PrototypeExpression extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("type", TypeExpression)
  }
  toJS() {
    const { type } = this
    return `${type.toJS()}.prototype`
  }
  get className() {
    return `${super.className} PrototypeExpression`
  }
  drawChildren() {
    return (
      <>
        {this.type.component}
        {_drawPeriod()}
        <span className="keyword prototype">{"prototype"}</span>
      </>
    )
  }
}

/** ValueDefinition: assigns named value to prototype
 * - `thing` is an Expression
 * - `property` is PropertyLiteral
 * - `value` is an Expression
 */
export class ValueDefinition extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertType("property", PropertyLiteral)
    this.assertType("value", Expression)
  }
  toJS() {
    const { thing, property, value } = this
    return `spellCore.define(${thing.toJS()}, '${property.toJS()}', { value: ${value.toJS()} })`
  }
  get className() {
    return `${super.className} ValueDefinition`
  }
  drawChildren() {
    const method = new CoreMethodInvocation(this.match, {
      method: "define",
      args: [
        this.thing,
        this.property,
        new ObjectLiteral(this.value.match, {
          properties: [
            new ObjectLiteralProperty(this.value.match, {
              property: "value",
              value: this.value
            })
          ]
        })
      ]
    })
    return method.component
  }
}

/** SetterDefinition: creates a setter for type instances
 * - `thing` is an Expression
 * - `property` is PropertyLiteral
 * - `statements` is a Statement or Expression
 */
export class SetterDefinition extends Statement {
  constructor(match, props) {
    super(match, props)
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
  constructor(match, props) {
    super(match, props)
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
  constructor(match, props) {
    super(match, props)
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
  constructor(match, props) {
    super(match, props)
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

/** FunctionDefinition: creates an function instance
 * - `method` is the method name
 * - `args` ia array of VariableExpressions
 * - `statements` is a Statement or Expression
 * TODO: export this???
 */
export class FunctionDefinition extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertType("method", "string", OPTIONAL)
    this.assertArrayType("args", VariableExpression, OPTIONAL)
    this.assertType("statements", [Statement, Expression], OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  toJS() {
    const { method = "", args = [], statements } = this
    return `function ${method}(${args.map(arg => arg.toJS()).join(", ")}) ${statements?.toJS() || ""}`
  }
}

/** IfStatement
 * - `condition` is an Expression
 * - `statements` is a Statement or Expression
 */
export class IfStatement extends Statement {
  constructor(match, props) {
    super(match, props)
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
  constructor(match, props) {
    super(match, props)
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
  constructor(match, props) {
    super(match, props)
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
  constructor(match, props) {
    super(match, props)
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
  constructor(match, props) {
    super(match, props)
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
  constructor(match, props) {
    super(match, props)
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

/** JSXAttribute
 * - `name`
 * - `value`
 * - `error`
 */
export class JSXAttribute extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("name", "string")
    this.assertType("value", Expression, OPTIONAL)
    this.assertType("error", ParseError, OPTIONAL)
  }
  toJS() {
    // eslint-disable-next-line prefer-const
    const { name, value, error } = this
    let output = name
    // special case `class` to `className`
    if (name === "class") output = "className"
    // quote dashed-properties etc
    else if (!LEGAL_PROPERTY_IDENTIFIER.test(name)) output = `"${name}"`

    output += `: ${value ? value.toJS() : "undefined"}`
    if (error) output += ` ${error.toJS()}`
    return output
  }
}

/** JSXEndTag
 * - `tagName`
 */
export class JSXEndTag extends Expression {
  constructor(match, props) {
    super(match, props)
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
  constructor(match, props) {
    super(match, props)
    this.assertType("value", "string", OPTIONAL)
    this.assertType("raw", "string", OPTIONAL)
  }
  toJS() {
    return this.value
  }
}

/** JSXExpression
 * - `value`
 */
export class JSXExpression extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("expression", Expression, OPTIONAL)
    this.assertType("error", ParseError, OPTIONAL)
  }
  toJS() {
    const { expression, error } = this
    let value = expression ? expression.toJS() : "undefined"
    if (error) value += ` ${error.toJS()}`
    return value
  }
}
