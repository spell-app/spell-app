import { P } from "$/parser"
// Import directly to avoid circular import
import { JSWriter } from "./JSWriter"
import * as jsText from "./jsText"
import { TSProject, camelCaseOf, forEachNode, listNamedBy } from "./TSProject"

/****************
 * ### `TSWriter`
 * Writes a spell tree as TypeScript on Solid, as a person would write it by hand:  the `ts/solid` target's writer,
 * for `<Project>.compiled.tsx`.
 * - Real JSX, which Solid's compiler builds:  `<span class="suit">{this.shortSuit}</span>`.
 * - A drawing in Solid's shapes, where it can be:  a computed local becomes an accessor
 *   (`const className = () => ...`), an `if ... return` chain a `<Show>` / `<Switch>`, `draw cards in it` a `<For>`.
 *   Any other `to draw` re-runs whole, in its error net.
 * - Decorators:  `@prop({ oneOf: RANKS }) accessor rank!: Rank`, `@derived get state()`, `@thing`, and `@drawn` on
 *   `draw()` (each drawn thing in its own error net, the one `spellCore.drawThing()` gives compiled javascript).
 * - TypeScript's names:  `isASuit()`, `turnFaceUp()`, `allPiles`.  Properties keep spell's, e.g. `short_name` stays
 *   a getter's `shortName` but a property's `is_set_up` -- they're data a program prints.
 * - One class body per type:  members written anywhere in the project go inside their class.
 * - Tidy:  `const` unless set again, template text, no extra parentheses or braces, no unused parameters.
 * - Types where spell knows them:  parameters, properties, lists `as const`.  A type spell DOESN'T know is written
 *   `UNKNOWN`, `any /* spell: type unknown *\/`, never a bare `any`:  so every gap shows, and can be counted (epic
 *   `output-targets`, Q16).
 * - Spell's own built-ins stay `spellCore` calls:  `getItemOf(rank, 1)` counts from 1, so both targets print the same
 *   (the core contract, `contract.test.ts` in `$/cli`).
 * - Sees the whole project first (`forProject()`, a `TSProject`):  `TSWriter.instance` alone knows nothing of it,
 *   e.g. writing one node in a test.
 * - Checked by `tsc` against `@spell/core`'s types -- see `typescript.test.ts` in `$/spell`.
 ****************/
export class TSWriter extends JSWriter {
  /** The one `ts/solid` starts from:  it knows no project -- see `forProject()`. */
  static readonly instance = new TSWriter()

  /** What a type spell doesn't know is written as:  `any`, marked. */
  static UNKNOWN = "any /* spell: type unknown */"

  /**
   * TypeScript for spell's built-in datatypes (`P.BUILT_IN_TYPES`).
   * - `list`:  `any`, marked -- `@spell/core`'s `List` doesn't say what it holds, and spell sets properties on lists
   *   (`the name of the cards`), which a `List` can't have.
   */
  static TYPES: Record<P.Datatype, string> = {
    text: "string",
    character: "string",
    number: "number",
    integer: "number",
    choice: "boolean",
    date: "Date",
    nothing: "undefined",
    thing: "Thing",
    app: "App",
    list: "any /* spell: list */"
  }

  /** What we know of the project we're writing -- see `TSProject`. */
  readonly project: TSProject

  /**
   * While writing a drawing in Solid's shapes:  its locals that became accessors, by TypeScript name, e.g.
   * `className`:  each read is a call, `className()`.
   */
  private accessors = new Set<string>()
  /** While writing a drawing:  handlers it uses more than once, written once as a local, by their text => its name. */
  private sharedHandlers = new Map<string, string>()
  /** The class we're writing, e.g. `Tableau`:  names `<For>`'s item for `draw cards in it`. */
  private currentClass: string | undefined

  constructor(project = new TSProject()) {
    super()
    this.project = project
  }

  /** A writer for the project whose files' statements are `files`, parsed in `scope`:  see `TSProject`. */
  forProject(files: P.ASTNode[][], scope?: P.Scope): this {
    return new TSWriter(TSProject.of(files, scope)) as this
  }

