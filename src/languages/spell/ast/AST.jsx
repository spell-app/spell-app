/* eslint-disable react/prop-types */
/** AST classes.  These do not necessarily correspond do anyone else's AST. */
import React from "react"
import createUnitTestComponent from "react-unit"
import _get from "lodash/get"

import {
  proto,
  memoize,
  readonly,
  overrideable,
  getSuperHierarchy,
  Assertable,
  OPTIONAL,
  normalizeInitialWhitespace
} from "~/util"
import { Match } from "~/parser"
import * as stringify from "./stringifyAST"
import * as render from "./renderAST"

// TODO: define this in `constants` or some such?
const LEGAL_PROPERTY_IDENTIFIER = /^[a-zA-Z][\w\$]*$/

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
  compile() {
    throw new TypeError(`AST ${this.nodeType} must implement compile()`)
  }

  //-------------------------
  // Rendering as React nodes
  //-------------------------

  /** Return rendered react component which draws this node as syntax-colored Javascript. */
  @memoize
  get component() {
    return render.Node(this)
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
   * Render children to render INSIDE the outer element,
   * which has `node.className` (e.g. `ASTNode Expression StringLiteral`) set.
   */
  renderChildren() {
    return null
  }

  /** TEST: return text from `component` for comparison to `compile()` text */
  get renderedText() {
    const TestComponent = () => this.component
    return createUnitTestComponent(<TestComponent />).text
  }

  // TEST: ensure that `compile()` output is the same as `ast.renderedText`
  test() {
    let compiled
    let rendered
    try {
      compiled = this.compile()
      if (typeof compiled === "string") compiled = normalizeInitialWhitespace(compiled)
    } catch (e) {
      compiled = e
    }
    try {
      rendered = this.renderedText
      if (typeof rendered === "string") rendered = normalizeInitialWhitespace(rendered)
    } catch (e) {
      rendered = e
    }
    if (compiled === rendered) return true
    console.group("Error in Match.test() for ", this)
    console.group("Expected compiled:")
    console.info(compiled)
    console.groupEnd()
    console.group("To match rendered:")
    console.info(rendered)
    console.groupEnd()
    console.groupEnd()
    return false
  }
}

