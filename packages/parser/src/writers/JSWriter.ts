import { P } from "$/parser"
// Import directly to avoid circular import
import { Writer } from "./Writer"
import * as jsText from "./jsText"

/****************
 * ### `JSWriter`
 * Writes a spell tree as JavaScript:  the `js/solid` target's writer, and what `ASTNode.compile()` calls.
 * - ONE method per kind of node, named for its class -- see `P.Writer`.  Write children with `this.write()`.
 * - Its output is EXACTLY what the AST classes' own `compile()` methods wrote before they moved here (epic
 *   `output-targets`, P2):  the fixture snapshots pin it.
 * - `JSWriter.instance` is the one `ASTNode.compile()` uses.
 ****************/
export class JSWriter extends Writer {
  /** The writer `ASTNode.compile()` uses. */
  static readonly instance = new JSWriter()

  ////////////////
  // ## Lists
  ////////////////

  /** `items` written and joined by `delimiter`;  a missing item writes as `""`;  no items:  `""`. */
  list(items: Array<P.ASTNode | null | undefined> | undefined, delimiter = jsText.SPACED_COMMA): string {
    if (!items || !items.length) return ""
    return items.map((item) => (item ? String(this.write(item)) : "")).join(delimiter)
  }

  /**
   * `(args)`, comma-delimited;  `wrap`:  one per line, default once there are more than 3.
   * - When wrapped and the args themselves span lines, indents the whole list one more `INDENT` (a wrapped object
   *   literal arg).
   */
  args(args: Array<P.ASTNode | null | undefined> | undefined, wrap = (args?.length ?? 0) > 3): string {
    if (!args || args.length === 0) return jsText.EMPTY_PARENS
    let children = this.list(args, wrap ? jsText.INDENTED_COMMA : jsText.SPACED_COMMA)
    if (wrap && children.includes(jsText.NEWLINE)) children = `${jsText.INDENT}${children}`
    return jsText.InParens({ wrap, children })
  }

  /** `[items]`, comma-delimited;  `wrap`:  one per line (no auto-wrap, unlike `args()`). */
  array(items: Array<P.ASTNode | null | undefined> | undefined, wrap = false): string {
    if (!items || items.length === 0) return jsText.EMPTY_ARRAY
    const delimiter = wrap ? jsText.INDENTED_COMMA : jsText.SPACED_COMMA
    return jsText.InSquareBrackets({ wrap, children: this.list(items, delimiter) })
  }

  ////////////////
  // ## Literals
  ////////////////

  ASTBlankLine(node: P.ASTBlankLine): string {
    return "" // "\n"
  }

  ASTExpressionWithComment(node: P.ASTExpressionWithComment): string {
    return `${this.write(node.expression)} ${this.write(node.comment)}`
  }

  /** The literal's own value, as is:  NOTE: not always a string (`ASTNumericLiteral`, `ASTRegExpLiteral`). */
  ASTLiteral(node: P.ASTLiteral): string {
    return node.value as string
  }

  /** A text value in its `quote` (its `raw` spelling, if the spell source gave one), else a fragment, as is. */
  ASTStringLiteral(node: P.ASTStringLiteral): string {
    if (!node.quote) return node.value
    return node.raw ?? jsText.inQuotes(node.value, node.quote)
  }

  ASTBooleanLiteral(node: P.ASTBooleanLiteral): string {
    return node.value ? "true" : "false"
  }

  ASTMissingExpression(node: P.ASTMissingExpression): string {
    return "null"
  }

  ASTNothingLiteral(node: P.ASTNothingLiteral): string {
    return "undefined"
  }

  ASTSelfLiteral(node: P.ASTSelfLiteral): string {
    return "this"
  }

  ASTArrayLiteral(node: P.ASTArrayLiteral): string {
    return this.array(node.items, node.wrap)
  }

  ASTEnumeration(node: P.ASTEnumeration): string {
    return this.array(node.enumeration)
  }

  ////////////////
  // ## Quoting / templating expressions
  ////////////////

