import { P } from "$/parser"
// Import directly to avoid circular import
import { Writer } from "./Writer"
import * as jsText from "./jsText"
import {
  CORE_IMPORT,
  EVENTS,
  IMPORTED_HELPERS,
  LOOSE_CORE_CALL,
  PROJECT_IMPORT,
  alike,
  attributeName,
  isCoreCall,
  isKnownType,
  isNumber,
  isTight,
  kindFromDatatype,
  kindOfType,
  newListItemName,
  readsMember,
  unwrapped
} from "./jsShapes"
import { WriterProject, camelCaseOf, forEachNode, type ProgramPlace } from "./WriterProject"

/****************
 * ### `JSWriter`
 * Writes a spell tree as JavaScript:  the `js/solid` target's writer, what `ASTNode.compile()` calls.
 * - It's also the base of `P.TSWriter`, which writes TypeScript on the same runtime.
 * - ONE method per kind of node, named for its class -- see `P.Writer`.
 *   Write children with `this.write()`.
 * - Writes what a person writing javascript would, where spell's tree says enough (epic `output-targets`, P19):
 *   - every member's name as javascript writes it, `card.turnFaceUp()`, `deck.isSetUp` -- see `nameOf()`
 *   - a spell `List`'s own methods, `stock.lastItem`, `deck.filter(...)`;  a loop that waits as `for...of`
 *   - `===` where both sides are known and alike, `=== undefined` for nothing, a yes / no tested bare
 *   - `@spell/core`'s `on()`, `trigger()`, `positionOf()` imported by name;  text built with `+` as template text
 *   - each element drawn with Solid's own `h()` (P20):  `h("span", { class: "suit" }, () => this.shortSuit)`
 *   - Plain javascript only:  it runs as is, no build step -- so no JSX, decorators or types, which are TypeScript's
 *   - Those need to know what a value is:
 *     `kindOf()`, from what the whole project says (`forProject()`, a `WriterProject`).
 *     Shared with the TypeScript writer, so both say the same things the same way.
 * - Tidy, as a person writes it, and as the TypeScript writer writes it too (P22):
 *   - `const` unless it's set again
 *   - parentheses only where javascript needs them, or a reader would want them -- see `operand()`
 *   - braces only around more than one statement, e.g. `if (this.isEmpty) return 0`
 *   - an inline function as an arrow, its body an expression when it only returns one, no unused parameters
 *   - double quotes
 *   - one class body per type:  members written anywhere in the project go inside their class
 * - `JSWriter.instance` is the one `ASTNode.compile()` uses:  it knows no project.
 ****************/
export class JSWriter extends Writer {
  /** The writer `ASTNode.compile()` uses:  it knows no project -- see `forProject()`. */
  static readonly instance = new JSWriter()

  /** What we know of the project we're writing -- see `WriterProject`. */
  readonly project: WriterProject

  /** The class we're writing, e.g. `Tableau`:  what `this` is -- see `kindOf()`. */
  protected currentClass: string | undefined
  /** `@spell/core`'s helpers the code calls by name, e.g. `on`, `trigger`, `positionOf`:  imported by `module()`. */
  protected coreImports = new Set<string>()
  /** The nodes written as statements, not values:  `spellCore.map()` there is a `forEach()`. */
  protected statements = new WeakSet<P.ASTNode>()
  /** While writing a loop's body:  a bare `return` in it is `continue` -- see `loop()`. */
  protected returnContinues = false
  /** What the program gives each member, worked out once, by `<Class>.<member>` -- see `givenKind()`. */
  private givenKinds = new Map<string, string | undefined>()
  /** The members `givenKind()` is working out, by `<Class>.<member>`:  one asked for again can't be told. */
  private workingOut = new Set<string>()

  constructor(project = new WriterProject()) {
    super()
    this.project = project
  }

  /**
   * A writer of our class for the project whose files' statements are `files`, parsed in `scope`:
   * see `WriterProject`.
   */
  forProject(files: P.ASTNode[][], scope?: P.Scope): this {
    const Class = this.constructor as new (project: WriterProject) => this
    return new Class(WriterProject.of(files, scope))
  }

  /**
   * `match`'s code, a file's, a statement's or a rule test's, written as if it were the whole project, in its scope
   * (`forProject()`):  so a getter its project declares, or imports, is read by its member name, `card.isFaceUp`.
   * - For code alone, e.g. the editor's view of one file, a hover, a rule test:
   *   a project's is written whole, by `SP.SpellProject.combineCompiled()`.
   * - A rule with no tree compiles itself.
   */
  writeMatch(match: P.Match | undefined): unknown {
    const ast = match?.rule.getAST ? match.AST : undefined
    if (!ast) return match?.compile()
    const statements = ast instanceof P.ASTStatementGroup ? (ast.statements ?? []) : [ast]
    return this.forProject([statements], match!.scope).write(ast)
  }

  /**
   * The finished module:
   * - `@spell/core`'s helpers the code calls by name, added to its import (see `coreImportNames()`)
   * - what it imports from another project, by our names, e.g. `playFromTheStockPile`:
   *   that project exports them so
   * - a class keeps its name, e.g. `Stock_Pile`
   */
  module(code: string): string {
    const names = this.coreImportNames(code)
    if (names.length) {
      const replaced = code.replace(CORE_IMPORT, (_line, imported: string) => {
        return `import { ${[...imported.split(/,\s*/), ...names].join(", ")} } from "@spell/core"`
      })
      code = replaced !== code ? replaced : `import { ${names.join(", ")} } from "@spell/core"\n${code}`
    }
    return code.replace(PROJECT_IMPORT, (_line, imported: string, from: string) => {
      const renamed = imported.split(/,\s*/).map((name) => {
        const [there, here = there] = name.split(/\s+as\s+/) as [string, string?]
        const isClass = /^[A-Z]/.test(there)
        const [thereName, hereName] = isClass ? [there, here] : [this.nameOf(there), this.nameOf(here)]
        return thereName === hereName ? thereName : `${thereName} as ${hereName}`
      })
      return `import { ${renamed.join(", ")} } from "${from}"`
    })
  }

  /** What `module()` adds to `code`'s `@spell/core` import:  the helpers it calls by name, e.g. `trigger`. */
  coreImportNames(code: string): string[] {
    // `h` first, beside the classes:  what draws, then the helpers
    return [...this.coreImports].sort((a, b) => Number(b === "h") - Number(a === "h"))
  }

  ////////////////
  // ## Names
  ////////////////

  /**
   * How we write spell's `name`, e.g. `add_card_to_pile`:
   * each writer says how it writes names (epic `output-targets`, Q51, Q56).
   * - javascript (and TypeScript) write EVERY name in camelCase:  `addCardToPile`, `isSetUp`
   *   - methods, getters, functions, variables, and stored properties too
   *   - So a stored property's name is also camelCase where it's saved:
   *     a thing's JSON, `getProp()`, the Thing Explorer.
   *   - One rule for every member:  a read, `deck.isSetUp`, needn't know which kind it is.
   * - a later Python writer would keep spell's snake_case
   */
  nameOf(name: string): string {
    return camelCaseOf(name)
  }

  /**
   * Member `property`'s name, by our name (`nameOf()`) -- spell's as is when it isn't a legal identifier,
   * for whoever writes it to quote:  `["@type"]`.
   */
  propertyName(property: P.ASTPropertyLiteral): string {
    return property.isLegalIdentifier ? this.nameOf(property.value) : property.value
  }

  /** Text in our quotes:  `"name"`. */
  quoted(text: string): string {
    return jsText.inQuotes(text, '"')
  }

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
   * - When wrapped and the args themselves span lines, indents the whole list one more `INDENT`
   *   (a wrapped object literal arg).
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

  /**
   * A text value in its `quote` (its `raw` spelling, if the spell source gave one), else a fragment, as is.
   * - In double quotes, unless it's single-quoted with a `"` in it.
   */
  ASTStringLiteral(node: P.ASTStringLiteral): string {
    if (!node.quote) return node.value
    return doubleQuoted(node.raw ?? jsText.inQuotes(node.value, node.quote))
  }

