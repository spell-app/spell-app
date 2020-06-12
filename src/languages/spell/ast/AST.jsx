/* eslint-disable react/prop-types */
/** AST classes.  These do not necessarily correspond do anyone else's AST. */
import React from "react"
import _get from "lodash/get"

import { proto, memoize, readonly, getSuperHierarchy, Assertable, OPTIONAL } from "~/util"
import { Match } from "~/parser"

// TODO: define this in `constants` or some such?
const LEGAL_PROPERTY_IDENTIFIER = /^[a-zA-Z][\w\$]*$/

function convertStatementsToBlock(match, statements) {
  if (!statements) return new StatementBlock(match)
  if (statements instanceof StatementBlock) return statements
  return new StatementBlock(match, { statements: [statements] })
}

/** Draw a single item in a list by having it render its component. */
const _drawItem = (item, index) => item.component
/** Draw a comma as a list delimiter. */
const _drawComma = index => <span className="punctuation comma">, </span>
/** Draw a comma and then a newline as a list delimiter. */
const _drawIndentedComma = index => (
  <>
    {_drawComma()}
    {_drawIndentedNewline()}
  </>
)
/** Draw a newline as a list delimiter. */
const _drawNewline = index => <span className="whitespace newline">{"\n"}</span>
/** Draw a newline as a list delimiter. */
const _drawIndentedNewline = index => (
  <>
    <span className="whitespace newline">{"\n"}</span>
    <span className="whitespace indent" />
  </>
)

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
  const whiteSpace = content && content.length ? " " : ""
  return (
    <>
      <span className="punctuation left-curly-bracket">{`{${whiteSpace}`}</span>
      {content}
      <span className="punctuation right-curly-bracket">{`${whiteSpace}}`}</span>
    </>
  )
}

const _drawLeftCurly = (whiteSpace = "") => <span className="punctuation left-curly-bracket">{`{${whiteSpace}`}</span>
const _drawRightCurly = (whiteSpace = "") => <span className="punctuation right-curly-bracket">{`${whiteSpace}}`}</span>
const _drawBlock = (content, indented = false) => {
  if (!content || content.length === 0) {
    return (
      <>
        {_drawLeftCurly()}
        {_drawRightCurly()}
      </>
    )
  }
  const whiteSpace = indented ? "" : " "
  return (
    <span className={`ASTBlock${indented ? " indented" : ""}`}>
      {_drawLeftCurly(whiteSpace)}
      {indented && _drawNewline()}
      <span className={`blockContents${indented ? " indented" : ""}`}>{content}</span>
      {indented && _drawNewline()}
      {_drawRightCurly(whiteSpace)}
    </span>
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
      <span className="punctuation left-single-quote">{"'"}</span>
      {content}
      <span className="punctuation right-single-quote">{"'"}</span>
    </>
  )
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

  //-------------------------
  // Rendering as JS text
  //-------------------------

  /** Compile this AST into Javascript.  You MUST override in a subclass. */
  toJS() {
    throw new TypeError(`AST ${this.nodeType} must implement toJS()`)
  }

  /** Helper to turn list of things into JS */
  listToJS(list, delimiter = ", ") {
    return list ? list.map(item => item.toJS()).join(delimiter) : ""
  }

  /** Helper to wrap JS value in curlies. */
  wrapJSInCurlies(value = "") {
    if (!value) return "{}"
    if (value.includes("\n")) return `{\n\t${value.split("\n").join("\n\t")}\n}`
    return `{ ${value} }`
  }

  /** Helper to wrap JS value in square brackets. */
  wrapJSInSquares(value = "") {
    if (!value) return "[]"
    if (value.includes("\n")) {
      const prefix = value.startsWith("\n") ? "\t" : "\n\t"
      return `[${prefix}${value.split("\n").join("\n\t")}\n]`
    }
    return `[${value}]`
  }

  /** Enclose `value` in parens, unless it is already a propertly parenthesized string. */
  wrapJSInParens(value) {
    // TODO: this is not a sufficient check!!!
    if (typeof value === "string" && value.startsWith("(") && value.endsWith(")")) return value
    return `(${value})`
  }

  /** Helper to turn `args` array into JS */
  argsToJS(args = this.args) {
    return this.wrapJSInParens(this.listToJS(args))
  }

  //-------------------------
  // Rendering as React nodes
  //-------------------------

  /** Return STATIC react component which render this node. */
  @memoize
  get component() {
    return (
      <span className={this.className} data-start={`${this.match.start}`} data-end={`${this.match.end}`}>
        {this.drawChildren()}
      </span>
    )
  }

  /**
   * Return css className as concatenation of all superclass method names.
   * Override in your subclass to add special stuff, e.g.
   *  `get className() { return super.className + "foo bar baz" }`
   */
  get className() {
    const supers = getSuperHierarchy(this, ASTNode)
      .reverse()
      .map(constructor => constructor.name)
    return supers.join(" ")
  }

  /**
   * Render children to draw INSIDE the outer element,
   * which has `node.className` (e.g. `ASTNode Expression StringLiteral`) set.
   */
  drawChildren() {
    return null
  }

  /** Rendering Helpers */
  drawArgs(args = this.args) {
    const drawArg = (arg, index) => <span className={`arg arg-${index}`}>{arg.component}</span>
    return _drawInParens(<span className="args">{_drawList(args, drawArg)}</span>)
  }
}