  ASTQuotedExpression(node: P.ASTQuotedExpression): string {
    return jsText.InSingleQuotes({ children: String(this.write(node.expression)) })
  }

  ASTBackTickExpression(node: P.ASTBackTickExpression): string {
    return jsText.InBackTicks({ children: String(this.write(node.expression)) })
  }

  ASTBacktickSubstitution(node: P.ASTBacktickSubstitution): string {
    return "${" + this.write(node.expression) + "}"
  }

  ASTTripleBackTickExpression(node: P.ASTTripleBackTickExpression): string {
    return jsText.InTripleBackTicks({ children: String(this.write(node.expression)) })
  }

  ////////////////
  // ## Properties & variables
  ////////////////

  /** Its name bare when a legal identifier, else in single quotes. */
  ASTPropertyLiteral(node: P.ASTPropertyLiteral): string {
    if (node.isLegalIdentifier) return node.value
    return jsText.InSingleQuotes({ children: node.value })
  }

  /** `object.property` when a legal identifier, else `object['property']`. */
  ASTPropertyExpression(node: P.ASTPropertyExpression): string {
    const prop = this.write(node.property)
    if (node.property.isLegalIdentifier) return `${this.write(node.object)}.${prop}`
    return `${this.write(node.object)}['${prop}']`
  }

  /** `name` alone, or `name = default` when it has a default value. */
  ASTVariableExpression(node: P.ASTVariableExpression): string {
    if (node.default) return `${node.name} = ${this.write(node.default)}`
    return node.name
  }

  ASTAwaitExpression(node: P.ASTAwaitExpression): string {
    return `await ${this.write(node.expression)}`
  }

  ////////////////
  // ## Comments
  ////////////////

  /** Prefixes `commentSymbol` with `//` unless it already IS exactly `//`. */
  ASTLineComment(node: P.ASTLineComment): string {
    const { initialWhitespace = " ", value } = node
    let { commentSymbol = "" } = node
    if (commentSymbol !== "//") commentSymbol = `//${commentSymbol}`
    return `${commentSymbol}${initialWhitespace}${value}`
  }

  ASTBlockComment(node: P.ASTBlockComment): string {
    return `/* ${node.value} */`
  }

