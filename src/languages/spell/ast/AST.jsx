/** AST classes.  These do not necessarily correspond do anyone else's AST. */
import React from "react"
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
import { Match, MethodScope } from "~/parser"
import * as stringify from "./stringifyAST"
import * as render from "./renderAST"
import { mount } from "./enzyme-setup"

// TODO: define this in `constants` or some such?
const LEGAL_PROPERTY_IDENTIFIER = /^[a-zA-Z][\w\$]*$/
function isLegalIdentifier(value) {
  return LEGAL_PROPERTY_IDENTIFIER.test(value)
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
      .map((constructor) => constructor.name)
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
    const component = mount(this.component)
    return component.text()
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
    return render.Fragment(this.expression.component, render.SPACE, this.comment.component)
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

/**
 * QuotedExpression -- use to wrap `expression` in single quotes.
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

/**
 * BackTickExpression -- use to wrap `expression` AST in back-ticks.
 */
export class BackTickExpression extends Expression {
  @proto @readonly datatype = "string"
  constructor(match, props) {
    if (typeof props === "string") props = { expression: new StringLiteral(match, { value: props }) }
    super(match, props)
    this.assertType("expression", Expression)
  }
  compile() {
    return stringify.InBackTicks({ children: this.expression.compile() })
  }
  renderChildren() {
    return (
      <render.InBackTicks>
        <span className="expression">{this.expression.component}</span>
      </render.InBackTicks>
    )
  }
}

/**
 * TripleBackTickExpression -- use to wrap `expression` AST in triple-back-ticks.
 */
export class TripleBackTickExpression extends Expression {
  @proto @readonly datatype = "string"
  constructor(match, props) {
    if (typeof props === "string") props = { expression: new StringLiteral(match, { value: props }) }
    super(match, props)
    this.assertType("expression", Expression)
  }
  compile() {
    return stringify.InTripleBackTicks({ children: this.expression.compile() })
  }
  renderChildren() {
    return (
      <render.InTripleBackTicks>
        <span className="expression">{this.expression.component}</span>
      </render.InTripleBackTicks>
    )
  }
}

/** AwaitExpression:  `await {expression}`.
 *  - `expression` is Expression to await.
 * NOTE: this marks the `parentScope` as asynchronous!!!
 */
export class AwaitExpression extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertType("expression", Expression)
    // Work our way up the scope chain
    // -- if we find a MethodScope, mark it as asynchronous
    let scope = this.parentScope
    while (scope && !(scope instanceof MethodScope)) scope = scope.scope
    if (scope instanceof MethodScope) {
      scope.async = true
    }
  }
  compile() {
    return `await ${this.expression.compile()}`
  }
  renderChildren() {
    return render.Fragment(render.AWAIT, this.expression.component)
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
    return render.Fragment(
      <span className="punctuation line-comment-symbol">{commentSymbol}</span>,
      <span className="whitespace">{this.initialWhitespace || " "}</span>,
      <span className="comment">{this.value}</span>
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
    return render.Fragment(render.OPEN_COMMENT, <span className="comment">{this.value}</span>, render.CLOSE_COMMENT)
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
    return render.Fragment(
      render.OPEN_COMMENT,
      <span className="annotation">{this.annotation} </span>,
      <span className="comment">{this.value}</span>,
      render.CLOSE_COMMENT
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
    return render.Fragment(render.BANG, <span className="expression">{this.expression.component}</span>)
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
    return render.Fragment(
      <span className="lhs">{this.lhs.component}</span>,
      <span className="operator"> {this.operator} </span>,
      <span className="rhs">{this.rhs.component}</span>
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

/** InvocationArgs:  generic named method invocation.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `wrap` (optional) is return datatype as string, try to set if you can.
 * NOTE: this does not ensure that the named method is actually defined in scope!!!!
 */
export class InvocationArgs extends ASTNode {
  constructor(match, { wrap, ...props }) {
    super(match, props)
    if (typeof wrap === "boolean") this.wrap = wrap
    this.assertArrayType("args", Expression, OPTIONAL)
    if (this.args) {
      // unwind parenthesized expressions in args
      this.args = this.args.map((arg) => {
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
 *  - `methodName` is method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 *  - `wrap` (optional) set to control arg wrapping explicitly
 * NOTE: this does not ensure that the named method is actually defined in scope!!!!
 */
export class MethodInvocation extends Expression {
  constructor(match, { args, wrap, ...props }) {
    super(match, props)
    this.assertType("methodName", "string")
    this.assertType("datatype", "string", OPTIONAL)
    this.args = new InvocationArgs(match, { args, wrap })
  }
  compile() {
    return `${this.methodName}${this.args.compile()}`
  }
  renderChildren() {
    return render.Fragment(<span className="method-name">{this.methodName}</span>, this.args.component)
  }
}

/** Call a `method` on some `thing` with `args`.
 *  - `thing` is what we'll call the method on.
 *  - `methodName` is the method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - Try to set `datatype` as string or getter if you can.
 */
export class ScopedMethodInvocation extends MethodInvocation {
  constructor(match, props) {
    super(match, props)
    // `methodName`, `args`, wrap` and `datatype` are handled by MethodInvocation
    this.assertType("thing", Expression)
  }
  compile() {
    return `${this.thing.compile()}.${this.methodName}${this.args.compile()}`
  }
  renderChildren() {
    return render.Fragment(
      <span className="method-scope">{this.thing.component}</span>,
      <span className="operator period">.</span>,
      <span className="method-name">{this.methodName}</span>,
      this.args.component
    )
  }
}

/** ConsoleMethodInvocation
 * - `methodName` is method name, e.g. `log` or `warn`
 * - `args` is an array of expressions
 */
export class ConsoleMethodInvocation extends ScopedMethodInvocation {
  @proto methodName = "log"
  @proto echoInTests = false
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

/** ExpectMethodInvocation:  `spellCore.expect(...)`
 *  - `expression` is expression AST
 *  - `expressionString` is string for spell code used to generate expression
 *  - `value` (optional) is value to match AST
 *  - `valueString` (optional) is string for spell code used to generate value
 */
export class ExpectMethodInvocation extends CoreMethodInvocation {
  @proto methodName = "expect"
  @proto echoInTests = false
  constructor(match, props) {
    const { expression, expressionString, value, valueString } = props
    const args = [expression, new StringLiteral(match, "`" + expressionString + "`")]
    if (value) args.push(value, new StringLiteral(match, "`" + valueString + "`"))
    return super(match, { args, wrap: false })
  }
}
/** EchoMethodInvocation:  `spellCore.echo(...)`
 *  - `message` is string to ouput
 */
export class EchoInvocation extends CoreMethodInvocation {
  @proto echoInTests = false
  constructor(match, props) {
    let { expression, methodName = "echo" } = props
    if (typeof expression === "string") expression = new StringLiteral(match, "`" + expression + "`")
    return super(match, { methodName, args: [expression] })
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
    return render.Fragment(this.type.component, render.PERIOD, render.PROTOTYPE)
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
    return render.Fragment(
      <span className="name">{this.name}</span>,
      render.EQUALS,
      <span className="default">{this.default.component}</span>
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

/**
 * Method Definition
 * TODOC
 * - `args` (optional) is array of VariableExpressions
 * - `body` (optional) is:
 *    - a single Statement or StatementGroup
 *    - a StatementBlock
 *    - an Expression
 *    Note that we'll ALWAYS convert `body` to a StatementBlock on construction
 *    so you can change it by manipulating `body.statements`, e.g. `methodBody.body.statements.push(...)`
 *  - `inline` (optional) set to `true` to make a fat arrow function
 *  - `asProperty` (optional) set to `true` to use object literaly property syntax
 *                 Note: this is done automatically by `ObjectLiteral.addMethod()`.
 *  - `async` (optional) set to `true` to force the method to be async
 *            if not set, we'll use `match.nestedScope.async`
 */
export class MethodDefinition extends Expression {
  constructor(match, props) {
    super(match, props)
    this.assertArrayType("args", VariableExpression, OPTIONAL)
    this.assertType("body", [StatementBlock, Statement, Expression], OPTIONAL)
    this.assertType("inline", "boolean", OPTIONAL)
    this.assertType("asProperty", "boolean", OPTIONAL)
    this.assertType("methodName", "string", OPTIONAL)
    this.assertType("error", ParseError, OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
    this.assertType("async", "boolean", OPTIONAL)

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
    else if (this.body instanceof Expression) {
      this.body = new StatementBlock(match, {
        statements: [new ReturnStatement(match, { value: this.body })]
      })
    }
    // Make sure we body ends up as a StatementBlock
    this.assertType("body", StatementBlock)
    // ALWAYS wrap the body
    this.body.wrap = true
  }
  get isAsync() {
    if (typeof this.async === "boolean") return this.async
    return !!this.match.nestedScope?.async
  }
  getMethodName() {
    const { methodName } = this
    if (!methodName) return ""
    if (this.asProperty && !isLegalIdentifier(methodName)) return `'${methodName}'`
    return methodName
  }
  compile() {
    const async = this.isAsync ? "async " : ""
    const args = stringify.Args({ args: this.args })
    const error = this.error ? ` ${this.error.compile()}` : ""
    const body = this.body.compile()

    const methodName = this.getMethodName()
    if (this.asProperty) {
      if (!methodName) console.warn("MethodDef: property missing methodName", this)
      if (this.inline) return `${async}${methodName}: ${args} => ${body}${error}`
      return `${async}${methodName}${args} ${body}${error}`
    }

    // normal method
    if (this.inline) return `${async}${args} => ${body}${error}`
    return `${async}function ${methodName}${args} ${body}${error}`
  }
  renderError() {
    if (!this.error) return null
    return render.Fragment(
      <>
        {render.SPACE}
        {this.error.component}
      </>
    )
  }
  renderChildren() {
    const async = this.isAsync && render.ASYNC
    const methodName = !!this.methodName && <span className="method-name">{this.getMethodName()}</span>
    const args = <render.Args args={this.args} />
    const body = this.body.component
    const error = !!this.error && render.Fragment(render.SPACE, this.error.component)
    if (this.asProperty) {
      if (!methodName) console.warn("MethodDef: property missing methodName", this)
      if (this.inline)
        return render.Fragment(async, methodName, render.COLON_AND_SPACE, args, render.FAT_ARROW, body, error)
      return render.Fragment(async, methodName, args, render.SPACE, body, error)
    }
    // normal method
    if (this.inline) return render.Fragment(async, args, render.FAT_ARROW, body, error)
    return render.Fragment(async, render.FUNCTION, methodName, args, render.SPACE, body, error)
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
    return isLegalIdentifier(this.value)
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
      return render.Fragment(object, render.PERIOD, this.property.component)
    }
    return render.Fragment(object, <render.InSquareBrackets>{this.property.component}</render.InSquareBrackets>)
  }
}

/** ObjectLiteral -- bag of properties.
 *  - `properties` is an array of PropertyValues
 * TODO: datatype???
 */
export class ObjectLiteral extends Expression {
  @proto @readonly datatype = "object"
  constructor(match, { properties, ...props } = {}) {
    super(match, props)
    this.properties = []
    this.assertType("wrap", "boolean", OPTIONAL)

    // validate any properties passed in
    if (properties)
      properties.forEach((property) => {
        if (property instanceof ObjectLiteralProperty) {
          this.properties.push(property)
        } else if (property instanceof MethodDefinition) {
          this.assert(
            property.methodName,
            "new AST.ObjectLiteral(): MethodDefinition must specify methodName",
            property
          )
          property.asProperty = true
          this.properties.push(property)
        } else {
          this.assert(false, `new AST.ObjectLiteral(): invalid property`, property)
        }
      })
  }
  // Should we wrap properties block?
  @overrideable
  get wrap() {
    return this.properties.length > 2 || this.properties.some((item) => item instanceof MethodDefinition)
  }
  addProp(property, value) {
    // convert string value to StringLiteral
    if (typeof value === "string") value = new StringLiteral(this.match, { value })
    this.assert(
      value instanceof Expression,
      `AST.ObjectLiteral.addProp(${property}): value must be an Expression`,
      value
    )
    this.properties.push(new ObjectLiteralProperty(this.match, { property, value }))
  }
  addMethod(property, method) {
    this.assert(
      method instanceof MethodDefinition,
      `AST.ObjectLiteral.addMethod(${property}): method must be a MethodDefinition`,
      method
    )
    method.methodName = property
    method.asProperty = true
    this.properties.push(method)
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
    if (!this.properties.length) return render.EMPTY_BLOCK
    const { wrap } = this
    const delimiter = wrap ? render.INDENTED_COMMA : render.SPACED_COMMA
    return (
      <render.Block wrap={wrap} space={!wrap}>
        <render.List items={this.properties} delimiter={delimiter} />
      </render.Block>
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
  renderChildren() {
    // If no value, assume it's available as a local variable.
    const value =
      !!this.value && render.Fragment(render.COLON_AND_SPACE, <span className="value">{this.value.component}</span>)
    const error = !!this.error && render.Fragment(render.SPACE, this.error.component)
    return render.Fragment(<span className="property">{this.property.component}</span>, value, error)
  }
}

/** Statement abstract type. */
export class Statement extends ASTNode {}

/** StatementGroup -- set of random statements which does NOT get indented with curly braces!
 * NOTE: you can use this interchangably whenever something takes a single `Statement`.
 *  - `statements` is a list of Statements.
 */
export class StatementGroup extends Statement {
  @proto echoInTests = false
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
 *  - `statements` (optional) is a list of Statements etc.
 *  - `wrap` (optional) set to explicitly control block wrapping.
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
  @overrideable
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

/**
 * try...catch...finally
 */
export class TryCatchBlock extends StatementGroup {
  constructor(match, props) {
    super(match, props)
    this.assertType("body", [StatementBlock, Statement, Expression])
    this.assertType("errorArg", ["string", VariableExpression], OPTIONAL)
    this.assertType("catchBlock", [StatementBlock, Statement, Expression], OPTIONAL)
    this.assertType("finallyBlock", [StatementBlock, Statement, Expression], OPTIONAL)
    this.assert(this.catchBlock || this.finallyBlock, "You must provide at least one catchBlock or finallyBlock")

    if (typeof this.errorArg === "string") this.errorArg = new VariableExpression(match, { name: this.errorArg })
    this.body = convertStatementsToBlock(this.match, this.body)
    this.body.wrap = true
    if (this.catchBlock) {
      this.catchBlock = convertStatementsToBlock(this.catchBlock.match, this.catchBlock)
      this.catchBlock.wrap = true
    }
    if (this.finallyBlock) {
      this.finallyBlock = convertStatementsToBlock(this.finallyBlock.match, this.finallyBlock)
      this.finallyBlock.wrap = true
    }
  }
  compile() {
    const { body, errorArg, catchBlock, finallyBlock } = this
    const output = [`try ${body.compile()}`]
    if (catchBlock) output.push(`catch (${errorBlock.compile()}) ${catchBlock.compile()}`)
    if (finallyBlock) output.push(`finally ${finallyBlock.compile()}`)
    return output.join("\n")
  }
  renderChildren() {
    const { body, errorArg, catchBlock, finallyBlock } = this
    const output = [render.TRY, <span className="try-block">{body.component}</span>]
    if (catchBlock)
      output.push(render.NEWLINE, render.CATCH, <span className="catch-block">{catchBlock.component}</span>)
    if (finallyBlock)
      output.push(render.NEWLINE, render.FINALLY, <span className="finally-block">{finallyBlock.component}</span>)
    return render.Fragment(...output)
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
    return render.Fragment(
      !!this.isNewVariable && render.LET,
      <span className="thing">{this.thing.component}</span>,
      render.EQUALS,
      <span className="value">{this.value.component}</span>
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
    return render.Fragment(
      !!this.isNewVariable && render.LET,
      <render.InCurlies space>
        <render.List items={this.variables} />
      </render.InCurlies>,
      render.EQUALS,
      <span className="thing">{this.thing.component}</span>
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
    const value = !!this.value && render.Fragment(render.SPACE, <span className="value">{this.value.component}</span>)
    return render.Fragment(render.RETURN, value)
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
    return render.Fragment(
      render.EXPORT,
      render.CLASS,
      <span className="type">{this.type.component}</span>,
      !!this.superType && render.EXTENDS,
      !!this.superType && <span className="superType">{this.superType.component}</span>,
      render.SPACE,
      render.EMPTY_BLOCK
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
    return render.Fragment(render.NEW, <span className="type">{this.type.component}</span>, props)
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
 * - `initializer` (optional) is an initializer MethodDefintion
 * - `get` (optional) is a MethodDefintion for property `getter`
 * - `set` (optional)  is a MethodDefintion for `setter` (which should specify `arg`)
 * Define `@memoize get definition()` to return `spellCore.define()` statement.
 */
export class PropertyDefinition extends Statement {
  constructor(match, props) {
    super(match, props)
    this.assertType("thing", Expression)
    if (typeof this.property === "string") this.property = new PropertyLiteral(this.match, this.property)
    this.assertType("property", PropertyLiteral)
    this.assertType("value", Expression, OPTIONAL)
    this.assertType("initializer", MethodDefinition, OPTIONAL)
    this.assertType("get", MethodDefinition, OPTIONAL)
    this.assertType("set", MethodDefinition, OPTIONAL)
  }
  // Return `CoreMethodInvocation` which we'll use to render as JS or component
  @memoize
  get definition() {
    const { match, thing, property, value, get, set, initializer } = this
    const propName = new QuotedExpression(property.match, { expression: property })

    const descriptor = new ObjectLiteral(match)
    if (value) {
      if (value instanceof MethodDefinition) descriptor.addMethod("value", value)
      else descriptor.addProp("value", value)
    }
    if (initializer) descriptor.addMethod("initializer", initializer)
    if (get) descriptor.addMethod("get", get)
    if (set) descriptor.addMethod("set", set)

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
    return render.Fragment(
      render.IF,
      <span className="condition">{this.condition.component}</span>,
      render.SPACE,
      this.statements.component
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
    return render.Fragment(
      render.ELSE,
      render.IF,
      <span className="condition">{this.condition.component}</span>,
      render.SPACE,
      this.statements.component
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
    return render.Fragment(render.ELSE, this.statements.component)
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
        {render.TERNARY_QUESTION}
        {this.trueValue.component}
        {render.TERNARY_COLON}
        {this.falseValue.component}
      </render.InParens>
    )
  }
}

/**
 * Start a `name`d process (or animation).
 * - `name` (string) is the process name
 * - `exclusive` (boolean, optional) if `true`, the process can only be run once at a time
 */
export class StartProcessInvocation extends StatementGroup {
  constructor(match, { name, exclusive = false, ...props }) {
    super(match, props)
    this.statements = []
    const nameArg = new QuotedExpression(match, name)
    const args = [nameArg]
    if (exclusive) args.push(new QuotedExpression(match, "EXCLUSIVE"))

    if (exclusive) {
      this.statements.push(
        new IfStatement(match, {
          condition: new CoreMethodInvocation(match, {
            methodName: "processIsRunning",
            args: [nameArg]
          }),
          statements: new ReturnStatement(match)
        })
      )
    }
    this.statements.push(
      new CoreMethodInvocation(match, {
        methodName: "startProcess",
        args
      })
    )
  }
}

/**
 * Stop a `name`d process (or animation).
 * - `name` (string) is the process name
 */
export class StopProcessInvocation extends CoreMethodInvocation {
  constructor(match, { name }) {
    super(match, {
      methodName: "stopProcess",
      args: [new QuotedExpression(match, name)]
    })
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
        properties: this.attrs.map((attr) => attr.output)
      })
    if (attrs) {
      properties.push(
        new ObjectLiteralProperty(this.match, {
          property: "props",
          value: attrs
        })
      )
    }
    const items = this.children?.length && this.children.map((child) => child?.output).filter(Boolean)
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
    this.assertType("value", Expression, OPTIONAL)
    this.assertType("error", ParseError, OPTIONAL)
  }
  @memoize
  get output() {
    // If we didn't get a value:
    //  if we have a parse error, return `undefined`
    //  otherwise return `true` as per spec for an empty attribute
    const value = this.value || (this.error ? new UndefinedLiteral(this.match) : new BooleanLiteral(this.match, true))
    if (value instanceof MethodDefinition) {
      value.asProperty = true
      value.methodName = this.name
      if (this.error) value.error = this.error
      return value
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
