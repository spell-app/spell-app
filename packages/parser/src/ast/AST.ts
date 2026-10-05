/** AST classes.  These do not necessarily correspond do anyone else's AST. */

import { getSuperHierarchy, Assertable, OPTIONAL } from "$/util"
import { P } from "$/parser"

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
 * Normalize `statements` (single `ASTStatement`, already-built `ASTStatementBlock`, or array) into one
 * `ASTStatementBlock`.
 * - Used by anything that accepts a loose statement/array of statements for its body, e.g.
 *   `ASTIfStatement`, `ASTTryCatchBlock`.
 */
function convertStatementsToBlock(
  match: P.AnyMatch,
  statements: ASTStatement | ASTStatementBlock | ASTStatement[] | undefined
): ASTStatementBlock {
  if (!statements) return new ASTStatementBlock(match)
  if (statements instanceof ASTStatementBlock) return statements
  if (Array.isArray(statements)) return new ASTStatementBlock(match, { statements })
  return new ASTStatementBlock(match, { statements: [statements] })
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
   * - Most subclasses return a `string` of Javascript source, but `ASTLiteral` subclasses
   *   (e.g. `ASTNumericLiteral`) may return raw underlying value instead.
   */
  compile(): unknown {
    throw new TypeError(`AST ${this.nodeType} must implement compile()`)
  }

  /**
   * Datatype this node represents, in spell's words, e.g. `text`, `number`, `Card` -- see `P.Datatype`.
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
  // ## Rendering as markup
  ////////////////

  /**
   * Markup drawing this node as syntax-colored Javascript:  a `<span>` with our `className` around
   * `renderChildren()` -- see `render.Node()`.
   * - Plain data, not DOM:  the app's `<ASTViewer>` draws it with `render.toDOM()`.
   */
  /*@memoize*/
  get markup(): P.MarkupElement {
    return this.derived("markup", () => render.Node(this))
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
   * Markup to draw INSIDE our `markup`'s outer element, which has `node.className`
   * (e.g. `ASTNode ASTExpression ASTStringLiteral`) set.
   */
  renderChildren(): P.Markup {
    return null
  }

  // TEST: ensure that `compile()` output is the same as `render.toText(ast.markup)` -- modulo indentation, which
  //  the app's viewer draws with CSS:  `toText()` lacks it.
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
export class ASTBlankLine extends ASTNode {
  compile(): string {
    return "" // "\n"
  }
  renderChildren(): P.Markup {
    return null // render.NEWLINE
  }
}

/** Base of all Expression types.  Useful for `instanceof`.
 *  - Try to figure out `datatype` if you can, either as a value or as a getter.
 */
export class ASTExpression extends ASTNode {}

/** Expression with attached comment.
 *  - `expression` is the wrapped Expression.
 *  - `comment` is comment attached after it, e.g. an `ASTParseError` explaining why it's suspect.
 */
export type ASTExpressionWithCommentProps = Prettify<{
  expression: ASTExpression
  comment: ASTBlockComment
}>

export class ASTExpressionWithComment extends ASTExpression {
  declare expression: ASTExpression
  declare comment: ASTBlockComment
  constructor(match: P.AnyMatch, props: ASTExpressionWithCommentProps) {
    super(match, props)
    this.assertType("expression", ASTExpression)
    this.assertType("comment", ASTBlockComment)
  }
  compile(): string {
    return `${this.expression.compile()} ${this.comment.compile()}`
  }
  renderChildren(): P.Markup {
    return render.Fragment(this.expression.markup, render.SPACE, this.comment.markup)
  }
}

/** Generic Literal type.  Useful for `instanceof`.
 *  - `value` is actual JS value, which by default we assume we can just output.
 *  - `raw` (optional) is raw input value.
 */
export class ASTLiteral extends ASTExpression {
  declare value: unknown
  declare raw: string | undefined
  compile(): unknown {
    return this.value
  }
  renderChildren(): P.Markup {
    return render.span("value", this.value as P.Markup)
  }
}

/** NumericLiteral type.
 *  - `value` is the number.
 *  - `raw` (optional) is original input string.
 */
export type ASTNumericLiteralProps = Prettify<{ value: number; raw?: string }>

export class ASTNumericLiteral extends ASTLiteral {
  declare value: number
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "number"
  }
  /** Constructor also accepts a bare `number` as shorthand for `{ value }`. */
  constructor(match: P.AnyMatch, props: number | ASTNumericLiteralProps) {
    if (typeof props === "number") props = { value: props }
    super(match, props)
    this.assertType("value", "number")
  }
}

/** StringLiteral type.
 *  - `value` is the string.
 *  - `raw` (optional) is original input string.
 */
export type ASTStringLiteralProps = Prettify<{ value: string; raw?: string }>

export class ASTStringLiteral extends ASTLiteral {
  declare value: string
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "text"
  }
  /** Constructor also accepts a bare `string` as shorthand for `{ value }`. */
  constructor(match: P.AnyMatch, props: string | ASTStringLiteralProps) {
    if (typeof props === "string") props = { value: props }
    super(match, props)
    this.assertType("value", "string")
  }
}

/** BooleanLiteral type.
 *  - `value` is the boolean.
 *  - `raw` (optional) is original input string.
 */
export type ASTBooleanLiteralProps = Prettify<{ value: boolean; raw?: string }>

export class ASTBooleanLiteral extends ASTLiteral {
  declare value: boolean
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "choice"
  }
  /** Constructor also accepts a bare `boolean` as shorthand for `{ value }`. */
  constructor(match: P.AnyMatch, props: boolean | ASTBooleanLiteralProps) {
    if (typeof props === "boolean") props = { value: props }
    super(match, props)
    this.assertType("value", "boolean")
  }
  compile(): string {
    return this.value ? "true" : "false"
  }
  renderChildren(): P.Markup {
    return this.value ? "true" : "false"
  }
}

/** RegExpLiteral type.
 *  - `value` is the `RegExp`.
 */
export type ASTRegExpLiteralProps = Prettify<{ value: RegExp }>

export class ASTRegExpLiteral extends ASTLiteral {
  declare value: RegExp
  /*@readonly*/ /*@proto*/ get datatype(): RegExpConstructor {
    return RegExp
  }
  constructor(match: P.AnyMatch, props: ASTRegExpLiteralProps) {
    super(match, props)
    this.assertType("value", RegExp)
  }
}

/** NullLiteral type.  TODO: ???? */
export class ASTNullLiteral extends ASTLiteral {
  // TODO: ???
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "nothing"
  }
  constructor(match: P.AnyMatch, props?: object) {
    super(match, props)
    this.assertType("value", undefined)
  }
  compile(): string {
    return "null"
  }
  renderChildren(): P.Markup {
    return render.span("value", "null")
  }
}

/** UndefinedLiteral type.  TODO: ???? */
export class ASTUndefinedLiteral extends ASTLiteral {
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "nothing"
  }
  constructor(match: P.AnyMatch, props?: object) {
    super(match, props)
    this.assertType("value", undefined)
  }
  compile(): string {
    return "undefined"
  }
  renderChildren(): P.Markup {
    return render.span("value", "undefined")
  }
}

/** ThisLiteral type -- represents JS `this`. */
export class ASTThisLiteral extends ASTLiteral {
  compile(): string {
    return "this"
  }
  renderChildren(): P.Markup {
    return render.span("value", "this")
  }
}

/** KeywordLiteral type.
 *  - `value` is raw input converted into a JS-legal keyword.
 *  - `raw` (optional) is raw input string.
 */
export type ASTKeywordLiteralProps = Prettify<{ value: string; raw?: string }>

