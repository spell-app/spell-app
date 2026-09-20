/** AST classes.  These do not necessarily correspond do anyone else's AST. */

import { getSuperHierarchy, Assertable, OPTIONAL } from "~/util"
import { P } from "~/parser"

import * as stringify from "./stringifyAST"
import * as render from "./renderAST"

////////////////
// ## Helpers
////////////////

// TODO: define this in `constants` or some such?
/** Regex for a string that is legal as a bare (unquoted) JS property identifier. */
const LEGAL_PROPERTY_IDENTIFIER = /^[a-zA-Z][\w$]*$/

/** `true` if `value` can be used as a bare JS property/identifier name without quoting. */
function isLegalIdentifier(value: string): boolean {
  return LEGAL_PROPERTY_IDENTIFIER.test(value)
}

/**
 * Normalize `statements` (single `Statement`, already-built `StatementBlock`, or array) into one
 * `StatementBlock`.
 * - Used by anything that accepts a loose statement/array of statements for its body, e.g.
 *   `IfStatement`, `TryCatchBlock`.
 */
function convertStatementsToBlock(
  match: P.AnyMatch,
  statements: Statement | StatementBlock | Statement[] | undefined
): StatementBlock {
  if (!statements) return new StatementBlock(match)
  if (statements instanceof StatementBlock) return statements
  if (Array.isArray(statements)) return new StatementBlock(match, { statements })
  return new StatementBlock(match, { statements: [statements] })
}

////////////////
// ## Base Node
////////////////

/**
 * Abstract root of all AST node types.
 * - TODO: original doc had dangling "`type` is" bullet -- unclear what it referred to.
 */
export class ASTNode<Props extends object = object> extends Assertable {
  /** Match passed to `getAST()` method which produced this node. */
  declare match: P.AnyMatch

  /** Backing field for the overridable `datatype` accessor. */
  declare private _datatype: string | RegExpConstructor | undefined

  /**
   * On construction, pass:
   * - `match` passed to `getAST()` method
   * - `props` as arbitrary properties to be assigned to instance
   *
   * Use `this.assert()` or `this.assertType()` to validate input as much as you can.
   *
   * TODO: `datatype` as a function which turns into a getter?
   */
  constructor(match: P.AnyMatch, props?: Props) {
    super()
    if (props) Object.assign(this, props)
    this.match = match
    this.assertType("match", P.Match)
  }

  /** Our node type, which is name of our constructor function. */
  get nodeType() {
    return this.constructor.name || (this.constructor as { displayName?: string }).displayName
  }

  /** Scope of top-level match. */
  get parentScope(): P.Scope {
    return this.match.scope
  }

  ////////////////
  // ## Rendering as JS text
  ////////////////

  /**
   * Compile this AST into Javascript.  MUST override in subclass.
   * - Most subclasses return a `string` of Javascript source, but `Literal` subclasses
   *   (e.g. `NumericLiteral`) may return raw underlying value instead.
   */
  compile(): unknown {
    throw new TypeError(`AST ${this.nodeType} must implement compile()`)
  }

  /**
   * Datatype which this node represents, e.g. `string`, `number`, custom type.
   * - Many subclasses override just `get datatype()` to return a fixed/derived value.
   * - Some subclasses also override `set datatype()` to allow overriding via `this.override()`.
   */
  get datatype(): string | RegExpConstructor | undefined {
    return this._datatype
  }
  set datatype(datatype: string | RegExpConstructor | undefined) {
    this._datatype = datatype
  }

  ////////////////
  // ## Rendering as React nodes
  ////////////////

  /** Rendered react component which draws this node as syntax-colored Javascript. */
  /*@memoize*/
  get component(): ReactElement {
    return this.derived("component", () => render.Node(this))
  }

  /**
   * Css className as concatenation of all superclass method names.
   * - Override in subclass to add special stuff, e.g.
   *   `get className() { return super.className + "foo bar baz" }`
   */
  get className(): string {
    const supers = (getSuperHierarchy(this, ASTNode) as Array<{ name: string }>).reverse()
    return supers.map((constructor) => constructor.name).join(" ")
  }

  /**
   * Render children to render INSIDE outer element, which has `node.className`
   * (e.g. `ASTNode Expression StringLiteral`) set.
   */
  renderChildren(): ReactNode {
    return null
  }

  // TEST: ensure that `compile()` output is the same as `ast.renderedText`
  // REFACTOR: was using enzyme to test component vs. compiled text, but enzyme was problematic
  //  so we're not using it anymore -- always return `true`.
  /** Always `true` -- see REFACTOR note above `test()`. */
  test(): boolean {
    return true
  }

  ////////////////
  // ## Debug
  ////////////////

  /** Debug string, deliberately not including properties -- see subclasses for actual rendering. */
  toString(): string {
    return `${this.constructor.name} {...}`
  }
}

////////////////
// ## Literals
////////////////

/** Blank line. */
export class BlankLine extends ASTNode {
  compile(): string {
    return "" // "\n"
  }
  renderChildren(): ReactNode {
    return null // render.NEWLINE
  }
}

/** Base of all Expression types.  Useful for `instanceof`.
 *  - Try to figure out `datatype` if you can, either as a value or as a getter.
 */
export class Expression extends ASTNode {}

/** Expression with attached comment.
 *  - `expression` is the wrapped Expression.
 *  - `comment` is comment attached after it, e.g. a `ParseError` explaining why it's suspect.
 */
export type ExpressionWithCommentProps = Prettify<{
  expression: Expression
  comment: BlockComment
}>

export class ExpressionWithComment extends Expression {
  declare expression: Expression
  declare comment: BlockComment
  constructor(match: P.AnyMatch, props: ExpressionWithCommentProps) {
    super(match, props)
    this.assertType("expression", Expression)
    this.assertType("comment", BlockComment)
  }
  compile(): string {
    return `${this.expression.compile()} ${this.comment.compile()}`
  }
  renderChildren(): ReactNode {
    return render.Fragment(this.expression.component, render.SPACE, this.comment.component)
  }
}

/** Generic Literal type.  Useful for `instanceof`.
 *  - `value` is actual JS value, which by default we assume we can just output.
 *  - `raw` (optional) is raw input value.
 */
export class Literal extends Expression {
  declare value: unknown
  declare raw: string | undefined
  compile(): unknown {
    return this.value
  }
  renderChildren(): ReactNode {
    return <span className="value">{this.value as ReactNode}</span>
  }
}

/** NumericLiteral type.
 *  - `value` is the number.
 *  - `raw` (optional) is original input string.
 */
export type NumericLiteralProps = Prettify<{ value: number; raw?: string }>

export class NumericLiteral extends Literal {
  declare value: number
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "number"
  }
  /** Constructor also accepts a bare `number` as shorthand for `{ value }`. */
  constructor(match: P.AnyMatch, props: number | NumericLiteralProps) {
    if (typeof props === "number") props = { value: props }
    super(match, props)
    this.assertType("value", "number")
  }
}

/** StringLiteral type.
 *  - `value` is the string.
 *  - `raw` (optional) is original input string.
 */
export type StringLiteralProps = Prettify<{ value: string; raw?: string }>

export class StringLiteral extends Literal {
  declare value: string
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "string"
  }
  /** Constructor also accepts a bare `string` as shorthand for `{ value }`. */
  constructor(match: P.AnyMatch, props: string | StringLiteralProps) {
    if (typeof props === "string") props = { value: props }
    super(match, props)
    this.assertType("value", "string")
  }
}

/** BooleanLiteral type.
 *  - `value` is the boolean.
 *  - `raw` (optional) is original input string.
 */
export type BooleanLiteralProps = Prettify<{ value: boolean; raw?: string }>

export class BooleanLiteral extends Literal {
  declare value: boolean
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "boolean"
  }
  /** Constructor also accepts a bare `boolean` as shorthand for `{ value }`. */
  constructor(match: P.AnyMatch, props: boolean | BooleanLiteralProps) {
    if (typeof props === "boolean") props = { value: props }
    super(match, props)
    this.assertType("value", "boolean")
  }
  compile(): string {
    return this.value ? "true" : "false"
  }
  renderChildren(): ReactNode {
    return this.value ? "true" : "false"
  }
}

/** RegExpLiteral type.
 *  - `value` is the `RegExp`.
 */
export type RegExpLiteralProps = Prettify<{ value: RegExp }>

export class RegExpLiteral extends Literal {
  declare value: RegExp
  /*@readonly*/ /*@proto*/ get datatype(): RegExpConstructor {
    return RegExp
  }
  constructor(match: P.AnyMatch, props: RegExpLiteralProps) {
    super(match, props)
    this.assertType("value", RegExp)
  }
}

/** NullLiteral type.  TODO: ???? */
export class NullLiteral extends Literal {
  // TODO: ???
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "null"
  }
  constructor(match: P.AnyMatch, props?: object) {
    super(match, props)
    this.assertType("value", undefined)
  }
  compile(): string {
    return "null"
  }
  renderChildren(): ReactNode {
    return <span className="value">null</span>
  }
}

/** UndefinedLiteral type.  TODO: ???? */
export class UndefinedLiteral extends Literal {
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "undefined"
  }
  constructor(match: P.AnyMatch, props?: object) {
    super(match, props)
    this.assertType("value", undefined)
  }
  compile(): string {
    return "undefined"
  }
  renderChildren(): ReactNode {
    return <span className="value">undefined</span>
  }
}