  /** `` `images/${this.rank}-of-${this.suit}.png` ``:  its text as written, with a backtick and `${` escaped. */
  ASTTemplateString(node: P.ASTTemplateString): string {
    const body = node.parts
      .map((part) =>
        typeof part === "string" ? part.replace(/`/g, "\\`").replace(/\$\{/g, "\\${") : `\${${this.write(part)}}`
      )
      .join("")
    return `\`${body}\``
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

  /** A quoted word, e.g. an enumeration's value:  `"clubs"`. */
  ASTQuotedExpression(node: P.ASTQuotedExpression): string {
    return doubleQuoted(jsText.InSingleQuotes({ children: String(this.write(node.expression)) }))
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

  /** A property's name (`propertyName()`), bare when a legal identifier, else spell's, quoted. */
  ASTPropertyLiteral(node: P.ASTPropertyLiteral): string {
    const name = this.propertyName(node)
    return node.isLegalIdentifier ? name : this.quoted(name)
  }

  /**
   * `object.property` when a legal identifier, else `object["property"]`, by our name:  `card.isFaceUp`.
   * - `?.` off what may be nothing (see `mayBeNothing()`), never when it's being set -- see `memberDot()`.
   */
  ASTPropertyExpression(node: P.ASTPropertyExpression): string {
    const object = this.memberObject(node.object)
    const dot = this.memberDot(node)
    const name = this.propertyName(node.property)
    if (node.property.isLegalIdentifier) return `${object}${dot}${name}`
    return `${object}${dot === "." ? "" : dot}[${this.quoted(name)}]`
  }

  /** What `node`'s property is read off with:  `?.` off what may be nothing, never when it's being set. */
  memberDot(node: P.ASTPropertyExpression): string {
    return !this.isSetting(node) && this.mayBeNothing(node.object) ? "?." : "."
  }

  /** `name` alone, by our name (`allPiles`), or `name = default` when it has a default value. */
  ASTVariableExpression(node: P.ASTVariableExpression): string {
    const name = this.variableName(node)
    if (node.default) return `${name} = ${this.bare(node.default)}`
    return name
  }

  /** `node`'s name, as we write a variable's (`nameOf()`):  `start_pile` => `startPile`;  `spellCore` as is. */
  variableName(node: P.ASTVariableExpression): string {
    return node.type === "global" ? node.name : this.nameOf(node.name)
  }

  /** `await x`, or a loop whose body waits written as a plain loop -- see `loop()`. */
  ASTAwaitExpression(node: P.ASTAwaitExpression): string {
    return (this.statements.has(node) && this.loop(node.expression)) || `await ${this.tight(node.expression)}`
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

  /** `(expression)` -- but text built with `+`, written as template text, needs none:  see `templateText()`. */
  ASTParenthesizedExpression(node: P.ASTParenthesizedExpression): string {
    const inner = node.expression
    const template = inner instanceof P.ASTInfixExpression && inner.operator === "plus" && this.templateText(inner)
    return template || jsText.InParens({ children: String(this.write(inner)) })
  }

  /**
   * `!x`, or `!(a && b)` when what it negates is an operator.
   * - `is not defined`:  `x === undefined`.
   * - `is not empty` on text:  `!!x`, not `!(!x)`.
   */
  ASTNotExpression(node: P.ASTNotExpression): string {
    const inner = unwrapped(node.expression)
    if (isCoreCall(inner) && (inner as P.ASTScopedMethodInvocation).methodName === "isDefined") {
      const [value] = (inner as P.ASTScopedMethodInvocation).args.args ?? []
      if (value) return `${this.tight(value)} === undefined`
    }
    const text = this.nonEmptyText(node)
    if (text) return `!!${this.tight(text)}`
    return `!${this.tight(node.expression)}`
  }

  /**
   * `lhs op rhs`, `op` the javascript for its `operator`'s meaning -- see `OPERATORS`.
   * - `+` building text as template text:  `` `${this.rank}-of-${this.suit}` `` -- see `templateText()`.
   * - `is` / `is not` as a person writes it:  see `comparison()`.
   */
  ASTInfixExpression(node: P.ASTInfixExpression): string {
    const template = node.operator === "plus" && this.templateText(node)
    if (template) return template
    const comparison = this.comparison(node)
    if (comparison) return comparison
    const operator = JSWriter.OPERATORS[node.operator]
    return `${this.operand(node.lhs, node.operator, "lhs")} ${operator} ${this.operand(node.rhs, node.operator, "rhs")}`
  }

  /**
   * `node`, a chain of `+` with text in it, as template text:
   * `"Score: " + this.score` => `` `Score: ${this.score}` ``.
   * - `undefined` when it isn't:  no text in the chain,
   *   or text only after two values (`a + b + "!"` adds `a` and `b` first), or text with escapes in it.
   */
  templateText(node: P.ASTInfixExpression): string | undefined {
    const parts: P.ASTExpression[] = []
    let rest: P.ASTExpression = node
    // `+` is left-associative:  only the LEFT side is the same chain
    while (rest instanceof P.ASTInfixExpression && rest.operator === "plus") {
      parts.unshift(rest.rhs)
      rest = unwrapped(rest.lhs)
    }
    parts.unshift(rest)
    const firstText = parts.findIndex((part) => this.textOf(part) !== undefined)
    if (firstText < 0 || firstText > 1) return undefined
    const body = parts.map((part) => this.textOf(part) ?? `\${${this.bare(part)}}`)
    if (body.some((text) => text === JSWriter.ESCAPED)) return undefined
    return `\`${body.join("")}\``
  }

  /**
   * Spell's `is` / `is not` as a person writes it in javascript -- `undefined` to keep its forgiving `==`:
   * - a choice compared to yes or no:  bare, `pile.droppable`, `!pile.droppable` (Q39)
   * - nothing:  `=== undefined` / `!== undefined`, as spell's nothing is `undefined`
   * - both sides' kinds known and alike (text, numbers, choices, one class):
   *   `===` / `!==`, which then means the same -- `this.operator === "+"`, `this.value === card.value + 1`
   * - where they aren't, `"2"` is `2` in spell:  `==`
   */
  comparison(node: P.ASTInfixExpression): string | undefined {
    const { operator, lhs, rhs } = node
    if (operator !== "equals" && operator !== "not equals") return undefined
    const isNot = operator === "not equals"
    const [value, boolean] = unwrapped(rhs) instanceof P.ASTBooleanLiteral ? [lhs, rhs] : [rhs, lhs]
    const yesOrNo = unwrapped(boolean)
    if (yesOrNo instanceof P.ASTBooleanLiteral && this.kindOf(value) === "choice") {
      return yesOrNo.value !== isNot ? this.bare(value) : `!${this.tight(value)}`
    }
    const strict = isNot ? "!==" : "==="
    const isNothing = (it: P.ASTExpression) => unwrapped(it) instanceof P.ASTNothingLiteral
    if (isNothing(lhs) || isNothing(rhs))
      return `${this.operand(lhs, operator, "lhs")} ${strict} ${this.operand(rhs, operator, "rhs")}`
    const kind = this.kindOf(lhs)
    const other = this.kindOf(rhs)
    // two of the project's things:  `==` and `===` mean the same for objects
    const areThings = !!kind && !!other && this.project.isClass(kind) && this.project.isClass(other)
    if (!areThings && (!kind || kind !== other || kind === "list" || kind === "array")) return undefined
    return `${this.operand(lhs, operator, "lhs")} ${strict} ${this.operand(rhs, operator, "rhs")}`
  }

  /**
   * `operand` of an `operator`, in parentheses only where javascript needs them, or where a reader would want them:
   * `&&` inside `||`, a comparison in a comparison.
   */
  operand(operand: P.ASTExpression, operator: P.ASTOperator, side: "lhs" | "rhs"): string {
    const inner = unwrapped(operand)
    if (inner instanceof P.ASTTernaryExpression) return `(${this.write(inner)})`
    // `!x`, `await x` and `new X()` bind tighter than any operator
    const isUnary =
      inner instanceof P.ASTNotExpression ||
      inner instanceof P.ASTAwaitExpression ||
      inner instanceof P.ASTNewInstanceExpression
    if (isUnary) return String(this.write(inner))
    // a helper written as a comparison (`x instanceof Tableau`) binds tighter than `&&` / `||`
    if (isCoreCall(inner) && PRECEDENCE[operator] <= PRECEDENCE.and) return String(this.write(inner))
    if (!(inner instanceof P.ASTInfixExpression)) return this.tight(inner)
    const mine = PRECEDENCE[inner.operator]
    const theirs = PRECEDENCE[operator]
    const isLogical = (level: number) => level <= PRECEDENCE.and
    const needsParens =
      mine < theirs ||
      (mine === theirs && side === "rhs") ||
      (mine === theirs && mine >= PRECEDENCE.equals && mine <= PRECEDENCE["less than"]) ||
      (isLogical(mine) && isLogical(theirs) && mine !== theirs)
    return needsParens ? `(${this.write(inner)})` : String(this.write(inner))
  }

  /** The text `node` says isn't empty (`!spellCore.isEmpty(text)`), else `undefined`. */
  nonEmptyText(node: P.ASTExpression): P.ASTExpression | undefined {
    const not = unwrapped(node)
    if (!(not instanceof P.ASTNotExpression)) return undefined
    const inner = unwrapped(not.expression)
    if (!isCoreCall(inner) || (inner as P.ASTScopedMethodInvocation).methodName !== "isEmpty") return undefined
    const [value] = (inner as P.ASTScopedMethodInvocation).args.args ?? []
    return value && this.kindOf(value) === "text" ? value : undefined
  }

  /** An `if`'s condition, without its parentheses:  text that isn't empty is tested bare, `if (this.right)`. */
  condition(node: P.ASTExpression): string {
    const text = this.nonEmptyText(node)
    return text ? this.bare(text) : this.bare(node)
  }

  /** `node` written without the parentheses around it:  where nothing binds tighter, e.g. an argument. */
  bare(node: P.ASTExpression): string {
    return String(this.write(unwrapped(node)))
  }

  /** `node`, in parentheses unless it binds at least as tightly as `.` -- e.g. before `.` or after `!`. */
  tight(node: P.ASTExpression): string {
    const inner = unwrapped(node)
    if (!this.bindsTightly(inner)) return `(${this.write(inner)})`
    const text = String(this.write(inner))
    // a `spellCore` helper said with an operator:  `x !== undefined`, `x instanceof Tableau`, `!x`
    return isCoreCall(inner) && LOOSE_CORE_CALL.test(text) ? `(${text})` : text
  }

  /** Does `node` bind at least as tightly as `.`?  An element too:  javascript draws it with a call, `h(...)`. */
  protected bindsTightly(node: P.ASTExpression): boolean {
    return isTight(node) || node instanceof P.ASTJSXElement
  }

  ////////////////
  // ## Method invocations
  ////////////////

  ASTInvocationArgs(node: P.ASTInvocationArgs): string {
    return this.args(node.args, node.wrap)
  }

  /** `name(args)`, by our name:  `playFromTheStockPile()`. */
  ASTMethodInvocation(node: P.ASTMethodInvocation): string {
    return `${this.nameOf(node.methodName)}${this.argsOf(node)}`
  }

  /** A call's `(args)`, for a method or function of the program's own. */
  argsOf(node: P.ASTMethodInvocation): string {
    return String(this.write(node.args))
  }

  /**
   * `thing.method(args)`, by our name:  `card.moveToPile(endPile)`.
   * - `?.` off what may be nothing, see `mayBeNothing()`.
   * - A `spellCore` helper is written as javascript says it where it can:  see `coreCall()`.
   */
  ASTScopedMethodInvocation(node: P.ASTScopedMethodInvocation): string {
    if (node.thing instanceof P.ASTSpellCoreExpression) {
      const written = this.coreCall(node)
      if (written !== undefined) return written
    }
    const dot = this.mayBeNothing(node.thing) ? "?." : "."
    return `${this.memberObject(node.thing)}${dot}${this.nameOf(node.methodName)}${this.argsOf(node)}`
  }

  /** What a member is read from, ready for a `.` or `?.` after it:  in parentheses unless it binds as tightly. */
  memberObject(object: P.ASTExpression): string {
    return this.tight(object)
  }

  ////////////////
  // ## `spellCore`'s helpers, as javascript says them
  ////////////////

  /**
   * A `spellCore` helper as javascript says it, where it can:
   * `undefined` where it can't, for `spellCore.<name>()`.
   * - `is defined`:  `x !== undefined`
   * - text spell knows is text:  `!this.right`, `this.input.includes(".")`, `x.toLocaleUpperCase()`
   * - a list written out:  `["diamonds", "hearts"].includes(this.suit)`
   * - a type test:  `x instanceof Tableau`, `typeof x === "number"`
   * - one of spell's `List`s:  its own method, see `listCall()`
   * - a loop over a plain array, as a statement:  `Card.Ranks.forEach(...)`
   * - a position in a list written out, or another helper used often:  imported by name, `positionOf(Card.Ranks, rank)`
   * - events:  `trigger()`, `on()`, see `eventCall()`
   */
  coreCall(node: P.ASTScopedMethodInvocation): string | undefined {
    const args = node.args.args ?? []
    const [first, ...rest] = args
    const name = node.methodName
    if (name === "isDefined" && first) return `${this.tight(first)} !== undefined`
    if (EVENTS.has(name)) return this.eventCall(name, args)
    if (!first) return undefined
    const kind = this.kindOf(first)
    if (kind === "text") {
      // text that may be nothing, e.g. the first character of an empty name:  `?.`, as spell reads off nothing
      const text = `${this.tight(first)}${this.mayBeNothing(first) ? "?." : "."}`
      if (name === "isEmpty") return `!${this.tight(first)}`
      if (name === "includes" && rest.length === 1) return `${text}includes(${this.bare(rest[0]!)})`
      if (name === "upperCase") return `${text}toLocaleUpperCase()`
      if (name === "lowerCase") return `${text}toLocaleLowerCase()`
    }
    if (name === "upperCase") return `\`\${${this.bare(first)} ?? ${this.quoted("")}}\`.toLocaleUpperCase()`
    if (name === "includes" && rest.length === 1 && unwrapped(first) instanceof P.ASTArrayLiteral) {
      return `${this.write(unwrapped(first))}.includes(${this.bare(rest[0]!)})`
    }
    if (name === "isOfType" && rest.length === 1) {
      const typeTest = this.typeTest(first, rest[0]!)
      if (typeTest) return typeTest
    }
    if (this.isList(first)) {
      const written = this.listCall(name, first, rest, this.statements.has(node))
      if (written !== undefined) return written
    }
    if (kind === "array" && (name === "map" || name === "forEach") && this.statements.has(node)) {
      return this.forEachOf(first, rest[0])
    }
    if (IMPORTED_HELPERS.has(name)) {
      this.coreImports.add(name)
      return `${name}${this.write(node.args)}`
    }
    return undefined
  }

  /**
   * `spellCore.isOfType(x, "Tableau")`, as javascript tests a type -- `undefined` to leave it to `spellCore`:
   * - a class:  `x instanceof Tableau`
   * - a number:  `typeof x === "number"`, text:  `typeof x === "string"`
   * - spell's other kinds, on one of spell's things:  its own `x.isOfType("integer")`
   */
  typeTest(thing: P.ASTExpression, type: P.ASTExpression): string | undefined {
    const inner = unwrapped(type)
    const name =
      inner instanceof P.ASTStringLiteral || inner instanceof P.ASTQuotedExpression ? this.textOf(inner) : undefined
    if (!name) return undefined
    const text = this.tight(thing)
    if (name === "number") return `typeof ${text} === ${this.quoted("number")}`
    if (name === "text") return `typeof ${text} === ${this.quoted("string")}`
    if (this.project.isClass(name)) return `${text} instanceof ${name}`
    const kind = this.kindOf(thing)
    return kind && this.project.isClass(kind) ? `${text}.isOfType(${this.quoted(name)})` : undefined
  }

  /**
   * One of spell's `List`s doing it itself, as its own method:
   * `allPiles.filter((pile) => ...)`, `droppablePiles.firstItem`, `startPile.startingWith(this)` ...
   * - `undefined` for a helper it has no method for.
   * - Every position counts from 1, as spell's.
   * - Epic `output-targets` P14:  Q33, Q35, Q36;  in javascript too since P19.
   */
  listCall(name: string, list: P.ASTExpression, rest: P.ASTExpression[], isStatement: boolean): string | undefined {
    // `?.` off a list that may be nothing, e.g. `pile?.filter(...)` for `a random pile in ...`
    const self = `${this.tight(list)}${this.mayBeNothing(list) ? "?" : ""}`
    const [second, third] = rest
    const callback = () => this.callback(second)
    const found = (arg: P.ASTExpression) => this.foundArg(arg)
    switch (name) {
      case "filter":
      case "all":
      case "any":
      case "removeWhere":
        return second ? `${self}.${name}(${callback()})` : undefined
      case "map":
      case "forEach":
        return second ? `${self}.${isStatement ? "forEach" : name}(${callback()})` : undefined
      case "forEachSequential":
        return second ? `${self}.forEachSequential(${callback()})` : undefined
      case "getItemAt":
        if (rest.length !== 1) return undefined
        if (isNumber(second, 1)) return `${self}.firstItem`
        if (isNumber(second, -1)) return `${self}.lastItem`
        return `${self}.getItem(${this.bare(second!)})`
      case "randomItemOf":
        return `${self}.randomItem()`
      case "randomItemsOf":
        return second ? `${self}.randomItems(${this.bare(second)})` : undefined
      case "isEmpty":
        return `${self}.isEmpty`
      case "itemCountOf":
        return `${self}.length`
      case "largestOf":
        return `${self}.max`
      case "smallestOf":
        return `${self}.min`
      case "positionOf":
      case "remove":
        return rest.length === 1 ? `${self}.${name}(${found(second!)})` : undefined
      case "includes":
      case "includesAny":
      case "append":
      case "prepend":
      case "addBefore":
      case "addAfter":
        return `${self}.${name}(${rest.map(found).join(", ")})`
      case "reverse":
      case "randomize":
        return `${self}.${name}()`
      case "rangeStartingAt":
        if (rest.length !== 1) return undefined
        if (
          isCoreCall(unwrapped(second!)) &&
          (unwrapped(second!) as P.ASTScopedMethodInvocation).methodName === "positionOf"
        ) {
          const [ofList, item] = (unwrapped(second!) as P.ASTScopedMethodInvocation).args.args ?? []
          if (ofList && item && this.write(ofList) === this.write(list))
            return `${self}.startingWith(${this.bare(item)})`
        }
        return `${self}.startingFrom(${this.bare(second!)})`
      case "rangeBetween":
        return rest.length === 2 ? `${self}.between(${this.bare(second!)}, ${this.bare(third!)})` : undefined
      case "duplicateList": {
        if (!(second instanceof P.ASTTypeExpression)) return `${self}.clone()`
        // already that class, e.g. a `Discard_Pile` is a `Pile`:  a copy of its own class (Q36)
        const own = this.kindOf(list)
        const isAlready = !!own && this.project.isSubclassOf(own, second.name)
        return isAlready ? `${self}.clone()` : `${self}.cloneAs(${second.name})`
      }
      case "mergeLists":
        return second instanceof P.ASTTypeExpression ? `${self}.merged(${second.name})` : undefined
    }
    return undefined
  }

  /** `callback`, the function a list's own method takes -- see `listCall()`. */
  callback(callback: P.ASTExpression | undefined): string {
    return callback ? this.bare(callback) : ""
  }

  /** An item a list's own method takes, e.g. the card in `pile.remove(card)` -- see `listCall()`. */
  foundArg(arg: P.ASTExpression): string {
    return this.bare(arg)
  }

  /** `array.forEach((item) => ...)` for a loop over a plain array, when it takes the item only. */
  forEachOf(array: P.ASTExpression, callback: P.ASTExpression | undefined): string | undefined {
    const method = callback && unwrapped(callback)
    if (!(method instanceof P.ASTMethodDefinition) || (method.args?.length ?? 0) > 1) return undefined
    return `${this.tight(array)}.forEach(${this.bare(callback!)})`
  }

  /**
   * An event, through `@spell/core`'s own `trigger()` / `on()`, imported:
   * `trigger("card-click", { card: this })`, `on("card-click", (event) => {...})`.
   */
  eventCall(name: string, args: P.ASTExpression[]): string {
    this.coreImports.add(name)
    return `${name}(${args.map((arg) => this.bare(arg)).join(", ")})`
  }

  /**
   * A loop whose body waits, `await spellCore.forEachSequential(cards, async (card) => {...})`, as a plain loop:
   * `for (const card of cards) {...}`, so the waits happen in turn -- `undefined` if it isn't one.
   * - Over a spell `List` (iterable) or a plain array, when the body takes the item only.
   * - A bare `return` in the body ends that turn only:  `continue`.
   */
  loop(node: P.ASTExpression): string | undefined {
    const call = unwrapped(node)
    if (!isCoreCall(call) || (call as P.ASTScopedMethodInvocation).methodName !== "forEachSequential") return undefined
    const [collection, callback] = (call as P.ASTScopedMethodInvocation).args.args ?? []
    const method = callback && unwrapped(callback)
    if (!collection || !(method instanceof P.ASTMethodDefinition) || method.args?.length !== 1) return undefined
    if (!this.isList(collection) && this.kindOf(collection) !== "array") return undefined
    const [item] = method.args
    const previous = this.returnContinues
    this.returnContinues = true
    try {
      const body = this.inBlock(() => {
        this.noteParams(method)
        return this.write(method.body)
      })
      return `for (const ${this.variableName(item!)} of ${this.tight(collection)}) ${body}`
    } finally {
      this.returnContinues = previous
    }
  }

  ////////////////
  // ## What a value is
  ////////////////

  /**
   * What `node` is, as far as writing it goes -- or `undefined` if the writer can't tell:
   * `"text"`, `"number"`, `"choice"`, `"array"` (JavaScript's), `"list"` (spell's `List`),
   * or a class's name, e.g. `"Pile"`.
   * - From where it came from:  a literal, `new Pile(...)`, `this` in a class, what a variable was set to,
   *   a property's declared type, a `spellCore` helper's result -- else spell's own datatype for it.
   * - Spell's `list` datatype is left out:  it's a `List` or a plain array, and only where it came from tells.
   */
  kindOf(node: P.ASTExpression, depth = 0): string | undefined {
    if (depth > 8) return undefined
    const inner = unwrapped(node)
    if ((inner instanceof P.ASTStringLiteral && inner.quote) || inner instanceof P.ASTQuotedExpression) return "text"
    if (inner instanceof P.ASTTemplateString) return "text"
    if (inner instanceof P.ASTNumericLiteral) return "number"
    if (inner instanceof P.ASTBooleanLiteral) return "choice"
    if (
      inner instanceof P.ASTArrayLiteral ||
      inner instanceof P.ASTEnumeration ||
      inner instanceof P.ASTListExpression
    ) {
      return "array"
    }
    if (inner instanceof P.ASTSelfLiteral) return this.currentClass
    if (inner instanceof P.ASTNewInstanceExpression) return inner.type.name === "List" ? "list" : inner.type.name
    if (inner instanceof P.ASTInfixExpression) return this.infixKindOf(inner, depth)
    if (inner instanceof P.ASTNotExpression) return "choice"
    if (inner instanceof P.ASTVariableExpression && !(inner instanceof P.ASTSpellCoreExpression)) {
      if (inner.name === "this") return this.currentClass
      const value = this.localValue(inner.name) ?? this.project.moduleValues.get(inner.name)
      // a parameter (noted as itself):  its own datatype
      const isParameter = value instanceof P.ASTVariableExpression && value.name === inner.name
      const valueKind = value && !isParameter ? this.kindOf(value, depth + 1) : undefined
      const declared = isParameter ? value : inner
      return valueKind ?? kindFromDatatype(declared.datatype ?? declared.variable?.datatype)
    }
    if (inner instanceof P.ASTPropertyExpression) {
      if (inner.object instanceof P.ASTTypeExpression && this.isStaticList(inner)) return "array"
      const owner = this.kindOf(inner.object, depth + 1)
      const name = inner.property.value
      const property = this.project.propertyOf(owner, name)
      const kind = property
        ? this.propertyKind(property)
        : (this.undeclaredKind(owner, name) ?? this.getterKind(owner, name, depth))
      if (kind) return kind
    }
    if (inner instanceof P.ASTScopedMethodInvocation) {
      if (inner.thing instanceof P.ASTTypeExpression && inner.methodName === "ownerOf") return inner.thing.name
      if (inner.thing instanceof P.ASTSpellCoreExpression) {
        const kind = this.coreKindOf(inner, depth)
        if (kind) return kind
      }
    }
    return kindFromDatatype(inner.datatype ?? inner.match?.datatype)
  }

  /** Is `node` one of spell's `List`s, so it has its own methods?  See `kindOf()`. */
  isList(node: P.ASTExpression): boolean {
    const kind = this.kindOf(node)
    return kind === "list" || this.project.isListClass(kind)
  }

  /**
   * What property `node` holds, as `kindOf()` says it -- `undefined` for a list, or what can't be told.
   * - From its `check`:
   *   - `{ type: 'text' }` => `"text"`
   *   - a list of values hoisted as a typed constant => its type, e.g. `"Rank"` (`WriterProject.lists`)
   * - Else from its initializer:  the class it makes, its datatype.
   * - Else what the program gives it (`givenKind()`).
   */
  propertyKind(node: P.ASTReactiveProperty): string | undefined {
    for (const property of node.check?.properties ?? []) {
      if (!(property instanceof P.ASTObjectLiteralProperty) || !property.value) continue
      const key = property.property.value
      if (key === "type" && property.value instanceof P.ASTStringLiteral) return kindOfType(property.value.value)
      if (key === "oneOf") return this.project.listFor(property.value)?.type
    }
    const initializer = node.initializer && unwrapped(node.initializer)
    if (initializer instanceof P.ASTNewInstanceExpression) {
      // made when first read, `as a new task-list`:  the class it makes, e.g. `Task_List`;  a new list is a list
      if (initializer.type.name !== "List") return kindOfType(initializer.type.name)
      if (newListItemName(initializer)) return undefined
    }
    const initial = node.initializer?.datatype
    if (isKnownType(initial)) return kindOfType(initial)
    // the program never says:  what it gives it (Q54)
    return kindOfType(this.givenKind(node.typeName, node.property.value, node.initializer))
  }

  /**
   * What a value class `owner` gets for TypeScript only is (`WriterProject.undeclared`),
   * e.g. `droppable`:  a choice.
   */
  private undeclaredKind(owner: string | undefined, name: string): string | undefined {
    for (let type = owner; type; type = this.project.superTypes.get(type)) {
      const found = this.project.undeclared.get(type)?.some((it) => it.name === name && it.isValue)
      if (found) return this.givenKind(type, name)
    }
    return undefined
  }

  /**
   * What the program gives member `name` of class `typeName` (or of a class below it), when every value given is
   * alike, e.g. `"text"` for a pile's `name`, given `"stock"`, `"discards"` ... (Q54)
   * - `undefined` when they differ, when any can't be told, or when nothing is given.
   * - Given when one is made, `a new stock-pile with name = "stock"`, or set on one, `set the name of the pile to ...`
   *   -- see `WriterProject.givenValues`.
   *   Set on something the writer can't tell is one:  it doesn't count.
   * - And `initial`, a property's initial value, if it has one.
   * - A value read off the same member, `set the name of a to the name of b`, says nothing new:  it doesn't count.
   */
  givenKind(typeName: string, name: string, initial?: P.ASTExpression): string | undefined {
    const key = `${typeName}.${name}`
    if (this.givenKinds.has(key)) return this.givenKinds.get(key)
    // asked again while working it out:  a value read off it can't be told
    if (this.workingOut.has(key)) return undefined
    this.workingOut.add(key)
    const kinds = new Set<string | undefined>()
    try {
      if (initial) kinds.add(this.inPlace({ typeName, methods: [] }, () => this.kindOf(initial)))
      for (const given of this.project.givenValues.get(name) ?? []) {
        if (readsMember(given.value, name)) continue
        this.inPlace(given.where, () => {
          const owner = given.made ?? this.kindOf(given.object!)
          if (this.project.isSubclassOf(owner, typeName)) kinds.add(this.kindOf(given.value))
        })
      }
    } finally {
      this.workingOut.delete(key)
    }
    const kind = alike(kinds)
    // worked out while another was:  it may have read that one as unknown, so it's not kept
    if (!this.workingOut.size) this.givenKinds.set(key, kind)
    return kind
  }

  /**
   * What every class's definition of a method returns, when all alike,
   * e.g. `"choice"` for each pile's `can_play_$card` (Q54) -- `undefined` when they differ, or any can't be told.
   * - Spell's own datatype for a definition, if it knows it;  else what its `return`s give, `returnedKind()`.
   */
  definitionsKind(definitions: Array<{ type: string; method: P.ASTMethodDefinition }>): string | undefined {
    const kinds = definitions.map(
      ({ type, method }) =>
        kindFromDatatype(method.datatype) ??
        this.inPlace({ typeName: type, methods: [method] }, () => this.returnedKind(method))
    )
    return alike(new Set(kinds))
  }

  /**
   * What `method` returns, when every `return` in it gives a value, and all alike -- `undefined` otherwise.
   * - `return card === this.lastItem` and `return false` are choices.
   * - Not one that waits (it returns a promise),
   *   nor one that may end without a `return`:  see `returnedKinds()`.
   */
  private returnedKind(method: P.ASTMethodDefinition): string | undefined {
    const kinds = method.isAsync ? undefined : this.returnedKinds(method)
    return kinds && !kinds.has("nothing") ? alike(kinds) : undefined
  }

  /**
   * What each `return` in `method` gives, as `kindOf()` says it:  `"nothing"` for a bare `return`,
   * `undefined` for one that can't be told.
   * - `undefined` for a method that may end without a `return`:  its last statement isn't one.
   * - Its new variables are known by what they're set to;  a `return` in a function inside it isn't its own.
   */
  protected returnedKinds(method: P.ASTMethodDefinition): Set<string | undefined> | undefined {
    const statements = (method.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    if (!(statements.at(-1) instanceof P.ASTReturnStatement)) return undefined
    const returns: P.ASTReturnStatement[] = []
    const visit = (node: unknown) => {
      if (Array.isArray(node)) return node.forEach(visit)
      if (!(node instanceof P.ASTNode) || node instanceof P.ASTMethodDefinition) return
      if (node instanceof P.ASTReturnStatement) returns.push(node)
      if (node instanceof P.ASTAssignmentStatement) this.noteLocal(node)
      for (const [key, value] of Object.entries(node)) if (key !== "match") visit(value)
    }
    return this.inBlock(() => {
      visit(method.body.statements)
      return new Set(returns.map((it) => (it.value ? this.kindOf(it.value) : "nothing")))
    })
  }

  /**
   * `work()`, as if writing what's at `where`:
   * `this` is its class, and the parameters of the methods it's inside are known.
   * Nothing else written so far is.
   */
  protected inPlace<T>(where: ProgramPlace, work: () => T): T {
    const { currentClass, locals } = this
    this.currentClass = where.typeName
    this.locals = [new Map()]
    try {
      for (const method of where.methods) {
        this.locals.push(new Map())
        this.noteParams(method)
      }
      return work()
    } finally {
      this.currentClass = currentClass
      this.locals = locals
    }
  }

  /** `write()` with `this` being class `typeName`:  for a member written outside its class. */
  protected inClass<T>(typeName: string, write: () => T): T {
    const previous = this.currentClass
    this.currentClass = typeName
    try {
      return write()
    } finally {
      this.currentClass = previous
    }
  }

  /**
   * What getter `name` of class `owner` gives, from what it returns:  the kind ALL its returns share,
   * e.g. `"text"` for a card's `color` (`"red"` or `"black"`) -- `undefined` if they differ, or any can't tell.
   */
  private getterKind(owner: string | undefined, name: string, depth: number): string | undefined {
    const getter = this.project.getterOf(owner, name)
    if (!getter || depth > 4) return undefined
    const kinds = new Set<string | undefined>()
    forEachNode(getter.body, (node) => {
      if (node instanceof P.ASTReturnStatement && node.value) kinds.add(this.kindOf(node.value, depth + 1))
    })
    return alike(kinds)
  }

  /** What a `spellCore` helper's result is, from what it's given -- see `kindOf()`. */
  private coreKindOf(node: P.ASTScopedMethodInvocation, depth: number): string | undefined {
    const [first, second] = node.args.args ?? []
    switch (node.methodName) {
      case "getRange":
        return "array"
      case "getItemAt":
      case "randomItemOf": {
        // one of a list's items:  its class's item type, e.g. a `Card` of a `Pile`
        const list = first && this.kindOf(first, depth + 1)
        return this.project.isListClass(list) ? this.project.itemTypeOf(list) : undefined
      }
      case "filter":
      case "rangeStartingAt":
      case "rangeBetween":
      case "randomItemsOf":
        return first && this.kindOf(first, depth + 1)
      case "duplicateList":
      case "mergeLists":
        if (second instanceof P.ASTTypeExpression) return second.name
        return node.methodName === "duplicateList" && first ? this.kindOf(first, depth + 1) : undefined
      case "upperCase":
      case "lowerCase":
        return "text"
      case "itemCountOf":
      case "positionOf":
        return "number"
      case "isEmpty":
      case "includes":
      case "isOfType":
      case "isDefined":
        return "choice"
    }
    return undefined
  }

  /** What an operator's result is:  text for `+` with text, a number for sums, a choice for the rest. */
  private infixKindOf(node: P.ASTInfixExpression, depth: number): string | undefined {
    if (!["plus", "minus", "times", "divided by"].includes(node.operator)) return "choice"
    const lhs = this.kindOf(node.lhs, depth + 1)
    const rhs = this.kindOf(node.rhs, depth + 1)
    if (node.operator === "plus" && (lhs === "text" || rhs === "text")) return "text"
    return lhs === "number" && rhs === "number" ? "number" : undefined
  }

  /** Is `node`, `Card.Ranks`, a class's list of values written out?  A plain array. */
  private isStaticList(node: P.ASTPropertyExpression): boolean {
    const owner = (node.object as P.ASTTypeExpression).name
    return !!this.project.listFor(node) || this.project.staticLists.has(`${owner}.${node.property.value}`)
  }

  /**
   * `part`'s text, if it's text written out:  escaped for back ticks.
   * - `ESCAPED` if it has escapes of its own, which would change meaning.
   */
  textOf(part: P.ASTExpression): string | undefined {
    const inner = unwrapped(part)
    let text: string | undefined
    if (inner instanceof P.ASTStringLiteral && inner.quote) {
      if (inner.raw?.includes("\\")) return JSWriter.ESCAPED
      text = inner.value
    } else if (inner instanceof P.ASTQuotedExpression) {
      text = String(this.write(inner.expression))
    }
    return text?.replace(/`/g, "\\`").replace(/\$\{/g, "\\${")
  }

  /** `textOf()`'s answer for text with escapes of its own. */
  static ESCAPED = "\u0000escaped"

  ////////////////
  // ## Types & constants
  ////////////////

  ASTTypeExpression(node: P.ASTTypeExpression): string {
    return node.name
  }

  ASTPrototypeExpression(node: P.ASTPrototypeExpression): string {
    return `${this.write(node.type)}.prototype`
  }

  /** Its pre-baked `output` -- NOT re-derived from `name` -- a single-quoted word in double quotes. */
  ASTConstantExpression(node: P.ASTConstantExpression): string {
    return doubleQuoted(node.output)
  }

  ////////////////
  // ## Method definition
  ////////////////

  /**
   * `function name(args) {...}`, or as an object property `name(args) {...}` -- `async` when it awaits, `export`
   * when `exported`.
   * - Inline, as an arrow:  `(card) => card.play()`, or `name: (card) => ...` as an object property -- see `arrow()`.
   * - A bare `return` in it is its own, even in a loop's body.
   * - SIDE EFFECT:  `console.warn`s if `asProperty` is set but `methodName` is missing.
   */
  ASTMethodDefinition(node: P.ASTMethodDefinition): string {
    const error = node.error ? ` ${this.write(node.error)}` : ""
    if (node.inline)
      return node.asProperty ? `${this.methodNameOf(node)}: ${this.arrow(node)}${error}` : `${this.arrow(node)}${error}`
    const previous = this.returnContinues
    this.returnContinues = false
    try {
      return this.inBlock(() => `${this.methodDefinition(node)}${error}`)
    } finally {
      this.returnContinues = previous
    }
  }

  /** `ASTMethodDefinition()`'s work, for one that isn't inline. */
  private methodDefinition(node: P.ASTMethodDefinition): string {
    const async = node.isAsync ? "async " : ""
    const args = this.params(node)
    const body = this.write(node.body)
    const methodName = this.methodNameOf(node)
    if (node.asProperty) {
      if (!methodName) console.warn("MethodDef: property missing methodName", node)
      return `${async}${methodName}${args} ${body}`
    }
    const export_ = node.exported ? "export " : ""
    return `${export_}${async}function ${methodName}${args} ${body}`
  }

  /**
   * `method` as an arrow, tidy:  `(pile) => pile.droppable` -- its body an expression when it only returns one,
   * and trailing parameters it never uses left out, e.g. a handler's `event`.
   * - Its parameters are its body's own, so what they are is known (`kindOf()`).
   * - A bare `return` in it is its own, even in a loop's body.
   */
  arrow(method: P.ASTMethodDefinition): string {
    const previous = this.returnContinues
    this.returnContinues = false
    try {
      const statements = (method.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
      const payload = this.payloadType(method, statements)
      const body = this.inBlock(() => {
        this.noteParams(method)
        return this.arrowBody(method, statements)
      })
      const args = [...(method.args ?? [])]
      while (args.length && !new RegExp(`\\b${this.nameOf(args.at(-1)!.name)}\\b`).test(body)) args.pop()
      const params = args.map((arg, index) =>
        index === 0 && payload ? `${this.variableName(arg)}: ${payload}` : this.arrowParam(arg)
      )
      return `${method.isAsync ? "async " : ""}(${params.join(", ")}) => ${body}`
    } finally {
      this.returnContinues = previous
    }
  }

  /**
   * `arrow()`'s body, `statements` being `method`'s, less blank lines:
   * - one that only returns something:  that, `(pile) => pile.droppable`;  an object in parens, `() => ({ ... })`
   * - one that only sets something:  `() => (this.operator = "+")`
   * - one that only calls something:  `(card) => card.play()`
   * - anything else:  its block
   */
  protected arrowBody(method: P.ASTMethodDefinition, statements: P.ASTNode[]): string {
    const [only] = statements
    if (statements.length !== 1) return String(this.write(method.body))
    if (only instanceof P.ASTReturnStatement && only.value) {
      const value = unwrapped(only.value)
      return value instanceof P.ASTObjectLiteral ? `(${this.write(value)})` : this.bare(only.value)
    }
    if (only instanceof P.ASTAssignmentStatement && !only.isNewVariable) return `(${this.write(only)})`
    if (only instanceof P.ASTScopedMethodInvocation) {
      this.statements.add(only)
      return String(this.write(only))
    }
    return String(this.write(method.body))
  }

  /**
   * The type of an arrow's first parameter, when its body takes it apart first, e.g. an event's payload:
   * javascript has none -- see `TSWriter`.
   */
  protected payloadType(method: P.ASTMethodDefinition, statements: P.ASTNode[]): string | undefined {
    return undefined
  }

  /** An arrow's parameter, by our name:  `card`, or `pile = stock` with a default. */
  arrowParam(arg: P.ASTVariableExpression): string {
    const name = this.variableName(arg)
    return arg.default ? `${name} = ${this.bare(arg.default)}` : name
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
   * - `thisType`:  the class `this` is, when it's written outside it,
   *   e.g. `Card` for `Card.prototype.play = function () {...}`.
   *   Javascript has nothing to say about it;  a typed target does -- see `TSWriter`.
   */
  params(method: P.ASTMethodDefinition, thisType?: string): string {
    return this.args(method.args)
  }

  /** `method`'s name, by our name (`testCardSetup`), quoted when it isn't a legal identifier;  `""` if unset. */
  methodNameOf(method: P.ASTMethodDefinition): string {
    const { methodName } = method
    if (!methodName) return ""
    const name = this.nameOf(methodName)
    if (method.asProperty && !jsText.isLegalIdentifier(name)) return this.quoted(name)
    return name
  }

  /** SIDE EFFECT:  notes `method`'s parameters as the block's own, so what they are is known -- see `kindOf()`. */
  protected noteParams(method: P.ASTMethodDefinition) {
    for (const arg of method.args ?? []) this.locals.at(-1)!.set(arg.name, arg)
  }

  ////////////////
  // ## Object literals
  ////////////////

  ASTObjectLiteral(node: P.ASTObjectLiteral): string {
    const { wrap } = node
    const delimiter = wrap ? jsText.INDENTED_COMMA : jsText.SPACED_COMMA
    return jsText.Block({ wrap, space: !wrap, children: this.list(node.properties, delimiter) })
  }

  /**
   * `prop: value`, bare;  with no `value`, the variable of its name:
   * shorthand `{ card }` when we name the variable as the key, as we do unless it isn't a legal identifier.
   */
  ASTObjectLiteralProperty(node: P.ASTObjectLiteralProperty): string {
    const error = node.error ? ` ${this.write(node.error)}` : ""
    const prop = this.write(node.property)
    if (node.value) return `${prop}: ${this.bare(node.value)}${error}`
    const variable = this.nameOf(node.property.value)
    return variable === prop ? `${prop}${error}` : `${prop}: ${variable}${error}`
  }

  ////////////////
  // ## Statements
  ////////////////

  /**
   * Its statements, and those of the groups in it, in order, less those moved into a class (`WriterProject.moved`).
   * - One blank line at most between them, none at the start.
   * - What goes above a class goes above its docstring:  see `classPrefix()`.
   */
  ASTStatementGroup(node: P.ASTStatementGroup): string {
    const lines: string[] = []
    // where the doc comment right above the next statement starts, in `lines`
    let docStart = 0
    for (const statement of flattened(node)) {
      if (this.project.moved.has(statement)) continue
      // one blank line at most, none at the start:  where a member moved out, two would meet
      if (statement instanceof P.ASTBlankLine) {
        if (lines.length && lines.at(-1) !== "") lines.push("")
        docStart = lines.length
        continue
      }
      // a docstring, and a declaration's marker below it, go with the statement below them
      if (statement instanceof P.ASTDocComment || statement instanceof P.ASTPreservedComment) {
        lines.push(String(this.write(statement)))
        continue
      }
      if (statement instanceof P.ASTClassDeclaration) {
        const prefix = this.classPrefix(statement)
        if (prefix) lines.splice(docStart, 0, prefix)
      }
      this.statements.add(statement)
      lines.push(String(this.write(statement)))
      docStart = lines.length
    }
    return elseOnItsLine(lines.join(jsText.NEWLINE))
  }

  /** What goes above class `node`, above its docstring:  javascript has nothing -- see `TSWriter`. */
  classPrefix(node: P.ASTClassDeclaration): string {
    return ""
  }

  /**
   * `{ statements }`:  braces around a block, its blank lines left unindented, none at either end.
   * - On its line when it's one line and the tree says so (`wrap`), else one statement a line.
   * - Its new variables are its own, see `inBlock()`.
   */
  ASTStatementBlock(node: P.ASTStatementBlock): string {
    const statements = [...(node.statements ?? [])]
    while (statements[0] instanceof P.ASTBlankLine) statements.shift()
    while (statements.at(-1) instanceof P.ASTBlankLine) statements.pop()
    for (const statement of statements) this.statements.add(statement)
    const children = this.inBlock(() => elseOnItsLine(this.list(statements, jsText.NEWLINE)))
    if (!children) return jsText.EMPTY_BLOCK
    if (!node.wrap && !children.includes(jsText.NEWLINE)) return `{ ${children} }`
    return `{\n${jsText.indented(children)}\n}`
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

  /** `thing = value`;  a new variable, `const thing = value` -- see `declarator()`. */
  ASTAssignmentStatement(node: P.ASTAssignmentStatement): string {
    this.noteLocal(node)
    if (!node.isNewVariable) return `${this.setting(node.thing)} = ${this.bare(node.value)}`
    return `${this.declarator(node)} = ${this.bare(node.value)}`
  }

  /**
   * A new variable, as it's declared:  `const thing`, `let` if it's set again (`isReassigned()`);
   * `export`ed when `isExported()`.
   */
  declarator(node: P.ASTAssignmentStatement): string {
    const export_ = this.isExported(node) ? "export " : ""
    const { thing } = node
    const declarator = thing instanceof P.ASTVariableExpression && this.isReassigned([thing]) ? "let" : "const"
    return `${export_}${declarator} ${this.write(thing)}`
  }

  /** Is any of `variables` set again after it's declared?  Then it's `let`. */
  isReassigned(variables: P.ASTVariableExpression[]): boolean {
    return variables.some((variable) => this.project.reassigned.has(variable.name))
  }

  /**
   * `true` only for a new variable at `ProjectScope` / `FileScope` whose name isn't in `EXPORT_BLACKLIST`.
   * - By spell's own name:  `it_2` is never exported, whatever we call it.
   */
  isExported(node: P.ASTAssignmentStatement): boolean {
    if (!JSWriter.EXPORT_VARS || !node.isNewVariable) return false
    const { scope } = node.match
    if (!(scope instanceof P.ProjectScope || scope instanceof P.FileScope)) return false
    const name = node.thing instanceof P.ASTVariableExpression ? node.thing.name : String(this.write(node.thing))
    return !JSWriter.EXPORT_BLACKLIST.test(name)
  }

  /**
   * `{ variables } = thing`;  new ones, `const { variables } = thing`, `let` if any is set again
   * -- see `destructured()`.
   */
  ASTDestructuredAssignment(node: P.ASTDestructuredAssignment): string {
    const declarator = !node.isNewVariable ? "" : this.isReassigned(node.variables) ? "let " : "const "
    const variables = this.destructured(node).join(", ")
    return `${declarator}{ ${variables} }${this.destructuredType(node)} = ${this.bare(node.thing)}`
  }

  /** What `node` takes apart, each by its key, our name for it:  `{ card, startPile }`. */
  destructured(node: P.ASTDestructuredAssignment): string[] {
    return node.variables.map((variable) => {
      const written = this.write(variable)
      const key = this.nameOf(variable.name)
      return key === this.variableName(variable) ? written : `${key}: ${written}`
    })
  }

  /** `: type` after what `node` takes apart:  javascript has none -- see `TSWriter`. */
  destructuredType(node: P.ASTDestructuredAssignment): string {
    return ""
  }

  /** Bare `return` when it has no `value` (in a loop's body, `continue`), else `return value`. */
  ASTReturnStatement(node: P.ASTReturnStatement): string {
    if (!node.value) return this.returnContinues ? "continue" : "return"
    return `return ${this.bare(node.value)}`
  }

  ////////////////
  // ## Classes & instances
  ////////////////

  /** `export class Card extends Thing {...}`, with every member the project gives it -- see `withProjectMembers()`. */
  ASTClassDeclaration(node: P.ASTClassDeclaration): string {
    return this.classDeclaration(this.withProjectMembers(node))
  }

  /** `node` with the members the project wrote for it elsewhere -- see `WriterProject.movedMembers`. */
  protected withProjectMembers(node: P.ASTClassDeclaration): P.ASTClassDeclaration {
    const moved = this.project.movedMembers.get(node.type.name)
    if (!moved?.length) return node
    const separator = node.members?.length ? [new P.ASTBlankLine(node.match)] : []
    return node.withMembers([...separator, ...moved])
  }

  /**
   * `export class Card extends Thing {...}`, with `node`'s members as they are.
   * - NOTE: indents its members' non-blank lines only -- `jsText.Block()` would leave a tab on blank ones.
   */
  protected classDeclaration(node: P.ASTClassDeclaration): string {
    const { type, superType, members } = node
    const superDeclarator = superType ? `extends ${this.superTypeOf(node)} ` : ""
    const declaration = `export class ${type.name} ${superDeclarator}`
    if (!members?.length) return `${declaration}${jsText.EMPTY_BLOCK}`
    const body = this.inClass(type.name, () =>
      members.map((member) => (member instanceof P.ASTClassMember ? this.writeAsMember(member) : this.write(member)))
    )
      .join(jsText.NEWLINE)
      .split(jsText.NEWLINE)
      .map((line) => (line ? `${jsText.INDENT}${line}` : line))
      .join(jsText.NEWLINE)
    return `${declaration}${jsText.LEFT_CURLY}${jsText.NEWLINE}${body}${jsText.NEWLINE}${jsText.RIGHT_CURLY}`
  }

  /** What `node` extends, after `extends`, e.g. `Thing`.  A typed target may say more:  see `TSWriter`. */
  superTypeOf(node: P.ASTClassDeclaration): string {
    return node.superType!.name
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

  /** A member's name as its class declares it, by our name (`propertyName()`);  quoted when it isn't a legal identifier. */
  memberKey(property: P.ASTPropertyLiteral): string {
    const name = this.propertyName(property)
    return property.isLegalIdentifier ? name : this.quoted(name)
  }

  /** In its class's body, by our name:  `turnFaceUp(args) {...}` or `get isFaceUp() {...}`. */
  ASTPropertyDefinitionAsMember(node: P.ASTPropertyDefinition): string {
    const name = this.memberKey(node.property)
    if (node.get) return this.methodNamed(node.get, `get ${name}`)
    return this.methodNamed(node.method!, name)
  }

  /**
   * From outside its class, by our name:  `Type.prototype.name = function (args) {...}`, or for a getter
   * `Object.defineProperty(Type.prototype, "name", { get() {...}, configurable: true })`.
   */
  ASTPropertyDefinition(node: P.ASTPropertyDefinition): string {
    const name = this.propertyName(node.property)
    const prototype = this.write(node.prototypeExpression)
    return this.inClass(node.typeName, () => {
      if (node.get) {
        const descriptor = [`${this.methodNamed(node.get, "get", node.typeName)},`, "configurable: true"].join(
          jsText.NEWLINE
        )
        return `Object.defineProperty(${prototype}, ${this.quoted(name)}, ${jsText.Block({ wrap: true, children: descriptor })})`
      }
      return `${prototype}${propertyAccess(name)} = ${this.anonymousFunction(node.method!, node.typeName)}`
    })
  }

  /** In its class's body:  `static { this.declareProp(...) }` (if it declares anything), its getter and setter. */
  ASTReactivePropertyAsMember(node: P.ASTReactiveProperty): string {
    const name = this.memberKey(node.property)
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
   * `Object.defineProperty(Type.prototype, "name", { get() {...}, set(value) {...}, configurable: true })`.
   */
  ASTReactiveProperty(node: P.ASTReactiveProperty): string {
    return this.inClass(node.typeName, () => {
      const descriptor = [
        `get(${this.thisParam(node.typeName)})${this.valueType(node)} ${this.getterBody(node)},`,
        `set(${this.setterParams(node, node.typeName)}) ${this.setterBody(node)},`,
        "configurable: true"
      ]
      const block = jsText.Block({ wrap: true, children: descriptor.join(jsText.NEWLINE) })
      const define = `Object.defineProperty(${this.write(node.prototypeExpression)}, ${this.propertyKey(node)}, ${block})`
      const declare = this.declareCall(node, this.write(node.type))
      return declare ? [declare, define].join(jsText.NEWLINE) : define
    })
  }

  /** Property `node`'s name in quotes, as its getter, setter and class's schema say it:  `"isSetUp"`. */
  propertyKey(node: P.ASTReactiveProperty): string {
    return this.quoted(this.propertyName(node.property))
  }

  /** `{ return this.getProp("name") }`:  its default, if any, is in its class's schema -- see `declaration()`. */
  getterBody(node: P.ASTReactiveProperty): string {
    return `{ return this.getProp(${this.propertyKey(node)}) }`
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

  /** `{ this.setProp("name", value) }`:  its `check`, if any, is in its class's schema -- see `declaration()`. */
  setterBody(node: P.ASTReactiveProperty): string {
    return `{ this.setProp(${this.propertyKey(node)}, value) }`
  }

  /**
   * What its class's schema declares about `node`:  its `check`'s keys, plus `init` for its `initializer`.
   * - E.g. `{ type: "text" }`, `{ init: () => new List() }`.
   * - `undefined` if nothing:  then it's undeclared.
   */
  declaration(node: P.ASTReactiveProperty): string | undefined {
    const parts = (node.check?.properties ?? []).map((property) => this.write(property))
    if (node.initializer) parts.push(`init: () => ${this.bare(node.initializer)}`)
    return parts.length ? `{ ${parts.join(", ")} }` : undefined
  }

  /** `declareProp("name", {...})` with `declaration()`, called on `owner`, e.g. `this` in its class's body. */
  declareCall(node: P.ASTReactiveProperty, owner: string): string | undefined {
    const declaration = this.declaration(node)
    return declaration && `${owner}.declareProp(${this.propertyKey(node)}, ${declaration})`
  }

  /** In its class's body, by our name:  `static name(args) {...}`, or `static get name() {...}`. */
  ASTStaticMethodAsMember(node: P.ASTStaticMethod): string {
    const name = this.nameOf(node.name)
    return this.methodNamed(node.method, node.getter ? `static get ${name}` : `static ${name}`)
  }

  /**
   * From outside its class, by our name:  `Type.name = function (args) {...}`, or for a getter
   * `Object.defineProperty(Type, "name", { get() {...}, configurable: true })`.
   */
  ASTStaticMethod(node: P.ASTStaticMethod): string {
    const type = this.write(node.type)
    const name = this.nameOf(node.name)
    if (node.getter) {
      const descriptor = [`${this.methodNamed(node.method, "get")},`, "configurable: true"].join(jsText.NEWLINE)
      return `Object.defineProperty(${type}, ${this.quoted(name)}, ${jsText.Block({ wrap: true, children: descriptor })})`
    }
    return `${type}.${name} = ${this.anonymousFunction(node.method)}`
  }

  /** `static Name = value`, by our name. */
  ASTStaticDefinitionAsMember(node: P.ASTStaticDefinition): string {
    return `static ${this.nameOf(node.name)} = ${this.bare(node.value)}`
  }

  ASTStaticDefinition(node: P.ASTStaticDefinition): string {
    return `${this.write(node.type)}.${this.nameOf(node.name)} = ${this.bare(node.value)}`
  }

  /** Its `member`, patched onto its class from outside, wherever that class is written. */
  ASTPatchedMember(node: P.ASTPatchedMember): string {
    return this.write(node.member)
  }

  ////////////////
  // ## Conditionals
  ////////////////

  /** `if (condition) statement` -- braces only around more than one statement. */
  ASTIfStatement(node: P.ASTIfStatement): string {
    const written = `if (${this.condition(node.condition)}) ${this.body(node.statements)}`
    this.noteGuard(node)
    return written
  }

  ASTElseIfStatement(node: P.ASTElseIfStatement): string {
    return `else if (${this.condition(node.condition)}) ${this.body(node.statements)}`
  }

  ASTElseStatement(node: P.ASTElseStatement): string {
    return `else ${this.body(node.statements)}`
  }

  /** An `if`'s statements:  bare when it's one simple statement on one line, e.g. `return "?"`;  else a block. */
  body(block: P.ASTStatementBlock): string {
    const statements = (block.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    const [only] = statements
    if (statements.length === 1 && isSimpleStatement(only!)) {
      const text = String(this.write(only!))
      if (!text.includes(jsText.NEWLINE)) return text
    }
    return this.write(block)
  }

  /** `condition ? yes : no`:  in parentheses only where its reader puts it (an operand -- see `operand()`). */
  ASTTernaryExpression(node: P.ASTTernaryExpression): string {
    const { condition, trueValue, falseValue } = node
    const test = unwrapped(condition)
    const conditionText = test instanceof P.ASTTernaryExpression ? `(${this.write(test)})` : this.write(test)
    return `${conditionText} ? ${this.bare(trueValue)} : ${this.bare(falseValue)}`
  }

  ////////////////
  // ## JSX
  ////////////////

  /**
   * A call to Solid's own `h()`, as a person drawing without JSX writes it (epic `output-targets`, P20):
   * `h("span", { class: "suit" }, () => this.shortSuit)`.
   * - `h` is imported from `@spell/core`, in a module that draws:  see `module()`.
   * - Its props by the page's names, `class` first;  none, no `{}` -- see `jsxProps()`.
   * - Its children after them:  on its line when they fit, else one a line.
   * - A dotted tag, `<UI.Form>`, is a compile error (`P.ASTJSXElement.tagError()`):
   *   written where the element would be, as a broken `{...}` is.
   *   Spell's `jsxElement` rule reports it with the program's parse errors.
   */
  ASTJSXElement(node: P.ASTJSXElement): string {
    const tag = node.tagName
    const tagError = P.ASTJSXElement.tagError(tag)
    if (tagError) return `null ${this.write(new P.ASTParseError(node.match, { value: tagError }))}`
    this.coreImports.add("h")
    const props = this.jsxProps(node)
    const head = `h(${JSON.stringify(tag)}${props ? `, ${props}` : ""}`
    const children = node.childValues.map((child) => String(this.write(child)))
    if (!children.length) return `${head})`
    const inline = children.join(", ")
    const lastLine = head.slice(head.lastIndexOf("\n") + 1)
    const fits = !inline.includes("\n") && lastLine.length + inline.length < JSWriter.DRAWING_LINE
    // more than one child, with an element among them:  one a line, as JSX reads
    const isFlat = children.length === 1 || !node.childValues.some((child) => child instanceof P.ASTJSXElement)
    if (fits && isFlat) return `${head}, ${inline})`
    return `${head},\n${jsText.indented(children.join(",\n"))}\n)`
  }

  /**
   * `node`'s props, `{ class: "suit", onClick: (event) => {...} }`, by the page's names (`attributeName()`):
   * - `class` first, as the TypeScript writer writes it, so both targets draw the same (the core contract)
   * - on one line when it fits, else one a line
   * - `""` for none
   */
  protected jsxProps(node: P.ASTJSXElement): string {
    const props = (node.attrs ?? [])
      .map((attribute) => {
        const value = attribute.propValue
        const key = attributeName(node.tagName, attribute.name, value instanceof P.ASTJSXLiveValue)
        const error = attribute.error ? ` ${this.write(attribute.error)}` : ""
        return `${jsText.isLegalIdentifier(key) ? key : JSON.stringify(key)}: ${this.write(value)}${error}`
      })
      .sort((a, b) => Number(b.startsWith("class:")) - Number(a.startsWith("class:")))
    if (!props.length) return ""
    const inline = props.join(", ")
    if (!inline.includes("\n") && inline.length < JSWriter.DRAWING_LINE) return `{ ${inline} }`
    return `{\n${jsText.indented(props.join(",\n"))}\n}`
  }

  /** A function the drawing calls for the value:  `() => this.shortSuit`;  an object literal in parens. */
  ASTJSXLiveValue(node: P.ASTJSXLiveValue): string {
    const value = this.bare(node.expression)
    return unwrapped(node.expression) instanceof P.ASTObjectLiteral ? `() => (${value})` : `() => ${value}`
  }

  ////////////////
  // ## What may be nothing
  ////////////////

  /**
   * What each new variable of the blocks being written is set to, by spell's name -- see `mayBeNothing()`.
   * - One map per block, innermost last.
   * - The first holds a file's own top level.
   */
  protected locals: Array<Map<string, P.ASTExpression>> = [new Map()]

  /** `write()` inside a block of its own:  its new variables are forgotten when it's written. */
  protected inBlock<T>(write: () => T): T {
    this.locals.push(new Map())
    try {
      return write()
    } finally {
      this.locals.pop()
    }
  }

  /** SIDE EFFECT:  notes what `node`, a new variable, is set to -- in a block only:  a writer is shared by programs. */
  protected noteLocal(node: P.ASTAssignmentStatement) {
    if (!node.isNewVariable || !(node.thing instanceof P.ASTVariableExpression) || this.locals.length < 2) return
    this.locals.at(-1)!.set(node.thing.name, node.value)
  }

  /**
   * SIDE EFFECT:  notes that after a guard, the value it checks is THERE for the rest of the block:
   * read off it with `.`, not `?.` -- see `mayBeNothing()`.
   * - A guard:  `if (!spellCore.isDefined(endPile)) return false`.
   */
  protected noteGuard(node: P.ASTIfStatement) {
    const condition = unwrapped(node.condition)
    const [only] = (node.statements.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    if (!(condition instanceof P.ASTNotExpression) || !(only instanceof P.ASTReturnStatement)) return
    const checked = unwrapped(condition.expression)
    const isDefined =
      checked instanceof P.ASTScopedMethodInvocation &&
      checked.thing instanceof P.ASTSpellCoreExpression &&
      checked.methodName === "isDefined"
    const [value] = isDefined ? ((checked as P.ASTScopedMethodInvocation).args.args ?? []) : []
    const variable = value && unwrapped(value)
    if (variable instanceof P.ASTVariableExpression) this.locals.at(-1)!.set(variable.name, JSWriter.FOUND)
  }

  /** What a variable a guard checked is noted as:  there -- see `noteGuard()`. */
  static FOUND: P.ASTExpression = Object.freeze({}) as P.ASTExpression

  /** What new variable `name` was set to, in the blocks being written -- `undefined` if it wasn't. */
  localValue(name: string): P.ASTExpression | undefined {
    for (let index = this.locals.length - 1; index >= 0; index--) {
      const value = this.locals[index]!.get(name)
      if (value) return value
    }
    return undefined
  }

  /**
   * May `node` be nothing?
   * - Yes for:  an item read from a list (`spellCore.getItemAt(pile, -1)`), what's read off one,
   *   or a variable set to one.
   * - Reading off it is written `?.`, so spell reads off nothing as nothing and never throws
   *   (epic `output-targets`, Q38).
   */
  mayBeNothing(node: P.ASTExpression): boolean {
    const inner = unwrapped(node)
    if (inner instanceof P.ASTScopedMethodInvocation && inner.thing instanceof P.ASTSpellCoreExpression) {
      if (JSWriter.ITEM_READS.has(inner.methodName)) return true
      // a helper given what may be nothing gives nothing back, e.g. the cards of a random pile
      const [first] = inner.args.args ?? []
      return !!first && this.mayBeNothing(first)
    }
    // read off what may be nothing:  `?.`, so it may be nothing too
    if (inner instanceof P.ASTPropertyExpression) return this.mayBeNothing(inner.object)
    if (inner instanceof P.ASTScopedMethodInvocation) return this.mayBeNothing(inner.thing)
    if (!(inner instanceof P.ASTVariableExpression) || inner instanceof P.ASTSpellCoreExpression) return false
    const value = this.localValue(inner.name)
    if (!value || value === JSWriter.FOUND || value === node) return false
    return this.mayBeNothing(value)
  }

  /** The `spellCore` helpers that read ONE item of a list, which may be nothing:  see `mayBeNothing()`. */
  static ITEM_READS = new Set(["getItemAt", "randomItemOf"])

  /** What's being set, while it's written:  never read off with `?.`, which can't be set. */
  private settingNow: P.ASTNode | undefined

  /** `thing`, written as what an assignment sets:  `a.b = ...`, never `a?.b = ...`. */
  protected setting(thing: P.ASTExpression): string {
    const previous = this.settingNow
    this.settingNow = thing
    try {
      return String(this.write(thing))
    } finally {
      this.settingNow = previous
    }
  }

  /** Is `node` what an assignment sets, being written now? */
  protected isSetting(node: P.ASTNode): boolean {
    return this.settingNow === node
  }

  ////////////////
  // ## Settings
  ////////////////

  /**
   * Javascript for each infix operator's meaning (`P.ASTOperator`).
   * - `equals` is `==`, not `===`:  spell's `is` is forgiving, `"2"` is `2`
   *   -- unless both sides are alike, see `comparison()`.
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

  /** Longest `h()` call written on one line, its children included:  see `ASTJSXElement()`. */
  static DRAWING_LINE = 100

  /** Should we `export` top-level vars?  Global toggle -- flip to `false` to disable entirely. */
  static EXPORT_VARS = true
  /**
   * Names of top-level vars that we NEVER export:  `it`, e.g. Mocha's implicit `it`, and spell's numbered `it`s,
   * `it_2`, `it_3`... -- temporaries, not something another file should use.
   */
  static EXPORT_BLACKLIST = /^it(_\d+)?$/
}

/** `group`'s statements, and those of the groups in it, in order. */
function flattened(group: P.ASTStatementGroup): P.ASTNode[] {
  return (group.statements ?? []).flatMap((statement) =>
    statement instanceof P.ASTStatementGroup && !(statement instanceof P.ASTTryCatchBlock)
      ? flattened(statement)
      : [statement]
  )
}

/** `text` with each `else` after a block's `}` on the same line, `} else {`, as a person writes it. */
export function elseOnItsLine(text: string): string {
  return text.replace(/\}\n[ \t]*else\b/g, "} else")
}

/**
 * Is `node` one simple statement an `if` may hold without braces?  A return, a set, a call.
 * - Not a new variable:  `if (a) const b = 1` isn't javascript.
 */
function isSimpleStatement(node: P.ASTNode): boolean {
  if (node instanceof P.ASTAssignmentStatement) return !node.isNewVariable
  return node instanceof P.ASTReturnStatement || node instanceof P.ASTExpression
}

/**
 * How tightly each operator binds, javascript's levels:  higher binds tighter.
 * - SEE:  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence
 */
const PRECEDENCE: Record<P.ASTOperator, number> = {
  or: 3,
  and: 4,
  equals: 8,
  "not equals": 8,
  "exactly equals": 8,
  "not exactly equals": 8,
  "less than": 9,
  "greater than": 9,
  "at most": 9,
  "at least": 9,
  plus: 11,
  minus: 11,
  times: 12,
  "divided by": 12
}

/** `.name`, or `["name"]` if `name` isn't a legal identifier. */
function propertyAccess(name: string): string {
  return jsText.isLegalIdentifier(name) ? `.${name}` : `[${jsText.inQuotes(name, '"')}]`
}

/** `'text'` as `"text"`, when it has no `"` or `\` in it;  anything else as is. */
function doubleQuoted(text: string): string {
  return /^'[^'"\\]*'$/.test(text) ? `"${text.slice(1, -1)}"` : text
}