/** Blank line */
export class BlankLine extends ASTNode {
  toJS() {
    return "" // "\n"
  }
  drawChildren() {
    return null // _drawNewline()
  }
}

/** Base of all Expression types.  Useful for `instanceof`.
 *  - Try to figure out `datatype` if you can, either as a value or as a getter.
 */
export class Expression extends ASTNode {}

/** Expression with attached comment.
 *  - `expression`
 *  - `comment`
 */
export class ExpressionWithComment extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("expression", Expression)
    this.assertType("comment", BlockComment)
  }
  toJS() {
    return `${this.expression.toJS()} ${this.comment.toJS()}`
  }
  drawChildren() {
    return (
      <>
        {this.expression.component}
        {this.comment.component}
      </>
    )
  }
}

/** QuotedExpression -- use to wrap resulting AST in quotes.
 *  TODO: is this a good idea?  Don't use too much!
 */
export class QuotedExpression extends Expression {
  @proto @readonly datatype = "string"
  constructor(match, props) {
    if (typeof props === "string") props = { expression: new StringLiteral(match, { value: props }) }
    super(match, props)
    this.assertType("expression", Expression)
  }
  toJS() {
    return `'${this.expression.toJS()}'`
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
}

/** StringLiteral type. */
export class StringLiteral extends Literal {
  @proto @readonly datatype = "string"
  constructor(match, props) {
    if (typeof props === "string") props = { value: props }
    super(match, props)
    this.assertType("value", "string")
  }
}

/** BooleanLiteral type. */
export class BooleanLiteral extends Literal {
  @proto @readonly datatype = "boolean"
  constructor(match, props) {
    if (typeof props === "boolean") props = { value: props }
    super(match, props)
    this.assertType("value", "boolean")
  }
  drawChildren() {
    return this.value ? "true" : "false"
  }
}

/** RegExpLiteral type. */
export class RegExpLiteral extends Literal {
  @proto @readonly datatype = RegExp
  constructor(match, props) {
    super(match, props)
    this.assertType("value", RegExp)
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
  drawChildren() {
    return <span className="value">undefined</span>
  }
}

/** ThisLiteral type. */
export class ThisLiteral extends Literal {
  toJS() {
    return "this"
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
}

/** ArrayLiteral
 *  - `items` (optional) is an array of Expressions
 *  - `wrap` (optional) is boolean `true` if we should wrap children
 */
export class ArrayLiteral extends Literal {
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("items", Expression, OPTIONAL)
    this.assertType("wrap", "boolean", OPTIONAL)
  }
  toJS() {
    const delimiter = this.wrap ? ",\n" : ", "
    return this.wrapJSInSquares(this.listToJS(this.items, delimiter))
  }
  drawChildren() {
    const delimiter = this.wrap ? _drawComma : _drawIndentedComma
    return _drawInSquares(_drawList(this.items, delimiter))
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
    return this.wrapJSInSquares(this.listToJS(this.enumeration))
  }
  drawChildren() {
    return _drawInSquares(_drawList(this.enumeration))
  }
}

/** Abstract comment type. Useful for `instanceof`. */
export class Comment extends ASTNode {}

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
    return `${super.className}${this.commentSymbol !== "//" ? " header" : ""}`
  }
  drawChildren() {
    let { commentSymbol = "" } = this
    if (commentSymbol !== "//") commentSymbol = `//${commentSymbol}`
    return (
      <>
        <span className="punctuation line-comment-symbol">{commentSymbol}</span>
        <span className="whitespace">{this.initialWhitespace || " "}</span>
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
  drawChildren() {
    return (
      <>
        <span className="punctuation open-comment-symbol">{"/* "}</span>
        <span className="comment">{this.value}</span>
        <span className="punctuation close-comment-symbol">{" */"}</span>
      </>
    )
  }
}

/** ParseError type.
 *  - `message` is text of the error
 */
export class ParseError extends BlockComment {
  toJS() {
    return `/* PARSE ERROR: ${this.value} */`
  }
  drawChildren() {
    return (
      <>
        <span className="punctuation open-comment-symbol">{"/* "}</span>
        <span className="annotation">PARSE ERROR: </span>
        <span className="comment">{this.value}</span>
        <span className="punctuation close-comment-symbol">{" */"}</span>
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
  drawChildren() {
    return (
      <>
        <span className="punctuation open-comment-symbol">{"/* "}</span>
        <span className="annotation">SPELL: </span>
        <span className="comment">{this.value}</span>
        <span className="punctuation close-comment-symbol">{" */"}</span>
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
    // Unwind nested parenthesis
    while (this.expression instanceof ParenthesizedExpression) {
      this.expression = this.expression.expression
    }
  }
  get datatype() {
    return this.expression.datatype
  }
  toJS() {
    return `(${this.expression.toJS()})`
  }
  drawChildren() {
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
  drawChildren() {
    return (
      <>
        <span className="operator exclamation-point">!</span>
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
  drawChildren() {
    return (
      <>
        <span className="lhs">{this.lhs.component}</span>
        <span className="operator"> {this.operator} </span>
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

/** MethodInvocation:  generic named method invocation.
 *  - `method` is method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 * NOTE: this does not ensure that the named method is actually defined in scope!!!!
 */
export class MethodInvocation extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("method", "string")
    this.assertArrayType("args", Expression, OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  toJS() {
    return `${this.method}${this.argsToJS()}`
  }
  drawChildren() {
    return (
      <>
        <span className="method-name">{this.method}</span>
        {this.drawArgs()}
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
export class ScopedMethodInvocation extends MethodInvocation {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertType("method", "string")
    this.assertArrayType("args", Expression, OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  toJS() {
    return `${this.thing.toJS()}.${this.method}${this.argsToJS()}`
  }
  drawChildren() {
    return (
      <>
        <span className="method-scope">{this.thing.component}</span>
        <span className="operator period">.</span>
        <span className="method-name">{this.method}</span>
        {this.drawArgs()}
      </>
    )
  }
}

/** ConsoleMethodInvocation
 * - `method` is method name, e.g. `log` or `warn`
 * - `args` is an array of expressions
 */
export class ConsoleMethodInvocation extends ScopedMethodInvocation {
  @proto method = "log"
  constructor(match, props) {
    super(match, { ...props, thing: new VariableExpression(match, { name: "console", type: "global" }) })
  }
}

/** CoreMethodInvocation:  calls a `spellCore` `method`.  Used for output languge independence.
 *  - `method` is spellcore method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 */
export class CoreMethodInvocation extends ScopedMethodInvocation {
  constructor(match, props) {
    super(match, { ...props, thing: new VariableExpression(match, { name: "spellCore", type: "global" }) })
  }
}

/** AwaitMethodInvocation:  wrap another method invocation to `await` it.
 *  - `method` is MethodInvocation to call.
 */
export class AwaitMethodInvocation extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("method", MethodInvocation)
    // TODO: Mark the parentScope as asynchronous
    this.parentScope.async = true
  }
  toJS() {
    return `await ${this.method.toJS()}`
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
 *  - `type` (optional) "argument" or "this" etc
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
    const classes = [super.className]
    if (this.type) classes.push(this.type)
    if (this.variable?.kind && !classes.includes(this.variable.kind)) classes.push(this.variable.kind)
    return classes.join(" ")
  }
  drawChildren() {
    console.warn(this)
    if (!this.default) return <span className="name">{this.name}</span>
    return (
      <>
        <span className="name">{this.name}</span>
        <span className="operator equals">{" = "}</span>
        <span className="default">{this.default.component}</span>
      </>
    )
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
  toJS() {
    if (this.isLegalIdentifier) return this.value
    return `'${this.value}'`
  }
  get className() {
    return `${super.className} ${this.isLegalIdentifier ? "legal-identifier" : "non-legal-identifier"}`
  }
  drawChildren() {
    const element = <span className="property">{this.value}</span>
    return this.isLegalIdentifier ? element : _drawInSingleQuotes(element)
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
  drawChildren() {
    const object = <span className="object">{this.object.component}</span>
    if (this.property.isLegalIdentifier) {
      return (
        <>
          {object}
          <span className="operator period">.</span>
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
    this.assertType("error", ParseError, OPTIONAL)
    // this.assert(this.property.isLegalIdentifier || !!this.value, "Non-legal identifiers must specify a value!")
  }
  toJS() {
    const error = this.error ? ` ${this.error.toJS()}` : ""
    const prop = this.property.toJS()
    // If no value, assume it's available as a local variable.
    if (!this.value) return `${prop}${error}`
    return `${prop}: ${this.value.toJS()}${error}`
  }
  drawChildren() {
    const error = this.error ? this.error.component : null
    const prop = <span className="property">{this.property.component}</span>
    // If no value, assume it's available as a local variable.
    const value = !!this.value && (
      <>
        <span className="operator colon">: </span>
        <span className="value">{this.value.component}</span>
      </>
    )
    return (
      <>
        {prop}
        {value}
        {error}
      </>
    )
  }
}

/** ObjectLiteralMethod type, eg: `{ foo(arg, arg) {...} }`
 *  - `property` is the normalized property name.
 *  - `args` are method arguments
 *  - `statements` (optional) is the method body.
 */
export class ObjectLiteralMethod extends ObjectLiteralProperty {
  constructor(match, props) {
    super(match, props)
    if (typeof this.property === "string") this.property = new PropertyLiteral(this.match, this.property)
    this.assertType("property", PropertyLiteral)
    this.assertArrayType("args", Expression, OPTIONAL)
    this.assertType("statements", [Statement, Expression], OPTIONAL)
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  toJS() {
    return `${this.property.toJS()}${this.argsToJS()} ${this.statements.toJS()}`
  }
  drawChildren() {
    return (
      <>
        {this.property.component}
        {this.drawArgs()}
        {this.statements.component}
      </>
    )
  }
}

/** ObjectLiteral -- bag of properties.
 *  - `properties` is an array of PropertyValues
 * TODO: datatype???
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
      `AST.ObjectLiteral.addProp(${property}): value must be an Expression or FunctionDefinition`
    )
    if (!this.properties) this.properties = []
    this.properties.push(new ObjectLiteralProperty(this.match, { property, value }))
  }
  addMethod(method) {
    this.assert(
      method instanceof ObjectLiteralMethod,
      `AST.ObjectLiteral.addMethod(): method must be an ObjectLiteralMethod`
    )
    if (!this.properties) this.properties = []
    this.properties.push(method)
  }
  // Should we wrap properties block?
  get wrap() {
    return this.properties?.length > 2 || this.properties?.some(item => item instanceof ObjectLiteralMethod)
  }
  toJS() {
    // TODO: single prop on one line, newlines + indent for multiple props
    const delimiter = this.wrap ? ",\n" : ", "
    return this.wrapJSInCurlies(this.listToJS(this.properties, delimiter))
  }
  drawChildren() {
    const { wrap } = this
    const delimiter = wrap ? _drawIndentedComma : _drawComma
    const contents = _drawList(this.properties, _drawItem, delimiter)
    return _drawBlock(contents, wrap)
  }
}

/** Statement abstract type. */
export class Statement extends ASTNode {}

/** StatementGroup -- set of random statements which does NOT get indented with curly braces!
 *  - `statements` is a list of Statements.
 */
export class StatementGroup extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("statements", [Statement, Expression, Comment, BlankLine], OPTIONAL)
  }
  toJS() {
    return this.listToJS(this.statements, "\n")
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
    // Unwind any single nested StatementGroups
    while (this.statements?.length === 1 && this.statements[0] instanceof StatementGroup) {
      this.statements = this.statements[0].statements
    }
  }
  get wrap() {
    return this.statements?.length > 1
  }
  toJS() {
    return this.wrapJSInCurlies(this.listToJS(this.statements, "\n"))
  }
  drawChildren() {
    const statements = _drawList(this.statements, _drawItem, _drawIndentedNewline)
    return _drawBlock(statements, this.wrap)
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
    return `${super.className}${this.isNewVariable ? " declaration" : ""}`
  }
  drawChildren() {
    return (
      <>
        {this.isNewVariable && <span className="keyword declarator">let </span>}
        <span className="thing">{this.thing.component}</span>
        <span className="operator equals"> = </span>
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
    const declarator = this.isNewVariable ? "let " : ""
    return `${declarator}${this.wrapJSInCurlies(this.listToJS(this.variables))} = ${this.thing.toJS()}`
  }
  get className() {
    return `${super.className}${this.isNewVariable ? " declaration" : ""}`
  }
  drawChildren() {
    return (
      <>
        {this.isNewVariable && <span className="keyword declarator">let </span>}
        {_drawInCurlies(_drawList(this.variables))}
        <span className="operator equals"> = </span>
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
        <span className="todo"> {"/"}* TODO: output addExport() etc */</span>
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
  drawChildren() {
    return (
      <>
        <span className="keyword new">{"new "}</span>
        <span className="type">{this.type.component}</span>
        {_drawInParens(this.props && this.props.component)}
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
    return `[${this.listToJS(this.items)}]`
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
    const body = this.expression || this.statements
    if (body) return `${this.argsToJS()} => ${body.toJS()}`
    return `${this.argsToJS()} => {}`
  }
  drawChildren() {
    return (
      <>
        {this.drawArgs()}
        <span className="operator fat-arrow">{" => "}</span>
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
  drawChildren() {
    return (
      <>
        {this.type.component}
        <span className="operator period">.</span>
        <span className="keyword prototype">{"prototype"}</span>
      </>
    )
  }
}

/** PropertyDefinition: spellCore.define(...)
 * Define `@memoize get definition()` to return `spellCore.define()` statement.
 */
export class PropertyDefinition extends Statement {
  toJS() {
    return this.definition.toJS()
  }
  drawChildren() {
    return this.definition.component
  }
}

/** ValueDefinition: assigns named value to prototype
 * - `thing` is an Expression
 * - `property` is PropertyLiteral
 * - `value` is an Expression
 */
export class ValueDefinition extends PropertyDefinition {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertType("property", PropertyLiteral)
    this.assertType("value", Expression)
  }
  // Return `CoreMethodInvocation` which we'll use to render as JS or component
  @memoize
  get definition() {
    return new CoreMethodInvocation(this.match, {
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
  }
}

/** SetterDefinition: creates a setter for type instances
 * - `thing` is an Expression
 * - `property` is PropertyLiteral
 * - `statements` is a Statement or Expression
 */
export class SetterDefinition extends PropertyDefinition {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertType("property", PropertyLiteral)
    this.assertType("statements", [Statement, Expression], OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  // Return `CoreMethodInvocation` which we'll use to render as JS or component
  @memoize
  get definition() {
    return new CoreMethodInvocation(this.match, {
      method: "define",
      args: [
        this.thing,
        new QuotedExpression(this.property.match, { expression: this.property }),
        new ObjectLiteral(this.property.match, {
          properties: [
            new ObjectLiteralMethod(this.statements.match, {
              property: "set",
              args: [this.property],
              statements: this.statements
            })
          ]
        })
      ]
    })
  }
}

/** GetterDefinition: creates a setter for type instances
 * - `thing` is an Expression
 * - `property` is the PropertyLiteral
 * - `statements` is a Statement or Expression
 */
export class GetterDefinition extends PropertyDefinition {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertType("property", PropertyLiteral)
    this.assertType("statements", [Statement, Expression], OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  // Return `CoreMethodInvocation` which we'll use to render as JS or component
  @memoize
  get definition() {
    return new CoreMethodInvocation(this.match, {
      method: "define",
      args: [
        this.thing,
        new QuotedExpression(this.property.match, { expression: this.property }),
        new ObjectLiteral(this.property.match, {
          properties: [
            new ObjectLiteralMethod(this.statements.match, {
              property: "get",
              statements: this.statements
            })
          ]
        })
      ]
    })
  }
}

/** GetSetDefinition: creates a getter/setter combo for type instances
 * - `thing` is an Expression
 * - `property` is the PropertyLiteral
 * - `get` is a Statement or Expression for the getter
 * - `set` is a Statement or Expression for the setter
 */
export class GetSetDefinition extends PropertyDefinition {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertType("property", PropertyLiteral)
    this.assertType("get", [Statement, Expression], OPTIONAL)
    this.assertType("set", [Statement, Expression], OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  // Return `CoreMethodInvocation` which we'll use to render as JS or component
  @memoize
  get definition() {
    return new CoreMethodInvocation(this.match, {
      method: "define",
      args: [
        this.thing,
        new QuotedExpression(this.property.match, { expression: this.property }),
        new ObjectLiteral(this.property.match, {
          properties: [
            new ObjectLiteralMethod(this.get.match, {
              property: "get",
              statements: this.get
            }),
            new ObjectLiteralMethod(this.statements.match, {
              property: "set",
              args: [this.property],
              statements: this.set
            })
          ]
        })
      ]
    })
  }
}

/** MethodDefinition: creates a method for type instances
 * - `thing` is an Expression (e.g. a ProtypeExpression)
 * - `method` is the method name
 * - `args` ia array of VariableExpressions
 * - `statements` is a Statement or Expression
 */
export class MethodDefinition extends PropertyDefinition {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertType("method", "string")
    this.assertArrayType("args", VariableExpression, OPTIONAL)
    this.assertType("statements", [Statement, Expression], OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
  }
  // Return `CoreMethodInvocation` which we'll use to render as JS or component
  @memoize
  get definition() {
    return new CoreMethodInvocation(this.match, {
      method: "define",
      args: [
        this.thing,
        new QuotedExpression(this.match, this.method),
        new ObjectLiteral(this.match, {
          properties: [
            new ObjectLiteralMethod(this.statements.match, {
              property: "value",
              args: this.args,
              statements: convertStatementsToBlock(this.match, this.statements)
            })
          ]
        })
      ]
    })
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
    this.body = convertStatementsToBlock(this.match, this.statements)
  }
  get className() {
    return `${super.className}${this.method ? " anonymous" : ""}`
  }
  toJS() {
    return `function ${this.method || ""}${this.argsToJS()} ${this.body.toJS()}`
  }
  drawChildren() {
    return (
      <>
        <span className="keyword function">function </span>
        {!!this.method && <span className="method-name">{this.method}</span>}
        {this.drawArgs()}
        {this.body.component}
      </>
    )
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
    // wrap condition in parens if necessary
    if (!(this.condition instanceof ParenthesizedExpression)) {
      this.condition = new ParenthesizedExpression(this.condition.match, { expression: this.condition })
    }
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  toJS() {
    return `if ${this.condition.toJS()} ${this.statements.toJS()}`
  }
  drawChildren() {
    return (
      <>
        <span className="keyword if">if </span>
        <span className="condition">{this.condition.component}</span> {this.statements.component}
      </>
    )
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
    // wrap condition in parens if necessary
    if (!(this.condition instanceof ParenthesizedExpression)) {
      this.condition = new ParenthesizedExpression(this.condition.match, { expression: this.condition })
    }
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  toJS() {
    return `else if ${this.condition.toJS()} ${this.statements.toJS()}`
  }
  drawChildren() {
    return (
      <>
        <span className="keyword else">else </span>
        <span className="keyword if">if </span>
        <span className="condition">{this.condition.component}</span> {this.statements.component}
      </>
    )
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
    return `else ${this.statements.toJS()}`
  }
  drawChildren() {
    return (
      <>
        <span className="keyword else">else </span>
        {this.statements.component}
      </>
    )
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
  drawChildren() {
    return _drawInParens(
      <>
        <span className="condition">{this.condition.component}</span>
        <span className="operator question-mark">{" ? "}</span>
        {this.trueValue.component}
        <span className="operator colon">: </span>
        {this.falseValue.component}
      </>
    )
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
  // Return `spellCore.createElement()` which we'll use to render as JS or component
  @memoize
  get output() {
    const properties = [
      new ObjectLiteralProperty(this.match, {
        property: "tag",
        value: new StringLiteral(this.match, `"${this.tagName}"`)
      })
    ]

    if (this.attrs && this.attrs.length) {
      properties.push(
        new ObjectLiteralProperty(this.match, {
          property: "props",
          value: new ObjectLiteral(this.match, {
            properties: this.attrs.map(attr => attr.output)
          })
        })
      )
    }
    const items = this.children?.length && this.children.map(child => child?.output).filter(Boolean)
    if (items?.length) {
      properties.push(
        new ObjectLiteralProperty(this.match, {
          property: "children",
          value: new ArrayLiteral(this.match, { items, wrap: true })
        })
      )
    }

    return new CoreMethodInvocation(this.match, {
      method: "element",
      args: [new ObjectLiteral(this.match, { properties })]
    })
  }
  toJS() {
    return this.output.toJS()
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
  @memoize
  get output() {
    // If we didn't get a value:
    //  if we have a parse error, return `undefined`
    //  otherwise return `true` as per spec for an empty attribute
    const value = this.value || (this.error ? new UndefinedLiteral(this.match) : new BooleanLiteral(this.match, true))
    return new ObjectLiteralProperty(this.match, {
      property: this.name,
      value,
      error: this.error
    })
  }
  toJS() {
    return this.output.toJS()
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
}

/** JSXText
 * - `value`
 */
export class JSXText extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("value", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
  @memoize
  get output() {
    return new StringLiteral(this.match, this.value)
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
  @memoize
  get output() {
    if (this.error) {
      const expression = this.expression || new NullLiteral(this.match)
      return new ExpressionWithComment(this.match, {
        expression,
        comment: this.error
      })
    }
    return this.expression
  }
}