export class ASTKeywordLiteral extends ASTLiteral {
  declare value: string
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "text"
  }
  /** SIDE EFFECT: routes through `this.override()` so a subclass instance can force a specific datatype. */
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  constructor(match: P.AnyMatch, props: ASTKeywordLiteralProps) {
    super(match, props)
    this.assertType("value", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
}

/** ArrayLiteral.
 *  - `items` (optional) is array of Expressions.
 *  - `wrap` (optional) is `true` if we should wrap children -- defaults to wrapping past 2 items.
 */
export type ASTArrayLiteralProps = Prettify<{ items?: ASTExpression[]; wrap?: boolean }>

export class ASTArrayLiteral extends ASTLiteral {
  declare items: ASTExpression[] | undefined
  constructor(match: P.AnyMatch, props: ASTArrayLiteralProps) {
    super(match, props)
    this.assertArrayType("items", ASTExpression, OPTIONAL)
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
  renderChildren(): P.Markup {
    return render.Array({ items: this.items, wrap: this.wrap })
  }
}

/** Enumeration -- literal array where each item also has a plain string/number `value`.
 *  - `enumeration` is array of Expressions (the AST for each item, for rendering/compiling).
 *  - `values` is parallel array of raw strings or numbers.
 */
export type ASTEnumerationProps = Prettify<{ enumeration: ASTExpression[]; values: Array<string | number> }>

export class ASTEnumeration extends ASTLiteral {
  declare enumeration: ASTExpression[]
  declare values: Array<string | number>
  constructor(match: P.AnyMatch, props: ASTEnumerationProps) {
    super(match, props)
    this.assertArrayType("enumeration", ASTExpression)
    this.assertArrayType("values", ["string", "number"])
  }
  compile(): string {
    return stringify.Array({ items: this.enumeration })
  }
  renderChildren(): P.Markup {
    return render.Array({ items: this.enumeration })
  }
}

////////////////
// ## Quoting / templating expressions
////////////////

/**
 * QuotedExpression -- use to wrap `expression` in single quotes.
 */
export type ASTQuotedExpressionProps = Prettify<{ expression: ASTExpression }>

export class ASTQuotedExpression extends ASTExpression {
  declare expression: ASTExpression
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "text"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  /** Constructor also accepts a bare `string` as shorthand for `{ expression: new ASTStringLiteral(value) }`. */
  constructor(match: P.AnyMatch, props: string | ASTQuotedExpressionProps) {
    if (typeof props === "string") props = { expression: new ASTStringLiteral(match, { value: props }) }
    super(match, props)
    this.assertType("expression", ASTExpression)
  }
  compile(): string {
    return stringify.InSingleQuotes({ children: String(this.expression.compile()) })
  }
  renderChildren(): P.Markup {
    return render.InSingleQuotes({ children: render.span("expression", this.expression.markup) })
  }
}

/**
 * BackTickExpression -- use to wrap `expression` AST in back-ticks.
 */
export type ASTBackTickExpressionProps = Prettify<{ expression: ASTExpression }>

export class ASTBackTickExpression extends ASTExpression {
  declare expression: ASTExpression
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "text"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  /** Constructor also accepts a bare `string` as shorthand for `{ expression: new ASTStringLiteral(value) }`. */
  constructor(match: P.AnyMatch, props: string | ASTBackTickExpressionProps) {
    if (typeof props === "string") props = { expression: new ASTStringLiteral(match, { value: props }) }
    super(match, props)
    this.assertType("expression", ASTExpression)
  }
  compile(): string {
    return stringify.InBackTicks({ children: String(this.expression.compile()) })
  }
  renderChildren(): P.Markup {
    return render.InBackTicks({ children: render.span("expression", this.expression.markup) })
  }
}

/**
 * BacktickSubstitutionExpression -- use to wrap an `${expression}` for use in a backtick string.
 */
export type ASTBacktickSubstitutionProps = Prettify<{ expression: ASTExpression }>

export class ASTBacktickSubstitution extends ASTExpression {
  declare expression: ASTExpression
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "text"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  /** Constructor also accepts a bare `string` as shorthand for `{ expression: new ASTStringLiteral(value) }`. */
  constructor(match: P.AnyMatch, props: string | ASTBacktickSubstitutionProps) {
    if (typeof props === "string") props = { expression: new ASTStringLiteral(match, { value: props }) }
    super(match, props)
    this.assertType("expression", ASTExpression)
  }
  compile(): string {
    return "${" + this.expression.compile() + "}"
  }
  renderChildren(): P.Markup {
    return render.Fragment(
      render.span("literal", "${"),
      render.span("expression", this.expression.markup),
      render.span("literal", "}")
    )
  }
}

/**
 * TripleBackTickExpression -- use to wrap `expression` AST in triple-back-ticks.
 */
export type ASTTripleBackTickExpressionProps = Prettify<{ expression: ASTExpression }>

export class ASTTripleBackTickExpression extends ASTExpression {
  declare expression: ASTExpression
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "text"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  /** Constructor also accepts a bare `string` as shorthand for `{ expression: new ASTStringLiteral(value) }`. */
  constructor(match: P.AnyMatch, props: string | ASTTripleBackTickExpressionProps) {
    if (typeof props === "string") props = { expression: new ASTStringLiteral(match, { value: props }) }
    super(match, props)
    this.assertType("expression", ASTExpression)
  }
  compile(): string {
    return stringify.InTripleBackTicks({ children: String(this.expression.compile()) })
  }
  renderChildren(): P.Markup {
    return render.InTripleBackTicks({ children: render.span("expression", this.expression.markup) })
  }
}

////////////////
// ## Properties & variables
////////////////

/** PropertyLiteral -- identifier which refers to some property of an object.
 *  - `value` is normalized property name.  Inferred from `match` if not given.
 *  - `raw` (optional) is input property name.
 */
export type ASTPropertyLiteralProps = Prettify<{ value?: string; raw?: string }>

export class ASTPropertyLiteral extends ASTLiteral {
  declare value: string
  /** Constructor also accepts a bare `string` as shorthand for `{ value }`. */
  constructor(match: P.AnyMatch, props?: string | ASTPropertyLiteralProps) {
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
  renderChildren(): P.Markup {
    const value = render.span("property", this.value)
    return this.isLegalIdentifier ? value : render.InSingleQuotes({ children: value })
  }
}

/** PropertyExpression -- named property of some object.
 *  - `object` is thing to get property from, as an Expression.
 *  - `property` is normalized property name or PropertyLiteral.
 *  TODO: datatype???
 */
export type ASTPropertyExpressionProps = Prettify<{ object: ASTExpression; property: string | ASTPropertyLiteral }>

export class ASTPropertyExpression extends ASTExpression {
  declare object: ASTExpression
  declare property: ASTPropertyLiteral
  constructor(match: P.AnyMatch, props: ASTPropertyExpressionProps) {
    super(match, props)
    this.assertType("object", ASTExpression)
    if (typeof this.property === "string") this.property = new ASTPropertyLiteral(this.match, this.property)
    this.assertType("property", ASTPropertyLiteral)
  }
  /** Compiles as `object.property` when legal identifier, else `object['property']`. */
  compile(): string {
    const prop = this.property.compile()
    if (this.property.isLegalIdentifier) return `${this.object.compile()}.${prop}`
    return `${this.object.compile()}['${prop}']`
  }
  renderChildren(): P.Markup {
    const object = render.span("object", this.object.markup)
    if (this.property.isLegalIdentifier) {
      return render.Fragment(object, render.PERIOD, this.property.markup)
    }
    return render.Fragment(object, render.InSquareBrackets({ children: this.property.markup }))
  }
}

/** VariableExpression -- pointer to a Variable object.
 *  - `name` is normalized type name: dashes and spaces converted to underscores.
 *  - `default` (optional) is AST for default value.  See `ASTDestructuredAssignment`.
 *  - `type` (optional) is `"argument"` or `"this"` etc.
 *
 *    CURRENTLY UNUSED
 *  - `raw` (optional) is original input string, unnormalized.
 *  - `variable` (optional) is pointer to scope Variable, if there is one.
 *  - `plurality` (optional) is `"singular"`, `"plural"` or `undefined`.  TODO: derive?
 */
export type ASTVariableExpressionProps = Prettify<{
  name?: string
  default?: ASTExpression
  type?: string
  datatype?: string
  raw?: string
  variable?: P.ScopeVariable
  plurality?: "singular" | "plural"
}>

export class ASTVariableExpression extends ASTExpression {
  declare name: string
  declare default: ASTExpression | undefined
  declare type: string | undefined
  declare raw: string | undefined
  declare variable: P.ScopeVariable | undefined
  declare plurality: "singular" | "plural" | undefined
  /** `name` defaults to `match.value` when not passed. */
  constructor(match: P.AnyMatch, props?: ASTVariableExpressionProps) {
    super(match, props)
    if (!this.name) this.name = this.match.value
    this.assertType("name", "string")
    this.assertType("default", ASTExpression, OPTIONAL)
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
  renderChildren(): P.Markup {
    if (!this.default) return render.span("name", this.name)
    return render.Fragment(render.span("name", this.name), render.EQUALS, render.span("default", this.default.markup))
  }
}

/** AwaitExpression:  `await {expression}`.
 *  - `expression` is Expression to await.
 *  - NOTE: this marks `parentScope` as asynchronous!!!
 */
export type ASTAwaitExpressionProps = Prettify<{ expression: ASTExpression }>

export class ASTAwaitExpression extends ASTExpression {
  declare expression: ASTExpression
  /** NOTE: the method we're in becomes `async` because its body contains us -- see `ASTMethodDefinition.isAsync`. */
  constructor(match: P.AnyMatch, props: ASTAwaitExpressionProps) {
    super(match, props)
    this.assertType("expression", ASTExpression)
  }
  compile(): string {
    return `await ${this.expression.compile()}`
  }
  renderChildren(): P.Markup {
    return render.Fragment(render.AWAIT, this.expression.markup)
  }
}

////////////////
// ## Comments
////////////////

/** Abstract comment type.  Useful for `instanceof`. */
export class ASTComment extends ASTNode {}

/** LineComment type.
 *  - `value` is text of comment (may be empty string).
 *  - `commentSymbol` is comment symbol used -- e.g. `""` for a plain `//`, or a header marker.
 *  - `initialWhitespace` is whitespace between `commentSymbol` and `value`.
 */
export type ASTLineCommentProps = Prettify<{ value: string; commentSymbol?: string; initialWhitespace?: string }>

export class ASTLineComment extends ASTComment {
  declare value: string
  declare commentSymbol: string | undefined
  declare initialWhitespace: string | undefined
  constructor(match: P.AnyMatch, props: ASTLineCommentProps) {
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
  renderChildren(): P.Markup {
    let { commentSymbol = "" } = this
    if (commentSymbol !== "//") commentSymbol = `//${commentSymbol}`
    return render.Fragment(
      render.span("punctuation line-comment-symbol", commentSymbol),
      render.span("whitespace", this.initialWhitespace || " "),
      render.span("comment", this.value)
    )
  }
}

/** BlockComment type.
 *  - `value` is entire contents of original comment, including initial space and newlines.
 */
export type ASTBlockCommentProps = Prettify<{ value: string }>

export class ASTBlockComment extends ASTComment {
  declare value: string
  constructor(match: P.AnyMatch, props: ASTBlockCommentProps) {
    super(match, props)
    this.assertType("value", "string")
  }
  compile(): string {
    return `/* ${this.value} */`
  }
  renderChildren(): P.Markup {
    return render.Fragment(render.OPEN_COMMENT, render.span("comment", this.value), render.CLOSE_COMMENT)
  }
}

/** DocComment type -- a JSDoc comment documenting what follows it, e.g. `/** A card. *\/`.
 *  - `lines` are its lines of text, without comment symbols.
 *  - `*\/` in the text is escaped, so it can't end the comment early.
 */
export type ASTDocCommentProps = Prettify<{ lines: string[] }>

export class ASTDocComment extends ASTComment {
  declare lines: string[]
  constructor(match: P.AnyMatch, props: ASTDocCommentProps) {
    super(match, props)
    this.assertArrayType("lines", "string")
  }
  /** `/** text *\/` for one line;  one ` * ` line each for several. */
  compile(): string {
    const lines = this.lines.map((line) => line.replace(/\*\//g, "*\\/"))
    if (lines.length === 1) return `/** ${lines[0]} */`
    return ["/**", ...lines.map((line) => ` * ${line}`), " */"].join("\n")
  }
  renderChildren(): P.Markup {
    return render.Fragment(render.OPEN_COMMENT, render.span("comment", this.lines.join("\n")), render.CLOSE_COMMENT)
  }
}

/** PreservedComment type -- a `/*! ... *\/` comment, which minifiers keep:  data for tools reading compiled output.
 *  - `lines` are its lines of text, without comment symbols -- `*\/` in them is escaped, so it can't end the
 *    comment early.
 *  - Closes on its last line, to stay short.
 */
export type ASTPreservedCommentProps = Prettify<{ lines: string[] }>

export class ASTPreservedComment extends ASTComment {
  declare lines: string[]
  constructor(match: P.AnyMatch, props: ASTPreservedCommentProps) {
    super(match, props)
    this.assertArrayType("lines", "string")
  }
  /** `/*! first line`, then the rest, the last ending ` *\/`. */
  compile(): string {
    const lines = this.lines.map((line) => line.replace(/\*\//g, "*\\/"))
    return `/*! ${lines.join("\n")} */`
  }
  renderChildren(): P.Markup {
    return render.Fragment(render.OPEN_COMMENT, render.span("comment", this.lines.join("\n")), render.CLOSE_COMMENT)
  }
}

/** BannerComment type -- a section heading, boxed in rows of slashes as wide as its text line:
 *    ```
 *    /////////////
 *    // ## Setup
 *    /////////////
 *    ```
 *  - `value` is the heading's text.
 */
export type ASTBannerCommentProps = Prettify<{ value: string }>

export class ASTBannerComment extends ASTComment {
  declare value: string
  constructor(match: P.AnyMatch, props: ASTBannerCommentProps) {
    super(match, props)
    this.assertType("value", "string")
  }
  compile(): string {
    const heading = `// ## ${this.value}`
    const rule = "/".repeat(heading.length)
    return [rule, heading, rule].join("\n")
  }
  renderChildren(): P.Markup {
    return render.span("comment", this.compile())
  }
}

/** ParserAnnotation type, used for parser annotations injected into output.
 *  - `value` is text of annotation.
 *  - `annotation` (overridable getter) is the leading tag, `"SPELL:"` by default -- `ASTParseError` overrides it.
 */
export class ASTParserAnnotation extends ASTBlockComment {
  /*@proto*/ get annotation(): string {
    return "SPELL:"
  }
  set annotation(annotation: string) {
    this.override("annotation", annotation)
  }
  compile(): string {
    return `/* ${this.annotation} ${this.value} */`
  }
  renderChildren(): P.Markup {
    return render.Fragment(
      render.OPEN_COMMENT,
      render.span("annotation", this.annotation, " "),
      render.span("comment", this.value),
      render.CLOSE_COMMENT
    )
  }
}

/** ParseError type -- an `ASTParserAnnotation` tagged `"PARSE ERROR:"` instead of `"SPELL:"`.
 *  - `value` is text of error.
 */
export class ASTParseError extends ASTParserAnnotation {
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
export type ASTParenthesizedExpressionProps = Prettify<{ expression: ASTExpression }>

export class ASTParenthesizedExpression extends ASTExpression {
  declare expression: ASTExpression
  /** SIDE EFFECT: unwinds nested `ASTParenthesizedExpression`s so we never double-wrap, e.g. `((x))` ~== `(x)`. */
  constructor(match: P.AnyMatch, props: ASTParenthesizedExpressionProps) {
    super(match, props)
    this.assertType("expression", ASTExpression)
    // Unwind nested parenthesis
    while (this.expression instanceof ASTParenthesizedExpression) {
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
  renderChildren(): P.Markup {
    return render.InParens({ children: render.span("expression", this.expression.markup) })
  }
}

/** Not expression.
 *  - `expression` is contained AST Expression.
 *  - `datatype` is ALWAYS `choice`.
 */
export type ASTNotExpressionProps = Prettify<{ expression: ASTExpression }>

export class ASTNotExpression extends ASTExpression {
  declare expression: ASTExpression
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "choice"
  }
  constructor(match: P.AnyMatch, props: ASTNotExpressionProps) {
    super(match, props)
    this.assertType("expression", ASTExpression)
  }
  compile(): string {
    return `!${this.expression.compile()}`
  }
  renderChildren(): P.Markup {
    return render.Fragment(render.BANG, render.span("expression", this.expression.markup))
  }
}

/** InfixExpression:  `<lhs> <operator> <rhs>`. */
export type ASTInfixExpressionProps = Prettify<{ lhs: ASTExpression; operator: string; rhs: ASTExpression }>

export class ASTInfixExpression extends ASTExpression {
  declare lhs: ASTExpression
  declare operator: string
  declare rhs: ASTExpression
  constructor(match: P.AnyMatch, props: ASTInfixExpressionProps) {
    super(match, props)
    this.assertType("lhs", ASTExpression)
    this.assertType("operator", "string")
    this.assertType("rhs", ASTExpression)
  }
  compile(): string {
    return `${this.lhs.compile()} ${this.operator} ${this.rhs.compile()}`
  }
  renderChildren(): P.Markup {
    return render.Fragment(
      render.span("lhs", this.lhs.markup),
      render.span("operator", " ", this.operator, " "),
      render.span("rhs", this.rhs.markup)
    )
  }
}

/**
 * Given an array of Expressions, join them all together with same `operator`.
 * - Right-associates: repeatedly pops off the right end and nests it as `rhs` of a new
 *   `ASTInfixExpression`, so `[a, b, c]` with `+` becomes `a + (b + c)` in tree shape
 *   (though `compile()` output has no visible parens since `ASTInfixExpression` doesn't add them).
 * - Returns single expression unchanged (no `ASTInfixExpression` wrapper) when `expressions.length < 2`.
 * - TODO: convert to class?
 */
export function ASTMultiInfixExpression(
  match: P.AnyMatch,
  { expressions, operator }: { expressions: ASTExpression[]; operator: string }
): ASTExpression | undefined {
  if (expressions.length < 2) return expressions[0]
  const remaining = [...expressions]
  let rhs = remaining.pop() as ASTExpression
  while (remaining.length) {
    const lhs = remaining.pop() as ASTExpression
    rhs = new ASTInfixExpression(match, { lhs, operator, rhs })
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
export type ASTInvocationArgsProps = Prettify<{ args?: ASTExpression[]; wrap?: boolean }>

export class ASTInvocationArgs extends ASTNode {
  declare args: ASTExpression[] | undefined
  /** SIDE EFFECT: unwinds any `ASTParenthesizedExpression` args, e.g. `foo((x))` ~== `foo(x)`. */
  constructor(match: P.AnyMatch, { wrap, ...props }: ASTInvocationArgsProps) {
    super(match, props)
    if (typeof wrap === "boolean") this.wrap = wrap
    this.assertArrayType("args", ASTExpression, OPTIONAL)
    if (this.args) {
      // unwind parenthesized expressions in args
      this.args = this.args.map((arg) => {
        while (arg instanceof ASTParenthesizedExpression) arg = arg.expression
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
  renderChildren(): P.Markup {
    return render.Args({ args: this.args, wrap: this.wrap })
  }
}

/** MethodInvocation:  generic named method invocation, e.g. `methodName(args)`.
 *  - `methodName` is method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - `datatype` (optional) is return datatype as string, try to set if you can.
 *  - `wrap` (optional) set to control arg wrapping explicitly.
 *  - NOTE: this does not ensure that named method is actually defined in scope!!!!
 */
export type ASTMethodInvocationProps = Prettify<{
  methodName: string
  args?: ASTExpression[]
  wrap?: boolean
  datatype?: string
}>

export class ASTMethodInvocation extends ASTExpression {
  declare args: ASTInvocationArgs

  /** Backing field for overridable `methodName` accessor. */
  declare private _methodName: string
  /** `methodName` is a plain get/set pair here -- subclasses (e.g. `ASTConsoleMethodInvocation`) redefine it
   *  as an overridable `@proto` getter with a fixed default. */
  get methodName(): string {
    return this._methodName
  }
  set methodName(methodName: string) {
    this._methodName = methodName
  }

  constructor(match: P.AnyMatch, { args, wrap, ...props }: ASTMethodInvocationProps) {
    super(match, props)
    this.assertType("methodName", "string")
    this.assertType("datatype", "string", OPTIONAL)
    this.args = new ASTInvocationArgs(match, { args, wrap })
  }
  compile(): string {
    return `${this.methodName}${this.args.compile()}`
  }
  renderChildren(): P.Markup {
    return render.Fragment(render.span("method-name", this.methodName), this.args.markup)
  }
}

/** Call a `method` on some `thing` with `args`, e.g. `thing.methodName(args)`.
 *  - `thing` is what we'll call method on.
 *  - `methodName` is method name.
 *  - `args` (optional) is a possibly empty list of Expressions.
 *  - Try to set `datatype` as string or getter if you can.
 */
export type ASTScopedMethodInvocationProps = Prettify<ASTMethodInvocationProps & { thing: ASTExpression }>

export class ASTScopedMethodInvocation extends ASTMethodInvocation {
  declare thing: ASTExpression
  constructor(match: P.AnyMatch, props: ASTScopedMethodInvocationProps) {
    super(match, props)
    // `methodName`, `args`, wrap` and `datatype` are handled by MethodInvocation
    this.assertType("thing", ASTExpression)
  }
  compile(): string {
    return `${this.thing.compile()}.${this.methodName}${this.args.compile()}`
  }
  renderChildren(): P.Markup {
    return render.Fragment(
      render.span("method-scope", this.thing.markup),
      render.span("operator period", "."),
      render.span("method-name", this.methodName),
      this.args.markup
    )
  }
}

/** ConsoleMethodInvocation:  `spellCore.console.methodName(args)`.
 * - `methodName` is method name, e.g. `log` or `warn` -- defaults to `log`.
 * - `args` is array of expressions.
 * - `echoInTests` (overridable getter) is always `false` -- test-mode echo injection
 *   (see `rules/methods.ts`) skips console calls since they already print something.
 */
export type ASTConsoleMethodInvocationProps = Prettify<{
  methodName?: string
  args?: ASTExpression[]
  wrap?: boolean
  datatype?: string
}>

export class ASTConsoleMethodInvocation extends ASTScopedMethodInvocation {
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
  constructor(match: P.AnyMatch, props: ASTConsoleMethodInvocationProps) {
    const thing = new ASTPropertyExpression(match, {
      object: new ASTSpellCoreExpression(match),
      property: "console"
    })
    super(match, { ...props, methodName: props.methodName as string, thing })
  }
}

/** Create an `ASTExpression` that refers to `spellCore`. */
export class ASTSpellCoreExpression extends ASTVariableExpression {
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
export type ASTCoreMethodInvocationProps = ASTMethodInvocationProps

export class ASTCoreMethodInvocation extends ASTScopedMethodInvocation {
  /** Builds `thing` as `spellCore` -- caller only supplies `methodName`/`args`. */
  constructor(match: P.AnyMatch, props: ASTCoreMethodInvocationProps) {
    super(match, { ...props, thing: new ASTSpellCoreExpression(match) })
  }
}

/** Create an `ASTExpression` that refers to `spellCore.RUNTIME`. */
export class ASTRuntimeExpression extends ASTPropertyExpression {
  constructor(match: P.AnyMatch) {
    super(match, {
      object: new ASTSpellCoreExpression(match),
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
export type ASTRuntimeMethodInvocationProps = ASTMethodInvocationProps

export class ASTRuntimeMethodInvocation extends ASTScopedMethodInvocation {
  /** Builds `thing` as `spellCore.RUNTIME` -- caller only supplies `methodName`/`args`. */
  constructor(match: P.AnyMatch, props: ASTRuntimeMethodInvocationProps) {
    super(match, { ...props, thing: new ASTRuntimeExpression(match) })
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
export type ASTExpectMethodInvocationProps = Prettify<{
  expression: ASTExpression
  expressionString: string
  value?: ASTExpression
  valueString?: string
}>

export class ASTExpectMethodInvocation extends ASTCoreMethodInvocation {
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
  /** Wraps `expressionString`/`valueString` as backtick `ASTStringLiteral`s and never wraps args. */
  constructor(match: P.AnyMatch, props: ASTExpectMethodInvocationProps) {
    const { expression, expressionString, value, valueString } = props
    const args = [expression, new ASTStringLiteral(match, "`" + expressionString + "`")]
    if (value) args.push(value, new ASTStringLiteral(match, "`" + valueString + "`"))
    super(match, { methodName: "expect", args, wrap: false })
  }
}

/** EchoInvocation:  `spellCore.echo(...)` (or another named spellCore method) for test-mode logging.
 *  - `expression` is expression to output -- a bare `string` is wrapped as a backtick `ASTStringLiteral`.
 *  - `methodName` (optional) overrides which spellCore method to call, defaults to `"echo"`.
 *  - `echoInTests` (overridable getter) is always `false` -- test-mode echo injection
 *    (see `rules/methods.ts`) skips echo calls since they already print something.
 */
export type ASTEchoInvocationProps = Prettify<{ expression: string | ASTExpression; methodName?: string }>

export class ASTEchoInvocation extends ASTCoreMethodInvocation {
  /*@proto*/ get echoInTests(): boolean {
    return false
  }
  set echoInTests(echoInTests: boolean) {
    this.override("echoInTests", echoInTests)
  }
  constructor(match: P.AnyMatch, props: ASTEchoInvocationProps) {
    const { methodName = "echo" } = props
    let { expression } = props
    if (typeof expression === "string") expression = new ASTStringLiteral(match, "`" + expression + "`")
    super(match, { methodName, args: [expression] })
  }
}

/**
 * HeadingInvocation:  `spellCore.heading("set up all piles")` -- a heading at a file's top level, said as the
 * program runs, so the Thing Explorer knows which heading's code made each thing.  See `SP.Block.getAST()`.
 * - `heading` is the heading's text, without its `#`s.
 * - `SP.hoistClassMembers()` leaves it where it is -- but comments on either side of it still go with the member
 *   below, e.g. a `## actions` banner.
 */
export type ASTHeadingInvocationProps = { heading: string }

export class ASTHeadingInvocation extends ASTCoreMethodInvocation {
  constructor(match: P.AnyMatch, { heading }: ASTHeadingInvocationProps) {
    super(match, { methodName: "heading", args: [new ASTStringLiteral(match, JSON.stringify(heading))] })
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
export type ASTTypeExpressionProps = Prettify<{ name: string; raw?: string; plurality?: "singular" | "plural" }>

export class ASTTypeExpression extends ASTExpression {
  declare name: string
  declare raw: string | undefined
  declare plurality: "singular" | "plural" | undefined
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "type"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  constructor(match: P.AnyMatch, props: ASTTypeExpressionProps) {
    super(match, props)
    this.assertType("name", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
  compile(): string {
    return this.name
  }
  renderChildren(): P.Markup {
    return render.span("type", this.name)
  }

  /**
   * Name our type's class has when the code runs -- for a runtime type check, e.g. `spellCore.isOfType()`.
   * - Differs from `name` for a type imported renamed, e.g. `Card` for `Playingcard` -- see `P.TypeScope.runtimeName`.
   */
  get runtimeName(): string {
    return this.scope?.runtimeName ?? this.name
  }

  /** Pointer to known Scope for this type, if available. ??? */
  get scope(): P.TypeScope | undefined {
    // Language's type rule stashes what it found as `match.data.scopeType` (e.g. spell's `SpellType`).
    // NOTE: `instanceof` rather than `match.is()`, as we can't know language's rule classes here --
    // also weeds out its "looked, not found" marker.
    const { scopeType } = this.match.data
    return scopeType instanceof P.TypeScope ? scopeType : undefined
  }
}

/** PrototypeExpression:  `type.prototype`.
 *  - `type` is a TypeExpression.
 */
export type ASTPrototypeExpressionProps = Prettify<{ type: string | ASTTypeExpression }>

export class ASTPrototypeExpression extends ASTExpression {
  declare type: ASTTypeExpression
  /** Constructor also accepts a bare `string` `type` as shorthand for `new ASTTypeExpression({ name: type })`. */
  constructor(match: P.AnyMatch, props: ASTPrototypeExpressionProps) {
    super(match, props)
    if (typeof this.type === "string") this.type = new ASTTypeExpression(match, { name: this.type })
    this.assertType("type", ASTTypeExpression)
  }
  compile(): string {
    const { type } = this
    return `${type.compile()}.prototype`
  }
  renderChildren(): P.Markup {
    return render.Fragment(this.type.markup, render.PERIOD, render.PROTOTYPE)
  }
}

/** ConstantExpression -- pointer to a Constant object.
 *  - `name` is constant name (not normalized ???).
 *  - `output` is constant string to output, including quotes.
 *  - `constant` is pointer to scope Constant, if there is one.
 */
export type ASTConstantExpressionProps = Prettify<{ name: string; output: string; constant?: P.ScopeConstant }>

export class ASTConstantExpression extends ASTExpression {
  declare name: string
  declare output: string
  declare constant: P.ScopeConstant | undefined
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "text"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  constructor(match: P.AnyMatch, props: ASTConstantExpressionProps) {
    super(match, props)
    this.assertType("name", "string")
    this.assertType("output", "string")
  }
  /** Just outputs pre-baked `output` string verbatim -- `compile()` doesn't re-derive it from `name`. */
  compile(): string {
    return this.output
  }
  renderChildren(): P.Markup {
    return render.span("constant", this.output)
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
 *   NOTE: this is done automatically by `ASTObjectLiteral.addMethod()`.
 * - `methodName` (optional) is the method's name -- required when `asProperty` or non-`inline`.
 * - `error` (optional) is an `ASTParseError` rendered/compiled right after the method body.
 * - `datatype` (optional) is return datatype as string, try to set if you can.
 * - `async` (optional) set to `true` / `false` to force method to be async or not; if not set, we're async
 *   if our `body` contains an `await` -- see `isAsync`.
 */
export type ASTMethodDefinitionProps = Prettify<{
  args?: ASTVariableExpression[]
  body?: ASTStatementBlock | ASTStatement | ASTExpression
  inline?: boolean
  asProperty?: boolean
  methodName?: string
  error?: ASTParseError
  datatype?: string
  async?: boolean
  /** `true` to `export` it:  a top-level function another project can import -- see `exported`. */
  exported?: boolean
}>

export class ASTMethodDefinition extends ASTExpression {
  declare args: ASTVariableExpression[] | undefined
  declare body: ASTStatementBlock
  declare inline: boolean | undefined
  declare asProperty: boolean | undefined
  declare methodName: string | undefined
  declare error: ASTParseError | undefined
  declare async: boolean | undefined
  /**
   * `true` to compile as `export function ...`:  a top-level function, which another project may import.
   * - Only for a plain named function -- NEVER a property, an arrow, or one nested in another function.
   */
  declare exported: boolean | undefined
  /** Normalizes `body` (Statement / StatementGroup / Expression / missing) into a wrapped `ASTStatementBlock`. */
  constructor(match: P.AnyMatch, props: ASTMethodDefinitionProps) {
    super(match, props)
    this.assertArrayType("args", ASTVariableExpression, OPTIONAL)
    this.assertType("body", [ASTStatementBlock, ASTStatement, ASTExpression], OPTIONAL)
    this.assertType("inline", "boolean", OPTIONAL)
    this.assertType("asProperty", "boolean", OPTIONAL)
    this.assertType("methodName", "string", OPTIONAL)
    this.assertType("error", ASTParseError, OPTIONAL)
    this.assertType("datatype", "string", OPTIONAL)
    this.assertType("async", "boolean", OPTIONAL)
    this.assertType("exported", "boolean", OPTIONAL)

    // Default `body` to empty StatementBlock
    if (!this.body) {
      this.body = new ASTStatementBlock(match)
    }
    // convert Statement/StatementGroup to StatementBlock
    else if (this.body instanceof ASTStatement) {
      this.body = new ASTStatementBlock(match, {
        statements: [this.body]
      })
    }
    // convert non-inline Expression to `return <expression>` StatementBlock
    else if (this.body instanceof ASTExpression) {
      this.body = new ASTStatementBlock(match, {
        statements: [new ASTReturnStatement(match, { value: this.body })]
      })
    }
    // Make sure we body ends up as a StatementBlock
    this.assertType("body", ASTStatementBlock)
    // ALWAYS wrap the body
    this.body.wrap = true
  }
  /**
   * Explicit `async` prop wins;  otherwise `true` if our `body` contains an `await`.
   * - Not counting awaits inside a method nested in our body:  that one's async, not us.
   */
  get isAsync(): boolean {
    if (typeof this.async === "boolean") return this.async
    return containsAwait(this.body)
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
    const export_ = this.exported ? "export " : ""
    return `${export_}${async}function ${methodName}${args} ${body}${error}`
  }
  /**
   * Compile as method shorthand under `name`, whatever our own `methodName`, e.g. in a class body.
   * - `name` is ready to print:  quoted if need be, and may lead with `get `, e.g. `get title` => `get title() {...}`.
   */
  compileNamed(name: string): string {
    const async = this.isAsync ? "async " : ""
    const error = this.error ? ` ${this.error.compile()}` : ""
    return `${async}${name}${stringify.Args({ args: this.args })} ${this.body.compile()}${error}`
  }
  /** Compile as an anonymous `function (args) {...}` -- NOT an arrow, so `this` is whatever it's called on. */
  compileAnonymous(): string {
    const async = this.isAsync ? "async " : ""
    const error = this.error ? ` ${this.error.compile()}` : ""
    return `${async}function ${stringify.Args({ args: this.args })} ${this.body.compile()}${error}`
  }
  /** Draw as method shorthand under `name` -- see `compileNamed()`. */
  renderNamed(name: P.Markup): P.Markup {
    const async = this.isAsync && render.ASYNC
    const methodName = render.span("method-name", name)
    return render.Fragment(
      async,
      methodName,
      render.Args({ args: this.args }),
      render.SPACE,
      this.body.markup,
      this.renderError()
    )
  }
  /** Draw as an anonymous `function (args) {...}` -- see `compileAnonymous()`. */
  renderAnonymous(): P.Markup {
    const async = this.isAsync && render.ASYNC
    return render.Fragment(
      async,
      render.FUNCTION,
      render.Args({ args: this.args }),
      render.SPACE,
      this.body.markup,
      this.renderError()
    )
  }
  /** Render `error` (if any) prefixed with a space -- `null` when there's no error. */
  renderError(): P.Markup {
    if (!this.error) return null
    return render.Fragment(render.SPACE, this.error.markup)
  }
  /** SIDE EFFECT: `console.warn`s if `asProperty` is set but `methodName` is missing. */
  renderChildren(): P.Markup {
    const async = this.isAsync && render.ASYNC
    const methodName = !!this.methodName && render.span("method-name", this.getMethodName())
    const args = render.Args({ args: this.args })
    const body = this.body.markup
    const error = !!this.error && render.Fragment(render.SPACE, this.error.markup)
    if (this.asProperty) {
      if (!methodName) console.warn("MethodDef: property missing methodName", this)
      if (this.inline)
        return render.Fragment(async, methodName, render.COLON_AND_SPACE, args, render.FAT_ARROW, body, error)
      return render.Fragment(async, methodName, args, render.SPACE, body, error)
    }
    // normal method
    if (this.inline) return render.Fragment(async, args, render.FAT_ARROW, body, error)
    const export_ = this.exported && render.EXPORT
    return render.Fragment(export_, async, render.FUNCTION, methodName, args, render.SPACE, body, error)
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
export type ASTObjectLiteralProps = Prettify<{
  properties?: Array<ASTObjectLiteralProperty | ASTMethodDefinition>
  wrap?: boolean
}>

export class ASTObjectLiteral extends ASTExpression {
  declare properties: Array<ASTObjectLiteralProperty | ASTMethodDefinition>
  /*@readonly*/ /*@proto*/ get datatype(): string {
    return "Object"
  }
  set datatype(datatype: string) {
    this.override("datatype", datatype)
  }
  /** SIDE EFFECT: sets `asProperty = true` on any `ASTMethodDefinition` passed in via `properties`. */
  constructor(match: P.AnyMatch, { properties, ...props }: ASTObjectLiteralProps = {}) {
    super(match, props)
    this.properties = []
    this.assertType("wrap", "boolean", OPTIONAL)

    // validate any properties passed in
    if (properties)
      properties.forEach((property) => {
        if (property instanceof ASTObjectLiteralProperty) {
          this.properties.push(property)
        } else if (property instanceof ASTMethodDefinition) {
          this.assert(
            property.methodName,
            "new ASTObjectLiteral(): ASTMethodDefinition must specify methodName",
            property
          )
          property.asProperty = true
          this.properties.push(property)
        } else {
          this.assert(false, `new ASTObjectLiteral(): invalid property`, property)
        }
      })
  }
  // Should we wrap properties block?
  /** Default: wrap past 2 properties, or if any property is a method.  Override via constructor or setter. */
  /*@overridable*/
  get wrap(): boolean {
    return this.properties.length > 2 || this.properties.some((item) => item instanceof ASTMethodDefinition)
  }
  set wrap(wrap: boolean) {
    this.override("wrap", wrap)
  }
  /** Append a plain `property: value` pair.  SIDE EFFECT: mutates `this.properties`. */
  addProp(property: string | ASTPropertyLiteral, value: string | ASTExpression): void {
    // convert string value to StringLiteral
    const propertyValue = typeof value === "string" ? new ASTStringLiteral(this.match, { value }) : value
    this.assert(
      propertyValue instanceof ASTExpression,
      `ASTObjectLiteral.addProp(${property}): value must be an ASTExpression`,
      propertyValue
    )
    this.properties.push(new ASTObjectLiteralProperty(this.match, { property, value: propertyValue }))
  }
  /**
   * Append `method` as a named method property.
   * SIDE EFFECT: mutates `this.properties`, and sets `method.methodName`/`method.asProperty` on `method`
   * itself (overwriting whatever was there).
   */
  addMethod(property: string, method: ASTMethodDefinition): void {
    this.assert(
      method instanceof ASTMethodDefinition,
      `ASTObjectLiteral.addMethod(${property}): method must be an ASTMethodDefinition`,
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
  renderChildren(): P.Markup {
    if (!this.properties.length) return render.EMPTY_BLOCK
    const { wrap } = this
    const delimiter = wrap ? render.INDENTED_COMMA : render.SPACED_COMMA
    return render.Block({ wrap, space: !wrap, children: render.List({ items: this.properties, delimiter }) })
  }
}

/** ObjectLiteralProperty type.
 *  - `property` is normalized property name.
 *  - `value` (optional) is property value.  If omitted, compiles as JS shorthand property
 *    (`{ prop }` ~== `{ prop: prop }`), assuming a same-named local variable is in scope.
 *  - `error` (optional) is a parse error associated with this property.
 */
export type ASTObjectLiteralPropertyProps = Prettify<{
  property: string | ASTPropertyLiteral
  value?: ASTExpression
  error?: ASTParseError
}>

export class ASTObjectLiteralProperty extends ASTNode {
  declare property: ASTPropertyLiteral
  declare value: ASTExpression | undefined
  declare error: ASTParseError | undefined
  /** Constructor also accepts a bare `string` `property` as shorthand for `new ASTPropertyLiteral(property)`. */
  constructor(match: P.AnyMatch, props: ASTObjectLiteralPropertyProps) {
    super(match, props)
    if (typeof this.property === "string") this.property = new ASTPropertyLiteral(this.match, this.property)
    this.assertType("property", ASTPropertyLiteral)
    this.assertType("value", ASTExpression, OPTIONAL)
    this.assertType("error", ASTParseError, OPTIONAL)
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
  renderChildren(): P.Markup {
    // If no value, assume it's available as a local variable.
    const value = !!this.value && render.Fragment(render.COLON_AND_SPACE, render.span("value", this.value.markup))
    const error = !!this.error && render.Fragment(render.SPACE, this.error.markup)
    return render.Fragment(render.span("property", this.property.markup), value, error)
  }
}

////////////////
// ## Statements
////////////////

/** Statement abstract type. */
export class ASTStatement extends ASTNode {}

/** StatementGroup -- set of random statements which does NOT get indented with curly braces!
 *  - NOTE: you can use this interchangeably whenever something takes a single `ASTStatement`.
 *  - `statements` is a list of Statements.
 *  - `echoInTests` (overridable getter) is always `false` -- test-mode echo injection
 *    (see `rules/methods.ts`) skips groups since each inner statement is echoed individually.
 */
export type ASTStatementGroupProps = Prettify<{
  statements?: Array<ASTStatement | ASTExpression | ASTComment | ASTBlankLine>
}>

export class ASTStatementGroup extends ASTStatement {
  declare statements: Array<ASTStatement | ASTExpression | ASTComment | ASTBlankLine> | undefined
  /*@proto*/ get echoInTests(): boolean {
    return false
  }
  set echoInTests(echoInTests: boolean) {
    this.override("echoInTests", echoInTests)
  }
  constructor(match: P.AnyMatch, props?: ASTStatementGroupProps) {
    super(match, props)
    this.assertArrayType("statements", [ASTStatement, ASTExpression, ASTComment, ASTBlankLine], OPTIONAL)
  }
  compile(): string {
    return stringify.List({ items: this.statements, delimiter: stringify.NEWLINE })
  }
  renderChildren(): P.Markup {
    return render.List({ items: this.statements, delimiter: render.NEWLINE })
  }
}

/** StatementBlock -- set of statements which outputs with curly braces around.
 *  - `statements` (optional) is a list of Statements etc.
 *  - `wrap` (optional) set to explicitly control block wrapping -- defaults to wrapping past 1 statement.
 */
export type ASTStatementBlockProps = Prettify<{
  statements?: Array<ASTStatement | ASTExpression | ASTComment | ASTBlankLine>
  wrap?: boolean
}>

export class ASTStatementBlock extends ASTNode {
  declare statements: Array<ASTStatement | ASTExpression | ASTComment | ASTBlankLine> | undefined
  /** SIDE EFFECT: unwinds a single nested `ASTStatementGroup` into this block's own `statements`. */
  constructor(match: P.AnyMatch, props?: ASTStatementBlockProps) {
    super(match, props)
    this.assertArrayType("statements", [ASTStatement, ASTExpression, ASTComment, ASTBlankLine], OPTIONAL)
    // Unwind any single nested StatementGroups
    while (this.statements?.length === 1 && this.statements[0] instanceof ASTStatementGroup) {
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
  renderChildren(): P.Markup {
    if (!this.statements || !this.statements.length) return render.EMPTY_BLOCK
    return render.Block({
      wrap: this.wrap,
      children: render.List({ items: this.statements, delimiter: render.INDENTED_NEWLINE })
    })
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
export type ASTTryCatchBlockProps = Prettify<{
  body: ASTStatementBlock | ASTStatement | ASTExpression
  errorArg?: string | ASTVariableExpression
  catchBlock?: ASTStatementBlock | ASTStatement | ASTExpression
  finallyBlock?: ASTStatementBlock | ASTStatement | ASTExpression
}>

export class ASTTryCatchBlock extends ASTStatementGroup {
  declare body: ASTStatementBlock
  declare errorArg: ASTVariableExpression | undefined
  declare catchBlock: ASTStatementBlock | undefined
  declare finallyBlock: ASTStatementBlock | undefined
  /** Normalizes `body`/`catchBlock`/`finallyBlock` into wrapped `ASTStatementBlock`s, `errorArg` into a
   *  `ASTVariableExpression`.
   */
  constructor(match: P.AnyMatch, props: ASTTryCatchBlockProps) {
    super(match, props as unknown as ASTStatementGroupProps)
    this.assertType("body", [ASTStatementBlock, ASTStatement, ASTExpression])
    this.assertType("errorArg", ["string", ASTVariableExpression], OPTIONAL)
    this.assertType("catchBlock", [ASTStatementBlock, ASTStatement, ASTExpression], OPTIONAL)
    this.assertType("finallyBlock", [ASTStatementBlock, ASTStatement, ASTExpression], OPTIONAL)
    this.assert(this.catchBlock || this.finallyBlock, "You must provide at least one catchBlock or finallyBlock")

    if (typeof this.errorArg === "string") this.errorArg = new ASTVariableExpression(match, { name: this.errorArg })
    this.body = convertStatementsToBlock(this.match, this.body as unknown as ASTStatement)
    this.body.wrap = true
    if (this.catchBlock) {
      this.catchBlock = convertStatementsToBlock(this.catchBlock.match, this.catchBlock as unknown as ASTStatement)
      this.catchBlock.wrap = true
    }
    if (this.finallyBlock) {
      this.finallyBlock = convertStatementsToBlock(
        this.finallyBlock.match,
        this.finallyBlock as unknown as ASTStatement
      )
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
  renderChildren(): P.Markup {
    const { body, catchBlock, finallyBlock } = this
    const output: P.Markup[] = [render.TRY, render.span("try-block", body.markup)]
    if (catchBlock) output.push(render.NEWLINE, render.CATCH, render.span("catch-block", catchBlock.markup))
    if (finallyBlock) output.push(render.NEWLINE, render.FINALLY, render.span("finally-block", finallyBlock.markup))
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
export type ASTAssignmentStatementProps = Prettify<{
  thing: ASTExpression
  value: ASTExpression
  isNewVariable?: boolean
}>

export class ASTAssignmentStatement extends ASTStatement {
  declare thing: ASTExpression
  declare value: ASTExpression
  declare isNewVariable: boolean | undefined
  constructor(match: P.AnyMatch, props: ASTAssignmentStatementProps) {
    super(match, props)
    this.assertType("thing", ASTExpression)
    this.assertType("value", ASTExpression)
    this.assertType("isNewVariable", "boolean", OPTIONAL)
  }
  /** Should we `export` top-level vars?  Global toggle -- flip to `false` to disable entirely. */
  static EXPORT_VARS = true
  /**
   * Names of top-level vars that we NEVER export:  `it`, e.g. Mocha's implicit `it`, and spell's numbered `it`s,
   * `it_2`, `it_3`... -- temporaries, not something another file should use.
   */
  static EXPORT_BLACKLIST = /^it(_\d+)?$/
  /** `true` only for a new-variable declaration at `ProjectScope`/`FileScope` whose name isn't blacklisted. */
  get exportVar(): boolean {
    if (!ASTAssignmentStatement.EXPORT_VARS || !this.isNewVariable) return false
    const { scope } = this.match
    if (!(scope instanceof P.ProjectScope || scope instanceof P.FileScope)) return false
    const varName = String(this.thing.compile())
    return !ASTAssignmentStatement.EXPORT_BLACKLIST.test(varName)
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
  renderChildren(): P.Markup {
    return render.Fragment(
      this.exportVar && render.EXPORT,
      !!this.isNewVariable && render.LET,
      render.span("thing", this.thing.markup),
      render.EQUALS,
      render.span("value", this.value.markup)
    )
  }
}

/** DestructuredAssignment -- pull multiple variables with defaults out of a `thing`.
 *  - `thing` is an Expression.
 *  - `variables` are VariableExpressions, possibly with defaults.
 *  - `isNewVariable` (optional) if true and `thing` is an Expression, we'll declare the var.
 */
export type ASTDestructuredAssignmentProps = Prettify<{
  thing: ASTExpression
  variables: ASTVariableExpression[]
  isNewVariable?: boolean
}>

export class ASTDestructuredAssignment extends ASTStatement {
  declare thing: ASTExpression
  declare variables: ASTVariableExpression[]
  declare isNewVariable: boolean | undefined
  constructor(match: P.AnyMatch, props: ASTDestructuredAssignmentProps) {
    super(match, props)
    this.assertType("thing", ASTExpression)
    this.assertArrayType("variables", ASTVariableExpression)
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
  renderChildren(): P.Markup {
    return render.Fragment(
      !!this.isNewVariable && render.LET,
      render.InCurlies({ space: true, children: render.List({ items: this.variables }) }),
      render.EQUALS,
      render.span("thing", this.thing.markup)
    )
  }
}

/** ReturnStatement -- return a value.
 *  - `value` (optional) is an Expression to be returned.
 */
export type ASTReturnStatementProps = Prettify<{ value?: ASTExpression }>

export class ASTReturnStatement extends ASTStatement {
  declare value: ASTExpression | undefined
  constructor(match: P.AnyMatch, props?: ASTReturnStatementProps) {
    super(match, props)
    this.assertType("value", ASTExpression, OPTIONAL)
  }
  /** Compiles as bare `return` when `value` is missing, else `return value`. */
  compile(): string {
    if (!this.value) return "return"
    return `return ${this.value.compile()}`
  }
  renderChildren(): P.Markup {
    const value = !!this.value && render.Fragment(render.SPACE, render.span("value", this.value.markup))
    return render.Fragment(render.RETURN, value)
  }
}

////////////////
// ## Classes & instances
////////////////

/** ClassDeclaration -- `export class Type extends SuperType { ...members }`.
 *  - `type` is a TypeExpression.
 *  - `superType` (optional) is a TypeExpression.
 *  - `members` (optional) are what goes in its body:  `ASTClassMember`s, each with the comments above it,
 *    and blank lines between.  None => `{}`.
 *  - A rule declaring a class makes it with just the members IT declares, e.g. `static instanceType = Card`
 *    -- `SP.hoistClassMembers()` gathers the rest into a NEW declaration, never this one.
 */
export type ASTClassDeclarationProps = Prettify<{
  type: ASTTypeExpression
  superType?: ASTTypeExpression
  members?: Array<ASTClassMember | ASTComment | ASTBlankLine>
}>

export class ASTClassDeclaration extends ASTStatement {
  declare type: ASTTypeExpression
  declare superType: ASTTypeExpression | undefined
  declare members: Array<ASTClassMember | ASTComment | ASTBlankLine> | undefined
  constructor(match: P.AnyMatch, props: ASTClassDeclarationProps) {
    super(match, props)
    this.assertType("type", ASTTypeExpression)
    this.assertType("superType", ASTTypeExpression, OPTIONAL)
    this.assertArrayType("members", [ASTClassMember, ASTComment, ASTBlankLine], OPTIONAL)
  }
  /** Same class, with `members` added after its own -- see `SP.hoistClassMembers()`. */
  withMembers(members: Array<ASTClassMember | ASTComment | ASTBlankLine>): ASTClassDeclaration {
    const { match, type, superType } = this
    return new ASTClassDeclaration(match, { type, superType, members: [...(this.members ?? []), ...members] })
  }
  /** NOTE: indents its members' non-blank lines only -- `stringify.Block()` would leave a tab on blank ones. */
  compile(): string {
    const { type, superType, members } = this
    const superDeclarator = superType ? `extends ${superType.name} ` : ""
    const declaration = `export class ${type.name} ${superDeclarator}`
    if (!members?.length) return `${declaration}${stringify.EMPTY_BLOCK}`
    const body = members
      .map((member) => (member instanceof ASTClassMember ? member.compileAsMember() : member.compile()))
      .join(stringify.NEWLINE)
      .split(stringify.NEWLINE)
      .map((line) => (line ? `${stringify.INDENT}${line}` : line))
      .join(stringify.NEWLINE)
    return `${declaration}${stringify.LEFT_CURLY}${stringify.NEWLINE}${body}${stringify.NEWLINE}${stringify.RIGHT_CURLY}`
  }
  renderChildren(): P.Markup {
    const members = this.members?.length
      ? render.Block({
          wrap: true,
          children: render.List({ items: this.members, delimiter: render.INDENTED_NEWLINE, DrawItem: ClassMemberItem })
        })
      : render.EMPTY_BLOCK
    return render.Fragment(
      render.EXPORT,
      render.CLASS,
      render.span("type", this.type.markup),
      !!this.superType && render.EXTENDS,
      !!this.superType && render.span("superType", this.superType.markup),
      render.SPACE,
      members
    )
  }
}

/** Draws one of `ASTClassDeclaration.members`:  a member as it looks in a class body, else as is. */
function ClassMemberItem({ item }: render.ListItemProps): P.Markup {
  if (item instanceof ASTClassMember) return item.memberMarkup
  return item?.markup ?? null
}

/** NewInstanceExpression -- `new Type(props)`.
 * - `type` is a TypeExpression.
 * - `props` (optional) is an ObjectLiteral.
 */
export type ASTNewInstanceExpressionProps = Prettify<{ type: ASTTypeExpression; props?: ASTObjectLiteral }>

export class ASTNewInstanceExpression extends ASTExpression {
  declare type: ASTTypeExpression
  declare props: ASTObjectLiteral | undefined
  constructor(match: P.AnyMatch, props: ASTNewInstanceExpressionProps) {
    super(match, props)
    this.assertType("type", ASTTypeExpression)
    this.assertType("props", ASTObjectLiteral, OPTIONAL)
  }
  /** Compiles as `new Type()` (empty parens) when `props` is missing, else `new Type(props)`. */
  compile(): string {
    const props = stringify.InParens({ children: this.props?.compile() })
    return `new ${this.type.compile()}${props}`
  }
  renderChildren(): P.Markup {
    const props = this.props ? render.InParens({ children: this.props.markup }) : render.EMPTY_PARENS
    return render.Fragment(render.NEW, render.span("type", this.type.markup), props)
  }
}

/** ListExpression -- `[items]`.
 * - `items` (optional) is a list of Expressions.
 */
export type ASTListExpressionProps = Prettify<{ items?: ASTExpression[] }>

export class ASTListExpression extends ASTExpression {
  declare items: ASTExpression[] | undefined
  constructor(match: P.AnyMatch, props: ASTListExpressionProps) {
    super(match, props)
    this.assertArrayType("items", ASTExpression, OPTIONAL)
  }
  compile(): string {
    return stringify.InSquareBrackets({
      children: stringify.List({ items: this.items })
    })
  }
  renderChildren(): P.Markup {
    return render.InSquareBrackets({ children: render.List({ items: this.items }) })
  }
}

////////////////
// ## Class members
////////////////

/**
 * ClassMember -- something a class declares:  a method, a getter, a property or a static.
 * - Compiles two ways:
 *   - `compileAsMember()`:  in its class's body, e.g. `get title() {...}` -- see `ASTClassDeclaration.members`
 *   - `compile()`:  patched onto its class from outside, e.g. `Card.prototype.play = function () {...}` --
 *     when its class isn't compiled with it, e.g. it's from another project, or a rule test compiles it alone
 * - `typeName` is its class, so `SP.hoistClassMembers()` can move it into that class's body.
 */
export abstract class ASTClassMember extends ASTStatement {
  declare type: ASTTypeExpression
  /** Normalizes a bare `string` `type` to a `TypeExpression`, e.g. `"Card"`. */
  constructor(match: P.AnyMatch, props: { type: string | ASTTypeExpression }) {
    super(match, props)
    if (typeof this.type === "string") this.type = new ASTTypeExpression(match, { name: this.type })
    this.assertType("type", ASTTypeExpression)
  }
  /** Name of the class it's a member of, e.g. `Card`. */
  get typeName(): string {
    return this.type.name
  }
  /** `Card.prototype`, for patching onto its class from outside. */
  get prototypeExpression(): ASTPrototypeExpression {
    return new ASTPrototypeExpression(this.match, { type: this.type })
  }
  /** JS for it in its class's body, e.g. `get title() {...}`. */
  abstract compileAsMember(): string
  /** Draws it in its class's body -- see `compileAsMember()`. */
  abstract renderAsMember(): P.Markup
  /** Markup for `renderAsMember()`, as `markup` is for `renderChildren()`. */
  /*@memoize*/
  get memberMarkup(): P.MarkupElement {
    return this.derived("memberMarkup", () => render.span(`${this.className} as-member`, this.renderAsMember()))
  }
}

/**
 * PropertyDefinition -- a method or computed getter on instances of `type`.
 * - `type` (required) is its class, as a TypeExpression or bare name.
 * - `property` (required) is PropertyLiteral or string -- quoted in output if it isn't a legal identifier.
 * - EXACTLY one of:
 *   - `method` is a MethodDefinition:  `name(args) {...}` / `Type.prototype.name = function (args) {...}`
 *   - `get` is a MethodDefinition for a getter:  `get name() {...}` / `Object.defineProperty(...)`
 * - NOTE: never touches `method`'s own `methodName` -- it's compiled under `property` here.
 */
export type ASTPropertyDefinitionProps = Prettify<{
  type: string | ASTTypeExpression
  property: string | ASTPropertyLiteral
  method?: ASTMethodDefinition
  get?: ASTMethodDefinition
}>

export class ASTPropertyDefinition extends ASTClassMember {
  declare property: ASTPropertyLiteral
  declare method: ASTMethodDefinition | undefined
  declare get: ASTMethodDefinition | undefined
  constructor(match: P.AnyMatch, props: ASTPropertyDefinitionProps) {
    super(match, props)
    if (typeof this.property === "string") this.property = new ASTPropertyLiteral(this.match, this.property)
    this.assertType("property", ASTPropertyLiteral)
    this.assertType("method", ASTMethodDefinition, OPTIONAL)
    this.assertType("get", ASTMethodDefinition, OPTIONAL)
    this.assert(!this.method !== !this.get, "ASTPropertyDefinition: pass exactly one of `method` or `get`", props)
  }
  /** `name(args) {...}` or `get name() {...}`. */
  compileAsMember(): string {
    const name = this.property.compile()
    if (this.get) return this.get.compileNamed(`get ${name}`)
    return this.method!.compileNamed(name)
  }
  /**
   * `Type.prototype.name = function (args) {...}`, or for a getter
   * `Object.defineProperty(Type.prototype, 'name', { get() {...}, configurable: true })`.
   */
  compile(): string {
    const prototype = this.prototypeExpression.compile()
    if (this.get) {
      const descriptor = [`${this.get.compileNamed("get")},`, "configurable: true"].join(stringify.NEWLINE)
      return `Object.defineProperty(${prototype}, ${quoted(this.property)}, ${stringify.Block({ wrap: true, children: descriptor })})`
    }
    return `${prototype}${propertyAccess(this.property)} = ${this.method!.compileAnonymous()}`
  }
  renderAsMember(): P.Markup {
    const name = this.property.markup
    if (this.get) return this.get.renderNamed(render.Fragment(render.GET, name))
    return this.method!.renderNamed(name)
  }
  renderChildren(): P.Markup {
    const prototype = this.prototypeExpression.markup
    if (this.get) {
      return render.Fragment(
        "Object.defineProperty",
        render.InParens({
          children: [
            render.Fragment(prototype, render.SPACED_COMMA, quoted(this.property), render.SPACED_COMMA),
            render.Block({
              wrap: true,
              children: render.Fragment(this.get.renderNamed("get"), render.INDENTED_COMMA, "configurable: true")
            })
          ]
        })
      )
    }
    return render.Fragment(prototype, propertyAccess(this.property), render.EQUALS, this.method!.renderAnonymous())
  }
}

/**
 * ReactiveProperty -- a property stored in its instance's spell cells, so drawing it redraws when it changes.
 * - `type` (required) is its class, as a TypeExpression or bare name.
 * - `property` (required) is PropertyLiteral or string.
 * - `check` (optional) is what its setter warns about, e.g. `{ type: 'text' }` -- see `SC.PropCheck`.
 * - `initializer` (optional) is its default, made once per instance, e.g. `new List()`.
 * - A getter / setter pair over `getProp()` / `setProp()`, as a plain class field would shadow it:
 *   `get title() { return this.getProp('title') }` + `set title(value) { this.setProp('title', value) }`.
 * - `check` and `initializer` go in its class's SCHEMA, declared once, NOT passed on every get / set:
 *   `static { this.declareProp('title', { type: 'text' }) }`, or `Todo.declareProp(...)` from outside the class.
 *   The same runtime shape as a hand-written class's `@prop({ type: 'text' }) accessor title` -- compiled spell runs
 *   from a `blob:` URL, untranspiled, so it can't use decorators.  See `guides/solid/solid-2.md`.
 */
export type ASTReactivePropertyProps = Prettify<{
  type: string | ASTTypeExpression
  property: string | ASTPropertyLiteral
  check?: ASTObjectLiteral
  initializer?: ASTExpression
}>

export class ASTReactiveProperty extends ASTClassMember {
  declare property: ASTPropertyLiteral
  declare check: ASTObjectLiteral | undefined
  declare initializer: ASTExpression | undefined
  constructor(match: P.AnyMatch, props: ASTReactivePropertyProps) {
    super(match, props)
    if (typeof this.property === "string") this.property = new ASTPropertyLiteral(this.match, this.property)
    this.assertType("property", ASTPropertyLiteral)
    this.assertType("check", ASTObjectLiteral, OPTIONAL)
    this.assertType("initializer", ASTExpression, OPTIONAL)
  }
  /** `{ return this.getProp('name') }`:  its default, if any, is in its class's schema -- see `declaration`. */
  get getterBody(): string {
    return `{ return this.getProp(${quoted(this.property)}) }`
  }
  /** `{ this.setProp('name', value) }`:  its `check`, if any, is in its class's schema -- see `declaration`. */
  get setterBody(): string {
    return `{ this.setProp(${quoted(this.property)}, value) }`
  }
  /**
   * What its class's schema declares about it -- its `check`'s keys, plus `init` for its `initializer` -- e.g.
   * `{ type: 'text' }`, `{ init: () => new List() }`.  `undefined` if nothing:  then it's undeclared.
   */
  get declaration(): string | undefined {
    const parts = (this.check?.properties ?? []).map((property) => property.compile())
    if (this.initializer) parts.push(`init: () => ${this.initializer.compile()}`)
    return parts.length ? `{ ${parts.join(", ")} }` : undefined
  }
  /** `declareProp('name', {...})` with `declaration`, called on `owner`, e.g. `this` in its class's body. */
  declareCall(owner: string): string | undefined {
    const { declaration } = this
    return declaration && `${owner}.declareProp(${quoted(this.property)}, ${declaration})`
  }
  /** `static { this.declareProp(...) }` (if it declares anything), `get name() {...}` + `set name(value) {...}`. */
  compileAsMember(): string {
    const name = this.property.compile()
    const declare = this.declareCall("this")
    return [
      declare && `static { ${declare} }`,
      `get ${name}() ${this.getterBody}`,
      `set ${name}(value) ${this.setterBody}`
    ]
      .filter(Boolean)
      .join(stringify.NEWLINE)
  }
  /**
   * `Type.declareProp(...)` (if it declares anything), then
   * `Object.defineProperty(Type.prototype, 'name', { get() {...}, set(value) {...}, configurable: true })`.
   */
  compile(): string {
    const descriptor = [`get() ${this.getterBody},`, `set(value) ${this.setterBody},`, "configurable: true"]
    const block = stringify.Block({ wrap: true, children: descriptor.join(stringify.NEWLINE) })
    const define = `Object.defineProperty(${this.prototypeExpression.compile()}, ${quoted(this.property)}, ${block})`
    const declare = this.declareCall(this.type.compile())
    return declare ? [declare, define].join(stringify.NEWLINE) : define
  }
  renderAsMember(): P.Markup {
    const name = this.property.markup
    const declare = this.declareCall("this")
    return render.Fragment(
      declare ? render.Fragment(render.STATIC, `{ ${declare} }`, render.NEWLINE) : undefined,
      render.GET,
      name,
      `() ${this.getterBody}`,
      render.NEWLINE,
      render.SET,
      name,
      `(value) ${this.setterBody}`
    )
  }
  renderChildren(): P.Markup {
    return this.compile()
  }
}

/**
 * StaticDefinition -- a value on the class itself, e.g. an enumeration's values `Card.Suits`.
 * - `type` (required) is its class, as a TypeExpression or bare name.
 * - `name` (required) is its name -- MUST be a legal identifier.
 * - `value` (required) is an Expression.
 * - `static Suits = [...]` in its class, else `Card.Suits = [...]`.
 */
export type ASTStaticDefinitionProps = Prettify<{
  type: string | ASTTypeExpression
  name: string
  value: ASTExpression
}>

export class ASTStaticDefinition extends ASTClassMember {
  declare name: string
  declare value: ASTExpression
  constructor(match: P.AnyMatch, props: ASTStaticDefinitionProps) {
    super(match, props)
    this.assertType("name", "string")
    this.assert(isLegalIdentifier(this.name), `ASTStaticDefinition: illegal name '${this.name}'`)
    this.assertType("value", ASTExpression)
  }
  compileAsMember(): string {
    return `static ${this.name} = ${this.value.compile()}`
  }
  compile(): string {
    return `${this.type.compile()}.${this.name} = ${this.value.compile()}`
  }
  renderAsMember(): P.Markup {
    return render.Fragment(render.STATIC, this.name, render.EQUALS, this.value.markup)
  }
  renderChildren(): P.Markup {
    return render.Fragment(this.type.markup, render.PERIOD, this.name, render.EQUALS, this.value.markup)
  }
}

/**
 * PatchedMember -- a class member ALWAYS patched onto its class from outside, wherever that class is compiled,
 * e.g. `Card.declareProp('pile', ...)` + `Object.defineProperty(Card.prototype, 'pile', ...)`.
 * - `member` (required) is the ClassMember, compiled with its `compile()`.
 * - NOT a ClassMember itself, so `SP.hoistClassMembers()` leaves it where it is.
 *   - Why:  spell declares a property at its first `set` in the file which sets it,
 *     and that must never change another file's output -- see spell's `assignment_statement`.
 */
export type ASTPatchedMemberProps = Prettify<{ member: ASTClassMember }>

export class ASTPatchedMember extends ASTStatement {
  declare member: ASTClassMember
  constructor(match: P.AnyMatch, props: ASTPatchedMemberProps) {
    super(match, props)
    this.assertType("member", ASTClassMember)
  }
  compile(): unknown {
    return this.member.compile()
  }
  renderChildren(): P.Markup {
    return this.member.markup
  }
}

/** `'name'`:  `property`'s name as a JS string, e.g. for `getProp()` or `Object.defineProperty()`. */
function quoted(property: ASTPropertyLiteral): string {
  return `'${property.value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`
}

/** `.name`, or `['name']` if `property` isn't a legal identifier. */
function propertyAccess(property: ASTPropertyLiteral): string {
  return property.isLegalIdentifier ? `.${property.value}` : `[${quoted(property)}]`
}

////////////////
// ## Conditionals
////////////////

/** IfStatement.
 * - `condition` is an Expression.
 * - `statements` is a Statement or Expression.
 */
export type ASTIfStatementProps = Prettify<{
  condition: ASTExpression
  statements?: ASTStatement | ASTStatementBlock | ASTStatement[]
}>

export class ASTIfStatement extends ASTStatement {
  declare condition: ASTParenthesizedExpression
  declare statements: ASTStatementBlock
  /** SIDE EFFECT: wraps `condition` in parens (unless already parenthesized) and normalizes `statements`
   *  into an `ASTStatementBlock`. */
  constructor(match: P.AnyMatch, props: ASTIfStatementProps) {
    super(match, props)
    this.assertType("condition", ASTExpression)
    // wrap condition in parens if necessary
    if (!(this.condition instanceof ASTParenthesizedExpression)) {
      this.condition = new ASTParenthesizedExpression((this.condition as ASTExpression).match, {
        expression: this.condition as ASTExpression
      })
    }
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  compile(): string {
    return `if ${this.condition.compile()} ${this.statements.compile()}`
  }
  renderChildren(): P.Markup {
    return render.Fragment(
      render.IF,
      render.span("condition", this.condition.markup),
      render.SPACE,
      this.statements.markup
    )
  }
}

/** ElseIfStatement.
 * - `condition` is an Expression.
 * - `statements` is a Statement or Expression.
 */
export type ASTElseIfStatementProps = Prettify<{
  condition: ASTExpression
  statements?: ASTStatement | ASTStatementBlock | ASTStatement[]
}>

export class ASTElseIfStatement extends ASTStatement {
  declare condition: ASTParenthesizedExpression
  declare statements: ASTStatementBlock
  /** SIDE EFFECT: wraps `condition` in parens (unless already parenthesized) and normalizes `statements`
   *  into an `ASTStatementBlock`. */
  constructor(match: P.AnyMatch, props: ASTElseIfStatementProps) {
    super(match, props)
    this.assertType("condition", ASTExpression)
    // wrap condition in parens if necessary
    if (!(this.condition instanceof ASTParenthesizedExpression)) {
      this.condition = new ASTParenthesizedExpression((this.condition as ASTExpression).match, {
        expression: this.condition as ASTExpression
      })
    }
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  compile(): string {
    return `else if ${this.condition.compile()} ${this.statements.compile()}`
  }
  renderChildren(): P.Markup {
    return render.Fragment(
      render.ELSE,
      render.IF,
      render.span("condition", this.condition.markup),
      render.SPACE,
      this.statements.markup
    )
  }
}

/** ElseStatement.
 * - `statements` is a Statement or Expression.
 */
export type ASTElseStatementProps = Prettify<{ statements?: ASTStatement | ASTStatementBlock | ASTStatement[] }>

export class ASTElseStatement extends ASTStatement {
  declare statements: ASTStatementBlock
  constructor(match: P.AnyMatch, props?: ASTElseStatementProps) {
    super(match, props)
    this.statements = convertStatementsToBlock(this.match, this.statements)
  }
  compile(): string {
    return `else ${this.statements.compile()}`
  }
  renderChildren(): P.Markup {
    return render.Fragment(render.ELSE, this.statements.markup)
  }
}

/** TernaryExpression:  `(condition ? trueValue : falseValue)`.
 * - `condition` is an Expression.
 * - `trueValue` is an Expression.
 * - `falseValue` is an Expression.
 */
export type ASTTernaryExpressionProps = Prettify<{
  condition: ASTExpression
  trueValue: ASTExpression
  falseValue: ASTExpression
}>

export class ASTTernaryExpression extends ASTExpression {
  declare condition: ASTExpression
  declare trueValue: ASTExpression
  declare falseValue: ASTExpression
  constructor(match: P.AnyMatch, props: ASTTernaryExpressionProps) {
    super(match, props)
    this.assertType("condition", ASTExpression)
    this.assertType("trueValue", ASTExpression)
    this.assertType("falseValue", ASTExpression)
  }
  compile(): string {
    const { condition, trueValue, falseValue } = this
    return stringify.InParens({
      children: `${condition.compile()} ? ${trueValue.compile()} : ${falseValue.compile()}`
    })
  }
  renderChildren(): P.Markup {
    return render.InParens({
      children: [
        render.span("condition", this.condition.markup),
        render.TERNARY_QUESTION,
        this.trueValue.markup,
        render.TERNARY_COLON,
        this.falseValue.markup
      ]
    })
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
export type ASTStartProcessInvocationProps = Prettify<{ name: string; exclusive?: boolean }>

export class ASTStartProcessInvocation extends ASTStatementGroup {
  /** When `exclusive`, prepends a guard statement that `return`s early if process is already running. */
  constructor(match: P.AnyMatch, { name, exclusive = false, ...props }: ASTStartProcessInvocationProps) {
    super(match, props)
    this.statements = []
    const nameArg = new ASTQuotedExpression(match, name)
    const args = [nameArg]
    if (exclusive) args.push(new ASTQuotedExpression(match, "EXCLUSIVE"))

    if (exclusive) {
      this.statements.push(
        new ASTIfStatement(match, {
          condition: new ASTCoreMethodInvocation(match, {
            methodName: "processIsRunning",
            args: [nameArg]
          }),
          statements: new ASTReturnStatement(match)
        })
      )
    }
    this.statements.push(
      new ASTCoreMethodInvocation(match, {
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
export type ASTStopProcessInvocationProps = Prettify<{ name: string }>

export class ASTStopProcessInvocation extends ASTCoreMethodInvocation {
  constructor(match: P.AnyMatch, { name }: ASTStopProcessInvocationProps) {
    super(match, {
      methodName: "stopProcess",
      args: [new ASTQuotedExpression(match, name)]
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
export type ASTJSXElementProps = Prettify<{
  tagName: string
  attrs?: ASTJSXAttribute[]
  children: Array<ASTJSXElement | ASTJSXEndTag | ASTJSXText | ASTJSXExpression>
}>

export class ASTJSXElement extends ASTExpression {
  declare tagName: string
  declare attrs: ASTJSXAttribute[] | undefined
  declare children: Array<ASTJSXElement | ASTJSXEndTag | ASTJSXText | ASTJSXExpression>
  constructor(match: P.AnyMatch, props: ASTJSXElementProps) {
    super(match, props)
    this.assertType("tagName", "string")
    this.assertArrayType("attrs", ASTJSXAttribute, OPTIONAL)
    this.assertArrayType("children", [ASTJSXElement, ASTJSXEndTag, ASTJSXText, ASTJSXExpression])
  }
  /**
   * Builds -- and memoizes -- `spellCore.element({ tag, props, children })` CoreMethodInvocation that
   * `compile()`/`renderChildren()` delegate to.
   * - `props` key only appears when there's at least one attr; `children` key only when there's at
   *   least one child whose own `output` isn't falsy (e.g. `ASTJSXEndTag.output` is always `undefined`
   *   and gets filtered out).
   */
  /*@memoize*/
  get output(): ASTCoreMethodInvocation {
    return this.derived("output", () => {
      const properties: ASTObjectLiteralProperty[] = [
        new ASTObjectLiteralProperty(this.match, {
          property: "tag",
          value: new ASTStringLiteral(this.match, `"${this.tagName}"`)
        })
      ]

      const attrs =
        this.attrs &&
        this.attrs.length &&
        new ASTObjectLiteral(this.match, {
          properties: this.attrs.map((attr) => attr.output)
        })
      if (attrs) {
        properties.push(
          new ASTObjectLiteralProperty(this.match, {
            property: "props",
            value: attrs
          })
        )
      }
      const items = this.children?.length && this.children.map((child) => child?.output).filter(Boolean)
      if (items && items.length) {
        properties.push(
          new ASTObjectLiteralProperty(this.match, {
            property: "children",
            value: new ASTArrayLiteral(this.match, { items: items as ASTExpression[], wrap: true })
          })
        )
      }

      return new ASTCoreMethodInvocation(this.match, {
        methodName: "element",
        args: [new ASTObjectLiteral(this.match, { properties, wrap: (attrs && attrs.wrap) || false })]
      })
    })
  }
  compile(): string {
    return this.output.compile()
  }
  renderChildren(): P.Markup {
    return this.output.markup
  }
}

/** JSXAttribute -- e.g. `a={1}` or bare `d` (boolean shorthand).
 * - `name` is attribute name.
 * - `value` (optional) is attribute value Expression -- missing means boolean-shorthand attr, e.g. bare `d`.
 * - `error` (optional) is parse error associated with this attribute.
 */
export type ASTJSXAttributeProps = Prettify<{ name: string; value?: ASTExpression; error?: ASTParseError }>

export class ASTJSXAttribute extends ASTExpression {
  declare name: string
  declare value: ASTExpression | undefined
  declare error: ASTParseError | undefined
  constructor(match: P.AnyMatch, props: ASTJSXAttributeProps) {
    super(match, props)
    this.assertType("name", "string")
    this.assertType("value", ASTExpression, OPTIONAL)
    this.assertType("error", ASTParseError, OPTIONAL)
  }
  /**
   * Builds -- and memoizes -- this attribute as either an `ASTMethodDefinition` (when `value` is one,
   * i.e. an inline method prop) or a plain `ASTObjectLiteralProperty`, for use inside `ASTJSXElement.output`'s
   * `props` object.
   * - If no `value`: `undefined` when there's a parse `error`, else `true` per JSX spec for an
   *   empty/boolean attribute.
   */
  /*@memoize*/
  get output(): ASTMethodDefinition | ASTObjectLiteralProperty {
    return this.derived("output", () => {
      // If we didn't get a value:
      //  if we have a parse error, return `undefined`
      //  otherwise return `true` as per spec for an empty attribute
      const value: ASTExpression =
        this.value || (this.error ? new ASTUndefinedLiteral(this.match) : new ASTBooleanLiteral(this.match, true))
      if (value instanceof ASTMethodDefinition) {
        value.asProperty = true
        value.methodName = this.name
        if (this.error) value.error = this.error
        return value
      }
      return new ASTObjectLiteralProperty(this.match, {
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
export type ASTJSXEndTagProps = Prettify<{ tagName: string }>

export class ASTJSXEndTag extends ASTExpression {
  declare tagName: string
  constructor(match: P.AnyMatch, props: ASTJSXEndTagProps) {
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
export type ASTJSXTextProps = Prettify<{ value: string; raw?: string }>

export class ASTJSXText extends ASTExpression {
  declare value: string
  declare raw: string | undefined
  constructor(match: P.AnyMatch, props: ASTJSXTextProps) {
    super(match, props)
    this.assertType("value", "string")
    this.assertType("raw", "string", OPTIONAL)
  }
  /** Wraps `value` as a plain `ASTStringLiteral` -- memoized, but trivial enough it barely matters. */
  /*@memoize*/
  get output(): ASTStringLiteral {
    return this.derived("output", () => {
      return new ASTStringLiteral(this.match, this.value)
    })
  }
}

/** JSXExpression -- e.g. `{someExpression}` inside JSX children.
 * - `expression` (optional) is contained Expression -- missing paired with `error` for a broken `{}`.
 * - `error` (optional) is parse error associated with this expression.
 */
export type ASTJSXExpressionProps = Prettify<{ expression?: ASTExpression; error?: ASTParseError }>

export class ASTJSXExpression extends ASTExpression {
  declare expression: ASTExpression | undefined
  declare error: ASTParseError | undefined
  constructor(match: P.AnyMatch, props: ASTJSXExpressionProps) {
    super(match, props)
    this.assertType("expression", ASTExpression, OPTIONAL)
    this.assertType("error", ASTParseError, OPTIONAL)
  }
  /**
   * `expression` as-is normally; when there's an `error`, wraps it (or an `ASTNullLiteral` placeholder if
   * `expression` is also missing) in an `ASTExpressionWithComment` so error surfaces in compiled output.
   */
  /*@memoize*/
  get output(): ASTExpression | ASTExpressionWithComment | undefined {
    return this.derived("output", () => {
      if (this.error) {
        const expression = this.expression || new ASTNullLiteral(this.match)
        return new ASTExpressionWithComment(this.match, {
          expression,
          comment: this.error
        })
      }
      return this.expression
    })
  }
}

/**
 * Does AST `node` contain an `ASTAwaitExpression`, not counting any inside a nested `ASTMethodDefinition`?
 * - Walks every AST node found in `node`'s own fields, and in arrays of them.  Skips `match`, which isn't AST.
 */
function containsAwait(node: unknown): boolean {
  if (node instanceof ASTAwaitExpression) return true
  if (!(node instanceof ASTNode) || node instanceof ASTMethodDefinition) return false
  return Object.entries(node).some(([key, value]) => {
    if (key === "match") return false
    if (Array.isArray(value)) return value.some(containsAwait)
    return containsAwait(value)
  })
}