  /**
   * The finished module:
   * - its `@spell/core` import names the decorators `code` uses too, and Solid's control flow (`<Show>`, `<For>` ...)
   *   is imported from `solid-js` above it
   * - what it imports from another project by TypeScript's names, e.g. `playFromTheStockPile`:  that project's
   *   `.tsx` exports them so.  A class keeps its name, e.g. `Stock_Pile`.
   * - a member it adds to a class it imports is declared in that project's module, `declare module "..." { interface
   *   Card {...} }`:  TypeScript refuses an `interface` merged with an import (`TS2440`)
   */
  module(code: string): string {
    const decorators = DECORATORS.filter((name) => new RegExp(`^\\s*@${name}\\b`, "m").test(code))
    const solid = SOLID_COMPONENTS.filter((name) => new RegExp(`<${name}[\\s>]`).test(code))
    code = code.replace(/^import \{ ([^}]*) \} from "@spell\/core"$/m, (_line, names: string) => {
      const all = [...names.split(/,\s*/), ...decorators]
      return `import { ${all.join(", ")} } from "@spell/core"`
    })
    // each class imported from another project, by its name here => [its module, its name there]
    const imported = new Map<string, [string, string]>()
    code = code.replace(/^import \{ ([^}]*) \} from "(@spell\/project\/[^"]*)"$/gm, (_line, names: string, from) => {
      const renamed = names.split(/,\s*/).map((name) => {
        const [there, here = there] = name.split(/\s+as\s+/) as [string, string?]
        if (/^[A-Z]/.test(there)) imported.set(here, [from, there])
        const tsName = /^[A-Z]/.test(there) ? there : camelCaseOf(there)
        return here === there ? tsName : `${tsName} as ${camelCaseOf(here)}`
      })
      return `import { ${renamed.join(", ")} } from "${from}"`
    })
    code = code.replace(/^export interface (\w+) \{ (.*) \}$/gm, (line, name: string, member: string) => {
      const found = imported.get(name)
      if (!found) return line
      const [from, there] = found
      return `declare module "${from}" {\n  interface ${there} { ${member} }\n}`
    })
    return solid.length ? `import { ${solid.join(", ")} } from "solid-js"\n${code}` : code
  }

  /**
   * TypeScript for spell's `datatype`, e.g. `string` for `text`, `Card` for `Card`;  `undefined` if spell doesn't
   * know it, or it has no TypeScript.
   * - A type spell's project declares is in Type_Case, e.g. `Card`:  as is.
   * - `list of cards`:  as `list`.
   */
  typeFor(datatype: P.Datatype | RegExpConstructor | undefined): string | undefined {
    if (typeof datatype !== "string" || !datatype) return undefined
    if (datatype.startsWith("list")) return TSWriter.TYPES.list
    if (Object.hasOwn(TSWriter.TYPES, datatype)) return TSWriter.TYPES[datatype]
    if (/^[A-Z][A-Za-z0-9_$]*$/.test(datatype)) return datatype
    return undefined
  }

  ////////////////
  // ## Names
  ////////////////

  /** A variable, by TypeScript's name:  `allPiles`;  a drawing's accessor read as a call, `className()`. */
  ASTVariableExpression(node: P.ASTVariableExpression): string {
    const name = this.variableName(node)
    if (node.default) return `${name} = ${this.bare(node.default)}`
    return this.accessors.has(name) ? `${name}()` : name
  }

  /** `node`'s name in TypeScript:  `start_pile` => `startPile`;  `spellCore` and `this` as they are. */
  variableName(node: P.ASTVariableExpression): string {
    return node.type === "global" ? node.name : camelCaseOf(node.name)
  }

  /** `object.property`:  a getter the project declares by TypeScript's name (`card.isFaceUp`), a property by spell's. */
  ASTPropertyExpression(node: P.ASTPropertyExpression): string {
    const name = node.property.value
    const property = this.project.getters.has(name) ? camelCaseOf(name) : name
    const object = this.memberObject(node.object)
    if (P.jsText.isLegalIdentifier(property)) return `${object}.${property}`
    return `${object}[${jsText.inQuotes(property, '"')}]`
  }

  /**
   * What a member is read from, ready to put a `.` after:
   * - a `spellCore` call's result gets `!`, as spell reads it whatever it is:  `spellCore.getItemOf(deck, -1)!.name`.
   *   Javascript does the same:  `!` changes no code, only the type
   * - anything that binds looser than `.` (an operator, a ternary) stays in its parentheses
   */
  memberObject(object: P.ASTExpression): string {
    const inner = unwrapped(object)
    const text = this.tight(inner)
    return isCoreCall(inner) ? `${text}!` : text
  }

  /** `node`, in parentheses unless it binds at least as tightly as `.` -- see `isTight()`. */
  tight(node: P.ASTExpression): string {
    const inner = unwrapped(node)
    return isTight(inner) ? String(this.write(inner)) : `(${this.write(inner)})`
  }

  /** `name(args)`, by TypeScript's name:  `playFromTheStockPile()`. */
  ASTMethodInvocation(node: P.ASTMethodInvocation): string {
    return `${camelCaseOf(node.methodName)}${this.write(node.args)}`
  }

  /**
   * `thing.name(args)`, by TypeScript's name:  `card.moveToPile(endPile)`.
   * - Drawing:  `spellCore.drawThing(card)` => `card.draw()` (in its own error net:  `@drawn`), and
   *   `spellCore.drawItems(pile)` => `<For>` drawing each.
   */
  ASTScopedMethodInvocation(node: P.ASTScopedMethodInvocation): string {
    if (node.thing instanceof P.ASTSpellCoreExpression) {
      const [list] = node.args.args ?? []
      if (node.methodName === "drawThing") return this.drawThing(list)
      if (node.methodName === "drawItems" && list) return this.drawItems(list)
    }
    return `${this.memberObject(node.thing)}.${camelCaseOf(node.methodName)}${this.write(node.args)}`
  }

  /** `thing.draw()` -- `?.draw()` when it may be nothing, e.g. the last card of a pile. */
  drawThing(thing: P.ASTExpression | undefined): string {
    if (!thing) return "undefined"
    const text = this.tight(thing)
    return isCoreCall(unwrapped(thing)) ? `${text}?.draw()` : `${text}.draw()`
  }

  /**
   * `<For each={pile.items}>{(card) => card.draw()}</For>`:  each item in its own error net, kept by identity.
   * - Its item is named for the list's item type when it's ours, e.g. `card` in a `Tableau`, else `item`.
   */
  drawItems(list: P.ASTExpression): string {
    const self = unwrapped(list)
    const isSelf = self instanceof P.ASTSelfLiteral || (self instanceof P.ASTVariableExpression && self.name === "this")
    const itemType = isSelf && this.project.itemTypeOf(this.currentClass)
    const item = itemType ? itemType.charAt(0).toLowerCase() + itemType.slice(1) : "item"
    return `<For each={${this.memberObject(list)}.items}>{(${item}) => ${item}.draw()}</For>`
  }

  /** `name(args) {...}` by TypeScript's name;  an inline function as an arrow -- see `arrow()`. */
  ASTMethodDefinition(node: P.ASTMethodDefinition): string {
    if (!node.inline) return super.ASTMethodDefinition(node)
    const error = node.error ? ` ${this.write(node.error)}` : ""
    if (node.asProperty) return `${this.methodNameOf(node)}: ${this.arrow(node)}${error}`
    return `${this.arrow(node)}${error}`
  }

  /** TypeScript's name for `method`:  `testCardSetup`. */
  methodNameOf(method: P.ASTMethodDefinition): string {
    const { methodName } = method
    if (!methodName) return ""
    const name = camelCaseOf(methodName)
    if (method.asProperty && !jsText.isLegalIdentifier(name)) return jsText.inQuotes(name, '"')
    return name
  }

  /**
   * `method` as an arrow, tidy:  `(pile) => pile.droppable == true` -- its body an expression when it only returns
   * one, and trailing parameters it never uses left out, e.g. a handler's `event`.
   */
  arrow(method: P.ASTMethodDefinition): string {
    const async = method.isAsync ? "async " : ""
    const statements = (method.body.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
    const [only] = statements
    let body: string
    if (statements.length === 1 && only instanceof P.ASTReturnStatement && only.value) {
      const value = unwrapped(only.value)
      body = value instanceof P.ASTObjectLiteral ? `(${this.write(value)})` : this.bare(only.value)
    } else {
      body = this.write(method.body)
    }
    const args = [...(method.args ?? [])]
    while (args.length && !new RegExp(`\\b${camelCaseOf(args.at(-1)!.name)}\\b`).test(body)) args.pop()
    return `${async}(${args.map((arg) => this.param(arg)).join(", ")}) => ${body}`
  }

  /**
   * `key: value`, bare;  shorthand `{ name }` when its key is TypeScript's name for the variable it reads, else
   * `{ name: tsName }`.
   */
  ASTObjectLiteralProperty(node: P.ASTObjectLiteralProperty): string {
    const error = node.error ? ` ${this.write(node.error)}` : ""
    if (node.value) return `${this.write(node.property)}: ${this.bare(node.value)}${error}`
    const key = node.property.value
    const variable = camelCaseOf(key)
    return variable === key ? `${key}${error}` : `${key}: ${variable}${error}`
  }

  /** `const { card } = event`:  a key whose variable TypeScript names differently is renamed, `{ start_pile: startPile }`. */
  ASTDestructuredAssignment(node: P.ASTDestructuredAssignment): string {
    const variables = node.variables.map((variable) => {
      const written = this.write(variable)
      return variable.name === this.variableName(variable) ? written : `${variable.name}: ${written}`
    })
    const declarator = !node.isNewVariable ? "" : this.isReassigned(node.variables) ? "let " : "const "
    return `${declarator}{ ${variables.join(", ")} } = ${this.bare(node.thing)}`
  }

  ////////////////
  // ## Literals
  ////////////////

  /** A text value in double quotes, unless it's single-quoted with a `"` in it. */
  ASTStringLiteral(node: P.ASTStringLiteral): string {
    const text = super.ASTStringLiteral(node)
    return doubleQuoted(text)
  }

  /** A quoted word, e.g. an enumeration's value:  `"clubs"`. */
  ASTQuotedExpression(node: P.ASTQuotedExpression): string {
    return doubleQuoted(super.ASTQuotedExpression(node))
  }

  /** Its pre-baked `output`, a single-quoted word in double quotes. */
  ASTConstantExpression(node: P.ASTConstantExpression): string {
    return doubleQuoted(super.ASTConstantExpression(node))
  }

  ////////////////
  // ## Operators
  ////////////////

  /**
   * `lhs op rhs`, without parentheses JavaScript doesn't need (`a + b + c`, `x == 1 && y`) -- and `+` building text as
   * template text:  `` `${this.rank}-of-${this.suit}` ``.
   */
  ASTInfixExpression(node: P.ASTInfixExpression): string {
    const template = node.operator === "plus" && this.templateText(node)
    if (template) return template
    const operator = JSWriter.OPERATORS[node.operator]
    return `${this.operand(node.lhs, node.operator, "lhs")} ${operator} ${this.operand(node.rhs, node.operator, "rhs")}`
  }

  /**
   * `operand` of an `operator`, in parentheses only where JavaScript needs them, or where a reader would want them:
   * `&&` inside `||`, a comparison in a comparison.
   */
  operand(operand: P.ASTExpression, operator: P.ASTOperator, side: "lhs" | "rhs"): string {
    const inner = unwrapped(operand)
    if (inner instanceof P.ASTTernaryExpression) return `(${this.write(inner)})`
    // `!x` and `await x` bind tighter than any operator
    if (inner instanceof P.ASTNotExpression || inner instanceof P.ASTAwaitExpression) return String(this.write(inner))
    if (!(inner instanceof P.ASTInfixExpression)) return this.tight(inner)
    const mine = PRECEDENCE[inner.operator]
    const theirs = PRECEDENCE[operator]
    const isLogical = (level: number) => level <= PRECEDENCE.and
    const needsParens =
      mine < theirs ||
      (mine === theirs && side === "rhs") ||
      (mine === theirs && mine >= PRECEDENCE.equals && mine <= PRECEDENCE["less than"]) ||
      (isLogical(mine) && isLogical(theirs) && mine !== theirs)
    return needsParens ? `(${this.write(inner)})` : this.write(inner)
  }

  /**
   * `node`, a chain of `+` with text in it, as template text:  `"Score: " + this.score` => `` `Score: ${this.score}` ``.
   * - `undefined` when it isn't:  no text in the chain, or text only after two values (`a + b + "!"` adds `a` and `b`
   *   first), or text with escapes in it.
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
    if (body.some((text) => text === ESCAPED)) return undefined
    return `\`${body.join("")}\``
  }

  /**
   * `part`'s text for template text, if it's text written out:  escaped for back ticks;  `ESCAPED` if it has escapes
   * of its own, which would change meaning.
   */
  private textOf(part: P.ASTExpression): string | undefined {
    const inner = unwrapped(part)
    let text: string | undefined
    if (inner instanceof P.ASTStringLiteral && inner.quote) {
      if (inner.raw?.includes("\\")) return ESCAPED
      text = inner.value
    } else if (inner instanceof P.ASTQuotedExpression) {
      text = String(this.write(inner.expression))
    }
    return text?.replace(/`/g, "\\`").replace(/\$\{/g, "\\${")
  }

  /** `!x`, or `!(a && b)` when what it negates is an operator. */
  ASTNotExpression(node: P.ASTNotExpression): string {
    return `!${this.tight(node.expression)}`
  }

  /** `condition ? yes : no`:  in parentheses only where its reader puts it (an operand -- see `operand()`). */
  ASTTernaryExpression(node: P.ASTTernaryExpression): string {
    const { condition, trueValue, falseValue } = node
    const test = unwrapped(condition)
    const conditionText = test instanceof P.ASTTernaryExpression ? `(${this.write(test)})` : this.write(test)
    return `${conditionText} ? ${this.bare(trueValue)} : ${this.bare(falseValue)}`
  }

  /** `node` written without the parentheses around it:  where nothing binds tighter, e.g. after `return`. */
  bare(node: P.ASTExpression): string {
    return String(this.write(unwrapped(node)))
  }

  ////////////////
  // ## Statements
  ////////////////

  /**
   * Its statements, and those of the groups in it, in order, less those moved into a class.
   * - A class's constants and types go above its docstring:  see `classPrefix()`.
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
      lines.push(String(this.write(statement)))
      docStart = lines.length
    }
    return lines.join(jsText.NEWLINE)
  }

  /** `{ statements }`:  braces around a block, its blank lines left unindented, none at either end. */
  ASTStatementBlock(node: P.ASTStatementBlock): string {
    const statements = [...(node.statements ?? [])]
    while (statements[0] instanceof P.ASTBlankLine) statements.shift()
    while (statements.at(-1) instanceof P.ASTBlankLine) statements.pop()
    const children = this.list(statements, jsText.NEWLINE)
    if (!children) return jsText.EMPTY_BLOCK
    if (!node.wrap) return `{ ${children} }`
    return `{\n${indented(children)}\n}`
  }

  /**
   * A new variable:  `const` unless it's set again (`let`), typed when spell knows its datatype,
   * e.g. `let count: number = 0`.
   * - Set from a `spellCore` call, which returns `unknown`:  `const pile = spellCore.randomItemOf(piles) as Pile`, or
   *   `UNKNOWN` when spell doesn't know either.
   * - Otherwise unknown:  as javascript, TypeScript works it out, e.g. `const game = new Game()`.
   */
  ASTAssignmentStatement(node: P.ASTAssignmentStatement): string {
    const { thing, value } = node
    if (!node.isNewVariable) return `${this.write(thing)} = ${this.bare(value)}`
    const variable = thing instanceof P.ASTVariableExpression ? thing.variable : undefined
    // `[]`, which TypeScript can't type by itself, is a list
    const isList = value instanceof P.ASTArrayLiteral || value instanceof P.ASTListExpression
    const type =
      this.typeFor(thing.datatype ?? variable?.datatype ?? value.datatype) ??
      (isList ? this.typeFor("list") : undefined)
    const fromCore = isCoreCall(unwrapped(value))
    const export_ = this.isExported(node) ? "export " : ""
    const declarator = thing instanceof P.ASTVariableExpression && this.isReassigned([thing]) ? "let" : "const"
    const declared = `${export_}${declarator} ${this.write(thing)}`
    if (!type && !fromCore) return `${declared} = ${this.bare(value)}`
    if (!type) return `${declared}: ${TSWriter.UNKNOWN} = ${this.bare(value)}`
    if (fromCore) return `${declared} = ${this.bare(value)} as ${type}`
    return `${declared}: ${type} = ${this.bare(value)}`
  }

  /** Is any of `variables` set again after it's declared?  Then it's `let`. */
  isReassigned(variables: P.ASTVariableExpression[]): boolean {
    return variables.some((variable) => this.project.reassigned.has(variable.name))
  }

  /** As javascript's, by spell's own name:  `it_2` is never exported, whatever TypeScript calls it. */
  isExported(node: P.ASTAssignmentStatement): boolean {
    if (!JSWriter.EXPORT_VARS || !node.isNewVariable) return false
    const { scope } = node.match
    if (!(scope instanceof P.ProjectScope || scope instanceof P.FileScope)) return false
    const name = node.thing instanceof P.ASTVariableExpression ? node.thing.name : String(this.write(node.thing))
    return !JSWriter.EXPORT_BLACKLIST.test(name)
  }

  /** `return value`, bare -- JSX on several lines in parentheses. */
  ASTReturnStatement(node: P.ASTReturnStatement): string {
    if (!node.value) return "return"
    return `return ${this.parenthesized(this.bare(node.value))}`
  }

  /** `if (condition) statement` -- braces only around more than one statement. */
  ASTIfStatement(node: P.ASTIfStatement): string {
    return `if (${this.bare(node.condition)}) ${this.body(node.statements)}`
  }

  ASTElseIfStatement(node: P.ASTElseIfStatement): string {
    return `else if (${this.bare(node.condition)}) ${this.body(node.statements)}`
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

  ////////////////
  // ## Parameters
  ////////////////

  /** Each typed:  `(card: Card, message: string = "Really?")`;  `this` first when written outside its class. */
  params(method: P.ASTMethodDefinition, thisType?: string): string {
    const params = (method.args ?? []).map((arg) => this.param(arg))
    if (thisType) params.unshift(this.thisParam(thisType))
    return `(${params.join(", ")})`
  }

  /** `name: type`, or `name: type = default`. */
  param(arg: P.ASTVariableExpression): string {
    const type = this.typeFor(arg.datatype ?? arg.variable?.datatype ?? arg.default?.datatype) ?? TSWriter.UNKNOWN
    const declared = `${this.variableName(arg)}: ${type}`
    return arg.default ? `${declared} = ${this.bare(arg.default)}` : declared
  }

  thisParam(thisType?: string): string {
    return thisType ? `this: ${thisType}` : ""
  }

  ////////////////
  // ## Classes
  ////////////////

  /**
   * `export class Card extends Thing {...}`, with every member the project gives it (see `TSProject.movedMembers`),
   * and `@thing` above it when it has a `create()`.
   * - Its lists of values go above it:  see `classPrefix()`.  The statement group holding it puts them above its
   *   docstring, too.
   */
  ASTClassDeclaration(node: P.ASTClassDeclaration): string {
    const declaration = this.withProjectMembers(node)
    const hoisted = new Set(this.listsOf(declaration).map((list) => list.definition))
    // the docstring right above a hoisted list went with it
    const docstrings = new Set([...hoisted].map((definition) => docstringAbove(definition, declaration.members ?? [])))
    const members = (declaration.members ?? []).filter((member) => !docstrings.has(member as P.ASTDocComment))
    const { match, type, superType } = declaration
    const previousClass = this.currentClass
    this.currentClass = type.name
    try {
      const body = super.ASTClassDeclaration(new P.ASTClassDeclaration(match, { type, superType, members }))
      return hasCreate(declaration) ? `@thing\n${body}` : body
    } finally {
      this.currentClass = previousClass
    }
  }

  /**
   * What goes above class `node`:  its lists of values as typed constants, with their comments, and a type for one
   * value of each, e.g. `const RANKS = [...] as const` and `export type Rank = (typeof RANKS)[number]`.
   * - `""` if it has none.
   */
  classPrefix(node: P.ASTClassDeclaration): string {
    const declaration = this.withProjectMembers(node)
    const lists = this.listsOf(declaration)
    if (!lists.length) return ""
    const members = declaration.members ?? []
    const constants = lists.map((list) => {
      const docstring = docstringAbove(list.definition, members)
      const constant = `const ${list.constant} = ${this.write(list.definition.value)} as const`
      return docstring ? `${this.write(docstring)}\n${constant}` : constant
    })
    const types = lists
      .filter((list) => list.type)
      .map((list) => `export type ${list.type} = (typeof ${list.constant})[number]`)
    return [...constants, "", ...types, ""].join("\n")
  }

  /** `node` with the members the project wrote for it elsewhere -- see `TSProject.movedMembers`. */
  private withProjectMembers(node: P.ASTClassDeclaration): P.ASTClassDeclaration {
    const moved = this.project.movedMembers.get(node.type.name)
    if (!moved?.length) return node
    const separator = node.members?.length ? [new P.ASTBlankLine(node.match)] : []
    return node.withMembers([...separator, ...moved])
  }

  /** The hoisted lists `node` declares, in order -- see `TSProject.lists`. */
  private listsOf(node: P.ASTClassDeclaration) {
    const lists = [...this.project.lists.values()]
    return (node.members ?? []).flatMap((member) => lists.filter((list) => list.definition === member))
  }

  /** `static Ranks = RANKS` for a hoisted list;  else as javascript's. */
  ASTStaticDefinitionAsMember(node: P.ASTStaticDefinition): string {
    const list = [...this.project.lists.values()].find((it) => it.definition === node)
    return list ? `static ${node.name} = ${list.constant}` : super.ASTStaticDefinitionAsMember(node)
  }

  /** `static name(args) {...}`, by TypeScript's name. */
  ASTStaticMethodAsMember(node: P.ASTStaticMethod): string {
    const name = camelCaseOf(node.name)
    return this.methodNamed(node.method, node.getter ? `static get ${name}` : `static ${name}`)
  }

  ////////////////
  // ## Members
  ////////////////

  /**
   * In its class's body, by TypeScript's name:  `get isFaceUp() {...}`, `turnFaceUp() {...}`.
   * - `@derived` on a getter that loops over a list, e.g. a pile's `state`:  remembered until what it read changes.
   * - `@drawn draw() {...}`:  see `drawMethod()`.
   */
  ASTPropertyDefinitionAsMember(node: P.ASTPropertyDefinition): string {
    const name = camelCaseOf(node.property.value)
    if (node.get) {
      const getter = this.methodNamed(node.get, `get ${name}`)
      return loopsOverAList(node.get) ? `@derived\n${getter}` : getter
    }
    if (name === "draw") return `@drawn\n${this.drawMethod(node.method!)}`
    return this.methodNamed(node.method!, name)
  }

  /**
   * In its class's body:  `@prop(info) accessor rank!: Rank` -- the same runtime shape as javascript's
   * `declareProp()` and accessor pair.  Its name is spell's:  a property is data a program prints.
   */
  ASTReactivePropertyAsMember(node: P.ASTReactiveProperty): string {
    const info = this.propInfo(node)
    return `@prop(${info ?? ""}) accessor ${this.write(node.property)}!: ${this.propertyType(node) ?? TSWriter.UNKNOWN}`
  }

  /** What `@prop()` declares:  `node`'s `check`, `init` for its `initializer`, a hoisted list by its constant. */
  propInfo(node: P.ASTReactiveProperty): string | undefined {
    const parts = (node.check?.properties ?? []).map((property) => {
      const isOneOf = property instanceof P.ASTObjectLiteralProperty && property.property.value === "oneOf"
      const list = isOneOf && this.project.listFor(property.value)
      if (!list) return String(this.write(property))
      // read when set stays so:  its class is further down
      const isLazy = (property as P.ASTObjectLiteralProperty).value instanceof P.ASTMethodDefinition
      return `oneOf: ${isLazy ? "() => " : ""}${list.constant}`
    })
    if (node.initializer) parts.push(`init: () => ${this.bare(node.initializer)}`)
    return parts.length ? `{ ${parts.join(", ")} }` : undefined
  }

  /**
   * What `node` holds, in TypeScript, from its `check`:  `{ type: 'text' }` => `string`;  a hoisted list's values
   * => `Rank`;  `{ oneOf: Deck.Suits }` => `(typeof Deck.Suits)[number]`, as for a list read when set,
   * `{ oneOf: () => Deck.Suits }`.  Else its initializer's datatype.  `undefined` if unknown.
   */
  propertyType(node: P.ASTReactiveProperty): string | undefined {
    for (const property of node.check?.properties ?? []) {
      if (!(property instanceof P.ASTObjectLiteralProperty) || !property.value) continue
      const key = property.property.value
      if (key === "type" && property.value instanceof P.ASTStringLiteral) return this.typeFor(property.value.value)
      if (key !== "oneOf") continue
      const list = this.project.listFor(property.value)
      if (list) return list.type ?? `(typeof ${list.constant})[number]`
      return `(typeof ${this.write(listNamedBy(property.value))})[number]`
    }
    return this.typeFor(node.initializer?.datatype)
  }

  /** `getProp()` returns `unknown`:  `as` its type, when known. */
  getterBody(node: P.ASTReactiveProperty): string {
    const type = this.propertyType(node)
    if (!type) return super.getterBody(node)
    return `{ return this.getProp(${jsText.quoted(node.property.value)}) as ${type} }`
  }

  /** `: type`, e.g. `: string`, `: (typeof Card.Suits)[number]`. */
  valueType(node: P.ASTReactiveProperty): string {
    return `: ${this.propertyType(node) ?? TSWriter.UNKNOWN}`
  }

  setterParams(node: P.ASTReactiveProperty, thisType?: string): string {
    const value = `value: ${this.propertyType(node) ?? TSWriter.UNKNOWN}`
    return thisType ? `${this.thisParam(thisType)}, ${value}` : value
  }

  /**
   * From outside its class (one another project declares):  first an `interface` merged with its class, so
   * TypeScript knows it's there.
   */
  ASTReactiveProperty(node: P.ASTReactiveProperty): string {
    const member = `${this.write(node.property)}: ${this.propertyType(node) ?? TSWriter.UNKNOWN}`
    return [this.mergedInterface(node.typeName, member), super.ASTReactiveProperty(node)].join(jsText.NEWLINE)
  }

  /**
   * From outside its class (one another project declares), by TypeScript's name:  first an `interface` merged with
   * its class -- a getter `readonly` -- then `Card.prototype.play = function (...) {...}`, or for a getter
   * `Object.defineProperty(Card.prototype, "isFaceUp", {...})`.
   */
  ASTPropertyDefinition(node: P.ASTPropertyDefinition): string {
    const name = camelCaseOf(node.property.value)
    const member = node.get
      ? `readonly ${name}: ${this.typeFor(node.get.datatype) ?? TSWriter.UNKNOWN}`
      : `${name}${this.signatureParams(node.method!)}: ${this.typeFor(node.method!.datatype) ?? TSWriter.UNKNOWN}`
    const prototype = this.write(node.prototypeExpression)
    let patch: string
    if (node.get) {
      const descriptor = [`${this.methodNamed(node.get, "get", node.typeName)},`, "configurable: true"].join("\n")
      patch = `Object.defineProperty(${prototype}, ${jsText.inQuotes(name, '"')}, ${jsText.Block({ wrap: true, children: descriptor })})`
    } else {
      patch = `${prototype}.${name} = ${this.anonymousFunction(node.method!, node.typeName)}`
    }
    return [this.mergedInterface(node.typeName, member), patch].join(jsText.NEWLINE)
  }

  /** From outside its class:  `Suit.color = function (...) {...}`, by TypeScript's name. */
  ASTStaticMethod(node: P.ASTStaticMethod): string {
    if (node.getter) return super.ASTStaticMethod(node)
    return `${this.write(node.type)}.${camelCaseOf(node.name)} = ${this.anonymousFunction(node.method)}`
  }

  /**
   * `export interface Card { member }`:  merges with `export class Card`, wherever it is in the file.
   * - A class from ANOTHER project, imported, can't merge this way (`TS2440`):  `module()` makes it a `declare module`
   *   block in that project's module.
   */
  mergedInterface(typeName: string, member: string): string {
    return `export interface ${typeName} { ${member} }`
  }

  /** Parameters for a signature, which can't have defaults:  `(card: Card, message?: string)`. */
  signatureParams(method: P.ASTMethodDefinition): string {
    const params = (method.args ?? []).map((arg) => {
      const type = this.typeFor(arg.datatype ?? arg.variable?.datatype ?? arg.default?.datatype) ?? TSWriter.UNKNOWN
      return `${this.variableName(arg)}${arg.default ? "?" : ""}: ${type}`
    })
    return `(${params.join(", ")})`
  }

  ////////////////
  // ## Lists
  ////////////////

  /**
   * A list says what it holds:  `a deck is a list of cards` => `class Deck extends List<Card>`, from its
   * `static instanceType = Card`.  So `spellCore.getItemOf(deck, 1)` is a `Card | undefined`.
   */
  superTypeOf(node: P.ASTClassDeclaration): string {
    const name = super.superTypeOf(node)
    if (name !== "List") return name
    const itemType = node.members?.find(
      (member): member is P.ASTStaticDefinition =>
        member instanceof P.ASTStaticDefinition && member.name === "instanceType"
    )?.value
    return itemType instanceof P.ASTTypeExpression ? `List<${itemType.name}>` : name
  }

  /** A new list says what it holds too:  `a new list of piles` => `new List<Pile>({ instanceType: "Pile" })`. */
  ASTNewInstanceExpression(node: P.ASTNewInstanceExpression): string {
    const text = super.ASTNewInstanceExpression(node)
    if (node.type.name !== "List") return text
    const itemType = node.props?.properties.find(
      (property): property is P.ASTObjectLiteralProperty =>
        property instanceof P.ASTObjectLiteralProperty && property.property.value === "instanceType"
    )?.value
    if (!(itemType instanceof P.ASTStringLiteral) || !itemType.quote) return text
    return text.replace(/^new List/, `new List<${itemType.value}>`)
  }

  ////////////////
  // ## Drawing
  ////////////////

  /**
   * `draw() {...}`, in Solid's shapes when it can be -- see `drawingShape()`:
   * ```
   * const className = () => `Card face-${this.direction} ...`
   * return (
   *   <Show when={this.isFaceDown} fallback={<div class={className() + this.color}>...</div>}>
   *     <div class={className()}>...</div>
   *   </Show>
   * )
   * ```
   * - Any other shape, as written:  it re-runs whole, in its error net (`@drawn`), when something it read changes.
   * - A handler it uses more than once is written once, as a local:  `const click = () => ...`.
   */
  drawMethod(method: P.ASTMethodDefinition): string {
    const shape = drawingShape(method.body.statements ?? [], this.project)
    if (!shape) return this.methodNamed(method, "draw")
    const previous = { accessors: this.accessors, sharedHandlers: this.sharedHandlers }
    this.accessors = new Set(
      shape.locals.filter(({ value }) => !isFixedValue(value)).map(({ thing }) => this.variableName(thing))
    )
    this.sharedHandlers = new Map()
    try {
      const lines = shape.comments.map((comment) => String(this.write(comment)))
      for (const { thing, value } of shape.locals) {
        const name = this.variableName(thing)
        lines.push(`const ${name} = ${this.accessors.has(name) ? "() => " : ""}${this.bare(value)}`)
      }
      lines.push(...this.shareHandlers(shape, new Set(lines.map((line) => line.split(" ")[1]!))))
      lines.push(`return ${this.parenthesized(this.drawingOf(shape))}`)
      return `draw() ${jsText.Block({ wrap: true, children: lines.join(jsText.NEWLINE) })}`
    } finally {
      this.accessors = previous.accessors
      this.sharedHandlers = previous.sharedHandlers
    }
  }

  /** `shape`'s drawing:  its last `return` alone, else in a `<Show>` (one `if`) or a `<Switch>` (more). */
  private drawingOf(shape: DrawingShape): string {
    const final = this.jsxOf(shape.final)
    if (!shape.branches.length) return final
    const fallback = final.includes("\n") ? `fallback={\n${indented(final)}\n}` : `fallback={${final}}`
    if (shape.branches.length === 1) {
      const [{ condition, value }] = shape.branches as [DrawingBranch]
      const open = `<Show\n${indented(`when={${this.bare(condition)}}\n${fallback}`)}\n>`
      return `${open}\n${indented(this.jsxOf(value))}\n</Show>`
    }
    const matches = shape.branches.map(
      ({ condition, value }) => `<Match when={${this.bare(condition)}}>\n${indented(this.jsxOf(value))}\n</Match>`
    )
    return `<Switch\n${indented(fallback)}\n>\n${indented(matches.join("\n"))}\n</Switch>`
  }

  /** `value` as JSX:  an element as is, anything else as `{value}`. */
  private jsxOf(value: P.ASTExpression): string {
    const inner = unwrapped(value)
    return inner instanceof P.ASTJSXElement ? this.write(inner) : `{${this.bare(inner)}}`
  }

  /** `text` alone, or in parentheses and indented when it's JSX on several lines, e.g. after `return`. */
  private parenthesized(text: string): string {
    return text.startsWith("<") && text.includes("\n") ? `(\n${indented(text)}\n)` : text
  }

  /**
   * SIDE EFFECT:  notes each handler `shape`'s elements use more than once in `sharedHandlers`, under a name not in
   * `taken`, e.g. `click` for an `onClick`.  Returns their lines, `const click = () => ...`.
   */
  private shareHandlers(shape: DrawingShape, taken: Set<string>): string[] {
    const handlers = new Map<string, { name: string; count: number }>()
    const values = [...shape.branches.map((branch) => branch.value), shape.final]
    forEachNode(values, (node) => {
      if (!(node instanceof P.ASTJSXAttribute) || !(node.value instanceof P.ASTMethodDefinition)) return
      const text = this.arrow(node.value)
      const found = handlers.get(text)
      if (found) found.count++
      else handlers.set(text, { name: node.name.replace(/^on/, ""), count: 1 })
    })
    const lines: string[] = []
    for (const [text, { name: event, count }] of handlers) {
      if (count < 2) continue
      let name = event.charAt(0).toLowerCase() + event.slice(1)
      for (let number = 2; taken.has(name); number++) name = `${event.toLowerCase()}${number}`
      taken.add(name)
      this.sharedHandlers.set(text, name)
      lines.push(`const ${name} = ${text}`)
    }
    return lines
  }

  ////////////////
  // ## JSX
  ////////////////

  /**
   * Real JSX, which Solid's compiler builds:  `<div class="board">...</div>`, one child a line;  short text
   * inline, `<span class="suit">{this.shortSuit}</span>`.
   */
  ASTJSXElement(node: P.ASTJSXElement): string {
    const tag = node.tagName
    // `class` first:  the order the page gets them in from javascript's `spellCore.element()`, so both targets
    // draw the same (the core contract)
    const attributes = (node.attrs ?? [])
      .flatMap((attribute) => this.jsxAttribute(tag, attribute) ?? [])
      .sort((a, b) => Number(b.startsWith("class=")) - Number(a.startsWith("class=")))
    const open = `<${tag}${attributes.map((attribute) => ` ${attribute}`).join("")}`
    const children = (node.children ?? []).filter((child) => !(child instanceof P.ASTJSXEndTag))
    const written = children.map((child) => this.jsxChild(child)).filter(Boolean)
    if (!written.length) return `${open} />`
    const inline = written.join("")
    const isShort = !written.some((child) => child.startsWith("<")) && !inline.includes("\n")
    if (isShort && open.length + inline.length < JSX_LINE) return `${open}>${inline}</${tag}>`
    return `${open}>\n${indented(written.join("\n"))}\n</${tag}>`
  }

  /** A value in JSX:  just the expression -- Solid's compiler makes it live. */
  ASTJSXLiveValue(node: P.ASTJSXLiveValue): string {
    return this.bare(node.expression)
  }

  /**
   * One child of an element:  text as is (`{"..."}` when it has `{`, `<` ...), an expression in braces, an element.
   * - `""` for nothing to write.
   */
  jsxChild(child: P.ASTExpression): string {
    if (child instanceof P.ASTJSXText) {
      if (!child.value) return ""
      return /[{}<>]/.test(child.value) ? `{${JSON.stringify(child.value)}}` : child.value
    }
    if (child instanceof P.ASTJSXElement) return this.write(child)
    const expression = child instanceof P.ASTJSXExpression ? child.output : child
    if (!expression) return ""
    // JSX already, e.g. `<For>` for `draw cards in it`:  no braces
    const text = this.bare(expression)
    return text.startsWith("<") ? text : `{${text}}`
  }

  /**
   * `name="text"` or `name={value}`, by the page's names, as `spellCore.element()` gives compiled javascript:
   * - `className` => `class`, `htmlFor` => `for`, a camelCase attribute of an HTML tag lowercased (`colSpan` =>
   *   `colspan`)
   * - on a tag with a dash (`<ui-form>`), a value that can change, or an object, is a PROPERTY:  `prop:value={...}`
   * - a handler as an arrow, `onClick={() => autoPlay()}`;  one the drawing shares by its name, `onClick={click}`
   * - no value:  `{true}`
   * - `undefined` for an attribute that didn't parse:  its error is in the program's parse errors
   */
  jsxAttribute(tag: string, attribute: P.ASTJSXAttribute): string | undefined {
    const { name, value } = attribute
    if (!value && attribute.error) return undefined
    let key = name
    if (name === "className") key = "class"
    else if (name === "htmlFor") key = "for"
    else if (tag.includes("-")) {
      const isProperty = !name.startsWith("on") && !name.includes("-") && !ATTRIBUTES_ONLY.has(name)
      if (isProperty && value && !isFixedValue(value)) key = `prop:${name}`
    } else if (!name.startsWith("on") && /[a-z][A-Z]/.test(name)) key = name.toLowerCase()

    if (!value) return `${key}={true}`
    if (value instanceof P.ASTMethodDefinition) {
      const handler = this.arrow(value)
      return `${key}={${this.sharedHandlers.get(handler) ?? handler}}`
    }
    const inner = unwrapped(value)
    if (inner instanceof P.ASTStringLiteral && inner.quote && !/["\\]/.test(inner.value))
      return `${key}="${inner.value}"`
    return `${key}={${this.bare(value)}}`
  }
}

////////////////
// ## Drawing shapes
////////////////

/**
 * A `to draw` Solid can follow in pieces:  locals, then `if (...) return <...>` lines, then one `return <...>`.
 * See `TSWriter.drawMethod()`.
 */
type DrawingShape = {
  /** Comments above its locals. */
  comments: P.ASTComment[]
  /** Its new variables, each set once, before any `if`:  accessors, unless their value never changes. */
  locals: Array<{ thing: P.ASTVariableExpression; value: P.ASTExpression }>
  /** Each `if (condition) return value`, in order. */
  branches: DrawingBranch[]
  /** What the last `return` draws. */
  final: P.ASTExpression
}

/** `if (condition) return value`, in a drawing. */
type DrawingBranch = { condition: P.ASTExpression; value: P.ASTExpression }

/**
 * `statements`, a `to draw`'s body, as a `DrawingShape` -- `undefined` if they're any other shape, e.g. a loop, an
 * `else`, a local set twice, or nothing after the last `return`.
 */
function drawingShape(statements: P.ASTNode[], project: TSProject): DrawingShape | undefined {
  const shape: Partial<DrawingShape> & Pick<DrawingShape, "comments" | "locals" | "branches"> = {
    comments: [],
    locals: [],
    branches: []
  }
  const items = statements.filter((it) => !(it instanceof P.ASTBlankLine))
  for (const [index, statement] of items.entries()) {
    if (shape.final) return undefined
    if (statement instanceof P.ASTComment) {
      if (shape.locals.length || shape.branches.length) return undefined
      shape.comments.push(statement)
    } else if (statement instanceof P.ASTAssignmentStatement && statement.isNewVariable) {
      const { thing, value } = statement
      if (shape.branches.length || !(thing instanceof P.ASTVariableExpression)) return undefined
      if (project.reassigned.has(thing.name)) return undefined
      shape.locals.push({ thing, value })
    } else if (statement instanceof P.ASTIfStatement) {
      const next = items[index + 1]
      if (next instanceof P.ASTElseIfStatement || next instanceof P.ASTElseStatement) return undefined
      const body = (statement.statements.statements ?? []).filter((it) => !(it instanceof P.ASTBlankLine))
      const [only] = body
      if (body.length !== 1 || !(only instanceof P.ASTReturnStatement) || !only.value) return undefined
      shape.branches.push({ condition: statement.condition, value: only.value })
    } else if (statement instanceof P.ASTReturnStatement && statement.value) {
      shape.final = statement.value
    } else {
      return undefined
    }
  }
  if (!shape.final) return undefined
  if (!shape.locals.length && !shape.branches.length) return undefined
  return shape as DrawingShape
}

////////////////
// ## Helpers
////////////////

/** The decorators compiled TypeScript may use, all from `@spell/core`. */
const DECORATORS = ["prop", "state", "derived", "thing", "drawn"]

/** Solid's control flow a drawing may use, from `solid-js`. */
const SOLID_COMPONENTS = ["Show", "For", "Switch", "Match"]

/** What stays an attribute on a tag with a dash, whatever its value -- as `spellCore.element()`'s. */
const ATTRIBUTES_ONLY = new Set(["class", "className", "style", "id", "slot", "part"])

/** Longest element written on one line, open tag and children. */
const JSX_LINE = 100

/** `TSWriter.textOf()`'s answer for text with escapes of its own. */
const ESCAPED = "\u0000escaped"

/**
 * How tightly each operator binds, JavaScript's levels:  higher binds tighter.
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

/** `node` without the parentheses around it. */
function unwrapped(node: P.ASTExpression): P.ASTExpression {
  while (node instanceof P.ASTParenthesizedExpression) node = node.expression
  return node
}

/** Does `node` bind at least as tightly as `.`, so nothing needs parentheses around it?  A name, a read, a call ... */
function isTight(node: P.ASTExpression): boolean {
  return !(
    node instanceof P.ASTInfixExpression ||
    node instanceof P.ASTTernaryExpression ||
    node instanceof P.ASTNotExpression ||
    node instanceof P.ASTAwaitExpression ||
    node instanceof P.ASTMethodDefinition ||
    node instanceof P.ASTNewInstanceExpression ||
    node instanceof P.ASTJSXElement
  )
}

/** Is `node` a `spellCore` method's result, maybe in parens?  `@spell/core` types those `unknown`. */
function isCoreCall(node: P.ASTNode): boolean {
  while (node instanceof P.ASTParenthesizedExpression) node = node.expression
  return node instanceof P.ASTScopedMethodInvocation && node.thing instanceof P.ASTSpellCoreExpression
}

/** Can't value `node` change?  A literal (not a list, which holds expressions), an element, a function. */
function isFixedValue(node: P.ASTExpression): boolean {
  const inner = unwrapped(node)
  if (inner instanceof P.ASTArrayLiteral || inner instanceof P.ASTEnumeration) return false
  return inner instanceof P.ASTLiteral || inner instanceof P.ASTMethodDefinition || inner instanceof P.ASTJSXElement
}

/** Is `node` one simple statement an `if` may hold without braces?  A return, a set, a call. */
function isSimpleStatement(node: P.ASTNode): boolean {
  return (
    node instanceof P.ASTReturnStatement || node instanceof P.ASTAssignmentStatement || node instanceof P.ASTExpression
  )
}

/** Does `declaration` have a `create()`?  Then `@thing` runs it, after its fields. */
function hasCreate(declaration: P.ASTClassDeclaration): boolean {
  return (declaration.members ?? []).some(
    (member) => member instanceof P.ASTPropertyDefinition && member.method && member.property.value === "create"
  )
}

/** Does getter `method` loop over a list, e.g. `for each card in pile`?  Worth remembering:  `@derived`. */
function loopsOverAList(method: P.ASTMethodDefinition): boolean {
  let loops = false
  forEachNode(method.body, (node) => {
    if (node instanceof P.ASTMethodDefinition && node.inline) loops = true
  })
  return loops
}

/**
 * The docstring right above `member` in `members` -- past a declaration's marker (`/*! SPELL: DECLARES ... *\/`) --
 * if it has one.
 */
function docstringAbove(member: P.ASTNode, members: P.ASTNode[]): P.ASTDocComment | undefined {
  let index = members.indexOf(member) - 1
  while (members[index] instanceof P.ASTPreservedComment) index--
  const above = members[index]
  return above instanceof P.ASTDocComment ? above : undefined
}

/** `group`'s statements, and those of the groups in it, in order. */
function flattened(group: P.ASTStatementGroup): P.ASTNode[] {
  return (group.statements ?? []).flatMap((statement) =>
    statement instanceof P.ASTStatementGroup && !(statement instanceof P.ASTTryCatchBlock)
      ? flattened(statement)
      : [statement]
  )
}

/** `text` with every non-blank line indented once. */
function indented(text: string): string {
  return text
    .split("\n")
    .map((line) => (line ? `${jsText.INDENT}${line}` : line))
    .join("\n")
}

/** `'text'` as `"text"`, when it has no `"` or `\` in it;  anything else as is. */
function doubleQuoted(text: string): string {
  return /^'[^'"\\]*'$/.test(text) ? `"${text.slice(1, -1)}"` : text
}