  /** `/** text *\/` for one line;  one ` * ` line each for several. */
  ASTDocComment(node: P.ASTDocComment): string {
    const lines = node.lines.map((line) => line.replace(/\*\//g, "*\\/"))
    if (lines.length === 1) return `/** ${lines[0]} */`
    return ["/**", ...lines.map((line) => ` * ${line}`), " */"].join("\n")
  }

  /** `/*! first line`, then the rest, the last ending ` *\/`. */
  ASTPreservedComment(node: P.ASTPreservedComment): string {
    const lines = node.lines.map((line) => line.replace(/\*\//g, "*\\/"))
    return `/*! ${lines.join("\n")} */`
  }

  ASTBannerComment(node: P.ASTBannerComment): string {
    const heading = `// ## ${node.value}`
    const rule = "/".repeat(heading.length)
    return [rule, heading, rule].join("\n")
  }

  ASTParserAnnotation(node: P.ASTParserAnnotation): string {
    return `/* ${node.annotation} ${node.value} */`
  }

  ////////////////
  // ## Operators & expressions
  ////////////////

  ASTParenthesizedExpression(node: P.ASTParenthesizedExpression): string {
    return jsText.InParens({ children: String(this.write(node.expression)) })
  }

  ASTNotExpression(node: P.ASTNotExpression): string {
    return `!${this.write(node.expression)}`
  }

  /** `lhs op rhs`, `op` the javascript for its `operator`'s meaning -- see `OPERATORS`. */
  ASTInfixExpression(node: P.ASTInfixExpression): string {
    return `${this.write(node.lhs)} ${JSWriter.OPERATORS[node.operator]} ${this.write(node.rhs)}`
  }

  ////////////////
  // ## Method invocations
  ////////////////

  ASTInvocationArgs(node: P.ASTInvocationArgs): string {
    return this.args(node.args, node.wrap)
  }

  ASTMethodInvocation(node: P.ASTMethodInvocation): string {
    return `${node.methodName}${this.write(node.args)}`
  }

  ASTScopedMethodInvocation(node: P.ASTScopedMethodInvocation): string {
    return `${this.write(node.thing)}.${node.methodName}${this.write(node.args)}`
  }

  ////////////////
  // ## Types & constants
  ////////////////

  ASTTypeExpression(node: P.ASTTypeExpression): string {
    return node.name
  }

  ASTPrototypeExpression(node: P.ASTPrototypeExpression): string {
    return `${this.write(node.type)}.prototype`
  }

  /** Its pre-baked `output`, verbatim -- NOT re-derived from `name`. */
  ASTConstantExpression(node: P.ASTConstantExpression): string {
    return node.output
  }

  ////////////////
  // ## Method definition
  ////////////////

  /**
   * `function name(args) {...}`, `(args) => {...}`, or as an object property `name(args) {...}` /
   * `name: (args) => {...}` -- `async` when it awaits, `export` when `exported`.
   * - SIDE EFFECT:  `console.warn`s if `asProperty` is set but `methodName` is missing.
   */
  ASTMethodDefinition(node: P.ASTMethodDefinition): string {
    const async = node.isAsync ? "async " : ""
    const args = this.params(node)
    const error = node.error ? ` ${this.write(node.error)}` : ""
    const body = this.write(node.body)

    const methodName = this.methodNameOf(node)
    if (node.asProperty) {
      if (!methodName) console.warn("MethodDef: property missing methodName", node)
      if (node.inline) return `${async}${methodName}: ${args} => ${body}${error}`
      return `${async}${methodName}${args} ${body}${error}`
    }

    // normal method
    if (node.inline) return `${async}${args} => ${body}${error}`
    const export_ = node.exported ? "export " : ""
    return `${export_}${async}function ${methodName}${args} ${body}${error}`
  }

  /**
   * `method` as method shorthand under `name`, whatever its own `methodName`, e.g. in a class body.
   * - `name` is ready to print:  quoted if need be, and may lead with `get `, e.g. `get title` => `get title() {...}`.
   */
  methodNamed(method: P.ASTMethodDefinition, name: string, thisType?: string): string {
    const async = method.isAsync ? "async " : ""
    const error = method.error ? ` ${this.write(method.error)}` : ""
    return `${async}${name}${this.params(method, thisType)} ${this.write(method.body)}${error}`
  }

  /** `method` as an anonymous `function (args) {...}` -- NOT an arrow, so `this` is whatever it's called on. */
  anonymousFunction(method: P.ASTMethodDefinition, thisType?: string): string {
    const async = method.isAsync ? "async " : ""
    const error = method.error ? ` ${this.write(method.error)}` : ""
    return `${async}function ${this.params(method, thisType)} ${this.write(method.body)}${error}`
  }

  /**
   * `method`'s parameters, in parens:  `(card, pile = stock)`.
   * - `thisType`:  the class `this` is, when it's written outside it, e.g. `Card` for
   *   `Card.prototype.play = function () {...}`.  Javascript has nothing to say about it;  a typed target does --
   *   see `TSWriter`.
   */
  params(method: P.ASTMethodDefinition, thisType?: string): string {
    return this.args(method.args)
  }

  /** `method`'s `methodName`, quoted when used `asProperty` with a non-legal-identifier name;  `""` if unset. */
  methodNameOf(method: P.ASTMethodDefinition): string {
    const { methodName } = method
    if (!methodName) return ""
    if (method.asProperty && !jsText.isLegalIdentifier(methodName)) return `'${methodName}'`
    return methodName
  }

  ////////////////
  // ## Object literals
  ////////////////

  ASTObjectLiteral(node: P.ASTObjectLiteral): string {
    const { wrap } = node
    const delimiter = wrap ? jsText.INDENTED_COMMA : jsText.SPACED_COMMA
    return jsText.Block({ wrap, space: !wrap, children: this.list(node.properties, delimiter) })
  }

  /** Shorthand `prop` when it has no `value`, else `prop: value`. */
  ASTObjectLiteralProperty(node: P.ASTObjectLiteralProperty): string {
    const error = node.error ? ` ${this.write(node.error)}` : ""
    const prop = this.write(node.property)
    // If no value, assume it's available as a local variable.
    if (!node.value) return `${prop}${error}`
    return `${prop}: ${this.write(node.value)}${error}`
  }

  ////////////////
  // ## Statements
  ////////////////

  ASTStatementGroup(node: P.ASTStatementGroup): string {
    return this.list(node.statements, jsText.NEWLINE)
  }

  ASTStatementBlock(node: P.ASTStatementBlock): string {
    return jsText.Block({ wrap: node.wrap, children: this.list(node.statements, jsText.NEWLINE) })
  }

  ASTTryCatchBlock(node: P.ASTTryCatchBlock): string {
    const { body, errorArg, catchBlock, finallyBlock } = node
    const output = [`try ${this.write(body)}`]
    if (catchBlock) output.push(`catch (${errorArg ? this.write(errorArg) : ""}) ${this.write(catchBlock)}`)
    if (finallyBlock) output.push(`finally ${this.write(finallyBlock)}`)
    return output.join("\n")
  }

  ////////////////
  // ## Assignment
  ////////////////

  ASTAssignmentStatement(node: P.ASTAssignmentStatement): string {
    const export_ = this.isExported(node) ? "export " : ""
    const declarator = node.isNewVariable ? "let " : ""
    return `${export_}${declarator}${this.write(node.thing)} = ${this.write(node.value)}`
  }

  /** `true` only for a new variable at `ProjectScope` / `FileScope` whose name isn't in `EXPORT_BLACKLIST`. */
  isExported(node: P.ASTAssignmentStatement): boolean {
    if (!JSWriter.EXPORT_VARS || !node.isNewVariable) return false
    const { scope } = node.match
    if (!(scope instanceof P.ProjectScope || scope instanceof P.FileScope)) return false
    const varName = String(this.write(node.thing))
    return !JSWriter.EXPORT_BLACKLIST.test(varName)
  }

  /** `{ variables } = thing`, or `let { variables } = thing` when `isNewVariable`. */
  ASTDestructuredAssignment(node: P.ASTDestructuredAssignment): string {
    const declarator = node.isNewVariable ? "let " : ""
    const vars = jsText.InCurlies({ space: true, children: this.list(node.variables) })
    return `${declarator}${vars} = ${this.write(node.thing)}`
  }

  /** Bare `return` when it has no `value`, else `return value`. */
  ASTReturnStatement(node: P.ASTReturnStatement): string {
    if (!node.value) return "return"
    return `return ${this.write(node.value)}`
  }

  ////////////////
  // ## Classes & instances
  ////////////////

  /** NOTE: indents its members' non-blank lines only -- `jsText.Block()` would leave a tab on blank ones. */
  ASTClassDeclaration(node: P.ASTClassDeclaration): string {
    const { type, superType, members } = node
    const superDeclarator = superType ? `extends ${superType.name} ` : ""
    const declaration = `export class ${type.name} ${superDeclarator}`
    if (!members?.length) return `${declaration}${jsText.EMPTY_BLOCK}`
    const body = members
      .map((member) => (member instanceof P.ASTClassMember ? this.writeAsMember(member) : this.write(member)))
      .join(jsText.NEWLINE)
      .split(jsText.NEWLINE)
      .map((line) => (line ? `${jsText.INDENT}${line}` : line))
      .join(jsText.NEWLINE)
    return `${declaration}${jsText.LEFT_CURLY}${jsText.NEWLINE}${body}${jsText.NEWLINE}${jsText.RIGHT_CURLY}`
  }

  /** `new Type()` (empty parens) when it has no `props`, else `new Type(props)`. */
  ASTNewInstanceExpression(node: P.ASTNewInstanceExpression): string {
    const props = jsText.InParens({ children: node.props ? this.write(node.props) : undefined })
    return `new ${this.write(node.type)}${props}`
  }

  ASTListExpression(node: P.ASTListExpression): string {
    return jsText.InSquareBrackets({ children: this.list(node.items) })
  }

  ////////////////
  // ## Class members
  ////////////////

  /** In its class's body:  `name(args) {...}` or `get name() {...}`. */
  ASTPropertyDefinitionAsMember(node: P.ASTPropertyDefinition): string {
    const name = this.write(node.property)
    if (node.get) return this.methodNamed(node.get, `get ${name}`)
    return this.methodNamed(node.method!, name)
  }

  /**
   * From outside its class:  `Type.prototype.name = function (args) {...}`, or for a getter
   * `Object.defineProperty(Type.prototype, 'name', { get() {...}, configurable: true })`.
   */
  ASTPropertyDefinition(node: P.ASTPropertyDefinition): string {
    const prototype = this.write(node.prototypeExpression)
    if (node.get) {
      const descriptor = [`${this.methodNamed(node.get, "get", node.typeName)},`, "configurable: true"].join(
        jsText.NEWLINE
      )
      return `Object.defineProperty(${prototype}, ${jsText.quoted(node.property.value)}, ${jsText.Block({ wrap: true, children: descriptor })})`
    }
    return `${prototype}${propertyAccess(node.property)} = ${this.anonymousFunction(node.method!, node.typeName)}`
  }

  /** In its class's body:  `static { this.declareProp(...) }` (if it declares anything), its getter and setter. */
  ASTReactivePropertyAsMember(node: P.ASTReactiveProperty): string {
    const name = this.write(node.property)
    const declare = this.declareCall(node, "this")
    return [
      declare && `static { ${declare} }`,
      `get ${name}()${this.valueType(node)} ${this.getterBody(node)}`,
      `set ${name}(${this.setterParams(node)}) ${this.setterBody(node)}`
    ]
      .filter(Boolean)
      .join(jsText.NEWLINE)
  }

  /**
   * From outside its class:  `Type.declareProp(...)` (if it declares anything), then
   * `Object.defineProperty(Type.prototype, 'name', { get() {...}, set(value) {...}, configurable: true })`.
   */
  ASTReactiveProperty(node: P.ASTReactiveProperty): string {
    const descriptor = [
      `get(${this.thisParam(node.typeName)})${this.valueType(node)} ${this.getterBody(node)},`,
      `set(${this.setterParams(node, node.typeName)}) ${this.setterBody(node)},`,
      "configurable: true"
    ]
    const block = jsText.Block({ wrap: true, children: descriptor.join(jsText.NEWLINE) })
    const define = `Object.defineProperty(${this.write(node.prototypeExpression)}, ${jsText.quoted(node.property.value)}, ${block})`
    const declare = this.declareCall(node, this.write(node.type))
    return declare ? [declare, define].join(jsText.NEWLINE) : define
  }

  /** `{ return this.getProp('name') }`:  its default, if any, is in its class's schema -- see `declaration()`. */
  getterBody(node: P.ASTReactiveProperty): string {
    return `{ return this.getProp(${jsText.quoted(node.property.value)}) }`
  }

  /** `: type` after its getter's parens:  javascript has none -- see `TSWriter`. */
  valueType(node: P.ASTReactiveProperty): string {
    return ""
  }

  /** Its setter's parameters:  `value`.  `thisType`:  as `params()`'s. */
  setterParams(node: P.ASTReactiveProperty, thisType?: string): string {
    return "value"
  }

  /** A `this` parameter typed `thisType`, for a function written outside its class:  javascript has none. */
  thisParam(thisType?: string): string {
    return ""
  }

  /** `{ this.setProp('name', value) }`:  its `check`, if any, is in its class's schema -- see `declaration()`. */
  setterBody(node: P.ASTReactiveProperty): string {
    return `{ this.setProp(${jsText.quoted(node.property.value)}, value) }`
  }

  /**
   * What its class's schema declares about `node` -- its `check`'s keys, plus `init` for its `initializer` -- e.g.
   * `{ type: 'text' }`, `{ init: () => new List() }`.  `undefined` if nothing:  then it's undeclared.
   */
  declaration(node: P.ASTReactiveProperty): string | undefined {
    const parts = (node.check?.properties ?? []).map((property) => this.write(property))
    if (node.initializer) parts.push(`init: () => ${this.write(node.initializer)}`)
    return parts.length ? `{ ${parts.join(", ")} }` : undefined
  }

  /** `declareProp('name', {...})` with `declaration()`, called on `owner`, e.g. `this` in its class's body. */
  declareCall(node: P.ASTReactiveProperty, owner: string): string | undefined {
    const declaration = this.declaration(node)
    return declaration && `${owner}.declareProp(${jsText.quoted(node.property.value)}, ${declaration})`
  }

  ASTStaticDefinitionAsMember(node: P.ASTStaticDefinition): string {
    return `static ${node.name} = ${this.write(node.value)}`
  }

  ASTStaticDefinition(node: P.ASTStaticDefinition): string {
    return `${this.write(node.type)}.${node.name} = ${this.write(node.value)}`
  }

  /** Its `member`, patched onto its class from outside, wherever that class is written. */
  ASTPatchedMember(node: P.ASTPatchedMember): string {
    return this.write(node.member)
  }

  ////////////////
  // ## Conditionals
  ////////////////

  ASTIfStatement(node: P.ASTIfStatement): string {
    return `if ${this.write(node.condition)} ${this.write(node.statements)}`
  }

  ASTElseIfStatement(node: P.ASTElseIfStatement): string {
    return `else if ${this.write(node.condition)} ${this.write(node.statements)}`
  }

  ASTElseStatement(node: P.ASTElseStatement): string {
    return `else ${this.write(node.statements)}`
  }

  ASTTernaryExpression(node: P.ASTTernaryExpression): string {
    const { condition, trueValue, falseValue } = node
    return jsText.InParens({
      children: `${this.write(condition)} ? ${this.write(trueValue)} : ${this.write(falseValue)}`
    })
  }

  ////////////////
  // ## JSX
  ////////////////

  /** Its `output`, the `spellCore.element({...})` call it builds. */
  ASTJSXElement(node: P.ASTJSXElement): string {
    return this.write(node.output)
  }

  ////////////////
  // ## Settings
  ////////////////

  /**
   * Javascript for each infix operator's meaning (`P.ASTOperator`).
   * - `equals` is `==`, not `===`:  spell's `is` is forgiving, `"2"` is `2`.
   */
  static OPERATORS: Record<P.ASTOperator, string> = {
    and: "&&",
    or: "||",
    equals: "==",
    "not equals": "!=",
    "exactly equals": "===",
    "not exactly equals": "!==",
    "less than": "<",
    "greater than": ">",
    "at most": "<=",
    "at least": ">=",
    plus: "+",
    minus: "-",
    times: "*",
    "divided by": "/"
  }

  /** Should we `export` top-level vars?  Global toggle -- flip to `false` to disable entirely. */
  static EXPORT_VARS = true
  /**
   * Names of top-level vars that we NEVER export:  `it`, e.g. Mocha's implicit `it`, and spell's numbered `it`s,
   * `it_2`, `it_3`... -- temporaries, not something another file should use.
   */
  static EXPORT_BLACKLIST = /^it(_\d+)?$/
}

/** `.name`, or `['name']` if `property` isn't a legal identifier. */
function propertyAccess(property: P.ASTPropertyLiteral): string {
  return property.isLegalIdentifier ? `.${property.value}` : `[${jsText.quoted(property.value)}]`
}