/** Blank line */
export class BlankLine extends ASTNode {
  compile() {
    return "" // "\n"
  }
  renderChildren() {
    return null // render.NEWLINE
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
  compile() {
    return `${this.expression.compile()} ${this.comment.compile()}`
  }
  renderChildren() {
    return (
      <>
        {this.expression.component}
        {render.SPACE}
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
  compile() {
    return stringify.InSingleQuotes({ children: this.expression.compile() })
  }
  renderChildren() {
    return (
      <render.InSingleQuotes>
        <span className="expression">{this.expression.component}</span>
      </render.InSingleQuotes>
    )
  }
}

/** Generic Literal type.  Useful for `instanceof`.
 *  - `value` is the actual JS value, which by default we assume we can just output.
 *  - `raw` (optional) is the raw input value.
 */
export class Literal extends Expression {
  compile() {
    return this.value
  }
  renderChildren() {
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
  compile() {
    return this.value ? "true" : "false"
  }
  renderChildren() {
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
  compile() {
    return "null"
  }
  renderChildren() {
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
  compile() {
    return "undefined"
  }
  renderChildren() {
    return <span className="value">undefined</span>
  }
}

/** ThisLiteral type. */
export class ThisLiteral extends Literal {
  compile() {
    return "this"
  }
  renderChildren() {
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
  @overrideable
  get wrap() {
    return this.items?.length > 2
  }
  compile() {
    const { items, wrap } = this
    return stringify.Array({ items, wrap })
  }
  renderChildren() {
    return <render.Array items={this.items} wrap={this.wrap} />
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
  compile() {
    return stringify.Array({ items: this.enumeration })
  }
  renderChildren() {
    return <render.Array items={this.enumeration} />
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
  compile() {
    const { initialWhitespace = " ", value } = this
    let { commentSymbol = "" } = this
    if (commentSymbol !== "//") commentSymbol = `//${commentSymbol}`
    return `${commentSymbol}${initialWhitespace}${value}`
  }
  get className() {
    return `${super.className}${this.commentSymbol !== "//" ? " header" : ""}`
  }
  renderChildren() {
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
  compile() {
    return `/* ${this.value} */`
  }
  renderChildren() {
    return (
      <>
        <span className="punctuation open-comment-symbol">{"/* "}</span>
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
  @proto annotation = "SPELL:"
  compile() {
    return `/* ${this.annotation} ${this.value} */`
  }
  renderChildren() {
    return (
      <>
        <span className="punctuation open-comment-symbol">{"/* "}</span>
        <span className="annotation">{this.annotation} </span>
        <span className="comment">{this.value}</span>
        <span className="punctuation close-comment-symbol">{" */"}</span>
      </>
    )
  }
}

/** ParseError type.
 *  - `value` is text of the error
 */
export class ParseError extends ParserAnnotation {
  @proto annotation = "PARSE ERROR:"
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
  compile() {
    return stringify.InParens({ children: this.expression.compile() })
  }
  renderChildren() {
    return (
      <render.InParens>
        <span className="expression">{this.expression.component}</span>
      </render.InParens>
    )
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
  compile() {
    return `!${this.expression.compile()}`
  }
  renderChildren() {
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
  compile() {
    return `${this.lhs.compile()} ${this.operator} ${this.rhs.compile()}`
  }
  renderChildren() {
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

export class InvocationArgs extends ASTNode {
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("args", [Expression, MethodBody], OPTIONAL)
    if (this.args) {
      // unwind parenthesized expressions in args
      this.args = this.args.map(arg => {
        while (arg instanceof ParenthesizedExpression) arg = arg.expression
        return arg
      })
    }
  }
  @overrideable
  get wrap() {
    return this.args?.length > 3
  }
  compile() {
    const { args, wrap } = this
    return stringify.Args({ args, wrap })
  }
  renderChildren() {
    return <render.Args args={this.args} wrap={this.wrap} />
  }
}

/** MethodInvocation:  generic named method invocation.
 *  - `method` is method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 * NOTE: this does not ensure that the named method is actually defined in scope!!!!
 */
export class MethodInvocation extends Expression {
  constructor(match, { args, ...props }) {
    super(match, props)
    this.assertType("methodName", "string")
    this.assertType("datatype", "string", OPTIONAL)
    this.args = new InvocationArgs(match, { args })
  }
  compile() {
    return `${this.methodName}${this.args.compile()}`
  }
  renderChildren() {
    return (
      <>
        <span className="method-name">{this.methodName}</span>
        {this.args.component}
      </>
    )
  }
}

/** Call a `method` on some `thing` with `args`.
 *  - `thing` is what we'll call the method on.
 *  - `methodName` is the method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - Try to set `datatype` as string or getter if you can.
 */
export class ScopedMethodInvocation extends MethodInvocation {
  constructor(match, { args, ...props }) {
    super(match, props)
    this.assertType("thing", Expression)
    // `methodName` and `datatype` are handled by MethodInvocation
    this.args = new InvocationArgs(match, { args })
  }
  compile() {
    return `${this.thing.compile()}.${this.methodName}${this.args.compile()}`
  }
  renderChildren() {
    return (
      <>
        <span className="method-scope">{this.thing.component}</span>
        <span className="operator period">.</span>
        <span className="method-name">{this.methodName}</span>
        {this.args.component}
      </>
    )
  }
}

/** ConsoleMethodInvocation
 * - `method` is method name, e.g. `log` or `warn`
 * - `args` is an array of expressions
 */
export class ConsoleMethodInvocation extends ScopedMethodInvocation {
  @proto methodName = "log"
  constructor(match, props) {
    super(match, { ...props, thing: new VariableExpression(match, { name: "console", type: "global" }) })
  }
}

/** CoreMethodInvocation:  calls a `spellCore` `method`.  Used for output languge independence.
 *  - `methodName` is spellcore method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 */
export class CoreMethodInvocation extends ScopedMethodInvocation {
  constructor(match, props) {
    super(match, { ...props, thing: new VariableExpression(match, { name: "spellCore", type: "global" }) })
  }
}

/** ExportInvocation:  `spellCore.addExport(property, value)`
 *  - `property` is string or QuotedString for export name
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 */
export class ExportInvocation extends CoreMethodInvocation {
  constructor(match, props) {
    let { property } = props
    if (typeof property === "string") property = new QuotedExpression(match, property)
    super(match, {
      methodName: "addExport",
      args: [property, props.value]
    })
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
  compile() {
    return `await ${this.method.compile()}`
  }
  renderChildren() {
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
  compile() {
    return this.name
  }
  renderChildren() {
    return <span className="type">{this.name}</span>
  }

  /** Pointer to the known Scope for this type, if available. ??? */
  get scope() {
    return this.match.type
  }
}

/** PrototypeExpression:  type.prototype
 *  * - `type` is a TypeExpression
 */
export class PrototypeExpression extends Expression {
  constructor(match, props) {
    super(match, props)
    if (typeof this.type === "string") this.type = new TypeExpression(match, { name: this.type })
    this.assertType("type", TypeExpression)
  }
  compile() {
    const { type } = this
    return `${type.compile()}.prototype`
  }
  renderChildren() {
    return (
      <>
        {this.type.component}
        <span className="operator period">.</span>
        <span className="keyword prototype">{"prototype"}</span>
      </>
    )
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
  compile() {
    if (this.default) return `${this.name} = ${this.default.compile()}`
    return this.name
  }
  get className() {
    const classes = [super.className]
    if (this.type) classes.push(this.type)
    if (this.variable?.kind && !classes.includes(this.variable.kind)) classes.push(this.variable.kind)
    return classes.join(" ")
  }
  renderChildren() {
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
  compile() {
    return this.output
  }
  renderChildren() {
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
  compile() {
    if (this.isLegalIdentifier) return this.value
    return stringify.InSingleQuotes({ children: this.value })
  }
  get className() {
    return `${super.className} ${this.isLegalIdentifier ? "legal-identifier" : "non-legal-identifier"}`
  }
  renderChildren() {
    const value = <span className="property">{this.value}</span>
    return this.isLegalIdentifier ? value : <render.InSingleQuotes>{value}</render.InSingleQuotes>
  }
}

/** PropertyExpression -- named property of some object.
 *  - `object` is the thing to get the property from, as an Expression.
 *  - `property` is the normalized property name or PropertyLiteral.
 *  TODO: datatype???
 */
export class PropertyExpression extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("object", Expression)
    if (typeof this.property === "string") this.property = new PropertyLiteral(this.match, this.property)
    this.assertType("property", PropertyLiteral)
  }
  compile() {
    const prop = this.property.compile()
    if (this.property.isLegalIdentifier) return `${this.object.compile()}.${prop}`
    return `${this.object.compile()}['${prop}']`
  }
  renderChildren() {
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
        <render.InSquareBrackets>{this.property.component}</render.InSquareBrackets>
      </>
    )
  }
}

/** ObjectLiteralProperty type
 *  - `property` is the normalized property name.
 *  - `value` (optional) is the property value.
 *  - `error` (optional) is a parse error associated with this property
 */
export class ObjectLiteralProperty extends ASTNode {
  constructor(match, props) {
    super(match, props)
    if (typeof this.property === "string") this.property = new PropertyLiteral(this.match, this.property)
    this.assertType("property", PropertyLiteral)
    this.assertType("value", Expression, OPTIONAL)
    this.assertType("error", ParseError, OPTIONAL)
    // this.assert(this.property.isLegalIdentifier || !!this.value, "Non-legal identifiers must specify a value!")
  }
  compile() {
    const error = this.error ? ` ${this.error.compile()}` : ""
    const prop = this.property.compile()
    // If no value, assume it's available as a local variable.
    if (!this.value) return `${prop}${error}`
    return `${prop}: ${this.value.compile()}${error}`
  }
  renderError() {
    if (!this.error) return null
    return (
      <>
        {render.SPACE}
        {this.error.component}
      </>
    )
  }
  renderChildren() {
    // If no value, assume it's available as a local variable.
    const value = !!this.value && (
      <>
        <span className="operator colon">: </span>
        <span className="value">{this.value.component}</span>
      </>
    )
    return (
      <>
        {<span className="property">{this.property.component}</span>}
        {value}
        {this.renderError()}
      </>
    )
  }
}

/** ObjectLiteralMethod type, eg: `{ foo(arg, arg) {...} }`
 *  - `property` is the normalized property name.
 *  - `method` is MethodBody to use.
 *  - `error` (optional) is a syntax error associated with this property
 */
export class ObjectLiteralMethod extends ObjectLiteralProperty {
  constructor(match, props) {
    super(match, props)
    // `property` and `error` will be set up by ObjectLiteralProperty
    this.assertType("method", MethodBody)
  }
  compile() {
    const error = this.error ? ` ${this.error.compile()}` : ""
    if (this.method.inline) return `${this.property.compile()}: ${this.method.compile()}${error}`
    return `${this.property.compile()}${this.method.compile()}${error}`
  }
  renderChildren() {
    if (this.method.inline) {
      return (
        <>
          {this.property.component}
          <span className="operator colon">: </span>
          {this.method.component}
          {this.renderError()}
        </>
      )
    }
    return (
      <>
        {this.property.component}
        {this.method.component}
        {this.renderError()}
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
    this.assertType("wrap", "boolean", OPTIONAL)
  }
  addProp(property, value) {
    // convert string value to StringLiteral
    if (typeof value === "string") value = new StringLiteral(this.match, { value })
    this.assert(value instanceof Expression, `AST.ObjectLiteral.addProp(${property}): value must be an Expression`)
    if (!this.properties) this.properties = []
    this.properties.push(new ObjectLiteralProperty(this.match, { property, value }))
  }
  addMethod(property, method) {
    if (!this.properties) this.properties = []
    this.assert(method instanceof MethodBody, `AST.ObjectLiteral.addMethod(${property}): method must be a MethodBody`)
    this.properties.push(new ObjectLiteralMethod(method.match, { property, method }))
  }
  // Should we wrap properties block?
  @overrideable
  get wrap() {
    return this.properties?.length > 2 || this.properties?.some(item => item instanceof ObjectLiteralMethod)
  }
  compile() {
    const { wrap } = this
    const delimiter = wrap ? stringify.INDENTED_COMMA : stringify.SPACED_COMMA
    return stringify.Block({
      wrap,
      space: !wrap,
      children: stringify.List({ items: this.properties, delimiter })
    })
  }
  renderChildren() {
    if (!this.properties || !this.properties.length) return render.EMPTY_BLOCK
    const { wrap } = this
    const delimiter = wrap ? render.INDENTED_COMMA : render.SPACED_COMMA
    return (
      <render.Block wrap={wrap} space={!wrap}>
        <render.List items={this.properties} delimiter={delimiter} />
      </render.Block>
    )
  }
}

/** Statement abstract type. */
export class Statement extends ASTNode {}

/** StatementGroup -- set of random statements which does NOT get indented with curly braces!
 * NOTE: you can use this interchangably whenever something takes a single `Statement`.
 *  - `statements` is a list of Statements.
 */
export class StatementGroup extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("statements", [Statement, Expression, Comment, BlankLine], OPTIONAL)
  }
  compile() {
    return stringify.List({ items: this.statements, delimiter: stringify.NEWLINE })
  }
  renderChildren() {
    return <render.List items={this.statements} delimiter={render.NEWLINE} />
  }
}

/** StatementBlock -- set of statements which outputs with curly braces around.
 *  - `statements` is a list of Statements.
 */
export class StatementBlock extends ASTNode {
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
  compile() {
    return stringify.Block({
      wrap: this.wrap,
      children: stringify.List({
        items: this.statements,
        delimiter: stringify.NEWLINE
      })
    })
  }
  renderChildren() {
    if (!this.statements || !this.statements.length) return render.EMPTY_BLOCK
    return (
      <render.Block wrap={this.wrap}>
        <render.List items={this.statements} delimiter={render.INDENTED_NEWLINE} />
      </render.Block>
    )
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
  compile() {
    const { thing, value, isNewVariable } = this
    const declarator = isNewVariable ? "let " : ""
    return `${declarator}${thing.compile()} = ${value.compile()}`
  }
  get className() {
    return `${super.className}${this.isNewVariable ? " declaration" : ""}`
  }
  renderChildren() {
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
  compile() {
    const declarator = this.isNewVariable ? "let " : ""
    const vars = stringify.InCurlies({
      space: true,
      children: stringify.List({
        items: this.variables
      })
    })
    return `${declarator}${vars} = ${this.thing.compile()}`
  }
  get className() {
    return `${super.className}${this.isNewVariable ? " declaration" : ""}`
  }
  renderChildren() {
    return (
      <>
        {this.isNewVariable && <span className="keyword declarator">let </span>}
        <render.InCurlies space>
          <render.List items={this.variables} />
        </render.InCurlies>
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
  compile() {
    if (!this.value) return "return"
    return `return ${this.value.compile()}`
  }
  renderChildren() {
    return (
      <>
        <span className="keyword return">{"return "}</span>
        {this.value && <span className="value">{this.value.component}</span>}
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
  }
  compile() {
    const { type, superType } = this
    const superDeclarator = superType ? `extends ${superType.name} ` : ""
    return `export class ${type.name} ${superDeclarator}{}`
  }
  renderChildren() {
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
        {render.SPACE}
        {render.EMPTY_BLOCK}
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
  compile() {
    const props = stringify.InParens({ children: this.props?.compile() })
    return `new ${this.type.compile()}${props}`
  }
  renderChildren() {
    const props = this.props ? <render.InParens>{this.props.component}</render.InParens> : render.EMPTY_PARENS
    return (
      <>
        <span className="keyword new">{"new "}</span>
        <span className="type">{this.type.component}</span>
        {props}
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
  compile() {
    return stringify.InSquareBrackets({
      children: stringify.List({ items: this.items })
    })
  }
  renderChildren() {
    return (
      <render.InSquareBrackets>
        <render.List items={this.items} />
      </render.InSquareBrackets>
    )
  }
}

/**
 * PropertyDefinition: `spellCore.define(thing, property, {...})`
 * - `thing` (required) is an Expression
 * - `property` (required) is PropertyLiteral or string
 * - `value` (optional) is an Expression
 * - `initializer` (optional) is an initializer method body
 * - `get` (optional) is a method body
 * - `set` (optional)  is a method body for `setter` (with arg `property`)
 * Define `@memoize get definition()` to return `spellCore.define()` statement.
 */
export class PropertyDefinition extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    if (typeof this.property === "string") this.property = new PropertyLiteral(this.match, this.property)
    this.assertType("property", PropertyLiteral)
    this.assertType("value", [Expression, MethodBody], OPTIONAL)
    this.assertType("initializer", [StatementBlock, Statement, Expression], OPTIONAL)
    this.assertType("get", [StatementBlock, Statement, Expression], OPTIONAL)
    this.assertType("set", [StatementBlock, Statement, Expression], OPTIONAL)
  }
  // Return `CoreMethodInvocation` which we'll use to render as JS or component
  @memoize
  get definition() {
    const { match, thing, property, value, get, set, initializer } = this
    const propName = new QuotedExpression(property.match, { expression: property })

    const descriptor = new ObjectLiteral(match)
    if (value) {
      if (value instanceof MethodBody) descriptor.addMethod("value", value)
      else descriptor.addProp("value", value)
    }
    if (initializer)
      descriptor.addMethod("initializer", new MethodBody(initializer.match, { body: initializer, inline: false }))
    if (get) descriptor.addMethod("get", new MethodBody(get.match, { body: get, inline: false }))
    if (set) descriptor.addMethod("set", new MethodBody(set.match, { args: [property], body: set, inline: false }))

    return new CoreMethodInvocation(match, {
      methodName: "define",
      args: [thing, propName, descriptor]
    })
  }
  compile() {
    return this.definition.compile()
  }
  renderChildren() {
    return this.definition.component
  }
}

/**
 * Args + method body, NOT including method name or `function` keyword.
 * - `args` ia array of VariableExpressions
 * - `body` is:
 *    - a single Statement or StatementGroup
 *    - a StatementBlock
 *    - an Expression
 *  - `inline` is:
 *    - `true` we'll make a fat arrow function
 *    - `false` we explicitly WILL NOT make a fat arrow function
 *    - `undefined` we'll make a fat arrow function if you pass an `Expression`
 */
export class MethodBody extends ASTNode {
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("args", VariableExpression, OPTIONAL)
    this.assertType("body", [StatementBlock, Statement, Expression], OPTIONAL)
    // If we got an `Expression,` assume `inline` unless we were told otherwise.
    if (this.inline === undefined && this.body instanceof Expression) this.inline = true
    this.assertType("inline", "boolean", OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)

    // Default `body` to empty StatementBlock
    if (!this.body) {
      this.body = new StatementBlock(match)
    }
    // convert Statement/StatementGroup to StatementBlock
    else if (this.body instanceof Statement) {
      this.body = new StatementBlock(match, {
        statements: [this.body]
      })
    }
    // convert non-inline Expression to `return <expression>` StatementBlock
    else if (this.body instanceof Expression && !this.inline) {
      this.body = new StatementBlock(match, {
        statements: [new ReturnStatement(match, { value: this.body })]
      })
    }
  }
  compile() {
    const args = stringify.Args({ args: this.args })
    const operator = this.inline ? " => " : " "
    return `${args}${operator}${this.body.compile()}`
  }
  renderChildren() {
    const operator = this.inline ? <span className="operator fat-arrow">{" => "}</span> : render.SPACE
    return (
      <>
        <render.Args args={this.args} />
        {operator}
        {this.body.component}
      </>
    )
  }
}

/** FunctionDeclaration: creates a function instance
 * - `methodName` is the method name
 * - `method` is MethodBody (args + body)
 */
export class FunctionDeclaration extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertType("methodName", "string", OPTIONAL)
    this.assertType("method", MethodBody)
  }
  get className() {
    return `${super.className}${this.methodName ? " anonymous" : ""}`
  }
  compile() {
    return `function ${this.methodName || ""}${this.method.compile()}`
  }
  renderChildren() {
    return (
      <>
        <span className="keyword function">function </span>
        {!!this.methodName && <span className="method-name">{this.methodName}</span>}
        {this.method.component}
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
  compile() {
    return `if ${this.condition.compile()} ${this.statements.compile()}`
  }
  renderChildren() {
    return (
      <>
        <span className="keyword if">if </span>
        <span className="condition">{this.condition.component}</span>
        {render.SPACE}
        {this.statements.component}
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
  compile() {
    return `else if ${this.condition.compile()} ${this.statements.compile()}`
  }
  renderChildren() {
    return (
      <>
        <span className="keyword else">else </span>
        <span className="keyword if">if </span>
        <span className="condition">{this.condition.component}</span>
        {render.SPACE}
        {this.statements.component}
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
  compile() {
    return `else ${this.statements.compile()}`
  }
  renderChildren() {
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
  compile() {
    const { condition, trueValue, falseValue } = this
    return stringify.InParens({ children: `${condition.compile()} ? ${trueValue.compile()} : ${falseValue.compile()}` })
  }
  renderChildren() {
    return (
      <render.InParens>
        <span className="condition">{this.condition.component}</span>
        <span className="operator question-mark">{" ? "}</span>
        {this.trueValue.component}
        <span className="operator colon"> : </span>
        {this.falseValue.component}
      </render.InParens>
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

    const attrs =
      this.attrs &&
      this.attrs.length &&
      new ObjectLiteral(this.match, {
        properties: this.attrs.map(attr => attr.output)
      })
    if (attrs) {
      properties.push(
        new ObjectLiteralProperty(this.match, {
          property: "props",
          value: attrs
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
      methodName: "element",
      args: [new ObjectLiteral(this.match, { properties, wrap: attrs?.wrap || false })]
    })
  }
  compile() {
    return this.output.compile()
  }
  renderChildren() {
    return this.output.component
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
    this.assertType("value", [Expression, MethodBody], OPTIONAL)
    this.assertType("error", ParseError, OPTIONAL)
  }
  @memoize
  get output() {
    // If we didn't get a value:
    //  if we have a parse error, return `undefined`
    //  otherwise return `true` as per spec for an empty attribute
    const value = this.value || (this.error ? new UndefinedLiteral(this.match) : new BooleanLiteral(this.match, true))
    if (value instanceof MethodBody) {
      return new ObjectLiteralMethod(this.match, {
        property: this.name,
        method: value,
        error: this.error
      })
    }
    return new ObjectLiteralProperty(this.match, {
      property: this.name,
      value,
      error: this.error
    })
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