/** ThisLiteral type -- represents JS `this`. */
export class ThisLiteral extends Literal {
  compile(): string {
    return "this"
  }
  renderChildren(): ReactNode {
    return <span className="value">this</span>
  }
}

/** KeywordLiteral type.
 *  - `value` is raw input converted into a JS-legal keyword.
 *  - `raw` (optional) is raw input string.
 */
export type KeywordLiteralProps = Prettify<{ value: string; raw?: string }>

export class KeywordLiteral extends Literal {
  declare value: string
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "string"
  }
  /** SIDE EFFECT: routes through `this.override()` so a subclass instance can force a specific datatype. */
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  constructor(match: P.AnyMatch, props: KeywordLiteralProps) {
    super(match, props)
    this.assertType("value", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
}

/** ArrayLiteral.
 *  - `items` (optional) is array of Expressions.
 *  - `wrap` (optional) is `true` if we should wrap children -- defaults to wrapping past 2 items.
 */
export type ArrayLiteralProps = Prettify<{ items?: Expression[]; wrap?: boolean }>

export class ArrayLiteral extends Literal {
  declare items: Expression[] | undefined
  constructor(match: P.AnyMatch, props: ArrayLiteralProps) {
    super(match, props)
    this.assertArrayType("items", Expression, OPTIONAL)
    this.assertType("wrap", "boolean", OPTIONAL)
  }
  /** Default: wrap once there are more than 2 items.  Override via constructor or setter. */
  /*@overridable*/
  get wrap(): boolean {
    return (this.items?.length ?? 0) > 2
  }
  set wrap(wrap: boolean) {
    this.override("wrap", wrap)
  }
  compile(): string {
    const { items, wrap } = this
    return stringify.Array({ items, wrap })
  }
  renderChildren(): ReactNode {
    return <render.Array items={this.items} wrap={this.wrap} />
  }
}

/** Enumeration -- literal array where each item also has a plain string/number `value`.
 *  - `enumeration` is array of Expressions (the AST for each item, for rendering/compiling).
 *  - `values` is parallel array of raw strings or numbers.
 */
export type EnumerationProps = Prettify<{ enumeration: Expression[]; values: Array<string | number> }>

export class Enumeration extends Literal {
  declare enumeration: Expression[]
  declare values: Array<string | number>
  constructor(match: P.AnyMatch, props: EnumerationProps) {
    super(match, props)
    this.assertArrayType("enumeration", Expression)
    this.assertArrayType("values", ["string", "number"])
  }
  compile(): string {
    return stringify.Array({ items: this.enumeration })
  }
  renderChildren(): ReactNode {
    return <render.Array items={this.enumeration} />
  }
}

////////////////
// ## Quoting / templating expressions
////////////////

/**
 * QuotedExpression -- use to wrap `expression` in single quotes.
 */
export type QuotedExpressionProps = Prettify<{ expression: Expression }>

export class QuotedExpression extends Expression {
  declare expression: Expression
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "string"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  /** Constructor also accepts a bare `string` as shorthand for `{ expression: new StringLiteral(value) }`. */
  constructor(match: P.AnyMatch, props: string | QuotedExpressionProps) {
    if (typeof props === "string") props = { expression: new StringLiteral(match, { value: props }) }
    super(match, props)
    this.assertType("expression", Expression)
  }
  compile(): string {
    return stringify.InSingleQuotes({ children: String(this.expression.compile()) })
  }
  renderChildren(): ReactNode {
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
export type BackTickExpressionProps = Prettify<{ expression: Expression }>

export class BackTickExpression extends Expression {
  declare expression: Expression
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "string"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  /** Constructor also accepts a bare `string` as shorthand for `{ expression: new StringLiteral(value) }`. */
  constructor(match: P.AnyMatch, props: string | BackTickExpressionProps) {
    if (typeof props === "string") props = { expression: new StringLiteral(match, { value: props }) }
    super(match, props)
    this.assertType("expression", Expression)
  }
  compile(): string {
    return stringify.InBackTicks({ children: String(this.expression.compile()) })
  }
  renderChildren(): ReactNode {
    return (
      <render.InBackTicks>
        <span className="expression">{this.expression.component}</span>
      </render.InBackTicks>
    )
  }
}

/**
 * BacktickSubstitutionExpression -- use to wrap an `${expression}` for use in a backtick string.
 */
export type BacktickSubstitutionProps = Prettify<{ expression: Expression }>

export class BacktickSubstitution extends Expression {
  declare expression: Expression
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "string"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  /** Constructor also accepts a bare `string` as shorthand for `{ expression: new StringLiteral(value) }`. */
  constructor(match: P.AnyMatch, props: string | BacktickSubstitutionProps) {
    if (typeof props === "string") props = { expression: new StringLiteral(match, { value: props }) }
    super(match, props)
    this.assertType("expression", Expression)
  }
  compile(): string {
    return "${" + this.expression.compile() + "}"
  }
  renderChildren(): ReactNode {
    return (
      <>
        <span className="literal">{"${"}</span>
        <span className="expression">{this.expression.component}</span>
        <span className="literal">{"}"}</span>
      </>
    )
  }
}

/**
 * TripleBackTickExpression -- use to wrap `expression` AST in triple-back-ticks.
 */
export type TripleBackTickExpressionProps = Prettify<{ expression: Expression }>

export class TripleBackTickExpression extends Expression {
  declare expression: Expression
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "string"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  /** Constructor also accepts a bare `string` as shorthand for `{ expression: new StringLiteral(value) }`. */
  constructor(match: P.AnyMatch, props: string | TripleBackTickExpressionProps) {
    if (typeof props === "string") props = { expression: new StringLiteral(match, { value: props }) }
    super(match, props)
    this.assertType("expression", Expression)
  }
  compile(): string {
    return stringify.InTripleBackTicks({ children: String(this.expression.compile()) })
  }
  renderChildren(): ReactNode {
    return (
      <render.InTripleBackTicks>
        <span className="expression">{this.expression.component}</span>
      </render.InTripleBackTicks>
    )
  }
}

////////////////
// ## Properties & variables
////////////////

/** PropertyLiteral -- identifier which refers to some property of an object.
 *  - `value` is normalized property name.  Inferred from `match` if not given.
 *  - `raw` (optional) is input property name.
 */
export type PropertyLiteralProps = Prettify<{ value?: string; raw?: string }>

export class PropertyLiteral extends Literal {
  declare value: string
  /** Constructor also accepts a bare `string` as shorthand for `{ value }`. */
  constructor(match: P.AnyMatch, props?: string | PropertyLiteralProps) {
    if (typeof props === "string") props = { value: props }
    super(match, props)
    if (this.value === undefined) this.value = this.match.value
    this.assertType("value", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
  /** `true` if `value` can be output bare, `false` if it needs quoting/bracket access. */
  get isLegalIdentifier(): boolean {
    return isLegalIdentifier(this.value)
  }
  compile(): string {
    if (this.isLegalIdentifier) return this.value
    return stringify.InSingleQuotes({ children: this.value })
  }
  get className(): string {
    return `${super.className} ${this.isLegalIdentifier ? "legal-identifier" : "non-legal-identifier"}`
  }
  renderChildren(): ReactNode {
    const value = <span className="property">{this.value}</span>
    return this.isLegalIdentifier ? value : <render.InSingleQuotes>{value}</render.InSingleQuotes>
  }
}

/** PropertyExpression -- named property of some object.
 *  - `object` is thing to get property from, as an Expression.
 *  - `property` is normalized property name or PropertyLiteral.
 *  TODO: datatype???
 */
export type PropertyExpressionProps = Prettify<{ object: Expression; property: string | PropertyLiteral }>

export class PropertyExpression extends Expression {
  declare object: Expression
  declare property: PropertyLiteral
  constructor(match: P.AnyMatch, props: PropertyExpressionProps) {
    super(match, props)
    this.assertType("object", Expression)
    if (typeof this.property === "string") this.property = new PropertyLiteral(this.match, this.property)
    this.assertType("property", PropertyLiteral)
  }
  /** Compiles as `object.property` when legal identifier, else `object['property']`. */
  compile(): string {
    const prop = this.property.compile()
    if (this.property.isLegalIdentifier) return `${this.object.compile()}.${prop}`
    return `${this.object.compile()}['${prop}']`
  }
  renderChildren(): ReactNode {
    const object = <span className="object">{this.object.component}</span>
    if (this.property.isLegalIdentifier) {
      return render.Fragment(object, render.PERIOD, this.property.component)
    }
    return render.Fragment(object, <render.InSquareBrackets>{this.property.component}</render.InSquareBrackets>)
  }
}

/** VariableExpression -- pointer to a Variable object.
 *  - `name` is normalized type name: dashes and spaces converted to underscores.
 *  - `default` (optional) is AST for default value.  See `DestructuredAssignment`.
 *  - `type` (optional) is `"argument"` or `"this"` etc.
 *
 *    CURRENTLY UNUSED
 *  - `raw` (optional) is original input string, unnormalized.
 *  - `variable` (optional) is pointer to scope Variable, if there is one.
 *  - `plurality` (optional) is `"singular"`, `"plural"` or `undefined`.  TODO: derive?
 */
export type VariableExpressionProps = Prettify<{
  name?: string
  default?: Expression
  type?: string
  datatype?: string
  raw?: string
  variable?: P.ScopeVariable
  plurality?: "singular" | "plural"
}>

export class VariableExpression extends Expression {
  declare name: string
  declare default: Expression | undefined
  declare type: string | undefined
  declare raw: string | undefined
  declare variable: P.ScopeVariable | undefined
  declare plurality: "singular" | "plural" | undefined
  /** `name` defaults to `match.value` when not passed. */
  constructor(match: P.AnyMatch, props?: VariableExpressionProps) {
    super(match, props)
    if (!this.name) this.name = this.match.value
    this.assertType("name", "string")
    this.assertType("default", Expression, OPTIONAL)
    this.assertType("raw", "string", OPTIONAL)
  }
  /** Compiles as `name` alone, or `name = default` when a default value is set. */
  compile(): string {
    if (this.default) return `${this.name} = ${this.default.compile()}`
    return this.name
  }
  /** Adds `type` and the scope variable's `kind` (e.g. `let`/`const`) as extra css classes. */
  get className(): string {
    const classes = [super.className]
    if (this.type) classes.push(this.type)
    if (this.variable?.kind && !classes.includes(this.variable.kind)) classes.push(this.variable.kind)
    return classes.join(" ")
  }
  renderChildren(): ReactNode {
    if (!this.default) return <span className="name">{this.name}</span>
    return render.Fragment(
      <span className="name">{this.name}</span>,
      render.EQUALS,
      <span className="default">{this.default.component}</span>
    )
  }
}

/** AwaitExpression:  `await {expression}`.
 *  - `expression` is Expression to await.
 *  - NOTE: this marks `parentScope` as asynchronous!!!
 */
export type AwaitExpressionProps = Prettify<{ expression: Expression }>

export class AwaitExpression extends Expression {
  declare expression: Expression
  /** SIDE EFFECT: walks up scope chain to nearest `MethodScope` and marks it `async = true`. */
  constructor(match: P.AnyMatch, props: AwaitExpressionProps) {
    super(match, props)
    this.assertType("expression", Expression)
    // Work our way up the scope chain
    // -- if we find a MethodScope, mark it as asynchronous
    let scope: P.Scope | undefined = this.parentScope
    while (scope && !(scope instanceof P.MethodScope)) scope = scope.parentScope
    if (scope instanceof P.MethodScope) scope.async = true
  }
  compile(): string {
    return `await ${this.expression.compile()}`
  }
  renderChildren(): ReactNode {
    return render.Fragment(render.AWAIT, this.expression.component)
  }
}

////////////////
// ## Comments
////////////////

/** Abstract comment type.  Useful for `instanceof`. */
export class Comment extends ASTNode {}

/** LineComment type.
 *  - `value` is text of comment (may be empty string).
 *  - `commentSymbol` is comment symbol used -- e.g. `""` for a plain `//`, or a header marker.
 *  - `initialWhitespace` is whitespace between `commentSymbol` and `value`.
 */
export type LineCommentProps = Prettify<{ value: string; commentSymbol?: string; initialWhitespace?: string }>

export class LineComment extends Comment {
  declare value: string
  declare commentSymbol: string | undefined
  declare initialWhitespace: string | undefined
  constructor(match: P.AnyMatch, props: LineCommentProps) {
    super(match, props)
    this.assertType("value", "string")
    this.assertType("commentSymbol", "string", OPTIONAL)
    this.assertType("initialWhitespace", "string", OPTIONAL)
  }
  /** Prefixes `commentSymbol` with `//` unless it already IS exactly `//`. */
  compile(): string {
    const { initialWhitespace = " ", value } = this
    let { commentSymbol = "" } = this
    if (commentSymbol !== "//") commentSymbol = `//${commentSymbol}`
    return `${commentSymbol}${initialWhitespace}${value}`
  }
  /** Adds `"header"` css class for non-plain comment symbols, e.g. section-banner comments. */
  get className(): string {
    return `${super.className}${this.commentSymbol !== "//" ? " header" : ""}`
  }
  renderChildren(): ReactNode {
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
 *  - `value` is entire contents of original comment, including initial space and newlines.
 */
export type BlockCommentProps = Prettify<{ value: string }>

export class BlockComment extends Comment {
  declare value: string
  constructor(match: P.AnyMatch, props: BlockCommentProps) {
    super(match, props)
    this.assertType("value", "string")
  }
  compile(): string {
    return `/* ${this.value} */`
  }
  renderChildren(): ReactNode {
    return render.Fragment(render.OPEN_COMMENT, <span className="comment">{this.value}</span>, render.CLOSE_COMMENT)
  }
}

/** ParserAnnotation type, used for parser annotations injected into output.
 *  - `value` is text of annotation.
 *  - `annotation` (overridable getter) is the leading tag, `"SPELL:"` by default -- `ParseError` overrides it.
 */
export class ParserAnnotation extends BlockComment {
  /*@proto*/ get annotation(): string {
    return "SPELL:"
  }
  set annotation(annotation: string) {
    this.override("annotation", annotation)
  }
  compile(): string {
    return `/* ${this.annotation} ${this.value} */`
  }
  renderChildren(): ReactNode {
    return render.Fragment(
      render.OPEN_COMMENT,
      <span className="annotation">{this.annotation} </span>,
      <span className="comment">{this.value}</span>,
      render.CLOSE_COMMENT
    )
  }
}

/** ParseError type -- a `ParserAnnotation` tagged `"PARSE ERROR:"` instead of `"SPELL:"`.
 *  - `value` is text of error.
 */
export class ParseError extends ParserAnnotation {
  /*@proto*/ get annotation(): string {
    return "PARSE ERROR:"
  }
  set annotation(annotation: string) {
    this.override("annotation", annotation)
  }
}

////////////////
// ## Operators & expressions
////////////////

/** Parenthesized expression.
 *  - `expression` is contained AST Expression.
 */
export type ParenthesizedExpressionProps = Prettify<{ expression: Expression }>

export class ParenthesizedExpression extends Expression {
  declare expression: Expression
  /** SIDE EFFECT: unwinds nested `ParenthesizedExpression`s so we never double-wrap, e.g. `((x))` ~== `(x)`. */
  constructor(match: P.AnyMatch, props: ParenthesizedExpressionProps) {
    super(match, props)
    this.assertType("expression", Expression)
    // Unwind nested parenthesis
    while (this.expression instanceof ParenthesizedExpression) {
      this.expression = this.expression.expression
    }
  }
  /** Passes through to wrapped `expression`'s datatype -- parens don't change type. */
  get datatype(): string | RegExpConstructor | undefined {
    return this.expression.datatype
  }
  compile(): string {
    return stringify.InParens({ children: String(this.expression.compile()) })
  }
  renderChildren(): ReactNode {
    return (
      <render.InParens>
        <span className="expression">{this.expression.component}</span>
      </render.InParens>
    )
  }
}

/** Not expression.
 *  - `expression` is contained AST Expression.
 *  - `datatype` is ALWAYS boolean.
 */
export type NotExpressionProps = Prettify<{ expression: Expression }>

export class NotExpression extends Expression {
  declare expression: Expression
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "boolean"
  }
  constructor(match: P.AnyMatch, props: NotExpressionProps) {
    super(match, props)
    this.assertType("expression", Expression)
  }
  compile(): string {
    return `!${this.expression.compile()}`
  }
  renderChildren(): ReactNode {
    return render.Fragment(render.BANG, <span className="expression">{this.expression.component}</span>)
  }
}

/** InfixExpression:  `<lhs> <operator> <rhs>`. */
export type InfixExpressionProps = Prettify<{ lhs: Expression; operator: string; rhs: Expression }>

export class InfixExpression extends Expression {
  declare lhs: Expression
  declare operator: string
  declare rhs: Expression
  constructor(match: P.AnyMatch, props: InfixExpressionProps) {
    super(match, props)
    this.assertType("lhs", Expression)
    this.assertType("operator", "string")
    this.assertType("rhs", Expression)
  }
  compile(): string {
    return `${this.lhs.compile()} ${this.operator} ${this.rhs.compile()}`
  }
  renderChildren(): ReactNode {
    return render.Fragment(
      <span className="lhs">{this.lhs.component}</span>,
      <span className="operator"> {this.operator} </span>,
      <span className="rhs">{this.rhs.component}</span>
    )
  }
}

/**
 * Given an array of Expressions, join them all together with same `operator`.
 * - Right-associates: repeatedly pops off the right end and nests it as `rhs` of a new
 *   `InfixExpression`, so `[a, b, c]` with `+` becomes `a + (b + c)` in tree shape
 *   (though `compile()` output has no visible parens since `InfixExpression` doesn't add them).
 * - Returns single expression unchanged (no `InfixExpression` wrapper) when `expressions.length < 2`.
 * - TODO: convert to class?
 */
export function MultiInfixExpression(
  match: P.AnyMatch,
  { expressions, operator }: { expressions: Expression[]; operator: string }
): Expression | undefined {
  if (expressions.length < 2) return expressions[0]
  const remaining = [...expressions]
  let rhs = remaining.pop() as Expression
  while (remaining.length) {
    const lhs = remaining.pop() as Expression
    rhs = new InfixExpression(match, { lhs, operator, rhs })
  }
  return rhs
}

////////////////
// ## Method invocations
////////////////

/** InvocationArgs:  parenthesized, comma-separated argument list for a method call.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `wrap` (optional) is `true` to force-wrap args one-per-line -- defaults to wrapping past 3 args.
 *  - NOTE: this does not ensure that named method is actually defined in scope!!!!
 */
export type InvocationArgsProps = Prettify<{ args?: Expression[]; wrap?: boolean }>

export class InvocationArgs extends ASTNode {
  declare args: Expression[] | undefined
  /** SIDE EFFECT: unwinds any `ParenthesizedExpression` args, e.g. `foo((x))` ~== `foo(x)`. */
  constructor(match: P.AnyMatch, { wrap, ...props }: InvocationArgsProps) {
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
  /** Default: wrap once there are more than 3 args.  Override via constructor or setter. */
  /*@overridable*/
  get wrap(): boolean {
    return (this.args?.length ?? 0) > 3
  }
  set wrap(wrap: boolean) {
    this.override("wrap", wrap)
  }
  compile(): string {
    const { args, wrap } = this
    return stringify.Args({ args, wrap })
  }
  renderChildren(): ReactNode {
    return <render.Args args={this.args} wrap={this.wrap} />
  }
}

/** MethodInvocation:  generic named method invocation, e.g. `methodName(args)`.
 *  - `methodName` is method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 *  - `wrap` (optional) set to control arg wrapping explicitly.
 *  - NOTE: this does not ensure that named method is actually defined in scope!!!!
 */
export type MethodInvocationProps = Prettify<{
  methodName: string
  args?: Expression[]
  wrap?: boolean
  datatype?: string
}>

export class MethodInvocation extends Expression {
  declare args: InvocationArgs

  /** Backing field for overridable `methodName` accessor. */
  declare private _methodName: string
  /** `methodName` is a plain get/set pair here -- subclasses (e.g. `ConsoleMethodInvocation`) redefine it
   *  as an overridable `@proto` getter with a fixed default. */
  get methodName(): string {
    return this._methodName
  }
  set methodName(methodName: string) {
    this._methodName = methodName
  }

  constructor(match: P.AnyMatch, { args, wrap, ...props }: MethodInvocationProps) {
    super(match, props)
    this.assertType("methodName", "string")
    this.assertType("datatype", "string", OPTIONAL)
    this.args = new InvocationArgs(match, { args, wrap })
  }
  compile(): string {
    return `${this.methodName}${this.args.compile()}`
  }
  renderChildren(): ReactNode {
    return render.Fragment(<span className="method-name">{this.methodName}</span>, this.args.component)
  }
}

/** Call a `method` on some `thing` with `args`, e.g. `thing.methodName(args)`.
 *  - `thing` is what we'll call method on.
 *  - `methodName` is method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - Try to set `datatype` as string or getter if you can.
 */
export type ScopedMethodInvocationProps = Prettify<MethodInvocationProps & { thing: Expression }>

export class ScopedMethodInvocation extends MethodInvocation {
  declare thing: Expression
  constructor(match: P.AnyMatch, props: ScopedMethodInvocationProps) {
    super(match, props)
    // `methodName`, `args`, wrap` and `datatype` are handled by MethodInvocation
    this.assertType("thing", Expression)
  }
  compile(): string {
    return `${this.thing.compile()}.${this.methodName}${this.args.compile()}`
  }
  renderChildren(): ReactNode {
    return render.Fragment(
      <span className="method-scope">{this.thing.component}</span>,
      <span className="operator period">.</span>,
      <span className="method-name">{this.methodName}</span>,
      this.args.component
    )
  }
}

/** ConsoleMethodInvocation:  `spellCore.console.methodName(args)`.
 * - `methodName` is method name, e.g. `log` or `warn` -- defaults to `log`.
 * - `args` is array of expressions.
 * - `echoInTests` (overridable getter) is always `false` -- test-mode echo injection
 *   (see `rules/methods.ts`) skips console calls since they already print something.
 */
export type ConsoleMethodInvocationProps = Prettify<{
  methodName?: string
  args?: Expression[]
  wrap?: boolean
  datatype?: string
}>

export class ConsoleMethodInvocation extends ScopedMethodInvocation {
  /*@proto*/ get methodName(): string {
    return "log"
  }
  set methodName(methodName: string) {
    this.override("methodName", methodName)
  }
  /*@proto*/ get echoInTests(): boolean {
    return false
  }
  set echoInTests(echoInTests: boolean) {
    this.override("echoInTests", echoInTests)
  }
  /** Builds `thing` as `spellCore.console` -- caller only supplies `methodName`/`args`. */
  constructor(match: P.AnyMatch, props: ConsoleMethodInvocationProps) {
    const thing = new PropertyExpression(match, {
      object: new SpellCoreExpression(match),
      property: "console"
    })
    super(match, { ...props, methodName: props.methodName as string, thing })
  }
}

/** Create an `Expression` that refers to `spellCore`. */
export class SpellCoreExpression extends VariableExpression {
  constructor(match: P.AnyMatch) {
    super(match, { name: "spellCore", type: "global" })
  }
}

/**
 * CoreMethodInvocation:  calls a `spellCore` `method`.  Used for output language independence.
 *  - `methodName` is spellcore method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 */
export type CoreMethodInvocationProps = MethodInvocationProps

export class CoreMethodInvocation extends ScopedMethodInvocation {
  /** Builds `thing` as `spellCore` -- caller only supplies `methodName`/`args`. */
  constructor(match: P.AnyMatch, props: CoreMethodInvocationProps) {
    super(match, { ...props, thing: new SpellCoreExpression(match) })
  }
}

/** Create an `Expression` that refers to `spellCore.RUNTIME`. */
export class RuntimeExpression extends PropertyExpression {
  constructor(match: P.AnyMatch) {
    super(match, {
      object: new SpellCoreExpression(match),
      property: "RUNTIME"
    })
  }
}

/**
 * RuntimeMethodInvocation:  calls a `spellCore.RUNTIME` `method`.  Used for output language independence.
 *  - `methodName` is spellcore method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 */
export type RuntimeMethodInvocationProps = MethodInvocationProps

export class RuntimeMethodInvocation extends ScopedMethodInvocation {
  /** Builds `thing` as `spellCore.RUNTIME` -- caller only supplies `methodName`/`args`. */
  constructor(match: P.AnyMatch, props: RuntimeMethodInvocationProps) {
    super(match, { ...props, thing: new RuntimeExpression(match) })
  }
}

/** ExportInvocation:  `spellCore.addExport(property, value)`.
 *  - `property` is string or QuotedString for export name.
 *  - `value` is Expression being exported.
 */
export type ExportInvocationProps = Prettify<{ property: string | QuotedExpression; value: Expression }>

export class ExportInvocation extends CoreMethodInvocation {
  /** Constructor also accepts a bare `string` `property` as shorthand for `new QuotedExpression(property)`. */
  constructor(match: P.AnyMatch, props: ExportInvocationProps) {
    let { property } = props
    if (typeof property === "string") property = new QuotedExpression(match, property)
    super(match, {
      methodName: "addExport",
      args: [property, props.value]
    })
  }
}

/** ExpectMethodInvocation:  `spellCore.expect(...)` -- used to assert a value in generated test output.
 *  - `expression` is expression AST being tested.
 *  - `expressionString` is string for spell code used to generate `expression`, shown in assertion output.
 *  - `value` (optional) is expected value AST to match against.
 *  - `valueString` (optional) is string for spell code used to generate `value`, shown in assertion output.
 *  - `echoInTests` (overridable getter) is always `false` -- test-mode echo injection
 *    (see `rules/methods.ts`) skips `expect(...)` calls since they already print an assertion result.
 */
export type ExpectMethodInvocationProps = Prettify<{
  expression: Expression
  expressionString: string
  value?: Expression
  valueString?: string
}>

export class ExpectMethodInvocation extends CoreMethodInvocation {
  /*@proto*/ get methodName(): string {
    return "expect"
  }
  set methodName(methodName: string) {
    this.override("methodName", methodName)
  }
  /*@proto*/ get echoInTests(): boolean {
    return false
  }
  set echoInTests(echoInTests: boolean) {
    this.override("echoInTests", echoInTests)
  }
  /** Wraps `expressionString`/`valueString` as backtick `StringLiteral`s and never wraps args. */
  constructor(match: P.AnyMatch, props: ExpectMethodInvocationProps) {
    const { expression, expressionString, value, valueString } = props
    const args = [expression, new StringLiteral(match, "`" + expressionString + "`")]
    if (value) args.push(value, new StringLiteral(match, "`" + valueString + "`"))
    super(match, { methodName: "expect", args, wrap: false })
  }
}

/** EchoInvocation:  `spellCore.echo(...)` (or another named spellCore method) for test-mode logging.
 *  - `expression` is expression to output -- a bare `string` is wrapped as a backtick `StringLiteral`.
 *  - `methodName` (optional) overrides which spellCore method to call, defaults to `"echo"`.
 *  - `echoInTests` (overridable getter) is always `false` -- test-mode echo injection
 *    (see `rules/methods.ts`) skips echo calls since they already print something.
 */
export type EchoInvocationProps = Prettify<{ expression: string | Expression; methodName?: string }>

export class EchoInvocation extends CoreMethodInvocation {
  /*@proto*/ get echoInTests(): boolean {
    return false
  }
  set echoInTests(echoInTests: boolean) {
    this.override("echoInTests", echoInTests)
  }
  constructor(match: P.AnyMatch, props: EchoInvocationProps) {
    const { methodName = "echo" } = props
    let { expression } = props
    if (typeof expression === "string") expression = new StringLiteral(match, "`" + expression + "`")
    super(match, { methodName, args: [expression] })
  }
}

////////////////
// ## Types & constants
////////////////

/** TypeExpression -- pointer to a Type object/scope.
 *  - `name` is normalized type name: Typecase, singular and dashes to underscores.
 *  - `raw` (optional) is original input string, unnormalized.
 *  - `plurality` (optional) is `"singular"`, `"plural"` or `undefined`.
 *    TODO: ^^^ ???
 */
export type TypeExpressionProps = Prettify<{ name: string; raw?: string; plurality?: "singular" | "plural" }>

export class TypeExpression extends Expression {
  declare name: string
  declare raw: string | undefined
  declare plurality: "singular" | "plural" | undefined
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "Type"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  constructor(match: P.AnyMatch, props: TypeExpressionProps) {
    super(match, props)
    this.assertType("name", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
  compile(): string {
    return this.name
  }
  renderChildren(): ReactNode {
    return <span className="type">{this.name}</span>
  }

  /** Pointer to known Scope for this type, if available. ??? */
  get scope(): P.TypeScope | undefined {
    return this.match.type
  }
}

/** PrototypeExpression:  `type.prototype`.
 *  - `type` is a TypeExpression.
 */
export type PrototypeExpressionProps = Prettify<{ type: string | TypeExpression }>

export class PrototypeExpression extends Expression {
  declare type: TypeExpression
  /** Constructor also accepts a bare `string` `type` as shorthand for `new TypeExpression({ name: type })`. */
  constructor(match: P.AnyMatch, props: PrototypeExpressionProps) {
    super(match, props)
    if (typeof this.type === "string") this.type = new TypeExpression(match, { name: this.type })
    this.assertType("type", TypeExpression)
  }
  compile(): string {
    const { type } = this
    return `${type.compile()}.prototype`
  }
  renderChildren(): ReactNode {
    return render.Fragment(this.type.component, render.PERIOD, render.PROTOTYPE)
  }
}

/** ConstantExpression -- pointer to a Constant object.
 *  - `name` is constant name (not normalized ???).
 *  - `output` is constant string to output, including quotes.
 *  - `constant` is pointer to scope Constant, if there is one.
 */
export type ConstantExpressionProps = Prettify<{ name: string; output: string; constant?: P.ScopeConstant }>

export class ConstantExpression extends Expression {
  declare name: string
  declare output: string
  declare constant: P.ScopeConstant | undefined
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "string"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  constructor(match: P.AnyMatch, props: ConstantExpressionProps) {
    super(match, props)
    this.assertType("name", "string")
    this.assertType("output", "string")
  }
  /** Just outputs pre-baked `output` string verbatim -- `compile()` doesn't re-derive it from `name`. */
  compile(): string {
    return this.output
  }
  renderChildren(): ReactNode {
    return <span className="constant">{this.output}</span>
  }
}

////////////////
// ## Method definition
////////////////

/**
 * Method Definition -- a function/method declaration, optionally as an inline arrow fn or object property.
 * - `args` (optional) is array of VariableExpressions.
 * - `body` (optional) is:
 *   - a single Statement or StatementGroup
 *   - a StatementBlock
 *   - an Expression
 *
 *   NOTE: `body` is ALWAYS converted to a StatementBlock on construction, so you can change it by
 *   manipulating `body.statements`, e.g. `methodBody.body.statements.push(...)`.
 * - `inline` (optional) set to `true` to make a fat arrow function.
 * - `asProperty` (optional) set to `true` to use object literal property syntax.
 *   NOTE: this is done automatically by `ObjectLiteral.addMethod()`.
 * - `methodName` (optional) is the method's name -- required when `asProperty` or non-`inline`.
 * - `error` (optional) is a `ParseError` rendered/compiled right after the method body.
 * - `datatype` (optional) is return datatype as string, try to set if you can.
 * - `async` (optional) set to `true` to force method to be async; if not set, we'll use
 *   `match.nestedScope.async`.
 */
export type MethodDefinitionProps = Prettify<{
  args?: VariableExpression[]
  body?: StatementBlock | Statement | Expression
  inline?: boolean
  asProperty?: boolean
  methodName?: string
  error?: ParseError
  datatype?: string
  async?: boolean
}>

export class MethodDefinition extends Expression {
  declare args: VariableExpression[] | undefined
  declare body: StatementBlock
  declare inline: boolean | undefined
  declare asProperty: boolean | undefined
  declare methodName: string | undefined
  declare error: ParseError | undefined
  declare async: boolean | undefined
  /** Normalizes `body` (Statement / StatementGroup / Expression / missing) into a wrapped `StatementBlock`. */
  constructor(match: P.AnyMatch, props: MethodDefinitionProps) {
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
  /** Explicit `async` prop wins; otherwise inherit from enclosing `match.nestedScope.async`. */
  get isAsync(): boolean {
    if (typeof this.async === "boolean") return this.async
    return !!(this.match.nestedScope as (P.Scope & { async?: boolean }) | undefined)?.async
  }
  /** `methodName`, quoted when used `asProperty` with a non-legal-identifier name; `""` if unset. */
  getMethodName(): string {
    const { methodName } = this
    if (!methodName) return ""
    if (this.asProperty && !isLegalIdentifier(methodName)) return `'${methodName}'`
    return methodName
  }
  /** SIDE EFFECT: `console.warn`s if `asProperty` is set but `methodName` is missing. */
  compile(): string {
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
  /** Render `error` (if any) prefixed with a space -- `null` when there's no error. */
  renderError(): ReactNode {
    if (!this.error) return null
    return render.Fragment(
      <>
        {render.SPACE}
        {this.error.component}
      </>
    )
  }
  /** SIDE EFFECT: `console.warn`s if `asProperty` is set but `methodName` is missing. */
  renderChildren(): ReactNode {
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

////////////////
// ## Object literals
////////////////

/** ObjectLiteral -- bag of properties.
 *  - `properties` is an array of PropertyValues.
 *  - `wrap` (optional) is `true` to force one-property-per-line -- defaults to wrapping past 2 properties
 *    or when any property is a method.
 *  TODO: datatype???
 */
export type ObjectLiteralProps = Prettify<{
  properties?: Array<ObjectLiteralProperty | MethodDefinition>
  wrap?: boolean
}>

export class ObjectLiteral extends Expression {
  declare properties: Array<ObjectLiteralProperty | MethodDefinition>
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "object"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  /** SIDE EFFECT: sets `asProperty = true` on any `MethodDefinition` passed in via `properties`. */
  constructor(match: P.AnyMatch, { properties, ...props }: ObjectLiteralProps = {}) {
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
  /** Default: wrap past 2 properties, or if any property is a method.  Override via constructor or setter. */
  /*@overridable*/
  get wrap(): boolean {
    return this.properties.length > 2 || this.properties.some((item) => item instanceof MethodDefinition)
  }
  set wrap(wrap: boolean) {
    this.override("wrap", wrap)
  }
  /** Append a plain `property: value` pair.  SIDE EFFECT: mutates `this.properties`. */
  addProp(property: string | PropertyLiteral, value: string | Expression): void {
    // convert string value to StringLiteral
    const propertyValue = typeof value === "string" ? new StringLiteral(this.match, { value }) : value
    this.assert(
      propertyValue instanceof Expression,
      `AST.ObjectLiteral.addProp(${property}): value must be an Expression`,
      propertyValue
    )
    this.properties.push(new ObjectLiteralProperty(this.match, { property, value: propertyValue }))
  }
  /**
   * Append `method` as a named method property.
   * SIDE EFFECT: mutates `this.properties`, and sets `method.methodName`/`method.asProperty` on `method`
   * itself (overwriting whatever was there).
   */
  addMethod(property: string, method: MethodDefinition): void {
    this.assert(
      method instanceof MethodDefinition,
      `AST.ObjectLiteral.addMethod(${property}): method must be a MethodDefinition`,
      method
    )
    method.methodName = property
    method.asProperty = true
    this.properties.push(method)
  }
  compile(): string {
    const { wrap } = this
    const delimiter = wrap ? stringify.INDENTED_COMMA : stringify.SPACED_COMMA
    return stringify.Block({
      wrap,
      space: !wrap,
      children: stringify.List({ items: this.properties, delimiter })
    })
  }
  renderChildren(): ReactNode {
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

/** ObjectLiteralProperty type.
 *  - `property` is normalized property name.
 *  - `value` (optional) is property value.  If omitted, compiles as JS shorthand property
 *    (`{ prop }` ~== `{ prop: prop }`), assuming a same-named local variable is in scope.
 *  - `error` (optional) is a parse error associated with this property.
 */
export type ObjectLiteralPropertyProps = Prettify<{
  property: string | PropertyLiteral
  value?: Expression
  error?: ParseError
}>

export class ObjectLiteralProperty extends ASTNode {
  declare property: PropertyLiteral
  declare value: Expression | undefined
  declare error: ParseError | undefined
  /** Constructor also accepts a bare `string` `property` as shorthand for `new PropertyLiteral(property)`. */
  constructor(match: P.AnyMatch, props: ObjectLiteralPropertyProps) {
    super(match, props)
    if (typeof this.property === "string") this.property = new PropertyLiteral(this.match, this.property)
    this.assertType("property", PropertyLiteral)
    this.assertType("value", Expression, OPTIONAL)
    this.assertType("error", ParseError, OPTIONAL)
    // this.assert(this.property.isLegalIdentifier || !!this.value, "Non-legal identifiers must specify a value!")
  }
  /** Compiles as shorthand `prop` when `value` is missing, else `prop: value`. */
  compile(): string {
    const error = this.error ? ` ${this.error.compile()}` : ""
    const prop = this.property.compile()
    // If no value, assume it's available as a local variable.
    if (!this.value) return `${prop}${error}`
    return `${prop}: ${this.value.compile()}${error}`
  }
  renderChildren(): ReactNode {
    // If no value, assume it's available as a local variable.
    const value =
      !!this.value && render.Fragment(render.COLON_AND_SPACE, <span className="value">{this.value.component}</span>)
    const error = !!this.error && render.Fragment(render.SPACE, this.error.component)
    return render.Fragment(<span className="property">{this.property.component}</span>, value, error)
  }
}

////////////////
// ## Statements
////////////////

/** Statement abstract type. */
export class Statement extends ASTNode {}

/** StatementGroup -- set of random statements which does NOT get indented with curly braces!
 *  - NOTE: you can use this interchangeably whenever something takes a single `Statement`.
 *  - `statements` is a list of Statements.
 *  - `echoInTests` (overridable getter) is always `false` -- test-mode echo injection
 *    (see `rules/methods.ts`) skips groups since each inner statement is echoed individually.
 */
export type StatementGroupProps = Prettify<{ statements?: Array<Statement | Expression | Comment | BlankLine> }>

export class StatementGroup extends Statement {
  declare statements: Array<Statement | Expression | Comment | BlankLine> | undefined
  /*@proto*/ get echoInTests(): boolean {
    return false
  }
  set echoInTests(echoInTests: boolean) {
    this.override("echoInTests", echoInTests)
  }
  constructor(match: P.AnyMatch, props?: StatementGroupProps) {
    super(match, props)
    this.assertArrayType("statements", [Statement, Expression, Comment, BlankLine], OPTIONAL)
  }
  compile(): string {
    return stringify.List({ items: this.statements, delimiter: stringify.NEWLINE })
  }
  renderChildren(): ReactNode {
    return <render.List items={this.statements} delimiter={render.NEWLINE} />
  }
}

/** StatementBlock -- set of statements which outputs with curly braces around.
 *  - `statements` (optional) is a list of Statements etc.
 *  - `wrap` (optional) set to explicitly control block wrapping -- defaults to wrapping past 1 statement.
 */
export type StatementBlockProps = Prettify<{
  statements?: Array<Statement | Expression | Comment | BlankLine>
  wrap?: boolean
}>

export class StatementBlock extends ASTNode {
  declare statements: Array<Statement | Expression | Comment | BlankLine> | undefined
  /** SIDE EFFECT: unwinds a single nested `StatementGroup` into this block's own `statements`. */
  constructor(match: P.AnyMatch, props?: StatementBlockProps) {
    super(match, props)
    this.assertArrayType("statements", [Statement, Expression, Comment, BlankLine], OPTIONAL)
    // Unwind any single nested StatementGroups
    while (this.statements?.length === 1 && this.statements[0] instanceof StatementGroup) {
      this.statements = this.statements[0].statements
    }
  }
  /** Default: wrap once there's more than 1 statement.  Override via constructor or setter. */
  /*@overridable*/
  get wrap(): boolean {
    return (this.statements?.length ?? 0) > 1
  }
  set wrap(wrap: boolean) {
    this.override("wrap", wrap)
  }
  compile(): string {
    return stringify.Block({
      wrap: this.wrap,
      children: stringify.List({
        items: this.statements,
        delimiter: stringify.NEWLINE
      })
    })
  }
  renderChildren(): ReactNode {
    if (!this.statements || !this.statements.length) return render.EMPTY_BLOCK
    return (
      <render.Block wrap={this.wrap}>
        <render.List items={this.statements} delimiter={render.INDENTED_NEWLINE} />
      </render.Block>
    )
  }
}

/**
 * try...catch...finally.
 * - `body` is the `try` body.
 * - `errorArg` (optional) is caught error's variable name, used in `catch (errorArg)`.
 * - `catchBlock` (optional) is the `catch` body.
 * - `finallyBlock` (optional) is the `finally` body.
 * - MUST provide at least one of `catchBlock`/`finallyBlock`.
 */
export type TryCatchBlockProps = Prettify<{
  body: StatementBlock | Statement | Expression
  errorArg?: string | VariableExpression
  catchBlock?: StatementBlock | Statement | Expression
  finallyBlock?: StatementBlock | Statement | Expression
}>

export class TryCatchBlock extends StatementGroup {
  declare body: StatementBlock
  declare errorArg: VariableExpression | undefined
  declare catchBlock: StatementBlock | undefined
  declare finallyBlock: StatementBlock | undefined
  /** Normalizes `body`/`catchBlock`/`finallyBlock` into wrapped `StatementBlock`s, `errorArg` into a
   *  `VariableExpression`.
   */
  constructor(match: P.AnyMatch, props: TryCatchBlockProps) {
    super(match, props as unknown as StatementGroupProps)
    this.assertType("body", [StatementBlock, Statement, Expression])
    this.assertType("errorArg", ["string", VariableExpression], OPTIONAL)
    this.assertType("catchBlock", [StatementBlock, Statement, Expression], OPTIONAL)
    this.assertType("finallyBlock", [StatementBlock, Statement, Expression], OPTIONAL)
    this.assert(this.catchBlock || this.finallyBlock, "You must provide at least one catchBlock or finallyBlock")

    if (typeof this.errorArg === "string") this.errorArg = new VariableExpression(match, { name: this.errorArg })
    this.body = convertStatementsToBlock(this.match, this.body as unknown as Statement)
    this.body.wrap = true
    if (this.catchBlock) {
      this.catchBlock = convertStatementsToBlock(this.catchBlock.match, this.catchBlock as unknown as Statement)
      this.catchBlock.wrap = true
    }
    if (this.finallyBlock) {
      this.finallyBlock = convertStatementsToBlock(this.finallyBlock.match, this.finallyBlock as unknown as Statement)
      this.finallyBlock.wrap = true
    }
  }
  compile(): string {
    const { body, errorArg, catchBlock, finallyBlock } = this
    const output = [`try ${body.compile()}`]
    if (catchBlock) output.push(`catch (${errorArg?.compile() ?? ""}) ${catchBlock.compile()}`)
    if (finallyBlock) output.push(`finally ${finallyBlock.compile()}`)
    return output.join("\n")
  }
  renderChildren(): ReactNode {
    const { body, catchBlock, finallyBlock } = this
    const output: ReactNode[] = [
      render.TRY,
      <span key="try" className="try-block">
        {body.component}
      </span>
    ]
    if (catchBlock)
      output.push(
        render.NEWLINE,
        render.CATCH,
        <span key="catch" className="catch-block">
          {catchBlock.component}
        </span>
      )
    if (finallyBlock)
      output.push(
        render.NEWLINE,
        render.FINALLY,
        <span key="finally" className="finally-block">
          {finallyBlock.component}
        </span>
      )
    return render.Fragment(...output)
  }
}

////////////////
// ## Assignment
////////////////

/** AssignmentStatement -- assign value to thing.
 *  - `thing` is an Expression.
 *  - `value` is an Expression.
 *  - `isNewVariable` (optional) if true and `thing` is an Expression, we'll declare the var.
 */
export type AssignmentStatementProps = Prettify<{ thing: Expression; value: Expression; isNewVariable?: boolean }>

export class AssignmentStatement extends Statement {
  declare thing: Expression
  declare value: Expression
  declare isNewVariable: boolean | undefined
  constructor(match: P.AnyMatch, props: AssignmentStatementProps) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertType("value", Expression)
    this.assertType("isNewVariable", "boolean", OPTIONAL)
  }
  /** Should we `export` top-level vars?  Global toggle -- flip to `false` to disable entirely. */
  static EXPORT_VARS = true
  /** Names of top-level vars that we NEVER export, e.g. Mocha's implicit `it`. */
  static EXPORT_BLACKLIST: Record<string, boolean> = {
    it: true
  }
  /** `true` only for a new-variable declaration at `ProjectScope`/`FileScope` whose name isn't blacklisted. */
  get exportVar(): boolean {
    if (!AssignmentStatement.EXPORT_VARS || !this.isNewVariable) return false
    const { scope } = this.match
    if (!(scope instanceof P.ProjectScope || scope instanceof P.FileScope)) return false
    const varName = String(this.thing.compile())
    return !AssignmentStatement.EXPORT_BLACKLIST[varName]
  }
  compile(): string {
    const { thing, value, isNewVariable } = this
    const export_ = this.exportVar ? "export " : ""
    const declarator = isNewVariable ? "let " : ""
    return `${export_}${declarator}${thing.compile()} = ${value.compile()}`
  }
  get className(): string {
    return [
      //
      super.className,
      this.exportVar && "export",
      this.isNewVariable && "declaration"
    ]
      .filter(Boolean)
      .join(" ")
  }
  renderChildren(): ReactNode {
    return render.Fragment(
      this.exportVar && render.EXPORT,
      !!this.isNewVariable && render.LET,
      <span className="thing">{this.thing.component}</span>,
      render.EQUALS,
      <span className="value">{this.value.component}</span>
    )
  }
}

/** DestructuredAssignment -- pull multiple variables with defaults out of a `thing`.
 *  - `thing` is an Expression.
 *  - `variables` are VariableExpressions, possibly with defaults.
 *  - `isNewVariable` (optional) if true and `thing` is an Expression, we'll declare the var.
 */
export type DestructuredAssignmentProps = Prettify<{
  thing: Expression
  variables: VariableExpression[]
  isNewVariable?: boolean
}>

export class DestructuredAssignment extends Statement {
  declare thing: Expression
  declare variables: VariableExpression[]
  declare isNewVariable: boolean | undefined
  constructor(match: P.AnyMatch, props: DestructuredAssignmentProps) {
    super(match, props)
    this.assertType("thing", Expression)
    this.assertArrayType("variables", VariableExpression)
    this.assertType("isNewVariable", "boolean", OPTIONAL)
  }
  /** Compiles as `{ variables } = thing`, or `let { variables } = thing` when `isNewVariable`. */
  compile(): string {
    const declarator = this.isNewVariable ? "let " : ""
    const vars = stringify.InCurlies({
      space: true,
      children: stringify.List({
        items: this.variables
      })
    })
    return `${declarator}${vars} = ${this.thing.compile()}`
  }
  get className(): string {
    return `${super.className}${this.isNewVariable ? " declaration" : ""}`
  }
  renderChildren(): ReactNode {
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
export type ReturnStatementProps = Prettify<{ value?: Expression }>

export class ReturnStatement extends Statement {
  declare value: Expression | undefined
  constructor(match: P.AnyMatch, props?: ReturnStatementProps) {
    super(match, props)
    this.assertType("value", Expression, OPTIONAL)
  }
  /** Compiles as bare `return` when `value` is missing, else `return value`. */
  compile(): string {
    if (!this.value) return "return"
    return `return ${this.value.compile()}`
  }
  renderChildren(): ReactNode {
    const value = !!this.value && render.Fragment(render.SPACE, <span className="value">{this.value.component}</span>)
    return render.Fragment(render.RETURN, value)
  }
}

////////////////
// ## Classes & instances
////////////////

/** ClassDeclaration -- empty `export class Type extends SuperType {}` stub.
 *  - `type` is a TypeExpression.
 *  - `superType` (optional) is a TypeExpression.
 *
 *    NOTE: doc previously also listed an `instanceType` prop "for lists of a certain type" -- no such
 *    prop exists on `ClassDeclarationProps`; removed here since it didn't match the code.
 */
export type ClassDeclarationProps = Prettify<{ type: TypeExpression; superType?: TypeExpression }>

export class ClassDeclaration extends Statement {
  declare type: TypeExpression
  declare superType: TypeExpression | undefined
  constructor(match: P.AnyMatch, props: ClassDeclarationProps) {
    super(match, props)
    this.assertType("type", TypeExpression)
    this.assertType("superType", TypeExpression, OPTIONAL)
  }
  compile(): string {
    const { type, superType } = this
    const superDeclarator = superType ? `extends ${superType.name} ` : ""
    return `export class ${type.name} ${superDeclarator}{}`
  }
  renderChildren(): ReactNode {
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

/** NewInstanceExpression -- `new Type(props)`.
 * - `type` is a TypeExpression.
 * - `props` (optional) is an ObjectLiteral.
 */
export type NewInstanceExpressionProps = Prettify<{ type: TypeExpression; props?: ObjectLiteral }>

export class NewInstanceExpression extends Expression {
  declare type: TypeExpression
  declare props: ObjectLiteral | undefined
  constructor(match: P.AnyMatch, props: NewInstanceExpressionProps) {
    super(match, props)
    this.assertType("type", TypeExpression)
    this.assertType("props", ObjectLiteral, OPTIONAL)
  }
  /** Compiles as `new Type()` (empty parens) when `props` is missing, else `new Type(props)`. */
  compile(): string {
    const props = stringify.InParens({ children: this.props?.compile() })
    return `new ${this.type.compile()}${props}`
  }
  renderChildren(): ReactNode {
    const props = this.props ? <render.InParens>{this.props.component}</render.InParens> : render.EMPTY_PARENS
    return render.Fragment(render.NEW, <span className="type">{this.type.component}</span>, props)
  }
}

/** ListExpression -- `[items]`.
 * - `items` (optional) is a list of Expressions.
 */
export type ListExpressionProps = Prettify<{ items?: Expression[] }>

export class ListExpression extends Expression {
  declare items: Expression[] | undefined
  constructor(match: P.AnyMatch, props: ListExpressionProps) {
    super(match, props)
    this.assertArrayType("items", Expression, OPTIONAL)
  }
  compile(): string {
    return stringify.InSquareBrackets({
      children: stringify.List({ items: this.items })
    })
  }
  renderChildren(): ReactNode {
    return (
      <render.InSquareBrackets>
        <render.List items={this.items} />
      </render.InSquareBrackets>
    )
  }
}

////////////////
// ## Property definition
////////////////

/**
 * PropertyDefinition: `spellCore.define(thing, property, {...})`.
 * - `thing` (required) is an Expression.
 * - `property` (required) is PropertyLiteral or string.
 * - `value` (optional) is an Expression.
 * - `initializer` (optional) is an initializer MethodDefinition.
 * - `get` (optional) is a MethodDefinition for property `getter`.
 * - `set` (optional) is a MethodDefinition for `setter` (which should specify `arg`).
 */
export type PropertyDefinitionProps = Prettify<{
  thing: Expression
  property: string | PropertyLiteral
  value?: Expression
  initializer?: MethodDefinition
  get?: MethodDefinition
  set?: MethodDefinition
}>

export class PropertyDefinition extends Statement {
  declare thing: Expression
  declare property: PropertyLiteral
  declare value: Expression | undefined
  declare initializer: MethodDefinition | undefined
  declare get: MethodDefinition | undefined
  declare set: MethodDefinition | undefined
  constructor(match: P.AnyMatch, props: PropertyDefinitionProps) {
    super(match, props)
    this.assertType("thing", Expression)
    if (typeof this.property === "string") this.property = new PropertyLiteral(this.match, this.property)
    this.assertType("property", PropertyLiteral)
    this.assertType("value", Expression, OPTIONAL)
    this.assertType("initializer", MethodDefinition, OPTIONAL)
    this.assertType("get", MethodDefinition, OPTIONAL)
    this.assertType("set", MethodDefinition, OPTIONAL)
  }
  /**
   * Builds -- and memoizes -- the `CoreMethodInvocation` (`spellCore.define(thing, 'property', {...})`)
   * that `compile()`/`renderChildren()` delegate to.
   * - Descriptor object literal only gets `value`/`initializer`/`get`/`set` keys that were actually passed.
   */
  /*@memoize*/
  get definition(): CoreMethodInvocation {
    return this.derived("definition", () => {
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
    })
  }
  compile(): string {
    return this.definition.compile()
  }
  renderChildren(): ReactNode {
    return this.definition.component
  }
}

////////////////
// ## Conditionals
////////////////

/** IfStatement.
 * - `condition` is an Expression.
 * - `statements` is a Statement or Expression.
 */
export type IfStatementProps = Prettify<{
  condition: Expression
  statements?: Statement | StatementBlock | Statement[]
}>

export class IfStatement extends Statement {
  declare condition: ParenthesizedExpression
  declare statements: StatementBlock
  /** SIDE EFFECT: wraps `condition` in parens (unless already parenthesized) and normalizes `statements`
   *  into a `StatementBlock`. */
  constructor(match: P.AnyMatch, props: IfStatementProps) {
    super(match, props)
    this.assertType("condition", Expression)
    // wrap condition in parens if necessary
    if (!(this.condition instanceof ParenthesizedExpression)) {
      this.condition = new ParenthesizedExpression((this.condition as Expression).match, {
        expression: this.condition as Expression
      })
    }
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  compile(): string {
    return `if ${this.condition.compile()} ${this.statements.compile()}`
  }
  renderChildren(): ReactNode {
    return render.Fragment(
      render.IF,
      <span className="condition">{this.condition.component}</span>,
      render.SPACE,
      this.statements.component
    )
  }
}

/** ElseIfStatement.
 * - `condition` is an Expression.
 * - `statements` is a Statement or Expression.
 */
export type ElseIfStatementProps = Prettify<{
  condition: Expression
  statements?: Statement | StatementBlock | Statement[]
}>

export class ElseIfStatement extends Statement {
  declare condition: ParenthesizedExpression
  declare statements: StatementBlock
  /** SIDE EFFECT: wraps `condition` in parens (unless already parenthesized) and normalizes `statements`
   *  into a `StatementBlock`. */
  constructor(match: P.AnyMatch, props: ElseIfStatementProps) {
    super(match, props)
    this.assertType("condition", Expression)
    // wrap condition in parens if necessary
    if (!(this.condition instanceof ParenthesizedExpression)) {
      this.condition = new ParenthesizedExpression((this.condition as Expression).match, {
        expression: this.condition as Expression
      })
    }
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  compile(): string {
    return `else if ${this.condition.compile()} ${this.statements.compile()}`
  }
  renderChildren(): ReactNode {
    return render.Fragment(
      render.ELSE,
      render.IF,
      <span className="condition">{this.condition.component}</span>,
      render.SPACE,
      this.statements.component
    )
  }
}

/** ElseStatement.
 * - `statements` is a Statement or Expression.
 */
export type ElseStatementProps = Prettify<{ statements?: Statement | StatementBlock | Statement[] }>

export class ElseStatement extends Statement {
  declare statements: StatementBlock
  constructor(match: P.AnyMatch, props?: ElseStatementProps) {
    super(match, props)
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  compile(): string {
    return `else ${this.statements.compile()}`
  }
  renderChildren(): ReactNode {
    return render.Fragment(render.ELSE, this.statements.component)
  }
}

/** TernaryExpression:  `(condition ? trueValue : falseValue)`.
 * - `condition` is an Expression.
 * - `trueValue` is an Expression.
 * - `falseValue` is an Expression.
 */
export type TernaryExpressionProps = Prettify<{ condition: Expression; trueValue: Expression; falseValue: Expression }>

export class TernaryExpression extends Expression {
  declare condition: Expression
  declare trueValue: Expression
  declare falseValue: Expression
  constructor(match: P.AnyMatch, props: TernaryExpressionProps) {
    super(match, props)
    this.assertType("condition", Expression)
    this.assertType("trueValue", Expression)
    this.assertType("falseValue", Expression)
  }
  compile(): string {
    const { condition, trueValue, falseValue } = this
    return stringify.InParens({
      children: `${condition.compile()} ? ${trueValue.compile()} : ${falseValue.compile()}`
    })
  }
  renderChildren(): ReactNode {
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

////////////////
// ## Processes
////////////////

/**
 * Start a `name`d process (or animation).
 * - `name` (string) is the process name.
 * - `exclusive` (boolean, optional) if `true`, process can only be run once at a time.
 */
export type StartProcessInvocationProps = Prettify<{ name: string; exclusive?: boolean }>

export class StartProcessInvocation extends StatementGroup {
  /** When `exclusive`, prepends a guard statement that `return`s early if process is already running. */
  constructor(match: P.AnyMatch, { name, exclusive = false, ...props }: StartProcessInvocationProps) {
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
export type StopProcessInvocationProps = Prettify<{ name: string }>

export class StopProcessInvocation extends CoreMethodInvocation {
  constructor(match: P.AnyMatch, { name }: StopProcessInvocationProps) {
    super(match, {
      methodName: "stopProcess",
      args: [new QuotedExpression(match, name)]
    })
  }
}

////////////////
// ## JSX
////////////////

/** JSXElement -- e.g. `<div a={1}>text</div>`, compiled to `spellCore.element({...})`.
 * - `tagName` is element tag name, e.g. `"div"`.
 * - `attrs` (optional) is array of JSXAttributes.
 * - `children` is array of child nodes -- JSXElement/JSXEndTag/JSXText/JSXExpression.
 */
export type JSXElementProps = Prettify<{
  tagName: string
  attrs?: JSXAttribute[]
  children: Array<JSXElement | JSXEndTag | JSXText | JSXExpression>
}>

export class JSXElement extends Expression {
  declare tagName: string
  declare attrs: JSXAttribute[] | undefined
  declare children: Array<JSXElement | JSXEndTag | JSXText | JSXExpression>
  constructor(match: P.AnyMatch, props: JSXElementProps) {
    super(match, props)
    this.assertType("tagName", "string")
    this.assertArrayType("attrs", JSXAttribute, OPTIONAL)
    this.assertArrayType("children", [JSXElement, JSXEndTag, JSXText, JSXExpression])
  }
  /**
   * Builds -- and memoizes -- `spellCore.element({ tag, props, children })` CoreMethodInvocation that
   * `compile()`/`renderChildren()` delegate to.
   * - `props` key only appears when there's at least one attr; `children` key only when there's at
   *   least one child whose own `output` isn't falsy (e.g. `JSXEndTag.output` is always `undefined`
   *   and gets filtered out).
   */
  /*@memoize*/
  get output(): CoreMethodInvocation {
    return this.derived("output", () => {
      const properties: ObjectLiteralProperty[] = [
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
      if (items && items.length) {
        properties.push(
          new ObjectLiteralProperty(this.match, {
            property: "children",
            value: new ArrayLiteral(this.match, { items: items as Expression[], wrap: true })
          })
        )
      }

      return new CoreMethodInvocation(this.match, {
        methodName: "element",
        args: [new ObjectLiteral(this.match, { properties, wrap: (attrs && attrs.wrap) || false })]
      })
    })
  }
  compile(): string {
    return this.output.compile()
  }
  renderChildren(): ReactNode {
    return this.output.component
  }
}

/** JSXAttribute -- e.g. `a={1}` or bare `d` (boolean shorthand).
 * - `name` is attribute name.
 * - `value` (optional) is attribute value Expression -- missing means boolean-shorthand attr, e.g. bare `d`.
 * - `error` (optional) is parse error associated with this attribute.
 */
export type JSXAttributeProps = Prettify<{ name: string; value?: Expression; error?: ParseError }>

export class JSXAttribute extends Expression {
  declare name: string
  declare value: Expression | undefined
  declare error: ParseError | undefined
  constructor(match: P.AnyMatch, props: JSXAttributeProps) {
    super(match, props)
    this.assertType("name", "string")
    this.assertType("value", Expression, OPTIONAL)
    this.assertType("error", ParseError, OPTIONAL)
  }
  /**
   * Builds -- and memoizes -- this attribute as either a `MethodDefinition` (when `value` is one,
   * i.e. an inline method prop) or a plain `ObjectLiteralProperty`, for use inside `JSXElement.output`'s
   * `props` object.
   * - If no `value`: `undefined` when there's a parse `error`, else `true` per JSX spec for an
   *   empty/boolean attribute.
   */
  /*@memoize*/
  get output(): MethodDefinition | ObjectLiteralProperty {
    return this.derived("output", () => {
      // If we didn't get a value:
      //  if we have a parse error, return `undefined`
      //  otherwise return `true` as per spec for an empty attribute
      const value: Expression =
        this.value || (this.error ? new UndefinedLiteral(this.match) : new BooleanLiteral(this.match, true))
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
    })
  }
}

/** JSXEndTag -- a closing tag, e.g. `</div>`.  Parsed only to be discarded.
 * - `tagName` is closed tag's name.
 */
export type JSXEndTagProps = Prettify<{ tagName: string }>

export class JSXEndTag extends Expression {
  declare tagName: string
  constructor(match: P.AnyMatch, props: JSXEndTagProps) {
    super(match, props)
    this.assertType("tagName", "string")
  }
  /** JSXEndTags never contribute to compiled output. */
  get output(): undefined {
    return undefined
  }
}

/** JSXText -- plain text content between tags.
 * - `value` is text content.
 * - `raw` (optional) is original unnormalized input string.
 */
export type JSXTextProps = Prettify<{ value: string; raw?: string }>

export class JSXText extends Expression {
  declare value: string
  declare raw: string | undefined
  constructor(match: P.AnyMatch, props: JSXTextProps) {
    super(match, props)
    this.assertType("value", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
  /** Wraps `value` as a plain `StringLiteral` -- memoized, but trivial enough it barely matters. */
  /*@memoize*/
  get output(): StringLiteral {
    return this.derived("output", () => {
      return new StringLiteral(this.match, this.value)
    })
  }
}

/** JSXExpression -- e.g. `{someExpression}` inside JSX children.
 * - `expression` (optional) is contained Expression -- missing paired with `error` for a broken `{}`.
 * - `error` (optional) is parse error associated with this expression.
 */
export type JSXExpressionProps = Prettify<{ expression?: Expression; error?: ParseError }>

export class JSXExpression extends Expression {
  declare expression: Expression | undefined
  declare error: ParseError | undefined
  constructor(match: P.AnyMatch, props: JSXExpressionProps) {
    super(match, props)
    this.assertType("expression", Expression, OPTIONAL)
    this.assertType("error", ParseError, OPTIONAL)
  }
  /**
   * `expression` as-is normally; when there's an `error`, wraps it (or a `NullLiteral` placeholder if
   * `expression` is also missing) in an `ExpressionWithComment` so error surfaces in compiled output.
   */
  /*@memoize*/
  get output(): Expression | ExpressionWithComment | undefined {
    return this.derived("output", () => {
      if (this.error) {
        const expression = this.expression || new NullLiteral(this.match)
        return new ExpressionWithComment(this.match, {
          expression,
          comment: this.error
        })
      }
      return this.expression
    })
  }
}
